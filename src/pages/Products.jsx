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
  Download,
} from "lucide-react";
import { exportProductsPDF } from "@/lib/exportUtils";

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

// ─── Variant SKU Generator ───────────────────────────────────────────────
function generateVariantSku(parentSku, variantName) {
  if (!parentSku || !variantName || !variantName.trim()) return "";
  const words = variantName.trim().split(/\s+/).filter(Boolean);
  const suffix = words.map((w) => w.slice(0, 3).toUpperCase()).join("-");
  return `${parentSku}-${suffix}`;
}

// ─── Header Normalization Map ────────────────────────────────────────────
const HEADER_MAP = {
  name: "name",
  sku: "sku",
  category: "category",
  stock: "stock",
  "min stock": "minStock",
  minstock: "minStock",
  "unit cost": "unitCost",
  unitcost: "unitCost",
  "unit price": "unitPrice",
  unitprice: "unitPrice",
  price: "unitPrice",
};

// ─── CSV Parser ──────────────────────────────────────────────────────────────
function parseCSV(text) {
  // Remove BOM character and normalize line endings
  const clean = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  const lines = clean.split("\n");
  if (lines.length < 2) return { rows: [], errors: [] };

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const rawHeaders = lines[0]
    .split(delimiter)
    .map((h) => h.trim().toLowerCase());
  const headers = rawHeaders.map((h) => HEADER_MAP[h] || h);
  const rows = [];
  const errors = [];

  const cleanValue = (val) => val.trim().replace(/^["']|["']$/g, "");

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => cleanValue(v));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);

    if (!row.name || row.name.length < 2) {
      errors.push({ row: i, message: `Row ${i}: Missing or invalid name` });
    }
    if (row.stock === "" || isNaN(Number(row.stock)) || Number(row.stock) < 0) {
      errors.push({ row: i, message: `Row ${i}: Invalid stock value` });
    }
    if (
      row.unitPrice === "" ||
      isNaN(Number(row.unitPrice)) ||
      Number(row.unitPrice) <= 0
    ) {
      errors.push({ row: i, message: `Row ${i}: Invalid unit price` });
    }
  }

  return { rows, errors };
}

// ─── Helper: get effective stock (sum variants or single stock) ──────────
function getEffectiveStock(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }
  return Number(product.stock);
}

// ─── Helper: get effective price (from first variant or single price) ────
function getEffectivePrice(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0].unitPrice;
  }
  return product.unitPrice;
}

export default function Products() {
  const navigate = useNavigate();
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
    } catch (error) {
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
    } catch (error) {
      return [...DEFAULT_CATEGORIES];
    }
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // ─── Import CSV State ──────────────────────────────────────────────────
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);

  // ─── Variants State ────────────────────────────────────────────────────
  const [addVariants, setAddVariants] = useState([]);
  const [editVariants, setEditVariants] = useState([]);
  // Track which variant SKUs have been manually edited (so we don't auto-overwrite)
  const [manualSkuIds, setManualSkuIds] = useState(() => new Set());

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
    if (addVariants.length === 0) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors = {};
    const hasVariants = editVariants.length > 0;

    if (!editingProduct.name || editingProduct.name.trim().length < 2) {
      newErrors.name = "This field is required";
    }
    if (!hasVariants) {
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
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Variant Handlers ────────────────────────────────────────────────
  const addVariant = (isEdit = false) => {
    const newV = {
      id: Date.now(),
      name: "",
      sku: "",
      stock: 0,
      unitPrice: 0,
      unitCost: 0,
    };
    if (isEdit) {
      setEditVariants([...editVariants, newV]);
    } else {
      setAddVariants([...addVariants, newV]);
    }
  };

  const updateVariant = (id, field, value, isEdit = false) => {
    const setter = isEdit ? setEditVariants : setAddVariants;
    const list = isEdit ? editVariants : addVariants;

    // When variant name changes and SKU hasn't been manually edited, auto-generate SKU
    if (field === "name") {
      setter(
        list.map((v) => {
          if (v.id === id) {
            const updated = { ...v, name: value };
            if (!manualSkuIds.has(id)) {
              const parentSku = isEdit ? editingProduct?.sku : newProduct.sku;
              if (parentSku) {
                updated.sku = generateVariantSku(parentSku, value);
              }
            }
            return updated;
          }
          return v;
        }),
      );
    } else if (field === "sku") {
      // Mark this variant as manually edited
      setManualSkuIds((prev) => new Set(prev).add(id));
      setter(list.map((v) => (v.id === id ? { ...v, sku: value } : v)));
    } else {
      setter(list.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
    }
  };

  const removeVariant = (id, isEdit = false) => {
    const setter = isEdit ? setEditVariants : setAddVariants;
    const list = isEdit ? editVariants : addVariants;
    setter(list.filter((v) => v.id !== id));
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
    const hasVariants = addVariants.length > 0;
    let stock, unitPrice;

    if (hasVariants) {
      stock = addVariants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
      unitPrice = null;
    } else {
      stock = Number(payload.stock);
      unitPrice = Number(payload.unitPrice);
    }

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
        unitPrice: unitPrice,
        status: stockStatus(stock, minStock).label,
        variants: hasVariants ? addVariants : [],
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
    });
    setAddVariants([]);
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

    const hasVariants = editVariants.length > 0;
    const updated = { ...editingProduct };

    if (hasVariants) {
      updated.stock = editVariants.reduce(
        (sum, v) => sum + Number(v.stock || 0),
        0,
      );
      updated.unitPrice = null;
      updated.variants = editVariants;
    } else {
      delete updated.variants;
    }

    setProducts(
      products.map((product) =>
        product.id === updated.id ? updated : product,
      ),
    );
    setEditingProduct(null);
    setEditDialogOpen(false);
    setEditVariants([]);
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
        } catch (error) {
          console.error("Failed to parse products from storage");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ─── Bulk Actions ────────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    const updatedProducts = products.filter(
      (product) => !selectedIds.includes(product.id),
    );
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    const count = selectedIds.length;
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    toast.success(`${count} products deleted successfully 🗑️`);
  };

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

  // ─── Import CSV ──────────────────────────────────────────────────────
  const handleCSVFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const { rows, errors } = parseCSV(text);
      setCsvData(rows);
      setCsvErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csv =
      "name,sku,category,stock,unitCost,unitPrice,minStock\nLogitech G Pro X,LGC-GPX,Headset,15,1500000,1899000,5";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    const errorRowNums = new Set(csvErrors.map((e) => e.row));
    const validRows = csvData.filter((_, idx) => !errorRowNums.has(idx + 1));

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
        status: stockStatus(stock, minStock).label,
      };
    });

    const updated = [...products, ...newProducts];
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));

    setImportModalOpen(false);
    setCsvData([]);
    setCsvErrors([]);

    toast.success(`Imported ${validRows.length} products successfully ✅`);
  };

  const validRowCount = csvData.length - csvErrors.length;

  // ─── Variants UI helper ──────────────────────────────────────────────
  const renderVariantSection = (variants, setVariants, isEdit = false) => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Variants{" "}
            <span className="text-gray-300 font-normal">(Optional)</span>
          </label>
          {variants.length > 0 && (
            <span className="text-xs text-gray-400 ml-2">
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => addVariant(isEdit)}
          className="text-xs font-semibold text-purple-600 border border-purple-200 px-3.5 py-1.5 rounded-xl hover:bg-purple-50 cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-sm"
        >
          <Plus size={13} /> Add Variant
        </button>
      </div>

      {/* Scrollable variant list */}
      <div
        className={
          variants.length > 0
            ? "max-h-72 overflow-y-auto overflow-x-hidden space-y-4"
            : ""
        }
      >
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="rounded-xl border border-[#ececf2] p-4"
          >
            {/* Row 1: Variant Name | Variant SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Variant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black / M"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value, isEdit)
                  }
                  className="w-full rounded-xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Variant SKU
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(variant.id, "sku", e.target.value, isEdit)
                    }
                    className="flex-1 rounded-xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id, isEdit)}
                    className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Remove variant"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Stock | Price | Cost */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(variant.id, "stock", e.target.value, isEdit)
                  }
                  className="w-full rounded-xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Unit Price
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={
                    variant.unitPrice ? formatPrice(variant.unitPrice) : ""
                  }
                  onChange={(e) =>
                    updateVariant(
                      variant.id,
                      "unitPrice",
                      parsePriceInput(e.target.value),
                      isEdit,
                    )
                  }
                  className="w-full rounded-xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Unit Cost
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={variant.unitCost ? formatPrice(variant.unitCost) : ""}
                  onChange={(e) =>
                    updateVariant(
                      variant.id,
                      "unitCost",
                      parsePriceInput(e.target.value),
                      isEdit,
                    )
                  }
                  className="w-full rounded-xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>
          </div>
        ))}

        {variants.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-7 text-center">
            <p className="text-sm text-gray-400">
              No variants yet. Click{" "}
              <span className="text-purple-500 font-semibold">Add Variant</span>{" "}
              to create product options like size or color.
            </p>
          </div>
        )}
      </div>
    </div>
  );

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
          {/* Export PDF Button */}
          <button
            onClick={() => exportProductsPDF(products)}
            className="flex items-center gap-2 rounded-2xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-600 transition-all hover:bg-violet-50"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
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

            <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
              <div className="relative">
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Add Product
                  </DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-6 pt-4 space-y-4">
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
                        Stock{" "}
                        {addVariants.length === 0 && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newProduct.stock}
                        disabled={addVariants.length > 0}
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
                        } ${addVariants.length > 0 ? "bg-gray-50 text-gray-400" : ""}`}
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
                        Unit Price{" "}
                        {addVariants.length === 0 && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="0"
                        value={
                          newProduct.unitPrice
                            ? formatPrice(newProduct.unitPrice)
                            : ""
                        }
                        disabled={addVariants.length > 0}
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
                        } ${addVariants.length > 0 ? "bg-gray-50 text-gray-400" : ""}`}
                      />
                      {errors.unitPrice && (
                        <p className="text-xs text-red-500 mt-1">
                          This field is required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Variants Section */}
                  {renderVariantSection(addVariants, setAddVariants, false)}

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
                        setAddVariants([]);
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
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg mb-3 mt-4">
              <span className="text-sm text-purple-700">
                {selectedIds.length} products selected
              </span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="text-sm text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-gray-600 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Deselect All
              </button>
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
                        onChange={handleSelectAll}
                        checked={
                          selectedIds.length === filteredProducts.length &&
                          filteredProducts.length > 0
                        }
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
                    const effStock = getEffectiveStock(product);
                    const effPrice = getEffectivePrice(product);
                    const hasVariants =
                      product.variants && product.variants.length > 0;
                    const status = stockStatus(
                      effStock,
                      Number(product.minStock) || 5,
                    );
                    return (
                      <tr
                        key={product.id}
                        className={`border-t border-[#ececf2] transition-colors hover:bg-violet-50/30 ${selectedIds.includes(product.id) ? "bg-purple-50" : ""}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            onChange={() => toggleSelect(product.id)}
                            checked={selectedIds.includes(product.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-violet-600">
                              {product.name.charAt(0)}
                            </div>
                            <div>
                              <span
                                onClick={() =>
                                  navigate(`/products/${product.id}`)
                                }
                                className="font-semibold text-gray-900 hover:text-violet-600 cursor-pointer transition-colors"
                              >
                                {product.name}
                              </span>
                              {hasVariants && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full ml-2">
                                  {product.variants.length} variants
                                </span>
                              )}
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
                                  effStock === 0
                                    ? "bg-red-400"
                                    : effStock <=
                                        (Number(product.minStock) || 5)
                                      ? "bg-yellow-400"
                                      : "bg-green-400"
                                }`}
                                style={{
                                  width: `${Math.min((effStock / 30) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {effStock}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          Rp{" "}
                          {(Number(product.unitCost) || 0).toLocaleString(
                            "id-ID",
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {hasVariants ? (
                            <span className="text-xs text-purple-600 font-medium">
                              From{" "}
                              {effPrice
                                ? "Rp " +
                                  Number(effPrice).toLocaleString("id-ID")
                                : "—"}
                            </span>
                          ) : (
                            "Rp " +
                            Number(product.unitPrice).toLocaleString("id-ID")
                          )}
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
                              onOpenChange={(open) => {
                                setEditDialogOpen(open);
                                if (!open) {
                                  setEditingProduct(null);
                                  setEditVariants([]);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setEditDialogOpen(true);
                                    setEditErrors({});
                                    setEditVariants(
                                      product.variants
                                        ? [...product.variants]
                                        : [],
                                    );
                                  }}
                                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-sm font-medium text-violet-600 transition-all hover:shadow-sm hover:-translate-y-0.5"
                                >
                                  <Edit3 className="h-3.5 w-3.5" /> Edit
                                </button>
                              </DialogTrigger>
                              <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
                                <div className="relative">
                                  <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                                  <DialogHeader className="px-6 pt-5 pb-0">
                                    <DialogTitle className="text-xl font-bold text-gray-900">
                                      Edit Product
                                    </DialogTitle>
                                  </DialogHeader>
                                  {editingProduct && (
                                    <div className="px-6 pb-6 pt-4 space-y-4">
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
                                            {editVariants.length === 0 && (
                                              <span className="text-red-400">
                                                *
                                              </span>
                                            )}
                                          </label>
                                          <input
                                            type="number"
                                            min="0"
                                            value={editingProduct.stock}
                                            disabled={editVariants.length > 0}
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
                                            } ${editVariants.length > 0 ? "bg-gray-50 text-gray-400" : ""}`}
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
                                            {editVariants.length === 0 && (
                                              <span className="text-red-400">
                                                *
                                              </span>
                                            )}
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
                                            disabled={editVariants.length > 0}
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
                                            } ${editVariants.length > 0 ? "bg-gray-50 text-gray-400" : ""}`}
                                          />
                                          {editErrors.unitPrice && (
                                            <p className="text-xs text-red-500 mt-1">
                                              This field is required
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Variants Section */}
                                      {renderVariantSection(
                                        editVariants,
                                        setEditVariants,
                                        true,
                                      )}

                                      {/* Cancel + Update buttons */}
                                      <div className="flex gap-3 mt-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditDialogOpen(false);
                                            setEditingProduct(null);
                                            setEditVariants([]);
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

      {/* ══════════════ Delete Confirm Modal ════════════════════════════ */}
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
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Delete {selectedIds.length} Products
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBulkDeleteOpen(false)}
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
                  setCsvData([]);
                  setCsvErrors([]);
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

            {/* Format Info */}
            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] to-white p-4 mb-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">
                Required: name, sku, category, stock, unitPrice
              </p>
              <p className="text-xs text-gray-400">
                Optional: unitCost, minStock (default: 5)
              </p>
            </div>

            {/* Upload Area */}
            <label className="block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFile}
                className="hidden"
              />
              {csvData.length > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {csvData.length} rows found
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
            {csvData.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#ececf2] mb-4">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] to-white text-left text-gray-500 sticky top-0">
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Stock</th>
                        <th className="px-4 py-3 font-semibold">Unit Price</th>
                        <th className="px-4 py-3 font-semibold">Valid?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, idx) => {
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
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {row.name || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono">
                              {row.sku || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {row.category || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {row.stock || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {row.unitPrice || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {hasError ? (
                                <span className="text-xs text-red-600 font-medium">
                                  Invalid
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">
                                  ✓ Valid
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {csvData.length > 5 && (
                        <tr className="border-t border-[#ececf2]">
                          <td
                            colSpan={6}
                            className="px-4 py-3 text-center text-sm text-gray-400"
                          >
                            ...and {csvData.length - 5} more rows
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
                    {err.message}
                  </p>
                ))}
                {csvErrors.length > 3 && (
                  <p className="text-xs text-red-400">
                    ...and {csvErrors.length - 3} more
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setCsvData([]);
                  setCsvErrors([]);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={validRowCount === 0}
                className={`flex-1 rounded-2xl py-3 font-semibold shadow-sm transition-all ${
                  validRowCount > 0
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Import {validRowCount} Product{validRowCount !== 1 ? "s" : ""}
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
    </div>
  );
}
