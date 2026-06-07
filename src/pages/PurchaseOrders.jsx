import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import usePurchaseOrders from "@/hooks/usePurchaseOrders";
import { getSuppliers } from "@/api/suppliers";
import { getProducts } from "@/api/products";
import { createPurchaseOrder } from "@/api/purchaseOrders";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Save,
  Send,
  Trash2,
  Receipt,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatRp, formatDateShort } from "@/lib/purchaseUtils";

// ── Status badge component ────────────────────────────────────────────
export function StatusBadge({ status }) {
  const variants = {
    draft: { label: "Draft", classes: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    pending: { label: "Pending", classes: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/50" },
    partial: { label: "Partial", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50" },
    completed: { label: "Completed", classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50" },
    cancelled: { label: "Cancelled", classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50" },
    overdue: { label: "Overdue", classes: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/50" },
  };
  const v = variants[status?.toLowerCase()] || variants.draft;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${v.classes}`}>
      {v.label}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse p-6">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse p-5">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex items-center gap-3">
        <div className="h-[100px] w-[100px] rounded-full bg-gray-100 dark:bg-gray-700/50" />
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded" />)}
        </div>
      </div>
    </div>
  );
}

// ── Status donut colors ──────────────────────────────────────────────
const STATUS_COLORS = {
  draft: "#9CA3AF",
  pending: "#F59E0B",
  partial: "#3B82F6",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const STATUS_LIST = ["draft", "pending", "partial", "completed", "cancelled"];

// ── Main Purchase Orders Page ─────────────────────────────────────────
export default function PurchaseOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: orders, loading, fetchAll } = usePurchaseOrders();

  // ── Filters ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Tabs ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");

  // ── Pagination ─────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ── Suppliers & Products for modals ────────────────────────────────
  const [supplierList, setSupplierList] = useState([]);
  const [productList, setProductList] = useState([]);

  // ── New PO Modal state ─────────────────────────────────────────────
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [poForm, setPoForm] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().slice(0, 10),
    expected_date: "",
    notes: "",
  });
  const [poItems, setPoItems] = useState([{ id: 1, product_id: "", quantity_ordered: 1, unit_cost: 0 }]);
  const poItemIdRef = useRef(1);

  // ── Compute total ──────────────────────────────────────────────────
  const poTotal = useMemo(() => {
    return poItems.reduce((sum, item) => sum + ((Number(item.quantity_ordered) || 0) * (Number(item.unit_cost) || 0)), 0);
  }, [poItems]);

  // ── Handle navigation prefill (from Product Detail "Create Purchase Order") ──
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current) return;
    const state = location.state;
    if (state?.openCreatePo && state?.prefillProduct) {
      const p = state.prefillProduct;
      const timer = setTimeout(() => {
        setPoItems([{ id: 1, product_id: String(p.id), quantity_ordered: 1, unit_cost: p.unit_cost || 0 }]);
        setPoDialogOpen(true);
      }, 0);
      prefilledRef.current = true;
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, []); // only on mount

  // ── Fetch data on mount ───────────────────────────────────────────
  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (poDialogOpen) {
      getSuppliers().then(res => {
        const d = res.data?.data || res.data;
        setSupplierList(Array.isArray(d) ? d : []);
      }).catch(() => setSupplierList([]));
      getProducts({ per_page: 100 }).then(res => {
        const d = res.data?.data || res.data;
        setProductList(Array.isArray(d) ? d : []);
      }).catch(() => setProductList([]));
    }
  }, [poDialogOpen]);

  // ── Derived stats from API data ────────────────────────────────────
  const stats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const totalOrders = list.length;
    const totalSpent = list.reduce((s, o) => s + (Number(o.total) || Number(o.total_amount) || 0), 0);
    const pending = list.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const received = list.filter((o) => (o.status || "").toLowerCase() === "completed").length;
    const overdue = list.filter((o) => {
      const s = (o.status || "").toLowerCase();
      if (s === "completed" || s === "cancelled") return false;
      return new Date(o.expected_date) < new Date();
    }).length;
    return { totalOrders, totalSpent, pending, received, overdue };
  }, [orders]);

  // ── Tab/Filter/Search logic ────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    let data = [...list];

    if (activeTab !== "all") {
      data = data.filter((o) => (o.status || "").toLowerCase() === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((o) =>
        (o.po_number || "").toLowerCase().includes(q) ||
        (o.supplier?.name || o.supplier || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      data = data.filter((o) => (o.status || "").toLowerCase() === statusFilter);
    }
    if (supplierFilter) {
      data = data.filter((o) => (o.supplier_id || o.supplier?.id)?.toString() === supplierFilter);
    }
    if (dateFrom) {
      data = data.filter((o) => o.order_date >= dateFrom);
    }
    if (dateTo) {
      data = data.filter((o) => o.order_date <= dateTo);
    }
    return data;
  }, [orders, activeTab, searchQuery, statusFilter, supplierFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  // ── Chart data from real orders ────────────────────────────────────
  const ordersByStatus = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const map = {};
    list.forEach((o) => {
      const s = (o.status || "draft").toLowerCase();
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || "#9CA3AF",
    }));
  }, [orders]);

  // ── PO form handlers ───────────────────────────────────────────────
  const handlePoField = (field, value) => setPoForm((prev) => ({ ...prev, [field]: value }));

  const addPoItem = () => {
    poItemIdRef.current += 1;
    setPoItems((prev) => [...prev, { id: poItemIdRef.current, product_id: "", quantity_ordered: 1, unit_cost: 0 }]);
  };

  const updatePoItem = (id, field, value) => {
    setPoItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removePoItem = (id) => {
    if (poItems.length <= 1) { toast.error("At least one item is required"); return; }
    setPoItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetPoForm = () => {
    setPoForm({ supplier_id: "", order_date: new Date().toISOString().slice(0, 10), expected_date: "", notes: "" });
    poItemIdRef.current = 1;
    setPoItems([{ id: 1, product_id: "", quantity_ordered: 1, unit_cost: 0 }]);
  };

  const handleCreatePo = async (status = "draft") => {
    if (!poForm.supplier_id) { toast.error("Please select a supplier"); return; }
    if (poItems.some((item) => !item.product_id)) { toast.error("Please fill in all item products"); return; }
    setSubmitting(true);
    const body = {
      supplier_id: Number(poForm.supplier_id),
      order_date: poForm.order_date,
      expected_date: poForm.expected_date || null,
      notes: poForm.notes,
      status,
      items: poItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity_ordered: Number(item.quantity_ordered),
        unit_cost: Number(item.unit_cost),
      })),
    };
    try {
      await createPurchaseOrder(body);
      toast.success(status === "draft" ? "PO saved as draft ✅" : "PO created and sent! ✅");
      setPoDialogOpen(false);
      resetPoForm();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Tabs ──────────────────────────────────────────────────────────
  const tabs = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "pending", label: "Pending" },
    { key: "partial", label: "Partial" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ═══ 1. HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Purchase Orders</h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">Manage supplier purchase orders & receiving</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchAll()}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all hover:bg-accent-light dark:hover:bg-accent/30">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}>
                <Plus className="h-4 w-4" /> New PO
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
              <div className="relative">
                <div className="h-1 rounded-t-3xl" style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))" }} />
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">New Purchase Order</span>
                        <p className="text-xs text-gray-400 mt-0.5 font-normal">Create a new purchase order for your supplier</p>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-6 pt-4 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Supplier <span className="text-red-400">*</span></label>
                      <select value={poForm.supplier_id} onChange={(e) => handlePoField("supplier_id", e.target.value)}
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white">
                        <option value="">Select supplier</option>
                        {supplierList.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Order Date</label>
                      <input type="date" value={poForm.order_date} onChange={(e) => handlePoField("order_date", e.target.value)}
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Expected Date</label>
                      <input type="date" value={poForm.expected_date} onChange={(e) => handlePoField("expected_date", e.target.value)}
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Notes</label>
                    <textarea rows={2} placeholder="Optional notes..." value={poForm.notes} onChange={(e) => handlePoField("notes", e.target.value)}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Items <span className="text-red-400">*</span></label>
                      <button type="button" onClick={addPoItem}
                        className="flex items-center gap-1.5 rounded-xl border border-accent/30 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add Item
                      </button>
                    </div>
                    {poItems.length > 0 && (
                      <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 mb-1">
                        <div className="col-span-5"><span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Product</span></div>
                        <div className="col-span-2 text-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Qty</span></div>
                        <div className="col-span-2 text-right"><span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Unit Cost</span></div>
                        <div className="col-span-2 text-right"><span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subtotal</span></div>
                        <div className="col-span-1" />
                      </div>
                    )}
                    <div className="space-y-2.5">
                      {poItems.map((item) => {
                        const subtotal = (Number(item.quantity_ordered) || 0) * (Number(item.unit_cost) || 0);
                        return (
                          <div key={item.id} className="grid grid-cols-12 gap-3 items-center rounded-2xl border border-[#ececf2] dark:border-gray-700 p-3 transition-all hover:border-accent/40">
                            <div className="col-span-12 sm:col-span-5">
                              <select value={item.product_id} onChange={(e) => updatePoItem(item.id, "product_id", e.target.value)}
                                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white">
                                <option value="">Select product</option>
                                {productList.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                              <label className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Qty</label>
                              <input type="number" min="1" value={item.quantity_ordered} onChange={(e) => updatePoItem(item.id, "quantity_ordered", e.target.value)}
                                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm text-center outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                              <label className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Unit Cost</label>
                              <input type="text" placeholder="0" value={item.unit_cost ? Number(item.unit_cost).toLocaleString("id-ID") : ""}
                                onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); updatePoItem(item.id, "unit_cost", raw); }}
                                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm text-right outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="col-span-4 sm:col-span-2 text-right">
                              <label className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Subtotal</label>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRp(subtotal)}</span>
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button type="button" onClick={() => removePoItem(item.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Remove item">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-gray-400">Total Items: {poItems.length}</p>
                        <p className="text-lg font-bold text-accent">{formatRp(poTotal)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setPoDialogOpen(false); resetPoForm(); }}
                      className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={() => handleCreatePo("draft")} disabled={submitting}
                      className="flex items-center justify-center gap-2 flex-1 rounded-2xl border border-accent py-3.5 text-sm font-semibold text-accent dark:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-60">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Draft
                    </button>
                    <button onClick={() => handleCreatePo("pending")} disabled={submitting}
                      className="flex items-center justify-center gap-2 flex-1 rounded-2xl bg-gradient-to-r py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                      style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Create PO
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ═══ 2. SUMMARY CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.totalOrders}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light dark:bg-accent/20 shrink-0">
              <ShoppingBag className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{formatRp(stats.totalSpent)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.pending}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30 shrink-0">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Received Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.received}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Overdue Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.overdue}</p>
              {stats.overdue > 0 && <p className="text-[11px] text-red-500 dark:text-red-400">Requires attention</p>}
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${stats.overdue > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-700/50"}`}>
              <AlertTriangle className={`h-5 w-5 ${stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. FILTER BAR ═══ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); setStatusFilter(""); }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  active ? "bg-accent text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search PO or supplier..." value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
              className="w-[200px] rounded-xl border border-[#ececf2] dark:border-gray-600 pl-9 pr-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
          </div>
          <select value={statusFilter} onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
            className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white">
            <option value="">All Status</option>
            {STATUS_LIST.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <input type="date" value={dateFrom} onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
              className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white" />
            <span className="text-gray-400 text-sm">-</span>
            <input type="date" value={dateTo} onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
              className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
      </div>

      {/* ═══ 4. MAIN CONTENT ═══ */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3"><TableSkeleton /></div>
          <div className="xl:col-span-1 space-y-6"><WidgetSkeleton /><WidgetSkeleton /><WidgetSkeleton /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* ── TABLE ───────────────────────────────────────────────── */}
          <div className="xl:col-span-3">
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Orders</h2>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {filteredOrders.length} results
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">PO Number <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Date</th>
                      <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No purchase orders found</p>
                            <p className="text-xs text-gray-400 mt-1">Create your first purchase order to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => {
                        const supplierName = order.supplier?.name || order.supplier || "-";
                        const total = order.total || order.total_amount || 0;
                        return (
                          <tr key={order.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 group cursor-pointer"
                            onClick={() => navigate(`/purchase-orders/${order.id}`)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-light dark:bg-accent/20 text-accent">
                                  <Package className="h-3.5 w-3.5" />
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white text-[13px]">{order.po_number}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300 text-[13px]">{supplierName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-600 dark:text-gray-400">
                              {formatDateShort(order.order_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span className={`text-[13px] ${
                                  order.status !== "completed" && order.status !== "cancelled" && new Date(order.expected_date) < new Date()
                                    ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"
                                }`}>
                                  {formatDateShort(order.expected_date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="font-semibold text-gray-900 dark:text-white text-[13px]">{formatRp(total)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all" title="View details">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400 px-1">...</span>}
                          <button onClick={() => setCurrentPage(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                              currentPage === p ? "bg-accent text-white shadow-sm" : "border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}>
                            {p}
                          </button>
                        </span>
                      ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────────── */}
          <div className="xl:col-span-1 space-y-6">
            {/* Order by Status — only show if data exists */}
            {ordersByStatus.length > 0 && (
              <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "var(--color-accent-light)" }}>
                    <Package className="h-3.5 w-3.5 text-accent" />
                  </span>
                  Order by Status
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-[110px] w-[110px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie data={ordersByStatus} dataKey="value" nameKey="name" innerRadius={35} outerRadius={52} paddingAngle={2}>
                          {ordersByStatus.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} orders`, name]}
                          contentStyle={{ borderRadius: "8px", fontSize: 12, border: "1px solid #e5e7eb" }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {ordersByStatus.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          {entry.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white shrink-0 ml-2">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}