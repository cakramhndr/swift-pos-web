import {
  ClipboardList,
  FileEdit,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { formatRp } from "@/lib/purchaseUtils";

/**
 * StockOpnameStats — KPI summary cards for Stock Opname list page.
 *
 * Props:
 *  - stats: { total, draft, inProgress, completed, cancelled, adjustmentValue }
 */
export default function StockOpnameStats({ stats }) {
  const cards = [
    {
      label: "Total Sessions",
      value: stats.total ?? 0,
      icon: ClipboardList,
      bgColor: "bg-accent-light dark:bg-accent/20",
      textColor: "text-accent",
    },
    {
      label: "Draft",
      value: stats.draft ?? 0,
      icon: FileEdit,
      bgColor: "bg-gray-100 dark:bg-gray-700",
      textColor: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "In Progress",
      value: stats.inProgress ?? 0,
      icon: Loader2,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: stats.completed ?? 0,
      icon: CheckCircle2,
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Cancelled",
      value: stats.cancelled ?? 0,
      icon: XCircle,
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Adjustment Value",
      value: formatRp(stats.adjustmentValue ?? 0),
      icon: TrendingUp,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {card.value}
              </p>
            </div>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${card.bgColor}`}
            >
              <card.icon className={`h-5 w-5 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}