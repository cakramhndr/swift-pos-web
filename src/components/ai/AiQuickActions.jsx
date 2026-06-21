import { useState, useCallback } from "react";
import { TrendingUp, Package, Users, Box, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    id: "sales_overview",
    label: "Ringkasan Penjualan",
    description: "Bagaimana penjualan bulan ini?",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-500",
    message: "Bagaimana penjualan bulan ini?",
  },
  {
    id: "product_insights",
    label: "Insight Produk",
    description: "Produk apa yang paling laris?",
    icon: Package,
    gradient: "from-blue-500 to-indigo-500",
    message: "Produk apa yang paling laris bulan ini?",
  },
  {
    id: "customer_insights",
    label: "Insight Pelanggan",
    description: "Siapa pelanggan terbaik saya?",
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
    message: "Siapa pelanggan terbaik saya?",
  },
  {
    id: "product_condition",
    label: "Kondisi Produk",
    description: "Bagaimana kondisi produk saat ini?",
    icon: Box,
    gradient: "from-cyan-500 to-teal-500",
    message: "Bagaimana kondisi produk saya saat ini?",
  },
];

export default function AiQuickActions({ onAction, disabled }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  // Callback ref to measure content height without accessing ref during render
  const contentRef = useCallback((node) => {
    if (node) {
      setContentHeight(node.scrollHeight);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div>
      {/* Collapsible header — click to toggle */}
      <button
        onClick={toggleCollapse}
        className="flex items-center gap-1.5 w-full text-left mb-3 px-1 cursor-pointer group"
      >
        <ChevronDown
          size={14}
          className={cn(
            "text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-in-out",
            isCollapsed && "-rotate-90",
          )}
        />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
          Aksi Cepat
        </h3>
      </button>

      {/* Collapsible content with smooth max-height animation */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isCollapsed ? 0 : contentHeight || 500,
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction?.(action.message)}
              disabled={disabled}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200",
                "bg-white dark:bg-gray-800/50",
                "border border-gray-200/60 dark:border-gray-700/60",
                "hover:border-gray-300 dark:hover:border-gray-600",
                "hover:shadow-md dark:hover:shadow-gray-900/30",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br shadow-sm",
                    action.gradient,
                  )}
                >
                  <action.icon size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Hover effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
                  "bg-gradient-to-r from-transparent via-white/[0.03] to-transparent",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
