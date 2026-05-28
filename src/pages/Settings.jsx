import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Store,
  Receipt,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Image,
  X,
  AlertTriangle,
  Save,
  Hash,
  ShoppingCart,
  CreditCard,
  Package,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// Reusable Components (defined outside main component)
// ═══════════════════════════════════════════════════════════════════════

// Toggle Component
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

// Simplified Card — no icon header (tab label already gives context)
const SettingsCard = ({ children }) => (
  <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
    {children}
  </div>
);

// ─── Default Values ────────────────────────────────────────────────────────
const DEFAULT_STORE_PROFILE = {
  name: "SwiftPOS",
  address: "",
  phone: "",
  logo: "",
};

const DEFAULT_RECEIPT_SETTINGS = {
  footerText: "Terima kasih telah berbelanja!",
  showLogo: true,
  showPhone: true,
  showAddress: true,
};

const DEFAULT_MIN_STOCK = 5;
const DEFAULT_LOW_STOCK_ALERT = true;

export default function Settings() {
  // ═══════════════════════════════════════════════════════════════════════
  // Tab state
  // ═══════════════════════════════════════════════════════════════════════
  const [activeTab, setActiveTab] = useState("store-profile");

  const tabs = [
    { id: "store-profile", label: "Store Profile", icon: <Store size={15} /> },
    { id: "receipt-settings", label: "Receipt", icon: <Receipt size={15} /> },
    { id: "invoice-numbering", label: "Invoice", icon: <Hash size={15} /> },
    {
      id: "pos-settings",
      label: "POS Settings",
      icon: <ShoppingCart size={15} />,
    },
    {
      id: "payment-methods",
      label: "Payment Methods",
      icon: <CreditCard size={15} />,
    },
    { id: "product-defaults", label: "Products", icon: <Package size={15} /> },
    { id: "stock-notifications", label: "Stock", icon: <Bell size={15} /> },
    { id: "data-management", label: "Data", icon: <Database size={15} /> },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // Section 1: Store Profile
  // ═══════════════════════════════════════════════════════════════════════
  const [storeProfile, setStoreProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_store_profile");
      return saved ? JSON.parse(saved) : { ...DEFAULT_STORE_PROFILE };
    } catch {
      return { ...DEFAULT_STORE_PROFILE };
    }
  });

  const [logoPreview, setLogoPreview] = useState(storeProfile.logo || "");
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setStoreProfile({ ...storeProfile, logo: base64 });
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setStoreProfile({ ...storeProfile, logo: "" });
    setLogoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveStoreProfile = () => {
    localStorage.setItem(
      "swiftpos_store_profile",
      JSON.stringify(storeProfile),
    );
    toast.success("Store profile saved successfully ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Section 2: Receipt Settings
  // ═══════════════════════════════════════════════════════════════════════
  const [receiptSettings, setReceiptSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_receipt_settings");
      return saved ? JSON.parse(saved) : { ...DEFAULT_RECEIPT_SETTINGS };
    } catch {
      return { ...DEFAULT_RECEIPT_SETTINGS };
    }
  });

  const saveReceiptSettings = () => {
    localStorage.setItem(
      "swiftpos_receipt_settings",
      JSON.stringify(receiptSettings),
    );
    toast.success("Receipt settings saved successfully ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Section 3: Stock & Notifications
  // ═══════════════════════════════════════════════════════════════════════
  const [defaultMinStock, setDefaultMinStock] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_default_min_stock");
      return saved ? JSON.parse(saved) : DEFAULT_MIN_STOCK;
    } catch {
      return DEFAULT_MIN_STOCK;
    }
  });

  const [lowStockAlert, setLowStockAlert] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_low_stock_alert");
      return saved ? JSON.parse(saved) : DEFAULT_LOW_STOCK_ALERT;
    } catch {
      return DEFAULT_LOW_STOCK_ALERT;
    }
  });

  const saveStockSettings = () => {
    localStorage.setItem(
      "swiftpos_default_min_stock",
      JSON.stringify(defaultMinStock),
    );
    localStorage.setItem(
      "swiftpos_low_stock_alert",
      JSON.stringify(lowStockAlert),
    );
    toast.success("Stock settings saved successfully ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Section 4: Invoice Numbering
  // ═══════════════════════════════════════════════════════════════════════
  const [invoiceSettings, setInvoiceSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_invoice_settings");
      return saved
        ? JSON.parse(saved)
        : { prefix: "INV", separator: "-", nextNumber: 1, padLength: 3 };
    } catch {
      return { prefix: "INV", separator: "-", nextNumber: 1, padLength: 3 };
    }
  });

  const previewInvoiceId = () => {
    const pad = Number(invoiceSettings.padLength) || 0;
    const num = Number(invoiceSettings.nextNumber) || 1;
    const padded = pad > 0 ? String(num).padStart(pad, "0") : String(num);
    return `${invoiceSettings.prefix}${invoiceSettings.separator}${padded}`;
  };

  const saveInvoiceSettings = () => {
    localStorage.setItem(
      "swiftpos_invoice_settings",
      JSON.stringify(invoiceSettings),
    );
    toast.success("Format invoice disimpan ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Section 5: Product Defaults
  // ═══════════════════════════════════════════════════════════════════════
  const [productDefaults, setProductDefaults] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_product_defaults");
      return saved
        ? JSON.parse(saved)
        : {
            defaultCategory: "",
            defaultUnit: "pcs",
            skuRequired: false,
            defaultMinStock: 5,
          };
    } catch {
      return {
        defaultCategory: "",
        defaultUnit: "pcs",
        skuRequired: false,
        defaultMinStock: 5,
      };
    }
  });

  const saveProductDefaults = () => {
    localStorage.setItem(
      "swiftpos_product_defaults",
      JSON.stringify(productDefaults),
    );
    localStorage.setItem(
      "swiftpos_default_min_stock",
      JSON.stringify(productDefaults.defaultMinStock),
    );
    toast.success("Product defaults disimpan ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Section 6: POS / Sell Settings
  // ═══════════════════════════════════════════════════════════════════════
  const [posSettings, setPosSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_pos_settings");
      return saved
        ? JSON.parse(saved)
        : {
            defaultPaymentMethod: "Cash",
            showOrderNote: false,
            requireCustomer: false,
            showStockWarning: true,
          };
    } catch {
      return {
        defaultPaymentMethod: "Cash",
        showOrderNote: false,
        requireCustomer: false,
        showStockWarning: true,
      };
    }
  });

  const savePosSettings = () => {
    localStorage.setItem("swiftpos_pos_settings", JSON.stringify(posSettings));
    toast.success("POS settings disimpan ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Section 7: Payment Methods
  // ═══════════════════════════════════════════════════════════════════════
  const DEFAULT_PAYMENT_METHODS = [
    { id: "cash", label: "Cash", enabled: true },
    { id: "transfer", label: "Transfer Bank", enabled: true },
    { id: "qris", label: "QRIS", enabled: true },
    { id: "debit", label: "Kartu Debit", enabled: false },
    { id: "kredit", label: "Kartu Kredit", enabled: false },
  ];

  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_payment_methods");
      return saved ? JSON.parse(saved) : [...DEFAULT_PAYMENT_METHODS];
    } catch {
      return [...DEFAULT_PAYMENT_METHODS];
    }
  });

  const togglePaymentMethod = (id) => {
    setPaymentMethods((prev) => {
      const targetEnabled = !prev.find((m) => m.id === id).enabled;
      // Guard: prevent disabling the last enabled method
      if (!targetEnabled) {
        const enabledCount = prev.filter((m) => m.enabled).length;
        if (enabledCount <= 1) {
          toast.error("Minimal 1 metode pembayaran harus aktif");
          return prev;
        }
      }
      return prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    });
  };

  const savePaymentMethods = () => {
    localStorage.setItem(
      "swiftpos_payment_methods",
      JSON.stringify(paymentMethods),
    );
    toast.success("Metode pembayaran disimpan ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Dark Mode Sync (sidebar toggle uses same localStorage key)
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const stored = localStorage.getItem("swiftpos-darkmode");
    const isDark = stored ? JSON.parse(stored) : false;

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // Section 5: Data Management
  // ═══════════════════════════════════════════════════════════════════════
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const importInputRef = useRef(null);

  // Export All Data
  const exportAllData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        products: JSON.parse(localStorage.getItem("products") || "[]"),
        transactions: JSON.parse(localStorage.getItem("transactions") || "[]"),
        customers: JSON.parse(
          localStorage.getItem("swiftpos_customers") || "[]",
        ),
        storeProfile:
          JSON.parse(
            localStorage.getItem("swiftpos_store_profile") || "null",
          ) || DEFAULT_STORE_PROFILE,
        receiptSettings:
          JSON.parse(
            localStorage.getItem("swiftpos_receipt_settings") || "null",
          ) || DEFAULT_RECEIPT_SETTINGS,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `swiftpos-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully 📦");
  };

  // Import Data
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Please select a JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);

        // Validate structure
        if (!data.data || !data.version) {
          toast.error("Invalid backup file format");
          return;
        }

        // Import each key
        if (data.data.products) {
          localStorage.setItem("products", JSON.stringify(data.data.products));
        }
        if (data.data.transactions) {
          localStorage.setItem(
            "transactions",
            JSON.stringify(data.data.transactions),
          );
        }
        if (data.data.customers) {
          localStorage.setItem(
            "swiftpos_customers",
            JSON.stringify(data.data.customers),
          );
        }
        if (data.data.storeProfile) {
          localStorage.setItem(
            "swiftpos_store_profile",
            JSON.stringify(data.data.storeProfile),
          );
        }
        if (data.data.receiptSettings) {
          localStorage.setItem(
            "swiftpos_receipt_settings",
            JSON.stringify(data.data.receiptSettings),
          );
        }

        toast.success("Data imported successfully 🎉");
        window.location.reload();
      } catch (error) {
        toast.error("Failed to parse import file");
        console.error(error);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = "";
    }
  };

  // Reset All Data
  const resetAllData = () => {
    const keysToRemove = [
      "products",
      "transactions",
      "swiftpos_customers",
      "inventory_logs",
      "swiftpos_store_profile",
      "swiftpos_receipt_settings",
      "swiftpos_default_min_stock",
      "swiftpos_low_stock_alert",
      "swiftpos_categories",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Reset state
    setStoreProfile({ ...DEFAULT_STORE_PROFILE });
    setLogoPreview("");
    setReceiptSettings({ ...DEFAULT_RECEIPT_SETTINGS });
    setDefaultMinStock(DEFAULT_MIN_STOCK);
    setLowStockAlert(DEFAULT_LOW_STOCK_ALERT);
    setShowResetConfirm(false);

    toast.success("All data has been reset 🗑️");
    window.location.reload();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your store configuration
        </p>
      </div>

      {/* Horizontal tab bar */}
      <div className="border-b border-[#ececf2] dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 ${
                activeTab === tab.id
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────────── */}
      <div className="max-w-2xl space-y-6">
        {/* ─── Tab: Store Profile ────────────────────────────────────── */}
        {activeTab === "store-profile" && (
          <SettingsCard>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Store Name
              </label>
              <input
                type="text"
                value={storeProfile.name}
                onChange={(e) =>
                  setStoreProfile({ ...storeProfile, name: e.target.value })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
                placeholder="SwiftPOS"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Store Address
              </label>
              <textarea
                value={storeProfile.address}
                onChange={(e) =>
                  setStoreProfile({ ...storeProfile, address: e.target.value })
                }
                rows={2}
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white resize-none"
                placeholder="Enter your store address"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Phone Number
              </label>
              <input
                type="text"
                value={storeProfile.phone}
                onChange={(e) =>
                  setStoreProfile({ ...storeProfile, phone: e.target.value })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Store Logo
              </label>
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Store Logo"
                    className="h-20 w-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 transition-colors"
                >
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload logo
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={saveStoreProfile}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: Receipt Settings ──────────────────────────────────── */}
        {activeTab === "receipt-settings" && (
          <SettingsCard>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Receipt Footer Text
              </label>
              <textarea
                value={receiptSettings.footerText}
                onChange={(e) =>
                  setReceiptSettings({
                    ...receiptSettings,
                    footerText: e.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white resize-none"
                placeholder="Terima kasih telah berbelanja!"
              />
            </div>

            <div className="space-y-4 pt-2">
              <Toggle
                checked={receiptSettings.showLogo}
                onChange={(v) =>
                  setReceiptSettings({ ...receiptSettings, showLogo: v })
                }
                label="Show Logo on Receipt"
                description="Display store logo at the top"
              />
              <Toggle
                checked={receiptSettings.showPhone}
                onChange={(v) =>
                  setReceiptSettings({ ...receiptSettings, showPhone: v })
                }
                label="Show Phone Number"
                description="Display store phone on receipt"
              />
              <Toggle
                checked={receiptSettings.showAddress}
                onChange={(v) =>
                  setReceiptSettings({ ...receiptSettings, showAddress: v })
                }
                label="Show Store Address"
                description="Display store address on receipt"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={saveReceiptSettings}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: Invoice Numbering ────────────────────────────────── */}
        {activeTab === "invoice-numbering" && (
          <SettingsCard>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Prefix
              </label>
              <input
                type="text"
                maxLength={6}
                value={invoiceSettings.prefix}
                onChange={(e) =>
                  setInvoiceSettings({
                    ...invoiceSettings,
                    prefix: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
                placeholder="INV"
              />
              <p className="text-xs text-gray-400 mt-1">
                Kode awal nomor invoice
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Separator
              </label>
              <select
                value={invoiceSettings.separator}
                onChange={(e) =>
                  setInvoiceSettings({
                    ...invoiceSettings,
                    separator: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white cursor-pointer"
              >
                <option value="-"> - (Dash)</option>
                <option value="/"> / (Slash)</option>
                <option value="">Tidak ada</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Starting Number
              </label>
              <input
                type="number"
                min="1"
                value={invoiceSettings.nextNumber}
                onChange={(e) =>
                  setInvoiceSettings({
                    ...invoiceSettings,
                    nextNumber: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Nomor urut berikutnya
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Number Padding
              </label>
              <select
                value={invoiceSettings.padLength}
                onChange={(e) =>
                  setInvoiceSettings({
                    ...invoiceSettings,
                    padLength: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white cursor-pointer"
              >
                <option value={3}>3 → 001</option>
                <option value={4}>4 → 0001</option>
                <option value={0}>0 → Tanpa padding</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-violet-600 dark:text-violet-400">
                Preview: {previewInvoiceId()}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={saveInvoiceSettings}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: POS / Sell Settings ───────────────────────────────── */}
        {activeTab === "pos-settings" && (
          <SettingsCard>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Default Payment Method
              </label>
              <select
                value={posSettings.defaultPaymentMethod}
                onChange={(e) =>
                  setPosSettings({
                    ...posSettings,
                    defaultPaymentMethod: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="Kartu Debit">Kartu Debit</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Pre-selected saat checkout dibuka
              </p>
            </div>

            <Toggle
              checked={posSettings.showOrderNote}
              onChange={(v) =>
                setPosSettings({ ...posSettings, showOrderNote: v })
              }
              label="Tampilkan field catatan di checkout"
              description="Kasir bisa tambah catatan per transaksi"
            />

            <Toggle
              checked={posSettings.requireCustomer}
              onChange={(v) =>
                setPosSettings({ ...posSettings, requireCustomer: v })
              }
              label="Wajib pilih pelanggan sebelum checkout"
              description="Checkout tidak bisa tanpa customer terpilih"
            />

            <Toggle
              checked={posSettings.showStockWarning}
              onChange={(v) =>
                setPosSettings({ ...posSettings, showStockWarning: v })
              }
              label="Tampilkan peringatan stok menipis di POS"
              description="Warning saat stok produk < min threshold"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={savePosSettings}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: Payment Methods ───────────────────────────────────── */}
        {activeTab === "payment-methods" && (
          <SettingsCard>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {method.label}
                  </p>
                  <button
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      method.enabled
                        ? "bg-violet-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        method.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={savePaymentMethods}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: Product Defaults ──────────────────────────────────── */}
        {activeTab === "product-defaults" && (
          <SettingsCard>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Default Category
              </label>
              <input
                type="text"
                value={productDefaults.defaultCategory}
                onChange={(e) =>
                  setProductDefaults({
                    ...productDefaults,
                    defaultCategory: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
                placeholder="e.g. General, Headset"
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-selected saat tambah produk baru
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Default Unit
              </label>
              <select
                value={productDefaults.defaultUnit}
                onChange={(e) =>
                  setProductDefaults({
                    ...productDefaults,
                    defaultUnit: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-3 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white cursor-pointer"
              >
                <option value="pcs">pcs</option>
                <option value="unit">unit</option>
                <option value="lusin">lusin</option>
                <option value="box">box</option>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="liter">liter</option>
                <option value="meter">meter</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Label satuan stok</p>
            </div>

            <div>
              <Toggle
                checked={productDefaults.skuRequired}
                onChange={(v) =>
                  setProductDefaults({
                    ...productDefaults,
                    skuRequired: v,
                  })
                }
                label="SKU wajib diisi"
                description="Jika off, SKU bersifat opsional"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Default Min Stock
              </label>
              <input
                type="number"
                min="1"
                value={productDefaults.defaultMinStock}
                onChange={(e) =>
                  setProductDefaults({
                    ...productDefaults,
                    defaultMinStock: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Threshold stok minimum untuk produk baru
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={saveProductDefaults}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: Stock & Notifications ─────────────────────────────── */}
        {activeTab === "stock-notifications" && (
          <SettingsCard>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                Default Min Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={defaultMinStock}
                onChange={(e) =>
                  setDefaultMinStock(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Global default when adding new products
              </p>
            </div>

            <Toggle
              checked={lowStockAlert}
              onChange={setLowStockAlert}
              label="Enable Low Stock Notifications"
              description="Get alerts when products are running low"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={saveStockSettings}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ─── Tab: Data Management ───────────────────────────────────── */}
        {activeTab === "data-management" && (
          <SettingsCard>
            <div className="space-y-4">
              {/* Export */}
              <button
                onClick={exportAllData}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Export All Data
                    </p>
                    <p className="text-xs text-gray-400">
                      Download backup as JSON file
                    </p>
                  </div>
                </div>
                <div className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* Import */}
              <button
                onClick={() => importInputRef.current?.click()}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Import Data
                    </p>
                    <p className="text-xs text-gray-400">
                      Restore from backup file
                    </p>
                  </div>
                </div>
                <div className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />

              {/* Reset */}
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-sm">
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Reset All Data
                      </p>
                      <p className="text-xs text-gray-400">
                        Clear all products, transactions, and customers
                      </p>
                    </div>
                  </div>
                  <div className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 shrink-0">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Warning: This action cannot be undone
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        This will delete all products, transactions, and
                        customers. All data will be permanently lost.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={resetAllData}
                      className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
                    >
                      Yes, Reset Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        )}
      </div>
    </div>
  );
}
