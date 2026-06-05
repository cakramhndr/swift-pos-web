import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Package, ArrowLeft, Edit3, Trash2, ShoppingCart } from "lucide-react";
import useProducts from "@/hooks/useProducts";

const formatRupiah = (num) => {
  if (isNaN(num)) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products, refetch } = useProducts({ perPage: 100 });
  const [product, setProduct] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find((p) => String(p.id) === id);
      setProduct(found || null);
    }
  }, [products, id]);

  // Clear sales history since it relied on localStorage transactions
  useEffect(() => {
    setSalesHistory([]);
  }, [id]);

  const handleDelete = async () => {
    try {
      const { remove } = useProducts();
      // Can't call hooks conditionally, so handle via navigate back
      toast.error("Please delete from the Products page");
      navigate("/products");
    } catch {
      navigate("/products");
    }
  };

  if (!product) {
    return (
      <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Product not found
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 flex items-center gap-2 rounded-2xl border border-[#ececf2] dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const hasVariants = product.variants && product.variants.length > 0;

  let stock, minStock, unitCost, unitPrice, margin, marginPercent, status;

  if (hasVariants) {
    stock = product.variants.reduce((sum, v) => sum + Number(v.stock), 0);
    minStock = Number(product.min_stock ?? product.minStock) || 5;
    status = (() => {
      if (stock === 0)
        return {
          label: "Out of Stock",
          color: "bg-red-500/15 border border-red-500/30 text-red-300 border-red-200",
        };
      if (stock <= minStock)
        return {
          label: "Low Stock",
          color: "bg-amber-500/15 border border-amber-500/30 text-amber-300 border-yellow-200",
        };
      return {
        label: "In Stock",
        color: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 border-green-200",
      };
    })();
  } else {
    stock = Number(product.stock);
    minStock = Number(product.min_stock ?? product.minStock) || 5;
    unitCost = Number(product.unit_cost ?? product.unitCost);
    unitPrice = Number(product.unit_price ?? product.unitPrice);
    margin = unitPrice - unitCost;
    marginPercent = unitCost > 0 ? ((margin / unitCost) * 100).toFixed(1) : 0;

    status = (() => {
      if (stock === 0)
        return {
          label: "Out of Stock",
          color: "bg-red-500/15 border border-red-500/30 text-red-300 border-red-200",
        };
      if (stock <= minStock)
        return {
          label: "Low Stock",
          color: "bg-amber-500/15 border border-amber-500/30 text-amber-300 border-yellow-200",
        };
      return {
        label: "In Stock",
        color: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 border-green-200",
      };
    })();
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </button>

      {/* Two Column Layout */}
      <div className="grid grid-cols-5 gap-8">
        {/* Left: Image (40%) */}
        <div className="col-span-2">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-violet-50 dark:from-violet-900/30 to-purple-50 dark:to-purple-900/30 flex items-center justify-center overflow-hidden border border-[#ececf2] dark:border-gray-700">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <Package className="h-24 w-24 text-accent" />
            )}
          </div>
        </div>

        {/* Right: Product Info (60%) */}
        <div className="col-span-3 space-y-6">
          {/* Name & Badges */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">
                {product.category?.name || product.category || ""}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                {product.sku}
              </span>
            </div>
          </div>

          <div className="h-px bg-[#ececf2]" />

          {hasVariants ? (
            /* Variants Table */
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                Variants
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-normal">
                      Variant
                    </th>
                    <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-normal">
                      Stock
                    </th>
                    <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-normal">
                      Price
                    </th>
                    <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-normal">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{variant.name}</td>
                      <td className="py-2 text-right">{variant.stock}</td>
                      <td className="py-2 text-right text-accent dark:text-accent">
                        Rp {(Number(variant.unit_price ?? variant.unitPrice) || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 text-right">
                        {variant.stock === 0 ? (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                            Out
                          </span>
                        ) : variant.stock <= 5 ? (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                            Low
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Price Section */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Unit Cost</span>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {formatRupiah(unitCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Unit Price</span>
                <span className="text-xl font-bold text-accent dark:text-accent">
                  {formatRupiah(unitPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Margin</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatRupiah(margin)}
                  </span>
                  {unitCost > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
                      {marginPercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="h-px bg-[#ececf2]" />

          {/* Stock Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Stock</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stock} units
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Min Stock Threshold</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {minStock}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
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
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-accent px-5 py-3 text-sm font-medium text-accent transition-all hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.12)] hover:-translate-y-0.5"
            >
              <Edit3 className="h-4 w-4" />
              Edit Product
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this product?")) {
                  navigate("/products");
                  toast.info("Please delete from the Products page");
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete Product
            </button>
          </div>
        </div>
      </div>

      {/* Sales History */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Sales History
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                Will be available after Reports API integration
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
              <ShoppingCart className="h-6 w-6 text-gray-400 dark:text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              No sales history yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This product has not been sold yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}