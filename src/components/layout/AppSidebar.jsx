import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Warehouse,
  BarChart2,
  Users2,
  Settings,
} from "lucide-react";

const mainNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/transactions", icon: ShoppingCart, label: "Transactions" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/inventory", icon: Warehouse, label: "Inventory" },
];

const analyticsNav = [
  { to: "/reports", icon: BarChart2, label: "Reports" },
  { to: "/analytics", icon: Users2, label: "CRM" },
];

const systemNav = [{ to: "/settings", icon: Settings, label: "Settings" }];

function NavGroup({ items }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm transition-all ${
              isActive
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <item.icon size={16} />
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export default function AppSidebar() {
  return (
    <div className="flex flex-col h-screen w-[240px] bg-[#1a1035] text-white fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
          <ShoppingCart size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            SwiftPOS
          </p>
          <p className="text-purple-300 text-xs">Management System</p>
        </div>
      </div>

      {/* Main Nav */}
      <NavGroup items={mainNav} />

      {/* Analytics */}
      <p className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-2 mt-3">
        Analytics
      </p>
      <NavGroup items={analyticsNav} />

      {/* System */}
      <p className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-2 mt-3">
        System
      </p>
      <NavGroup items={systemNav} />

      {/* User */}
      <div className="mt-auto px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
          A
        </div>
        <span className="text-sm text-white">Admin</span>
      </div>
    </div>
  );
}
