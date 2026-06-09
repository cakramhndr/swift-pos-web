import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useProducts from "@/hooks/useProducts";

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
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  DollarSign,
  Grid3X3,
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

// ─── Category color mapping ──────────────────────────────────────────
const CATEGORY_COLORS = {
  "Gaming Gear":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Headset: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Mouse: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Keyboard:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Monitor:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Storage: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
};

const CATEGORY_AVATAR_COLORS = {
  "Gaming Gear":
    "from-purple-100 to-purple-200 border-purple-200 text-purple-500",
  Headset: "from-pink-100 to-pink-200 border-pink-200 text-pink-500",
  Mouse: "from-blue-100 to-blue-200 border-blue-200 text-blue-500",
  Keyboard: "from-green-100 to-green-200 border-green-200 text-green-500",
  Monitor: "from-orange-100 to-orange-200 border-orange-200 text-orange-500",
  Storage: "from-teal-100 to-teal-200 border-teal-200 text-teal-500",
  default: "from-purple-100 to-purple-200 border-purple-200 text-purple-400",
};

function getCategoryColor(catName) {
  return CATEGORY_COLORS[catName] || CATEGORY_COLORS.default;
}
function getCategoryAvatar(catName) {
  return CATEGORY_AVATAR_COLORS[catName] || CATEGORY_AVATAR_COLORS.default;
}

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

function generateVariantSku(parentSku, variantName) {
  if (!parentSku || !variantName || !variantName.trim()) return "";
  const words = variantName.trim().split(/\s+/).filter(Boolean);
  const suffix = words.map((w) => w.slice(0, 3).toUpperCase()).join("-");
  return `${parentSku}-${suffix}`;
}

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

function parseCSV(text) {
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
    if (!row.name || row.name.length < 2)
      errors.push({ row: i, message: `Row ${i}: Missing or invalid name` });
    if (row.stock === "" || isNaN(Number(row.stock)) || Number(row.stock) < 0)
      errors.push({ row: i, message: `Row ${i}: Invalid stock value` });
    if (
      row.unitPrice === "" ||
      isNaN(Number(row.unitPrice)) ||
      Number(row.unitPrice) <= 0
    )
      errors.push({ row: i, message: `Row ${i}: Invalid unit price` });
  }
  return { rows, errors };
}

function getEffectiveStock(p) {
  if (p.variants && p.variants.length > 0)
    return p.variants.reduce((s, v) => s + Number(v.stock || 0), 0);
  return Number(p.stock);
}
function getEffectivePrice(p) {
  if (p.variants && p.variants.length > 0)
    return p.variants[0].unit_price ?? p.variants[0].unitPrice ?? 0;
  return p.unit_price ?? p.unitPrice ?? 0;
}
function getCategoryName(p) {
  return p.category?.name ?? p.category ?? "";
}
function getProductValue(p) {
  return getEffectiveStock(p) * Number(p.unit_price ?? p.unitPrice ?? 0);
}

const formatRp = (v) => {
  if (v == null) return "Rp 0";
  return "Rp " + Number(v).toLocaleString("id-ID");
};

function TableRowSkeleton() {
  return (
    <tr className="border-t border-[#ececf2] dark:border-gray-700/60 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"
            style={{ maxWidth: i === 1 ? 20 : i === 2 ? 120 : 60 }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const {
    data: products,
    loading,
    refetch,
    create: createProductApiHook,
    update: updateProductApiHook,
    remove: deleteProductApiHook,
  } = useProducts();
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const debounceRef = useRef(null);
  const variantIdCounter = useRef(0);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "",
    stock: "",
    minStock: 5,
    unitCost: "",
    unitPrice: "",
  });
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [manageCatOpen, setManageCatOpen] = useState(false);
  const [categories, setCategories] = useState(() => {
    try {
      const s = localStorage.getItem("swiftpos_categories");
      return s ? JSON.parse(s) : [...DEFAULT_CATEGORIES];
    } catch {
      return [...DEFAULT_CATEGORIES];
    }
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [addVariants, setAddVariants] = useState([]);
  const [editVariants, setEditVariants] = useState([]);
  const [manualSkuIds, setManualSkuIds] = useState(() => new Set());

  const summaryStats = useMemo(
    () => ({
      totalProducts: products.length,
      lowStock: products.filter((p) => {
        const s = getEffectiveStock(p);
        return s > 0 && s <= (Number(p.minStock) || 5);
      }).length,
      outOfStock: products.filter((p) => getEffectiveStock(p) === 0).length,
      totalValue: products.reduce((s, p) => s + getProductValue(p), 0),
      categories: new Set(
        products.map((p) => getCategoryName(p)).filter(Boolean),
      ).size,
    }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let f = products;
    if (categoryFilter && categoryFilter !== "All Categories")
      f = f.filter((p) => getCategoryName(p) === categoryFilter);
    if (statusFilter !== "All")
      f = f.filter(
        (p) =>
          (getEffectiveStock(p) === 0
            ? "Out of Stock"
            : getEffectiveStock(p) <= (Number(p.minStock) || 5)
              ? "Low Stock"
              : "In Stock") === statusFilter,
      );
    if (stockFilter === "Available")
      f = f.filter((p) => getEffectiveStock(p) > 0);
    else if (stockFilter === "Critical")
      f = f.filter((p) => {
        const s = getEffectiveStock(p);
        return s > 0 && s <= 5;
      });
    else if (stockFilter === "Empty")
      f = f.filter((p) => getEffectiveStock(p) === 0);
    return f;
  }, [products, categoryFilter, statusFilter, stockFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, page, perPage]);
  const totalFiltered = filteredProducts.length;
  const totalPages = Math.ceil(totalFiltered / perPage) || 1;

  useEffect(() => {
    localStorage.setItem("swiftpos_categories", JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    refetch({ page, category: categoryFilter });
  }, [page, categoryFilter, refetch]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      refetch({ search, page: 1, category: categoryFilter });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, categoryFilter, refetch]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setStatusFilter("All");
    setStockFilter("All");
    setPage(1);
  };
  const formatPrice = (v) => {
    const n = Number(v);
    return isNaN(n) ? "" : n.toLocaleString("id-ID");
  };
  const parsePriceInput = (v) => v.replace(/[^0-9]/g, "");

  const validateAddForm = () => {
    const e = {};
    if (!newProduct.name || newProduct.name.trim().length < 2)
      e.name = "Required";
    if (addVariants.length === 0) {
      if (
        newProduct.stock === "" ||
        Number(newProduct.stock) < 0 ||
        isNaN(Number(newProduct.stock))
      )
        e.stock = "Required";
      if (
        newProduct.unitPrice === "" ||
        Number(newProduct.unitPrice) <= 0 ||
        isNaN(Number(newProduct.unitPrice))
      )
        e.unitPrice = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validateEditForm = () => {
    const e = {};
    if (!editingProduct.name || editingProduct.name.trim().length < 2)
      e.name = "Required";
    if (editVariants.length === 0) {
      if (
        editingProduct.stock === "" ||
        editingProduct.stock === undefined ||
        Number(editingProduct.stock) < 0 ||
        isNaN(Number(editingProduct.stock))
      )
        e.stock = "Required";
      if (
        editingProduct.unitPrice === "" ||
        editingProduct.unitPrice === undefined ||
        Number(editingProduct.unitPrice) <= 0 ||
        isNaN(Number(editingProduct.unitPrice))
      )
        e.unitPrice = "Required";
    }
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const addVariant = (isEdit = false) => {
    variantIdCounter.current += 1;
    const v = {
      id: variantIdCounter.current,
      name: "",
      sku: "",
      stock: 0,
      unitPrice: 0,
      unitCost: 0,
    };
    if (isEdit) setEditVariants([...editVariants, v]);
    else setAddVariants([...addVariants, v]);
  };
  const updateVariant = (id, field, value, isEdit = false) => {
    const setter = isEdit ? setEditVariants : setAddVariants;
    const list = isEdit ? editVariants : addVariants;
    if (field === "name") {
      setter(
        list.map((v) => {
          if (v.id !== id) return v;
          const updated = { ...v, name: value };
          if (!manualSkuIds.has(id)) {
            const parentSku = isEdit ? editingProduct?.sku : newProduct.sku;
            if (parentSku) updated.sku = generateVariantSku(parentSku, value);
          }
          return updated;
        }),
      );
    } else if (field === "sku") {
      setManualSkuIds((prev) => new Set(prev).add(id));
      setter(list.map((v) => (v.id === id ? { ...v, sku: value } : v)));
    } else {
      setter(list.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
    }
  };
  const removeVariant = (id, isEdit = false) => {
    const setter = isEdit ? setEditVariants : setAddVariants;
    setter((isEdit ? editVariants : addVariants).filter((v) => v.id !== id));
  };

  // ── Image selection handler ──────────────────────────────────────────
  const handleImageSelect = (file) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
      return;
    }
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setProductImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async () => {
    let sku = newProduct.sku;
    if (!sku.trim() && newProduct.name.trim())
      sku = generateSku(newProduct.name);
    if (!validateAddForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      // If an image is selected, build FormData for multipart upload
      // Otherwise send plain JSON (backward compatible)
      let payload;
      if (productImage) {
        const formData = new FormData();
        formData.append("image", productImage);
        formData.append("sku", sku);
        formData.append("name", newProduct.name.trim());
        formData.append("category", newProduct.category || "");
        formData.append("min_stock", String(Number(newProduct.minStock) || 5));
        formData.append("unit_cost", String(Number(newProduct.unitCost) || 0));
        if (addVariants.length > 0) {
          formData.append(
            "variants",
            JSON.stringify(
              addVariants.map((v) => ({
                name: v.name,
                sku: v.sku,
                stock: Number(v.stock) || 0,
                unit_price: Number(v.unitPrice) || 0,
                unit_cost: Number(v.unitCost) || 0,
              })),
            ),
          );
        } else {
          formData.append("stock", String(Number(newProduct.stock)));
          formData.append("unit_price", String(Number(newProduct.unitPrice)));
        }
        payload = formData;
      } else {
        payload = {
          sku,
          name: newProduct.name.trim(),
          category: newProduct.category || null,
          min_stock: Number(newProduct.minStock) || 5,
          unit_cost: Number(newProduct.unitCost) || 0,
        };
        if (addVariants.length > 0)
          payload.variants = addVariants.map((v) => ({
            name: v.name,
            sku: v.sku,
            stock: Number(v.stock) || 0,
            unit_price: Number(v.unitPrice) || 0,
            unit_cost: Number(v.unitCost) || 0,
          }));
        else {
          payload.stock = Number(newProduct.stock);
          payload.unit_price = Number(newProduct.unitPrice);
        }
      }
      await createProductApiHook(payload);
      toast.success("Product added ✅");
      setNewProduct({
        sku: "",
        name: "",
        category: "",
        stock: "",
        minStock: 5,
        unitCost: "",
        unitPrice: "",
      });
      setProductImage(null);
      setImagePreview(null);
      setAddVariants([]);
      setErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdateProduct = async () => {
    if (!validateEditForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        sku: editingProduct.sku,
        name: editingProduct.name.trim(),
        category: editingProduct.category || null,
        min_stock: Number(editingProduct.minStock) || 5,
        unit_cost: Number(editingProduct.unitCost) || 0,
      };
      if (editVariants.length > 0)
        body.variants = editVariants.map((v) => ({
          name: v.name,
          sku: v.sku,
          stock: Number(v.stock) || 0,
          unit_price: Number(v.unitPrice) || 0,
          unit_cost: Number(v.unitCost) || 0,
        }));
      else {
        body.stock = Number(editingProduct.stock);
        body.unit_price = Number(editingProduct.unitPrice);
      }
      await updateProductApiHook(editingProduct.id, body);
      toast.success("Product updated ✏️");
      setEditingProduct(null);
      setEditDialogOpen(false);
      setEditVariants([]);
      setEditErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProductApiHook(id);
      toast.success("Product deleted 🗑️");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete");
      setDeleteConfirm(null);
    }
  };
  const handleBulkDelete = async () => {
    let s = 0,
      f = 0;
    for (const id of selectedIds) {
      try {
        await deleteProductApiHook(id);
        s++;
      } catch {
        f++;
      }
    }
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    if (s > 0) toast.success(`${s} product${s > 1 ? "s" : ""} deleted 🗑️`);
    if (f > 0) toast.error(`${f} product${f > 1 ? "s" : ""} failed`);
    refetch();
  };
  const handleAddCategory = () => {
    const t = newCategoryName.trim();
    if (!t) {
      toast.error("Enter category name");
      return;
    }
    if (categories.includes(t)) {
      toast.error("Category exists");
      return;
    }
    setCategories([...categories, t]);
    setNewCategoryName("");
    toast.success(`"${t}" added ✅`);
  };
  const handleDeleteCategory = (cat) => {
    const usedBy = products.find((p) => getCategoryName(p) === cat);
    if (usedBy) {
      toast.error(`Cannot delete "${cat}" – used by "${usedBy.name}"`);
      return;
    }
    setCategories(categories.filter((c) => c !== cat));
    toast.success(`"${cat}" deleted 🗑️`);
  };
  const handleCSVFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Upload a CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows, errors } = parseCSV(ev.target.result);
      setCsvData(rows);
      setCsvErrors(errors);
    };
    reader.readAsText(file);
  };
  const handleDownloadTemplate = () => {
    const csv =
      "name,sku,category,stock,unitCost,unitPrice,minStock\nLogitech G Pro X,LGC-GPX,Headset,15,1500000,1899000,5";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const handleImportCSV = async () => {
    const errRows = new Set(csvErrors.map((e) => e.row));
    const valid = csvData.filter((_, i) => !errRows.has(i + 1));
    let s = 0,
      f = 0;
    for (const row of valid) {
      try {
        await createProductApiHook({
          sku: row.sku || generateSku(row.name),
          name: row.name,
          category: row.category || "Other",
          stock: Number(row.stock),
          min_stock: Number(row.minStock) || 5,
          unit_cost: Number(row.unitCost) || 0,
          unit_price: Number(row.unitPrice),
        });
        s++;
      } catch {
        f++;
      }
    }
    setImportModalOpen(false);
    setCsvData([]);
    setCsvErrors([]);
    if (s > 0) toast.success(`Imported ${s} product${s > 1 ? "s" : ""} ✅`);
    if (f > 0) toast.error(`${f} product${f > 1 ? "s" : ""} failed`);
    refetch();
  };
  const validRowCount = csvData.length - csvErrors.length;
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) setSelectedIds([]);
    else setSelectedIds(paginatedProducts.map((p) => p.id));
  };
  const toggleSelect = (id) => {
    if (selectedIds.includes(id))
      setSelectedIds(selectedIds.filter((s) => s !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const renderVariantSection = (variants, setVar, isEdit = false) => (
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
          className="text-xs font-semibold text-accent border border-accent/30 px-3.5 py-1.5 rounded-xl hover:bg-accent-light dark:hover:bg-accent/20 cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-sm"
        >
          <Plus size={13} /> Add Variant
        </button>
      </div>
      <div
        className={
          variants.length > 0
            ? "max-h-72 overflow-y-auto overflow-x-hidden space-y-4"
            : ""
        }
      >
        {variants.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border border-[#ececf2] dark:border-gray-700 p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Variant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black / M"
                  value={v.name}
                  onChange={(e) =>
                    updateVariant(v.id, "name", e.target.value, isEdit)
                  }
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                    value={v.sku}
                    onChange={(e) =>
                      updateVariant(v.id, "sku", e.target.value, isEdit)
                    }
                    className="flex-1 rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id, isEdit)}
                    className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(v.id, "stock", e.target.value, isEdit)
                  }
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Unit Price
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={v.unitPrice ? formatPrice(v.unitPrice) : ""}
                  onChange={(e) =>
                    updateVariant(
                      v.id,
                      "unitPrice",
                      parsePriceInput(e.target.value),
                      isEdit,
                    )
                  }
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Unit Cost
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={v.unitCost ? formatPrice(v.unitCost) : ""}
                  onChange={(e) =>
                    updateVariant(
                      v.id,
                      "unitCost",
                      parsePriceInput(e.target.value),
                      isEdit,
                    )
                  }
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>
        ))}
        {variants.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-7 text-center">
            <p className="text-sm text-gray-400">
              No variants yet. Click{" "}
              <span className="text-accent font-semibold">Add Variant</span> to
              create options.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Products
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Manage your product inventory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportProductsPDF(products)}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent dark:border-accent/40 px-5 py-2.5 text-sm font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] hover:-translate-y-0.5"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_-2px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
              <div className="relative">
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold">
                    Add Product
                  </DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-6 pt-4 space-y-4">
                  {/* ── PRODUCT IMAGE UPLOAD ── */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                      PRODUCT IMAGE
                    </label>
                    <div
                      className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                        imagePreview
                          ? "border-accent bg-accent-light/40 dark:bg-accent/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-accent hover:bg-accent-light dark:hover:bg-accent/5"
                      }`}
                      onClick={() => {
                        const input = document.getElementById(
                          "product-image-input",
                        );
                        if (input) input.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add(
                          "border-accent",
                          "bg-accent-light/20",
                        );
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove(
                          "border-accent",
                          "bg-accent-light/20",
                        );
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove(
                          "border-accent",
                          "bg-accent-light/20",
                        );
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                    >
                      <input
                        id="product-image-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect(file);
                        }}
                      />
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="h-32 w-32 rounded-xl object-contain border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const input = document.getElementById(
                                  "product-image-input",
                                );
                                if (input) input.click();
                              }}
                              className="text-xs font-semibold text-accent border border-accent/30 px-3.5 py-1.5 rounded-xl hover:bg-accent-light dark:hover:bg-accent/20 transition-all"
                            >
                              Change Image
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductImage(null);
                                setImagePreview(null);
                              }}
                              className="text-xs font-semibold text-red-500 border border-red-200 px-3.5 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Drop image here or click to upload
                          </span>
                          <span className="text-xs text-gray-400">
                            JPG, JPEG, PNG, WEBP — Max 5MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
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
                          className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              sku: generateSku(newProduct.name),
                            })
                          }
                          disabled={!newProduct.name.trim()}
                          className="shrink-0 text-xs px-2 py-1 border border-accent text-accent rounded-md hover:bg-accent-light disabled:opacity-40"
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
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
                      className={`w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 ${errors.name ? "border-red-300" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">Required</p>
                    )}
                  </div>
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
                        className={`w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 ${errors.stock ? "border-red-300" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${addVariants.length > 0 ? "bg-gray-50" : ""}`}
                      />
                      {errors.stock && (
                        <p className="text-xs text-red-500 mt-1">Required</p>
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                        className={`w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 ${errors.unitPrice ? "border-red-300" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${addVariants.length > 0 ? "bg-gray-50" : ""}`}
                      />
                      {errors.unitPrice && (
                        <p className="text-xs text-red-500 mt-1">Required</p>
                      )}
                    </div>
                  </div>
                  {renderVariantSection(addVariants, setAddVariants, false)}
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
                        setProductImage(null);
                        setImagePreview(null);
                        setAddVariants([]);
                        setErrors({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProduct}
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-60"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      {submitting ? "Saving…" : "Save Product"}
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Total Products
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-light dark:bg-accent/20">
              <Package className="h-4 w-4 text-accent" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {summaryStats.totalProducts}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Low Stock
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summaryStats.lowStock}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Out of Stock
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {summaryStats.outOfStock}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Total Value
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatRp(summaryStats.totalValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Categories
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Grid3X3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summaryStats.categories}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6 pb-0">
          <div className="flex items-center flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-11 pr-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-10 text-sm font-medium text-gray-700 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
              >
                <option>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent text-[10px] font-bold">
                ▼
              </div>
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-10 text-sm font-medium text-gray-700 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
              >
                <option>All Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent text-[10px] font-bold">
                ▼
              </div>
            </div>
            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-10 text-sm font-medium text-gray-700 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
              >
                <option>All Stock</option>
                <option>Available</option>
                <option>Critical</option>
                <option>Empty</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent text-[10px] font-bold">
                ▼
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="relative z-10 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.04)]"
            >
              <RotateCcw className="h-4 w-4" /> Clear
            </button>
            <button className="relative z-10 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/60">
              <Filter className="h-4 w-4" /> More Filters
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-4 py-2 text-sm font-medium text-accent">
              <Package className="h-4 w-4" /> {totalFiltered} product
              {totalFiltered !== 1 ? "s" : ""}
            </span>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-accent-light border border-accent rounded-lg dark:bg-accent/20 dark:border-accent/30 mb-3 mt-4">
              <span className="text-sm text-accent font-medium">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="text-sm text-red-600 dark:text-red-400 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-gray-600 dark:text-gray-300 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
        <div className="p-6">
          {loading ? (
            <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 text-left text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-4 w-10">
                      <div className="h-4 w-4 rounded border border-gray-300" />
                    </th>
                    <th className="px-4 py-4 font-semibold">Product</th>
                    <th className="px-4 py-4 font-semibold">SKU</th>
                    <th className="px-4 py-4 font-semibold text-right">
                      Stock
                    </th>
                    <th className="px-4 py-4 font-semibold text-right">
                      Price
                    </th>
                    <th className="px-4 py-4 font-semibold text-right">
                      Value
                    </th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">
                No products found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search
                  ? "Try a different search term"
                  : "Add your first product"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
              <div style={{ height: "calc(100vh - 320px)", overflowY: "auto" }}>
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 text-left text-sm text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedIds.length === paginatedProducts.length &&
                            paginatedProducts.length > 0
                          }
                          className="rounded border-gray-400 dark:border-gray-500 text-accent focus:ring-accent cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-4 font-semibold">Product</th>
                      <th className="px-4 py-4 font-semibold">SKU</th>
                      <th className="px-4 py-4 font-semibold text-right">
                        Stock
                      </th>
                      <th className="px-4 py-4 font-semibold text-right">
                        Price
                      </th>
                      <th className="px-4 py-4 font-semibold text-right">
                        Value
                      </th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="px-4 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => {
                      const effStock = getEffectiveStock(product);
                      const effPrice = getEffectivePrice(product);
                      const hasVariants =
                        product.variants && product.variants.length > 0;
                      const catName =
                        product.category?.name ?? product.category ?? "";
                      const stockStatusColor =
                        effStock === 0
                          ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                          : effStock <= (Number(product.minStock) || 5)
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
                      const stockStatusLabel =
                        effStock === 0
                          ? "Out of Stock"
                          : effStock <= (Number(product.minStock) || 5)
                            ? "Low Stock"
                            : "In Stock";
                      return (
                        <tr
                          key={product.id}
                          className={`border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedIds.includes(product.id) ? "bg-accent-light dark:bg-gray-700/30" : ""}`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              onChange={() => toggleSelect(product.id)}
                              checked={selectedIds.includes(product.id)}
                              className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getCategoryAvatar(catName)}`}
                              >
                                <Package className="h-5 w-5" />
                              </div>
                              <div>
                                <div
                                  className="font-semibold text-gray-900 dark:text-white text-sm cursor-pointer hover:text-accent transition-colors"
                                  onClick={() =>
                                    navigate(`/products/${product.id}`)
                                  }
                                >
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {catName || "-"}
                                </div>
                              </div>
                            </div>
                            {hasVariants && (
                              <span className="text-xs bg-accent-light dark:bg-accent/20 text-accent px-2 py-0.5 rounded-full ml-1.5">
                                {product.variants.length} var
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-block rounded-lg bg-gray-500/10 border border-gray-400/20 px-2.5 py-1 text-xs font-mono font-medium text-gray-500">
                              {product.sku}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span
                              className={`text-sm font-semibold ${effStock <= (Number(product.minStock) || 5) ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}
                            >
                              {effStock}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            {hasVariants ? (
                              <span className="text-xs text-accent">
                                From {formatRp(effPrice)}
                              </span>
                            ) : (
                              formatRp(effPrice)
                            )}
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                            {formatRp(getProductValue(product))}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${stockStatusColor}`}
                            >
                              {stockStatusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
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
                                      setEditingProduct({
                                        id: product.id,
                                        sku: product.sku,
                                        name: product.name,
                                        category:
                                          product.category?.name ??
                                          product.category ??
                                          "",
                                        stock: getEffectiveStock(product),
                                        minStock: Number(product.minStock) || 5,
                                        unitCost: Number(
                                          product.unit_cost ??
                                            product.unitCost ??
                                            0,
                                        ),
                                        unitPrice: Number(
                                          product.unit_price ??
                                            product.unitPrice ??
                                            0,
                                        ),
                                      });
                                      setEditDialogOpen(true);
                                      setEditErrors({});
                                      setEditVariants(
                                        product.variants
                                          ? [...product.variants]
                                          : [],
                                      );
                                    }}
                                    className="flex items-center gap-1.5 rounded-xl border border-accent bg-gradient-to-r from-violet-50 dark:from-violet-900/20 to-purple-50 dark:to-purple-900/20 px-4 py-2 text-sm font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] hover:-translate-y-0.5"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" /> Edit
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
                                  <div className="relative">
                                    <DialogHeader className="px-6 pt-5 pb-0">
                                      <DialogTitle className="text-xl font-bold">
                                        Edit Product
                                      </DialogTitle>
                                    </DialogHeader>
                                    {editingProduct && (
                                      <div className="px-6 pb-6 pt-4 space-y-4">
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
                                                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setEditingProduct({
                                                    ...editingProduct,
                                                    sku: generateSku(
                                                      editingProduct.name,
                                                    ),
                                                  })
                                                }
                                                disabled={
                                                  !editingProduct.name.trim()
                                                }
                                                className="shrink-0 text-xs px-2 py-1 border border-accent text-accent rounded-md hover:bg-accent-light disabled:opacity-40"
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
                                              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                                            >
                                              {categories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                  {cat}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
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
                                            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 ${editErrors.name ? "border-red-300" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"}`}
                                          />
                                          {editErrors.name && (
                                            <p className="text-xs text-red-500 mt-1">
                                              Required
                                            </p>
                                          )}
                                        </div>
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
                                                });
                                                if (editErrors.stock)
                                                  setEditErrors({
                                                    ...editErrors,
                                                    stock: "",
                                                  });
                                              }}
                                              className={`w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 ${editErrors.stock ? "border-red-300" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${editVariants.length > 0 ? "bg-gray-50" : ""}`}
                                            />
                                            {editErrors.stock && (
                                              <p className="text-xs text-red-500 mt-1">
                                                Required
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
                                              value={
                                                editingProduct.minStock ?? 5
                                              }
                                              onChange={(e) =>
                                                setEditingProduct({
                                                  ...editingProduct,
                                                  minStock: Number(
                                                    e.target.value,
                                                  ),
                                                })
                                              }
                                              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                            />
                                          </div>
                                        </div>
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
                                              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                                              className={`w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 ${editErrors.unitPrice ? "border-red-300" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${editVariants.length > 0 ? "bg-gray-50" : ""}`}
                                            />
                                            {editErrors.unitPrice && (
                                              <p className="text-xs text-red-500 mt-1">
                                                Required
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        {renderVariantSection(
                                          editVariants,
                                          setEditVariants,
                                          true,
                                        )}
                                        <div className="flex gap-3 mt-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditDialogOpen(false);
                                              setEditingProduct(null);
                                              setEditVariants([]);
                                              setEditErrors({});
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={handleUpdateProduct}
                                            disabled={submitting}
                                            className="flex-1 rounded-lg bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-60"
                                            style={{
                                              background:
                                                "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                                            }}
                                          >
                                            {submitting
                                              ? "Saving…"
                                              : "Update Product"}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <button
                                onClick={() => setDeleteConfirm(product)}
                                className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-50 dark:from-red-900/20 to-rose-50 dark:to-rose-900/20 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-300 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.25)] hover:-translate-y-0.5"
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
            </div>
          )}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/40">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-accent"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({totalFiltered} total)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  return p <= totalPages ? (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${p === page ? "bg-accent text-white shadow-sm" : "border border-gray-200 dark:border-gray-700 text-gray-600 hover:border-accent hover:text-accent"}`}
                    >
                      {p}
                    </button>
                  ) : null;
                })}
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Delete Product
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteConfirm.name}</span>?
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm.id)}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3 font-medium text-white shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Delete {selectedIds.length} Products
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBulkDeleteOpen(false)}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3 font-medium text-white shadow-sm"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div
              className="h-1 bg-gradient-to-r rounded-t-3xl -mt-6 -mx-6 mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
              }}
            />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                  }}
                >
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Import from CSV
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Upload a CSV file with product data
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setCsvData([]);
                  setCsvErrors([]);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent mb-4"
            >
              <FileDown className="h-4 w-4" /> Download Template
            </button>
            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4 text-sm text-gray-600">
              <p className="font-semibold mb-1">
                Required: name, sku, category, stock, unitPrice
              </p>
              <p className="text-xs text-gray-400">
                Optional: unitCost, minStock
              </p>
            </div>
            <label className="block border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-accent hover:bg-accent-light mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFile}
                className="hidden"
              />
              {csvData.length > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-accent">
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
            {csvData.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700 mb-4">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 text-left text-gray-500 sticky top-0">
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Stock</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                        <th className="px-4 py-3 font-semibold">Valid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, i) => {
                        const hasErr = csvErrors.some((e) => e.row === i + 1);
                        return (
                          <tr
                            key={i}
                            className={`border-t border-[#ececf2] ${hasErr ? "bg-red-50" : ""}`}
                          >
                            <td className="px-4 py-3 text-gray-900">
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
                              {hasErr ? (
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
            {csvErrors.length > 0 && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-3 mb-4">
                <p className="text-xs font-semibold text-red-700 mb-1">
                  {csvErrors.length} error{csvErrors.length !== 1 ? "s" : ""}
                </p>
                {csvErrors.slice(0, 3).map((err, i) => (
                  <p key={i} className="text-xs text-red-600">
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
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setCsvData([]);
                  setCsvErrors([]);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={validRowCount === 0}
                className={`flex-1 rounded-2xl py-3 font-semibold text-white shadow-sm ${validRowCount > 0 ? "hover:shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                style={
                  validRowCount > 0
                    ? {
                        background:
                          "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                      }
                    : undefined
                }
              >
                Import {validRowCount} Product{validRowCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {manageCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl">
            <div
              className="h-1 bg-gradient-to-r rounded-t-3xl -mt-6 -mx-6 mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
              }}
            />
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Categories
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add or remove product categories
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                onClick={handleAddCategory}
                className="shrink-0 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No categories yet
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 hover:bg-accent-light"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {cat}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setManageCatOpen(false)}
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 hover:bg-gray-100"
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
