import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Users2,
  Crown,
  Star,
  UserPlus,
  Clock,
  Medal,
  Phone,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

export default function Analytics() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [customers] = useState(() => {
    const saved = localStorage.getItem("swiftpos_customers");
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSegment, setSelectedSegment] = useState("All");

  // ─── Customer Metrics ───────────────────────────────────────────────────
  const customerMetrics = useMemo(() => {
    const now = new Date();
    const customerData = customers.map((customer) => {
      const customerTransactions = transactions.filter(
        (t) =>
          t.customerId === customer.id || t.customerName === customer.fullName,
      );

      const totalSpent = customerTransactions.reduce(
        (sum, t) => sum + (t.total || 0),
        0,
      );
      const totalOrders = customerTransactions.length;

      const lastTransaction = customerTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )[0];

      let segment;
      if (totalOrders === 0) {
        segment = "New";
      } else if (totalSpent > 5000000) {
        segment = "VIP";
      } else if (lastTransaction) {
        const daysSinceLastPurchase =
          (now - new Date(lastTransaction.date)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPurchase > 30) {
          segment = "Inactive";
        } else {
          segment = "Regular";
        }
      } else {
        segment = "Regular";
      }

      return {
        ...customer,
        totalSpent,
        totalOrders,
        lastTransaction,
        segment,
        lastPurchaseDate: lastTransaction
          ? new Date(lastTransaction.date)
          : null,
      };
    });

    // Sort by total spent descending
    customerData.sort((a, b) => b.totalSpent - a.totalSpent);

    const totalCustomers = customerData.length;
    const vipCustomers = customerData.filter((c) => c.segment === "VIP").length;
    const inactiveCustomers = customerData.filter(
      (c) => c.segment === "Inactive",
    ).length;
    const avgLifetimeValue =
      totalCustomers > 0
        ? customerData.reduce((sum, c) => sum + c.totalSpent, 0) /
          totalCustomers
        : 0;

    const segments = {
      VIP: customerData.filter((c) => c.segment === "VIP"),
      Regular: customerData.filter((c) => c.segment === "Regular"),
      New: customerData.filter((c) => c.segment === "New"),
      Inactive: customerData.filter((c) => c.segment === "Inactive"),
    };

    const topCustomers = customerData.slice(0, 10);
    const needsAttention = customerData.filter((c) => {
      if (c.segment !== "Inactive") return false;
      if (!c.lastPurchaseDate) return false;
      const daysSince = (now - c.lastPurchaseDate) / (1000 * 60 * 60 * 24);
      return daysSince > 30;
    });

    return {
      totalCustomers,
      vipCustomers,
      inactiveCustomers,
      avgLifetimeValue,
      segments,
      topCustomers,
      needsAttention,
    };
  }, [customers, transactions]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleContact = (customerName) => {
    toast.info(`Feature coming soon: Contact ${customerName}`);
  };

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  const getDaysSince = (date) => {
    if (!date) return "-";
    const now = new Date();
    const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return `${days} hari`;
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400 dark:text-gray-400";
    if (rank === 3) return "text-amber-600 dark:text-amber-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const getSegmentBadge = (segment) => {
    const styles = {
      VIP: "bg-amber-500/15 border border-amber-500/30 text-amber-300",
      Regular: "bg-accent/15 border border-accent/30 text-accent",
      New: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
      Inactive: "bg-red-500/15 border border-red-500/30 text-red-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[segment]}`}
      >
        {segment}
      </span>
    );
  };

  const filteredLeaderboard = useMemo(() => {
    if (selectedSegment === "All") return customerMetrics.topCustomers;
    return customerMetrics.segments[selectedSegment] || [];
  }, [selectedSegment, customerMetrics]);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
            <Users2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              CRM
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Customer relationship management
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ Summary Cards ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Customers
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {customerMetrics.totalCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30">
              <Users2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* VIP Customers */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">VIP Customers</p>
              <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {customerMetrics.vipCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
              <Crown className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
          </div>
        </div>

        {/* Inactive Customers */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Inactive Customers
              </p>
              <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">
                {customerMetrics.inactiveCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30">
              <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Avg Lifetime Value */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Lifetime Value
              </p>
              <p className="mt-1 text-3xl font-bold text-accent">
                {formatCurrency(customerMetrics.avgLifetimeValue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light dark:bg-accent/20 border border-accent/30 dark:bg-accent/30 border border-purple-200/50 dark:border-accent/30">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Customer Segments ══════════════════════════════════ */}
      <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Customer Segments
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* VIP Segment */}
          <button
            onClick={() =>
              setSelectedSegment(selectedSegment === "VIP" ? "All" : "VIP")
            }
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              selectedSegment === "VIP"
                ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                : "border-[#ececf2] dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30 dark:bg-amber-900/30">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="font-semibold text-amber-700 dark:text-amber-300">VIP</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {customerMetrics.segments.VIP.length}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400/70 mt-1">
              &gt; Rp 5.000.000 spent
            </p>
          </button>

          {/* Regular Segment */}
          <button
            onClick={() =>
              setSelectedSegment(
                selectedSegment === "Regular" ? "All" : "Regular",
              )
            }
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              selectedSegment === "Regular"
                ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-[#ececf2] dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300">Regular</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {customerMetrics.segments.Regular.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400/70 mt-1">
              Rp 1.000.000 - 5.000.000
            </p>
          </button>

          {/* New Segment */}
          <button
            onClick={() =>
              setSelectedSegment(selectedSegment === "New" ? "All" : "New")
            }
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              selectedSegment === "New"
                ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-[#ececf2] dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30">
                <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold text-green-700 dark:text-green-300">New</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {customerMetrics.segments.New.length}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400/70 mt-1">0 transactions</p>
          </button>

          {/* Inactive Segment */}
          <button
            onClick={() =>
              setSelectedSegment(
                selectedSegment === "Inactive" ? "All" : "Inactive",
              )
            }
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              selectedSegment === "Inactive"
                ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                : "border-[#ececf2] dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="font-semibold text-red-400 dark:text-red-300">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {customerMetrics.segments.Inactive.length}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400/70 mt-1">
              No purchase in 30 days
            </p>
          </button>
        </div>
      </div>

      {/* ══════════════ Top Customers Leaderboard ══════════════════════════ */}
      <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-[#ececf2] dark:border-gray-700/60">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Medal className="h-5 w-5 text-accent" />
            Top Customers
          </h2>
        </div>

        {filteredLeaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
              <Users2 className="h-7 w-7 text-gray-400 dark:text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              No customers in this segment
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ececf2] dark:divide-gray-700/50">
            {filteredLeaderboard.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-4 hover:bg-accent-light dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors"
              >
                {/* Rank */}
                <div
                  className={`w-12 text-center font-bold text-lg ${getMedalColor(index + 1)}`}
                >
                  {index + 1 <= 3 ? (
                    <Medal
                      className={`h-6 w-6 mx-auto ${getMedalColor(index + 1)}`}
                    />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>

                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold flex-shrink-0" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                  {getInitials(customer.fullName)}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {customer.fullName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {customer.email}
                  </p>
                </div>

                {/* Total Orders */}
                <div className="text-center">
                  <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {customer.totalOrders} orders
                  </span>
                </div>

                {/* Total Spent */}
                <div className="text-right min-w-[120px]">
                  <p className="text-lg font-bold text-accent">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>

                {/* Last Purchase */}
                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.lastPurchaseDate
                      ? formatDate(customer.lastPurchaseDate.toISOString())
                      : "-"}
                  </p>
                </div>

                {/* Segment Badge */}
                <div className="min-w-[80px]">
                  {getSegmentBadge(customer.segment)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════ Inactive Customers Alert ═══════════════════════════ */}
      {customerMetrics.needsAttention.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 overflow-hidden">
          <div className="p-6 border-b border-red-200 dark:border-red-800/50">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Perlu Perhatian
            </h2>
          </div>

          <div className="divide-y divide-red-200 dark:divide-red-800/30">
            {customerMetrics.needsAttention.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold flex-shrink-0">
                  {getInitials(customer.fullName)}
                </div>

                {/* Customer Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {customer.fullName}
                  </p>
                </div>

                {/* Last Purchase */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last:{" "}
                    {customer.lastPurchaseDate
                      ? formatDate(customer.lastPurchaseDate.toISOString())
                      : "-"}
                  </p>
                </div>

                {/* Days Since */}
                <div className="text-center min-w-[80px]">
                  <span className="inline-flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30 px-3 py-1 text-sm font-semibold text-red-700">
                    {getDaysSince(customer.lastPurchaseDate)}
                  </span>
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => handleContact(customer.fullName)}
                  className="flex items-center gap-1 rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Hubungi
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
