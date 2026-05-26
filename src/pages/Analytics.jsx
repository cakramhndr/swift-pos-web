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
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-gray-500";
  };

  const getSegmentBadge = (segment) => {
    const styles = {
      VIP: "bg-amber-100 text-amber-700",
      Regular: "bg-blue-100 text-blue-700",
      New: "bg-green-100 text-green-700",
      Inactive: "bg-red-100 text-red-700",
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
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Users2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              CRM
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Customer relationship management
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ Summary Cards ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="rounded-2xl border border-[#ececf2] p-6 transition-all hover:border-violet-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Customers
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {customerMetrics.totalCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              <Users2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* VIP Customers */}
        <div className="rounded-2xl border border-[#ececf2] p-6 transition-all hover:border-violet-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">VIP Customers</p>
              <p className="mt-1 text-3xl font-bold text-amber-600">
                {customerMetrics.vipCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Inactive Customers */}
        <div className="rounded-2xl border border-[#ececf2] p-6 transition-all hover:border-violet-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Customers
              </p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {customerMetrics.inactiveCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Avg Lifetime Value */}
        <div className="rounded-2xl border border-[#ececf2] p-6 transition-all hover:border-violet-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Avg Lifetime Value
              </p>
              <p className="mt-1 text-3xl font-bold text-purple-600">
                {formatCurrency(customerMetrics.avgLifetimeValue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Customer Segments ══════════════════════════════════ */}
      <div className="rounded-2xl border border-[#ececf2] p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
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
                ? "border-amber-400 bg-amber-50"
                : "border-[#ececf2] hover:border-amber-200 hover:bg-amber-50/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              <span className="font-semibold text-amber-700">VIP</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {customerMetrics.segments.VIP.length}
            </p>
            <p className="text-xs text-amber-600/70 mt-1">
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
                ? "border-blue-400 bg-blue-50"
                : "border-[#ececf2] hover:border-blue-200 hover:bg-blue-50/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-blue-700">Regular</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {customerMetrics.segments.Regular.length}
            </p>
            <p className="text-xs text-blue-600/70 mt-1">
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
                ? "border-green-400 bg-green-50"
                : "border-[#ececf2] hover:border-green-200 hover:bg-green-50/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold text-green-700">New</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {customerMetrics.segments.New.length}
            </p>
            <p className="text-xs text-green-600/70 mt-1">0 transactions</p>
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
                ? "border-red-400 bg-red-50"
                : "border-[#ececf2] hover:border-red-200 hover:bg-red-50/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-semibold text-red-700">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {customerMetrics.segments.Inactive.length}
            </p>
            <p className="text-xs text-red-600/70 mt-1">
              No purchase in 30 days
            </p>
          </button>
        </div>
      </div>

      {/* ══════════════ Top Customers Leaderboard ══════════════════════════ */}
      <div className="rounded-2xl border border-[#ececf2] overflow-hidden">
        <div className="p-6 border-b border-[#ececf2]">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Medal className="h-5 w-5 text-violet-600" />
            Top Customers
          </h2>
        </div>

        {filteredLeaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Users2 className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500">
              No customers in this segment
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ececf2]">
            {filteredLeaderboard.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-4 hover:bg-violet-50/30 transition-colors"
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                  {getInitials(customer.fullName)}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {customer.fullName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {customer.email}
                  </p>
                </div>

                {/* Total Orders */}
                <div className="text-center">
                  <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {customer.totalOrders} orders
                  </span>
                </div>

                {/* Total Spent */}
                <div className="text-right min-w-[120px]">
                  <p className="text-lg font-bold text-violet-600">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>

                {/* Last Purchase */}
                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-gray-500">
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
        <div className="rounded-2xl border border-red-200 bg-red-50/50 overflow-hidden">
          <div className="p-6 border-b border-red-200">
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Perlu Perhatian
            </h2>
          </div>

          <div className="divide-y divide-red-200">
            {customerMetrics.needsAttention.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-4 hover:bg-red-50 transition-colors"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold flex-shrink-0">
                  {getInitials(customer.fullName)}
                </div>

                {/* Customer Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {customer.fullName}
                  </p>
                </div>

                {/* Last Purchase */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Last:{" "}
                    {customer.lastPurchaseDate
                      ? formatDate(customer.lastPurchaseDate.toISOString())
                      : "-"}
                  </p>
                </div>

                {/* Days Since */}
                <div className="text-center min-w-[80px]">
                  <span className="inline-flex items-center justify-center rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    {getDaysSince(customer.lastPurchaseDate)}
                  </span>
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => handleContact(customer.fullName)}
                  className="flex items-center gap-1 rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
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
