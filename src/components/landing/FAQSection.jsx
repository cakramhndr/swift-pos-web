import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is SwiftPOS cloud-based?",
    answer:
      "Yes, SwiftPOS is a fully cloud-based platform. You can access your business data from anywhere, on any device, with an internet connection. No on-premise servers or complex installations required.",
  },
  {
    question: "Does SwiftPOS support inventory management?",
    answer:
      "Absolutely. SwiftPOS provides comprehensive inventory management capabilities including real-time stock tracking, multi-warehouse support, stock opname workflows, low stock alerts, and inventory cost calculations.",
  },
  {
    question: "Can SwiftPOS manage suppliers and purchase orders?",
    answer:
      "Yes, SwiftPOS includes a complete procurement module. You can manage supplier information, create and track purchase orders, automate approval workflows, and receive goods with real-time inventory updates.",
  },
  {
    question: "Is multi-warehouse available?",
    answer:
      "Multi-warehouse support is available on Business and Enterprise plans. You can manage inventory across multiple locations, transfer stock between warehouses, and maintain separate stock counts per facility.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mt-4 mb-6 leading-tight">
            Frequently Asked
            <br />
            Questions
          </h2>
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-[#F8FAFC] rounded-2xl border border-gray-100 transition-all ${
                openIndex === index ? "shadow-md" : ""
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex items-center justify-between w-full px-6 py-5 text-left"
              >
                <span className="text-sm font-semibold text-[#0F172A] pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180 text-[#2563EB]" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
