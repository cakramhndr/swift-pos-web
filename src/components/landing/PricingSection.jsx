import { CheckCircle, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description:
      "Perfect for small businesses getting started with POS and inventory management.",
    features: [
      "Up to 500 products",
      "Basic inventory tracking",
      "POS sales interface",
      "Single warehouse",
      "Email support",
      "Basic reports",
    ],
    cta: "Contact Us",
    popular: false,
  },
  {
    name: "Business",
    description:
      "Ideal for growing businesses that need advanced inventory and purchasing features.",
    features: [
      "Up to 5,000 products",
      "Real-time inventory tracking",
      "Purchase order automation",
      "Multi-warehouse support",
      "Stock opname workflows",
      "Advanced analytics & reports",
      "Priority support",
      "API access",
    ],
    cta: "Contact Us",
    popular: true,
  },
  {
    name: "Enterprise",
    description:
      "For large organizations with complex operations and custom requirements.",
    features: [
      "Unlimited products",
      "Advanced inventory intelligence",
      "Custom procurement workflows",
      "Unlimited warehouses",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "24/7 premium support",
      "White-label options",
    ],
    cta: "Contact Us",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            Choose the Right Plan
            <br />
            for Your Business
          </h2>
          <p className="text-lg text-gray-600">
            Flexible plans designed to grow with you. No hidden fees, no
            long-term contracts.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border ${
                plan.popular
                  ? "border-[#2563EB] shadow-xl shadow-[#2563EB]/10"
                  : "border-gray-100 shadow-sm"
              } hover:shadow-xl transition-all`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-xs font-semibold text-white bg-[#2563EB] rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan header */}
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <CheckCircle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.popular ? "text-[#2563EB]" : "text-[#10B981]"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#"
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/20"
                      : "bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#0F172A] border border-gray-200"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
