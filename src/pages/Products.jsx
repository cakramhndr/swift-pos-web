import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  Settings2,
  Upload,
  X,
  FileDown,
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Headset",
  "Mouse",
  "Keyboard",
  "Gamepad",
  "Microphone",
  "Monitor",
  "Other",
];

// ─── SKU Generator ───────────────────────────────────────────────────────
function generateSku(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  const prefix = words
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const last = words[words.length - 1];
  const suffix = last.slice(0, 3).toUpperCase();

  const rand = String(Math.floor(Math.random() * 900) + 100);

  return `${prefix}${prefix ? "-" : ""}${suffix}-${rand}`;
}

// ─── CSV Parser ──────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [], errors: [] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);

    // Validate required fields
    if (!row.name || row.name.length < 2) {
      errors.push({
        row: i,
        field: "name",
        message: "Missing or invalid name",
      });
    }
    if (row.stock === "" || isNaN(Number(row.stock)) || Number(row.stock) < 0) {
      errors.push({ row: i, field: "stock", message: "Invalid stock" });
    }
    if (
      row.unitPrice === "" ||
      isNaN(Number(row.unitPrice)) ||
      Number(row.unitPrice) <= 0
    ) {
      errors.push({
        row: i,
        field: "unitPrice",
        message: "Invalid unit price",
      });
    }
  }

  return { headers, rows, errors };
}

function generateCSVTemplate() {
  const headers = "name,sku,category,stock,unitCost,unitPrice,minStock";
  const sample = "Logitech G Pro X,LGC-GPX,Headset,15,1500000,1899000,5";
  return `${headers}\n${sample}`;
}

export default function Products() {
  const DEFAULT_PRODUCTS = [
    {
      id: 1,
      sku: "LGC-GPX",
      name: "Logitech G Pro X",
      category: "Headset",
      stock: 24,
      minStock: 5,
      unitCost: 1500000,
      unitPrice: 1899000,
      status: "In Stock",
    },
    {
      id: 2,
      sku: "RZR-VM",
      name: "Razer Viper Mini",
      category: "Mouse",
      stock: 5,
      minStock: 5,
      unitCost: 450000,
      unitPrice: 599000,
      status: "Low Stock",
    },
  ];

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.length > 0 &&
          parsed[0].price !== undefined &&
          parsed[0].unitPrice === undefined
        ) {
          localStorage.removeItem("products");
          localStorage.removeItem("transactions");
          return DEFAULT_PRODUCTS;
        }
        return parsed;
      }
    } catch {
      localStorage.removeItem("products");
      localStorage.removeItem("transactions");
    }

    return DEFAULT_PRODUCTS;
  });

  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "",
    stock: "",
    minStock: 5,
    unitCost: "",
    unitPrice: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [manageCatOpen, setManageCatOpen] = useState(false);
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_categories");
      return saved ? JSON.parse(saved) : [...DEFAULT_CATEGORIES];
    } catch {
      return [...DEFAULT_CATEGORIES];
    }
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  const navigate = useNavigate();

  // ─── Bulk Actions State ────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // ─── Import CSV State ──────────────────────────────────────────────────
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");

  // ─── Persist categories ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("swiftpos_categories", JSON.stringify(categories));
  }, [categories]);

  const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID");
  };

  const parsePriceInput = (value) => {
    return value.replace(/[^0-9]/g, "");
  };

  // ─── Image upload handler ────────────────────────────────────────────
  const handleImageUpload = (file, isEdit = false) => {
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload PNG, JPG, or WebP image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      if (isEdit) {
        setEditingProduct({ ...editingProduct, image: base64String });
      } else {
        setNewProduct({ ...newProduct, image: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── Stock status helpers ─────────────────────────────────────────────
  const stockStatus = (stock, minStock = 5) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    if (stock <= minStock)
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-700 border-green-200",
    };
  };

  // ─── Validation ──────────────────────────────────────────────────────
  const validateAddForm = () => {
    const newErrors = {};

    if (!newProduct.name || newProduct.name.trim().length < 2) {
      newErrors.name = "This field is required";
    }
    if (
      newProduct.stock === "" ||
      Number(newProduct.stock) < 0 ||
      isNaN(Number(newProduct.stock))
    ) {
      newErrors.stock = "This field is required";
    }
    if (
      newProduct.unitPrice === "" ||
      Number(newProduct.unitPrice) <= 0 ||
      isNaN(Number(newProduct.unitPrice))
    ) {
      newErrors.unitPrice = "This field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editingProduct.name || editingProduct.name.trim().length < 2) {
      newErrors.name = "This field is required";
    }
    if (
      editingProduct.stock === "" ||
      editingProduct.stock === undefined ||
      Number(editingProduct.stock) < 0 ||
      isNaN(Number(editingProduct.stock))
    ) {
      newErrors.stock = "This field is required";
    }
    if (
      editingProduct.unitPrice === "" ||
      editingProduct.unitPrice === undefined ||
      Number(editingProduct.unitPrice) <= 0 ||
      isNaN(Number(editingProduct.unitPrice))
    ) {
      newErrors.unitPrice = "This field is required";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = () => {
    let sku = newProduct.sku;
    if (!sku.trim() && newProduct.name.trim()) {
      sku = generateSku(newProduct.name);
    }

    const payload = { ...newProduct, sku };

    if (!validateAddForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const minStock = Number(payload.minStock) || 5;
    const stock = Number(payload.stock);
    setProducts([
      ...products,
      {
        id: Date.now(),
        sku: payload.sku,
        name: payload.name,
        category: payload.category,
        stock: stock,
        minStock: minStock,
        unitCost: Number(payload.unitCost),
        unitPrice: Number(payload.unitPrice),
        image: payload.image,
        status: stockStatus(stock, minStock).label,
      },
    ]);

    setNewProduct({
      sku: "",
      name: "",
      category: "",
      stock: "",
      minStock: 5,
      unitCost: "",
      unitPrice: "",
      image: null,
    });
    setErrors({});

    toast.success("Product added successfully ✅");
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setDeleteConfirm(null);
    toast.success("Product deleted successfully 🗑️");
  };

  const handleUpdateProduct = () => {
    if (!validateEditForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setProducts(
      products.map((product) =>
        product.id === editingProduct.id ? editingProduct : product,
      ),
    );
    setEditingProduct(null);
    setEditDialogOpen(false);
    setEditErrors({});
    toast.success("Product updated successfully ✏️");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" ||
      product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "products") {
        try {
          const updated = JSON.parse(e.newValue);
          if (updated) {
            setProducts(updated);
          }
        } catch {
          console.error("Failed to parse products from storage");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ─── Category Management ─────────────────────────────────────────────
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }
    if (categories.includes(trimmed)) {
      toast.error("Category already exists");
      return;
    }
    setCategories([...categories, trimmed]);
    setNewCategoryName("");
    toast.success(`Category "${trimmed}" added ✅`);
  };

  const handleDeleteCategory = (catToDelete) => {
    const usedBy = products.find((p) => p.category === catToDelete);
    if (usedBy) {
      toast.error(
        `Cannot delete "${catToDelete}" – it is used by product "${usedBy.name}"`,
      );
      return;
    }
    setCategories(categories.filter((c) => c !== catToDelete));
    toast.success(`Category "${catToDelete}" deleted 🗑️`);
  };

  // ─── Bulk Actions ────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    const updatedProducts = products.filter(
      (product) => !selectedIds.has(product.id),
    );
    const count = selectedIds.size;
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    toast.success(`${count} products deleted successfully 🗑️`);
  };

  // ─── Import CSV ──────────────────────────────────────────────────────
  const handleCSVFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { rows, errors } = parseCSV(text);
      setCsvRows(rows);
      setCsvErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    const errorRowSet = new Set(csvErrors.map((e) => e.row));
    const validRows = csvRows.filter((_, idx) => !errorRowSet.has(idx + 1));
    const invalidCount = csvErrors.length;

    const newProducts = validRows.map((row) => {
      const minStock = Number(row.minStock) || 5;
      const stock = Number(row.stock);
      return {
        id: Date.now() + Math.random(),
        sku: row.sku || generateSku(row.name),
        name: row.name,
        category: row.category || "Other",
        stock: stock,
        minStock: minStock,
        unitCost: Number(row.unitCost) || 0,
        unitPrice: Number(row.unitPrice),
        image: null,
        status: stockStatus(stock, minStock).label,
      };
    });

    const updated = [...products, ...newProducts];
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));

    setImportModalOpen(false);
    setCsvRows([]);
    setCsvErrors([]);
    setCsvFileName("");

    if (invalidCount > 0) {
      toast.success(
        `Successfully imported ${validRows.length} products, skipped ${invalidCount} invalid rows`,
      );
    } else {
      toast.success(`Successfully imported ${validRows.length} products ✅`);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Products
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Manage your product inventory
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Import CSV Button */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-purple-200 px-5 py-2.5 text-sm font-medium text-purple-600 transition-all hover:bg-purple-50 hover:shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </DialogTrigger>

            <DialogContent className="rounded-3xl sm:max-w-md p-0 overflow-hidden">
              <div className="relative">
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Add Product
                  </DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-6 pt-4 space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Product Image
                    </label>
                    <label className="block border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                          handleImageUpload(e.target.files?.[0], false)
                        }
                        className="hidden"
                      />
                      {newProduct.image ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={newProduct.image}
                            alt="Preview"
                            className="h-[120px] max-h-[120px] object-contain"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct({ ...newProduct, image: null })
                            }
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload size={20} />
                          <span className="text-sm font-medium">
                            Click to upload product image
                          </span>
                          <span className="text-xs text-gray-400">
                            PNG, JPG up to 2MB
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Row 1: SKU + Generate | Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        SKU
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. LGC-GPX"
                          value={newProduct.sku}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              sku: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const sku = generateSku(newProduct.name);
                            setNewProduct({ ...newProduct, sku });
                          }}
                          disabled={!newProduct.name.trim()}
                          className="shrink-0 text-xs px-2 py-1 border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Category
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Product Name (full width) */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Logitech G Pro X"
                      value={newProduct.name}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${
                        errors.name
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-[#ececf2] focus:border-violet-400 focus:ring-violet-100"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">
                        This field is required
                      </p>
                    )}
                  </div>

                  {/* Row 3: Stock | Min Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Stock <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newProduct.stock}
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct,
                            stock: e.target.value,
                          });
                          if (errors.stock) setErrors({ ...errors, stock: "" });
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${
                          errors.stock
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : "border-[#ececf2] focus:border-violet-400 focus:ring-violet-100"
                        }`}
                      />
                      {errors.stock && (
                        <p className="text-xs text-red-500 mt-1">
                          This field is required
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Min Stock
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="5"
                        value={newProduct.minStock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            minStock: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Low stock alert threshold
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Unit Cost | Unit Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Unit Cost
                      </label>
                      <input
                        type="text"
                        placeholder="0"
                        value={
                          newProduct.unitCost
                            ? formatPrice(newProduct.unitCost)
                            : ""
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            unitCost: parsePriceInput(e.target.value),
                          })
                        }
                        className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Unit Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="0"
                        value={
                          newProduct.unitPrice
                            ? formatPrice(newProduct.unitPrice)
                            : ""
                        }
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct,
                            unitPrice: parsePriceInput(e.target.value),
                          });
                          if (errors.unitPrice)
                            setErrors({ ...errors, unitPrice: "" });
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${
                          errors.unitPrice
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : "border-[#ececf2] focus:border-violet-400 focus:ring-violet-100"
                        }`}
                      />
                      {errors.unitPrice && (
                        <p className="text-xs text-red-500 mt-1">
                          This field is required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cancel + Save buttons */}
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewProduct({
                          sku: "",
                          name: "",
                          category: "",
                          stock: "",
                          minStock: 5,
                          unitCost: "",
                          unitPrice: "",
                        });
                        setErrors({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProduct}
                      className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ══════════════ Table Card ════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm">
        <div className="p-6 pb-0">
          {/* Search and Filter Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#ececf2] bg-white py-3 pl-11 pr-4 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none rounded-2xl border border-[#ececf2] bg-gradient-to-b from-[#f8f8fc] to-white py-3 pl-4 pr-10 text-sm font-medium text-gray-700 outline-none transition-all focus:border-violet-400 hover:border-violet-300 hover:shadow-sm cursor-pointer"
              >
                <option>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-violet-50 px-1.5 py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-violet-500"
                >
                  <path d="M4 21V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
                  <path d="M8 21V9" />
                  <path d="M12 21V9" />
                  <path d="M16 21V9" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-violet-500"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Manage Categories Button */}
            <button
              onClick={() => setManageCatOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-purple-200 px-4 py-3 text-sm font-medium text-purple-600 transition-all hover:bg-purple-50 hover:shadow-sm"
            >
              <Settings2 className="h-4 w-4" />
              Manage Categories
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-600">
              <Package className="h-4 w-4" />
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-purple-700">
                {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  <X className="h-3 w-3" />
                  Deselect All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">
                No products found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search
                  ? "Try a different search term"
                  : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#ececf2]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f8f8fc] to-white text-left text-sm text-gray-500">
                    <th className="px-4 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredProducts.length > 0 &&
                          selectedIds.size === filteredProducts.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Stock</th>
                    <th className="px-6 py-4 font-semibold">Unit Cost</th>
                    <th className="px-6 py-4 font-semibold">Unit Price</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = stockStatus(
                      Number(product.stock),
                      Number(product.minStock) || 5,
                    );
                    const isSelected = selectedIds.has(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`border-t border-[#ececf2] transition-colors hover:bg-violet-50/30 ${
                          isSelected ? "bg-purple-50 border-purple-200" : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-violet-600">
                                {product.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span
                                onClick={() =>
                                  navigate(`/products/${product.id}`)
                                }
                                className="font-medium text-purple-600 hover:underline cursor-pointer"
                              >
                                {product.name}
                              </span>
                              <p className="text-xs text-gray-400">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs font-mono font-medium text-gray-600">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  product.stock === 0
                                    ? "bg-red-400"
                                    : product.stock <=
                                        (Number(product.minStock) || 5)
                                      ? "bg-yellow-400"
                                      : "bg-green-400"
                                }`}
                                style={{
                                  width: `${Math.min((product.stock / 30) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {product.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          Rp {product.unitCost.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          Rp {product.unitPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${status.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.label === "In Stock" ? "bg-green-500" : status.label === "Low Stock" ? "bg-yellow-500" : "bg-red-500"}`}
                            />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editDialogOpen}
                              onOpenChange={setEditDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setEditDialogOpen(true);
                                    setEditErrors({});
                                  }}
                                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-sm font-medium text-violet-600 transition-all hover:shadow-sm hover:-translate-y-0.5"
                                >
                                  <Edit3 className="h-3.5 w-3.5" /> Edit
                                </button>
                              </DialogTrigger>
                              <DialogContent className="rounded-3xl sm:max-w-md p-0 overflow-hidden">
                                <div className="relative">
                                  <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                                  <DialogHeader className="px-6 pt-5 pb-0">
                                    <DialogTitle className="text-xl font-bold text-gray-900">
                                      Edit Product
                                    </DialogTitle>
                                  </DialogHeader>
                                  {editingProduct && (
                                    <div className="px-6 pb-6 pt-4 space-y-4">
                                      {/* Image Upload */}
                                      <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                          Product Image
                                        </label>
                                        <label className="block border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
                                          <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(e) =>
                                              handleImageUpload(
                                                e.target.files?.[0],
                                                true,
                                              )
                                            }
                                            className="hidden"
                                          />
                                          {editingProduct.image ? (
                                            <div className="flex flex-col items-center gap-2">
                                              <img
                                                src={editingProduct.image}
                                                alt="Preview"
                                                className="h-[120px] max-h-[120px] object-contain"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setEditingProduct({
                                                    ...editingProduct,
                                                    image: null,
                                                  })
                                                }
                                                className="text-xs text-red-500 hover:text-red-700"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                              <Upload size={20} />
                                              <span className="text-sm font-medium">
                                                Click to upload product image
                                              </span>
                                              <span className="text-xs text-gray-400">
                                                PNG, JPG up to 2MB
                                              </span>
                                            </div>
                                          )}
                                        </label>
                                      </div>

                                      {/* Row 1: SKU | Category */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                            SKU
                                          </label>
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              value={editingProduct.sku}
                                              onChange={(e) =>
                                                setEditingProduct({
                                                  ...editingProduct,
                                                  sku: e.target.value,
                                                })
                                              }
                                              className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const sku = generateSku(
                                                  editingProduct.name,
                                                );
                                                setEditingProduct({
                                                  ...editingProduct,
                                                  sku,
                                                });
                                              }}
                                              disabled={
                                                !editingProduct.name.trim()
                                              }
                                              className="shrink-0 text-xs px-2 py-1 border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                              Generate
                                            </button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                            Category
                                          </label>
                                          <select
                                            value={editingProduct.category}
                                            onChange={(e) =>
                                              setEditingProduct({
                                                ...editingProduct,
                                                category: e.target.value,
                                              })
                                            }
                                            className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
                                          >
                                            {categories.map((cat) => (
                                              <option key={cat} value={cat}>
                                                {cat}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      {/* Row 2: Product Name (full width) */}
                                      <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                          Product Name{" "}
                                          <span className="text-red-400">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="text"
                                          value={editingProduct.name}
                                          onChange={(e) => {
                                            setEditingProduct({
                                              ...editingProduct,
                                              name: e.target.value,
                                            });
                                            if (editErrors.name)
                                              setEditErrors({
                                                ...editErrors,
                                                name: "",
                                              });
                                          }}
                                          className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${
                                            editErrors.name
                                              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                              : "border-[#ececf2] focus:border-violet-400 focus:ring-violet-100"
                                          }`}
                                        />
                                        {editErrors.name && (
                                          <p className="text-xs text-red-500 mt-1">
                                            This field is required
                                          </p>
                                        )}
                                      </div>

                                      {/* Row 3: Stock | Min Stock */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                            Stock{" "}
                                            <span className="text-red-400">
                                              *
                                            </span>
                                          </label>
                                          <input
                                            type="number"
                                            min="0"
                                            value={editingProduct.stock}
                                            onChange={(e) => {
                                              setEditingProduct({
                                                ...editingProduct,
                                                stock: Number(e.target.value),
                                                status: stockStatus(
                                                  Number(e.target.value),
                                                  Number(
                                                    editingProduct.minStock,
                                                  ) || 5,
                                                ).label,
                                              });
                                              if (editErrors.stock)
                                                setEditErrors({
                                                  ...editErrors,
                                                  stock: "",
                                                });
                                            }}
                                            className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${
                                              editErrors.stock
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-[#ececf2] focus:border-violet-400 focus:ring-violet-100"
                                            }`}
                                          />
                                          {editErrors.stock && (
                                            <p className="text-xs text-red-500 mt-1">
                                              This field is required
                                            </p>
                                          )}
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                            Min Stock
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={editingProduct.minStock ?? 5}
                                            onChange={(e) =>
                                              setEditingProduct({
                                                ...editingProduct,
                                                minStock: Number(
                                                  e.target.value,
                                                ),
                                                status: stockStatus(
                                                  Number(editingProduct.stock),
                                                  Number(e.target.value) || 5,
                                                ).label,
                                              })
                                            }
                                            className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                          />
                                          <p className="text-xs text-gray-400 mt-1">
                                            Low stock alert threshold
                                          </p>
                                        </div>
                                      </div>

                                      {/* Row 4: Unit Cost | Unit Price */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                            Unit Cost
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              editingProduct.unitCost
                                                ? formatPrice(
                                                    editingProduct.unitCost,
                                                  )
                                                : ""
                                            }
                                            onChange={(e) =>
                                              setEditingProduct({
                                                ...editingProduct,
                                                unitCost: Number(
                                                  parsePriceInput(
                                                    e.target.value,
                                                  ),
                                                ),
                                              })
                                            }
                                            className="w-full rounded-2xl border border-[#ececf2] px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                                            Unit Price{" "}
                                            <span className="text-red-400">
                                              *
                                            </span>
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              editingProduct.unitPrice
                                                ? formatPrice(
                                                    editingProduct.unitPrice,
                                                  )
                                                : ""
                                            }
                                            onChange={(e) => {
                                              setEditingProduct({
                                                ...editingProduct,
                                                unitPrice: Number(
                                                  parsePriceInput(
                                                    e.target.value,
                                                  ),
                                                ),
                                              });
                                              if (editErrors.unitPrice)
                                                setEditErrors({
                                                  ...editErrors,
                                                  unitPrice: "",
                                                });
                                            }}
                                            className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${
                                              editErrors.unitPrice
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-[#ececf2] focus:border-violet-400 focus:ring-violet-100"
                                            }`}
                                          />
                                          {editErrors.unitPrice && (
                                            <p className="text-xs text-red-500 mt-1">
                                              This field is required
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Cancel + Update buttons */}
                                      <div className="flex gap-3 mt-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditDialogOpen(false);
                                            setEditingProduct(null);
                                            setEditErrors({});
                                          }}
                                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={handleUpdateProduct}
                                          className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md"
                                        >
                                          Update Product
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <button
                              onClick={() => setDeleteConfirm(product)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:shadow-sm hover:-translate-y-0.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ Delete Confirm Modal (Single) ═══════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Delete Product
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteConfirm.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-2xl border border-[#ececf2] py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm.id)}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3 font-medium text-white shadow-sm transition-all hover:shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Bulk Delete Confirm Modal ═══════════════════════ */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Delete {selectedIds.size} Product
                {selectedIds.size !== 1 ? "s" : ""}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete {selectedIds.size} selected
                product
                {selectedIds.size !== 1 ? "s" : ""}? This action cannot be
                undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="flex-1 rounded-2xl border border-[#ececf2] py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3 font-medium text-white shadow-sm transition-all hover:shadow-md"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Manage Categories Modal ════════════════════════ */}
      {manageCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl -mt-6 -mx-6 mb-6" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Categories
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add or remove product categories
                </p>
              </div>
            </div>

            {/* Add Category */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <button
                onClick={handleAddCategory}
                className="shrink-0 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              >
                Add
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No categories yet
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-2xl border border-[#ececf2] px-4 py-3 transition-all hover:bg-violet-50/30"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {cat}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-all hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setManageCatOpen(false)}
                className="w-full rounded-2xl border border-[#ececf2] py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Import CSV Modal ════════════════════════════════ */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl -mt-6 -mx-6 mb-6" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Import Products from CSV
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Upload a CSV file with your product data
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setCsvRows([]);
                  setCsvErrors([]);
                  setCsvFileName("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Download Template */}
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4"
            >
              <FileDown className="h-4 w-4" />
              Download CSV Template
            </button>

            {/* CSV Format Info */}
            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] to-white p-4 mb-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">
                Required columns:
              </p>
              <p className="font-mono text-xs">
                name, sku, category, stock, unitCost, unitPrice, minStock
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Optional: minStock (default: 5)
              </p>
            </div>

            {/* File Upload */}
            <label className="block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleCSVFile(e.target.files?.[0])}
                className="hidden"
              />
              {csvFileName ? (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {csvFileName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {csvRows.length} rows found
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload size={24} />
                  <span className="text-sm font-medium">
                    Click to upload CSV file
                  </span>
                  <span className="text-xs text-gray-400">.csv files only</span>
                </div>
              )}
            </label>

            {/* Preview Table */}
            {csvRows.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#ececf2] mb-4">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] to-white text-left text-gray-500 sticky top-0">
                        <th className="px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Stock</th>
                        <th className="px-4 py-3 font-semibold">Unit Cost</th>
                        <th className="px-4 py-3 font-semibold">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 5).map((row, idx) => {
                        const rowNum = idx + 1;
                        const hasError = csvErrors.some(
                          (e) => e.row === rowNum,
                        );
                        return (
                          <tr
                            key={idx}
                            className={`border-t border-[#ececf2] ${
                              hasError ? "bg-red-50" : ""
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-400">
                              {rowNum}
                            </td>
                            <td
                              className={`px-4 py-3 font-medium ${!row.name ? "text-red-500" : "text-gray-900"}`}
                            >
                              {row.name || (
                                <span className="italic text-red-400">
                                  Missing
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono">
                              {row.sku || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {row.category || "-"}
                            </td>
                            <td
                              className={`px-4 py-3 ${row.stock === "" ? "text-red-500" : "text-gray-900"}`}
                            >
                              {row.stock || (
                                <span className="italic text-red-400">
                                  Missing
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {row.unitCost || "0"}
                            </td>
                            <td
                              className={`px-4 py-3 ${row.unitPrice === "" ? "text-red-500" : "text-gray-900"}`}
                            >
                              {row.unitPrice || (
                                <span className="italic text-red-400">
                                  Missing
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {csvRows.length > 5 && (
                        <tr className="border-t border-[#ececf2]">
                          <td
                            colSpan={7}
                            className="px-4 py-3 text-center text-sm text-gray-400"
                          >
                            ...and {csvRows.length - 5} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Summary */}
            {csvErrors.length > 0 && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-3 mb-4">
                <p className="text-xs font-semibold text-red-700 mb-1">
                  {csvErrors.length} row{csvErrors.length !== 1 ? "s" : ""} with
                  errors
                </p>
                {csvErrors.slice(0, 3).map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600">
                    Row {err.row}: {err.message}
                  </p>
                ))}
                {csvErrors.length > 3 && (
                  <p className="text-xs text-red-400">
                    ...and {csvErrors.length - 3} more
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setCsvRows([]);
                  setCsvErrors([]);
                  setCsvFileName("");
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={csvRows.length === 0 || csvErrors.length > 0}
                className={`flex-1 rounded-2xl py-3 font-semibold shadow-sm transition-all ${
                  csvRows.length > 0 && csvErrors.length === 0
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Import {csvRows.length} Product{csvRows.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
