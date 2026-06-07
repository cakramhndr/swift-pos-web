/**
 * StockOpnameProgress — Progress bar for counting session.
 *
 * Props:
 *  - checked  : number of items counted
 *  - total    : total items
 */
export default function StockOpnameProgress({ checked, total }) {
  const percentage = total > 0 ? Math.min((checked / total) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400 font-medium">
          Progress
        </span>
        <span className="text-gray-700 dark:text-gray-300 font-semibold">
          {checked} / {total}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: isComplete
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover, #6366f1))",
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          {isComplete ? "All items counted" : `${Math.round(percentage)}% completed`}
        </span>
        <span className="text-[11px] font-medium text-accent">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}