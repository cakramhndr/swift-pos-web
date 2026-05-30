import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addStockMovement } from "@/lib/inventoryLogUtils";

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ─── Variant Picker State ─────────────────────────────────────────────
  const [variantPicker, setVariantPicker] = useState(null);

  // Customer selection state
  const [customers, setCustomers] = useState(() => {
    const savedCustomers = localStorage.getItem("swiftpos_customers");
    return savedCustomers ? JSON.parse(savedCustomers) : [];
  });
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    phone: "",
  });
  const [selectedCustomerType, setSelectedCustomerType] = useState(null);

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
    // If product has variants, open variant picker
    if (product.variants && product.variants.length > 0) {
      setVariantPicker(product);
      return;
    }

    // No variants - add directly
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
      return [...prevCart, { ...product, qty: 1 }];
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
          unitPrice: Number(variant.unitPrice),
          unitCost: Number(variant.unitCost || product.unitCost),
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
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
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

  const getInvoiceId = () => {
    try {
      const s = JSON.parse(
        localStorage.getItem("swiftpos_invoice_settings") || "{}",
      );
      const prefix = s.prefix || "INV";
      const sep = s.separator ?? "-";
      const pad = Number(s.padLength) || 3;
      const num = Number(s.nextNumber) || 1;
      const padded = pad > 0 ? String(num).padStart(pad, "0") : String(num);
      return `${prefix}${sep}${padded}`;
    } catch {
      return `INV-${Date.now()}`;
    }
  };

  const handleCheckout = () => {
    // Check if customer is required
    try {
      const posSettings = JSON.parse(
        localStorage.getItem("swiftpos_pos_settings") || "{}",
      );
      if (posSettings.requireCustomer && !selectedCustomer) {
        toast.error("Pilih pelanggan terlebih dahulu");
        return;
      }
    } catch {}

    const transactionId = getInvoiceId();
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

    // Deduct stock for each cart item
    const updatedProducts = products.map((product) => {
      const cartItemsForProduct = cart.filter((item) => item.id === product.id);
      if (cartItemsForProduct.length === 0) return product;

      let updatedProduct = { ...product };

      if (product.variants && product.variants.length > 0) {
        // Deduct variant stock
        let updatedVariants = [...product.variants];
        cartItemsForProduct.forEach((cartItem) => {
          const stockBefore = Number(
            updatedVariants.find((v) => v.id === cartItem.variantId)?.stock ||
              0,
          );
          updatedVariants = updatedVariants.map((v) => {
            if (v.id === cartItem.variantId) {
              const newVariantStock = Math.max(
                0,
                Number(v.stock || 0) - cartItem.qty,
              );
              // Log variant stock movement
              addStockMovement({
                productId: product.id,
                productName: product.name,
                variantId: cartItem.variantId || null,
                variantName: cartItem.variantName || null,
                type: "sale",
                qty: -cartItem.qty,
                stockBefore,
                stockAfter: newVariantStock,
                refId: String(transactionId),
                note: "Penjualan via POS",
              });
              return { ...v, stock: newVariantStock };
            }
            return v;
          });
        });
        updatedProduct.variants = updatedVariants;
        updatedProduct.stock = updatedVariants.reduce(
          (sum, v) => sum + Number(v.stock || 0),
          0,
        );
      } else {
        // Deduct single stock
        const qty = cartItemsForProduct.reduce(
          (sum, item) => sum + item.qty,
          0,
        );
        const stockBefore = Number(product.stock);
        const newStock = Math.max(0, stockBefore - qty);
        updatedProduct.stock = newStock;

        // Log single product stock movement
        cartItemsForProduct.forEach((cartItem) => {
          addStockMovement({
            productId: product.id,
            productName: product.name,
            variantId: null,
            variantName: null,
            type: "sale",
            qty: -cartItem.qty,
            stockBefore,
            stockAfter: newStock,
            refId: String(transactionId),
            note: "Penjualan via POS",
          });
        });
      }

      // Update status
      const effStock = updatedProduct.variants
        ? updatedProduct.variants.reduce(
            (sum, v) => sum + Number(v.stock || 0),
            0,
          )
        : Number(updatedProduct.stock);
      updatedProduct.status =
        effStock === 0
          ? "Out of Stock"
          : effStock <= (product.minStock || 5)
            ? "Low Stock"
            : "In Stock";

      return updatedProduct;
    });

    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setCart([]);
    setShowCheckout(false);
    setPaymentMethod("Cash");
    setPaidAmount("");

    // Increment next invoice number
    try {
      const s = JSON.parse(
        localStorage.getItem("swiftpos_invoice_settings") || "{}",
      );
      s.nextNumber = (Number(s.nextNumber) || 1) + 1;
      localStorage.setItem("swiftpos_invoice_settings", JSON.stringify(s));
    } catch {}

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

  // ─── Get display name for cart item (product name only, variant shown separately) ─────────────────
  const getItemDisplayName = (item) => {
    return item.name;
  };

  return (
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
                      {filteredProducts.length} available
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
                {filteredProducts.length === 0 ? (
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
                          {product.category}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-base font-bold text-accent dark:text-accent">
                            {hasVariants
                              ? `From Rp ${Number(product.variants[0]?.unitPrice || 0).toLocaleString()}`
                              : `Rp ${Number(product.unitPrice).toLocaleString()}`}
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
              {/* ─── Top Section: Header + Items ────────────────────── */}
              <div className="flex flex-col flex-1 min-h-0">
                {/* Cart Header */}
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

                {/* Scrollable items */}
                <div className="overflow-y-auto p-4 space-y-3 cart-items min-h-0">
                  {cart.map((item) => (
                    <div
                      key={item.cartId || item.id}
                      className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-3 transition-all hover:border-accent"
                    >
                      {/* Item Header */}
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

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decreaseQty(item.cartId || item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-700 transition-all hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent"
                          >
                            <Minus className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          </button>
                          <span className="flex h-7 min-w-8 items-center justify-center text-sm font-bold text-gray-900 dark:text-white">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => increaseQty(item.cartId || item.id)}
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

              {/* ─── Bottom Section: Footer ─────────────────────── */}
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
                    {variantPicker.variants?.length !== 1 ? "s" : ""} available
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
                          Rp {(Number(variant.unitPrice) || 0).toLocaleString()}
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
                    {transactions.length > 0
                      ? `Page ${currentPage} of ${Math.ceil(transactions.length / ITEMS_PER_PAGE)} (${transactions.length} total)`
                      : "No transactions yet"}
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
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            {transactions.length === 0 ? (
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
                            className="border-t border-[#ececf2] dark:border-gray-700/60 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-accent">
                                  #{String(transaction.id).slice(-3)}
                                </div>
                                <span className="font-semibold text-accent">
                                  #{transaction.id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                {transaction.date}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {transaction.items.slice(0, 2).map((item) => (
                                  <span
                                    key={item.cartId || item.id}
                                    className="inline-block rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400"
                                  >
                                    {item.variantName
                                      ? `${item.name} (${item.variantName})`
                                      : item.name}{" "}
                                    x{item.qty}
                                  </span>
                                ))}
                                {transaction.items.length > 2 && (
                                  <span className="inline-block rounded-lg bg-accent-light px-2.5 py-1 text-xs font-medium text-accent">
                                    +{transaction.items.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-accent dark:text-accent">
                                Rp {transaction.total.toLocaleString()}
                              </span>
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

                {/* Pagination */}
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm text-gray-400 dark:text-gray-400">
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
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
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
                            ? "bg-gradient-to-r from-accent to-accent-hover text-white dark:text-white shadow-lg shadow-accent/20"
                            : "border border-[#ececf2] dark:border-gray-700 text-gray-600 hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent"
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
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
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
                {/* Search Input */}
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

                {/* Customer List */}
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
                          {getInitials(customer.fullName)}
                        </div>
                        <div
                          className={`flex-1 text-left min-w-0 ${
                            selectedCustomer?.id === customer.id
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="font-semibold text-sm truncate">
                            {customer.fullName}
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

                {/* Walk-in Customer Option */}
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

                {/* Add New Customer Button */}
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
                {/* New Customer Form */}
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
                    className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNewCustomer}
                    className="flex-1 rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                    }}
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
              style={{ position: "relative", marginBottom: 0 }}
            />
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

              {/* Customer Info Display */}
              <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                  }}
                >
                  {selectedCustomer ? (
                    getInitials(selectedCustomer.fullName)
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
                            localStorage.getItem("swiftpos_payment_methods") ||
                              "[]",
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
                    {(Number(item.unitPrice || 0) * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
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
                      Rp {selectedTransaction.paidAmount.toLocaleString()}
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
                  Rp {selectedTransaction.total.toLocaleString()}
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
    </div>
  );
}
