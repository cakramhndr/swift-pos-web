import { useState, useEffect } from "react";
import useInventory from "@/hooks/useInventory";
import { toast } from "sonner";

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
  Loader2,
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
        Number(v.stock || 0) * Number(v.unit_cost || product.unit_cost || 0),
      0,
    );
  }
  return Number(product.stock) * Number(product.unit_cost || 0);
}

function getEffectiveCost(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0]?.unit_cost || product.unit_cost || 0;
  }
  return Number(product.unit_cost || 0);
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
  const {
    data: products,
    loading,
    error: invError,
    refetch,
    adjust: adjustStockApi,
    setSearch: setApiSearch,
    setPage,
    setLowStockOnly,
    meta,
  } = useInventory();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [restockProduct, setRestockProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  // ─── Restock State ──────────────────────────────────────────────────────
  const [restockQty, setRestockQty] = useState(1);
  const [restockNotes, setRestockNotes] = useState("");
  // Variant-specific restock
  const [restockVariant, setRestockVariant] = useState(null);
  const [restockVariantQty, setRestockVariantQty] = useState(1);
  const [restockLoading, setRestockLoading] = useState(false);

  // ─── Adjust Stock State ─────────────────────────────────────────────────
  const [newStockAmount, setNewStockAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Correction");
  const [adjustNotes, setAdjustNotes] = useState("");
  // Variant-specific adjust
  const [adjustVariant, setAdjustVariant] = useState(null);
  const [adjustVariantStock, setAdjustVariantStock] = useState(0);
  const [adjustLoading, setAdjustLoading] = useState(false);

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
  const totalProducts = meta?.total ?? products.length;
  const totalStockValue = products.reduce((sum, p) => {
    if (p.variants && p.variants.length > 0) {
      return (
        sum +
        p.variants.reduce(
          (s, v) =>
            s + Number(v.stock || 0) * Number(v.unit_cost || p.unit_cost || 0),
          0,
        )
      );
    }
    return sum + Number(p.stock) * Number(p.unit_cost || 0);
  }, 0);
  const lowStockItems = products.filter((p) => {
    const stock = getEffectiveStock(p);
    return stock > 0 && stock <= (p.min_stock || 5);
  }).length;
  const outOfStock = products.filter((p) => getEffectiveStock(p) === 0).length;

  // ─── Get Unique Categories ──────────────────────────────────────────────
  const categories = [
    "All",
    ...new Set(products.map((p) => p.category?.name || p.category).filter(Boolean)),
  ];

  // ─── Toggle Expand ──────────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Search handler — debounce ke API ──────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value);
    setApiSearch(value);
  };

  // ─── Restock Handler ─────────────────────────────────────────────────
  // Kirim ke POST /api/stock-adjustments dengan type: "restock"
  const handleRestock = async () => {
    const qty = restockVariant ? restockVariantQty : restockQty;
    if (!qty || qty < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setRestockLoading(true);
    try {
      await adjustStockApi({
        product_id: restockProduct.id,
        variant_id: restockVariant?.id || null,
        type: "restock",
        quantity: Number(qty),
        notes: restockNotes || null,
      });

      setRestockProduct(null);
      setRestockVariant(null);
      setRestockQty(1);
      setRestockVariantQty(1);
      setRestockNotes("");
      toast.success("Stock updated successfully ✅");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Gagal melakukan restock";
      toast.error(msg);
    } finally {
      setRestockLoading(false);
    }
  };

  // ─── Adjust Stock Handler ─────────────────────────────────────────────
  // Kirim ke POST /api/stock-adjustments dengan type: "adjustment"
  const handleAdjustStock = async () => {
    const stockAfter = adjustVariant
      ? Math.max(0, Number(adjustVariantStock))
      : Math.max(0, Number(newStockAmount));
    const stockBefore = adjustVariant
      ? Number(adjustVariant.stock || 0)
      : getEffectiveStock(adjustProduct);
    const qtyDiff = stockAfter - stockBefore;

    setAdjustLoading(true);
    try {
      await adjustStockApi({
        product_id: adjustProduct.id,
        variant_id: adjustVariant?.id || null,
        type: "adjustment",
        quantity: qtyDiff,
        reason: adjustReason,
        notes: adjustNotes || null,
      });

      setAdjustProduct(null);
      setAdjustVariant(null);
      setNewStockAmount(0);
      setAdjustVariantStock(0);
      setAdjustReason("Correction");
      setAdjustNotes("");
      toast.success(`Stock adjusted (${adjustReason}) ✅`);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Gagal melakukan adjustment";
      toast.error(msg);
    } finally {
      setAdjustLoading(false);
    }
  };

  // ─── Search & Filter (client-side fallback untuk status & category) ───
  const filteredProducts = products.filter((product) => {
    const effStock = getEffectiveStock(product);
    const categoryName = product.category?.name || product.category || "";

    const matchStatus =
      statusFilter === "All" ||
      getStockStatus(effStock, product.min_stock || 5).label === statusFilter;

    const matchCategory =
      categoryFilter === "All" || categoryName === categoryFilter;

    return matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
          >
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
          className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 dark:hover:bg-accent/30"
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
          value={loading ? "—" : totalProducts}
          iconBg="bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Stock Value"
          value={loading ? "—" : formatRupiah(totalStockValue)}
          iconBg="bg-accent-light dark:bg-accent/20 border border-accent/30"
          iconColor="text-accent dark:text-accent"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={loading ? "—" : lowStockItems}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={loading ? "—" : outOfStock}
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
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setLowStockOnly(e.target.value === "Low Stock");
            }}
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
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ══════════════ Error State ════════════════════════════════════════ */}
      {invError && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {invError}
        </div>
      )}

      {/* ══════════════ Loading State ══════════════════════════════════════ */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      {/* ══════════════ Product Table ══════════════════════════════════════ */}
      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ececf2] dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Stock Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececf2] dark:divide-gray-700/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const effStock = getEffectiveStock(product);
                  const status = getStockStatus(
                    effStock,
                    product.min_stock || 5,
                  );
                  const hasVariants =
                    product.variants && product.variants.length > 0;
                  const isExpanded = expandedProducts.has(product.id);
                  const categoryName =
                    product.category?.name || product.category || "—";

                  return (
                    <>
                      <tr
                        key={product.id}
                        className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <button
                                onClick={() => toggleExpand(product.id)}
                                className="text-gray-400 hover:text-accent transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                          {product.sku || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {categoryName}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                          {effStock}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                          {formatRupiah(getEffectiveCost(product))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          {formatRupiah(getEffectiveStockValue(product))}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setRestockProduct(product);
                                setRestockVariant(null);
                                setRestockQty(1);
                                setRestockNotes("");
                              }}
                              className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all hover:shadow-sm"
                            >
                              Restock
                            </button>
                            <button
                              onClick={() => {
                                setAdjustProduct(product);
                                setAdjustVariant(null);
                                setNewStockAmount(effStock);
                                setAdjustReason("Correction");
                                setAdjustNotes("");
                              }}
                              className="rounded-xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-all hover:shadow-sm"
                            >
                              Adjust
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Variants row */}
                      {hasVariants && isExpanded &&
                        product.variants.map((variant) => {
                          const vStatus = getStockStatus(
                            Number(variant.stock || 0),
                            product.min_stock || 5,
                          );
                          return (
                            <tr
                              key={`${product.id}-${variant.id}`}
                              className="bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                            >
                              <td className="px-4 py-2.5 pl-12">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ↳ {variant.name}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-400 dark:text-gray-500">
                                {variant.sku || "—"}
                              </td>
                              <td className="px-4 py-2.5" />
                              <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {variant.stock}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${vStatus.color}`}
                                >
                                  {vStatus.label}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right text-xs text-gray-500 dark:text-gray-400">
                                {formatRupiah(variant.unit_cost || 0)}
                              </td>
                              <td className="px-4 py-2.5 text-right text-xs text-gray-500 dark:text-gray-400">
                                {formatRupiah(
                                  Number(variant.stock || 0) *
                                    Number(variant.unit_cost || 0),
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setRestockProduct(product);
                                      setRestockVariant(variant);
                                      setRestockVariantQty(1);
                                      setRestockNotes("");
                                    }}
                                    className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                                  >
                                    Restock
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAdjustProduct(product);
                                      setAdjustVariant(variant);
                                      setAdjustVariantStock(
                                        Number(variant.stock || 0),
                                      );
                                      setAdjustReason("Correction");
                                      setAdjustNotes("");
                                    }}
                                    className="rounded-xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300"
                                  >
                                    Adjust
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════ Pagination ════════════════════════════════════════ */}
      {!loading && meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Halaman {meta.current_page} dari {meta.last_page} ({meta.total}{" "}
            produk)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(meta.current_page - 1)}
              disabled={meta.current_page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>
            <span className="flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold text-white shadow-sm bg-accent">
              {meta.current_page}
            </span>
            <button
              onClick={() => setPage(meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ Restock Modal ══════════════════════════════════════ */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div
              className="h-1 rounded-t-3xl -mt-6 -mx-6 mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
              }}
            />
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Restock
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {restockProduct.name}
                  {restockVariant && (
                    <span className="text-accent"> — {restockVariant.name}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockVariant ? restockVariantQty : restockQty}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    restockVariant
                      ? setRestockVariantQty(val)
                      : setRestockQty(val);
                  }}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
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
                disabled={restockLoading}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={restockLoading}
                className="flex-1 rounded-2xl py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                {restockLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
            <div
              className="h-1 rounded-t-3xl -mt-6 -mx-6 mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
              }}
            />
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <ArrowUpDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Adjust Stock
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {adjustProduct.name}
                  {adjustVariant && (
                    <span className="text-accent"> — {adjustVariant.name}</span>
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
                    adjustVariant
                      ? setAdjustVariantStock(val)
                      : setNewStockAmount(val);
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
                disabled={adjustLoading}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustLoading}
                className="flex-1 rounded-2xl py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                {adjustLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
