// ── Format Rupiah ────────────────────────────────────────────────────
export function formatRp(v) {
  if (v == null) return "Rp 0";
  return "Rp " + Number(v).toLocaleString("id-ID");
}

// ── Format Date Short ─────────────────────────────────────────────────
export function formatDateShort(ds) {
  if (!ds) return "-";
  const d = new Date(ds);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Status badge class resolver ──────────────────────────────────────
export function getStatusBadgeInfo(status) {
  const variants = {
    draft: { label: "Draft", classes: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    pending: { label: "Pending", classes: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/50" },
    partial: { label: "Partial", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50" },
    completed: { label: "Completed", classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50" },
    cancelled: { label: "Cancelled", classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50" },
    overdue: { label: "Overdue", classes: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/50" },
  };
  return variants[status?.toLowerCase()] || variants.draft;
}