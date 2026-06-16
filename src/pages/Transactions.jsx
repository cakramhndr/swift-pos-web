import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import useTransaction from "@/hooks/useTransaction";
import useProducts from "@/hooks/useProducts";
import useCustomers from "@/hooks/useCustomers";
import { createCustomer } from "@/api/customers";
import { getProducts } from "@/api/products";
import { getTransactionById } from "@/api/transactions";
import { createSalesReturn } from "@/api/salesReturns";

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
  Download,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Undo2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { exportTransactionsPDF } from "@/lib/exportUtils";

// ─── Helpers ─────────────────────────────────────────────────────────────
function getEffectiveStock(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }
  return Number(product.stock);
}

export default function Transactions() {
  // ─── API Hooks ──────────────────────────────────────────────────────────
  const {
    transactions,
    loading: txLoading,
    error: txError,
    meta,
    refetch: refetchTransactions,
    setSearch: setTxSearch,
    setPage: setTxPage,
    createTransaction,
  } = useTransaction({ perPage: 10 });

  const {
    data: products,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useProducts({ perPage: 100 });

  const { data: customers, refetch: refetchCustomers } = useCustomers({
    perPage: 100,
  });

  // ─── State ──────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [search, setSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem("swiftpos_pos_settings") || "{}",
      );
      return s.defaultPaymentMethod || "Cash";
    } catch {
      return "Cash";
    }
  });
  const [paidAmount, setPaidAmount] = useState("");

  // ─── Variant Picker State ─────────────────────────────────────────────
  const [variantPicker, setVariantPicker] = useState(null);

  // Customer selection state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    phone: "",
  });
  const [selectedCustomerType, setSelectedCustomerType] = useState(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  // ─── Sales Return State ────────────────────────────────────────────────
  const [showCreateReturn, setShowCreateReturn] = useState(false);
  const [returnForm, setReturnForm] = useState({ items: [], notes: "" });
  const [showReturnHistory, setShowReturnHistory] = useState(false);
  const [transactionDetailLoading, setTransactionDetailLoading] =
    useState(false);
  const [transactionDetailData, setTransactionDetailData] = useState(null);
  const [returnValidationErrors, setReturnValidationErrors] = useState({});
  const [isFullyReturned, setIsFullyReturned] = useState(false);

  // ─── Helper functions ──────────────────────────────────────────────────
  const getReturnStatusBadge = (status) => {
    switch (status) {
      case "no_return":
        return {
          label: "No Return",
          className: "bg-gray-500/15 border border-gray-500/30 text-gray-300",
        };
      case "partially_returned":
        return {
          label: "Partial",
          className:
            "bg-amber-500/15 border border-amber-500/30 text-amber-300",
        };
      case "fully_returned":
        return {
          label: "Full",
          className:
            "bg-green-500/15 border border-green-500/30 text-green-300",
        };
      default:
        return {
          label: "No Return",
          className: "bg-gray-500/15 border border-gray-500/30 text-gray-300",
        };
    }
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString();
  };

  const fetchTransactionDetail = async (transactionId) => {
    setTransactionDetailLoading(true);
    try {
      const res = await getTransactionById(transactionId);
      const data = res.data?.data ?? res.data;
      setTransactionDetailData(data);
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to load transaction detail";
      toast.error(msg);
      return null;
    } finally {
      setTransactionDetailLoading(false);
    }
  };

  const handleOpenCreateReturn = async (transaction) => {
    setTransactionDetailLoading(true);
    try {
      const res = await getTransactionById(transaction.id);
      const data = res.data?.data ?? res.data;
      setTransactionDetailData(data);

      const formItems = (data.items || []).map((item) => ({
        transaction_item_id: item.id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        unit_price: item.unit_price,
        sold_qty: item.quantity,
        returned_qty: 0,
        max_returnable: item.quantity,
        return_qty: 0,
      }));

      setReturnForm({ items: formItems, notes: "" });
      setReturnValidationErrors({});
      setIsFullyReturned(false);
      setShowCreateReturn(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to load transaction detail";
      toast.error(msg);
    } finally {
      setTransactionDetailLoading(false);
    }
  };

  const handleReturnQtyChange = (index, value) => {
    const qty = Math.max(
      0,
      Math.min(Number(value) || 0, returnForm.items[index].max_returnable),
    );
    const errors = {};
    const updatedItems = returnForm.items.map((item, i) =>
      i === index ? { ...item, return_qty: qty } : item,
    );

    updatedItems.forEach((item, i) => {
      if (item.return_qty > item.max_returnable) {
        errors[i] = `Cannot exceed ${item.max_returnable}`;
      }
    });

    const allFullyReturned = updatedItems.every(
      (item) => item.return_qty >= item.max_returnable,
    );

    setReturnForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
    setReturnValidationErrors(errors);
    setIsFullyReturned(allFullyReturned);
  };

  // Computed values for live return calculation
  const returnSummary = (() => {
    if (!returnForm.items.length)
      return { itemsCount: 0, total: 0, perItem: [] };
    const perItem = returnForm.items.map((item) => ({
      name:
        item.product_name +
        (item.variant_name ? ` (${item.variant_name})` : ""),
      qty: item.return_qty,
      subtotal: (item.unit_price || 0) * item.return_qty,
    }));
    return {
      itemsCount: perItem.filter((i) => i.qty > 0).length,
      total: perItem.reduce((sum, i) => sum + i.subtotal, 0),
      perItem,
    };
  })();

  const isReturnValid = (() => {
    const hasItems = returnForm.items.some((item) => item.return_qty > 0);
    const noExceed = returnForm.items.every(
      (item) => item.return_qty <= item.max_returnable,
    );
    return hasItems && noExceed;
  })();

  const handleSubmitReturn = async () => {
    const hasItems = returnForm.items.some((item) => item.return_qty > 0);
    if (!hasItems) {
      toast.error(
        "At least one item must have a return quantity greater than 0",
      );
      return;
    }

    const invalidItem = returnForm.items.find(
      (item) => item.return_qty > item.max_returnable,
    );
    if (invalidItem) {
      toast.error(
        `Return quantity for ${invalidItem.product_name} exceeds remaining quantity`,
      );
      return;
    }

    try {
      const payload = {
        transaction_id: transactionDetailData?.id,
        notes: returnForm.notes,
        items: returnForm.items
          .filter((item) => item.return_qty > 0)
          .map((item) => ({
            transaction_item_id: item.transaction_item_id,
            quantity: item.return_qty,
          })),
      };

      await createSalesReturn(payload);

      if (transactionDetailData?.id) {
        await fetchTransactionDetail(transactionDetailData.id);
      }

      await refetchTransactions();

      toast.success("Sales return created successfully");
      setShowCreateReturn(false);
      setReturnForm({ items: [], notes: "" });
      setReturnValidationErrors({});
      setIsFullyReturned(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create sales return";
      toast.error(msg);
    }
  };

  // ─── Load data on mount ────────────────────────────────────────────────
  useEffect(() => {
    refetchTransactions();
    refetchProducts();
    refetchCustomers();
  }, [refetchTransactions, refetchProducts, refetchCustomers]);

  // ─── Cart Handlers ──────────────────────────────────────────────────────
  const addToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantPicker(product);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && !item.variantId,
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && !item.variantId
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }
      const unitPrice = Number(product.unit_price ?? product.unitPrice ?? 0);
      return [
        ...prevCart,
        {
          ...product,
          cartId: String(product.id),
          unitPrice,
          stock: Number(product.stock),
          qty: 1,
        },
      ];
    });
  };

  // ─── Add variant to cart ────────────────────────────────────────────────
  const addVariantToCart = (product, variant) => {
    const cartId = `${product.id}-${variant.id}`;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.cartId === cartId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [
        ...prevCart,
        {
          cartId: cartId,
          id: product.id,
          variantId: variant.id,
          name: product.name,
          variantName: variant.name,
          sku: variant.sku || product.sku,
          unitPrice: Number(variant.unit_price ?? variant.unitPrice ?? 0),
          unitCost: Number(
            variant.unit_cost ??
              variant.unitCost ??
              product.unit_cost ??
              product.unitCost ??
              0,
          ),
          stock: Number(variant.stock),
          qty: 1,
          image: product.image,
          category: product.category,
        },
      ];
    });
    setVariantPicker(null);
  };

  const increaseQty = (cartId) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.cartId === cartId);
      if (!item) return prevCart;
      if (item.qty >= item.stock) {
        toast.error(`Only ${item.stock} units available`);
        return prevCart;
      }
      return prevCart.map((i) =>
        i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i,
      );
    });
  };

  const decreaseQty = (cartId) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.cartId === cartId);
      if (!item) return prevCart;
      if (item.qty <= 1) {
        return prevCart.filter((item) => item.cartId !== cartId);
      }
      return prevCart.map((item) =>
        item.cartId === cartId ? { ...item, qty: item.qty - 1 } : item,
      );
    });
  };

  const removeItem = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  // ─── Cart totals ───────────────────────────────────────────────────────
  const totalAmount = cart.reduce(
    (total, item) => total + Number(item.unitPrice || 0) * item.qty,
    0,
  );
  const change = Math.max(0, Number(paidAmount) - totalAmount);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.fullName || customer.name || "")
        .toLowerCase()
        .includes(customerSearch.toLowerCase()) ||
      (customer.email || "")
        .toLowerCase()
        .includes(customerSearch.toLowerCase()),
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

  const handleCreateNewCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    setCreatingCustomer(true);
    try {
      const res = await createCustomer({
        name: newCustomerData.name.trim(),
        phone: newCustomerData.phone.trim(),
      });
      const newCust = res.data?.data ?? res.data;
      const newCustomerId = newCust.id;
      const newCustomerName =
        newCust.name ?? newCust.fullName ?? newCustomerData.name.trim();

      await refetchCustomers();

      const found = customers.find((c) => c.id === newCustomerId);
      if (found) {
        setSelectedCustomer(found);
      } else {
        setSelectedCustomer({ id: newCustomerId, name: newCustomerName });
      }
      setSelectedCustomerType("existing");
      setShowNewCustomerForm(false);
      setNewCustomerData({ name: "", phone: "" });
      toast.success(`Customer "${newCustomerName}" created ✅`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create customer";
      toast.error(msg);
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleContinueToPayment = () => {
    if (selectedCustomerType === "new" && !selectedCustomer) {
      toast.error("Please create a new customer first");
      return;
    }
    setShowCustomerSelect(false);
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    try {
      const posSettings = JSON.parse(
        localStorage.getItem("swiftpos_pos_settings") || "{}",
      );
      if (posSettings.requireCustomer && !selectedCustomer) {
        toast.error("Pilih pelanggan terlebih dahulu");
        return;
      }
    } catch {
      // Settings parsing failed, continue without customer requirement
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!paidAmount || Number(paidAmount) < totalAmount) {
      toast.error("Insufficient payment amount");
      return;
    }

    try {
      const payload = {
        customer_id: selectedCustomer?.id ?? null,
        payment_method: paymentMethod.toLowerCase(),
        paid_amount: Number(paidAmount),
        items: cart.map((item) => ({
          product_id: item.id,
          variant_id: item.variantId ?? null,
          qty: item.qty,
          price: Number(item.unitPrice),
        })),
      };

      const result = await createTransaction(payload);
      const txData = result?.data ?? result;

      setSelectedTransaction({
        id: txData?.invoice_number ?? txData?.id ?? "N/A",
        date: txData?.created_at
          ? new Date(txData.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleString(),
        customerName: selectedCustomer
          ? selectedCustomer.fullName || selectedCustomer.name
          : "Walk-in Customer",
        items: cart,
        total: totalAmount,
        paymentMethod: paymentMethod,
        paidAmount: Number(paidAmount),
        change: change,
      });

      setCart([]);
      refetchProducts();
      setShowCheckout(false);
      setPaidAmount("");
      setSelectedCustomer(null);
      setSelectedCustomerType(null);

      toast.success("Transaksi berhasil!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal membuat transaksi";
      toast.error(msg);
    }
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

  // ─── Search / Filter products ──────────────────────────────────────────
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Barcode Scanner ────────────────────────────────────────────────
  const barcodeRef = useRef(null);
  const handleBarcodeScan = async (e) => {
    if (e.key !== "Enter") return;
    const value = e.target.value.trim();
    if (!value) return;
    try {
      const res = await getProducts({ barcode: value });
      const body = res.data?.data ?? res.data;
      const products = Array.isArray(body) ? body : (body.data ?? []);
      if (products.length === 0) {
        toast.error("Barcode not found");
        e.target.value = "";
        return;
      }
      const product = products[0];
      addToCart(product);
      toast.success("Product added");
      e.target.value = "";
      e.target.focus();
    } catch {
      toast.error("Barcode not found");
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (barcodeRef.current) barcodeRef.current.focus();
  }, []);

  useEffect(() => {
    if (
      !variantPicker &&
      !showCustomerSelect &&
      !showCheckout &&
      !selectedTransaction
    ) {
      setTimeout(() => {
        if (barcodeRef.current) barcodeRef.current.focus();
      }, 100);
    }
  }, [variantPicker, showCustomerSelect, showCheckout, selectedTransaction]);

  // ─── Get display name for cart item ─────────────────────────────────────
  const getItemDisplayName = (item) => {
    return item.name;
  };

  return (
    <>
      {/* ─── Hidden Barcode Scanner Input ───────────────────────────── */}
      <input
        ref={barcodeRef}
        type="text"
        placeholder="Scan barcode..."
        onKeyDown={handleBarcodeScan}
        className="absolute -left-[9999px] opacity-0 h-0 w-0"
        aria-hidden="true"
        autoComplete="off"
      />

      <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
        {/* ══════════════ Page Header ═══════════════════════════════════════ */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Transactions
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
                  Create customer transactions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportTransactionsPDF(transactions)}
              className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 dark:hover:bg-accent/30 text-sm"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-[#f8f8fc] dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 px-4 py-2.5">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                POS Active
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════ Main Content Grid ══════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-6">
          {/* ─── Products Panel (Left - 2 columns) ──────────────────────── */}
          <div className="col-span-2 overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="relative">
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r "
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
                }}
              />

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        Products
                      </h2>
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        {productsLoading
                          ? "Loading..."
                          : `${filteredProducts.length} available`}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                      size={15}
                    />
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-56 rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="max-h-130 overflow-auto pr-1 grid grid-cols-3 gap-3">
                  {productsLoading ? (
                    <div className="col-span-3 flex items-center justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                        <Package className="h-6 w-6 text-gray-400 dark:text-gray-400" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        No products found
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const effStock = getEffectiveStock(product);
                      const hasVariants =
                        product.variants && product.variants.length > 0;
                      return (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          disabled={effStock <= 0}
                          className="group cursor-pointer rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-left transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                          <div className="mb-3 h-28 rounded-2xl bg-gradient-to-br from-violet-50 dark:from-violet-900/30 to-purple-50 dark:to-purple-900/30 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <Package className="h-10 w-10 text-accent group-hover:scale-110 transition-transform duration-300" />
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {product.category?.name || product.category || ""}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-base font-bold text-accent dark:text-accent">
                              {hasVariants
                                ? `From Rp ${Number(product.variants[0]?.unitPrice || product.variants[0]?.unit_price || 0).toLocaleString()}`
                                : `Rp ${Number(product.unitPrice || product.unit_price).toLocaleString()}`}
                            </p>
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-200 ${
                                effStock > 0
                                  ? "bg-accent-light dark:bg-accent/20 text-accent group-hover:bg-accent group-hover:text-white"
                                  : "bg-gray-100 text-gray-400 dark:text-gray-400"
                              }`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                          </div>

                          {hasVariants && (
                            <p className="mt-1 text-xs text-accent dark:text-accent font-medium">
                              {product.variants.length} variants
                            </p>
                          )}

                          {effStock <= 5 && effStock > 0 && (
                            <p className="mt-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              Only {effStock} left
                            </p>
                          )}
                          {effStock <= 0 && (
                            <p className="mt-1.5 text-xs text-red-500 font-medium">
                              Out of stock
                            </p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Cart Panel (Right - 1 column) ──────────────────────────── */}
          <div
            className="sticky top-4 flex flex-col justify-between rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r  z-10"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
              }}
            />

            {cart.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 mx-auto">
                    <ShoppingCart className="h-6 w-6 text-gray-400 dark:text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Cart is empty
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click a product to add it
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[#ececf2] dark:border-gray-700/60">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                        }}
                      >
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                          Cart
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                          {cart.length === 0
                            ? "Empty"
                            : `${cart.reduce((sum, item) => sum + item.qty, 0)} items`}
                        </p>
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto p-4 space-y-3 cart-items min-h-0">
                    {cart.map((item) => (
                      <div
                        key={item.cartId || item.id}
                        className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-3 transition-all hover:border-accent"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-sm text-gray-900 dark:text-white">
                              {getItemDisplayName(item)}
                            </p>
                            {item.variantName && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Variant: {item.variantName}
                              </p>
                            )}
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-400">
                              Rp {Number(item.unitPrice).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartId || item.id)}
                            className="shrink-0 rounded-lg p-1.5 text-gray-400 dark:text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                decreaseQty(item.cartId || item.id)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-700 transition-all hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent"
                            >
                              <Minus className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            </button>
                            <span className="flex h-7 min-w-8 items-center justify-center text-sm font-bold text-gray-900 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                increaseQty(item.cartId || item.id)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-700 transition-all hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent"
                            >
                              <Plus className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-accent">
                            Rp{" "}
                            {(
                              Number(item.unitPrice || 0) * item.qty
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#ececf2] dark:border-gray-700/60 p-4 flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Rp {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Items
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cart.reduce((sum, item) => sum + item.qty, 0)}
                    </span>
                  </div>

                  <div className="border-t border-[#ececf2] dark:border-gray-700/60 pt-2 flex items-center justify-between mb-4">
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-accent">
                      Rp {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ══════════════ Variant Picker Modal ═════════════════════════════ */}
        {variantPicker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setVariantPicker(null)}
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-800 p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="h-1 bg-gradient-to-r  rounded-t-3xl -mt-7 -mx-7 mb-6"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
                }}
              />
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200">
                    {variantPicker.image ? (
                      <img
                        src={variantPicker.image}
                        alt={variantPicker.name}
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package className="h-5.5 w-5.5 text-accent dark:text-accent" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {variantPicker.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {variantPicker.variants?.length || 0} variant
                      {variantPicker.variants?.length !== 1 ? "s" : ""}{" "}
                      available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVariantPicker(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-200 hover:scale-105"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {variantPicker.variants && variantPicker.variants.length > 0 ? (
                  variantPicker.variants.map((variant) => {
                    const stock = Number(variant.stock || 0);
                    const isOutOfStock = stock <= 0;
                    const isLowStock = stock > 0 && stock < 5;
                    return (
                      <div
                        key={variant.id}
                        onClick={() => {
                          if (isOutOfStock) return;
                          addVariantToCart(variantPicker, variant);
                        }}
                        className={`w-full flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                          isOutOfStock
                            ? "border-gray-100 dark:border-gray-700 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-[#ececf2] dark:border-gray-700 hover:border-accent hover:bg-accent-light dark:hover:bg-accent/20 cursor-pointer hover:scale-[1.01]"
                        }`}
                      >
                        <div className="text-left min-w-0 flex-1 pr-3">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {variant.name || "Unnamed Variant"}
                          </p>
                          {variant.sku && (
                            <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                              SKU: {variant.sku}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                          <p className="font-bold text-accent dark:text-accent text-sm">
                            Rp{" "}
                            {(
                              Number(variant.unit_price ?? variant.unitPrice) ||
                              0
                            ).toLocaleString()}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isOutOfStock
                                ? "bg-red-500/15 border border-red-500/30 text-red-300"
                                : isLowStock
                                  ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : isLowStock
                                ? `Only ${stock} left`
                                : `Stock: ${stock}`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-400 text-center py-8">
                    No variants available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Transaction History ════════════════════════════════ */}
        <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="relative">
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r "
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
              }}
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                    }}
                  >
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      Transaction History
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                      {txLoading
                        ? "Loading..."
                        : `Page ${meta.current_page} of ${meta.last_page} (${meta.total} total)`}
                    </p>
                  </div>
                </div>

                {transactions.length > 0 && (
                  <div className="relative w-64">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search invoice..."
                      value={invoiceSearch}
                      onChange={(e) => {
                        setInvoiceSearch(e.target.value);
                        setTxSearch(e.target.value);
                      }}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                )}
              </div>

              {txLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
                </div>
              ) : txError ? (
                <div className="rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {txError}
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                    <Receipt className="h-7 w-7 text-gray-400 dark:text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    No transactions yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete a checkout to see history here
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-sm text-gray-500 dark:text-gray-400">
                          <th className="px-6 py-4 font-semibold">Invoice #</th>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold">Items</th>
                          <th className="px-6 py-4 text-right font-semibold">
                            Total
                          </th>
                          <th className="px-6 py-4 text-center font-semibold">
                            Return
                          </th>
                          <th className="px-6 py-4 text-center font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            onClick={() => {
                              setSelectedTransaction({
                                id:
                                  transaction.invoice_number ?? transaction.id,
                                date: transaction.created_at
                                  ? new Date(
                                      transaction.created_at,
                                    ).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-",
                                customerName:
                                  transaction.customer?.name ||
                                  "Walk-in Customer",
                                items: (transaction.items || []).map(
                                  (item) => ({
                                    cartId: item.id,
                                    id: item.product_id,
                                    name: item.product_name,
                                    variantName: item.variant_name,
                                    unitPrice: item.unit_price,
                                    qty: item.quantity,
                                  }),
                                ),
                                total: transaction.total,
                                paymentMethod: transaction.payment_method,
                                paidAmount: transaction.paid,
                                change: transaction.change_amount,
                              });
                              fetchTransactionDetail(transaction.id);
                            }}
                            className="border-t border-[#ececf2] dark:border-gray-700/60 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-accent">
                                  #
                                  {String(
                                    transaction.invoice_number ||
                                      transaction.id,
                                  ).slice(-3)}
                                </div>
                                <span className="font-semibold text-accent">
                                  #
                                  {transaction.invoice_number || transaction.id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                {transaction.created_at
                                  ? new Date(
                                      transaction.created_at,
                                    ).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {(transaction.items || [])
                                  .slice(0, 2)
                                  .map((item) => (
                                    <span
                                      key={item.id}
                                      className="inline-block rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400"
                                    >
                                      {item.variant_name
                                        ? `${item.product_name} (${item.variant_name})`
                                        : item.product_name}{" "}
                                      x{item.quantity}
                                    </span>
                                  ))}
                                {transaction.items &&
                                  transaction.items.length > 2 && (
                                    <span className="inline-block rounded-lg bg-accent-light px-2.5 py-1 text-xs font-medium text-accent">
                                      +{transaction.items.length - 2} more
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-accent dark:text-accent">
                                Rp {Number(transaction.total).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {(() => {
                                const badge = getReturnStatusBadge(
                                  transaction.return_status || "no_return",
                                );
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                                  >
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300">
                                <CheckCircle className="h-3 w-3" />
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {meta.last_page > 1 && (
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-sm text-gray-400 dark:text-gray-400">
                        Showing {(meta.current_page - 1) * meta.per_page + 1}–
                        {Math.min(
                          meta.current_page * meta.per_page,
                          meta.total,
                        )}{" "}
                        of {meta.total}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTxPage(meta.current_page - 1)}
                          disabled={meta.current_page <= 1}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>

                        <span
                          className="flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold text-white shadow-sm"
                          style={{
                            background:
                              "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                          }}
                        >
                          {meta.current_page}
                        </span>

                        <button
                          onClick={() => setTxPage(meta.current_page + 1)}
                          disabled={meta.current_page >= meta.last_page}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════ Customer Selection Modal ═══════════════════════════ */}
        {showCustomerSelect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                    }}
                  >
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Select Customer
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                      Choose a customer for this transaction
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseCustomerSelect}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!showNewCustomerForm ? (
                <>
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            selectedCustomer?.id === customer.id
                              ? "border-accent bg-accent/20 dark:bg-accent/30"
                              : "border-[#ececf2] dark:border-gray-700 hover:border-accent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold flex-shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                            }}
                          >
                            {getInitials(customer.fullName || customer.name)}
                          </div>
                          <div
                            className={`flex-1 text-left min-w-0 ${
                              selectedCustomer?.id === customer.id
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="font-semibold text-sm truncate">
                              {customer.fullName || customer.name}
                            </p>
                            <p
                              className={`text-xs truncate ${
                                selectedCustomer?.id === customer.id
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              {customer.email ||
                                customer.phone ||
                                "No contact info"}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50 mx-auto mb-3">
                          <User className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No customers found
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSelectWalkIn}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed transition-all mb-3 ${
                      selectedCustomerType === "walkin"
                        ? "border-accent bg-accent/20 dark:bg-accent/30"
                        : "border-gray-300 dark:border-gray-600 hover:border-accent hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-bold flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        Walk-in Customer
                      </p>
                      <p className="text-xs text-gray-400">
                        No customer linked to this transaction
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-accent text-accent dark:text-accent font-medium text-sm transition-all hover:bg-accent-light dark:hover:bg-accent/30"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Customer
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
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
                        className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowNewCustomerForm(false);
                        setNewCustomerData({ name: "", phone: "" });
                      }}
                      className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNewCustomer}
                      disabled={creatingCustomer}
                      className="flex-1 rounded-2xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      {creatingCustomer ? "Saving..." : "Create & Select"}
                    </button>
                  </div>
                </>
              )}

              {!showNewCustomerForm && (
                <button
                  onClick={handleContinueToPayment}
                  disabled={!selectedCustomerType}
                  style={
                    selectedCustomerType
                      ? { background: "var(--color-accent)" }
                      : {}
                  }
                  className={`w-full rounded-2xl py-3.5 font-semibold shadow-sm transition-all mt-4 ${
                    selectedCustomerType
                      ? "text-white hover:shadow-md hover:-translate-y-0.5"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
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
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r  rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
                }}
              />
              <div style={{ position: "relative", marginBottom: 0 }} />
              <div className="-mt-1">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                    }}
                  >
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Confirm Checkout
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                      Review your order before confirming
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                    }}
                  >
                    {selectedCustomer ? (
                      getInitials(
                        selectedCustomer.fullName || selectedCustomer.name,
                      )
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customer
                    </p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {selectedCustomer
                        ? selectedCustomer.fullName || selectedCustomer.name
                        : "Walk-in Customer"}
                    </p>
                  </div>
                  {selectedCustomer && (
                    <button
                      onClick={() => {
                        setShowCheckout(false);
                        setShowCustomerSelect(true);
                      }}
                      className="text-xs text-accent dark:text-accent font-medium hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.cartId || item.id}
                      className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-gray-800 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {getItemDisplayName(item)}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-gray-400">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <p className="font-semibold text-accent">
                        Rp{" "}
                        {(
                          Number(item.unitPrice || 0) * item.qty
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer dark:bg-gray-700 dark:text-white"
                    >
                      {(() => {
                        const getPaymentMethods = () => {
                          try {
                            const saved = JSON.parse(
                              localStorage.getItem(
                                "swiftpos_payment_methods",
                              ) || "[]",
                            );
                            if (!saved.length) throw new Error();
                            return saved.filter((m) => m.enabled);
                          } catch {
                            return [
                              { id: "cash", label: "Cash" },
                              { id: "transfer", label: "Transfer Bank" },
                              { id: "qris", label: "QRIS" },
                            ];
                          }
                        };
                        return getPaymentMethods().map((m) => (
                          <option key={m.id} value={m.label}>
                            {m.label}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
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
                      className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="border-t border-[#ececf2] dark:border-gray-700/60 pt-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Total Payment
                    </p>
                    <p className="text-lg font-bold text-accent">
                      Rp {totalAmount.toLocaleString()}
                    </p>
                  </div>
                  {paidAmount && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Paid Amount
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          Rp {Number(paidAmount).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-2.5">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Change
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
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
                    className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCheckout}
                    disabled={Number(paidAmount) < totalAmount || !paidAmount}
                    className={`flex-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      Number(paidAmount) >= totalAmount && paidAmount
                        ? "bg-[var(--color-accent)] text-white text-center"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed text-center"
                    }`}
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Transaction Detail Modal / Receipt ═══════════════════ */}
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex items-start justify-between mb-6">
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Invoice
                    </h2>
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

              <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Transaction Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedTransaction.date}
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
                    {selectedTransaction.customerName || "Walk-in Customer"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                  Items
                </p>
                {selectedTransaction.items.map((item) => (
                  <div
                    key={item.cartId || item.id}
                    className="flex items-center justify-between rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 transition-all hover:border-accent"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getItemDisplayName(item)}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                        Rp {Number(item.unitPrice || 0).toLocaleString()} x{" "}
                        {item.qty}
                      </p>
                    </div>

                    <p className="font-bold text-accent">
                      Rp{" "}
                      {(
                        Number(item.unitPrice || 0) * item.qty
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* ═══ RETURN INFORMATION ═══ */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">
                  RETURN INFORMATION
                </p>
                <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    {(() => {
                      const returnStatus =
                        transactionDetailData?.return_status || "no_return";
                      const badge = getReturnStatusBadge(returnStatus);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Returned Amount
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rp{" "}
                      {formatCurrency(transactionDetailData?.return_total || 0)}
                    </p>
                  </div>
                  {transactionDetailData?.status === "completed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreateReturn(transactionDetailData);
                      }}
                      disabled={transactionDetailLoading}
                      className="w-full mt-1 flex items-center justify-center gap-2 rounded-2xl border border-accent py-2 text-sm font-semibold text-accent dark:text-accent transition-all hover:bg-accent-light dark:hover:bg-accent/30 disabled:opacity-50"
                    >
                      <Undo2 className="h-4 w-4" />
                      Create Return
                    </button>
                  )}
                </div>
              </div>

              {/* ═══ COLLAPSIBLE RETURN HISTORY ═══ */}
              <div className="mb-4">
                <button
                  onClick={() => setShowReturnHistory(!showReturnHistory)}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showReturnHistory ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  Return History
                </button>
                {showReturnHistory && (
                  <>
                    {transactionDetailData?.returns &&
                    transactionDetailData.returns.length > 0 ? (
                      <div className="space-y-2">
                        {transactionDetailData.returns.map((ret) => (
                          <div
                            key={ret.id}
                            className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-3 transition-all hover:border-accent"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm text-accent">
                                {ret.return_number}
                              </p>
                              <span className="text-xs text-gray-400">
                                {ret.created_at
                                  ? new Date(ret.created_at).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )
                                  : ""}
                              </span>
                            </div>
                            {ret.items && ret.items.length > 0 && (
                              <div className="space-y-0.5 mb-1">
                                {ret.items.map((ritem) => (
                                  <p
                                    key={ritem.id}
                                    className="text-sm text-gray-700 dark:text-gray-200"
                                  >
                                    {ritem.product_name}
                                    {ritem.variant_name
                                      ? ` (${ritem.variant_name})`
                                      : ""}{" "}
                                    ×{ritem.quantity}
                                  </p>
                                ))}
                              </div>
                            )}
                            <div className="pt-1.5 border-t border-[#ececf2] dark:border-gray-700/60 flex items-center justify-between">
                              <p className="text-xs text-gray-400">
                                {ret.notes || ""}
                              </p>
                              <p className="font-bold text-accent text-sm">
                                Rp {formatCurrency(ret.total_amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-400">
                        No return history available.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Payment Method
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-accent" />
                    {selectedTransaction.paymentMethod || "Cash"}
                  </p>
                </div>
                {selectedTransaction.paidAmount && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid Amount
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Rp{" "}
                        {Number(
                          selectedTransaction.paidAmount,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Change
                      </p>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        Rp {(selectedTransaction.change || 0).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                <div className="border-t border-[#ececf2] dark:border-gray-700/60 pt-2.5 flex items-center justify-between">
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-accent">
                    Rp {Number(selectedTransaction.total).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePrintReceipt}
                className="w-full rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ Create Return Modal ═══════════════════════════ */}
        {showCreateReturn && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowCreateReturn(false)}
          >
            <div
              className="w-full max-w-[700px] rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                    }}
                  >
                    <Undo2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Create Sales Return
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                      {transactionDetailData?.invoice_number
                        ? `#${transactionDetailData.invoice_number}`
                        : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateReturn(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Return Items — Refined Cards */}
              {returnForm.items.length > 0 ? (
                <div className="space-y-4 mb-5">
                  {returnForm.items.map((item, index) => (
                    <div
                      key={item.transaction_item_id}
                      className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white text-base mb-3">
                        {item.product_name}
                        {item.variant_name ? ` (${item.variant_name})` : ""}
                      </p>

                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#ececf2] dark:border-gray-700/60">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Price
                        </span>
                        <span className="font-bold text-accent">
                          Rp {formatCurrency(item.unit_price || 0)}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Sold Qty</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.sold_qty}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Returned Qty
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.returned_qty}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Remaining Qty
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.max_returnable}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Return Qty
                          </p>
                          <input
                            type="number"
                            min={0}
                            max={item.max_returnable}
                            value={item.return_qty}
                            onChange={(e) =>
                              handleReturnQtyChange(index, e.target.value)
                            }
                            className={`w-full rounded-lg border px-3 py-1.5 text-sm text-center outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white ${
                              returnValidationErrors[index]
                                ? "border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                                : "border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700"
                            }`}
                          />
                          {returnValidationErrors[index] && (
                            <p className="mt-1 text-xs text-red-500">
                              {returnValidationErrors[index]}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.return_qty > 0 && (
                        <div className="pt-3 border-t border-[#ececf2] dark:border-gray-700/60 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            Estimated Return
                          </p>
                          <p className="text-sm font-bold text-accent">
                            Rp{" "}
                            {formatCurrency(
                              (item.unit_price || 0) * item.return_qty,
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">
                  No items available for return.
                </div>
              )}

              {/* Full Return Warning */}
              {isFullyReturned && returnSummary.total > 0 && (
                <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 px-4 py-3 flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold flex-shrink-0 mt-0.5">
                    !
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This transaction will become{" "}
                    <span className="font-semibold">Fully Returned</span>.
                  </p>
                </div>
              )}

              {/* RETURN SUMMARY */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2.5">
                  RETURN SUMMARY
                </p>
                <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 space-y-2.5">
                  {returnSummary.perItem
                    .filter((i) => i.qty > 0)
                    .map((i, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <p className="text-gray-600 dark:text-gray-300">
                          {i.name} ×{i.qty}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Rp {formatCurrency(i.subtotal)}
                        </p>
                      </div>
                    ))}
                  <div className="border-t border-[#ececf2] dark:border-gray-700/60 pt-2.5 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Items Selected
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {returnSummary.itemsCount}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Total Return
                    </p>
                    <p className="text-lg font-bold text-accent">
                      Rp {formatCurrency(returnSummary.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes (Optional) */}
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  value={returnForm.notes}
                  onChange={(e) =>
                    setReturnForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Optional notes for this return..."
                  rows={2}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateReturn(false)}
                  className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReturn}
                  disabled={transactionDetailLoading || !isReturnValid}
                  className="flex-1 rounded-2xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                  }}
                >
                  {transactionDetailLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Submit Return
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
