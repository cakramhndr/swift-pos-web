import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { closeShift } from "@/api/shifts";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export default function CloseShiftModal({
  isOpen,
  onClose,
  currentShift,
  onSuccess,
}) {
  const [closingCashActual, setClosingCashActual] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openingCash = currentShift?.opening_cash || 0;
  const cashTotal = currentShift?.cash_total || 0;
  const transactionCount = currentShift?.transaction_count || 0;
  const closingCashExpected = currentShift?.closing_cash_expected || 0;

  const actualCash = Number(closingCashActual.replace(/[^0-9]/g, ""));
  const difference = actualCash - closingCashExpected;
  const isDifferenceNegative = difference < 0;

  const summaryItems = [
    { label: "Kas Awal", value: openingCash },
    {
      label: "Total Transaksi Cash",
      value: cashTotal,
      sub: `${transactionCount} transaksi`,
    },
    { label: "Total Cash Masuk", value: cashTotal },
  ];

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setError("");

    if (isNaN(actualCash) || actualCash < 0) {
      setError("Kas aktual harus berupa angka dan tidak boleh negatif.");
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmClose = async () => {
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const payload = {
        closing_cash_actual: actualCash,
        notes: notes.trim() || undefined,
      };

      const res = await closeShift(payload);
      const body = res.data?.data ?? res.data;

      if (onSuccess) onSuccess(body);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menutup shift.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  // ─── ESC key support ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) {
        if (showConfirm) {
          setShowConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showConfirm, submitting, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* ─── Main Modal ────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
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
                  Tutup Shift
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {currentShift?.shift_number || ""}
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

          <div className="space-y-6">
            {/* ─── Read Only Summary ──────────────────────────────────── */}
            <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-gray-800/60 p-4 space-y-3">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>
                    {item.sub && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {item.sub}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Rp {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
              <div className="border-t border-gray-200/60 dark:border-gray-700/60 pt-3 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Kas Diharapkan
                </p>
                <p className="text-base font-bold text-accent">
                  Rp {formatCurrency(closingCashExpected)}
                </p>
              </div>
            </div>

            {/* ─── Kas Aktual Input ───────────────────────────────────── */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                Kas Aktual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Rp
                </span>
                <input
                  type="text"
                  placeholder="0"
                  value={
                    closingCashActual
                      ? Number(
                          closingCashActual.replace(/[^0-9]/g, ""),
                        ).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setClosingCashActual(value);
                    setError("");
                  }}
                  autoFocus
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 pl-12 pr-4 py-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* ─── Selisih Preview ────────────────────────────────────── */}
            {closingCashActual && (
              <div
                className={`rounded-2xl border px-4 py-3 flex items-center justify-between ${
                  isDifferenceNegative
                    ? "border-red-200/60 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20"
                    : "border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20"
                }`}
              >
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selisih
                </p>
                <p
                  className={`text-base font-bold ${
                    isDifferenceNegative
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isDifferenceNegative ? "- " : "+ "}Rp{" "}
                  {formatCurrency(Math.abs(difference))}
                </p>
              </div>
            )}

            {/* ─── Notes ──────────────────────────────────────────────── */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                Catatan{" "}
                <span className="text-gray-300 font-normal">(opsional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) setNotes(e.target.value);
                }}
                placeholder="Catatan untuk shift ini..."
                rows={2}
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400 resize-none"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {notes.length}/1000
              </p>
            </div>

            {/* ─── Error ──────────────────────────────────────────────── */}
            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* ─── Submit ─────────────────────────────────────────────── */}
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="w-full rounded-2xl py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              {submitting ? "Menutup Shift..." : "Tutup Shift"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Confirmation Dialog ────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-800/40">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Tutup Shift?
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  Shift yang sudah ditutup tidak dapat dibuka kembali.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Pastikan perhitungan kas sudah sesuai.
            </p>

            {/* ─── Summary in Confirmation ──────────────────────────────── */}
            <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-gray-800/60 p-4 space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Kas Diharapkan
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Rp {formatCurrency(closingCashExpected)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Kas Aktual
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Rp {formatCurrency(actualCash)}
                </span>
              </div>
              <div className="border-t border-gray-200/60 dark:border-gray-700/60 pt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Selisih
                </span>
                <span
                  className={`font-bold ${
                    isDifferenceNegative
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isDifferenceNegative ? "- " : "+ "}Rp{" "}
                  {formatCurrency(Math.abs(difference))}
                </span>
              </div>
            </div>

            {/* ─── Actions ──────────────────────────────────────────── */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClose}
                disabled={submitting}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                {submitting ? "Menutup Shift..." : "Ya, Tutup Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
