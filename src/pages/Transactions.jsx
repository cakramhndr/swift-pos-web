import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ShoppingCart,
  Search,
  Package,
  Receipt,
  Plus,
  Minus,
  Trash2,
  X,
  Printer,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
} from "lucide-react";

export default function Transactions() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("products");

    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");

    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [search, setSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Customer selection state
  const [customers, setCustomers] = useState(() => {
    const savedCustomers = localStorage.getItem("swiftpos_customers");
    return savedCustomers ? JSON.parse(savedCustomers) : [];
  });
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null); // null = walk-in
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    phone: "",
  });
  const [selectedCustomerType, setSelectedCustomerType] = useState(null); // 'existing', 'new', 'walkin'

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "products") {
        try {
          const updated = JSON.parse(e.newValue);
          if (updated) {
            setProducts(updated);
          }
        } catch {
          console.error("Failed to parse products from storage");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ─── Cart Handlers ──────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
  };

  const decreaseQty = (id) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.id === id);
      if (item.qty <= 1) {
        return prevCart.filter((item) => item.id !== id);
      }
      return prevCart.map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item,
      );
    });
  };

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // ─── Checkout ───────────────────────────────────────────────────────────
  const totalAmount = cart.reduce(
    (total, item) => total + item.unitPrice * item.qty,
    0,
  );
  const change = Math.max(0, Number(paidAmount) - totalAmount);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const handleProceedToCheckout = () => {
    setShowCustomerSelect(true);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSelectedCustomerType("existing");
  };

  const handleSelectWalkIn = () => {
    setSelectedCustomer(null);
    setSelectedCustomerType("walkin");
  };

  const handleCreateNewCustomer = () => {
    if (!newCustomerData.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    const newCustomer = {
      id: `cust_${Date.now()}`,
      fullName: newCustomerData.name.trim(),
      email: "",
      phone: newCustomerData.phone.trim() || "",
      address: "",
      createdAt: new Date().toISOString(),
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem(
      "swiftpos_customers",
      JSON.stringify(updatedCustomers),
    );

    setSelectedCustomer(newCustomer);
    setSelectedCustomerType("new");
    setShowNewCustomerForm(false);
    setNewCustomerData({ name: "", phone: "" });
  };

  const handleContinueToPayment = () => {
    if (selectedCustomerType === "new" && !selectedCustomer) {
      toast.error("Please create a new customer first");
      return;
    }
    setShowCustomerSelect(false);
    setShowCheckout(true);
  };

  const handleCheckout = () => {
    const transactionId = Date.now();
    const newTransaction = {
      id: transactionId,
      items: cart,
      total: totalAmount,
      date: new Date().toLocaleString(),
      paymentMethod: paymentMethod,
      paidAmount: Number(paidAmount),
      change: change,
      customerName: selectedCustomer
        ? selectedCustomer.fullName
        : "Walk-in Customer",
      customerId: selectedCustomer ? selectedCustomer.id : null,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setCurrentPage(1);

    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);

      if (cartItem) {
        const newStock = Math.max(0, product.stock - cartItem.qty);

        const getStockStatus = (stock) => {
          if (stock > 10) return "In Stock";
          if (stock > 0) return "Low Stock";
          return "Out of Stock";
        };

        return {
          ...product,
          stock: newStock,
          status: getStockStatus(newStock),
        };
      }

      return product;
    });

    setProducts(updatedProducts);

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setCart([]);
    setShowCheckout(false);
    setPaymentMethod("Cash");
    setPaidAmount("");

    toast.success("Transaction Successful 🎉");
  };

  // ─── Print Receipt ──────────────────────────────────────────────────────
  const handlePrintReceipt = () => {
    globalThis.print();
  };

  const handleCloseCustomerSelect = () => {
    setShowCustomerSelect(false);
    setSelectedCustomer(null);
    setSelectedCustomerType(null);
    setCustomerSearch("");
    setShowNewCustomerForm(false);
    setNewCustomerData({ name: "", phone: "" });
  };

  // ─── Search / Filter ────────────────────────────────────────────────────
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Transactions
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Create customer transactions
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-[#f8f8fc] px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-gray-600">POS Active</span>
        </div>
      </div>

      {/* ══════════════ Main Content Grid ══════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-6">
        {/* ─── Products Panel (Left - 2 columns) ──────────────────────── */}
        <div className="col-span-2 overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Products
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {filteredProducts.length} available
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56 rounded-2xl border border-[#ececf2] py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="max-h-130 overflow-auto pr-1 grid grid-cols-3 gap-3">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      No products found
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="group cursor-pointer rounded-2xl border border-[#ececf2] p-4 text-left transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="mb-3 h-28 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                        <Package className="h-10 w-10 text-violet-300 group-hover:scale-110 transition-transform duration-300" />
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {product.category}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-base font-bold text-violet-600">
                          Rp {product.unitPrice.toLocaleString()}
                        </p>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-200 ${
                            product.stock > 0
                              ? "bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="mt-1.5 text-xs text-yellow-600 font-medium">
                          Only {product.stock} left
                        </p>
                      )}
                      {product.stock <= 0 && (
                        <p className="mt-1.5 text-xs text-red-500 font-medium">
                          Out of stock
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Cart Panel (Right - 1 column) ──────────────────────────── */}
        <div
          className="sticky top-4 flex flex-col justify-between rounded-xl border border-[#ececf2] bg-white overflow-hidden"
          style={{ height: "calc(100vh - 220px)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 z-10" />

          {cart.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto">
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-500">
                  Cart is empty
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click a product to add it
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ─── Top Section: Header + Items ────────────────────── */}
              <div className="flex flex-col flex-1 min-h-0">
                {/* Cart Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[#ececf2]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Cart
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cart.length === 0
                          ? "Empty"
                          : `${cart.reduce((sum, item) => sum + item.qty, 0)} items`}
                      </p>
                    </div>
                  </div>

                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Scrollable items */}
                <div className="overflow-y-auto p-4 space-y-3 cart-items min-h-0">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#ececf2] p-3 transition-all hover:border-violet-200"
                    >
                      {/* Item Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-sm text-gray-900">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Rp {item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececf2] transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                          >
                            <Minus className="h-3 w-3 text-gray-500" />
                          </button>
                          <span className="flex h-7 min-w-8 items-center justify-center text-sm font-bold text-gray-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => increaseQty(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececf2] transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                          >
                            <Plus className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-violet-600">
                          Rp {(item.unitPrice * item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Bottom Section: Footer (always at bottom) ─────── */}
              <div className="border-t border-[#ececf2] p-4 flex-shrink-0 mt-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Rp{" "}
                    {cart
                      .reduce(
                        (total, item) => total + item.unitPrice * item.qty,
                        0,
                      )
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Items</span>
                  <span className="font-semibold text-gray-900">
                    {cart.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                </div>

                <div className="border-t border-[#ececf2] pt-2 flex items-center justify-between mb-4">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-violet-600">
                    Rp{" "}
                    {cart
                      .reduce(
                        (total, item) => total + item.unitPrice * item.qty,
                        0,
                      )
                      .toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════ Transaction History ════════════════════════════════ */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Transaction History
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {transactions.length > 0
                      ? `Page ${currentPage} of ${Math.ceil(transactions.length / ITEMS_PER_PAGE)} (${transactions.length} total)`
                      : "No transactions yet"}
                  </p>
                </div>
              </div>

              {transactions.length > 0 && (
                <div className="relative w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search invoice..."
                    value={invoiceSearch}
                    onChange={(e) => {
                      setInvoiceSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-2xl border border-[#ececf2] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Receipt className="h-7 w-7 text-gray-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-500">
                  No transactions yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Complete a checkout to see history here
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-[#ececf2]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f8f8fc] to-white text-left text-sm text-gray-500">
                        <th className="px-6 py-4 font-semibold">Invoice #</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Items</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Total
                        </th>
                        <th className="px-6 py-4 text-center font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter((transaction) =>
                          String(transaction.id)
                            .toLowerCase()
                            .includes(invoiceSearch.toLowerCase()),
                        )
                        .slice(
                          (currentPage - 1) * ITEMS_PER_PAGE,
                          currentPage * ITEMS_PER_PAGE,
                        )
                        .map((transaction) => (
                          <tr
                            key={transaction.id}
                            onClick={() => setSelectedTransaction(transaction)}
                            className="border-t border-[#ececf2] cursor-pointer transition-colors hover:bg-violet-50/30"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-violet-600">
                                  #{String(transaction.id).slice(-3)}
                                </div>
                                <span className="font-semibold text-violet-600">
                                  #{transaction.id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">
                                {transaction.date}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {transaction.items.slice(0, 2).map((item) => (
                                  <span
                                    key={item.id}
                                    className="inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                                  >
                                    {item.name} x{item.qty}
                                  </span>
                                ))}
                                {transaction.items.length > 2 && (
                                  <span className="inline-block rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                                    +{transaction.items.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-violet-600">
                                Rp {transaction.total.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
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
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      transactions.length,
                    )}
                    –
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      transactions.length,
                    )}{" "}
                    of {transactions.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] text-sm font-medium text-gray-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    {Array.from(
                      {
                        length: Math.ceil(transactions.length / ITEMS_PER_PAGE),
                      },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          page === currentPage
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm"
                            : "border border-[#ececf2] text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(transactions.length / ITEMS_PER_PAGE),
                          ),
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(transactions.length / ITEMS_PER_PAGE)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] text-sm font-medium text-gray-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ Customer Selection Modal ═══════════════════════════ */}
      {showCustomerSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Select Customer
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Choose a customer for this transaction
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseCustomerSelect}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!showNewCustomerForm ? (
              <>
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full rounded-2xl border border-[#ececf2] py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Customer List */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          selectedCustomer?.id === customer.id
                            ? "border-violet-400 bg-violet-50"
                            : "border-[#ececf2] hover:border-violet-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                          {getInitials(customer.fullName)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {customer.fullName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {customer.email ||
                              customer.phone ||
                              "No contact info"}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No customers found
                      </p>
                    </div>
                  )}
                </div>

                {/* Walk-in Customer Option */}
                <button
                  onClick={handleSelectWalkIn}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed transition-all mb-3 ${
                    selectedCustomerType === "walkin"
                      ? "border-violet-400 bg-violet-50"
                      : "border-gray-300 hover:border-violet-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm font-bold flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-gray-900">
                      Walk-in Customer
                    </p>
                    <p className="text-xs text-gray-400">
                      No customer linked to this transaction
                    </p>
                  </div>
                </button>

                {/* Add New Customer Button */}
                <button
                  onClick={() => setShowNewCustomerForm(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-violet-200 text-violet-600 font-medium text-sm transition-all hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" />
                  Add New Customer
                </button>
              </>
            ) : (
              <>
                {/* New Customer Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.name}
                      onChange={(e) =>
                        setNewCustomerData({
                          ...newCustomerData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter customer name"
                      className="w-full rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newCustomerData.phone}
                      onChange={(e) =>
                        setNewCustomerData({
                          ...newCustomerData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                      className="w-full rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewCustomerForm(false);
                      setNewCustomerData({ name: "", phone: "" });
                    }}
                    className="flex-1 rounded-2xl border border-[#ececf2] py-3.5 font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNewCustomer}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    Create Customer
                  </button>
                </div>
              </>
            )}

            {/* Continue Button */}
            {!showNewCustomerForm && (
              <button
                onClick={handleContinueToPayment}
                disabled={!selectedCustomerType}
                className={`w-full rounded-2xl py-3.5 font-semibold shadow-sm transition-all mt-4 ${
                  selectedCustomerType
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-md hover:-translate-y-0.5"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue to Payment
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ Checkout Confirmation Modal ════════════════════════ */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl"
              style={{ position: "relative", marginBottom: 0 }}
            />
            <div className="-mt-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Confirm Checkout
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Review your order before confirming
                  </p>
                </div>
              </div>

              {/* Customer Info Display */}
              <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] to-white p-4 mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                  {selectedCustomer ? (
                    getInitials(selectedCustomer.fullName)
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-semibold text-sm text-gray-900">
                    {selectedCustomer
                      ? selectedCustomer.fullName
                      : "Walk-in Customer"}
                  </p>
                </div>
                {selectedCustomer && (
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setShowCustomerSelect(true);
                    }}
                    className="text-xs text-violet-600 font-medium hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <p className="font-semibold text-violet-600">
                      Rp {(item.unitPrice * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                    Paid Amount
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={
                      paidAmount
                        ? Number(paidAmount).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setPaidAmount(value);
                    }}
                    className="w-full rounded-2xl border border-[#ececf2] px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="border-t border-[#ececf2] pt-4 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total Payment</p>
                  <p className="text-lg font-bold text-violet-600">
                    Rp {totalAmount.toLocaleString()}
                  </p>
                </div>
                {paidAmount && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Paid Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        Rp {Number(paidAmount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-2.5">
                      <p className="text-sm font-semibold text-green-700">
                        Change
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        Rp {change.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setPaymentMethod("Cash");
                    setPaidAmount("");
                  }}
                  className="flex-1 rounded-2xl border border-[#ececf2] py-3.5 font-medium text-gray-700 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={Number(paidAmount) < totalAmount || !paidAmount}
                  className={`flex-1 rounded-2xl py-3.5 font-semibold shadow-sm transition-all ${
                    Number(paidAmount) >= totalAmount && paidAmount
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Transaction Detail Modal ═══════════════════════════ */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    #{selectedTransaction.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-sm font-bold text-red-500 transition-all hover:shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] to-white p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Transaction Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedTransaction.date}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                <CheckCircle className="h-3 w-3" />
                Completed
              </span>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] to-white p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Customer</span>
                <span className="text-sm font-medium">
                  {selectedTransaction.customerName || "Walk-in Customer"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Items
              </p>
              {selectedTransaction.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ececf2] p-4 transition-all hover:border-violet-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Rp {item.unitPrice.toLocaleString()} x {item.qty}
                    </p>
                  </div>

                  <p className="font-bold text-violet-600">
                    Rp {(item.unitPrice * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] to-white p-4 mb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-violet-500" />
                  {selectedTransaction.paymentMethod || "Cash"}
                </p>
              </div>
              {selectedTransaction.paidAmount && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Paid Amount</p>
                    <p className="font-semibold text-gray-900">
                      Rp {selectedTransaction.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                    <p className="text-sm font-semibold text-green-700">
                      Change
                    </p>
                    <p className="font-bold text-green-600">
                      Rp {(selectedTransaction.change || 0).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              <div className="border-t border-[#ececf2] pt-2.5 flex items-center justify-between">
                <p className="text-base font-bold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-violet-600">
                  Rp {selectedTransaction.total.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={handlePrintReceipt}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
