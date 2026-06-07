import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Loader2, AlertTriangle } from "lucide-react";

/**
 * PurchaseOrderEdit — Edit an existing purchase order page.
 *
 * TODO:
 *  - Fetch PO data from API via usePurchaseOrders hook
 *  - Fetch suppliers and products for dropdowns
 *  - Pre-populate form fields with existing PO values
 *  - Implement update logic via API
 *  - Handle validation and error states
 */

export default function PurchaseOrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // TODO: Replace with actual API fetch
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <button
          onClick={() => navigate("/purchase-orders")}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          Purchase Orders
        </button>
        <span>/</span>
        <button
          onClick={() => navigate(`/purchase-orders/${id}`)}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          PO #{id}
        </button>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Edit</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}
          >
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Purchase Order</h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">Update PO #{id}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/purchase-orders/${id}`)}
          className="flex items-center gap-2 rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
          <p className="text-sm text-gray-400">Loading purchase order data...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-light to-purple-100 dark:from-accent/20 dark:to-purple-900/20 mb-4">
              <ShoppingBag className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
            <p className="text-sm text-gray-400 max-w-md">
              The purchase order edit form is coming soon. You will be able to update PO number, supplier, dates, items, discount, and tax.
            </p>

            {/* TODO: Replace with actual edit form */}
            <div className="mt-8 w-full max-w-lg rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-6 border border-dashed border-[#ececf2] dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Placeholder Form Sections</p>
              <div className="space-y-3">
                {["PO Number", "Supplier", "Order Date", "Expected Date", "Items Table (x3)", "Discount & Tax", "Notes"].map((section) => (
                  <div key={section} className="h-10 rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-700/50 px-4 flex items-center">
                    <span className="text-sm text-gray-400">{section}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 mt-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 max-w-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong className="font-semibold">TODO:</strong> Fetch PO #{id} data from API, pre-populate form, handle item changes, and submit via <code className="text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">updatePurchaseOrder()</code> API.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}