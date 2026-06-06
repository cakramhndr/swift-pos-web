import { Package } from "lucide-react";

export default function PurchaseOrders() {
  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
          style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}
        >
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
            Coming soon — purchase order management
          </p>
        </div>
      </div>
    </div>
  );
}