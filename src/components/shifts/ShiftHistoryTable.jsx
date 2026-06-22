import { useState, useCallback } from "react";
import { CalendarDays, Search, ChevronLeft, ChevronRight } from "lucide-react";
import ShiftDetailModal from "./ShiftDetailModal";

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export default function ShiftHistoryTable({
  shifts,
  loading,
  meta,
  onPageChange,
  onFilter,
}) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedShift, setSelectedShift] = useState(null);

  const handleFilter = useCallback(() => {
    if (onFilter) {
      onFilter({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
    }
  }, [dateFrom, dateTo, onFilter]);

  const handlePageChange = useCallback(
    (page) => {
      if (onPageChange) {
        onPageChange(page);
      }
    },
    [onPageChange],
  );

  return (
    <div className="space-y-4">
      {/* ─── Date Filters ──────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
              Tanggal Dari
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
              Tanggal Sampai
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white"
            />
          </div>
          <button
            onClick={handleFilter}
            className="rounded-2xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <Search className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ececf2] dark:border-gray-700 bg-gray-50 dark:bg-white/[0.03]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  No Shift
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Kasir
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Waktu Buka
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Waktu Tutup
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Selisih
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Status
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececf2] dark:divide-gray-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
                      <span className="text-sm text-gray-400">
                        Memuat data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-400">
                        Belum ada riwayat shift
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => {
                  const difference = shift.cash_difference ?? 0;
                  const isPositive = difference >= 0;
                  const isClosed = shift.status === "CLOSED";

                  return (
                    <tr
                      key={shift.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {shift.shift_number || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {shift.user?.name || "-"}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDateTime(shift.opened_at)}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDateTime(shift.closed_at)}
                      </td>
                      <td className="px-5 py-4">
                        {isClosed ? (
                          <span
                            className={`font-semibold ${
                              isPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? "+ " : "- "}Rp{" "}
                            {formatCurrency(Math.abs(difference))}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            shift.status === "OPEN"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                              : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60"
                          }`}
                        >
                          {shift.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedShift(shift)}
                          className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 border border-accent/30 transition-all"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ──────────────────────────────────────────────── */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-[#ececf2] dark:border-gray-700 px-5 py-3.5">
            <p className="text-xs text-gray-400">
              Halaman {meta.current_page} dari {meta.last_page} (Total{" "}
              {meta.total} shift)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-[#ececf2] dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-[#ececf2] dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Modal ──────────────────────────────────────────────── */}
      {selectedShift && (
        <ShiftDetailModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </div>
  );
}
