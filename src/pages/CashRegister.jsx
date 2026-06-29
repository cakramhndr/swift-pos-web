import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import useShifts from "@/hooks/useShifts";
import ShiftStatusCard from "@/components/shifts/ShiftStatusCard";
import ShiftHistoryTable from "@/components/shifts/ShiftHistoryTable";
import ShiftDetailModal from "@/components/shifts/ShiftDetailModal";
import OpenShiftModal from "@/components/shifts/OpenShiftModal";
import CloseShiftModal from "@/components/shifts/CloseShiftModal";
import { Clock, CircleDollarSign, History, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function formatDuration(durationMinutes) {
  if (durationMinutes == null || durationMinutes < 0) return "-";
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

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

function getDurationBadgeClass(durationMinutes) {
  if (durationMinutes == null) return "";
  const hours = durationMinutes / 60;
  if (hours <= 8)
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40";
  if (hours <= 12)
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40";
  return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800/40";
}

export default function CashRegister() {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];
  const hasManageShifts = userPermissions.includes("manage shifts");

  const {
    currentShift,
    loading,
    shiftHistory,
    historyLoading,
    historyMeta,
    openShifts,
    openShiftsLoading,
    fetchCurrentShift,
    handleOpenShift,
    fetchShiftHistory,
    fetchOpenShifts,
  } = useShifts();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedShift, setSelectedShift] = useState(null);

  const tabs = [
    { id: "active", label: "Shift Aktif", icon: CircleDollarSign },
    ...(hasManageShifts
      ? [
          { id: "history", label: "Riwayat Shift", icon: History },
          { id: "open", label: "Open Shift", icon: ShieldCheck },
        ]
      : []),
  ];

  // Sort open shifts: longest duration first
  const sortedOpenShifts = useMemo(() => {
    return [...(openShifts || [])].sort(
      (a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0),
    );
  }, [openShifts]);

  // Fetch current shift + open shifts on mount
  useEffect(() => {
    fetchCurrentShift();
    fetchOpenShifts();
  }, [fetchCurrentShift, fetchOpenShifts]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchShiftHistory({ page: 1 });
    }
  }, [activeTab, fetchShiftHistory]);

  const onSubmitOpenShift = useCallback(
    async (openingCash) => {
      setSubmitting(true);
      const result = await handleOpenShift(openingCash);
      setSubmitting(false);

      if (result.success) {
        toast.success("Shift berhasil dibuka");
        setShowOpenModal(false);
        await fetchCurrentShift();
        await fetchOpenShifts();
      }

      return result;
    },
    [handleOpenShift, fetchCurrentShift, fetchOpenShifts],
  );

  const onSubmitCloseShift = useCallback(async () => {
    toast.success("Shift berhasil ditutup");
    setShowCloseModal(false);
    await fetchCurrentShift();
    await fetchOpenShifts();
  }, [fetchCurrentShift, fetchOpenShifts]);

  const handleHistoryFilter = useCallback(
    async (filters) => {
      await fetchShiftHistory({ ...filters, page: 1 });
    },
    [fetchShiftHistory],
  );

  const handleHistoryPageChange = useCallback(
    async (page) => {
      await fetchShiftHistory({ page });
    },
    [fetchShiftHistory],
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

      {/* ─── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 dark:bg-gray-800/60 p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────────── */}
      {activeTab === "active" && (
        <>
          {/* ─── Loading State ───────────────────────────────────────────── */}
          {loading && !currentShift && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          )}

          {/* ─── Active Shift State ──────────────────────────────────────── */}
          {!loading && currentShift && (
            <div className="space-y-6">
              <ShiftStatusCard shift={currentShift} />

              {hasManageShifts && (
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
                          Tutup shift dan hitung selisih kas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="rounded-2xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      Tutup Shift
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── No Active Shift State ───────────────────────────────────── */}
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
                  Buka shift untuk mulai mencatat transaksi kasir. Pastikan kas
                  awal sudah sesuai.
                </p>
                {hasManageShifts && (
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
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <ShiftHistoryTable
          shifts={shiftHistory}
          loading={historyLoading}
          meta={historyMeta}
          onFilter={handleHistoryFilter}
          onPageChange={handleHistoryPageChange}
        />
      )}

      {activeTab === "open" && (
        <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div
            className="h-1 bg-gradient-to-r"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
            }}
          />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Cash Register Masih Aktif ({openShifts.length})
              </h2>
            </div>

            {openShiftsLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin h-6 w-6 border-4 border-accent border-t-transparent rounded-full" />
              </div>
            )}

            {!openShiftsLoading && sortedOpenShifts.length === 0 && (
              <div className="flex items-center gap-2 py-4 text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <p className="text-sm">
                  Tidak ada Cash Register yang masih aktif.
                </p>
              </div>
            )}

            {!openShiftsLoading && sortedOpenShifts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedOpenShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {shift.user?.name || "—"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 font-mono">
                          {shift.shift_number}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getDurationBadgeClass(shift.duration_minutes)}`}
                      >
                        {formatDuration(shift.duration_minutes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40`}
                      >
                        OPEN
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>
                        <span className="font-medium">Toko:</span>{" "}
                        {shift.store?.name || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Dibuka:</span>{" "}
                        {formatDateTime(shift.opened_at)}
                      </p>
                      <p>
                        <span className="font-medium">Kas Awal:</span> Rp{" "}
                        {formatCurrency(shift.opening_cash)}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedShift(shift)}
                      className="w-full rounded-xl py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Shift Detail Modal ───────────────────────────────────────── */}
      {selectedShift && (
        <ShiftDetailModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}

      {/* ─── Open Shift Modal ──────────────────────────────────────────── */}
      {showOpenModal && (
        <OpenShiftModal
          onClose={() => setShowOpenModal(false)}
          onSubmit={onSubmitOpenShift}
          loading={submitting}
        />
      )}

      {showCloseModal && (
        <CloseShiftModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          currentShift={currentShift}
          onSuccess={onSubmitCloseShift}
        />
      )}
    </div>
  );
}
