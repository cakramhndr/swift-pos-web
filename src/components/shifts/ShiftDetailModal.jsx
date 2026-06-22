import { useEffect } from "react";
import {
  X,
  Hash,
  User,
  Clock,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";

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

function formatDuration(openedAt, closedAt) {
  if (!openedAt || !closedAt) return "-";
  const start = new Date(openedAt);
  const end = new Date(closedAt);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}j ${minutes}m`;
}

export default function ShiftDetailModal({ shift, onClose }) {
  // ─── ESC key support ────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!shift) return null;

  const difference = shift.cash_difference ?? 0;
  const isPositive = difference >= 0;
  const isClosed = shift.status === "CLOSED";

  const detailItems = [
    {
      icon: Hash,
      label: "No Shift",
      value: shift.shift_number || "-",
    },
    {
      icon: User,
      label: "Kasir",
      value: shift.user?.name || "-",
    },
    {
      icon: CalendarDays,
      label: "Waktu Buka",
      value: formatDateTime(shift.opened_at),
    },
    {
      icon: CalendarDays,
      label: "Waktu Tutup",
      value: formatDateTime(shift.closed_at),
    },
    {
      icon: Clock,
      label: "Durasi Shift",
      value: formatDuration(shift.opened_at, shift.closed_at),
    },
    {
      icon: CircleDollarSign,
      label: "Kas Awal",
      value: `Rp ${formatCurrency(shift.opening_cash)}`,
    },
    {
      icon: CircleDollarSign,
      label: "Kas Diharapkan",
      value:
        shift.closing_cash_expected != null
          ? `Rp ${formatCurrency(shift.closing_cash_expected)}`
          : "-",
    },
    {
      icon: CircleDollarSign,
      label: "Kas Aktual",
      value:
        shift.closing_cash_actual != null
          ? `Rp ${formatCurrency(shift.closing_cash_actual)}`
          : "-",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.171-2.303 0-3.182C10.607 7.72 11.332 7.5 12 7.5c.725 0 1.45.22 2.003.659l.879.659"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Detail Shift
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                {shift.shift_number || ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ─── Status Badge ──────────────────────────────────────────── */}
        <div className="mb-5">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              shift.status === "OPEN"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60"
            }`}
          >
            {shift.status}
          </span>
        </div>

        {/* ─── Detail Items ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-gray-800/60 p-4 space-y-3">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Selisih ───────────────────────────────────────────────── */}
          {isClosed && (
            <div
              className={`rounded-2xl border px-4 py-3 flex items-center justify-between ${
                isPositive
                  ? "border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-red-200/60 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selisih
                </p>
              </div>
              <p
                className={`text-base font-bold ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+ " : "- "}Rp{" "}
                {formatCurrency(Math.abs(difference))}
              </p>
            </div>
          )}

          {/* ─── Notes ────────────────────────────────────────────────── */}
          {shift.notes && (
            <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-gray-800/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Catatan
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {shift.notes}
              </p>
            </div>
          )}
        </div>

        {/* ─── Close Button ──────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="w-full mt-6 rounded-2xl py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
