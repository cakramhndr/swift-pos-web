import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { exportDashboardPDF } from "@/lib/exportUtils";
import useDashboard from "@/hooks/useDashboard";
import useReports from "@/hooks/useReports";
import useStoreProfile from "@/hooks/useStoreProfile";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Box,
  BarChart3,
} from "lucide-react";

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

function formatCurrency(value) {
  return (value ?? 0).toLocaleString("id-ID");
}

const formatRp = (v) => {
  if (v == null) return "Rp 0";
  return "Rp " + Number(v).toLocaleString("id-ID");
};

// ── Mini sparkline component ─────────────────────────────────────────
function MiniSparkline({ data, color, height = 32 }) {
  if (!data || data.length < 2) return null;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  growth,
  sparklineData,
  sparklineColor,
}) {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:border-accent/60">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
            {value}
          </p>
          {growth != null && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${growth >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"}`}
              >
                {growth >= 0 ? (
                  <ArrowUpRight className="h-2.5 w-2.5" />
                ) : (
                  <ArrowDownRight className="h-2.5 w-2.5" />
                )}
                {growth >= 0 ? "+" : ""}
                {growth}%
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-400">
                vs yesterday
              </span>
            </div>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <MiniSparkline
          data={sparklineData}
          color={sparklineColor || "#7c3aed"}
        />
      )}
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-32 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
          >
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 bg-gray-100 dark:bg-gray-700/50 rounded mb-2"
              />
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-[180px] bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading } = useDashboard();
  const { paymentMethods, fetchAll: fetchReports } = useReports();
  const { storeProfile } = useStoreProfile();

  // ── State ──────────────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState("week");
  const [accentColor] = useState(() => getAccentColor());

  // ── Fetch reports data for payment methods and inventory stats ──────
  useState(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
    fetchReports(fmt(start), fmt(end));
  }, [fetchReports]);

  // ── Derive values ──────────────────────────────────────────────────
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

  // ── Sale change values ────────────────────────────────────────────
  const salesGrowth = data?.sales_change ?? null;
  const txGrowth = data?.transactions_change ?? null;
  const custGrowth = data?.customers_change ?? null;

  // ── Build sparkline data ──────────────────────────────────────────
  const sparklineRevenue = useMemo(() => {
    if (salesChart.length === 0) return [];
    return salesChart.map((d) => ({ value: d.total || 0 }));
  }, [salesChart]);

  // ── Chart total ───────────────────────────────────────────────────
  const chartTotal = salesChart.reduce((s, d) => s + (d.total ?? 0), 0);
  const avgOrderValue =
    todayTransactions > 0 ? Math.round(todaySales / todayTransactions) : 0;

  // ── Inventory stats for donut ─────────────────────────────────────
  const inStockProducts = totalProducts - lowStockProducts - outOfStockProducts;
  const inventoryData = useMemo(
    () => [
      {
        name: "In Stock",
        value: Math.max(0, inStockProducts),
        color: "#10B981",
      },
      { name: "Low Stock", value: lowStockProducts, color: "#F59E0B" },
      { name: "Out of Stock", value: outOfStockProducts, color: "#EF4444" },
    ],
    [inStockProducts, lowStockProducts, outOfStockProducts],
  );

  // ── Payment methods from reports ──────────────────────────────────
  const paymentMethodsData = useMemo(() => {
    const methods = paymentMethods.payment_methods || [];
    const colors = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
    return methods.map((m, i) => ({ ...m, color: colors[i % colors.length] }));
  }, [paymentMethods]);

  // ── Top products for ranking bars ────────────────────────────────
  const top5 = useMemo(() => {
    return (topProducts || []).slice(0, 5);
  }, [topProducts]);
  const maxSold =
    top5.length > 0 ? Math.max(...top5.map((p) => p.sold || 0)) : 1;

  // ── Loading state ────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ═══ Page Header ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {storeProfile?.name
              ? `${storeProfile.name} Dashboard`
              : "Dashboard"}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
            Welcome back to {storeProfile?.name || "your POS"} dashboard
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
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent-light dark:hover:bg-accent/30"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <Plus className="h-4 w-4" /> New Order
          </button>
        </div>
      </div>

      {/* ═══ KPI Cards Row ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Revenue"
          value={`Rp ${formatCurrency(todaySales)}`}
          icon={DollarSign}
          iconBg="bg-accent-light dark:bg-accent/20"
          iconColor="text-accent"
          growth={salesGrowth}
          sparklineData={sparklineRevenue}
          sparklineColor={accentColor}
        />
        <KpiCard
          title="Transactions"
          value={todayTransactions}
          icon={ShoppingCart}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          growth={txGrowth}
        />
        <KpiCard
          title="Customers"
          value={todayCustomers}
          icon={Users}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          growth={custGrowth}
        />
        <KpiCard
          title="Low / Out of Stock"
          value={lowStockProducts + outOfStockProducts}
          icon={AlertTriangle}
          iconBg={
            lowStockProducts + outOfStockProducts > 0
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-gray-100 dark:bg-gray-700/50"
          }
          iconColor={
            lowStockProducts + outOfStockProducts > 0
              ? "text-red-600 dark:text-red-400"
              : "text-gray-400"
          }
        />
      </div>

      {/* ═══ 3-Column Layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Sales Overview (2/3) ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Overview Chart */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  Sales Overview
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data?.chart_label ?? "Revenue performance"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-3">
                  <p className="text-[11px] text-gray-400">
                    {data?.chart_period_label ?? "Total"}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Rp {formatCurrency(chartTotal)}
                  </p>
                </div>
                <div className="flex gap-1 rounded-lg border border-[#ececf2] dark:border-gray-600 p-0.5">
                  {["week", "month"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartPeriod === p ? "bg-accent text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
                    >
                      {p === "week" ? "Week" : "Month"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="h-[300px]">
                {salesChart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <BarChart3 className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-gray-400">
                      No sales data yet
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
                          id="salesAreaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={accentColor}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor={accentColor}
                            stopOpacity={0.02}
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
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
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
                          stroke: accentColor,
                          strokeWidth: 1,
                          strokeDasharray: "3 3",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        fill="url(#salesAreaGrad)"
                        activeDot={{
                          r: 5,
                          fill: accentColor,
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

          {/* Recent Orders (unchanged) */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
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
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
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
                ) : (
                  recentTransactions.map((transaction) => {
                    const initials = (
                      transaction.customerName ||
                      transaction.customer_name ||
                      "?"
                    )
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-4 transition-all duration-200 hover:shadow-[0_4px_16px_-4px_rgba(124,58,237,0.12)] hover:border-accent/60 dark:hover:border-accent/40 hover:-translate-y-0.5 cursor-pointer group"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light dark:bg-accent/20 text-sm font-bold text-accent">
                          {initials || "#"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              #{transaction.invoice_number || transaction.id}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {transaction.status ?? "Completed"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {transaction.customerName ||
                              transaction.customer_name ||
                              "Walk-in Customer"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                              <Clock className="h-2.5 w-2.5" />
                              {transaction.date}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-accent-light dark:bg-accent/20 text-accent px-2 py-0.5 text-[10px] font-medium">
                              {transaction.paymentMethod ||
                                transaction.payment_method ||
                                "Cash"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-accent">
                            Rp{" "}
                            {(transaction.total ?? 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all duration-200">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (1/3) ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Top Products — Horizontal ranking bars */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-accent" />
              Top Products
            </h3>
            {top5.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                <p className="mt-1 text-xs text-gray-400">
                  No products sold yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {top5.map((product, idx) => {
                  const pct = ((product.sold || 0) / maxSold) * 100;
                  const isRank1 = idx === 0;
                  return (
                    <div key={product.name || idx}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {idx === 0 && (
                            <span className="text-xs shrink-0">🏆</span>
                          )}
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                            {product.name || "-"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white shrink-0 ml-2">
                          {product.sold || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: isRank1 ? accentColor : "#c4b5fd",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => navigate("/products")}
              className="w-full text-center text-xs font-medium text-accent hover:text-accent hover:underline mt-4 block"
            >
              View all products &rarr;
            </button>
          </div>

          {/* Payment Methods — Donut */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-accent" />
              Payment Methods
            </h3>
            {paymentMethodsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <CreditCard className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                <p className="mt-1 text-xs text-gray-400">No data yet</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-[140px] w-[140px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={paymentMethodsData}
                        dataKey="total"
                        nameKey="method"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {paymentMethodsData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
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
                  {paymentMethodsData.slice(0, 4).map((pm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: pm.color }}
                        />
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

          {/* Inventory Status — Donut */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Box className="h-4 w-4 text-accent" />
              Inventory Status
            </h3>
            {totalProducts === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <Box className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                <p className="mt-1 text-xs text-gray-400">No products</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-[140px] w-[140px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={inventoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {inventoryData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} product${value !== 1 ? "s" : ""}`,
                          name,
                        ]}
                        contentStyle={{ borderRadius: "8px", fontSize: 12 }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {inventoryData
                    .filter((d) => d.value > 0)
                    .map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          {d.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {d.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <button
              onClick={() => navigate("/inventory")}
              className="w-full text-center text-xs font-medium text-accent hover:text-accent hover:underline mt-4 block"
            >
              Manage inventory &rarr;
            </button>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-accent" />
              Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Products
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Customers
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Avg Order Value
                </span>
                <span className="text-sm font-semibold text-accent">
                  Rp {formatCurrency(avgOrderValue)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Low / Out of Stock
                </span>
                <span className="text-sm font-semibold text-red-500">
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
