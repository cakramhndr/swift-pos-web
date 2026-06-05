import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Package,
  Receipt,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Calendar,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  PieChart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  BarChart3,
  Layers,
  ShoppingCart,
  XCircle,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import useReports from "@/hooks/useReports";
import { getSummary } from "@/api/inventory";

// ─── Color palette ────────────────────────────────────────────────────
const CHART_COLORS = [
  "#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#EC4899", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316",
];

// Format a Date object to YYYY-MM-DD string using local timezone (timezone-safe)
function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 animate-pulse ${className}`}
    >
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function ChartSkeleton({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 animate-pulse ${className}`}
    >
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="h-[280px] bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 animate-pulse p-6">
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ─── Format helpers ────────────────────────────────────────────────────
const formatRp = (v) => {
  if (v == null) return "Rp 0";
  return "Rp " + Number(v).toLocaleString("id-ID");
};

const formatCompactRp = (v) => {
  if (v == null) return "Rp 0";
  const n = Number(v);
  if (n >= 1_000_000_000) return "Rp " + (n / 1_000_000_000).toFixed(1) + "M";
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(1) + "Rb";
  return "Rp " + n.toLocaleString("id-ID");
};

const formatDateShort = (ds) => {
  if (!ds) return "-";
  const d = new Date(ds);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (ds) => {
  if (!ds) return "-";
  const d = new Date(ds);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Growth badge component ────────────────────────────────────────────
function GrowthBadge({ value, suffix = "" }) {
  const num = Number(value) || 0;
  const isPositive = num >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold border ${
        isPositive
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}{num.toFixed(1)}%{suffix}
    </span>
  );
}

// ─── Main Reports Page ─────────────────────────────────────────────────
export default function Reports() {
  // ─── Hooks ──────────────────────────────────────────────────────────
  const {
    sales,
    products,
    trends,
    categories,
    paymentMethods,
    overview,
    customers,
    loading,
    dateRange,
    setDateRange,
    fetchAll,
    fetchTrends,
  } = useReports();

  // ─── State ──────────────────────────────────────────────────────────
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [trendGroupBy, setTrendGroupBy] = useState("day");
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const initialFetchDone = useRef(false);

  // ─── Compute date string for a period ─────────────────────────────
  const getDateStringsForPeriod = useCallback((period) => {
    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start;
    switch (period) {
      case "today":
        start = todayLocal;
        break;
      case "7days":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case "30days":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return null;
    }
    return { date_from: formatDateString(start), date_to: formatDateString(todayLocal) };
  }, []);

  const getPeriodLabel = useCallback(() => {
    if (selectedPeriod === "custom" && customDateFrom && customDateTo) {
      return `${formatDateShort(customDateFrom)} - ${formatDateShort(customDateTo)}`;
    }
    if (selectedPeriod === "custom") return "";
    const ds = getDateStringsForPeriod(selectedPeriod);
    if (!ds) return "";
    return `${formatDateShort(ds.date_from)} - ${formatDateShort(ds.date_to)}`;
  }, [selectedPeriod, customDateFrom, customDateTo, getDateStringsForPeriod]);

  // ─── Fetch when period changes ────────────────────────────────────
  useEffect(() => {
    if (selectedPeriod === "custom") {
      if (customDateFrom && customDateTo) {
        setDateRange(customDateFrom, customDateTo);
        fetchAll(customDateFrom, customDateTo);
      }
      return;
    }
    const ds = getDateStringsForPeriod(selectedPeriod);
    if (ds) {
      setDateRange(ds.date_from, ds.date_to);
      fetchAll(ds.date_from, ds.date_to);
      initialFetchDone.current = true;
    }
  }, [selectedPeriod, customDateFrom, customDateTo, setDateRange, fetchAll, getDateStringsForPeriod]);

  // ─── Fetch trends when group_by changes ───────────────────────────
  useEffect(() => {
    if (initialFetchDone.current && dateRange.date_from) {
      fetchTrends(dateRange.date_from, dateRange.date_to, trendGroupBy);
    }
  }, [trendGroupBy, dateRange.date_from, dateRange.date_to, fetchTrends]);

  // ─── Fetch low stock ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingStock(true);
      try {
        const res = await getSummary();
        const data = res.data?.data ?? res.data;
        setLowStockItems(data?.low_stock_items ?? []);
      } catch {
        setLowStockItems([]);
      } finally {
        setLoadingStock(false);
      }
    })();
  }, []);

  // ─── Derived data ──────────────────────────────────────────────────
  const marginPercent = useMemo(() => {
    const rev = sales.total_revenue || 0;
    const profit = sales.profit || 0;
    return rev > 0 ? (profit / rev) * 100 : 0;
  }, [sales]);

  const itemsPerOrder = useMemo(() => {
    const t = sales.total_transactions || 0;
    return t > 0 ? ((sales.total_items_sold || 0) / t).toFixed(1) : "0";
  }, [sales]);

  const refundRate = useMemo(() => {
    const total = overview.transaction_summary.total_transactions || 0;
    const cancelled = overview.transaction_summary.cancelled || 0;
    return total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0";
  }, [overview]);

  // ─── Paginated Transactions ───────────────────────────────────────
  const paginatedTransactions = useMemo(() => {
    const txns = sales.transactions || [];
    const sorted = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      data: sorted.slice(start, end),
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / ITEMS_PER_PAGE),
    };
  }, [sales.transactions, currentPage]);

  // ─── Top products sorted by margin for right table ──────────────────
  const topMarginProducts = useMemo(() => {
    const list = products.top_products || [];
    return [...list]
      .map((p) => ({
        ...p,
        margin_pct:
          p.revenue > 0
            ? ((p.profit || 0) / p.revenue) * 100
            : 0,
      }))
      .sort((a, b) => b.margin_pct - a.margin_pct)
      .slice(0, 10);
  }, [products.top_products]);

  // ─── Top customers (limit 5) ──────────────────────────────────────
  const topCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return [...list]
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 5);
  }, [customers]);

  // ─── Sparkline data for revenue card ──────────────────────────────
  const sparklineData = useMemo(() => {
    return (trends.revenue_trend || []).map((d) => d.revenue || 0);
  }, [trends]);

  // ─── Export handlers ──────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = [
      "Invoice", "Tanggal", "Customer", "Items", "Total", "Metode Bayar", "Status",
    ];
    const rows = (sales.transactions || []).map((t) => [
      `#${t.invoice_number || t.id}`,
      t.date,
      t.customer_name || "Walk-in Customer",
      (t.items || []).map((item) => `${item.name} x${item.qty}`).join("; "),
      t.total || 0,
      t.payment_method || "Cash",
      "Completed",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `swiftpos-report-${selectedPeriod}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const handleExportPDF = () => {
    window.print();
    toast.success("PDF export triggered");
  };

  // ─── View invoice ─────────────────────────────────────────────────
  const handleViewInvoice = (transaction) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html><head>
        <title>Invoice #${transaction.invoice_number || transaction.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #7c3aed; margin: 0; }
          .info { margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { color: #6b7280; }
          .items { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          .item-row { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
          .item-row:last-child { border-bottom: none; }
          .total { text-align: right; font-size: 24px; font-weight: bold; color: #7c3aed; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
          @media print { .no-print { display: none; } }
        </style>
      </head><body>
        <div class="header"><h1>SwiftPOS</h1><p>Invoice #${transaction.invoice_number || transaction.id}</p></div>
        <div class="info">
          <div class="info-row"><span class="label">Tanggal:</span><span>${transaction.date}</span></div>
          <div class="info-row"><span class="label">Customer:</span><span>${transaction.customer_name || "Walk-in Customer"}</span></div>
          <div class="info-row"><span class="label">Metode Bayar:</span><span>${transaction.payment_method || "Cash"}</span></div>
        </div>
        <div class="items">
          ${(transaction.items || []).map((item) => `<div class="item-row"><span>${item.name} x${item.qty}</span><span>Rp ${(item.unitPrice * item.qty).toLocaleString("id-ID")}</span></div>`).join("")}
        </div>
        <div class="total">${formatRp(transaction.total)}</div>
        <div class="footer"><p>Terima kasih telah berbelanja di SwiftPOS</p><button class="no-print" onclick="window.print()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;margin-top:20px;">Print</button></div>
      </body></html>
    `);
  };

  // ─── Period pills ─────────────────────────────────────────────────
  const periods = [
    { key: "today", label: "Hari ini" },
    { key: "7days", label: "7 Hari" },
    { key: "30days", label: "30 Hari" },
    { key: "month", label: "Bulan ini" },
    { key: "custom", label: "Custom" },
  ];

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none printable-area">
      {/* ─── 1. HEADER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports</h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">Laporan penjualan & transaksi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-5 py-2.5 font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_-2px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
            style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ─── 2. DATE FILTER BAR ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => { setSelectedPeriod(p.key); setCurrentPage(1); }}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] ${
                selectedPeriod === p.key
                  ? "bg-purple-600 text-white border border-purple-600 hover:bg-purple-700"
                  : "border border-purple-200 dark:border-accent/40 text-accent dark:text-accent hover:bg-accent-light dark:hover:bg-accent/30"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {selectedPeriod === "custom" && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => { setCustomDateFrom(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => { setCustomDateTo(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-400 whitespace-nowrap">
            {getPeriodLabel()}
          </p>
        </div>
      </div>

      {/* ─── LOADING STATE ──────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSkeleton />
            <TableSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
          <TableSkeleton />
        </div>
      ) : (
        <>
          {/* ─── 3. INSIGHTS BAR ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Growth */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Revenue Growth</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {overview.insights.revenue_growth || 0}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <GrowthBadge value={overview.insights.revenue_growth} suffix=" vs prev" />
            </div>

            {/* Top Product */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top Product</p>
                  <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                    {overview.insights.top_product?.name || "-"}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Menyumbang {Number(overview.insights.top_product?.percentage || 0).toFixed(1)}% dari total
              </p>
            </div>

            {/* Top Payment Method */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Metode Bayar Teratas</p>
                  <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {overview.insights.top_payment_method || "-"}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">Metode pembayaran paling sering digunakan</p>
            </div>

            {/* Highest Margin Product */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Produk Margin Tertinggi</p>
                  <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                    {overview.insights.highest_margin_product?.name || "-"}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Percent className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Margin {Number(overview.insights.highest_margin_product?.margin_percentage || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* ─── 4. METRIC CARDS (8 cards, 2 rows) ─────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Revenue */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light dark:bg-accent/20">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{formatRp(sales.total_revenue)}</p>
              <div className="flex items-center gap-2 mt-2">
                <GrowthBadge value={overview.insights.revenue_growth} />
              </div>
              {/* Sparkline */}
              {sparklineData.length > 1 && (
                <div className="mt-3 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends.revenue_trend}>
                      <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Gross Profit */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gross Profit</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatRp(sales.profit)}</p>
            </div>

            {/* Margin % */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Margin %</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{marginPercent.toFixed(1)}%</p>
            </div>

            {/* Transactions */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                  <ShoppingCart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{sales.total_transactions}</p>
            </div>

            {/* COGS/HPP */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">COGS / HPP</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                  <BarChart3 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{formatRp(sales.hpp)}</p>
            </div>

            {/* Avg Order Value */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Order Value</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Layers className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">{formatRp(sales.avg_order_value)}</p>
            </div>

            {/* Products Sold */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Products Sold</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{products.products_sold}</p>
            </div>

            {/* Items per Order */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent dark:hover:border-accent">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Items per Order</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{itemsPerOrder}</p>
            </div>
          </div>

          {/* ─── 5. CHARTS ROW ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-accent/20"
                    style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}
                  >
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
                    <p className="text-xs text-gray-400">Pendapatan periode ini</p>
                  </div>
                </div>
                <select
                  value={trendGroupBy}
                  onChange={(e) => setTrendGroupBy(e.target.value)}
                  className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                >
                  <option value="day">Harian</option>
                  <option value="week">Mingguan</option>
                  <option value="month">Bulanan</option>
                </select>
              </div>
              <div className="h-[280px]">
                {(trends.revenue_trend || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <TrendingUp className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-gray-400">No trend data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.35} />
                          <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f5" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => formatCompactRp(v)} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "10px 14px", background: "rgba(255,255,255,0.98)" }}
                        labelStyle={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 2 }}
                        formatter={(value) => [formatRp(value), "Revenue"]}
                        cursor={{ stroke: "#7C3AED", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#revGrad)" activeDot={{ r: 5, fill: "#7C3AED", stroke: "white", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Profit Trend */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profit Trend</h2>
                    <p className="text-xs text-gray-400">Keuntungan periode ini</p>
                  </div>
                </div>
                <select
                  value={trendGroupBy}
                  onChange={(e) => setTrendGroupBy(e.target.value)}
                  className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                >
                  <option value="day">Harian</option>
                  <option value="week">Mingguan</option>
                  <option value="month">Bulanan</option>
                </select>
              </div>
              <div className="h-[280px]">
                {(trends.revenue_trend || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <BarChart3 className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-gray-400">No profit data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="50%" stopColor="#10B981" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f5" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => formatCompactRp(v)} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "10px 14px", background: "rgba(255,255,255,0.98)" }}
                        labelStyle={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 2 }}
                        formatter={(value) => [formatRp(value), "Profit"]}
                        cursor={{ stroke: "#10B981", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fill="url(#profitGrad)" activeDot={{ r: 5, fill: "#10B981", stroke: "white", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ─── 6. ANALYTICS ROW (4 columns) ───────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Penjualan per Kategori (Donut) */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <PieChart className="h-4 w-4 text-accent" />
                Per Kategori
              </h3>
              {(categories.categories || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <p className="text-xs text-gray-400">No data</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-[160px] w-[160px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categories.categories}
                          dataKey="revenue"
                          nameKey="category_name"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {(categories.categories || []).map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatRp(value), "Revenue"]}
                          contentStyle={{ borderRadius: "8px", fontSize: 12 }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {(categories.categories || []).slice(0, 5).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          {cat.category_name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Number(cat.percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metode Pembayaran (Donut) */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-accent" />
                Metode Pembayaran
              </h3>
              {(paymentMethods.payment_methods || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <p className="text-xs text-gray-400">No data</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-[160px] w-[160px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={paymentMethods.payment_methods}
                          dataKey="total"
                          nameKey="method"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {(paymentMethods.payment_methods || []).map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[(idx + 3) % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatRp(value), "Total"]}
                          contentStyle={{ borderRadius: "8px", fontSize: 12 }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {(paymentMethods.payment_methods || []).slice(0, 5).map((pm, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[(idx + 3) % CHART_COLORS.length] }} />
                          {pm.method}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Number(pm.percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Pelanggan */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-accent" />
                Analytics Pelanggan
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Customers</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{overview.customer_analytics.total_customers}</span>
                    <GrowthBadge value={overview.customer_analytics.growth_total} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Customer Baru</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{overview.customer_analytics.new_customers}</span>
                    <GrowthBadge value={overview.customer_analytics.growth_new} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Repeat Customers</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{overview.customer_analytics.repeat_customers}</span>
                    <GrowthBadge value={overview.customer_analytics.growth_repeat} />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Repeat Rate</span>
                    <span className="text-sm font-bold text-accent">{Number(overview.customer_analytics.repeat_rate || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Customers */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-accent" />
                Top Customers
              </h3>
              {topCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <Users className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                  <p className="mt-1 text-xs text-gray-400">No customer data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((c, idx) => {
                    const initials = (c.full_name || c.name || "?").split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light dark:bg-accent/20 text-xs font-bold text-accent">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.full_name || c.name || "-"}</p>
                        </div>
                        <span className="text-sm font-semibold text-accent">{formatRp(c.total_spent || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── 7. TABLES ROW (2 tables side by side) ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Produk Terlaris */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#ececf2] dark:border-gray-700/60">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Produk Terlaris
                </h2>
              </div>
              {(products.top_products || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No product data</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Produk</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold text-center">Qty</th>
                        <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                        <th className="px-4 py-3 font-semibold">%</th>
                        <th className="px-4 py-3 font-semibold text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(products.top_products || []).slice(0, 10).map((p, idx) => {
                        const totalRevenue = sales.total_revenue || 1;
                        const pct = ((p.revenue || 0) / totalRevenue) * 100;
                        return (
                          <tr key={p.product_id || idx} className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60">
                            <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.product_name}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">{p.product_sku || "-"}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center rounded-lg bg-gray-500/10 px-2.5 py-1 text-xs font-semibold text-gray-500">{p.quantity_sold}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-accent">{formatRp(p.revenue)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-10 text-right">{pct.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatRp(p.profit)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Produk Margin Tertinggi */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#ececf2] dark:border-gray-700/60">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Percent className="h-5 w-5 text-accent" />
                  Produk Margin Tertinggi
                </h2>
              </div>
              {topMarginProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Percent className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No product data</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Produk</th>
                        <th className="px-4 py-3 font-semibold text-right">Margin %</th>
                        <th className="px-4 py-3 font-semibold text-right">Profit</th>
                        <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMarginProducts.map((p, idx) => (
                        <tr key={p.product_id || idx} className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60">
                          <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.product_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{p.margin_pct.toFixed(1)}%</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-accent">{formatRp(p.profit)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{formatRp(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ─── 8. BOTTOM SECTION (3 columns) ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stok Menipis */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Stok Menipis
              </h3>
              {loadingStock ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
                  ))}
                </div>
              ) : lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                  <p className="mt-2 text-xs text-gray-400">Semua stok aman</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lowStockItems.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">Sisa {item.stock || item.quantity} unit</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{item.stock || item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refund & Return */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <RotateCcw className="h-4 w-4 text-accent" />
                Refund & Return
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Refund</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatRp(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Jumlah Retur</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{overview.transaction_summary.cancelled || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Refund Rate</span>
                    <span className="text-lg font-bold text-accent">{refundRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Transaksi */}
            <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Receipt className="h-4 w-4 text-accent" />
                Ringkasan Transaksi
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Transaksi</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{overview.transaction_summary.total_transactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-500">Selesai</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {overview.transaction_summary.completed} ({Number(overview.transaction_summary.completion_rate || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-500">Batal</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {overview.transaction_summary.cancelled} ({(overview.transaction_summary.total_transactions > 0 ? ((overview.transaction_summary.cancelled / overview.transaction_summary.total_transactions) * 100) : 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Items</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{overview.transaction_summary.total_items}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 9. RINCIAN TRANSAKSI (full width table) ───────────── */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ececf2] dark:border-gray-700/60">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-accent" />
                Rincian Transaksi
              </h2>
            </div>

            {paginatedTransactions.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-400">No transactions for this period</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="px-6 py-4 font-semibold">Invoice</th>
                        <th className="px-6 py-4 font-semibold">Tanggal</th>
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">Items</th>
                        <th className="px-6 py-4 font-semibold text-right">Total</th>
                        <th className="px-6 py-4 font-semibold">Metode Bayar</th>
                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.data.map((txn) => (
                        <tr key={txn.id} className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewInvoice(txn)}
                              className="text-accent font-semibold text-sm hover:underline cursor-pointer"
                            >
                              #{txn.invoice_number || txn.id}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{formatDateTime(txn.date)}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{txn.customer_name || "Walk-in Customer"}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(txn.items || []).slice(0, 2).map((item, idx) => (
                                <span key={idx} className="inline-block rounded-lg bg-gray-500/10 border border-gray-400/20 px-2.5 py-1 text-xs font-medium text-gray-500">
                                  {item.name} x{item.qty}
                                </span>
                              ))}
                              {(txn.items || []).length > 2 && (
                                <span className="inline-block rounded-lg bg-accent-light px-2.5 py-1 text-xs font-medium text-accent">
                                  +{(txn.items || []).length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-accent">{formatRp(txn.total)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-500/10 border border-gray-400/20 px-3 py-1 text-xs font-medium text-gray-500">
                              <CreditCard className="h-3 w-3" />
                              {txn.payment_method || "Cash"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-3 w-3" />
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {paginatedTransactions.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#ececf2] dark:border-gray-700/60">
                    <p className="text-sm text-gray-400">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, paginatedTransactions.total)} of {paginatedTransactions.total}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: paginatedTransactions.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                            page === currentPage
                              ? "bg-gradient-to-r from-accent to-accent-hover text-white shadow-lg shadow-accent/20"
                              : "border border-[#ececf2] dark:border-gray-700 text-gray-600 hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, paginatedTransactions.totalPages))}
                        disabled={currentPage === paginatedTransactions.totalPages}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ─── Print Styles ───────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}