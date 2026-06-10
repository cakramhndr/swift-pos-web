import {
  PackageSearch,
  ShoppingCart,
  BrainCircuit,
  LineChart,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: PackageSearch,
    title: "Real-time Inventory",
    description:
      "Track stock levels across all locations with real-time updates. Know exactly what's available, what's low, and what needs reordering.",
    benefits: ["Live stock counts", "Multi-location sync", "Instant updates"],
  },
  {
    icon: ShoppingCart,
    title: "Smart Purchasing",
    description:
      "Automate purchase orders based on reorder points and demand forecasts. Reduce manual work and prevent stockouts before they happen.",
    benefits: [
      "Auto PO generation",
      "Supplier management",
      "Demand forecasting",
    ],
  },
  {
    icon: BrainCircuit,
    title: "Inventory Intelligence",
    description:
      "Leverage data-driven insights to optimize inventory levels, reduce carrying costs, and improve turnover rates across your business.",
    benefits: ["Cost analysis", "Trend detection", "Optimization alerts"],
  },
  {
    icon: LineChart,
    title: "Business Insights",
    description:
      "Get a complete view of your business performance with customizable dashboards, reports, and real-time analytics at your fingertips.",
    benefits: ["Custom dashboards", "Performance reports", "Real-time KPIs"],
  },
];

export default function SolutionSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            One Platform.
            <br />
            Complete Control.
          </h2>
          <p className="text-lg text-gray-600">
            SwiftPOS centralizes operations, automates workflows, and provides
            real-time visibility into every aspect of your business.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-[#F8FAFC] rounded-2xl p-7 border border-gray-100 hover:border-[#2563EB]/10 hover:bg-white hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Dashboard visualization */}
        <div className="relative bg-gradient-to-br from-[#EEF2FF] to-white rounded-3xl p-8 lg:p-12 border border-[#2563EB]/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#2563EB]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
                Everything you need to run your business
              </h3>
              <p className="text-gray-600 mb-6">
                From point-of-sale to inventory management, procurement to
                reporting — SwiftPOS brings it all together in one seamless
                experience.
              </p>
              <ul className="space-y-3">
                {[
                  "Integrated POS and inventory in real time",
                  "Automated purchasing and supplier workflows",
                  "Comprehensive reporting and analytics",
                  "Multi-warehouse and multi-location ready",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-sm font-semibold text-[#0F172A]">
                    System Overview
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">
                      Active Products
                    </span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      1,284
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Open POs</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      12
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">
                      Low Stock Items
                    </span>
                    <span className="text-sm font-semibold text-amber-600">
                      23
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">
                      Monthly Orders
                    </span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      847
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
