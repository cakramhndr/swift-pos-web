import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Warehouse,
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

// ─── Format Rupiah ───────────────────────────────────────────────────────
const formatRupiah = (num) => {
  if (isNaN(num)) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

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

  // ─── Restock State ──────────────────────────────────────────────────────
  const [restockQty, setRestockQty] = useState(1);
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockNotes, setRestockNotes] = useState("");

  // ─── Adjust Stock State ─────────────────────────────────────────────────
  const [newStockAmount, setNewStockAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Correction");
  const [adjustNotes, setAdjustNotes] = useState("");

  // ─── Helper Functions ───────────────────────────────────────────────────
  const getStockStatus = (s) => {
    if (s > 5)
      return {
        label: "In Stock",
        color: "bg-green-100 text-green-700",
      };
    if (s > 0)
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700",
      };
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-700",
    };
  };

  // ─── Calculate Stats ────────────────────────────────────────────────────
  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, p) => sum + Number(p.stock) * Number(p.unitCost),
    0,
  );
  const lowStockItems = products.filter(
    (p) => p.stock > 0 && p.stock <= 5,
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // ─── Get Unique Categories ──────────────────────────────────────────────
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // ─── Restock Handler ────────────────────────────────────────────────────
  const handleRestock = () => {
    if (!restockQty || restockQty < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const updated = products.map((p) => {
      if (p.id === restockProduct.id) {
        const newStock = Number(p.stock) + Number(restockQty);
        return {
          ...p,
          stock: newStock,
          status: getStockStatus(newStock).label,
        };
      }
      return p;
    });

    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setRestockProduct(null);
    setRestockQty(1);
    setRestockSupplier("");
    setRestockNotes("");
    toast.success("Stock updated successfully ✅");
  };

  // ─── Adjust Stock Handler ───────────────────────────────────────────────
  const handleAdjustStock = () => {
    if (newStockAmount < 0) {
      toast.error("Stock amount cannot be negative");
      return;
    }

    const updated = products.map((p) => {
      if (p.id === adjustProduct.id) {
        return {
          ...p,
          stock: newStockAmount,
          status: getStockStatus(newStockAmount).label,
        };
      }
      return p;
    });

    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setAdjustProduct(null);
    setNewStockAmount(0);
    setAdjustReason("Correction");
    setAdjustNotes("");
    toast.success(`Stock adjusted (${adjustReason}) ✅`);
  };

  // ─── Search & Filter ────────────────────────────────────────────────────
  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      getStockStatus(Number(product.stock)).label === statusFilter;

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

        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-medium text-violet-600 transition-all hover:bg-violet-50 hover:shadow-sm hover:-translate-y-0.5">
            <ArrowUpDown className="h-4 w-4" />
            Adjust Stock
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
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
                const status = getStockStatus(Number(product.stock));
                const stockValue =
                  Number(product.stock) * Number(product.unitCost);
                const barWidth = Math.min(
                  (Number(product.stock) / 30) * 100,
                  100,
                );
                const barColor =
                  Number(product.stock) > 5
                    ? "bg-green-400"
                    : Number(product.stock) > 0
                      ? "bg-yellow-400"
                      : "bg-red-400";

                return (
                  <tr
                    key={product.id}
                    className="border-t border-[#ececf2] transition-colors hover:bg-violet-50/30"
                  >
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
                          {product.stock} units
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
                        {formatRupiah(product.unitCost)}
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
                            setNewStockAmount(Number(product.stock));
                          }}
                          className="flex items-center gap-1 rounded-lg border border-[#ececf2] px-2 py-1 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5"
                        >
                          <ArrowUpDown className="h-3 w-3" />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
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
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900">
                  {restockProduct.stock} units
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Add Stock
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) =>
                    setRestockQty(Math.max(1, Number(e.target.value)))
                  }
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
                onClick={() => setRestockProduct(null)}
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
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900">
                  {adjustProduct.stock} units
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  New Stock Amount
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockAmount}
                  onChange={(e) =>
                    setNewStockAmount(Math.max(0, Number(e.target.value)))
                  }
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
                onClick={() => setAdjustProduct(null)}
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
