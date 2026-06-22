import { useState } from "react";
import { X } from "lucide-react";

export default function OpenShiftModal({ onClose, onSubmit, loading }) {
  const [openingCash, setOpeningCash] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cash = Number(openingCash.replace(/[^0-9]/g, ""));
    if (isNaN(cash) || cash < 0) {
      setError("Kas awal harus berupa angka dan tidak boleh negatif.");
      return;
    }

    const result = await onSubmit(cash);

    if (result && result.success === false) {
      setError(result.message || "Gagal membuka shift.");
      return;
    }
  };

  return (
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
                Buka Shift
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                Masukkan kas awal untuk memulai shift
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
              Kas Awal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                Rp
              </span>
              <input
                type="text"
                placeholder="0"
                value={
                  openingCash ? Number(openingCash).toLocaleString("id-ID") : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setOpeningCash(value);
                  setError("");
                }}
                autoFocus
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 pl-12 pr-4 py-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            {loading ? "Membuka Shift..." : "Buka Shift"}
          </button>
        </form>
      </div>
    </div>
  );
}
