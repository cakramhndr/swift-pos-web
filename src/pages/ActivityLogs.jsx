import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import useActivityLogs from "@/hooks/useActivityLogs";

import {
  ClipboardList,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// ─── Helpers ─────────────────────────────────────────────────────────────
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

const ITEMS_PER_PAGE = 20;

// ─── Action Badge ─────────────────────────────────────────────────────────
const actionBadge = (action) => {
  switch (action) {
    case "created":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          Created
        </span>
      );
    case "updated":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-300">
          Updated
        </span>
      );
    case "deleted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium text-red-300">
          Deleted
        </span>
      );
    case "received":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-300">
          Received
        </span>
      );
    case "posted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-300">
          Posted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/15 border border-gray-500/30 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {action}
        </span>
      );
  }
};

// ─── Module Badge ─────────────────────────────────────────────────────────
const moduleBadge = (module) => {
  const colors = {
    products: "bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-300",
    suppliers:
      "bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-300",
    purchase_orders:
      "bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-300",
    stock_opname:
      "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300",
  };
  const colorClass =
    colors[module] ||
    "bg-gray-500/15 border-gray-500/30 text-gray-600 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {module.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
};

export default function ActivityLogs() {
  const { logs, loading, meta, fetchLogs } = useActivityLogs();

  // ─── Filter State ─────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const searchTimerRef = useRef(null);

  // ─── Compute server-side page count from API response ────────────────
  const totalPages = meta?.last_page ?? 1;
  const totalRecords = meta?.total ?? logs.length;

  // ─── Fetch logs with given page & filter params ───────────────────────
  const fetchLogsPage = useCallback(
    (p, mod, act, q) => {
      setPage(p);
      const params = { page: p, per_page: ITEMS_PER_PAGE };
      if (mod && mod !== "all") params.module = mod;
      if (act && act !== "all") params.action = act;
      if (q && q.trim()) params.search = q.trim();
      fetchLogs(params);
    },
    [fetchLogs],
  );

  // Fetch logs on mount
  useEffect(() => {
    const params = { page: 1, per_page: ITEMS_PER_PAGE };
    fetchLogs(params).finally(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Debounced search refetch ─────────────────────────────────────────
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchLogsPage(1, moduleFilter, actionFilter, search);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ─── Handle page change ─────────────────────────────────────────────
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchLogsPage(p, moduleFilter, actionFilter, search);
  };

  // ─── Generate page numbers ──────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1));
    for (let i = 0; i < Math.min(maxVisible, totalPages); i++) {
      const p = start + i;
      if (p <= totalPages) pages.push(p);
    }
    return pages;
  }, [page, totalPages]);

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
              Activity Logs
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Riwayat aktivitas pengguna
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ Loading State ══════════════════════════════════════ */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      {/* ══════════════ Content ════════════════════════════════════════════ */}
      {!loading && (
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
                placeholder="Cari aktivitas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                const val = e.target.value;
                setModuleFilter(val);
                setPage(1);
                const params = { page: 1, per_page: ITEMS_PER_PAGE };
                if (val !== "all") params.module = val;
                if (actionFilter !== "all") params.action = actionFilter;
                if (search.trim()) params.search = search.trim();
                fetchLogs(params);
              }}
              className="rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent cursor-pointer dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Semua Modul</option>
              <option value="products">Products</option>
              <option value="suppliers">Suppliers</option>
              <option value="purchase_orders">Purchase Orders</option>
              <option value="stock_opname">Stock Opname</option>
            </select>
            <select
              value={actionFilter}
              onChange={(e) => {
                const val = e.target.value;
                setActionFilter(val);
                setPage(1);
                const params = { page: 1, per_page: ITEMS_PER_PAGE };
                if (moduleFilter !== "all") params.module = moduleFilter;
                if (val !== "all") params.action = val;
                if (search.trim()) params.search = search.trim();
                fetchLogs(params);
              }}
              className="rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent cursor-pointer dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Semua Aksi</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="received">Received</option>
              <option value="posted">Posted</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/60">
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Date
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    User
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Module
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Action
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-gray-400">
                    Description
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      Tidak ada data aktivitas
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.user?.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell>{moduleBadge(log.module)}</TableCell>
                      <TableCell>{actionBadge(log.action)}</TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                        {log.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination — matches InventoryLogs.jsx styling */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/40">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({totalRecords} total)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      p === page
                        ? "bg-accent text-white shadow-sm"
                        : "border border-gray-200 dark:border-gray-700 text-gray-600 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={page >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
