import { Clock, CircleDollarSign, Hash, CalendarDays } from "lucide-react";

function formatElapsed(openedAt) {
  if (!openedAt) return "-";
  const start = new Date(openedAt);
  const now = new Date();
  const diffMs = now - start;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}j ${minutes}m`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export default function ShiftStatusCard({ shift }) {
  if (!shift) return null;

  const items = [
    {
      icon: Hash,
      label: "Shift Number",
      value: shift.shift_number || "-",
    },
    {
      icon: CalendarDays,
      label: "Opened At",
      value: formatDateTime(shift.opened_at),
    },
    {
      icon: CircleDollarSign,
      label: "Opening Cash",
      value: `Rp ${formatCurrency(shift.opening_cash)}`,
    },
    {
      icon: Clock,
      label: "Elapsed Time",
      value: formatElapsed(shift.opened_at),
    },
  ];

  return (
    <div className="rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div
        className="h-1 bg-gradient-to-r"
        style={{
          background:
            "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
        }}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.171-2.303 0-3.182C10.607 7.72 11.332 7.5 12 7.5c.725 0 1.45.22 2.003.659l.879.659"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Shift Aktif
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                Status:{" "}
                <span className="font-semibold text-emerald-500">OPEN</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-gray-800/60 p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/30 shrink-0">
                <item.icon className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
