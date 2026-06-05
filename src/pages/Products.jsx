import { useEffect, useState, useRef } from "react";
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
    return product.variants[0].unit_price ?? product.variants[0].unitPrice ?? 0;
  }
  return product.unit_price ?? product.unitPrice ?? 0;
}

// ─── Table Row Skeleton ──────────────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <tr className="border-t border-[#ececf2] dark:border-gray-700/60 animate-pulse">
      <td className="px-4 py-4">
        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
      </td>
    </tr>
  );
}

export default function Products() {
  const navigate = useNavigate();

  // ── Product hook ──────────────────────────────────────────────────
  const {
    data: products,
    loading,
    meta,
    refetch,
    create: createProductApiHook,
    update: updateProductApiHook,
    remove: deleteProductApiHook,
  } = useProducts();
  const [submitting, setSubmitting] = useState(false);

  // ── Local filter/UI state ───────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const debounceRef = useRef(null);

  // Derived pagination from hook meta
  const lastPage = meta.last_page;
  const total = meta.total;

  void meta.current_page; // consumed by refetch

  // ── UI state (unchanged from original) ──────────────────────────────
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // ─── Import CSV State ──────────────────────────────────────────────────
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);

  // ─── Variants State ────────────────────────────────────────────────────
  const [addVariants, setAddVariants] = useState([]);
  const [editVariants, setEditVariants] = useState([]);
  const [manualSkuIds, setManualSkuIds] = useState(() => new Set());

  // ─── Persist categories ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("swiftpos_categories", JSON.stringify(categories));
  }, [categories]);

  // ─── Page/filter change → re-fetch ───────────────────────────────────
  useEffect(() => {
    refetch({ page, category: categoryFilter });
  }, [page, categoryFilter, refetch]);

  // ─── Debounced search ────────────────────────────────────────────────
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

  // ── Format helpers ────────────────────────────────────────────────────
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
        color: "bg-red-500/15 text-red-300 border border-red-500/30",
      };
    if (stock <= minStock)
      return {
        label: "Low Stock",
        color: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
      };
    return {
      label: "In Stock",
      color: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
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

  // ─── CRUD: Create ─────────────────────────────────────────────────────
  const handleAddProduct = async () => {
    let sku = newProduct.sku;
    if (!sku.trim() && newProduct.name.trim()) {
      sku = generateSku(newProduct.name);
    }

    const payload = { ...newProduct, sku };

    if (!validateAddForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        sku: payload.sku,
        name: payload.name.trim(),
        category: payload.category || null,
        min_stock: Number(payload.minStock) || 5,
        unit_cost: Number(payload.unitCost) || 0,
        variants:
          addVariants.length > 0
            ? addVariants.map((v) => ({
                name: v.name,
                sku: v.sku,
                stock: Number(v.stock) || 0,
                unit_price: Number(v.unitPrice) || 0,
                unit_cost: Number(v.unitCost) || 0,
              }))
            : undefined,
      };

      // If no variants, send flat stock/price
      if (addVariants.length === 0) {
        body.stock = Number(payload.stock);
        body.unit_price = Number(payload.unitPrice);
      }

      await createProductApiHook(body);
      toast.success("Product added successfully ✅");
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
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── CRUD: Update ─────────────────────────────────────────────────────
  const handleUpdateProduct = async () => {
    if (!validateEditForm()) {
      toast.error("Please fill in all required fields");
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

      const hasVariants = editVariants.length > 0;
      if (hasVariants) {
        body.variants = editVariants.map((v) => ({
          name: v.name,
          sku: v.sku,
          stock: Number(v.stock) || 0,
          unit_price: Number(v.unitPrice) || 0,
          unit_cost: Number(v.unitCost) || 0,
        }));
      } else {
        body.stock = Number(editingProduct.stock);
        body.unit_price = Number(editingProduct.unitPrice);
      }

      await updateProductApiHook(editingProduct.id, body);
      toast.success("Product updated successfully ✏️");
      setEditingProduct(null);
      setEditDialogOpen(false);
      setEditVariants([]);
      setEditErrors({});
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── CRUD: Delete ─────────────────────────────────────────────────────
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProductApiHook(id);
      toast.success("Product deleted successfully 🗑️");
      setDeleteConfirm(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete product";
      toast.error(msg);
      setDeleteConfirm(null);
    }
  };

  // ─── Bulk delete (calls individual delete for each) ──────────────────
  const handleBulkDelete = async () => {
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await deleteProductApiHook(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedIds([]);
    setBulkDeleteOpen(false);

    if (successCount > 0) {
      toast.success(
        `${successCount} product${successCount > 1 ? "s" : ""} deleted successfully 🗑️`,
      );
    }
    if (failCount > 0) {
      toast.error(
        `${failCount} product${failCount > 1 ? "s" : ""} failed to delete`,
      );
    }

    refetch();
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
    const usedBy = products.find((p) => (p.category?.name ?? p.category) === catToDelete);
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

  const handleImportCSV = async () => {
    const errorRowNums = new Set(csvErrors.map((e) => e.row));
    const validRows = csvData.filter((_, idx) => !errorRowNums.has(idx + 1));

    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        const minStock = Number(row.minStock) || 5;
        await createProductApiHook({
          sku: row.sku || generateSku(row.name),
          name: row.name,
          category: row.category || "Other",
          stock: Number(row.stock),
          min_stock: minStock,
          unit_cost: Number(row.unitCost) || 0,
          unit_price: Number(row.unitPrice),
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setImportModalOpen(false);
    setCsvData([]);
    setCsvErrors([]);

    if (successCount > 0) {
      toast.success(
        `Imported ${successCount} product${successCount > 1 ? "s" : ""} successfully ✅`,
      );
    }
    if (failCount > 0) {
      toast.error(
        `${failCount} product${failCount > 1 ? "s" : ""} failed to import`,
      );
    }

    refetch();
  };

  const validRowCount = csvData.length - csvErrors.length;

  // ─── Bulk Actions ────────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // ─── Variants UI helper ──────────────────────────────────────────────
  const renderVariantSection = (variants, setVariants, isEdit = false) => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Variants{" "}
            <span className="text-gray-300 font-normal">(Optional)</span>
          </label>
          {variants.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-400 ml-2">
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => addVariant(isEdit)}
          className="text-xs font-semibold text-accent border border-purple-200 px-3.5 py-1.5 rounded-xl hover:bg-accent-light dark:hover:bg-accent/20 cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-sm"
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
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="rounded-xl border border-[#ececf2] dark:border-gray-700 p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                  Variant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black / M"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value, isEdit)
                  }
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                    className="flex-1 rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id, isEdit)}
                    className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl text-red-400 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Remove variant"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                  className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>
        ))}
        {variants.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-7 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-400">
              No variants yet. Click{" "}
              <span className="text-accent font-semibold">Add Variant</span> to
              create product options like size or color.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
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
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportProductsPDF(products)}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent dark:border-accent/40 px-5 py-2.5 text-sm font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
          >
            <Upload className="h-4 w-4" />
            Import CSV
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
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </DialogTrigger>

            <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
              <div className="relative">
                <div
                  className="h-1 bg-gradient-to-r "
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
                  }}
                />
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Add Product
                  </DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-6 pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                          className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const sku = generateSku(newProduct.name);
                            setNewProduct({ ...newProduct, sku });
                          }}
                          disabled={!newProduct.name.trim()}
                          className="shrink-0 text-xs px-2 py-1 border border-accent text-accent rounded-md hover:bg-accent-light dark:hover:bg-accent/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
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

                  {/* Row 2: Product Name */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                      className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        This field is required
                      </p>
                    )}
                  </div>

                  {/* Row 3: Stock | Min Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${errors.stock ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${addVariants.length > 0 ? "bg-gray-50 text-gray-400 dark:text-gray-400" : ""}`}
                      />
                      {errors.stock && (
                        <p className="text-xs text-red-500 mt-1">
                          This field is required
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                        Low stock alert threshold
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Unit Cost | Unit Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                        className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${errors.unitPrice ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${addVariants.length > 0 ? "bg-gray-50 text-gray-400 dark:text-gray-400" : ""}`}
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
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProduct}
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
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

      {/* ══════════════ Table Card ════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-11 pr-4 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-3 pr-12 text-sm font-medium text-gray-700 dark:text-white outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer"
              >
                <option>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-violet-500/15 border border-violet-500/30 px-1.5 py-1">
                <span className="text-accent text-[10px] font-bold">▼</span>
              </div>
            </div>

            <button
              onClick={() => setManageCatOpen(true)}
              className="relative z-10 flex items-center gap-1.5 rounded-2xl border border-accent dark:border-accent/40 px-4 py-3 text-sm font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
            >
              <Settings2 className="h-4 w-4" />
              Manage Categories
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 dark:bg-violet-500/15 border border-violet-500/30 dark:border-violet-500/30 px-4 py-2 text-sm font-medium text-accent dark:text-accent">
              <Package className="h-4 w-4" />
              {total} product{total !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-accent-light border border-accent rounded-lg dark:bg-accent/20 dark:border-accent/30 mb-3 mt-4">
              <span className="text-sm text-accent dark:text-accent font-medium">
                {selectedIds.length} products selected
              </span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="text-sm text-red-600 dark:text-red-400 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-gray-600 dark:text-gray-300 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-200"
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
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <Package className="h-8 w-8 text-gray-400 dark:text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                No products found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search
                  ? "Try a different search term"
                  : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 text-left text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedIds.length === products.length &&
                          products.length > 0
                        }
                        className="rounded border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-600 text-accent dark:text-accent focus:ring-accent cursor-pointer"
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
                  {products.map((product) => {
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
                        className={`border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-accent-light dark:hover:bg-gray-700/50 ${selectedIds.includes(product.id) ? "bg-accent-light dark:bg-gray-700/30" : ""}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            onChange={() => toggleSelect(product.id)}
                            checked={selectedIds.includes(product.id)}
                            className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-accent">
                              {product.name.charAt(0)}
                            </div>
                            <div>
                              <span
                                onClick={() =>
                                  navigate(`/products/${product.id}`)
                                }
                                className="font-semibold text-gray-900 dark:text-white hover:text-accent cursor-pointer transition-colors"
                              >
                                {product.name}
                              </span>
                              {hasVariants && (
                                <span className="text-xs bg-accent-light dark:bg-accent/20 text-accent px-2 py-0.5 rounded-full ml-2">
                                  {product.variants.length} variants
                                </span>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-400">
                                {product.category?.name ?? product.category ?? "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${effStock === 0 ? "bg-red-400" : effStock <= (Number(product.minStock) || 5) ? "bg-yellow-400" : "bg-green-400"}`}
                                style={{
                                  width: `${Math.min((effStock / 30) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {effStock}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          Rp{" "}
                          {(Number(product.unit_cost ?? product.unitCost) || 0).toLocaleString(
                            "id-ID",
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {hasVariants ? (
                            <span className="text-xs text-accent font-medium">
                              From{" "}
                              {effPrice
                                ? "Rp " +
                                  Number(effPrice).toLocaleString("id-ID")
                                : "—"}
                            </span>
                          ) : (
                            "Rp " +
                            (Number(product.unit_price ?? product.unitPrice) || 0).toLocaleString("id-ID")
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
                                  className="relative z-10 flex items-center gap-1.5 rounded-xl border border-accent bg-gradient-to-r from-violet-50 dark:from-violet-900/20 to-purple-50 dark:to-purple-900/20 px-4 py-2 text-sm font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
                                >
                                  <Edit3 className="h-3.5 w-3.5" /> Edit
                                </button>
                              </DialogTrigger>
                              <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
                                <div className="relative">
                                  <div
                                    className="h-1 bg-gradient-to-r "
                                    style={{
                                      background:
                                        "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
                                    }}
                                  />
                                  <DialogHeader className="px-6 pt-5 pb-0">
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                      Edit Product
                                    </DialogTitle>
                                  </DialogHeader>
                                  {editingProduct && (
                                    <div className="px-6 pb-6 pt-4 space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                                              className="shrink-0 text-xs px-2 py-1 border border-accent text-accent rounded-md hover:bg-accent-light dark:hover:bg-accent/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                              Generate
                                            </button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                            className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
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
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                          className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${editErrors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"}`}
                                        />
                                        {editErrors.name && (
                                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                            This field is required
                                          </p>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                            className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${editErrors.stock ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${editVariants.length > 0 ? "bg-gray-50 text-gray-400 dark:text-gray-400" : ""}`}
                                          />
                                          {editErrors.stock && (
                                            <p className="text-xs text-red-500 mt-1">
                                              This field is required
                                            </p>
                                          )}
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                              })
                                            }
                                            className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                                          />
                                          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                                            Low stock alert threshold
                                          </p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                            className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
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
                                            className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all focus:ring-2 ${editErrors.unitPrice ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[#ececf2] dark:border-gray-700 focus:border-accent focus:ring-accent/20"} ${editVariants.length > 0 ? "bg-gray-50 text-gray-400 dark:text-gray-400" : ""}`}
                                          />
                                          {editErrors.unitPrice && (
                                            <p className="text-xs text-red-500 mt-1">
                                              This field is required
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
                                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-200"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={handleUpdateProduct}
                                          disabled={submitting}
                                          className="flex-1 rounded-lg bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
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
                              className="relative z-10 flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-50 dark:from-red-900/20 to-rose-50 dark:to-rose-900/20 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-300 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.15)] hover:-translate-y-0.5"
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

          {/* ─── Pagination ──────────────────────────────────────────── */}
          {!loading && lastPage > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/40">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {lastPage} ({total} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ Delete Confirm Modal ════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Delete Product
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
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
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Delete {selectedIds.length} Products
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBulkDeleteOpen(false)}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
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
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto">
            <div
              className="h-1 bg-gradient-to-r  rounded-t-3xl -mt-6 -mx-6 mb-6"
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
                    Import Products from CSV
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
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
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent dark:text-accent mb-4"
            >
              <FileDown className="h-4 w-4" /> Download CSV Template
            </button>
            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-700 mb-1">
                Required: name, sku, category, stock, unitPrice
              </p>
              <p className="text-xs text-gray-400">
                Optional: unitCost, minStock (default: 5)
              </p>
            </div>
            <label className="block border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-colors mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFile}
                className="hidden"
              />
              {csvData.length > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-accent dark:text-accent" />
                  <span className="text-sm font-medium text-accent dark:text-accent">
                    {csvData.length} rows found
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
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
                            className={`border-t border-[#ececf2] dark:border-gray-700/60 ${hasError ? "bg-red-50" : ""}`}
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                              {row.name || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono">
                              {row.sku || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              {row.category || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {row.stock || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {row.unitPrice || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {hasError ? (
                                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                  Invalid
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  ✓ Valid
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {csvData.length > 5 && (
                        <tr className="border-t border-[#ececf2] dark:border-gray-700/60">
                          <td
                            colSpan={6}
                            className="px-4 py-3 text-center text-sm text-gray-400 dark:text-gray-400"
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
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
                  {csvErrors.length} row{csvErrors.length !== 1 ? "s" : ""} with
                  errors
                </p>
                {csvErrors.slice(0, 3).map((err, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
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
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={validRowCount === 0}
                className={`flex-1 rounded-2xl py-3 font-semibold text-white shadow-sm transition-all ${validRowCount > 0 ? "hover:shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                style={validRowCount > 0 ? { background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" } : undefined}
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
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div
              className="h-1 bg-gradient-to-r  rounded-t-3xl -mt-6 -mx-6 mb-6"
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
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
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
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                onClick={handleAddCategory}
                className="shrink-0 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
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
                <p className="text-sm text-gray-400 dark:text-gray-400 text-center py-4">
                  No categories yet
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 transition-all hover:bg-accent-light dark:hover:bg-gray-700/50"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {cat}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
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
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
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
