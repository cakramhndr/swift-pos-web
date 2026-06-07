import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Eye,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import { formatRp, formatDateShort } from "@/lib/purchaseUtils";

/**
 * StockOpnameTable — Table of stock opname sessions.
 *
 * Props:
 *  - data       : Array of stock opname objects (from API)
 *  - loading    : boolean
 *  - pagination : { current_page, last_page, total, per_page }
 *  - onPageChange : (page: number) => void
 */
export default function StockOpnameTable({
  data = [],
  loading,
  pagination,
  onPageChange,
}) {
  const navigate = useNavigate();

  const totalPages = pagination?.last_page ?? 1;
  const currentPage = pagination?.current_page ?? 1;
  const totalRecords = pagination?.total ?? 0;

  // ── Status badge ──────────────────────────────────────────────────
  const statusBadge = (status) => {
    const variants = {
      draft: { label: "Draft", classes: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
      in_progress: { label: "In Progress", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50" },
      completed: { label: "Completed", classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50" },
      cancelled: { label: "Cancelled", classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50" },
    };
    const v = variants[status] || variants.draft;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${v.classes}`}>
        {v.label}
      </span>
    );
  };

  // ── Skeleton rows ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Sessions</h2>
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {totalRecords} results
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">Reference <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Store</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Differences</th>
              <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Adjustment Value</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <ClipboardList className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No stock opname sessions found</p>
                    <p className="text-xs text-gray-400 mt-1">Create a new session to start counting inventory</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((session) => {
                const items = session.items || [];
                const totalItems = session.total_items ?? items.length ?? 0;
                const diffCount = items.filter((i) => (i.difference ?? 0) !== 0).length;
                const storeName = session.store?.name || "—";
                const createdByName = session.created_by_user?.name || session.created_by || "—";
                // Estimate adjustment value using product unit_cost
                const adjustmentValue = items.reduce((sum, i) => {
                  const cost = i.product?.unit_cost ?? 0;
                  return sum + Math.abs(i.difference ?? 0) * cost;
                }, 0);

                return (
                  <tr
                    key={session.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 group cursor-pointer"
                    onClick={() => navigate(`/stock-opnames/${session.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-light dark:bg-accent/20 text-accent">
                          <ClipboardList className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white text-[13px]">{session.reference_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-[13px]">{storeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-600 dark:text-gray-400">
                      {formatDateShort(session.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(session.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] text-gray-900 dark:text-white font-medium">
                      {totalItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-[13px] font-medium ${diffCount > 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {diffCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-semibold text-gray-900 dark:text-white text-[13px]">
                        {formatRp(adjustmentValue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-600 dark:text-gray-400">
                      {createdByName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-400">
            Showing {((currentPage - 1) * (pagination?.per_page ?? 10)) + 1} to {Math.min(currentPage * (pagination?.per_page ?? 10), totalRecords)} of {totalRecords} sessions
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400 px-1">...</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      currentPage === p ? "bg-accent text-white shadow-sm" : "border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}