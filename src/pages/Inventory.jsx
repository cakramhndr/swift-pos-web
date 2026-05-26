import { useState } from "react";
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
} from "lucide-react";

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
    <div className="rounded-xl border border-[#ececf2] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">
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
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockNotes, setRestockNotes] = useState("");
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
        color: "bg-red-100 text-red-700",
      };
    if (s <= minStock)
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700",
      };
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-700",
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

  // ─── Restock Handler ────────────────────────────────────────────────────
  const handleRestock = () => {
    if (!restockQty || restockQty < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const updated = products.map((p) => {
      if (p.id === restockProduct.id) {
        if (restockVariant) {
          // Restock specific variant
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
          // Restock single product stock
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

    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setRestockProduct(null);
    setRestockVariant(null);
    setRestockQty(1);
    setRestockVariantQty(1);
    setRestockSupplier("");
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
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
      {/* ══════════════ Page Header ════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Inventory
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your stock levels
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ Summary Cards ═════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={totalProducts}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Stock Value"
          value={formatRupiah(totalStockValue)}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={lowStockItems}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={outOfStock}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* ══════════════ Search & Filter Bar ════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#ececf2] py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-400">
          Showing {filteredProducts.length} of {totalProducts} products
        </p>
      </div>

      {/* ══════════════ Inventory Table ═══════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-[#ececf2] shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Package className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500">
              No products found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#f8f8fc] to-white text-left text-sm text-gray-500">
                <th className="px-4 py-4 w-8"></th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Min Stock</th>
                <th className="px-6 py-4 font-semibold">Unit Cost</th>
                <th className="px-6 py-4 font-semibold">Stock Value</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
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
                      className="border-t border-[#ececf2] transition-colors hover:bg-violet-50/30"
                    >
                      {/* Expand toggle */}
                      <td className="px-4 py-4">
                        {hasVariants && (
                          <button
                            onClick={() => toggleExpand(product.id)}
                            className="text-gray-400 hover:text-violet-600 cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        )}
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-xs font-bold text-violet-600 flex-shrink-0">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.category}
                              {hasVariants && (
                                <span className="ml-1.5 text-purple-500">
                                  ({product.variants.length} variants)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {product.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                      </td>

                      {/* Stock with Bar */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {effStock} units
                          </p>
                          <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-300`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Min Stock */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {product.minStock || 5}
                        </p>
                      </td>

                      {/* Unit Cost */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        <span className="whitespace-nowrap">
                          {formatRupiah(effCost)}
                        </span>
                      </td>

                      {/* Stock Value */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-violet-600">
                        <span className="whitespace-nowrap">
                          {formatRupiah(stockValue)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center align-middle whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setRestockProduct(product)}
                            className="flex items-center gap-1 rounded-lg border border-violet-200 px-2 py-1 text-xs font-medium text-violet-600 transition-all hover:bg-violet-50 hover:shadow-sm hover:-translate-y-0.5"
                          >
                            <Package className="h-3 w-3" />
                            Restock
                          </button>
                          <button
                            onClick={() => {
                              setAdjustProduct(product);
                              setNewStockAmount(effStock);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[#ececf2] px-2 py-1 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable variant rows */}
                    {hasVariants && isExpanded && (
                      <tr key={`variants-${product.id}`}>
                        <td colSpan={10} className="px-6 py-0 bg-purple-50/30">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="text-left text-xs text-gray-400">
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
                                    className="border-t border-purple-100 transition-colors hover:bg-purple-50/50"
                                  >
                                    <td className="py-2.5 pl-10">
                                      <span className="text-sm font-medium text-gray-800">
                                        {variant.name}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="text-xs text-gray-500 font-mono">
                                        {variant.sku || product.sku}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {variant.stock}
                                      </span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="text-sm text-violet-600 font-medium">
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
                                          className="text-xs text-violet-600 border border-violet-200 px-2 py-0.5 rounded-md hover:bg-violet-50 cursor-pointer"
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
                                          className="text-xs text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md hover:bg-gray-50 cursor-pointer"
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl -mt-6 -mx-6 mb-6" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Restock Product
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {restockProduct.name}
                  {restockVariant && (
                    <span className="text-purple-500">
                      {" "}
                      — {restockVariant.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900">
                  {restockVariant
                    ? `${restockVariant.stock} units`
                    : `${getEffectiveStock(restockProduct)} units`}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
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
                  className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add notes about this restock..."
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  rows="3"
                  className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRestockProduct(null);
                  setRestockVariant(null);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] py-3.5 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md"
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl -mt-6 -mx-6 mb-6" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                <ArrowUpDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Adjust Stock
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {adjustProduct.name}
                  {adjustVariant && (
                    <span className="text-purple-500">
                      {" "}
                      — {adjustVariant.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900">
                  {adjustVariant
                    ? `${adjustVariant.stock} units`
                    : `${getEffectiveStock(adjustProduct)} units`}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
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
                  className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
                >
                  <option value="Correction">Correction</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Notes
                </label>
                <textarea
                  placeholder="Add notes about this adjustment..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  rows="3"
                  className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAdjustProduct(null);
                  setAdjustVariant(null);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] py-3.5 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md"
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
