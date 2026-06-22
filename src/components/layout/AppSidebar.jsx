import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Warehouse,
  Grid3X3,
  ClipboardList,
  ClipboardCheck,
  Building2,
  BarChart2,
  Users2,
  Settings,
  Activity,
  Bot,
  Moon,
  Sun,
  ChevronDown,
  Store,
  LogOut,
  CircleDollarSign,
} from "lucide-react";
import useDarkMode from "@/hooks/useDarkMode";
import { cn } from "@/lib/utils";
import useStoreProfile from "@/hooks/useStoreProfile";
import { useAuth } from "@/context/AuthContext";

const mainNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/categories", icon: Grid3X3, label: "Categories" },
  { to: "/transactions", icon: ShoppingCart, label: "Transactions" },
  {
    to: "/cash-register",
    icon: CircleDollarSign,
    label: "Cash Register",
    permission: "manage shifts",
  },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/inventory", icon: Warehouse, label: "Inventory" },
  { to: "/inventory-logs", icon: ClipboardList, label: "Inventory Logs" },
  { to: "/stock-opnames", icon: ClipboardCheck, label: "Stock Opname" },
  { to: "/suppliers", icon: Building2, label: "Suppliers" },
  { to: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders" },
];

const analyticsNav = [
  { to: "/reports", icon: BarChart2, label: "Reports" },
  { to: "/analytics", icon: Users2, label: "CRM" },
];

const systemNav = [
  { to: "/ai-assistant", icon: Bot, label: "AI Assistant" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/activity-logs", icon: Activity, label: "Activity Logs" },
];

function NavGroup({ items, label }) {
  return (
    <div className="px-3">
      {label && (
        <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) =>
          item.hidden ? null : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-gray-200",
                )
              }
            >
              <item.icon
                size={18}
                className="shrink-0 transition-colors duration-200 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 aria-[current=page]:text-white"
              />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ),
        )}
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const { isDark, toggleDark } = useDarkMode();
  const { storeProfile, error } = useStoreProfile();
  const { user, logout } = useAuth();
  const [outletOpen, setOutletOpen] = useState(false);

  // Build nav items with permission-based visibility
  const userPermissions = user?.permissions || [];
  const visibleMainNav = mainNav.map((item) => ({
    ...item,
    hidden: item.permission
      ? !userPermissions.includes(item.permission)
      : false,
  }));

  const storeName = storeProfile?.name || "SwiftPOS";
  const storeLogoUrl = storeProfile?.logo_url || null;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen w-[260px] fixed left-0 top-0 z-40",
        "bg-white dark:bg-gray-950",
        "border-r border-gray-200/70 dark:border-gray-800/80",
        "shadow-sm dark:shadow-none",
      )}
    >
      {/* Scrollable content area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Brand Section */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent shadow-md shadow-accent/20 shrink-0 overflow-hidden">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingCart size={20} className="text-white" />
              )}
              <div className="absolute inset-0 rounded-xl bg-white/[0.08]" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
                {storeName}
              </h1>
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 leading-tight mt-px">
                {error ? "Management System" : "Management System"}
              </p>
            </div>
          </div>
        </div>

        {/* Outlet Switcher Card */}
        <div className="px-5 pb-4">
          <button
            onClick={() => setOutletOpen(!outletOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200",
              "bg-gray-50 dark:bg-white/[0.04]",
              "border border-gray-200/60 dark:border-gray-800/60",
              "hover:bg-gray-100 dark:hover:bg-white/[0.07]",
              "hover:border-gray-300 dark:hover:border-gray-700/80",
              "group",
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 shrink-0">
              <Store size={16} className="text-accent dark:text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                Main Store
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                Online · Active
              </p>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200",
                "group-hover:text-gray-600 dark:group-hover:text-gray-400",
                outletOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 space-y-5 py-2">
          <NavGroup label="Main Menu" items={visibleMainNav} />
          <NavGroup label="Analytics" items={analyticsNav} />
          <NavGroup label="System" items={systemNav} />
        </div>
      </div>

      {/* Bottom Controls - Fixed at bottom */}
      <div className="shrink-0 border-t border-gray-200/70 dark:border-gray-800/80 bg-white dark:bg-gray-950">
        {/* Dark Mode Toggle */}
        <div className="px-4 py-2.5">
          <button
            onClick={toggleDark}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200",
              "bg-gray-50 dark:bg-white/[0.04]",
              "border border-gray-200/60 dark:border-gray-800/60",
              "hover:bg-gray-100 dark:hover:bg-white/[0.07]",
              "hover:border-gray-300 dark:hover:border-gray-700/80",
              "group",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0",
                isDark
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "bg-amber-50 text-amber-500 border border-amber-200/60",
              )}
            >
              {isDark ? <Moon size={15} /> : <Sun size={15} />}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <div
              className={cn(
                "relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0",
                isDark ? "bg-accent/30" : "bg-gray-300",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                  isDark ? "left-[18px]" : "left-[2px]",
                )}
              />
            </div>
          </button>
        </div>

        {/* User Profile Section */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/40 dark:border-gray-800/40">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={logout}
              className="shrink-0 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-all"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
