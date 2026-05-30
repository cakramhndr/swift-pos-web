import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Search,
  X,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Receipt,
  CheckCircle,
  CreditCard,
  Printer,
  AlertTriangle,
  Download,
} from "lucide-react";
import { exportCustomersPDF } from "@/lib/exportUtils";

export default function Customers() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState(() => {
    const savedCustomers = localStorage.getItem("swiftpos_customers");
    return savedCustomers ? JSON.parse(savedCustomers) : [];
  });

  const [transactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTransactionForInvoice, setSelectedTransactionForInvoice] =
    useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // ─── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("swiftpos_customers", JSON.stringify(customers));
  }, [customers]);

  // ─── Generate Customers from Transactions ───────────────────────────────
  const generateCustomersFromTransactions = () => {
    const customerMap = new Map();

    transactions.forEach((transaction) => {
      // Generate a customer name from transaction ID if no customer info exists
      const customerName = `Customer #${String(transaction.id).slice(-4)}`;
      const customerId = `cust_${transaction.id}`;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          fullName: customerName,
          email: `${customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          phone: `08${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          address: "",
          createdAt: transaction.date,
        });
      }
    });

    const newCustomers = Array.from(customerMap.values());
    setCustomers(newCustomers);
    toast.info(`Generated ${newCustomers.length} customers from transactions`);
  };

  // Auto-generate customers from transactions on initial load
  if (customers.length === 0 && transactions.length > 0) {
    generateCustomersFromTransactions();
  }

  // ─── Computed Data ──────────────────────────────────────────────────────
  const customerStats = useMemo(() => {
    const totalCustomers = customers.length;

    // Calculate active customers (at least 1 transaction)
    const customerTransactionCounts = new Map();
    let totalRevenue = 0;
    let totalOrders = 0;

    transactions.forEach((transaction) => {
      totalRevenue += transaction.total || 0;
      totalOrders += 1;

      // Try to match transaction to customer
      customers.forEach((customer) => {
        if (
          transaction.customerName === customer.fullName ||
          transaction.customerId === customer.id
        ) {
          customerTransactionCounts.set(
            customer.id,
            (customerTransactionCounts.get(customer.id) || 0) + 1,
          );
        }
      });
    });

    const activeCustomers = customerTransactionCounts.size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      avgOrderValue,
    };
  }, [customers, transactions]);

  const getCustomerStatus = useCallback(
    (customer) => {
      const customerTransactions = transactions.filter(
        (t) =>
          t.customerId === customer.id || t.customerName === customer.fullName,
      );

      if (customerTransactions.length === 0) {
        return "New";
      }

      const lastTransaction = customerTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )[0];

      if (lastTransaction) {
        const daysSinceLastPurchase =
          (new Date() - new Date(lastTransaction.date)) / (1000 * 60 * 60 * 24);
        return daysSinceLastPurchase <= 30 ? "Active" : "Inactive";
      }

      return "New";
    },
    [transactions],
  );

  const getCustomerMetrics = (customer) => {
    const customerTransactions = transactions.filter(
      (t) =>
        t.customerId === customer.id || t.customerName === customer.fullName,
    );

    const totalOrders = customerTransactions.length;
    const totalSpent = customerTransactions.reduce(
      (sum, t) => sum + (t.total || 0),
      0,
    );
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const lastTransaction = customerTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    )[0];

    const lastPurchase = lastTransaction
      ? new Date(lastTransaction.date)
      : null;

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      lastPurchase,
      lastTransaction,
    };
  };

  const handleViewInvoice = (transaction) => {
    setSelectedCustomer(null);
    setSelectedTransactionForInvoice(transaction);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      const matchesSearch =
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const status = getCustomerStatus(customer);
      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter, getCustomerStatus]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleAddCustomer = () => {
    if (!newCustomer.fullName || !newCustomer.email) {
      toast.error("Please fill in required fields");
      return;
    }

    const customer = {
      id: `cust_${Date.now()}`,
      fullName: newCustomer.fullName,
      email: newCustomer.email,
      phone: newCustomer.phone || "",
      address: newCustomer.address || "",
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => [...prev, customer]);
    setNewCustomer({
      fullName: "",
      email: "",
      phone: "",
      address: "",
    });
    setShowAddModal(false);
    toast.success("Customer added");
  };

  const handleDeleteCustomer = (customerId) => {
    setDeleteConfirm(customerId);
  };

  const confirmDeleteCustomer = () => {
    setCustomers((prev) => prev.filter((c) => c.id !== deleteConfirm));
    setDeleteConfirm(null);
    toast.success("Customer deleted");
  };

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
      Inactive: "bg-gray-500/15 border border-gray-500/30 text-gray-400",
      New: "bg-accent/15 border border-accent/30 text-accent",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Customers
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Manage your customers
            </p>
          </div>
        </div>

        <button
          onClick={() => exportCustomersPDF(customers)}
          className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 dark:hover:bg-accent/30 text-sm"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
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
                {customerStats.totalCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Customers
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {customerStats.activeCustomers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="mt-1 text-3xl font-bold text-accent">
                {formatCurrency(customerStats.totalRevenue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light dark:bg-accent/20 border border-accent/30">
              <DollarSign className="h-6 w-6 text-accent dark:text-accent" />
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Order Value
              </p>
              <p className="mt-1 text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(customerStats.avgOrderValue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Search & Filter ════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="New">New</option>
          </select>

          <p className="text-sm text-gray-400 dark:text-gray-400">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </div>
      </div>

      {/* ══════════════ Customer Table ═════════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-sm text-gray-500 dark:text-gray-400">
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold text-center">
                Total Orders
              </th>
              <th className="px-6 py-4 font-semibold text-right">
                Total Spent
              </th>
              <th className="px-6 py-4 font-semibold">Last Purchase</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                      <Users className="h-7 w-7 text-gray-400 dark:text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      No customers found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {customers.length === 0
                        ? "Add your first customer or wait for transactions"
                        : "Try adjusting your search or filter"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => {
                const metrics = getCustomerMetrics(customer);
                const status = getCustomerStatus(customer);

                return (
                  <tr
                    key={customer.id}
                    className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                          {getInitials(customer.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {customer.fullName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                            {customer.email}
                          </p>
                          {metrics.lastTransaction && (
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                              Last invoice: #{metrics.lastTransaction.id}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        {customer.phone || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {metrics.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-accent">
                        {formatCurrency(metrics.totalSpent)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        {metrics.lastPurchase
                          ? formatDate(metrics.lastPurchase.toISOString())
                          : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="flex items-center gap-1 rounded-xl border border-accent px-3 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent-light dark:hover:bg-accent/30 hover:border-accent"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
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

      {/* ══════════════ Add Customer Modal ═════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Add New Customer
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                    Fill in the customer details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.fullName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, fullName: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Address
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  placeholder="Enter address"
                  rows={3}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="flex-1 rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ View Customer Modal ════════════════════════════════ */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white text-lg font-bold" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                  {getInitials(selectedCustomer.fullName)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCustomer.fullName}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
                    Customer Details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-5 mb-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Contact Information
              </h3>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {selectedCustomer.email}
                </span>
              </div>
              {selectedCustomer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-accent" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {selectedCustomer.phone}
                  </span>
                </div>
              )}
              {selectedCustomer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-accent mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {selectedCustomer.address}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            {(() => {
              const metrics = getCustomerMetrics(selectedCustomer);

              return (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.totalOrders}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-accent dark:text-accent">
                      {formatCurrency(metrics.totalSpent)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Order</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(metrics.avgOrderValue)}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Recent Transactions */}
            {(() => {
              const customerTransactions = transactions
                .filter(
                  (t) =>
                    t.customerId === selectedCustomer.id ||
                    t.customerName === selectedCustomer.fullName,
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

              if (customerTransactions.length > 0) {
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Recent Transactions
                    </h3>
                    <div className="space-y-2">
                      {customerTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 transition-all hover:border-accent"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200">
                              <ShoppingBag className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <button
                                onClick={() => handleViewInvoice(transaction)}
                                className="text-accent dark:text-accent hover:underline cursor-pointer font-medium text-sm text-left"
                              >
                                #{transaction.id}
                              </button>
                              <p className="text-xs text-gray-400 dark:text-gray-400">
                                {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent">
                              {formatCurrency(transaction.total)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                              {transaction.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div className="text-center py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 mx-auto">
                    <ShoppingBag className="h-6 w-6 text-gray-400 dark:text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    No transactions yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    This customer hasn't made any purchases
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══════════════ Delete Confirmation Modal ═══════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Delete Customer
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this customer? This action
                cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 py-3 font-medium text-white shadow-sm transition-all hover:shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Invoice Modal (when clicked from customer detail) ═══ */}
      {selectedTransactionForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    #{selectedTransactionForInvoice.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTransactionForInvoice(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-sm font-bold text-red-500 transition-all hover:shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Transaction Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedTransactionForInvoice.date}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <CheckCircle className="h-3 w-3" />
                Completed
              </span>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Customer</span>
                <span className="text-sm font-medium">
                  {selectedTransactionForInvoice.customerName ||
                    "Walk-in Customer"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                Items
              </p>
              {selectedTransactionForInvoice.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 transition-all hover:border-accent"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Rp {item.unitPrice.toLocaleString()} x {item.qty}
                    </p>
                  </div>

                  <p className="font-bold text-accent">
                    Rp {(item.unitPrice * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" />
                  {selectedTransactionForInvoice.paymentMethod || "Cash"}
                </p>
              </div>
              {selectedTransactionForInvoice.paidAmount && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rp{" "}
                      {selectedTransactionForInvoice.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Change
                    </p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      Rp{" "}
                      {(
                        selectedTransactionForInvoice.change || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              <div className="border-t border-[#ececf2] dark:border-gray-700/60 pt-2.5 flex items-center justify-between">
                <p className="text-base font-bold text-gray-900 dark:text-white">Total</p>
                <p className="text-2xl font-bold text-accent">
                  Rp {selectedTransactionForInvoice.total.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => globalThis.print()}
              className="w-full rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
