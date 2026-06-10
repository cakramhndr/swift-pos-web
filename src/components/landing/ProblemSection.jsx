import { FileWarning, ClipboardX, Clock, EyeOff } from "lucide-react";

const problems = [
  {
    icon: FileWarning,
    title: "Stock Inaccuracies & Discrepancies",
    description:
      "Manual tracking leads to mismatched inventory records, over-selling, and lost revenue due to stock discrepancies across sales channels.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: ClipboardX,
    title: "Manual Purchasing Processes",
    description:
      "Relying on spreadsheets and manual purchase orders causes delays, data entry errors, and missed reorder opportunities.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Clock,
    title: "Time-Consuming Stock Opname",
    description:
      "Physical inventory counts require days of downtime and manual effort, disrupting daily operations and delaying fulfillment.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: EyeOff,
    title: "Lack of Real-Time Visibility",
    description:
      "Without a centralized system, businesses operate blind — unable to track inventory movements, sales trends, or warehouse performance in real time.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

export default function ProblemSection() {
  return (
    <section id="solutions" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            The Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            Still Managing Your Business
            <br />
            with Outdated Tools?
          </h2>
          <p className="text-lg text-gray-600">
            Spreadsheets, manual processes, and disconnected systems create
            friction that slows your business down.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#2563EB]/10 hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${problem.bg} ${problem.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                  {problem.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
