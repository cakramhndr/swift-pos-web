import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Eye,
  FileText,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw,
  Save,
  Send,
  Trash2,
  Receipt,
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

// ── Read accent color from CSS variable ──────────────────────────────
function getAccentColor() {
  try {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    return val && val.startsWith("#") ? val : "#7c3aed";
  } catch {
    return "#7c3aed";
  }
}

// ── Format helpers ────────────────────────────────────────────────────
const formatRp = (v) => {
  if (v == null) return "Rp 0";
  return "Rp " + Number(v).toLocaleString("id-ID");
};

const formatDateShort = (ds) => {
  if (!ds) return "-";
  const d = new Date(ds);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── Status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const variants = {
    draft: {
      label: "Draft",
      classes:
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    },
    pending: {
      label: "Pending",
      classes:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/50",
    },
    partial: {
      label: "Partial",
      classes:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50",
    },
    completed: {
      label: "Completed",
      classes:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50",
    },
    cancelled: {
      label: "Cancelled",
      classes:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50",
    },
    overdue: {
      label: "Overdue",
      classes:
        "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/50",
    },
  };
  const v = variants[status?.toLowerCase()] || variants.draft;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${v.classes}`}
    >
      {v.label}
    </span>
  );
}

// ── Received progress column ──────────────────────────────────────────
function ReceivedProgress({ received, total }) {
  const pct = total > 0 ? Math.round((received / total) * 100) : 0;
  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[90px]">
      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
        {received} / {total} items
      </span>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: "var(--color-accent)" }}
        />
      </div>
      <span className="text-[10px] font-semibold text-accent">{pct}%</span>
    </div>
  );
}

// ── Summary card ──────────────────────────────────────────────────────
function SummaryCard({ title, value, icon: Icon, iconBg, iconColor, subtitle }) {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60 dark:hover:border-accent/40 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse p-6">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
          />
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mock Data ─────────────────────────────────────────────────────────
const STATUSES = ["draft", "pending", "partial", "completed", "cancelled"];

const SUPPLIERS = [
  "PT Sumber Makmur",
  "CV Jaya Abadi",
  "UD Barokah Jaya",
  "PT Indah Logistik",
  "CV Bintang Persada",
  "PT Niaga Sentosa",
  "UD Sinar Rejeki",
  "CV Karya Mandiri",
];

const PRODUCTS = [
  "Logitech G Pro X Headset",
  "Razer DeathAdder V2 Mouse",
  "SteelSeries Apex Pro Keyboard",
  "HyperX Cloud Alpha Headset",
  "Corsair K95 RGB Keyboard",
  "Logitech G502 Hero Mouse",
  "Audio-Technica AT2020 Mic",
  "Samsung 27\" Odyssey Monitor",
  "LG 32\" UltraGear Monitor",
  "Blue Yeti USB Microphone",
  "ASUS ROG Strix Keyboard",
  "Razer Kraken V3 Headset",
];

const generateMockOrders = () => {
  const orders = [];
  for (let i = 1; i <= 35; i++) {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const totalItems = Math.floor(Math.random() * 20) + 5;
    const received =
      status === "completed"
        ? totalItems
        : status === "partial"
          ? Math.floor(Math.random() * (totalItems - 1)) + 1
          : status === "cancelled"
            ? 0
            : Math.floor(Math.random() * 3);
    const orderDate = new Date(2025, 10, 15 + Math.floor(Math.random() * 60));
    const expectedDate = new Date(orderDate);
    expectedDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 30) + 7);
    const totalAmount = Math.floor(Math.random() * 50000000) + 5000000;
    const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
    orders.push({
      id: i,
      po_number: `PO-2025-${String(i).padStart(4, "0")}`,
      supplier,
      order_date: orderDate.toISOString().slice(0, 10),
      expected_date: expectedDate.toISOString().slice(0, 10),
      total_amount: totalAmount,
      status,
      received_items: received,
      total_items: totalItems,
    });
  }
  return orders.sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date),
  );
};

const allOrders = generateMockOrders();

// ── Aggregated stats ─────────────────────────────────────────────────
function computeStats(orders) {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const received = orders.filter((o) => o.status === "completed").length;
  const overdue = orders.filter((o) => {
    if (o.status === "completed" || o.status === "cancelled") return false;
    return new Date(o.expected_date) < new Date();
  }).length;
  return { totalOrders, totalSpent, pending, received, overdue };
}

// ── Status donut colors ──────────────────────────────────────────────
const STATUS_COLORS = {
  draft: "#9CA3AF",
  pending: "#F59E0B",
  partial: "#3B82F6",
  completed: "#10B981",
  cancelled: "#EF4444",
};

// ── Main Purchase Orders Page ─────────────────────────────────────────
export default function PurchaseOrders() {
  const [accentColor] = useState(() => getAccentColor());

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

  // ── Loading simulation ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  // ── New PO Modal state ─────────────────────────────────────────────
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    supplier: "",
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDate: "",
    notes: "",
  });
  const [poItems, setPoItems] = useState([
    { id: 1, product: "", qty: 1, unitCost: 0 },
  ]);
  const poItemIdRef = useRef(1);

  // ── Compute item subtotals and total ──────────────────────────────
  const poItemSubtotals = useMemo(() => {
    return poItems.map((item) => ({
      ...item,
      subtotal: (Number(item.qty) || 0) * (Number(item.unitCost) || 0),
    }));
  }, [poItems]);

  const poTotal = useMemo(() => {
    return poItemSubtotals.reduce((sum, item) => sum + item.subtotal, 0);
  }, [poItemSubtotals]);

  // ── PO form handlers ───────────────────────────────────────────────
  const handlePoField = (field, value) => {
    setPoForm((prev) => ({ ...prev, [field]: value }));
  };

  const addPoItem = () => {
    const newId = ++poItemIdRef.current;
    setPoItems((prev) => [
      ...prev,
      { id: newId, product: "", qty: 1, unitCost: 0 },
    ]);
  };

  const updatePoItem = (id, field, value) => {
    setPoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removePoItem = (id) => {
    if (poItems.length <= 1) {
      toast.error("At least one item is required");
      return;
    }
    setPoItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetPoForm = () => {
    setPoForm({
      supplier: "",
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: "",
      notes: "",
    });
    poItemIdRef.current = 1;
    setPoItems([{ id: 1, product: "", qty: 1, unitCost: 0 }]);
  };

  const handleSaveDraft = () => {
    if (!poForm.supplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (poItems.some((item) => !item.product)) {
      toast.error("Please fill in all item products");
      return;
    }
    toast.success("Purchase order saved as draft ✅");
    setPoDialogOpen(false);
    resetPoForm();
  };

  const handleCreatePo = () => {
    if (!poForm.supplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (poItems.some((item) => !item.product)) {
      toast.error("Please fill in all item products");
      return;
    }
    toast.success("Purchase order created and sent! ✅");
    setPoDialogOpen(false);
    resetPoForm();
  };

  // ── Filtered orders ────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let data = [...allOrders];

    // Tab filter
    if (activeTab !== "all") {
      data = data.filter((o) => o.status === activeTab);
    }

    // Search by PO number or supplier
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (o) =>
          o.po_number.toLowerCase().includes(q) ||
          o.supplier.toLowerCase().includes(q),
      );
    }

    // Status filter (overrides tab if explicitly set)
    if (statusFilter) {
      data = data.filter((o) => o.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter) {
      data = data.filter((o) => o.supplier === supplierFilter);
    }

    // Date range filter
    if (dateFrom) {
      data = data.filter((o) => o.order_date >= dateFrom);
    }
    if (dateTo) {
      data = data.filter((o) => o.order_date <= dateTo);
    }

    return data;
  }, [activeTab, searchQuery, statusFilter, supplierFilter, dateFrom, dateTo]);

  // ── Stats from filtered (summary should use all, not filtered)
  const stats = useMemo(() => computeStats(allOrders), []);

  // ── Pagination ─────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Reset page on filter change
  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  // ── Order by Status donut data ─────────────────────────────────────
  const ordersByStatus = useMemo(() => {
    const map = {};
    allOrders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || "#9CA3AF",
    }));
  }, []);

  // ── Recent Suppliers (unique, sorted by latest order) ──────────────
  const recentSuppliers = useMemo(() => {
    const seen = new Set();
    return allOrders
      .filter((o) => {
        if (seen.has(o.supplier)) return false;
        seen.add(o.supplier);
        return true;
      })
      .slice(0, 5)
      .map((o) => ({
        name: o.supplier,
        lastOrder: o.order_date,
        amount: o.total_amount,
      }));
  }, []);

  // ── Top Spending Suppliers ─────────────────────────────────────────
  const topSpendingSuppliers = useMemo(() => {
    const map = {};
    allOrders.forEach((o) => {
      if (!map[o.supplier]) map[o.supplier] = 0;
      map[o.supplier] += o.total_amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, []);

  const maxSpend = topSpendingSuppliers.length > 0
    ? Math.max(...topSpendingSuppliers.map((s) => s.total))
    : 1;

  // ── Tabs config ────────────────────────────────────────────────────
  const tabs = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "pending", label: "Pending" },
    { key: "partial", label: "Partial" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ═══ 1. HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Purchase Orders
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Manage supplier purchase orders & receiving
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] hover:-translate-y-0.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_-2px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Plus className="h-4 w-4" />
                New PO
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl sm:max-w-4xl p-0 overflow-hidden">
              <div className="relative">
                {/* Accent header bar */}
                <div
                  className="h-1 rounded-t-3xl -mt-0 -mx-0"
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
                  }}
                />
                <DialogHeader className="px-6 pt-5 pb-0">
                  <DialogTitle className="text-xl font-bold">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                        }}
                      >
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          New Purchase Order
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5 font-normal">
                          Create a new purchase order for your supplier
                        </p>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-6 pt-4 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* ── PO Info Fields ──────────────────────────────── */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Supplier <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={poForm.supplier}
                        onChange={(e) => handlePoField("supplier", e.target.value)}
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select supplier</option>
                        {SUPPLIERS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Order Date
                      </label>
                      <input
                        type="date"
                        value={poForm.orderDate}
                        onChange={(e) => handlePoField("orderDate", e.target.value)}
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Expected Date
                      </label>
                      <input
                        type="date"
                        value={poForm.expectedDate}
                        onChange={(e) => handlePoField("expectedDate", e.target.value)}
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Optional notes for this purchase order..."
                      value={poForm.notes}
                      onChange={(e) => handlePoField("notes", e.target.value)}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  {/* ── Items Section ──────────────────────────────── */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Items <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addPoItem}
                        className="flex items-center gap-1.5 rounded-xl border border-accent/30 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Item
                      </button>
                    </div>

                    {/* Items header */}
                    {poItems.length > 0 && (
                      <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 mb-1">
                        <div className="col-span-5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Product
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Qty
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Unit Cost
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Subtotal
                          </span>
                        </div>
                        <div className="col-span-1" />
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {poItems.map((item) => {
                        const qty = Number(item.qty) || 0;
                        const cost = Number(item.unitCost) || 0;
                        const subtotal = qty * cost;
                        return (
                          <div
                            key={item.id}
                            className="grid grid-cols-12 gap-3 items-center rounded-2xl border border-[#ececf2] dark:border-gray-700 p-3 transition-all hover:border-accent/40"
                          >
                            {/* Product select */}
                            <div className="col-span-12 sm:col-span-5">
                              <select
                                value={item.product}
                                onChange={(e) =>
                                  updatePoItem(item.id, "product", e.target.value)
                                }
                                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white"
                              >
                                <option value="">Select product</option>
                                {PRODUCTS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Qty */}
                            <div className="col-span-6 sm:col-span-2">
                              <label className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
                                Qty
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) =>
                                  updatePoItem(item.id, "qty", e.target.value)
                                }
                                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm text-center outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            {/* Unit Cost */}
                            <div className="col-span-4 sm:col-span-2">
                              <label className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
                                Unit Cost
                              </label>
                              <input
                                type="text"
                                placeholder="0"
                                value={item.unitCost ? Number(item.unitCost).toLocaleString("id-ID") : ""}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/[^0-9]/g, "");
                                  updatePoItem(item.id, "unitCost", raw);
                                }}
                                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm text-right outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            {/* Subtotal */}
                            <div className="col-span-4 sm:col-span-2 text-right">
                              <label className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
                                Subtotal
                              </label>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatRp(subtotal)}
                              </span>
                            </div>

                            {/* Remove */}
                            <div className="col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => removePoItem(item.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {poItems.length === 0 && (
                      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-8 text-center">
                        <Package className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                          No items yet. Click{" "}
                          <span className="text-accent font-semibold">Add Item</span>{" "}
                          to add products.
                        </p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          Total Items: {poItems.length}
                        </p>
                        <p className="text-lg font-bold text-accent">
                          {formatRp(poTotal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Action Buttons ────────────────────────────── */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPoDialogOpen(false);
                        resetPoForm();
                      }}
                      className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center justify-center gap-2 flex-1 rounded-2xl border border-accent py-3.5 text-sm font-semibold text-accent dark:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </button>
                    <button
                      onClick={handleCreatePo}
                      className="flex items-center justify-center gap-2 flex-1 rounded-2xl bg-gradient-to-r py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      <Send className="h-4 w-4" />
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
        <SummaryCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          iconBg="bg-accent-light dark:bg-accent/20"
          iconColor="text-accent"
        />
        <SummaryCard
          title="Total Spent"
          value={formatRp(stats.totalSpent)}
          icon={DollarSign}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryCard
          title="Pending Orders"
          value={stats.pending}
          icon={Clock}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <SummaryCard
          title="Received Orders"
          value={stats.received}
          icon={CheckCircle}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          title="Overdue Orders"
          value={stats.overdue}
          icon={AlertTriangle}
          iconBg={stats.overdue > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-700/50"}
          iconColor={stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-gray-400"}
          subtitle={stats.overdue > 0 ? "Requires attention" : "All good"}
        />
      </div>

      {/* ═══ 3. FILTER BAR ═══ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                  setStatusFilter("");
                }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  active
                    ? "bg-accent text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO or supplier..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
              className="w-[200px] rounded-xl border border-[#ececf2] dark:border-gray-600 pl-9 pr-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
            className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* Supplier dropdown */}
          <select
            value={supplierFilter}
            onChange={(e) => handleFilterChange(setSupplierFilter)(e.target.value)}
            className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Suppliers</option>
            {SUPPLIERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
              className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
            />
            <span className="text-gray-400 text-sm">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
              className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ═══ 4. MAIN CONTENT (Table + Sidebar) ═══ */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <TableSkeleton />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <WidgetSkeleton />
            <WidgetSkeleton />
            <WidgetSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* ── TABLE (3/4) ──────────────────────────────────────────── */}
          <div className="xl:col-span-3">
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              {/* Table header info */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Orders
                  </h2>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {filteredOrders.length} results
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-[#ececf2] dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Columns
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          PO Number
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Expected Date
                      </th>
                      <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              No purchase orders found
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Try adjusting your filters or create a new PO
                            </p>
                            <button
                              className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md"
                              style={{
                                background:
                                  "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                              }}
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("");
                                setSupplierFilter("");
                                setDateFrom("");
                                setDateTo("");
                                setActiveTab("all");
                              }}
                            >
                              <Filter className="h-3.5 w-3.5" />
                              Clear Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-light dark:bg-accent/20 text-accent">
                                <Package className="h-3.5 w-3.5" />
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white text-[13px]">
                                {order.po_number}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-[13px]">
                                {order.supplier}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-600 dark:text-gray-400">
                            {formatDateShort(order.order_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span
                                className={`text-[13px] ${
                                  order.status !== "completed" &&
                                  order.status !== "cancelled" &&
                                  new Date(order.expected_date) < new Date()
                                    ? "text-red-600 dark:text-red-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {formatDateShort(order.expected_date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="font-semibold text-gray-900 dark:text-white text-[13px]">
                              {formatRp(order.total_amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ReceivedProgress
                              received={order.received_items}
                              total={order.total_items}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all"
                                title="More options"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredOrders.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {filteredOrders.length}
                    </span>{" "}
                    orders
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - currentPage) <= 1,
                      )
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="text-gray-400 px-1">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                              currentPage === p
                                ? "bg-accent text-white shadow-sm"
                                : "border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR WIDGETS (1/4) ────────────────────────────────── */}
          <div className="xl:col-span-1 space-y-6">
            {/* 1. Order by Status — Donut */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ background: "var(--color-accent-light)" }}
                >
                  <Package className="h-3.5 w-3.5 text-accent" />
                </span>
                Order by Status
              </h3>
              {ordersByStatus.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px]">
                  <Package className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                  <p className="mt-1 text-xs text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-[110px] w-[110px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={ordersByStatus}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={35}
                          outerRadius={52}
                          paddingAngle={2}
                        >
                          {ordersByStatus.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} orders`, name]}
                          contentStyle={{
                            borderRadius: "8px",
                            fontSize: 12,
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {ordersByStatus.map((entry) => (
                      <div
                        key={entry.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white shrink-0 ml-2">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Recent Suppliers */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ background: "var(--color-accent-light)" }}
                >
                  <Truck className="h-3.5 w-3.5 text-accent" />
                </span>
                Recent Suppliers
              </h3>
              {recentSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Building2 className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                  <p className="mt-1 text-xs text-gray-400">No suppliers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSuppliers.map((supplier) => (
                    <div
                      key={supplier.name}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-light dark:bg-accent/20 text-xs font-bold text-accent">
                        {supplier.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 dark:text-white truncate group-hover:text-accent transition-colors">
                          {supplier.name}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400">
                          Last order: {formatDateShort(supplier.lastOrder)}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-accent shrink-0">
                        {formatRp(supplier.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Top Spending Suppliers */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ background: "var(--color-accent-light)" }}
                >
                  <DollarSign className="h-3.5 w-3.5 text-accent" />
                </span>
                Top Spending Suppliers
              </h3>
              {topSpendingSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <DollarSign className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                  <p className="mt-1 text-xs text-gray-400">No spending data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topSpendingSuppliers.map((supplier, idx) => {
                    const pct = (supplier.total / maxSpend) * 100;
                    return (
                      <div key={supplier.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {idx === 0 && (
                              <span className="text-xs shrink-0">🏆</span>
                            )}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {supplier.name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-accent shrink-0 ml-2">
                            {formatRp(supplier.total)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor:
                                idx === 0 ? accentColor : "var(--color-accent-light)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="w-full text-center text-xs font-medium text-accent hover:text-accent hover:underline mt-4 block">
                View all suppliers &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}