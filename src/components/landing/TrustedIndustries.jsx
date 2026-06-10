import {
  Store,
  Truck,
  Warehouse,
  UtensilsCrossed,
  Factory,
  Pill,
} from "lucide-react";

const industries = [
  { name: "Retail", icon: Store, color: "text-[#2563EB]", bg: "bg-[#EEF2FF]" },
  {
    name: "Distributor",
    icon: Truck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    name: "Warehouse",
    icon: Warehouse,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    name: "F&B",
    icon: UtensilsCrossed,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    name: "Manufacturing",
    icon: Factory,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  { name: "Pharmacy", icon: Pill, color: "text-cyan-600", bg: "bg-cyan-50" },
];

export default function TrustedIndustries() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Trusted Across Industries
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.name}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100 hover:border-[#2563EB]/20 hover:shadow-lg hover:shadow-[#2563EB]/5 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${industry.bg} ${industry.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">
                  {industry.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
