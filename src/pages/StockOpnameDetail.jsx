import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardList,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Barcode,
  MoreHorizontal,
  ChevronDown,
  Play,
  CheckCircle,
  Ban,
  BarChart3,
  Activity,
  Filter,
  Clock,
  ListChecks,
  Layers,
} from "lucide-react";
import {
  getStockOpnameById,
  startStockOpname,
  completeStockOpname,
  cancelStockOpname,
  updateStockOpname,
} from "@/api/stockOpnames";
import KpiCard from "@/components/product-detail/KpiCard";
import TabNavigation from "@/components/product-detail/TabNavigation";
import StockOpnameCompleteModal from "@/components/stock-opname/StockOpnameCompleteModal";
import { formatRp, formatDateShort } from "@/lib/purchaseUtils";

// ── Tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "counting", label: "Counting", icon: Activity },
  { key: "activity-logs", label: "Activity Logs", icon: ClipboardList },
];

// ── Helper: format date+time ────────────────────────────────────────────
function formatDateTime(ds) {
  if (!ds) return null;
  try {
    const d = new Date(ds);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ds;
  }
}

// ── Status badge ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const variants = {
    draft: { label: "Draft", classes: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    in_progress: { label: "In Progress", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50" },
    completed: { label: "Completed", classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50" },
    cancelled: { label: "Cancelled", classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50" },
  };
  const v = variants[status] || variants.draft;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${v.classes}`}>
      {v.label}
    </span>
  );
}

// ── Difference Badge ────────────────────────────────────────────────────
function DiffBadge({ value }) {
  if (value === 0) return <span className="text-gray-400 text-[13px]">0</span>;
  if (value > 0) return <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[13px]">+{value}</span>;
  return <span className="text-red-600 dark:text-red-400 font-medium text-[13px]">{value}</span>;
}

// ── Item Status Badge ───────────────────────────────────────────────────
function ItemStatusBadge({ item }) {
  const diff = item.difference ?? 0;
  if (item.system_stock == null) return <span className="text-[11px] text-gray-400">Unchecked</span>;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
        Match
      </span>
    );
  }
  if (diff > 0) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
        Excess
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30">
      Missing
    </span>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-6">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ── Info Row ────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#ececf2] dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value ?? "—"}</span>
    </div>
  );
}

// ── Statistics row (compact stat item) ──────────────────────────────────
function StatItem({ label, value, color = "text-gray-900 dark:text-white" }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

// ── Event Timeline Item ─────────────────────────────────────────────────
function TimelineItem({ time, title, description, icon: Icon, color }) {
  return (
    <div className="flex gap-3 pb-4 last:pb-0 relative">
      <div className="flex flex-col items-center">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color || "bg-gray-100 dark:bg-gray-700"}`}>
          {Icon && <Icon className="h-3.5 w-3.5" />}
        </div>
        <div className="flex-1 w-px bg-[#ececf2] dark:bg-gray-700 mt-1" />
      </div>
      <div className="flex-1 pb-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        {time && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{time}</p>}
      </div>
    </div>
  );
}

// ── Actions Dropdown ────────────────────────────────────────────────────
function ActionsDropdown({ onClose, onAction, status }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const items = [];
  if (status === "draft") {
    items.push({ key: "cancel", label: "Cancel Session", icon: Ban, danger: true });
  }
  if (status === "in_progress") {
    items.push({ key: "cancel", label: "Cancel Session", icon: Ban, danger: true });
  }
  if (items.length === 0) {
    items.push({ key: "none", label: "No actions available", icon: null, disabled: true });
  }

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-56 rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50 py-1.5">
      {items.map((item) =>
        item.disabled ? (
          <div key={item.key} className="px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500 text-center">No actions available</div>
        ) : (
          <button
            key={item.key}
            onClick={() => { onAction(item.key); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              item.danger ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ── Resolve default tab from status ─────────────────────────────────────
function getDefaultTab(status) {
  if (status === "in_progress") return "counting";
  return "overview";
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN PAGE: StockOpnameDetail
// ═════════════════════════════════════════════════════════════════════════
export default function StockOpnameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [showActions, setShowActions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Complete modal state ──────────────────────────────────────────
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  // ── Counting tab state ────────────────────────────────────────────
  const [countSearch, setCountSearch] = useState("");
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [savingRowId, setSavingRowId] = useState(null);
  const debounceTimers = useRef({});

  // ── Fetch session ─────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStockOpnameById(id);
      const d = res.data?.data || res.data;
      setSession(d);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load stock opname";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // ── Smart default tab: auto-select on first load only ────────────
  const initialTabSet = useRef(false);
  useEffect(() => {
    if (session && !initialTabSet.current) {
      initialTabSet.current = true;
      setActiveTab(getDefaultTab(session.status));
    }
  }, [session]);

  // ── Derived values ────────────────────────────────────────────────
  const items = useMemo(() => session?.items || [], [session]);
  const status = session?.status || "draft";
  const isLocked = status === "completed" || status === "cancelled";
  const totalItems = items.length;

  // ✅ BUG 1: draft sessions have no counted items
  const checkedItems = status === "draft"
    ? 0
    : items.filter(
        (i) => i.physical_stock !== null && i.physical_stock !== undefined
      ).length;

  const remainingItems = totalItems - checkedItems;
  const progressPct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  const diffItems = items.filter((i) => (i.difference ?? 0) !== 0);
  const missingItems = diffItems.filter((i) => (i.difference ?? 0) < 0).length;
  const excessItems = diffItems.filter((i) => (i.difference ?? 0) > 0).length;
  const matchedItems = items.filter((i) => (i.difference ?? 0) === 0 && i.physical_stock != null).length;
  const estimatedValue = items.reduce((sum, i) => sum + Math.abs(i.difference ?? 0) * (i.product?.unit_cost ?? 0), 0);

  // ── Build activity log events from session timestamps ────────────
  const activityEvents = useMemo(() => {
    const events = [];
    if (session?.created_at) {
      events.push({
        key: "created",
        time: formatDateTime(session.created_at),
        title: "Session Created",
        description: `Stock opname ${session.reference_number || ""} was created`,
        icon: ClipboardList,
        color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      });
    }
    if (session?.started_at) {
      events.push({
        key: "started",
        time: formatDateTime(session.started_at),
        title: "Session Started",
        description: "Counting process was initiated",
        icon: Play,
        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      });
    }
    if (session?.completed_at) {
      events.push({
        key: "completed",
        time: formatDateTime(session.completed_at),
        title: "Session Completed",
        description: "All items counted and inventory adjusted",
        icon: CheckCircle,
        color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      });
    }
    if (session?.cancelled_at) {
      events.push({
        key: "cancelled",
        time: formatDateTime(session.cancelled_at),
        title: "Session Cancelled",
        description: "Stock opname was cancelled",
        icon: XCircle,
        color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      });
    }
    return events;
  }, [session]);

  // ── Filtered items for counting tab ───────────────────────────────
  const filteredItems = useMemo(() => {
    if (!countSearch.trim()) return items;
    const q = countSearch.toLowerCase();
    return items.filter((i) => {
      const name = (i.product?.name || "").toLowerCase();
      const sku = (i.product?.sku || "").toLowerCase();
      const barcode = (i.product?.barcode || "").toLowerCase();
      return name.includes(q) || sku.includes(q) || barcode.includes(q);
    });
  }, [items, countSearch]);

  // ── Handle physical stock change ──────────────────────────────────
  const handlePhysicalStockChange = (itemId, value) => {
    const raw = parseInt(value, 10);
    const newVal = isNaN(raw) ? 0 : raw;

    setSession((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((i) => {
        if (i.id !== itemId) return i;
        const diff = newVal - (i.system_stock ?? 0);
        return { ...i, physical_stock: newVal, difference: diff };
      });
      return { ...prev, items: updatedItems };
    });

    if (debounceTimers.current[itemId]) clearTimeout(debounceTimers.current[itemId]);
    debounceTimers.current[itemId] = setTimeout(async () => {
      setSavingRowId(itemId);
      try {
        await updateStockOpname(id, {
          items: items.map((i) => ({
            product_id: i.product_id,
            variant_id: i.variant_id || null,
            system_stock: i.system_stock ?? 0,
            physical_stock: i.id === itemId ? newVal : (i.physical_stock ?? i.system_stock ?? 0),
            notes: i.notes || null,
          })),
        });
      } catch {
        toast.error("Failed to update item");
      } finally {
        setSavingRowId(null);
      }
    }, 800);
  };

  // ── Barcode search ────────────────────────────────────────────────
  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) return;
    const q = barcodeInput.toLowerCase();
    const found = items.findIndex((i) => {
      const bc = (i.product?.barcode || i.product?.sku || "").toLowerCase();
      return bc.includes(q);
    });
    if (found >= 0) {
      setCountSearch(barcodeInput);
      setBarcodeModalOpen(false);
      setBarcodeInput("");
      setTimeout(() => {
        const el = document.getElementById(`so-item-${items[found]?.id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      toast.error("No matching product found for this barcode");
    }
  };

  // ── ISSUE 2: Confirmation modal (replaces browser confirm) ────
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", description: "", action: null, buttonLabel: "Confirm" });

  const openConfirmModal = (title, description, action, buttonLabel) => {
    setConfirmModal({ open: true, title, description, action, buttonLabel: buttonLabel || "Start Session" });
  };

  // ── ISSUE 1: Use refetch() pattern for all state transitions ────
  const handleStartSession = () => {
    openConfirmModal(
      "Start Stock Opname Session?",
      "Products will be loaded and counting will begin.",
      async () => {
        setSubmitting(true);
        try {
          await startStockOpname(id);
          await fetchSession();
          toast.success("Session started — begin counting products");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to start session");
        } finally {
          setSubmitting(false);
        }
      },
      "Start Session"
    );
  };

  const handleCompleteSessionConfirm = async () => {
    setSubmitting(true);
    try {
      await completeStockOpname(id);
      await fetchSession();
      setCompleteModalOpen(false);
      toast.success("Stock opname completed. Inventory has been updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete session");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = () => {
    openConfirmModal(
      "Cancel Stock Opname Session?",
      "This stock opname will be cancelled. No modifications will be allowed afterward.",
      async () => {
        setSubmitting(true);
        try {
          await cancelStockOpname(id);
          await fetchSession();
          toast.success("Session cancelled");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to cancel session");
        } finally {
          setSubmitting(false);
        }
      },
      "Cancel Session"
    );
  };

  const handleAction = (key) => {
    if (key === "cancel") handleCancelSession();
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (loading && !session) return <DetailSkeleton />;

  // ── Error state ────────────────────────────────────────────────────
  if (error || !session) {
    return (
      <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
            <ClipboardList className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{error || "Stock opname not found"}</p>
          <button onClick={() => navigate("/stock-opnames")}
            className="mt-4 flex items-center gap-2 rounded-2xl border border-[#ececf2] dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60">
            <ArrowLeft className="h-4 w-4" /> Back to Stock Opname
          </button>
        </div>
      </div>
    );
  }

  // ✅ BUG 2: fallback chain for store name
  const storeName = session.store?.name || session.store_name || session.store || "—";
  const createdByName = session.created_by_user?.name || session.created_by || "—";

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════
          TOP BAR
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/stock-opnames")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Stock Opname
        </button>

        <div className="flex items-center gap-2">
          {status === "draft" && (
            <button onClick={handleStartSession} disabled={submitting}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Session
            </button>
          )}
          {status === "in_progress" && (
            <button onClick={() => setCompleteModalOpen(true)} disabled={submitting}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              style={{ background: "linear-gradient(to right, #10b981, #059669)" }}>
              <CheckCircle className="h-4 w-4" />
              Complete Session
            </button>
          )}
          <div className="relative">
            <button onClick={() => setShowActions((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#ececf2] dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60">
              <MoreHorizontal className="h-4 w-4" />
              <ChevronDown className="h-4 w-4" />
            </button>
            {showActions && (
              <ActionsDropdown onClose={() => setShowActions(false)} onAction={handleAction} status={status} />
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HEADER SECTION — improved info density
          ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-[#ececf2] dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
              <ClipboardList className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{session.reference_number}</h1>
                <StatusBadge status={status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{storeName}</span>
                <span>•</span>
                <span>{formatDateShort(session.created_at)}</span>
                <span>•</span>
                <span>by {createdByName}</span>
                <span>•</span>
                <span>{totalItems} Products</span>
              </div>
            </div>
          </div>
        </div>
        {session.notes && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3">
            {session.notes}
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LOCKED BANNER — completed/cancelled specific messages
          ══════════════════════════════════════════════════════════════ */}
      {isLocked && (
        <div className={`rounded-2xl border px-5 py-3.5 flex items-center gap-3 ${
          status === "completed"
            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300"
        }`}>
          {status === "completed" ? (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">This stock opname has been completed.</p>
                <p className="text-xs mt-0.5 opacity-80">Inventory has already been adjusted and this session is locked.</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">This stock opname has been cancelled.</p>
                <p className="text-xs mt-0.5 opacity-80">No further modifications are allowed.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          KPI CARDS — replaced Excess → Remaining, reordered
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard title="Products Total" value={totalItems} subtitle="items in session" icon={Package} color="text-purple-600 bg-purple-50 dark:bg-purple-900/30" />
        <KpiCard title="Checked" value={checkedItems} subtitle={`${progressPct}% completed`} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" />
        <KpiCard title="Remaining" value={remainingItems} subtitle="left to count" icon={Layers} color="text-blue-600 bg-blue-50 dark:bg-blue-900/30" />
        <KpiCard title="Differences" value={diffItems.length} subtitle="items with mismatches" icon={AlertTriangle} color="text-amber-600 bg-amber-50 dark:bg-amber-900/30" />
        <KpiCard title="Missing" value={missingItems} subtitle="overstated in system" icon={XCircle} color="text-red-600 bg-red-50 dark:bg-red-900/30" />
        <KpiCard title="Estimated Adj. Value" value={formatRp(estimatedValue)} subtitle="total adjustment" icon={DollarSign} color="text-rose-600 bg-rose-50 dark:bg-rose-900/30" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TABS
          ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-white dark:bg-gray-800 border border-[#ececf2] dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 pt-4">
          <TabNavigation tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-6">
          {/* ══════════════════════════════════════════════════════════
              TAB: OVERVIEW
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* COL 1: Session Information */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-accent" />
                    Session Information
                  </h3>
                  <div className="divide-y divide-[#ececf2] dark:divide-gray-700">
                    <InfoRow label="Reference Number" value={session.reference_number} icon={ClipboardList} />
                    <InfoRow label="Store" value={storeName} icon={Package} />
                    <InfoRow label="Status" value={<StatusBadge status={status} />} />
                    <InfoRow label="Created By" value={createdByName} />
                    <InfoRow label="Notes" value={session.notes || "—"} />
                    <InfoRow label="Created At" value={formatDateShort(session.created_at)} />
                    <InfoRow label="Completed At" value={session.completed_at ? formatDateShort(session.completed_at) : "—"} />
                    <InfoRow label="Cancelled At" value={session.cancelled_at ? formatDateShort(session.cancelled_at) : "—"} />
                  </div>
                </div>

                {/* COL 2: Progress Summary — upgraded */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    Progress Summary
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</span>
                        <span className="text-2xl font-bold text-accent">{progressPct}%</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{checkedItems}</span>
                        {" / "}{totalItems} Products Checked
                      </p>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(progressPct, 100)}%`,
                            // ✅ BUG 3: accent gradient always
                            background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                          }}
                        />
                      </div>
                    </div>
                    <div className="h-px bg-[#ececf2] dark:bg-gray-700" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Items with Difference</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{diffItems.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Missing Items</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{missingItems}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Excess Items</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{excessItems}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-[#ececf2] dark:border-gray-700 pt-3">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Estimated Adjustment Value</span>
                        <span className="text-base font-bold text-accent">{formatRp(estimatedValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional cards below main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Difference Breakdown */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-accent" />
                    Difference Breakdown
                  </h3>
                  <div className="space-y-1">
                    <StatItem label="Matched Items" value={matchedItems} color="text-emerald-600 dark:text-emerald-400" />
                    <StatItem label="Items With Difference" value={diffItems.length} color="text-amber-600 dark:text-amber-400" />
                    <StatItem label="Missing Items" value={missingItems} color="text-red-600 dark:text-red-400" />
                    <StatItem label="Excess Items" value={excessItems} color="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    Recent Activity
                  </h3>
                  {activityEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700/50">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-xs text-gray-400">No activity recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activityEvents.map((evt) => (
                        <TimelineItem
                          key={evt.key}
                          time={evt.time}
                          title={evt.title}
                          description={evt.description}
                          icon={evt.icon}
                          color={evt.color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: COUNTING — improved toolbar
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "counting" && (
            <div className="space-y-4">
              {/* Toolbar — search left, actions right */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Product / SKU / Barcode..."
                    value={countSearch}
                    onChange={(e) => setCountSearch(e.target.value)}
                    className="w-full rounded-xl border border-[#ececf2] dark:border-gray-600 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setBarcodeModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-[#ececf2] dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all">
                    <Barcode className="h-4 w-4" />
                    Scan Barcode
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl border border-[#ececf2] dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all">
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Counting Table */}
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                    <Package className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {items.length === 0
                      ? "No products available for counting"
                      : "No matching products found"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    {items.length === 0
                      ? "Start the session to load products into this stock opname"
                      : "Try a different search term or scan a barcode"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#ececf2] dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU / Barcode</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">System Stock</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Physical Stock</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difference</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                        <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredItems.map((item, idx) => {
                        const productName = item.product?.name || "Unknown Product";
                        const barcode = item.product?.barcode || item.product?.sku || "—";
                        const systemStock = item.system_stock ?? 0;
                        const physicalStock = item.physical_stock ?? systemStock;
                        const diff = item.difference ?? 0;
                        const isSaving = savingRowId === item.id;

                        return (
                          <tr key={item.id} id={`so-item-${item.id}`}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-[13px]">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-900 dark:text-white text-[13px]">{productName}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-[13px] text-gray-600 dark:text-gray-400">{barcode}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-[13px] text-gray-900 dark:text-white font-medium">
                              {systemStock}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isLocked ? (
                                <span className="text-[13px] text-gray-900 dark:text-white font-medium">{physicalStock}</span>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={physicalStock}
                                    onChange={(e) => handlePhysicalStockChange(item.id, e.target.value)}
                                    className="w-20 rounded-lg border border-[#ececf2] dark:border-gray-600 px-2.5 py-1.5 text-sm text-right outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                                  />
                                  {isSaving && <Loader2 className="h-3.5 w-3.5 text-accent animate-spin shrink-0" />}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <DiffBadge value={diff} />
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[13px] text-gray-500 dark:text-gray-400">{item.notes || "—"}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <ItemStatusBadge item={item} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Barcode Modal */}
              {barcodeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl border border-[#ececf2] dark:border-gray-700 mx-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light dark:bg-accent/20">
                        <Barcode className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Scan Barcode</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Paste barcode to find matching product</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 italic">TODO: integrate hardware barcode scanner</p>
                    <input
                      type="text"
                      placeholder="Paste barcode here..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleBarcodeSearch(); }}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-4"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button onClick={() => { setBarcodeModalOpen(false); setBarcodeInput(""); }}
                        className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        Cancel
                      </button>
                      <button onClick={handleBarcodeSearch}
                        className="flex-1 rounded-2xl bg-gradient-to-r py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
                        style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}>
                        Find
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: ACTIVITY LOGS — built from session data
              ══════════════════════════════════════════════════════════ */}
          {activeTab === "activity-logs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Activity Logs</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Timeline of events for this session</p>
                </div>
              </div>
              {activityEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50">
                    <ClipboardList className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">No activity recorded</p>
                  <p className="text-xs text-gray-400 mt-1">Activity logs will appear here as users interact with this session</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#ececf2] dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {activityEvents.map((evt) => (
                        <tr key={evt.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400">{evt.time}</td>
                          <td className="px-4 py-3">
                            <span className="text-[13px] font-medium text-gray-900 dark:text-white">{evt.title}</span>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400">{evt.description}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400">{createdByName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ COMPLETE SESSION MODAL ═══ */}
      <StockOpnameCompleteModal
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleCompleteSessionConfirm}
        submitting={submitting}
        summary={{
          checkedItems,
          diffItems: diffItems.length,
          missingItems,
          excessItems,
          estimatedValue,
          valueFormatted: formatRp(estimatedValue),
        }}
      />

      {/* ═══ ISSUE 2: CONFIRMATION MODAL (replaces browser confirm) ═══ */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl border border-[#ececf2] dark:border-gray-700 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{confirmModal.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{confirmModal.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, title: "", description: "", action: null, buttonLabel: "Confirm" })}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const action = confirmModal.action;
                  setConfirmModal({ open: false, title: "", description: "", action: null, buttonLabel: "Confirm" });
                  if (action) await action();
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}
              >
                {confirmModal.buttonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}