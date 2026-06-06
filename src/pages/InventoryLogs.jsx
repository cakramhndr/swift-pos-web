import { useState, useEffect, useMemo } from "react";
import useInventory from "@/hooks/useInventory";

import {
  ClipboardList,
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Loader2,
  Download,
} from "lucide-react";
import { exportInventoryLogsPDF } from "@/lib/exportUtils";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatRp = (num) => {
  if (isNaN(num)) return "";
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
};

const formatDate = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ITEMS_PER_PAGE = 10;

// ─── Type Badge ──────────────────────────────────────────────────────────
const typeBadge = (type) => {
  switch (type) {
    case "sale":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium text-red-300">
          Penjualan
        </span>
      );
    case "restock":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          Restock
        </span>
      );
    case "adjustment":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-300">
          Adjustment
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/15 border border-gray-500/30 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {type}
        </span>
      );
  }
};

// ─── Qty Display ─────────────────────────────────────────────────────────
const qtyDisplay = (qty) => {
  const num = Number(qty || 0);
  if (num > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-semibold text-green-600 dark:text-green-400">
        <Plus className="h-3 w-3" />
        {num}
      </span>
    );
  }
  if (num < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-semibold text-red-600 dark:text-red-400">
        <Minus className="h-3 w-3" />
        {Math.abs(num)}
      </span>
    );
  }
  return <span className="text-gray-400 dark:text-gray-400">0</span>;
};

// ─── Time filter helper ──────────────────────────────────────────────────
const getTimeRangeStart = (range) => {
  const now = new Date();
  switch (range) {
    case "7":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    default:
      return null;
  }
};

export default function InventoryLogs() {
  const { logs, fetchLogs } = useInventory();

  const [activeTab, setActiveTab] = useState("movement");

  // ─── Stock Movement State ─────────────────────────────────────────────
  const [movementSearch, setMovementSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [movementTimeFilter, setMovementTimeFilter] = useState("all");
  const [movementPage, setMovementPage] = useState(1);

  // ─── Loading state ────────────────────────────────────────────────────
  const [logsLoading, setLogsLoading] = useState(false);

  // ─── Fetch logs on mount ──────────────────────────────────────────────
  useEffect(() => {
    setLogsLoading(true);
    fetchLogs().finally(() => setLogsLoading(false));
  }, [fetchLogs]);

  // ─── Compute stats from API logs ─────────────────────────────────────
  const totalMovements = logs.length;

  const thisMonthMovements = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return logs.filter((m) => {
      const d = new Date(m.created_at);
      return d >= startOfMonth;
    });
  }, [logs]);

  const stockInMonth = useMemo(
    () =>
      thisMonthMovements
        .filter((m) => Number(m.quantity) > 0)
        .reduce((sum, m) => sum + Number(m.quantity), 0),
    [thisMonthMovements],
  );

  const stockOutMonth = useMemo(
    () =>
      thisMonthMovements
        .filter((m) => Number(m.quantity) < 0)
        .reduce((sum, m) => sum + Math.abs(Number(m.quantity)), 0),
    [thisMonthMovements],
  );

  // ─── Filter movement logs ─────────────────────────────────────────────
  const filteredMovements = useMemo(() => {
    const timeStart = getTimeRangeStart(movementTimeFilter);
    return logs.filter((m) => {
      const productName =
        m.product?.name || m.product_name || "";
      const matchSearch =
        movementSearch === "" ||
        productName.toLowerCase().includes(movementSearch.toLowerCase());
      const matchType =
        movementTypeFilter === "all" || m.type === movementTypeFilter;
      const matchTime =
        !timeStart || new Date(m.created_at) >= timeStart;
      return matchSearch && matchType && matchTime;
    });
  }, [logs, movementSearch, movementTypeFilter, movementTimeFilter]);

  const totalMovementPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE);
  const paginatedMovements = filteredMovements.slice(
    (movementPage - 1) * ITEMS_PER_PAGE,
    movementPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Inventory Logs
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Riwayat pergerakan stok
            </p>
          </div>
        </div>
        <button
          onClick={() => exportInventoryLogsPDF(logs)}
          className="flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent-light hover:-translate-y-0.5"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* ══════════════ Stats ═════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400 tracking-wide mb-1">
            Total Pergerakan
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {logsLoading ? "—" : totalMovements}
          </p>
        </div>
        <div className="rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-medium text-gray-400 tracking-wide">
              Stok Masuk (Bulan Ini)
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {logsLoading ? "—" : `+${stockInMonth}`}
          </p>
        </div>
        <div className="rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <p className="text-xs font-medium text-gray-400 tracking-wide">
              Stok Keluar (Bulan Ini)
            </p>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {logsLoading ? "—" : `-${stockOutMonth}`}
          </p>
        </div>
      </div>

      {/* ══════════════ Tab Bar ═══════════════════════════════════════════ */}
      <div className="flex gap-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-1 w-fit">
        {["movement"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Stock Movement
          </button>
        ))}
      </div>

      {/* ══════════════ Loading State ══════════════════════════════════════ */}
      {logsLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      {/* ══════════════ Movement Tab ═══════════════════════════════════════ */}
      {!logsLoading && activeTab === "movement" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Cari produk..."
                value={movementSearch}
                onChange={(e) => {
                  setMovementSearch(e.target.value);
                  setMovementPage(1);
                }}
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <select
              value={movementTypeFilter}
              onChange={(e) => {
                setMovementTypeFilter(e.target.value);
                setMovementPage(1);
              }}
              className="rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent cursor-pointer dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Semua Tipe</option>
              <option value="sale">Penjualan</option>
              <option value="restock">Restock</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <select
              value={movementTimeFilter}
              onChange={(e) => {
                setMovementTimeFilter(e.target.value);
                setMovementPage(1);
              }}
              className="rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent cursor-pointer dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Semua Waktu</option>
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/60">
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Produk
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Tipe
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400 text-right">
                    Qty
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400 text-right">
                    Stok Sebelum
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400 text-right">
                    Stok Sesudah
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Catatan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      Tidak ada data pergerakan stok
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMovements.map((log) => {
                    const productName =
                      log.product?.name || log.product_name || "—";
                    return (
                      <TableRow
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {productName}
                            </p>
                            {log.product?.sku && (
                              <p className="text-xs font-mono text-gray-400">
                                {log.product.sku}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{typeBadge(log.type)}</TableCell>
                        <TableCell className="text-right">
                          {qtyDisplay(log.quantity)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                          {log.stock_before ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-gray-900 dark:text-white">
                          {log.stock_after ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                          {log.notes || log.reason || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalMovementPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-400">
                Menampilkan{" "}
                {Math.min((movementPage - 1) * ITEMS_PER_PAGE + 1, filteredMovements.length)}–
                {Math.min(movementPage * ITEMS_PER_PAGE, filteredMovements.length)}{" "}
                dari {filteredMovements.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMovementPage((p) => Math.max(p - 1, 1))}
                  disabled={movementPage <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold text-white shadow-sm bg-accent">
                  {movementPage}
                </span>
                <button
                  onClick={() =>
                    setMovementPage((p) => Math.min(p + 1, totalMovementPages))
                  }
                  disabled={movementPage >= totalMovementPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
