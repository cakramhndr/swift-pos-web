import { ArrowRight, CalendarCheck } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to take control
          <br />
          of your business?
        </h2>
        <p className="text-lg text-blue-200 mb-10 max-w-xl mx-auto">
          Join SwiftPOS and experience the power of integrated POS and inventory
          management. Start transforming your operations today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2563EB] font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <CalendarCheck className="w-5 h-5" />
            Book Demo
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
