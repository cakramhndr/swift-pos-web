/**
 * KpiCard — Reusable KPI metric card for the Product Detail V2 page.
 *
 * Props:
 *  - title     : string
 *  - value     : string | number
 *  - subtitle  : optional string (shown below value)
 *  - icon      : Lucide icon component
 *  - color     : accent color class (e.g. "text-purple-600 bg-purple-50 dark:bg-purple-900/30")
 *  - prefix    : optional string (e.g. "Rp" for currency prefix)
 */
export default function KpiCard({ title, value, subtitle, icon: Icon, color, prefix }) {
  const [textColor, bgColor] = (color || "text-accent bg-accent-light").split(" ");

  const isRupiah = prefix === "Rp" || (typeof value === "string" && value.startsWith("Rp"));

  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:border-accent/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
            {title}
          </p>
          <p
            className={`leading-tight truncate text-gray-900 dark:text-white ${
              isRupiah ? "text-xl font-bold" : "text-2xl font-bold"
            }`}
          >
            {prefix && prefix !== "Rp" ? `${prefix} ` : ""}
            {value ?? "—"}
          </p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgColor}`}
          >
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}