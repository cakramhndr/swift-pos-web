import {
  LayoutDashboard,
  PackageSearch,
  GitPullRequest,
  ClipboardCheck,
  ArrowUpRight,
} from "lucide-react";

const showcases = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Get a complete overview of your business performance with real-time metrics, revenue tracking, and actionable insights.",
    gradient: "from-[#2563EB] to-[#60A5FA]",
    features: ["Revenue analytics", "Order tracking", "Inventory summary"],
  },
  {
    icon: PackageSearch,
    title: "Inventory Management",
    description:
      "Manage products, track stock levels across locations, and maintain accurate inventory records with ease.",
    gradient: "from-emerald-500 to-emerald-300",
    features: ["Product catalog", "Stock tracking", "Cost management"],
  },
  {
    icon: GitPullRequest,
    title: "Procurement Workflow",
    description:
      "Streamline purchasing from purchase order creation to goods receipt with automated approval workflows.",
    gradient: "from-amber-500 to-amber-300",
    features: ["PO automation", "Approval routing", "Receiving"],
  },
  {
    icon: ClipboardCheck,
    title: "Stock Opname",
    description:
      "Conduct efficient physical inventory counts with guided workflows, discrepancy reports, and adjustment tracking.",
    gradient: "from-violet-500 to-violet-300",
    features: ["Count sheets", "Discrepancy reports", "Adjustments"],
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            Product Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            See SwiftPOS
            <br />
            in Action
          </h2>
          <p className="text-lg text-gray-600">
            Explore the core modules that make SwiftPOS the preferred choice for
            growing businesses.
          </p>
        </div>

        {/* Showcase cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {showcases.map((item) => (
            <div
              key={item.title}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all"
            >
              {/* Card preview area */}
              <div
                className={`h-48 lg:h-56 bg-gradient-to-br ${item.gradient} p-8 flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                <div className="relative w-full max-w-sm bg-white/90 backdrop-blur rounded-xl p-5 shadow-xl transform group-hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">
                      {item.title}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {item.features.map((f) => (
                      <div
                        key={f}
                        className="h-2 bg-gray-100 rounded-full w-full"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card content */}
              <div className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#2563EB] transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
