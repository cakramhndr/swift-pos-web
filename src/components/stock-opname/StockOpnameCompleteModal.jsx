import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * StockOpnameCompleteModal — Confirmation dialog for completing a stock opname.
 *
 * Props:
 *  - open : boolean
 *  - onClose : () => void
 *  - onConfirm : () => Promise<void>
 *  - submitting : boolean
 *  - summary : {
 *      checkedItems,
 *      diffItems,
 *      missingItems,
 *      excessItems,
 *      estimatedValue,
 *      valueFormatted
 *    }
 */
export default function StockOpnameCompleteModal({
  open,
  onClose,
  onConfirm,
  submitting,
  summary,
}) {
  if (!open) return null;

  const s = summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl border border-[#ececf2] dark:border-gray-700 mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Complete Stock Opname?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              You are about to complete this stock opname session.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-[#ececf2] dark:border-gray-700 p-4 space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Products Checked</span>
            <span className="font-semibold text-gray-900 dark:text-white">{s.checkedItems ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Items with Difference</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{s.diffItems ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Missing Items</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{s.missingItems ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Excess Items</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{s.excessItems ?? 0}</span>
          </div>
          <div className="border-t border-[#ececf2] dark:border-gray-700 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Estimated Adjustment Value</span>
            <span className="text-base font-bold text-accent">{s.valueFormatted || "Rp 0"}</span>
          </div>
        </div>

        {/* Warning Box */}
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-4 mb-6">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider">
            This action will:
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 text-[10px] font-bold">✓</span>
              Update inventory stock
            </li>
            <li className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 text-[10px] font-bold">✓</span>
              Create inventory logs
            </li>
            <li className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 text-[10px] font-bold">✓</span>
              Lock this stock opname session
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Completing..." : "Complete Session"}
          </button>
        </div>
      </div>
    </div>
  );
}