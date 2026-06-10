import {
  FileText,
  CheckCircle,
  PackageCheck,
  RefreshCw,
  ArrowDown,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: FileText,
    title: "Create Purchase Order",
    description:
      "Generate purchase orders automatically based on reorder points or create them manually with a few clicks. Add items, set quantities, and select suppliers.",
    color: "text-[#2563EB]",
    bg: "bg-[#EEF2FF]",
    border: "border-[#2563EB]/20",
  },
  {
    step: 2,
    icon: CheckCircle,
    title: "Approve Order",
    description:
      "Route purchase orders through your approval workflow. Managers receive notifications and can approve, reject, or modify orders from anywhere.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    step: 3,
    icon: PackageCheck,
    title: "Receive Goods",
    description:
      "When goods arrive, match them against the purchase order. Record quantities received, quality checks, and update inventory in real time.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    step: 4,
    icon: RefreshCw,
    title: "Inventory Updated",
    description:
      "Stock levels are automatically updated with accurate cost calculations. Inventory logs track every movement for complete traceability.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
];

export default function ProcurementWorkflow() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            Procurement Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            Streamlined Procurement
            <br />
            from Order to Inventory
          </h2>
          <p className="text-lg text-gray-600">
            A key differentiator — SwiftPOS automates the entire purchasing
            workflow so your team can focus on growing the business.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#2563EB] via-emerald-400 to-violet-400" />

          <div className="grid lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {/* Step number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${step.bg} ${step.color} flex items-center justify-center text-lg font-bold shadow-sm`}
                    >
                      {step.step}
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowDown className="w-5 h-5 text-gray-300 lg:hidden" />
                    )}
                  </div>

                  {/* Step card */}
                  <div
                    className={`bg-white rounded-2xl p-7 border ${step.border} hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mb-5`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
