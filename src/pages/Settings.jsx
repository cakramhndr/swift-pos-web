import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Store,
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
  Settings2,
  FileText,
  Boxes,
  ChevronRight,
  ArrowLeft,
  User,
  Lightbulb,
  Palette,
  Bell,
  Shield,
  Users as UsersIcon,
  Percent,
  Clock,
  Monitor,
  Grip,
  UserCheck,
  UserCog,
  BadgeCheck,
  Plus,
  Circle,
  KeyRound,
  Link2,
  Printer,
  Activity,
  Wifi,
} from "lucide-react";
import useDarkMode from "@/hooks/useDarkMode";

// ═══════════════════════════════════════════════════════════════════════
// Reusable Components
// ═══════════════════════════════════════════════════════════════════════

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
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
        checked ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const SettingsCard = ({ children }) => (
  <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
    {children}
  </div>
);

const ColorOption = ({ color, selected, onClick, label }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 group"
    title={label}
  >
    <div
      className={`w-8 h-8 rounded-xl transition-all duration-200 ${
        selected
          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110"
          : "group-hover:scale-110"
      }`}
      style={{ backgroundColor: color, ringColor: color }}
    />
    <span className="text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
      {label}
    </span>
  </button>
);

const ACCENT_COLORS = [
  { color: "#980ffa", label: "Purple" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#10b981", label: "Emerald" },
  { color: "#f59e0b", label: "Amber" },
  { color: "#ef4444", label: "Red" },
  { color: "#ec4899", label: "Pink" },
  { color: "#6366f1", label: "Indigo" },
  { color: "#14b8a6", label: "Teal" },
];

const CARD_RADII = [
  { value: "lg", label: "Subtle" },
  { value: "xl", label: "Rounded" },
  { value: "2xl", label: "Extra" },
  { value: "3xl", label: "Max" },
];

const FONT_SCALES = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Normal" },
  { value: "lg", label: "Large" },
];

const ROLE_CARDS = [
  {
    role: "Admin",
    icon: UserCog,
    color: "from-accent to-accent-hover",
    shadow: "shadow-accent/20",
    perms: ["Full Access", "Manage Users", "Settings", "Reports", "Delete"],
  },
  {
    role: "Manager",
    icon: UserCheck,
    color: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20",
    perms: ["Transactions", "Products", "Reports", "Inventory"],
  },
  {
    role: "Cashier",
    icon: User,
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    perms: ["Create Sales", "View Products", "Print Receipts"],
  },
];

const PERMISSION_BADGE_COLORS = {
  "Full Access":
    "bg-purple-100 text-accent dark:bg-accent/30 dark:text-accent border-purple-200 dark:border-accent",
  "Manage Users":
    "bg-violet-100 text-accent dark:bg-accent/30 dark:text-accent border-accent dark:border-violet-800",
  Settings:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  Reports:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Delete:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
  Transactions:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  Products:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  Inventory:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Create Sales":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "View Products":
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  "Print Receipts":
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
};

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

const DEFAULT_APPEARANCE = {
  accentColor: "#980ffa",
  compactMode: false,
  sidebarCollapsed: false,
  animations: true,
  cardRadius: "2xl",
  fontScale: "base",
};

const DEFAULT_NOTIFICATIONS = {
  lowStockAlerts: true,
  transactionSuccess: true,
  soundEnabled: true,
  desktopNotifications: false,
};

const DEFAULT_SECURITY = {
  adminPin: "",
  sessionTimeout: 30,
  requirePinDelete: true,
  requirePinRefund: true,
  requirePinStockAdjustment: false,
};

const DEFAULT_ROLES = [
  { id: "admin", name: "Admin", users: 1, active: true },
  { id: "manager", name: "Manager", users: 0, active: true },
  { id: "cashier", name: "Cashier", users: 2, active: true },
];

const DEFAULT_TAX = {
  taxPercentage: 11,
  serviceCharge: 0,
  includeTax: false,
  autoRounding: true,
  roundingPrecision: 0,
};

// ─── Categories ────────────────────────────────────────────────────────────
const categories = [
  {
    id: "store-profile",
    title: "Store Profile",
    description: "Manage store information, business details, and taxes",
    icon: Store,
    iconBg:
      "from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/30",
    iconColor: "text-accent dark:text-accent",
    gradient: "from-accent to-accent-hover",
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize colors, layout, and visual preferences",
    icon: Palette,
    iconBg:
      "from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "receipt-settings",
    title: "Receipt",
    description: "Customize receipt template, logo, and print preferences",
    icon: FileText,
    iconBg:
      "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "payment-methods",
    title: "Payment Methods",
    description: "Manage payment methods and configurations",
    icon: CreditCard,
    iconBg:
      "from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "product-defaults",
    title: "Products",
    description: "Product settings, categories, units, and barcode options",
    icon: Package,
    iconBg:
      "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30",
    iconColor: "text-orange-500 dark:text-orange-400",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "stock-notifications",
    title: "Stock",
    description: "Stock alerts, minimum stock, and stock adjustment",
    icon: Boxes,
    iconBg:
      "from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    id: "pos-settings",
    title: "POS Settings",
    description: "POS preferences, barcode, and transaction settings",
    icon: ShoppingCart,
    iconBg:
      "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30",
    iconColor: "text-accent dark:text-accent",
    gradient: "from-accent to-accent-hover",
  },
  {
    id: "invoice-numbering",
    title: "Invoice Numbering",
    description: "Format and prefix for transaction invoice numbers",
    icon: Hash,
    iconBg:
      "from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Alert preferences, sounds, and desktop notifications",
    icon: Bell,
    iconBg:
      "from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/30",
    iconColor: "text-rose-500 dark:text-rose-400",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "security",
    title: "Security",
    description: "PIN protection, session timeout, and access control",
    icon: Shield,
    iconBg: "from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30",
    iconColor: "text-red-500 dark:text-red-400",
    gradient: "from-red-500 to-rose-600",
  },
  {
    id: "users-roles",
    title: "Users & Roles",
    description: "Manage user roles, permissions, and staff accounts",
    icon: UsersIcon,
    iconBg:
      "from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-sky-600",
  },
  {
    id: "tax-service",
    title: "Tax & Service",
    description: "Tax rates, service charges, and rounding preferences",
    icon: Percent,
    iconBg:
      "from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with external services and APIs",
    icon: Link2,
    iconBg: "from-sky-50 to-sky-100 dark:from-sky-950/50 dark:to-sky-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "data-management",
    title: "Backup & Restore",
    description: "Backup your data and restore when needed",
    icon: Database,
    iconBg: "from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30",
    iconColor: "text-red-500 dark:text-red-400",
    gradient: "from-red-500 to-orange-600",
  },
];

// ─── Subcomponents ─────────────────────────────────────────────────────────

function ProfileSidebar() {
  return (
    <aside className="hidden xl:flex flex-col w-[240px] shrink-0">
      <div className="sticky top-6 space-y-4">
        {/* Account Information */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <User className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Account
            </p>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Store</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {(() => {
                  try {
                    const sp = JSON.parse(
                      localStorage.getItem("swiftpos_store_profile") || "{}",
                    );
                    return sp.name || "SwiftPOS";
                  } catch {
                    return "SwiftPOS";
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Edition</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Retail
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Version</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                v1.0.0
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700/50">
              <span className="text-xs text-gray-400">Plan</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-accent dark:text-accent">
                Free
              </span>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Overview
            </p>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Products</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {(() => {
                  try {
                    return JSON.parse(localStorage.getItem("products") || "[]")
                      .length;
                  } catch {
                    return 0;
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Customers</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {(() => {
                  try {
                    return JSON.parse(
                      localStorage.getItem("swiftpos_customers") || "[]",
                    ).length;
                  } catch {
                    return 0;
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Today Rev.</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Rp 0
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Low Stock</span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                0
              </span>
            </div>
          </div>
        </div>

        {/* Store Status */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Status
            </p>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Outlet Active", ok: true },
              { label: "POS Online", ok: true },
              { label: "Printer", ok: true },
              { label: "QRIS", ok: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center"
              >
                <span className="text-xs text-gray-400">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                Tips
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Klik kategori untuk mengatur konfigurasi toko. Perubahan
                disimpan otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Preview Widget */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <FileText className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Receipt Preview
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/80 rounded-xl p-3 font-mono text-[10px] leading-relaxed text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
            <div className="text-center mb-2 border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 not-mono">
                SwiftPOS
              </p>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Item</span>
                <span>Total</span>
              </div>
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between">
                <span>Product A</span>
                <span>Rp50k</span>
              </div>
              <div className="flex justify-between">
                <span>Product B</span>
                <span>Rp30k</span>
              </div>
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
              <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200">
                <span>TOTAL</span>
                <span>Rp80k</span>
              </div>
            </div>
            <div className="text-center mt-2 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 text-[8px] text-gray-400">
              Terima kasih!
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ReceiptPreview({ receiptSettings, storeProfile, previewInvoiceId }) {
  return (
    <div className="relative">
      {/* Live Preview badge */}
      <div
        className="absolute -top-2.5 right-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r text-[10px] font-semibold text-white shadow-sm"
        style={{
          background:
            "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
        }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
        Live Preview
      </div>

      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="absolute -top-2.5 right-32 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 text-[10px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
      >
        <Printer size={12} />
        Print
      </button>

      {/* Thermal Receipt Paper */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="relative bg-white dark:bg-gray-900 mx-auto max-w-[340px]">
          {/* Top edge */}
          <div className="flex justify-between px-6 pt-5 pb-2 text-gray-300 dark:text-gray-700 select-none">
            <span className="text-[8px]">·····························</span>
            <span className="text-[8px]">····················</span>
          </div>

          <div className="px-6 pb-2 font-mono text-[11px] leading-relaxed text-gray-800 dark:text-gray-200">
            <div className="text-center mb-3">
              {receiptSettings.showLogo && (
                <div className="flex justify-center mb-2">
                  {storeProfile.logo ? (
                    <img
                      src={storeProfile.logo}
                      alt="logo"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                      }}
                    >
                      <ShoppingCart size={16} className="text-white" />
                    </div>
                  )}
                </div>
              )}
              <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white not-mono">
                {storeProfile.name || "SwiftPOS"}
              </h2>
              {receiptSettings.showAddress && storeProfile.address && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 not-mono leading-relaxed mt-0.5">
                  {storeProfile.address}
                </p>
              )}
              {receiptSettings.showPhone && storeProfile.phone && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 not-mono mt-px">
                  {storeProfile.phone}
                </p>
              )}
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mb-2" />

            <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Invoice</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {previewInvoiceId?.() ?? "INV-001"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cashier</span>
                <span className="text-gray-700 dark:text-gray-300">Admin</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2" />

            <div className="flex text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-1">
              <span className="flex-[2]">Item</span>
              <span className="flex-1 text-right">Qty</span>
              <span className="flex-[1.5] text-right">Price</span>
              <span className="flex-[1.5] text-right">Total</span>
            </div>

            {[
              { name: "Nasi Goreng Spesial", qty: 2, price: 25000 },
              { name: "Es Teh Manis", qty: 3, price: 8000 },
              { name: "Ayam Bakar", qty: 1, price: 35000 },
              { name: "French Fries", qty: 2, price: 15000 },
            ].map((item, i) => (
              <div
                key={i}
                className="flex text-[11px] py-1 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex-[2] truncate pr-2 text-gray-700 dark:text-gray-300">
                  {item.name}
                </div>
                <div className="flex-1 text-right text-gray-600 dark:text-gray-400">
                  {item.qty}
                </div>
                <div className="flex-[1.5] text-right text-gray-600 dark:text-gray-400">
                  Rp{item.price.toLocaleString()}
                </div>
                <div className="flex-[1.5] text-right font-medium text-gray-800 dark:text-gray-200">
                  Rp{(item.qty * item.price).toLocaleString()}
                </div>
              </div>
            ))}

            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2" />

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Rp 130.000
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Discount</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  -Rp 5.000
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax (11%)</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Rp 13.750
                </span>
              </div>
              <div className="border-t-2 border-double border-gray-300 dark:border-gray-600 my-1.5" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-900 dark:text-white">TOTAL</span>
                <span className="text-accent dark:text-accent">Rp 138.750</span>
              </div>
              <div className="border-t-2 border-double border-gray-300 dark:border-gray-600 my-1.5" />
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Cash</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Rp 150.000
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Change</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Rp 11.250
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-3" />

            <div className="text-center">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 italic leading-relaxed">
                {receiptSettings.footerText || "Terima kasih telah berbelanja!"}
              </p>
              <p className="text-[8px] text-gray-300 dark:text-gray-600 mt-1.5 tracking-wider uppercase">
                SwiftPOS · Point of Sale
              </p>
            </div>
          </div>

          {/* Torn paper bottom */}
          <div className="relative h-4 overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 340 16"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 Q10,8 20,4 T40,8 T60,4 T80,8 T100,4 T120,8 T140,4 T160,8 T180,4 T200,8 T220,4 T240,8 T260,4 T280,8 T300,4 T320,8 T340,4 L340,16 L0,16 Z"
                fill="#f9fafb"
                className="fill-white dark:fill-gray-950"
              />
              <path
                d="M0,0 Q10,8 20,4 T40,8 T60,4 T80,8 T100,4 T120,8 T140,4 T160,8 T180,4 T200,8 T220,4 T240,8 T260,4 T280,8 T300,4 T320,8 T340,4"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  // ═══════════════════════════════════════════════════════════════════════
  // Navigation state
  // ═══════════════════════════════════════════════════════════════════════
  const [activePage, setActivePage] = useState("home");
  useDarkMode();
  const currentCat =
    categories.find((c) => c.id === activePage) ?? categories[0];
  const isReceipt = activePage === "receipt-settings";

  // ═══════════════════════════════════════════════════════════════════════
  // Store Profile
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
      setStoreProfile({ ...storeProfile, logo: ev.target.result });
      setLogoPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setStoreProfile({ ...storeProfile, logo: "" });
    setLogoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveStoreProfile = () => {
    localStorage.setItem(
      "swiftpos_store_profile",
      JSON.stringify(storeProfile),
    );
    toast.success("Store profile saved successfully ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Receipt Settings
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
  // Stock & Notifications
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
  // Invoice Numbering
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
  // Product Defaults
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
  // POS Settings
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
  // Payment Methods
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
  // Appearance
  // ═══════════════════════════════════════════════════════════════════════
  const [appearance, setAppearance] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_appearance");
      return saved ? JSON.parse(saved) : { ...DEFAULT_APPEARANCE };
    } catch {
      return { ...DEFAULT_APPEARANCE };
    }
  });

  const saveAppearance = () => {
    localStorage.setItem("swiftpos_appearance", JSON.stringify(appearance));
    toast.success("Appearance settings saved ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Notifications
  // ═══════════════════════════════════════════════════════════════════════
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_notifications");
      return saved ? JSON.parse(saved) : { ...DEFAULT_NOTIFICATIONS };
    } catch {
      return { ...DEFAULT_NOTIFICATIONS };
    }
  });

  const saveNotifications = () => {
    localStorage.setItem(
      "swiftpos_notifications",
      JSON.stringify(notifications),
    );
    toast.success("Notification settings saved ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Security
  // ═══════════════════════════════════════════════════════════════════════
  const [security, setSecurity] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_security");
      return saved ? JSON.parse(saved) : { ...DEFAULT_SECURITY };
    } catch {
      return { ...DEFAULT_SECURITY };
    }
  });

  const saveSecurity = () => {
    localStorage.setItem("swiftpos_security", JSON.stringify(security));
    toast.success("Security settings saved ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Users & Roles
  // ═══════════════════════════════════════════════════════════════════════
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_roles");
      return saved ? JSON.parse(saved) : [...DEFAULT_ROLES];
    } catch {
      return [...DEFAULT_ROLES];
    }
  });

  const toggleRole = (id) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  };

  const saveRoles = () => {
    localStorage.setItem("swiftpos_roles", JSON.stringify(roles));
    toast.success("Roles saved ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Tax & Service
  // ═══════════════════════════════════════════════════════════════════════
  const [taxSettings, setTaxSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_tax_settings");
      return saved ? JSON.parse(saved) : { ...DEFAULT_TAX };
    } catch {
      return { ...DEFAULT_TAX };
    }
  });

  const saveTaxSettings = () => {
    localStorage.setItem("swiftpos_tax_settings", JSON.stringify(taxSettings));
    toast.success("Tax settings saved ✅");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Dark Mode Sync
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const stored = localStorage.getItem("swiftpos-darkmode");
    const isDarkMode = stored ? JSON.parse(stored) : false;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // Data Management
  // ═══════════════════════════════════════════════════════════════════════
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const importInputRef = useRef(null);

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
    a.href = url;
    a.download = `swiftpos-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully 📦");
  };

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
        if (!data.data || !data.version) {
          toast.error("Invalid backup file format");
          return;
        }
        if (data.data.products)
          localStorage.setItem("products", JSON.stringify(data.data.products));
        if (data.data.transactions)
          localStorage.setItem(
            "transactions",
            JSON.stringify(data.data.transactions),
          );
        if (data.data.customers)
          localStorage.setItem(
            "swiftpos_customers",
            JSON.stringify(data.data.customers),
          );
        if (data.data.storeProfile)
          localStorage.setItem(
            "swiftpos_store_profile",
            JSON.stringify(data.data.storeProfile),
          );
        if (data.data.receiptSettings)
          localStorage.setItem(
            "swiftpos_receipt_settings",
            JSON.stringify(data.data.receiptSettings),
          );
        toast.success("Data imported successfully 🎉");
        window.location.reload();
      } catch {
        toast.error("Failed to parse import file");
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const resetAllData = () => {
    [
      "products",
      "transactions",
      "swiftpos_customers",
      "inventory_logs",
      "swiftpos_store_profile",
      "swiftpos_receipt_settings",
      "swiftpos_default_min_stock",
      "swiftpos_low_stock_alert",
      "swiftpos_categories",
    ].forEach((key) => localStorage.removeItem(key));
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

  const commonInputClass =
    "w-full rounded-xl border border-gray-200/70 dark:border-gray-700/60 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-900/80 dark:text-white bg-white";
  const selectClass =
    "w-full rounded-xl border border-gray-200/70 dark:border-gray-700/60 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-900/80 dark:text-white cursor-pointer bg-white";
  const saveBtnClass =
    "flex items-center justify-center gap-2 flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-white dark:from-gray-950 dark:to-gray-900">
      {/* ═══ HOME VIEW ════════════════════════════════════════════════ */}
      {activePage === "home" && (
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6 max-w-full">
            {/* Premium Gradient Hero */}
            <div
              className="relative overflow-hidden rounded-2xl p-7 lg:p-9"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent-dark, #4c1d95), var(--color-accent, #7c3aed))",
              }}
            >
              {/* Dark overlay to ensure text readability for any accent color */}
              <div className="absolute inset-0 bg-black/20" />
              {/* Decorative mesh */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-8 bottom-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute right-1/4 top-1/3 w-32 h-32 rounded-full bg-white/5 blur-xl" />
              </div>

              <div className="relative z-10 flex items-center gap-5">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                  <Settings2 className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    Settings
                  </h1>
                  <p className="text-sm text-neutral-200 mt-1 max-w-xl leading-relaxed">
                    Manage your SwiftPOS system configuration, store identity,
                    receipt, taxes, backup & integrations.
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    Settings Categories
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Manage all aspects of your POS system
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setActivePage(cat.id)}
                      className="group relative flex items-start gap-4 p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* Gradient border glow on hover */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-accent/5 via-transparent to-accent-hover/5 pointer-events-none" />

                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.iconBg} flex items-center justify-center shrink-0 shadow-sm border border-gray-100/50 dark:border-gray-700/30`}
                      >
                        <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent transition-colors">
                            {cat.title}
                          </p>
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar Widgets */}
          <ProfileSidebar />
        </div>
      )}

      {/* ═══ CATEGORY DETAIL VIEW ═══════════════════════════════════ */}
      {activePage !== "home" && (
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-full">
            {/* Back Button + Header */}
            <div className="mb-7">
              <button
                onClick={() => setActivePage("home")}
                className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-accent dark:hover:text-accent transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Settings
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br bg-accent-light dark:bg-accent/20 flex items-center justify-center border border-accent/50 dark:border-accent/30">
                  {(() => {
                    const Icon = currentCat.icon;
                    return (
                      <Icon className="w-5 h-5 text-accent dark:text-accent" />
                    );
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {currentCat.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {currentCat.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Two-column layout for receipt */}
            {isReceipt && (
              <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0 max-w-2xl space-y-6">
                  <SettingsCard>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Receipt Settings
                        </p>
                        <p className="text-xs text-gray-400">
                          Customize receipt content and appearance
                        </p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                          className={`${commonInputClass} resize-none`}
                          placeholder="Terima kasih telah berbelanja!"
                        />
                      </div>
                      <div className="space-y-4 border-t border-gray-100 dark:border-gray-700/60 pt-4">
                        <Toggle
                          checked={receiptSettings.showLogo}
                          onChange={(v) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              showLogo: v,
                            })
                          }
                          label="Show Logo on Receipt"
                          description="Display store logo at the top"
                        />
                        <Toggle
                          checked={receiptSettings.showPhone}
                          onChange={(v) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              showPhone: v,
                            })
                          }
                          label="Show Phone Number"
                          description="Display store phone on receipt"
                        />
                        <Toggle
                          checked={receiptSettings.showAddress}
                          onChange={(v) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              showAddress: v,
                            })
                          }
                          label="Show Store Address"
                          description="Display store address on receipt"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={saveReceiptSettings}
                        className={saveBtnClass}
                      >
                        <Save className="h-4 w-4" /> Save Changes
                      </button>
                    </div>
                  </SettingsCard>
                </div>
                <ReceiptPreview
                  receiptSettings={receiptSettings}
                  storeProfile={storeProfile}
                  previewInvoiceId={previewInvoiceId}
                />
              </div>
            )}

            {/* Single column for other pages */}
            <div className={isReceipt ? "hidden" : "max-w-2xl space-y-6"}>
              {/* ─── Store Profile ──────────────────────────────────────── */}
              {activePage === "store-profile" && (
                <SettingsCard>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeProfile.name}
                      onChange={(e) =>
                        setStoreProfile({
                          ...storeProfile,
                          name: e.target.value,
                        })
                      }
                      className={commonInputClass}
                      placeholder="SwiftPOS"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Store Address
                    </label>
                    <textarea
                      value={storeProfile.address}
                      onChange={(e) =>
                        setStoreProfile({
                          ...storeProfile,
                          address: e.target.value,
                        })
                      }
                      rows={2}
                      className={`${commonInputClass} resize-none`}
                      placeholder="Enter your store address"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={storeProfile.phone}
                      onChange={(e) =>
                        setStoreProfile({
                          ...storeProfile,
                          phone: e.target.value,
                        })
                      }
                      className={commonInputClass}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors"
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
                  <div className="flex justify-end pt-2">
                    <button onClick={saveStoreProfile} className={saveBtnClass}>
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Appearance ─────────────────────────────────────────── */}
              {activePage === "appearance" && (
                <SettingsCard>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 block">
                      Accent Color
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {ACCENT_COLORS.map((ac) => (
                        <ColorOption
                          key={ac.color}
                          color={ac.color}
                          label={ac.label}
                          selected={appearance.accentColor === ac.color}
                          onClick={() =>
                            setAppearance({
                              ...appearance,
                              accentColor: ac.color,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center shrink-0">
                        <Monitor className="w-4 h-4 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                          Card Radius
                        </label>
                        <div className="flex gap-2">
                          {CARD_RADII.map((r) => (
                            <button
                              key={r.value}
                              onClick={() =>
                                setAppearance({
                                  ...appearance,
                                  cardRadius: r.value,
                                })
                              }
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${appearance.cardRadius === r.value ? "bg-accent text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-accent/20 flex items-center justify-center shrink-0">
                        <Grip className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                          Font Scale
                        </label>
                        <div className="flex gap-2">
                          {FONT_SCALES.map((f) => (
                            <button
                              key={f.value}
                              onClick={() =>
                                setAppearance({
                                  ...appearance,
                                  fontScale: f.value,
                                })
                              }
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${appearance.fontScale === f.value ? "bg-accent text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <Toggle
                      checked={appearance.compactMode}
                      onChange={(v) =>
                        setAppearance({ ...appearance, compactMode: v })
                      }
                      label="Compact Mode"
                      description="Reduce spacing for a denser layout"
                    />
                    <Toggle
                      checked={appearance.animations}
                      onChange={(v) =>
                        setAppearance({ ...appearance, animations: v })
                      }
                      label="Enable Animations"
                      description="Smooth transitions and hover effects"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveAppearance}
                      className="flex items-center justify-center gap-2 flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] transition-all"
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Invoice Numbering ──────────────────────────────────── */}
              {activePage === "invoice-numbering" && (
                <SettingsCard>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                      className={commonInputClass}
                      placeholder="INV"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                      className={selectClass}
                    >
                      <option value="-"> - (Dash)</option>
                      <option value="/"> / (Slash)</option>
                      <option value="">Tidak ada</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Starting Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={invoiceSettings.nextNumber}
                      onChange={(e) =>
                        setInvoiceSettings({
                          ...invoiceSettings,
                          nextNumber: Math.max(
                            1,
                            parseInt(e.target.value) || 1,
                          ),
                        })
                      }
                      className={commonInputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                      className={selectClass}
                    >
                      <option value={3}>3 → 001</option>
                      <option value={4}>4 → 0001</option>
                      <option value={0}>0 → Tanpa padding</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-sm font-mono bg-gray-50 dark:bg-gray-900/80 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-accent dark:text-accent">
                      Preview: {previewInvoiceId()}
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveInvoiceSettings}
                      className={saveBtnClass}
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── POS Settings ─────────────────────────────────────── */}
              {activePage === "pos-settings" && (
                <SettingsCard>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                      className={selectClass}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Transfer Bank">Transfer Bank</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Kartu Debit">Kartu Debit</option>
                      <option value="Kartu Kredit">Kartu Kredit</option>
                    </select>
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
                    <button onClick={savePosSettings} className={saveBtnClass}>
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Payment Methods ─────────────────────────────────────── */}
              {activePage === "payment-methods" && (
                <SettingsCard>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30"
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {method.label}
                        </p>
                        <button
                          onClick={() => togglePaymentMethod(method.id)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${method.enabled ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${method.enabled ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={savePaymentMethods}
                      className={saveBtnClass}
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Product Defaults ────────────────────────────────────── */}
              {activePage === "product-defaults" && (
                <SettingsCard>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                      className={commonInputClass}
                      placeholder="e.g. General, Headset"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                      className={selectClass}
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
                  </div>
                  <Toggle
                    checked={productDefaults.skuRequired}
                    onChange={(v) =>
                      setProductDefaults({ ...productDefaults, skuRequired: v })
                    }
                    label="SKU wajib diisi"
                    description="Jika off, SKU bersifat opsional"
                  />
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Default Min Stock
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={productDefaults.defaultMinStock}
                      onChange={(e) =>
                        setProductDefaults({
                          ...productDefaults,
                          defaultMinStock: Math.max(
                            1,
                            parseInt(e.target.value) || 1,
                          ),
                        })
                      }
                      className={commonInputClass}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveProductDefaults}
                      className={saveBtnClass}
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Stock & Notifications ───────────────────────────────── */}
              {activePage === "stock-notifications" && (
                <SettingsCard>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                      Default Min Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={defaultMinStock}
                      onChange={(e) =>
                        setDefaultMinStock(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      className={commonInputClass}
                    />
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
                      className={saveBtnClass}
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Notifications ───────────────────────────────────────── */}
              {activePage === "notifications" && (
                <SettingsCard>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notification Preferences
                      </p>
                      <p className="text-xs text-gray-400">
                        Control what alerts you receive
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <Toggle
                      checked={notifications.lowStockAlerts}
                      onChange={(v) =>
                        setNotifications({
                          ...notifications,
                          lowStockAlerts: v,
                        })
                      }
                      label="Low Stock Alerts"
                      description="Notify when products reach min stock threshold"
                    />
                    <Toggle
                      checked={notifications.transactionSuccess}
                      onChange={(v) =>
                        setNotifications({
                          ...notifications,
                          transactionSuccess: v,
                        })
                      }
                      label="Transaction Notifications"
                      description="Show success toast after each sale"
                    />
                    <Toggle
                      checked={notifications.soundEnabled}
                      onChange={(v) =>
                        setNotifications({ ...notifications, soundEnabled: v })
                      }
                      label="Sound Effects"
                      description="Play sounds on successful transactions"
                    />
                    <Toggle
                      checked={notifications.desktopNotifications}
                      onChange={(v) =>
                        setNotifications({
                          ...notifications,
                          desktopNotifications: v,
                        })
                      }
                      label="Desktop Notifications"
                      description="Browser push notifications for key events"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveNotifications}
                      className={saveBtnClass}
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Tax & Service ───────────────────────────────────────── */}
              {activePage === "tax-service" && (
                <SettingsCard>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 flex items-center justify-center">
                      <Percent className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Tax & Service Charges
                      </p>
                      <p className="text-xs text-gray-400">
                        Configure tax rates and additional fees
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Tax (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxSettings.taxPercentage}
                          onChange={(e) =>
                            setTaxSettings({
                              ...taxSettings,
                              taxPercentage: Math.max(
                                0,
                                Math.min(100, parseFloat(e.target.value) || 0),
                              ),
                            })
                          }
                          className={`${commonInputClass} pr-8`}
                          placeholder="11"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Service Charge (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxSettings.serviceCharge}
                          onChange={(e) =>
                            setTaxSettings({
                              ...taxSettings,
                              serviceCharge: Math.max(
                                0,
                                Math.min(100, parseFloat(e.target.value) || 0),
                              ),
                            })
                          }
                          className={`${commonInputClass} pr-8`}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4 space-y-4">
                    <Toggle
                      checked={taxSettings.includeTax}
                      onChange={(v) =>
                        setTaxSettings({ ...taxSettings, includeTax: v })
                      }
                      label="Include Tax in Prices"
                      description="Tax included in product prices (tax inclusive)"
                    />
                    <Toggle
                      checked={taxSettings.autoRounding}
                      onChange={(v) =>
                        setTaxSettings({ ...taxSettings, autoRounding: v })
                      }
                      label="Auto Rounding"
                      description="Round final totals to nearest whole number"
                    />
                  </div>
                  {taxSettings.autoRounding && (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Rounding Precision
                      </label>
                      <select
                        value={taxSettings.roundingPrecision}
                        onChange={(e) =>
                          setTaxSettings({
                            ...taxSettings,
                            roundingPrecision: Number(e.target.value),
                          })
                        }
                        className={selectClass}
                      >
                        <option value={0}>Nearest whole number</option>
                        <option value={100}>Nearest hundred</option>
                        <option value={500}>Nearest 500</option>
                      </select>
                    </div>
                  )}
                  <div className="rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-800/30 border border-gray-100 dark:border-gray-700/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Tax Preview
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Subtotal
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          Rp 100.000
                        </span>
                      </div>
                      {taxSettings.taxPercentage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Tax ({taxSettings.taxPercentage}%)
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            Rp{" "}
                            {Math.round(
                              (100000 * taxSettings.taxPercentage) / 100,
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {taxSettings.serviceCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Service ({taxSettings.serviceCharge}%)
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            Rp{" "}
                            {Math.round(
                              (100000 * taxSettings.serviceCharge) / 100,
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-1.5 flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="font-bold text-accent">
                          Rp{" "}
                          {Math.round(
                            100000 +
                              (taxSettings.includeTax
                                ? 0
                                : (100000 * taxSettings.taxPercentage) / 100) +
                              (100000 * taxSettings.serviceCharge) / 100,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={saveTaxSettings} className={saveBtnClass}>
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Security ───────────────────────────────────────────── */}
              {activePage === "security" && (
                <SettingsCard>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Security Settings
                      </p>
                      <p className="text-xs text-gray-400">
                        Protect sensitive operations
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4 space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Admin PIN
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          maxLength={6}
                          value={security.adminPin}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              adminPin: e.target.value
                                .replace(/[^0-9]/g, "")
                                .slice(0, 6),
                            })
                          }
                          className={`${commonInputClass} pl-10`}
                          placeholder="Enter 4-6 digit PIN"
                        />
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        Session Timeout (minutes)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={security.sessionTimeout}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              sessionTimeout: Math.max(
                                1,
                                parseInt(e.target.value) || 30,
                              ),
                            })
                          }
                          className={`${commonInputClass} pl-10`}
                        />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <Toggle
                      checked={security.requirePinDelete}
                      onChange={(v) =>
                        setSecurity({ ...security, requirePinDelete: v })
                      }
                      label="Require PIN to Delete"
                      description="Ask for PIN before deleting products or transactions"
                    />
                    <Toggle
                      checked={security.requirePinRefund}
                      onChange={(v) =>
                        setSecurity({ ...security, requirePinRefund: v })
                      }
                      label="Require PIN for Refunds"
                      description="Ask for PIN before processing refunds"
                    />
                    <Toggle
                      checked={security.requirePinStockAdjustment}
                      onChange={(v) =>
                        setSecurity({
                          ...security,
                          requirePinStockAdjustment: v,
                        })
                      }
                      label="Require PIN for Stock Adjustment"
                      description="Ask for PIN when manually adjusting inventory"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={saveSecurity} className={saveBtnClass}>
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Users & Roles ───────────────────────────────────────── */}
              {activePage === "users-roles" && (
                <SettingsCard>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        User Roles & Permissions
                      </p>
                      <p className="text-xs text-gray-400">
                        Manage staff roles and access levels
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    {ROLE_CARDS.map((roleData) => {
                      const role = roles.find(
                        (r) => r.id === roleData.role.toLowerCase(),
                      );
                      const Icon = roleData.icon;
                      return (
                        <div
                          key={roleData.role}
                          className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-900/50 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleData.color} ${roleData.shadow} flex items-center justify-center`}
                                >
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                      {roleData.role}
                                    </p>
                                    {role?.active && (
                                      <BadgeCheck className="w-3.5 h-3.5 text-accent" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {role?.users || 0} user
                                    {(role?.users || 0) !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (
                                    roleData.role === "Admin" &&
                                    role?.active
                                  ) {
                                    toast.error("Cannot disable Admin role");
                                    return;
                                  }
                                  toggleRole(roleData.role.toLowerCase());
                                }}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${role?.active ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"}`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${role?.active ? "translate-x-5" : "translate-x-0"}`}
                                />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {roleData.perms.map((perm) => (
                                <span
                                  key={perm}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${PERMISSION_BADGE_COLORS[perm] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"}`}
                                >
                                  <Circle className="w-1.5 h-1.5 fill-current" />
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-accent dark:hover:border-accent hover:text-accent dark:hover:text-accent transition-all duration-200 group">
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />{" "}
                      Add New User
                    </button>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={saveRoles} className={saveBtnClass}>
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </SettingsCard>
              )}

              {/* ─── Integrations ────────────────────────────────────────── */}
              {activePage === "integrations" && (
                <SettingsCard>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Integrations
                      </p>
                      <p className="text-xs text-gray-400">
                        Connect SwiftPOS with external services
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4 space-y-3">
                    {[
                      "API Access",
                      "WhatsApp Notifications",
                      "Email Reports",
                    ].map((title) => (
                      <div
                        key={title}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {title}
                            </p>
                            <p className="text-xs text-gray-400">
                              Connect and configure
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                          Coming soon
                        </span>
                      </div>
                    ))}
                  </div>
                </SettingsCard>
              )}

              {/* ─── Data Management ─────────────────────────────────────── */}
              {activePage === "data-management" && (
                <SettingsCard>
                  <div className="space-y-4">
                    <button
                      onClick={exportAllData}
                      className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
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
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => importInputRef.current?.click()}
                      className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
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
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
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
                        <ChevronRight className="w-4 h-4 text-gray-400" />
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

          {/* Right Sidebar */}
          <ProfileSidebar />
        </div>
      )}
    </div>
  );
}
