import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Package, ArrowLeft, Edit3, Trash2, ShoppingCart } from "lucide-react";

const formatRupiah = (num) => {
  if (isNaN(num)) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      const products = JSON.parse(saved);
      const found = products.find((p) => String(p.id) === id);
      setProduct(found || null);
    }
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) {
      const transactions = JSON.parse(saved);
      const related = transactions
        .filter(
          (t) => t.items && t.items.some((item) => String(item.id) === id),
        )
        .slice(0, 10);
      setSalesHistory(related);
    }
  }, [id]);

  const handleDelete = () => {
    const saved = localStorage.getItem("products");
    if (saved) {
      const products = JSON.parse(saved);
      const updated = products.filter((p) => String(p.id) !== id);
      localStorage.setItem("products", JSON.stringify(updated));
      toast.success("Product deleted successfully 🗑️");
      navigate("/products");
    }
  };

  if (!product) {
    return (
      <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">
            Product not found
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 flex items-center gap-2 rounded-2xl border border-[#ececf2] px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const stock = Number(product.stock);
  const minStock = Number(product.minStock) || 5;
  const unitCost = Number(product.unitCost);
  const unitPrice = Number(product.unitPrice);
  const margin = unitPrice - unitCost;
  const marginPercent =
    unitCost > 0 ? ((margin / unitCost) * 100).toFixed(1) : 0;

  const getStatus = (s, ms) => {
    if (s === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    if (s <= ms)
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-700 border-green-200",
    };
  };

  const status = getStatus(stock, minStock);

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </button>

      {/* Two Column Layout */}
      <div className="grid grid-cols-5 gap-8">
        {/* Left: Image (40%) */}
        <div className="col-span-2">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center overflow-hidden border border-[#ececf2]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <Package className="h-24 w-24 text-violet-300" />
            )}
          </div>
        </div>

        {/* Right: Product Info (60%) */}
        <div className="col-span-3 space-y-6">
          {/* Name & Badges */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                {product.category}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-mono font-medium text-gray-600">
                {product.sku}
              </span>
            </div>
          </div>

          <div className="h-px bg-[#ececf2]" />

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Unit Cost</span>
              <span className="text-sm text-gray-700">
                {formatRupiah(unitCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Unit Price</span>
              <span className="text-xl font-bold text-purple-600">
                {formatRupiah(unitPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Margin</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600">
                  {formatRupiah(margin)}
                </span>
                {unitCost > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    {marginPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-[#ececf2]" />

          {/* Stock Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Current Stock</span>
              <span className="text-lg font-bold text-gray-900">
                {stock} units
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Min Stock Threshold</span>
              <span className="text-sm font-medium text-gray-700">
                {minStock}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${status.color}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status.label === "In Stock" ? "bg-green-500" : status.label === "Low Stock" ? "bg-yellow-500" : "bg-red-500"}`}
                />
                {status.label}
              </span>
            </div>
            {/* Stock Bar */}
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stock === 0
                    ? "bg-red-400"
                    : stock <= minStock
                      ? "bg-yellow-400"
                      : "bg-green-400"
                }`}
                style={{ width: `${Math.min((stock / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                navigate("/products");
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-violet-200 px-5 py-3 text-sm font-medium text-violet-600 transition-all hover:bg-violet-50 hover:shadow-sm"
            >
              <Edit3 className="h-4 w-4" />
              Edit Product
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this product?")) {
                  handleDelete();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete Product
            </button>
          </div>
        </div>
      </div>

      {/* Sales History */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Sales History
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Last {Math.min(salesHistory.length, 10)} transactions
              </p>
            </div>
          </div>

          {salesHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-500">
                No sales history yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This product has not been sold yet
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#ececf2]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f8f8fc] to-white text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-semibold">Invoice #</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Qty Sold</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map((t) => {
                    const item = t.items.find((i) => String(i.id) === id);
                    return (
                      <tr
                        key={t.id}
                        className="border-t border-[#ececf2] transition-colors hover:bg-violet-50/30"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-violet-600">
                            #{t.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{t.date}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {item?.qty || 0} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-violet-600">
                            {formatRupiah(item ? item.unitPrice * item.qty : 0)}
                          </span>
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
    </div>
  );
}
