import { useState } from "react";
import { toast } from "sonner";
import { addStockMovement, addRestockLog } from "@/lib/inventoryLogUtils";
import { getSuppliers, addSupplier } from "@/lib/supplierUtils";

import {
  Warehouse,
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react";
import { exportInventoryPDF } from "@/lib/exportUtils";

// ─── Format Rupiah ───────────────────────────────────────────────────────
const formatRupiah = (num) => {
  if (isNaN(num)) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

// ─── Helpers: effective stock for variants ───────────────────────────────
function getEffectiveStock(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }
  return Number(product.stock);
}

function getEffectiveStockValue(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, v) =>
        sum +
        Number(v.stock || 0) * Number(v.unitCost || product.unitCost || 0),
      0,
    );
  }
  return Number(product.stock) * Number(product.unitCost);
}

function getEffectiveCost(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0]?.unitCost || product.unitCost || 0;
  }
  return Number(product.unitCost);
}

// ─── Stat Card Component ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div className="rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-400 tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [restockProduct, setRestockProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  // ─── Restock State ──────────────────────────────────────────────────────
  const [restockQty, setRestockQty] = useState(1);
  const [restockSupplierId, setRestockSupplierId] = useState("");
  const [restockNotes, setRestockNotes] = useState("");
  // New supplier quick-add
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [suppliers, setSuppliers] = useState(() => getSuppliers());
  // Variant-specific restock
  const [restockVariant, setRestockVariant] = useState(null);
  const [restockVariantQty, setRestockVariantQty] = useState(1);

  // ─── Adjust Stock State ─────────────────────────────────────────────────
  const [newStockAmount, setNewStockAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Correction");
  const [adjustNotes, setAdjustNotes] = useState("");
  // Variant-specific adjust
  const [adjustVariant, setAdjustVariant] = useState(null);
  const [adjustVariantStock, setAdjustVariantStock] = useState(0);

  // ─── Helper Functions ───────────────────────────────────────────────────
  const getStockStatus = (s, minStock = 5) => {
    if (s === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-500/15 border border-red-500/30 text-red-300",
      };
    if (s <= minStock)
      return {
        label: "Low Stock",
        color: "bg-amber-500/15 border border-amber-500/30 text-amber-300",
      };
    return {
      label: "In Stock",
      color: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
    };
  };

  // ─── Calculate Stats ────────────────────────────────────────────────────
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => {
    if (p.variants && p.variants.length > 0) {
      return (
        sum +
        p.variants.reduce(
          (s, v) =>
            s + Number(v.stock || 0) * Number(v.unitCost || p.unitCost || 0),
          0,
        )
      );
    }
    return sum + Number(p.stock) * Number(p.unitCost);
  }, 0);
  const lowStockItems = products.filter((p) => {
    const stock = getEffectiveStock(p);
    return stock > 0 && stock <= (p.minStock || 5);
  }).length;
  const outOfStock = products.filter((p) => getEffectiveStock(p) === 0).length;

  // ─── Get Unique Categories ──────────────────────────────────────────────
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // ─── Toggle Expand ──────────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Quick-add supplier ────────────────────────────────────────────────
  const handleQuickAddSupplier = () => {
    if (!newSupplierName.trim()) {
      toast.error("Nama supplier harus diisi");
      return;
    }
    const created = addSupplier({
      name: newSupplierName.trim(),
      phone: newSupplierPhone.trim(),
    });
    if (created) {
      setSuppliers(getSuppliers());
      setRestockSupplierId(created.id);
      setShowNewSupplier(false);
      setNewSupplierName("");
      setNewSupplierPhone("");
      toast.success(`Supplier "${created.name}" berhasil ditambahkan`);
    }
  };

  // ─── Restock Handler ────────────────────────────────────────────────────
  const handleRestock = () => {
    if (!restockQty || restockQty < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    // Determine supplier name
    let supplierName = null;
    if (restockSupplierId) {
      const found = suppliers.find((s) => s.id === restockSupplierId);
      supplierName = found ? found.name : null;
    }

    const updated = products.map((p) => {
      if (p.id === restockProduct.id) {
        if (restockVariant) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id === restockVariant.id) {
              return {
                ...v,
                stock: Number(v.stock || 0) + Number(restockVariantQty),
              };
            }
            return v;
          });
          const newStock = updatedVariants.reduce(
            (sum, v) => sum + Number(v.stock || 0),
            0,
          );
          return {
            ...p,
            variants: updatedVariants,
            stock: newStock,
            status: getStockStatus(newStock, p.minStock || 5).label,
          };
        } else {
          const newStock = Number(p.stock) + Number(restockQty);
          return {
            ...p,
            stock: newStock,
            status: getStockStatus(newStock, p.minStock || 5).label,
          };
        }
      }
      return p;
    });

    addRestockLog({
      productId: restockProduct.id,
      productName: restockProduct.name,
      variantId: restockVariant?.id || null,
      variantName: restockVariant?.name || null,
      supplierId: restockSupplierId || null,
      supplierName,
      qty: restockVariant ? restockVariantQty : restockQty,
      buyPrice: restockVariant
        ? Number(restockVariant.unitCost || restockProduct.unitCost || 0)
        : Number(restockProduct.unitCost || 0),
      note: restockNotes || "",
    });

    addStockMovement({
      productId: restockProduct.id,
      productName: restockProduct.name,
      variantId: restockVariant?.id || null,
      variantName: restockVariant?.name || null,
      type: "restock",
      qty: restockVariant ? Number(restockVariantQty) : Number(restockQty),
      stockBefore: restockVariant
        ? Number(restockVariant.stock || 0)
        : Number(restockProduct.stock || 0),
      stockAfter: restockVariant
        ? Number(restockVariant.stock || 0) + Number(restockVariantQty)
        : Number(restockProduct.stock || 0) + Number(restockQty),
      note: restockNotes || "",
    });

    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setRestockProduct(null);
    setRestockVariant(null);
    setRestockQty(1);
    setRestockVariantQty(1);
    setRestockSupplierId("");
    setShowNewSupplier(false);
    setNewSupplierName("");
    setNewSupplierPhone("");
    setRestockNotes("");
    toast.success("Stock updated successfully ✅");
  };

  // ─── Adjust Stock Handler ───────────────────────────────────────────────
  const handleAdjustStock = () => {
    if (newStockAmount < 0 && !adjustVariant) {
      toast.error("Stock amount cannot be negative");
      return;
    }

    const updated = products.map((p) => {
      if (p.id === adjustProduct.id) {
        if (adjustVariant) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id === adjustVariant.id) {
              return { ...v, stock: Math.max(0, Number(adjustVariantStock)) };
            }
            return v;
          });
          const newStock = updatedVariants.reduce(
            (sum, v) => sum + Number(v.stock || 0),
            0,
          );
          return {
            ...p,
            variants: updatedVariants,
            stock: newStock,
            status: getStockStatus(newStock, p.minStock || 5).label,
          };
        } else {
          return {
            ...p,
            stock: newStockAmount,
            status: getStockStatus(newStockAmount, p.minStock || 5).label,
          };
        }
      }
      return p;
    });

    const stockBefore = adjustVariant
      ? Number(adjustVariant.stock || 0)
      : Number(adjustProduct.stock || 0);
    const stockAfter = adjustVariant
      ? Math.max(0, Number(adjustVariantStock))
      : Number(newStockAmount);
    const qtyDiff = stockAfter - stockBefore;

    if (qtyDiff !== 0) {
      addStockMovement({
        productId: adjustProduct.id,
        productName: adjustProduct.name,
        variantId: adjustVariant?.id || null,
        variantName: adjustVariant?.name || null,
        type: "adjustment",
        qty: qtyDiff,
        stockBefore,
        stockAfter,
        refId: null,
        note: adjustNotes || adjustReason || "",
      });
    }

    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setAdjustProduct(null);
    setAdjustVariant(null);
    setNewStockAmount(0);
    setAdjustVariantStock(0);
    setAdjustReason("Correction");
    setAdjustNotes("");
    toast.success(`Stock adjusted (${adjustReason}) ✅`);
  };

  // ─── Search & Filter ────────────────────────────────────────────────────
  const filteredProducts = products.filter((product) => {
    const effStock = getEffectiveStock(product);
    const matchSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      getStockStatus(effStock, product.minStock || 5).label === statusFilter;

    const matchCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Inventory
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Manage your stock levels
            </p>
          </div>
        </div>

        <button
          onClick={() => exportInventoryPDF(products)}
          className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 dark:hover:bg-accent/30 text-sm"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* ══════════════ Summary Cards ═════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={totalProducts}
          iconBg="bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Stock Value"
          value={formatRupiah(totalStockValue)}
          iconBg="bg-accent-light dark:bg-accent/20 border border-accent/30"
          iconColor="text-accent dark:text-accent"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={lowStockItems}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={outOfStock}
          iconBg="bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30"
          iconColor="text-red-600 dark:text-red-400"
        />
      </div>

      {/* ══════════════ Search & Filter Bar ════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-400">
          Showing {filteredProducts.length} of {totalProducts} products
        </p>
      </div>

      {/* ══════════════ Inventory Table ═══════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700 shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
              <Package className="h-7 w-7 text-gray-400 dark:text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              No products found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-gray-500 dark:text-gray-400">
                <th className="px-3 py-3 w-8"></th>
                <th className="px-3 py-3 text-[12px] font-medium uppercase tracking-wider text-gray-400">
                  Product
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[100px]">
                  SKU
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[110px]">
                  Category
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[120px]">
                  Stock
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[90px]">
                  Min
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[120px]">
                  Unit Cost
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[130px]">
                  Stock Value
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[90px]">
                  Status
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 w-[140px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const effStock = getEffectiveStock(product);
                const hasVariants =
                  product.variants && product.variants.length > 0;
                const status = getStockStatus(effStock, product.minStock || 5);
                const effCost = getEffectiveCost(product);
                const stockValue = getEffectiveStockValue(product);
                const isExpanded = expandedProducts.has(product.id);
                const barWidth = Math.min((effStock / 30) * 100, 100);
                const barColor =
                  effStock === 0
                    ? "bg-red-400"
                    : effStock <= (product.minStock || 5)
                      ? "bg-yellow-400"
                      : "bg-green-400";

                return (
                  <>
                    <tr
                      key={product.id}
                      className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]"
                    >
                      <td className="px-3 py-3">
                        {hasVariants && (
                          <button
                            onClick={() => toggleExpand(product.id)}
                            className="text-gray-400 dark:text-gray-400 hover:text-accent cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-xs font-bold text-accent flex-shrink-0">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 dark:text-white text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.category}
                              {hasVariants && (
                                <span className="ml-1.5 text-accent dark:text-accent">
                                  ({product.variants.length} variants)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 w-[100px]">
                        <span className="inline-block rounded-full bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          {product.sku}
                        </span>
                      </td>

                      <td className="px-3 py-3 w-[110px]">
                        <p className="text-[13px] text-gray-600 dark:text-gray-300 truncate">
                          {product.category}
                        </p>
                      </td>

                      <td className="px-3 py-3 w-[120px]">
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
                            {effStock} units
                          </p>
                          <div className="mt-1.5 h-1.5 w-full max-w-[80px] rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-300`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 w-[90px]">
                        <p className="text-[13px] text-gray-600 dark:text-gray-300">
                          {product.minStock || 5}
                        </p>
                      </td>

                      <td className="px-3 py-3 w-[120px] whitespace-nowrap font-semibold text-gray-900 dark:text-white text-[13px]">
                        {formatRupiah(effCost)}
                      </td>

                      <td className="px-3 py-3 w-[130px] whitespace-nowrap font-semibold text-gray-900 dark:text-white text-[13px]">
                        {formatRupiah(stockValue)}
                      </td>

                      <td className="px-3 py-3 w-[90px]">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-3 py-3 w-[140px] text-center align-middle whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setRestockProduct(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-accent px-2.5 py-1.5 text-xs font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.12)] hover:-translate-y-0.5"
                          >
                            <Package className="h-3 w-3" />
                            Restock
                          </button>
                          <button
                            onClick={() => {
                              setAdjustProduct(product);
                              setNewStockAmount(effStock);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>

                    {hasVariants && isExpanded && (
                      <tr key={`variants-${product.id}`}>
                        <td colSpan={10} className="px-6 py-0 bg-accent-light/50">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="text-left text-xs text-gray-400 dark:text-gray-400">
                                <th className="py-2 pl-10 font-medium">
                                  Variant
                                </th>
                                <th className="py-2 font-medium">SKU</th>
                                <th className="py-2 font-medium">Stock</th>
                                <th className="py-2 font-medium">Price</th>
                                <th className="py-2 font-medium">Status</th>
                                <th className="py-2 font-medium text-center">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.variants.map((variant) => {
                                const vStatus = getStockStatus(
                                  Number(variant.stock),
                                  product.minStock || 5,
                                );
                                return (
                                  <tr
                                    key={variant.id}
                                    className="border-t border-accent/30 transition-colors hover:bg-accent-light dark:hover:bg-accent/20"
                                  >
                                    <td className="py-2.5 pl-10">
                                      <span className="text-sm font-medium text-gray-800">
                                        {variant.name}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        {variant.sku || product.sku}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {variant.stock}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="text-sm text-accent font-medium">
                                        {formatRupiah(
                                          variant.unitPrice ||
                                            product.unitPrice,
                                        )}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${vStatus.color}`}
                                      >
                                        {vStatus.label}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-center">
                                      <div className="flex justify-center gap-1.5">
                                        <button
                                          onClick={() => {
                                            setRestockProduct(product);
                                            setRestockVariant(variant);
                                            setRestockVariantQty(1);
                                          }}
                                          className="text-xs text-accent border border-accent px-2 py-0.5 rounded-md hover:bg-accent-light dark:hover:bg-accent/30 cursor-pointer"
                                        >
                                          Restock
                                        </button>
                                        <button
                                          onClick={() => {
                                            setAdjustProduct(product);
                                            setAdjustVariant(variant);
                                            setAdjustVariantStock(
                                              Number(variant.stock),
                                            );
                                          }}
                                          className="text-xs text-gray-600 dark:text-gray-300 border border-gray-200 px-2 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_12px_-2px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-200"
                                        >
                                          Adjust
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ══════════════ Restock Modal ═════════════════════════════════════ */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="h-1 bg-gradient-to-r  rounded-t-3xl -mt-6 -mx-6 mb-6" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))"}} />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Restock Product
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {restockProduct.name}
                  {restockVariant && (
                    <span className="text-accent">
                      {" "}
                      — {restockVariant.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {restockVariant
                    ? `${restockVariant.stock} units`
                    : `${getEffectiveStock(restockProduct)} units`}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Add Stock
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockVariant ? restockVariantQty : restockQty}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    if (restockVariant) setRestockVariantQty(val);
                    else setRestockQty(val);
                  }}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Supplier (Optional)
                </label>
                <select
                  value={showNewSupplier ? "__new__" : restockSupplierId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__new__") {
                      setShowNewSupplier(true);
                      setRestockSupplierId("");
                    } else {
                      setShowNewSupplier(false);
                      setRestockSupplierId(val);
                    }
                  }}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  <option value="">Pilih supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                  <option value="__new__">+ Tambah supplier baru</option>
                </select>

                {showNewSupplier && (
                  <div className="mt-3 p-3 rounded-2xl border border-accent bg-violet-50/40 space-y-3">
                    <p className="text-xs font-semibold text-accent dark:text-accent">
                      Tambah Supplier Baru
                    </p>
                    <input
                      type="text"
                      placeholder="Nama supplier *"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                    <input
                      type="text"
                      placeholder="Nomor telepon (opsional)"
                      value={newSupplierPhone}
                      onChange={(e) => setNewSupplierPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleQuickAddSupplier}
                        className="flex-1 rounded-xl bg-gradient-to-r py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
                      >
                        Simpan Supplier
                      </button>
                      <button
                        onClick={() => {
                          setShowNewSupplier(false);
                          setNewSupplierName("");
                          setNewSupplierPhone("");
                        }}
                        className="rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add notes about this restock..."
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  rows="3"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRestockProduct(null);
                  setRestockVariant(null);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="flex-1 rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Adjust Stock Modal ════════════════════════════════ */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="h-1 bg-gradient-to-r  rounded-t-3xl -mt-6 -mx-6 mb-6" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))"}} />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                <ArrowUpDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Adjust Stock
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {adjustProduct.name}
                  {adjustVariant && (
                    <span className="text-accent">
                      {" "}
                      — {adjustVariant.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {adjustVariant
                    ? `${adjustVariant.stock} units`
                    : `${getEffectiveStock(adjustProduct)} units`}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  New Stock Amount
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustVariant ? adjustVariantStock : newStockAmount}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    if (adjustVariant) setAdjustVariantStock(val);
                    else setNewStockAmount(val);
                  }}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  <option value="Correction">Correction</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Notes
                </label>
                <textarea
                  placeholder="Add notes about this adjustment..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  rows="3"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAdjustProduct(null);
                  setAdjustVariant(null);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="flex-1 rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
