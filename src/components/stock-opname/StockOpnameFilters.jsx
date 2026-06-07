import { Search, Calendar, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * StockOpnameFilters — Filter bar for stock opname list.
 *
 * Props:
 *  - searchQuery : string
 *  - onSearchChange : (val: string) => void
 *  - statusFilter : string
 *  - onStatusChange : (val: string) => void
 *  - dateFrom : string
 *  - dateTo : string
 *  - onDateFromChange : (val: string) => void
 *  - onDateToChange : (val: string) => void
 *  - onClear : () => void
 *  - onRefresh : () => void
 *  - loading : boolean
 */
export default function StockOpnameFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  onRefresh,
  loading,
}) {
  const handleFilterChange = (setter) => (val) => {
    setter(val);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-center gap-1 rounded-xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stock opname..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(onSearchChange)(e.target.value)}
            className="w-[200px] rounded-xl border border-[#ececf2] dark:border-gray-600 pl-9 pr-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(onStatusChange)(e.target.value)}
          className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFilterChange(onDateFromChange)(e.target.value)}
            className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
          />
          <span className="text-gray-400 text-sm">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleFilterChange(onDateToChange)(e.target.value)}
            className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={onClear}
          className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3.5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          Clear
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-xl border border-[#ececf2] dark:border-gray-600 px-3.5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}