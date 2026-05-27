import { useNavigate } from "react-router-dom";
import { exportDashboardPDF } from "@/lib/exportUtils";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

  const products = JSON.parse(localStorage.getItem("products") || "[]");

  const totalRevenue = transactions.reduce(
    (total, transaction) => total + transaction.total,
    0,
  );

  const totalTransactions = transactions.length;

  const totalProductsSold = transactions.reduce(
    (total, transaction) =>
      total + transaction.items.reduce((sum, item) => sum + item.qty, 0),
    0,
  );

  const lowStockProducts = products.filter(
    (product) => product.stock <= 10,
  ).length;

  const recentTransactions = [...transactions].reverse().slice(0, 5);

  const productSales = {};

  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      if (!productSales[item.name]) {
        productSales[item.name] = 0;
      }

      productSales[item.name] += item.qty;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, sold]) => ({
      name,
      sold,
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const weeklyData = [
    { day: "Mon", total: 0 },
    { day: "Tue", total: 0 },
    { day: "Wed", total: 0 },
    { day: "Thu", total: 0 },
    { day: "Fri", total: 0 },
    { day: "Sat", total: 0 },
    { day: "Sun", total: 0 },
  ];

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);

    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

    weeklyData[dayIndex].total += transaction.total;
  });

  const revenueChange = totalRevenue > 0 ? 12.5 : 0;

  return (
    <div className="space-y-8">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 leading-tight">
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
                revenue: totalRevenue,
                orders: totalTransactions,
                productsSold: totalProductsSold,
                topProducts,
                recentOrders: recentTransactions,
              })
            }
            className="flex items-center gap-2 rounded-2xl border border-violet-200 px-5 py-2.5 font-semibold text-violet-600 transition-all hover:bg-violet-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            New Order
          </button>
        </div>
      </div>

      {/* ══════════════ Quick Actions ════════════════════════════════════ */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
        >
          <ShoppingCart size={16} /> New Sale
        </button>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Product
        </button>
        <button
          onClick={() => navigate("/inventory")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
        >
          <AlertTriangle size={16} /> Check Stock
        </button>
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <TrendingUp size={16} /> View Reports
        </button>
        <button
          onClick={() => navigate("/crm")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-pink-200 text-pink-700 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
        >
          <Users size={16} /> CRM
        </button>
      </div>

      {/* ══════════════ Stat Cards ════════════════════════════════════════ */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* ─── Total Revenue ─────────────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200/70 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(124,58,237,0.12)] hover:border-violet-200/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-400 tracking-wide">
                Total Revenue
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 leading-none">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/50">
                  <ArrowUpRight className="h-3 w-3" />
                  {revenueChange}%
                </span>
                <span className="text-[12px] text-gray-400">vs last week</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 shrink-0">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Minggu ini</span>
              <span>Minggu lalu</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-200"
                  style={{ width: "89%" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-purple-600">Rp 62.361.000</span>
              <span className="text-purple-300">Rp 55.432.000</span>
            </div>
          </div>
        </div>

        {/* ─── Orders ───────────────────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200/70 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.12)] hover:border-blue-200/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-400 tracking-wide">
                Orders
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 leading-none">
                {totalTransactions}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/50">
                  <ArrowUpRight className="h-3 w-3" />
                  8.2%
                </span>
                <span className="text-[12px] text-gray-400">vs last week</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20 shrink-0">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Minggu ini</span>
              <span>Minggu lalu</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-200"
                  style={{ width: "91%" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-blue-600">11</span>
              <span className="text-blue-300">10</span>
            </div>
          </div>
        </div>

        {/* ─── Products Sold ────────────────────────────────────────── */}
        <div className="group relative rounded-2xl border border-gray-200/70 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] hover:border-emerald-200/80 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-400 tracking-wide">
                Products Sold
              </p>
              <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 leading-none">
                {totalProductsSold}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/50">
                  <ArrowUpRight className="h-3 w-3" />
                  3.1%
                </span>
                <span className="text-[12px] text-gray-400">vs last week</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 shrink-0">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Minggu ini</span>
              <span>Minggu lalu</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-200"
                  style={{ width: "97%" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-green-600">39</span>
              <span className="text-green-300">38</span>
            </div>
          </div>
        </div>

        {/* ─── Low Stock ────────────────────────────────────────────── */}
        <div
          className={`group relative rounded-2xl border bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(239,68,68,0.12)] transition-all duration-300 ${lowStockProducts > 0 ? "border-red-200/80 hover:border-red-300/80" : "border-gray-200/70 hover:border-gray-300/70"}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-gray-400 tracking-wide">
                Low Stock
              </p>
              <h2
                className={`text-[28px] font-semibold tracking-tight leading-none ${lowStockProducts > 0 ? "text-red-600" : "text-gray-900"}`}
              >
                {lowStockProducts}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${lowStockProducts > 0 ? "bg-red-50 text-red-700 ring-red-200/50" : "bg-emerald-50 text-emerald-700 ring-emerald-200/50"}`}
                >
                  {lowStockProducts > 0 ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {lowStockProducts > 0 ? "Needs attention" : "All stocked"}
                </span>
              </div>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shrink-0 ${lowStockProducts > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20" : "bg-gradient-to-br from-gray-400 to-gray-300 shadow-gray-400/20"}`}
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Minggu ini</span>
              <span>Minggu lalu</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-200"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-red-600">2</span>
              <span className="text-red-300">Butuh perhatian</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Charts Row ════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Weekly Sales Chart ────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-gray-900 leading-tight">
                    Sales Overview
                  </h2>
                  <p className="text-[13px] text-gray-400">
                    Weekly revenue performance
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] text-gray-400">This week total</p>
                <p className="text-[18px] font-semibold text-gray-900 leading-tight">
                  Rp{" "}
                  {weeklyData
                    .reduce((sum, d) => sum + d.total, 0)
                    .toLocaleString("id-ID")}
                </p>
              </div>
              <button className="rounded-lg border border-gray-200/70 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all duration-200">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyData}
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
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
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
            </div>
          </div>
        </div>

        {/* ─── Top Products (Bar) ────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-gray-900 leading-tight">
                    Top Products
                  </h2>
                  <p className="text-[13px] text-gray-400">Best sellers</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="h-[280px]">
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-gray-200/50">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500">
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
                      tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.98)",
                        fontSize: 13,
                      }}
                      formatter={(value) => [`${value} units`, "Sold"]}
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
        {/* ─── Recent Orders ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="px-7 pt-7 pb-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[16px] font-semibold text-gray-900 leading-tight">
                    Recent Orders
                  </h3>
                  <p className="text-[13px] text-gray-400">
                    Latest {recentTransactions.length} transactions
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/transactions")}
                className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline transition-all"
              >
                View all &rarr;
              </button>
            </div>

            <div className="overflow-x-auto -mx-7 px-7">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100/80">
                    <th className="text-left pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      Order
                    </th>
                    <th className="text-left pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      Date
                    </th>
                    <th className="text-right pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      Amount
                    </th>
                    <th className="text-right pb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/80">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="pt-12 pb-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-gray-200/50">
                            <ShoppingCart className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-500">
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
                        className="group hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                              #{String(transaction.id).slice(-3)}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              #{transaction.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <Clock className="h-3.5 w-3.5" />
                            {transaction.date}
                          </div>
                        </td>
                        <td className="py-4 text-right font-semibold text-gray-900 text-sm">
                          Rp {transaction.total.toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/50">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
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

        {/* ─── Low Stock Alert + Quick Summary ───────────────────────── */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-7">
            <div className="flex items-center gap-3.5 mb-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${lowStockProducts > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20" : "bg-gradient-to-br from-gray-400 to-gray-300 shadow-gray-400/20"}`}
              >
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[16px] font-semibold text-gray-900 leading-tight">
                  Stock Alerts
                </h3>
                <p className="text-[13px] text-gray-400">
                  {lowStockProducts > 0
                    ? `${lowStockProducts} product${lowStockProducts > 1 ? "s" : ""} running low`
                    : "All products stocked"}
                </p>
              </div>
            </div>

            {lowStockProducts > 0 ? (
              <div className="space-y-2.5">
                {products
                  .filter((p) => p.stock <= 10)
                  .slice(0, 4)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl bg-red-50/50 border border-red-100/80 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600 ring-1 ring-red-200/50">
                          {product.stock}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-red-500">
                            Only {product.stock} left
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/inventory")}
                        className="rounded-lg bg-white border border-red-200/80 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                {products.filter((p) => p.stock <= 10).length > 4 && (
                  <button
                    onClick={() => navigate("/inventory")}
                    className="w-full text-center text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline pt-1 transition-all"
                  >
                    View all alerts &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100/80">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <p className="mt-3.5 text-sm font-medium text-gray-700">
                  All stock healthy
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  No products need attention
                </p>
              </div>
            )}
          </div>

          {/* Quick Summary Card */}
          <div className="rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-7">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[16px] font-semibold text-gray-900 leading-tight">
                  Summary
                </h3>
                <p className="text-[13px] text-gray-400">Quick overview</p>
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-400">Total Products</span>
                <span className="text-sm font-semibold text-gray-900">
                  {products.length}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-400">Avg Order Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  Rp{" "}
                  {totalTransactions > 0
                    ? Math.round(
                        totalRevenue / totalTransactions,
                      ).toLocaleString("id-ID")
                    : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-400">Items per Order</span>
                <span className="text-sm font-semibold text-gray-900">
                  {totalTransactions > 0
                    ? (totalProductsSold / totalTransactions).toFixed(1)
                    : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Active Products</span>
                <span className="text-sm font-semibold text-gray-900">
                  {products.filter((p) => p.stock > 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
