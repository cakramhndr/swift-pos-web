import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useStockOpnames from "@/hooks/useStockOpnames";
import { createStockOpname } from "@/api/stockOpnames";
import { getProducts } from "@/api/products";
import {
  ClipboardList,
  Plus,
  Save,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ── Import stock opname components ─────────────────────────────────────
import StockOpnameStats from "@/components/stock-opname/StockOpnameStats";
import StockOpnameTable from "@/components/stock-opname/StockOpnameTable";
import StockOpnameFilters from "@/components/stock-opname/StockOpnameFilters";

// ── Skeleton ──────────────────────────────────────────────────────────
function WidgetSkeleton() {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse p-5">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded" />
    </div>
  );
}

// ── Main Stock Opname List Page ─────────────────────────────────────────
export default function StockOpnames() {
  const navigate = useNavigate();
  const { data, loading, meta, refetch, setSearch, setPage, setStatus, setDateRange } = useStockOpnames({ perPage: 15 });

  // ── Filters ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Create Session Modal ───────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [productList, setProductList] = useState([]);

  // ── Fetch data on mount ───────────────────────────────────────────
  useEffect(() => { refetch(); }, [refetch]);

  // ── Load products when dialog opens ────────────────────────────────
  useEffect(() => {
    if (dialogOpen) {
      getProducts({ per_page: 200 }).then(res => {
        const d = res.data?.data || res.data;
        setProductList(Array.isArray(d) ? d : []);
      }).catch(() => setProductList([]));
    }
  }, [dialogOpen]);

  // ── Derived stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const total = list.length;
    const draft = list.filter((o) => o.status === "draft").length;
    const inProgress = list.filter((o) => o.status === "in_progress").length;
    const completed = list.filter((o) => o.status === "completed").length;
    const cancelled = list.filter((o) => o.status === "cancelled").length;
    const adjustmentValue = list.reduce((sum, session) => {
      const items = session.items || [];
      return sum + items.reduce((s, i) => s + Math.abs(i.difference ?? 0) * (i.product?.unit_cost ?? 0), 0);
    }, 0);
    return { total, draft, inProgress, completed, cancelled, adjustmentValue };
  }, [data]);

  // ── Filter logic ───────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? data : [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((o) =>
        (o.reference_number || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (dateFrom) {
      list = list.filter((o) => o.created_at >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((o) => o.created_at <= dateTo + "T23:59:59");
    }
    return list;
  }, [data, searchQuery, statusFilter, dateFrom, dateTo]);

  // ── Handle filter changes ──────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setSearch(val);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setStatus(val);
  };

  const handleDateFromChange = (val) => {
    setDateFrom(val);
    setDateRange(val, dateTo);
  };

  const handleDateToChange = (val) => {
    setDateTo(val);
    setDateRange(dateFrom, val);
  };

  const handleClear = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setStatus("");
    setDateRange("", "");
  };

  // ── Create session handler ─────────────────────────────────────────
  const handleCreateSession = async () => {
    if (productList.length === 0) {
      toast.error("No products available to create a session");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        notes: notes || null,
        items: productList.map((p) => ({
          product_id: p.id,
          variant_id: null,
          system_stock: Number(p.stock ?? 0),
          physical_stock: Number(p.stock ?? 0),
          notes: null,
        })),
      };

      const res = await createStockOpname(body);
      const newData = res.data?.data || res.data;
      toast.success("Stock opname session created successfully");
      setDialogOpen(false);
      setNotes("");
      if (newData?.id) {
        navigate(`/stock-opnames/${newData.id}`);
      } else {
        refetch();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ═══ 1. HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Stock Opname</h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">Manage inventory audit sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}>
                <Plus className="h-4 w-4" /> New Stock Opname
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl sm:max-w-lg p-0 overflow-hidden">
              <div className="relative">
                <div className="h-1 rounded-t-3xl" style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))" }} />
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
                        <ClipboardList className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">New Stock Opname</span>
                        <p className="text-xs text-gray-400 mt-0.5 font-normal">Create a new stock opname session</p>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-6 pt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Optional notes about this session..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-[#ececf2] dark:border-gray-700 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This will create a draft session with <strong className="text-gray-700 dark:text-gray-200">{productList.length}</strong> products. You can start counting once the session is created.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setDialogOpen(false); setNotes(""); }}
                      disabled={submitting}
                      className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateSession}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 flex-1 rounded-2xl bg-gradient-to-r py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                      style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Create Session
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ═══ 2. SUMMARY CARDS ═══ */}
      <StockOpnameStats stats={stats} />

      {/* ═══ 3. FILTERS ═══ */}
      <StockOpnameFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onClear={handleClear}
        onRefresh={() => refetch()}
        loading={loading}
      />

      {/* ═══ 4. TABLE ═══ */}
      {loading && data.length === 0 ? (
        <div>
          <WidgetSkeleton />
        </div>
      ) : (
        <StockOpnameTable
          data={filteredData}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}