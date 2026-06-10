import {
  ClipboardCheck,
  Calculator,
  ScrollText,
  Bell,
  Warehouse,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Stock Opname",
    description:
      "Conduct physical inventory counts efficiently with our guided stock opname workflow. Reduce downtime and improve accuracy with systematic counting.",
    color: "text-[#2563EB]",
    bg: "bg-[#EEF2FF]",
  },
  {
    icon: Calculator,
    title: "Average Cost Calculation",
    description:
      "Automatically calculate weighted average costs for every product. Get accurate COGS and margin insights without manual spreadsheet work.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: ScrollText,
    title: "Inventory Logs",
    description:
      "Maintain a complete audit trail of every inventory movement. Track adjustments, transfers, write-offs, and receipts with full traceability.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Bell,
    title: "Low Stock Alerts",
    description:
      "Configure reorder points and receive automated alerts when stock levels run low. Prevent stockouts and never miss a reorder opportunity.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Warehouse,
    title: "Multi Warehouse",
    description:
      "Manage inventory across multiple warehouses and locations. Transfer stock between facilities and maintain separate stock counts per location.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    badge: "Coming Soon",
  },
  {
    icon: Sparkles,
    title: "Inventory Insights",
    description:
      "Get AI-powered recommendations for inventory optimization. Identify slow-moving items, seasonal trends, and opportunities to reduce carrying costs.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    badge: "Coming Soon",
  },
];

export default function InventoryIntelligence() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            Inventory Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            Powerful Tools for
            <br />
            Inventory Control
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to maintain accurate inventory, optimize stock
            levels, and make data-driven decisions.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-[#F8FAFC] rounded-2xl p-7 border border-gray-100 hover:border-[#2563EB]/10 hover:bg-white hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {feature.badge && (
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-[#2563EB] bg-[#EEF2FF] rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
