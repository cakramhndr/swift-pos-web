/**
 * TabNavigation — Modern tab navigation for Product Detail V2.
 *
 * Props:
 *  - tabs    : Array<{ key: string, label: string, icon: LucideIcon }>
 *  - active  : string (currently active tab key)
 *  - onChange: (key: string) => void
 */
export default function TabNavigation({ tabs, active, onChange }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex border-b border-[#ececf2] dark:border-gray-700 min-w-max gap-0">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? "text-accent dark:text-accent"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }
              `}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent dark:bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}