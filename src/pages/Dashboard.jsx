import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

export default function Dashboard() {
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

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Welcome back to Swift POS
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-[#f8f8fc] px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-gray-600">
            System online
          </span>
        </div>
      </div>

      {/* ══════════════ Stat Cards ════════════════════════════════════════ */}
      <div className="grid gap-5 md:grid-cols-4">
        {/* ─── Total Revenue ─────────────────────────────────────────── */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-[1px] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="relative rounded-3xl bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Total Revenue
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  From {totalTransactions} transaction
                  {totalTransactions > 1 ? "s" : ""}
                </p>
              </div>

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* subtle background decoration */}
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-100/50 to-transparent" />
          </div>
        </div>

        {/* ─── Orders ───────────────────────────────────────────────── */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 p-[1px] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="relative rounded-3xl bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Orders
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalTransactions}
                </h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  Total transactions
                </p>
              </div>

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100/50 to-transparent" />
          </div>
        </div>

        {/* ─── Products Sold ────────────────────────────────────────── */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-green-600 p-[1px] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="relative rounded-3xl bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Products Sold
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalProductsSold}
                </h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Total items sold
                </p>
              </div>

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100/50 to-transparent" />
          </div>
        </div>

        {/* ─── Low Stock ────────────────────────────────────────────── */}
        <div
          className={`group relative overflow-hidden rounded-3xl p-[1px] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${lowStockProducts > 0 ? "bg-gradient-to-br from-red-600 to-rose-600" : "bg-gradient-to-br from-gray-400 to-gray-300"}`}
        >
          <div className="relative rounded-3xl bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Low Stock
                </p>
                <h2
                  className={`mt-2 text-3xl font-bold ${lowStockProducts > 0 ? "text-red-600" : "text-gray-900"}`}
                >
                  {lowStockProducts}
                </h2>
                <p
                  className={`mt-2 flex items-center gap-1.5 text-sm ${lowStockProducts > 0 ? "text-red-500" : "text-green-600"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d={
                        lowStockProducts > 0
                          ? "M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          : "M20 6 9 17l-5-5"
                      }
                    />
                  </svg>
                  {lowStockProducts > 0
                    ? "Needs attention"
                    : "All stock healthy"}
                </p>
              </div>

              <div
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${lowStockProducts > 0 ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-gray-400 to-gray-300"}`}
              >
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>

            <div
              className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full ${lowStockProducts > 0 ? "bg-gradient-to-br from-red-100/50" : "bg-gradient-to-br from-gray-100/50"} to-transparent`}
            />
          </div>
        </div>
      </div>

      {/* ══════════════ Weekly Sales Chart ════════════════════════════════ */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Weekly Sales
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Sales performance overview
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">This week</p>
                <p className="text-lg font-bold text-gray-900">
                  Rp{" "}
                  {weeklyData
                    .reduce((sum, d) => sum + d.total, 0)
                    .toLocaleString("id-ID")}
                </p>
              </div>
              <div className="h-10 w-px bg-[#ececf2]" />
              <div className="text-right">
                <p className="text-xs text-gray-400">Best day</p>
                <p className="text-lg font-bold text-violet-600">
                  Rp{" "}
                  {Math.max(...weeklyData.map((d) => d.total)).toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 pb-2">
          <div className="h-[300px] rounded-2xl bg-gradient-to-b from-[#faf9ff] to-white">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyData}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e8e6f0"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 13, fontWeight: 500 }}
                  tickMargin={8}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #ececf2",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                  formatter={(value) => [
                    `Rp ${value.toLocaleString("id-ID")}`,
                    "Revenue",
                  ]}
                  cursor={{
                    stroke: "#7c3aed",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                  filter="url(#glow)"
                  activeDot={{
                    r: 6,
                    fill: "#7c3aed",
                    stroke: "white",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ══════════════ Bottom Cards Grid ════════════════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ─── Recent Orders ─────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Recent Orders
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Latest transactions
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
                  {recentTransactions.length} recent
                </span>
              </div>

              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <ShoppingCart className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      No transactions yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete a checkout to see orders here
                    </p>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="group/item flex items-center justify-between rounded-2xl border border-[#ececf2] p-4 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                          #{String(transaction.id).slice(-3)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            #{transaction.id}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {transaction.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-violet-600">
                          Rp {transaction.total.toLocaleString("id-ID")}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Completed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Top Products ──────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Top Products
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Best selling products
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                  Top {topProducts.length}
                </span>
              </div>

              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
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
                  topProducts.map((product, index) => {
                    const rankColors = [
                      "from-amber-400 to-yellow-500 text-amber-600",
                      "from-gray-300 to-gray-400 text-gray-500",
                      "from-orange-300 to-amber-400 text-orange-500",
                    ];

                    return (
                      <div
                        key={product.name}
                        className="group/item flex items-center justify-between rounded-2xl border border-[#ececf2] p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm font-bold text-sm ${rankColors[index] || "bg-gradient-to-br from-violet-100 to-purple-200 text-violet-600"}`}
                          >
                            #{index + 1}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.sold} unit{product.sold > 1 ? "s" : ""}{" "}
                              sold
                            </p>
                          </div>
                        </div>

                        <div className="rounded-full bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                          {product.sold >= 10 ? "🔥 Popular" : "New"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
