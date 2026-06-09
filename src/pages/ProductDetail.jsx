import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { updateProduct } from "@/api/products";
import {
  Package,
  ArrowLeft,
  Edit3,
  Trash2,
  ShoppingCart,
  PlusCircle,
  FileText,
  Activity,
  BarChart3,
  TrendingUp,
  DollarSign,
  Box,
  AlertTriangle,
  Archive,
  Layers,
  Grid3X3,
  ClipboardList,
  RefreshCw,
  Truck,
  Tag,
  Info,
  Hash,
  Printer,
  ChevronDown,
  Image,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import KpiCard from "@/components/product-detail/KpiCard";
import TabNavigation from "@/components/product-detail/TabNavigation";
import useProductDetail from "@/hooks/useProductDetail";

// ── Constants ──────────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "stock-history", label: "Stock History", icon: Activity },
  { key: "sales-history", label: "Sales History", icon: TrendingUp },
  { key: "purchase-history", label: "Purchase History", icon: Truck },
  { key: "inventory-logs", label: "Inventory Logs", icon: ClipboardList },
  { key: "variants", label: "Variants", icon: Layers },
];

const formatRupiah = (num) => {
  if (num == null || isNaN(num)) return "Rp 0";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatNumber = (num) => {
  if (num == null || isNaN(num)) return "0";
  return Number(num).toLocaleString("id-ID");
};

// ══════════════════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════════════════
function StatusBadge({ stock, minStock }) {
  const s = Number(stock ?? 0);
  const m = Number(minStock ?? 5);
  let label, dotColor, bgClass;
  if (s === 0) {
    label = "Out of Stock";
    dotColor = "bg-red-500";
    bgClass =
      "bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400";
  } else if (s <= m) {
    label = "Low Stock";
    dotColor = "bg-amber-500";
    bgClass =
      "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400";
  } else {
    label = "In Stock";
    dotColor = "bg-emerald-500";
    bgClass =
      "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${bgClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════
// INVENTORY VALUE CHART
// ══════════════════════════════════════════════════════════════════════
function InventoryValueChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
        No trend data available
      </div>
    );
  }
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="invValueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v) => formatRupiah(v)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelFormatter={(v) => formatDate(v)}
            formatter={(v) => [formatRupiah(v), "Inventory Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#invValueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// INFO ROW (Key-Value pair for metadata sections)
// ══════════════════════════════════════════════════════════════════════
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#ececf2] dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TABLE COMPONENT
// ══════════════════════════════════════════════════════════════════════
function DataTable({ columns, data, emptyMessage = "No data available" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ececf2] dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  col.align === "right" ? "text-right" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id ?? idx}
              className="border-b border-[#ececf2]/50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-3 ${
                    col.align === "right" ? "text-right" : ""
                  } ${
                    col.bold
                      ? "font-semibold text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {col.render ? col.render(row) : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// LOG TYPE BADGE
// ══════════════════════════════════════════════════════════════════════
function LogTypeBadge({ type }) {
  const t = (type ?? "").toLowerCase();
  let label = type;
  let cls = "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  if (t.includes("in") || t.includes("receive") || t.includes("restock")) {
    label = "Stock In";
    cls =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
  } else if (t.includes("out") || t.includes("sold") || t.includes("sale")) {
    label = "Stock Out";
    cls =
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/30";
  } else if (t.includes("adjust") || t.includes("correction")) {
    label = "Adjustment";
    cls =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PO STATUS BADGE
// ══════════════════════════════════════════════════════════════════════
function PoStatusBadge({ status }) {
  const s = (status ?? "").toLowerCase();
  let cls = "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  if (s === "completed" || s === "received") {
    cls =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
  } else if (s === "pending" || s === "draft") {
    cls =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
  } else if (s === "cancelled") {
    cls =
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/30";
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}
    >
      {status ?? "Unknown"}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ACTIONS DROPDOWN
// ══════════════════════════════════════════════════════════════════════
function ActionsDropdown({ onClose, onAction }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const items = [
    { key: "edit", label: "Edit Product", icon: Edit3 },
    { key: "adjust", label: "Adjust Stock", icon: PlusCircle },
    { key: "po", label: "Create Purchase Order", icon: ShoppingCart },
    { key: "logs", label: "Inventory Logs", icon: FileText },
    { key: "divider", label: "", icon: null },
    { key: "delete", label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-56 rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50 py-1.5"
    >
      {items.map((item) =>
        item.key === "divider" ? (
          <div
            key="divider"
            className="h-px bg-[#ececf2] dark:bg-gray-700 my-1"
          />
        ) : (
          <button
            key={item.key}
            onClick={() => {
              onAction(item.key);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              item.danger
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// THUMBNAIL STRIP (placeholder thumbnails)
// ══════════════════════════════════════════════════════════════════════
function ThumbnailStrip({ product, onSelect, activeIndex, onUpload }) {
  const thumbs = [product.image, null, null]; // up to 3; nulls are placeholder
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onUpload) onUpload(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };
  return (
    <div className="flex gap-2 mt-3">
      <input
        id="gallery-image-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {thumbs.map((src, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all ${
            activeIndex === i
              ? "border-accent ring-1 ring-accent"
              : "border-[#ececf2] dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          {src ? (
            <img
              src={src}
              alt=""
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Image className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )}
        </button>
      ))}
      <button
        onClick={(e) => {
          e.preventDefault();
          const input = document.getElementById("gallery-image-input");
          if (input) input.click();
        }}
        className="w-16 h-16 rounded-xl border-2 border-dashed border-[#ececf2] dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:border-gray-400 hover:text-gray-400 transition-all"
      >
        <PlusCircle className="h-5 w-5" />
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE: ProductDetailV2
// ══════════════════════════════════════════════════════════════════════
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    product,
    loading,
    error,
    salesHistory,
    salesLoading,
    inventoryLogs,
    logsLoading,
    purchaseHistory,
    purchasesLoading,
    inventoryValueTrend,
    refetchProduct,
  } = useProductDetail(id);

  const [activeTab, setActiveTab] = useState("overview");
  const [activeImage, setActiveImage] = useState(0);
  const [showActions, setShowActions] = useState(false);

  // ── Gallery image upload handler ──────────────────────────────────
  const handleGalleryUpload = async (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("_method", "PUT");

      // UpdateProductRequest requires: name (required), unit_price (required), unit_cost (required)
      // Append current values from product to pass validation
      if (product?.name !== undefined) {
        formData.append("name", product.name);
      }
      if (product?.sku !== undefined) {
        formData.append("sku", product.sku ?? "");
      }
      if (product?.unit_price !== undefined) {
        formData.append("unit_price", String(product.unit_price));
      }
      if (product?.unit_cost !== undefined) {
        formData.append("unit_cost", String(product.unit_cost));
      }
      if (product?.stock !== undefined) {
        formData.append("stock", String(product.stock));
      }
      if (product?.min_stock !== undefined) {
        formData.append("min_stock", String(product.min_stock));
      }
      if (product?.category?.id !== undefined) {
        formData.append("category_id", String(product.category.id));
      }
      if (product?.category_id !== undefined) {
        formData.append("category_id", String(product.category_id));
      }

      await updateProduct(id, formData);
      toast.success("Image uploaded ✅");
      // Refetch product data to show new image
      refetchProduct();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  // ── Derived values ─────────────────────────────────────────────────
  const hasVariants = product?.variants && product.variants.length > 0;

  let stock = 0;
  let minStock = 5;
  let unitCost = 0;
  let unitPrice = 0;
  let margin = 0;
  let marginPercent = 0;
  let markupPercent = 0;

  if (hasVariants && product) {
    stock = product.variants.reduce((sum, v) => sum + Number(v.stock), 0);
    minStock = Number(product.min_stock ?? product.minStock) || 5;
  } else if (product) {
    stock = Number(product.stock ?? 0);
    minStock = Number(product.min_stock ?? product.minStock) || 5;
    unitCost = Number(product.unit_cost ?? product.unitCost ?? 0);
    unitPrice = Number(product.unit_price ?? product.unitPrice ?? 0);
    margin = unitPrice - unitCost;
    marginPercent = unitCost > 0 ? (margin / unitCost) * 100 : 0;
    markupPercent =
      unitCost > 0 ? ((unitPrice - unitCost) / unitCost) * 100 : 0;
  }

  // KPI calculations
  const inventoryValue = stock * unitCost;
  const totalSold = salesHistory.reduce((sum, s) => sum + (s.qty ?? 0), 0);
  const totalRevenue = salesHistory.reduce(
    (sum, s) => sum + (s.revenue ?? 0),
    0,
  );
  const totalProfit = salesHistory.reduce((sum, s) => sum + (s.profit ?? 0), 0);
  const avgSellingPrice = totalSold > 0 ? totalRevenue / totalSold : 0;

  // ── Actions handler ────────────────────────────────────────────────
  const handleAction = (key) => {
    switch (key) {
      case "edit":
        navigate(`/products/${id}/edit`);
        break;
      case "adjust":
        navigate("/inventory");
        break;
      case "po":
        // Navigate to purchase orders page with prefill state
        navigate("/purchase-orders", {
          state: {
            openCreatePo: true,
            prefillProduct: {
              id: product.id,
              name: product.name,
              unit_cost: unitCost,
            },
          },
        });
        break;
      case "logs":
        navigate(`/inventory-logs?product_id=${id}`);
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this product?")) {
          navigate("/products");
        }
        break;
    }
  };

  // ── Loading state ─────────────────────────────────────────────────
  if (loading && !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-8">
          <div className="w-[280px]">
            <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not found ─────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 flex items-center gap-2 rounded-2xl border border-[#ececf2] dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // ── Helper to get category/brand/supplier names ────────────────────
  const categoryName =
    product.category?.name || product.category_name || product.category || "—";
  const brandName =
    product.brand?.name || product.brand_name || product.brand || "—";
  const supplierName =
    product.supplier?.name || product.supplier_name || product.supplier || "—";
  const barcodeVal = product.barcode || product.upc || "—";

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════
          TOP BAR — Back button (left) + Print & Actions (right)
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>

        <div className="flex items-center gap-2">
          {/* Print button */}
          <button className="inline-flex items-center gap-2 rounded-xl border border-[#ececf2] dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-sm">
            <Printer className="h-4 w-4" />
            Print
          </button>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ececf2] dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-sm"
            >
              Actions
              <ChevronDown className="h-4 w-4" />
            </button>
            {showActions && (
              <ActionsDropdown
                onClose={() => setShowActions(false)}
                onAction={handleAction}
              />
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HEADER SECTION — 3 columns: Image | Info | Metadata
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex gap-8 items-start">
        {/* ── Col 1: Image Gallery ── */}
        <div className="shrink-0 w-[280px]">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-violet-50 dark:from-violet-900/30 to-purple-50 dark:to-purple-900/30 flex items-center justify-center overflow-hidden border border-[#ececf2] dark:border-gray-700">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <Package className="h-24 w-24 text-accent/60" />
            )}
          </div>
          {/* Thumbnail strip */}
          <ThumbnailStrip
            product={product}
            activeIndex={activeImage}
            onSelect={setActiveImage}
            onUpload={handleGalleryUpload}
          />
        </div>

        {/* ── Col 2: Product Info ── */}
        <div className="flex-1 space-y-5">
          {/* Name & Badges */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">
                {categoryName}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                {product.sku}
              </span>
              <StatusBadge stock={stock} minStock={minStock} />
            </div>
          </div>

          <div className="h-px bg-[#ececf2] dark:bg-gray-700" />

          {/* Pricing Summary — 4 columns */}
          {!hasVariants && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Unit Cost (HPP)
                </p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                  {formatRupiah(unitCost)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Unit Price
                </p>
                <p className="text-2xl font-bold text-accent dark:text-accent">
                  {formatRupiah(unitPrice)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Margin / Unit
                </p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(margin)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Margin %
                </p>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-sm font-semibold">
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Col 3: Metadata ── */}
        <div className="shrink-0 w-[220px] space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">SKU</span>
            <span className="font-mono font-medium text-gray-900 dark:text-white text-right">
              {product.sku}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Barcode</span>
            <span className="font-mono font-medium text-gray-900 dark:text-white text-right">
              {barcodeVal}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Category</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">
              {categoryName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Brand</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">
              {brandName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Supplier</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">
              {supplierName}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          KPI CARDS
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Current Stock"
          value={formatNumber(stock)}
          subtitle="units available"
          icon={Box}
          color="text-purple-600 bg-purple-50 dark:bg-purple-900/30"
        />
        <KpiCard
          title="Min Stock Threshold"
          value={formatNumber(minStock)}
          subtitle="reorder point"
          icon={AlertTriangle}
          color="text-amber-600 bg-amber-50 dark:bg-amber-900/30"
        />
        <KpiCard
          title="Inventory Value"
          value={formatRupiah(inventoryValue)}
          subtitle={`${formatNumber(stock)} × ${formatRupiah(unitCost)}`}
          icon={DollarSign}
          color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
        />
        <KpiCard
          title="Total Sold"
          value={formatNumber(totalSold)}
          subtitle="units sold"
          icon={TrendingUp}
          color="text-blue-600 bg-blue-50 dark:bg-blue-900/30"
        />
        <KpiCard
          title="Total Revenue"
          value={formatRupiah(totalRevenue)}
          subtitle="generated by this product"
          icon={BarChart3}
          color="text-rose-600 bg-rose-50 dark:bg-rose-900/30"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB NAVIGATION
          ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-white dark:bg-gray-800 border border-[#ececf2] dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 pt-4">
          <TabNavigation
            tabs={TABS}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* ══════════════════════════════════════════════════════════
              TAB: OVERVIEW
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Row 1 — 3 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COL 1: Stock Information */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Box className="h-4 w-4 text-accent" />
                    Stock Information
                  </h3>
                  <div className="divide-y divide-[#ececf2] dark:divide-gray-700">
                    <InfoRow
                      label="Current Stock"
                      value={formatNumber(stock)}
                      icon={Box}
                    />
                    <InfoRow
                      label="Available Stock"
                      value={formatNumber(stock)}
                      icon={Box}
                    />
                    <InfoRow label="Reserved Stock" value="0" icon={Archive} />
                    <InfoRow
                      label="Min Stock"
                      value={formatNumber(minStock)}
                      icon={AlertTriangle}
                    />
                    <InfoRow
                      label="Max Stock"
                      value={product.max_stock ?? product.maxStock ?? "—"}
                      icon={Hash}
                    />
                    <InfoRow
                      label="Last Updated"
                      value={
                        product.updated_at
                          ? formatDate(product.updated_at)
                          : "—"
                      }
                      icon={RefreshCw}
                    />
                  </div>
                </div>

                {/* COL 2: Cost & Pricing */}
                {!hasVariants && (
                  <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-accent" />
                      Cost & Pricing
                    </h3>
                    <div className="divide-y divide-[#ececf2] dark:divide-gray-700">
                      <InfoRow
                        label="Unit Cost (HPP)"
                        value={formatRupiah(unitCost)}
                        icon={Tag}
                      />
                      <InfoRow
                        label="Unit Price"
                        value={formatRupiah(unitPrice)}
                        icon={DollarSign}
                      />
                      <InfoRow
                        label="Margin"
                        value={formatRupiah(margin)}
                        icon={TrendingUp}
                      />
                      <InfoRow
                        label="Margin %"
                        value={`${marginPercent.toFixed(1)}%`}
                        icon={BarChart3}
                      />
                      <InfoRow
                        label="Markup %"
                        value={`${markupPercent.toFixed(1)}%`}
                        icon={BarChart3}
                      />
                    </div>
                  </div>
                )}

                {/* COL 3: Inventory Value Trend */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-accent" />
                      Inventory Value Trend
                    </h3>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Last 30 Days
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current Value
                    </p>
                    <span className="text-base font-bold text-accent">
                      {formatRupiah(inventoryValue)}
                    </span>
                  </div>
                  <InventoryValueChart data={inventoryValueTrend} />
                </div>
              </div>

              {/* Row 2 — Sales Performance (span 2 cols) + optional notes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COL 1-2: Sales Performance */}
                <div className="lg:col-span-2 rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Sales Performance
                  </h3>
                  <div className="divide-y divide-[#ececf2] dark:divide-gray-700">
                    <InfoRow
                      label="Quantity Sold"
                      value={formatNumber(totalSold)}
                      icon={Box}
                    />
                    <InfoRow
                      label="Revenue"
                      value={formatRupiah(totalRevenue)}
                      icon={DollarSign}
                    />
                    <InfoRow
                      label="Average Selling Price"
                      value={formatRupiah(avgSellingPrice)}
                      icon={Tag}
                    />
                    <InfoRow
                      label="Total Profit"
                      value={formatRupiah(totalProfit)}
                      icon={TrendingUp}
                    />
                    <InfoRow
                      label="Profit Margin"
                      value={
                        totalRevenue > 0
                          ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`
                          : "0%"
                      }
                      icon={BarChart3}
                    />
                  </div>
                </div>

                {/* COL 3: Notes */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent" />
                    Notes
                  </h3>
                  {product.notes ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {product.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      No notes added
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-accent" />
                  Description & Specifications
                </h3>
                <div className="space-y-3">
                  {product.description ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      No description added
                    </p>
                  )}
                  {product.specifications && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Specifications
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {product.specifications}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: STOCK HISTORY
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "stock-history" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Stock History
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Inventory movement logs for this product
                  </p>
                </div>
              </div>
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "date",
                      label: "Date",
                      render: (r) => formatDate(r.created_at ?? r.date),
                    },
                    {
                      key: "type",
                      label: "Type",
                      render: (r) => <LogTypeBadge type={r.type ?? r.action} />,
                    },
                    {
                      key: "quantity",
                      label: "Quantity",
                      align: "right",
                      render: (r) => formatNumber(r.quantity ?? r.qty),
                    },
                    {
                      key: "before",
                      label: "Before",
                      align: "right",
                      render: (r) => formatNumber(r.before ?? r.stock_before),
                    },
                    {
                      key: "after",
                      label: "After",
                      align: "right",
                      render: (r) => formatNumber(r.after ?? r.stock_after),
                    },
                    {
                      key: "reference",
                      label: "Reference",
                      render: (r) => r.reference ?? r.reference_type ?? "—",
                    },
                  ]}
                  data={inventoryLogs}
                  emptyMessage="No stock history available"
                />
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: SALES HISTORY
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "sales-history" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Sales History
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Transactions where this product was sold
                  </p>
                </div>
              </div>
              {salesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "invoice",
                      label: "Invoice",
                      bold: true,
                      render: (r) => r.invoice,
                    },
                    {
                      key: "date",
                      label: "Date",
                      render: (r) => formatDate(r.date),
                    },
                    {
                      key: "customer",
                      label: "Customer",
                      render: (r) => r.customer,
                    },
                    {
                      key: "qty",
                      label: "Qty",
                      align: "right",
                      render: (r) => formatNumber(r.qty),
                    },
                    {
                      key: "unit_price",
                      label: "Unit Price",
                      align: "right",
                      render: (r) => formatRupiah(r.unit_price),
                    },
                    {
                      key: "revenue",
                      label: "Revenue",
                      align: "right",
                      render: (r) => formatRupiah(r.revenue),
                    },
                    {
                      key: "profit",
                      label: "Profit",
                      align: "right",
                      render: (r) => formatRupiah(r.profit),
                    },
                  ]}
                  data={salesHistory}
                  emptyMessage="No sales history yet"
                />
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: PURCHASE HISTORY
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "purchase-history" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Purchase History
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Purchase orders containing this product
                  </p>
                </div>
              </div>
              {purchasesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "po_number",
                      label: "PO Number",
                      bold: true,
                      render: (r) => `#${r.po_number}`,
                    },
                    {
                      key: "supplier",
                      label: "Supplier",
                      render: (r) => r.supplier,
                    },
                    {
                      key: "po_date",
                      label: "Date",
                      render: (r) => formatDate(r.po_date),
                    },
                    {
                      key: "qty",
                      label: "Qty",
                      align: "right",
                      render: (r) => formatNumber(r.qty),
                    },
                    {
                      key: "unit_cost",
                      label: "Unit Cost",
                      align: "right",
                      render: (r) => formatRupiah(r.unit_cost),
                    },
                    {
                      key: "subtotal",
                      label: "Subtotal",
                      align: "right",
                      render: (r) => formatRupiah(r.subtotal),
                    },
                    {
                      key: "po_status",
                      label: "Status",
                      render: (r) => <PoStatusBadge status={r.po_status} />,
                    },
                  ]}
                  data={purchaseHistory}
                  emptyMessage="No purchase history yet"
                />
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: INVENTORY LOGS
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "inventory-logs" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Inventory Logs
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Detailed inventory changes for this product
                  </p>
                </div>
              </div>
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "date",
                      label: "Date",
                      render: (r) => formatDate(r.created_at ?? r.date),
                    },
                    {
                      key: "type",
                      label: "Type",
                      render: (r) => <LogTypeBadge type={r.type ?? r.action} />,
                    },
                    {
                      key: "quantity",
                      label: "Quantity",
                      align: "right",
                      render: (r) => formatNumber(r.quantity ?? r.qty),
                    },
                    {
                      key: "before",
                      label: "Before",
                      align: "right",
                      render: (r) => formatNumber(r.before ?? r.stock_before),
                    },
                    {
                      key: "after",
                      label: "After",
                      align: "right",
                      render: (r) => formatNumber(r.after ?? r.stock_after),
                    },
                    {
                      key: "reference",
                      label: "Reference",
                      render: (r) => r.reference ?? r.reference_type ?? "—",
                    },
                    {
                      key: "notes",
                      label: "Notes",
                      render: (r) => r.notes ?? r.description ?? "—",
                    },
                  ]}
                  data={inventoryLogs}
                  emptyMessage="No inventory logs available"
                />
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: VARIANTS
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "variants" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Variants
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {hasVariants
                      ? `${product.variants.length} variant(s) available`
                      : "This product has no variants"}
                  </p>
                </div>
              </div>
              {hasVariants ? (
                <DataTable
                  columns={[
                    {
                      key: "name",
                      label: "Variant Name",
                      bold: true,
                      render: (r) => r.name ?? r.variant_name,
                    },
                    { key: "sku", label: "SKU", render: (r) => r.sku ?? "—" },
                    {
                      key: "stock",
                      label: "Stock",
                      align: "right",
                      render: (r) => formatNumber(r.stock),
                    },
                    {
                      key: "unit_cost",
                      label: "Unit Cost",
                      align: "right",
                      render: (r) => formatRupiah(r.unit_cost ?? r.unitCost),
                    },
                    {
                      key: "unit_price",
                      label: "Unit Price",
                      align: "right",
                      render: (r) => formatRupiah(r.unit_price ?? r.unitPrice),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (r) => {
                        const s = Number(r.stock);
                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              s === 0
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/30"
                                : s <= 5
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                            }`}
                          >
                            {s === 0 ? "Out" : s <= 5 ? "Low" : "OK"}
                          </span>
                        );
                      },
                    },
                  ]}
                  data={product.variants}
                  emptyMessage="No variants configured"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                    <Grid3X3 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    This product has no variants
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
