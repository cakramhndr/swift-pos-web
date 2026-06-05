import { useNavigate } from "react-router-dom";
import { exportDashboardPDF } from "@/lib/exportUtils";
import useDashboard from "@/hooks/useDashboard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";

// ── Skeleton component (matches card layout) ─────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-7 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] animate-pulse p-7">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="h-[280px] rounded-xl bg-gray-100 dark:bg-gray-700/50" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] animate-pulse p-7">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1.5">
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-8 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 h-4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Format helpers ───────────────────────────────────────────────────
function formatCurrency(value) {
  return (value ?? 0).toLocaleString("id-ID");
}

// ── Dashboard page ──────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const { data, loading } = useDashboard();

  // ── Derive values from API data (with safe fallbacks) ─────────────
  const todaySales = data?.today_sales ?? 0;
  const todayTransactions = data?.today_transactions ?? 0;
  const todayCustomers = data?.today_customers ?? 0;
  const totalProducts = data?.total_products ?? 0;
  const totalCustomers = data?.total_customers ?? 0;
  const lowStockProducts = data?.low_stock_products ?? 0;
  const outOfStockProducts = data?.out_of_stock_products ?? 0;

  const salesChart = data?.sales_chart ?? [];
  const topProducts = data?.top_products ?? [];
  const recentTransactions = data?.recent_transactions ?? [];

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 dark:bg-gray-900">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-60 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-10 w-32 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Quick actions skeleton */}
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-28 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>

        {/* Stat cards skeleton */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Charts row skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>

        {/* Bottom grid skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TableSkeleton />
          </div>
          <div className="space-y-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // ── Computed values for "Summary" card ─────────────────────────────
  const chartTotal = salesChart.reduce((s, d) => s + (d.total ?? 0), 0);
  const avgOrderValue =
    todayTransactions > 0 ? Math.round(todaySales / todayTransactions) : 0;

  // ── Render page ──────────────────────────────────────────────────
  return (
    <div className="space-y-8 dark:bg-gray-900">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
            Dashboard
          </h1>
          <p className="text-[15px] text-gray-400 leading-snug">
            Welcome back to your POS dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              exportDashboardPDF({
                revenue: todaySales,
                orders: todayTransactions,
                productsSold: data?.total_products_sold ?? 0,
                topProducts,
                recentOrders: recentTransactions,
              })
            }
            className="flex items-center gap-2 rounded-2xl border border-accent px-5 py-2.5 font-semibold text-accent transition-all hover:bg-accent-light dark:hover:bg-accent/30"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <Plus className="h-4 w-4" />
            New Order
          </button>
        </div>
      </div>

      {/* ══════════════ Quick Actions ════════════════════════════════════ */}
      <div className="flex items-center gap-4 overflow-visible pb-2 pt-1">
        <button
          onClick={() => navigate("/transactions")}
          className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium border border-purple-200 dark:border-accent/40 text-accent dark:text-accent rounded-lg hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <ShoppingCart size={16} /> New Sale
        </button>
        <button
          onClick={() => navigate("/products")}
          className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:shadow-[0_0_20px_-2px_rgba(34,197,94,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(34,197,94,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Product
        </button>
        <button
          onClick={() => navigate("/inventory")}
          className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium border border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:shadow-[0_0_20px_-2px_rgba(249,115,22,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(249,115,22,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <AlertTriangle size={16} /> Check Stock
        </button>
        <button
          onClick={() => navigate("/reports")}
          className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-[0_0_20px_-2px_rgba(59,130,246,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <TrendingUp size={16} /> View Reports
        </button>
        <button
          onClick={() => navigate("/customers")}
          className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium border border-pink-200 dark:border-pink-800/40 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:shadow-[0_0_20px_-2px_rgba(236,72,153,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(236,72,153,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <Users size={16} /> Customers
        </button>
      </div>

      {/* ══════════════ Stat Cards ════════════════════════════════════════ */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* ─── Today's Revenue ────────────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(124,58,237,0.12)] hover:border-accent/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                Today's Revenue
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                Rp {formatCurrency(todaySales)}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  <ArrowUpRight className="h-3 w-3" />
                  {data?.sales_change != null ? data.sales_change : 0}%
                </span>
                <span className="text-[12px] text-gray-500 dark:text-gray-400">
                  vs yesterday
                </span>
              </div>
            </div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-accent/20 shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Today</span>
              <span>Yesterday</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-light"
                  style={{
                    width:
                      data?.yesterday_sales_percent != null
                        ? `${data.yesterday_sales_percent}%`
                        : "89%",
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-accent dark:text-accent">
                Rp {formatCurrency(todaySales)}
              </span>
              <span className="text-accent/50">
                Rp {formatCurrency(data?.yesterday_sales ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Today's Transactions ─────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.12)] hover:border-blue-200/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                Today's Transactions
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                {todayTransactions}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  <ArrowUpRight className="h-3 w-3" />
                  {data?.transactions_change != null
                    ? data.transactions_change
                    : 0}
                  %
                </span>
                <span className="text-[12px] text-gray-500 dark:text-gray-400">
                  vs yesterday
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20 shrink-0">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Today</span>
              <span>Yesterday</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-200"
                  style={{
                    width:
                      data?.yesterday_transactions_percent != null
                        ? `${data.yesterday_transactions_percent}%`
                        : "91%",
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-blue-600 dark:text-blue-400">
                {todayTransactions}
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                {data?.yesterday_transactions ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Today's Customers ────────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] hover:border-emerald-200/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                Today's Customers
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                {todayCustomers}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  <ArrowUpRight className="h-3 w-3" />
                  {data?.customers_change != null ? data.customers_change : 0}%
                </span>
                <span className="text-[12px] text-gray-500 dark:text-gray-400">
                  vs yesterday
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 shrink-0">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Today</span>
              <span>Yesterday</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-200"
                  style={{
                    width:
                      data?.yesterday_customers_percent != null
                        ? `${data.yesterday_customers_percent}%`
                        : "97%",
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-green-600 dark:text-green-400">
                {todayCustomers}
              </span>
              <span className="text-green-600 dark:text-green-400">
                {data?.yesterday_customers ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Low / Out of Stock ───────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(239,68,68,0.12)] hover:border-red-200/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                Low / Out of Stock
              </p>
              <h2
                className={`text-[28px] font-semibold tracking-tight leading-none ${lowStockProducts + outOfStockProducts > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
              >
                {lowStockProducts + outOfStockProducts}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${lowStockProducts + outOfStockProducts > 0 ? "bg-red-500/15 text-red-300 border border-red-500/30" : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"}`}
                >
                  {lowStockProducts + outOfStockProducts > 0 ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {lowStockProducts + outOfStockProducts > 0
                    ? "Needs attention"
                    : "All stocked"}
                </span>
              </div>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shrink-0 ${lowStockProducts + outOfStockProducts > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20" : "bg-gradient-to-br from-gray-400 to-gray-300 shadow-gray-400/20"}`}
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Low stock</span>
              <span>Out of stock</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-200"
                  style={{ width: outOfStockProducts > 0 ? "100%" : "0%" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-red-600 dark:text-red-400">
                {lowStockProducts}
              </span>
              <span className="text-red-600 dark:text-red-400">
                {outOfStockProducts}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Charts Row ════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Sales Chart ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <div>
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-accent/20"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                  }}
                >
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-tight">
                    Sales Overview
                  </h2>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400">
                    {data?.chart_label ?? "Weekly revenue performance"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  {data?.chart_period_label ?? "This week total"}
                </p>
                <p className="text-[18px] font-semibold text-gray-900 dark:text-white leading-tight">
                  Rp {formatCurrency(chartTotal)}
                </p>
              </div>
              <button className="rounded-lg border border-gray-200/70 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200 hover:text-gray-600 dark:text-gray-300 transition-all duration-200">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="h-[280px]">
              {salesChart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200/50">
                    <TrendingUp className="h-6 w-6 text-gray-400 dark:text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    No sales data yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Sales chart will appear once transactions are recorded
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesChart}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#7c3aed"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="50%"
                          stopColor="#7c3aed"
                          stopOpacity={0.12}
                        />
                        <stop
                          offset="100%"
                          stopColor="#7c3aed"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f5"
                    />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
                      tickMargin={8}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.98)",
                      }}
                      labelStyle={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#374151",
                        marginBottom: 2,
                      }}
                      formatter={(value) => [
                        `Rp ${value.toLocaleString("id-ID")}`,
                        "Revenue",
                      ]}
                      cursor={{
                        stroke: "#7c3aed",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      fill="url(#salesGradient)"
                      activeDot={{
                        r: 5,
                        fill: "#7c3aed",
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ─── Top Products (Bar) ────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-tight">
                    Top Products
                  </h2>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400">
                    Best sellers
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="h-[280px]">
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200/50">
                    <Package className="h-6 w-6 text-gray-400 dark:text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    No products sold yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete a checkout to see top products
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    barSize={24}
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f0f0f5"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 500 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #374151",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        padding: "8px 12px",
                        background: "#1f2937",
                        fontSize: 13,
                        color: "#f3f4f6",
                      }}
                      formatter={(value, name) => [
                        `${value} units`,
                        name === "sold" ? "Sold" : "Revenue",
                      ]}
                    />
                    <Bar dataKey="sold" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Bottom Grid ════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Recent Transactions ─────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="px-7 pt-7 pb-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-accent/20"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                  }}
                >
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-tight">
                    Recent Orders
                  </h3>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400">
                    Latest {recentTransactions.length} transactions
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/transactions")}
                className="text-sm font-medium text-accent hover:text-accent dark:text-accent hover:underline transition-all"
              >
                View all &rarr;
              </button>
            </div>

            <div className="overflow-x-auto -mx-7 px-7">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700/60">
                    <th className="text-left pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                      Order
                    </th>
                    <th className="text-left pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="text-right pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="text-right pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="pt-12 pb-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200/50">
                            <ShoppingCart className="h-6 w-6 text-gray-400 dark:text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            No transactions yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Complete a checkout to see orders here
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="group hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors duration-150"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                              }}
                            >
                              #{String(transaction.id).slice(-3)}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              #{transaction.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5" />
                            {transaction.date}
                          </div>
                        </td>
                        <td className="py-4 text-right font-semibold text-gray-900 dark:text-white text-sm">
                          Rp {(transaction.total ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            {transaction.status ?? "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Stock Alerts + Summary ───────────────────── */}
        <div className="space-y-6">
          {/* Low / Out of Stock Widget */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-7">
            <div className="flex items-center gap-3.5 mb-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${lowStockProducts + outOfStockProducts > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20" : "bg-gradient-to-br from-gray-400 to-gray-300 shadow-gray-400/20"}`}
              >
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-tight">
                  Stock Alerts
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  {lowStockProducts + outOfStockProducts > 0
                    ? `${lowStockProducts + outOfStockProducts} product${lowStockProducts + outOfStockProducts > 1 ? "s" : ""} need${lowStockProducts + outOfStockProducts > 1 ? "" : "s"} attention`
                    : "All products stocked"}
                </p>
              </div>
            </div>

            {lowStockProducts + outOfStockProducts > 0 ? (
              <div className="space-y-2.5">
                {/* Low stock items from API */}
                {(data?.low_stock_items ?? []).length > 0 ? (
                  data.low_stock_items.slice(0, 4).map((product) => (
                    <div
                      key={product.id ?? product.name}
                      className="flex items-center justify-between rounded-xl bg-red-500/15 border border-red-500/30 dark:bg-red-500/15 dark:border-red-500/30 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-xs font-bold text-red-600 dark:text-red-400 ring-1 ring-red-200/50">
                          {product.stock ?? product.quantity}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-red-300">
                            {(product.stock ?? product.quantity) > 0
                              ? `Only ${product.stock ?? product.quantity} left`
                              : "Out of stock"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/inventory")}
                        className="rounded-lg bg-white dark:bg-gray-700 border border-red-300/60 dark:border-red-400/40 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm"
                      >
                        Restock
                      </button>
                    </div>
                  ))
                ) : (
                  /* Fallback inline stats when no detail items */
                  <div className="space-y-3 px-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Low stock
                      </span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {lowStockProducts}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Out of stock
                      </span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {outOfStockProducts}
                      </span>
                    </div>
                  </div>
                )}

                {(data?.low_stock_items ?? []).length > 4 && (
                  <button
                    onClick={() => navigate("/inventory")}
                    className="w-full text-center text-sm font-medium text-accent hover:text-accent dark:text-accent hover:underline pt-1 transition-all"
                  >
                    View all alerts &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100/80 dark:bg-emerald-900/20 dark:border-emerald-800/30">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <p className="mt-3.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  All stock healthy
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  No products need attention
                </p>
              </div>
            )}
          </div>

          {/* Quick Summary Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-7">
            <div className="flex items-center gap-3.5 mb-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-accent/20"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-tight">
                  Summary
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Quick overview
                </p>
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Products
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalProducts}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Customers
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Avg Order Value
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Rp {formatCurrency(avgOrderValue)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Low / Out of Stock
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {lowStockProducts + outOfStockProducts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
