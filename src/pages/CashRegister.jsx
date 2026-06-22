import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import useShifts from "@/hooks/useShifts";
import ShiftStatusCard from "@/components/shifts/ShiftStatusCard";
import OpenShiftModal from "@/components/shifts/OpenShiftModal";
import { Clock, CircleDollarSign } from "lucide-react";

export default function CashRegister() {
  const { currentShift, loading, fetchCurrentShift, handleOpenShift } =
    useShifts();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurrentShift();
  }, [fetchCurrentShift]);

  const onSubmitOpenShift = useCallback(
    async (openingCash) => {
      setSubmitting(true);
      const result = await handleOpenShift(openingCash);
      setSubmitting(false);

      if (result.success) {
        toast.success("Shift berhasil dibuka");
        setShowOpenModal(false);
        await fetchCurrentShift();
      }

      return result;
    },
    [handleOpenShift, fetchCurrentShift],
  );

  return (
    <div className="space-y-6">
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Cash Register
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
                Kelola shift kasir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Loading State ─────────────────────────────────────────────── */}
      {loading && !currentShift && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      )}

      {/* ─── Active Shift State ────────────────────────────────────────── */}
      {!loading && currentShift && (
        <div className="space-y-6">
          <ShiftStatusCard shift={currentShift} />

          <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/30">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tutup Shift
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    Tersedia di Sprint berikutnya
                  </p>
                </div>
              </div>
              <button
                disabled
                title="Tersedia di Sprint berikutnya"
                className="rounded-2xl border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
              >
                Tutup Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── No Active Shift State ─────────────────────────────────────── */}
      {!loading && !currentShift && (
        <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div
            className="h-1 bg-gradient-to-r"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
            }}
          />
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 mb-4">
              <CircleDollarSign className="h-8 w-8 text-gray-400 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Belum ada shift aktif
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-400 mb-6 max-w-md">
              Buka shift untuk mulai mencatat transaksi kasir. Pastikan kas awal
              sudah sesuai.
            </p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="rounded-2xl px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              Buka Shift
            </button>
          </div>
        </div>
      )}

      {/* ─── Open Shift Modal ──────────────────────────────────────────── */}
      {showOpenModal && (
        <OpenShiftModal
          onClose={() => setShowOpenModal(false)}
          onSubmit={onSubmitOpenShift}
          loading={submitting}
        />
      )}
    </div>
  );
}
