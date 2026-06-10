import { CheckCircle2 } from "lucide-react";

const benefits = [
  {
    title: "Increase inventory accuracy",
    description:
      "Achieve up to 99% inventory accuracy with real-time tracking and systematic stock opname workflows.",
    stat: "99%",
    statLabel: "Accuracy",
  },
  {
    title: "Reduce manual stock tracking",
    description:
      "Eliminate spreadsheets and manual data entry. Automate stock updates across all locations and sales channels.",
    stat: "80%",
    statLabel: "Less Manual Work",
  },
  {
    title: "Improve purchasing efficiency",
    description:
      "Automate purchase orders based on reorder points. Reduce procurement cycle time and prevent stockouts.",
    stat: "60%",
    statLabel: "Faster PO Processing",
  },
  {
    title: "Prevent stock shortages",
    description:
      "Get real-time low stock alerts and demand forecasts. Never miss a reorder opportunity again.",
    stat: "100%",
    statLabel: "Stockout Prevention",
  },
  {
    title: "Gain visibility into business performance",
    description:
      "Access real-time dashboards and reports. Make data-driven decisions with complete business insights.",
    stat: "24/7",
    statLabel: "Real-time Visibility",
  },
  {
    title: "Scale operations with confidence",
    description:
      "Grow from single store to multi-warehouse operations without switching platforms. Built to scale with your business.",
    stat: "∞",
    statLabel: "Unlimited Scaling",
  },
];

export default function BusinessBenefits() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            Business Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            Transform Your
            <br />
            Business Operations
          </h2>
          <p className="text-lg text-gray-600">
            See measurable improvements across your entire operation with
            SwiftPOS.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group bg-[#F8FAFC] rounded-2xl p-7 border border-gray-100 hover:border-[#2563EB]/10 hover:bg-white hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-lg font-bold">{benefit.stat}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A] mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
