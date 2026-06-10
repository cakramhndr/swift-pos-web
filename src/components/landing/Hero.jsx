import {
  ArrowRight,
  PlayCircle,
  BarChart3,
  Package,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EEF2FF] via-white to-white pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#2563EB]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EEF2FF] border border-[#2563EB]/10 rounded-full text-sm font-medium text-[#2563EB] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              Modern &bull; Integrated &bull; Powerful
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] tracking-tight mb-6">
              Modern POS & Inventory Management
              <span className="text-[#2563EB]"> for Growing Businesses</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Manage sales, inventory, purchasing, and warehouse operations in
              one integrated platform. SwiftPOS helps businesses track stock
              accurately, automate purchasing workflows, and gain real-time
              visibility into inventory performance.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl shadow-lg shadow-[#2563EB]/20 hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 hover:border-[#2563EB]/30 text-gray-700 hover:text-[#2563EB] font-medium rounded-xl shadow-sm hover:shadow transition-all"
              >
                <PlayCircle className="w-5 h-5" />
                Request Demo
              </a>
            </div>

            {/* Trusted text */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
              <span>
                Trusted by retailers, distributors, and growing businesses.
              </span>
            </div>
          </div>

          {/* Right side - Dashboard mockup */}
          <div className="relative">
            {/* Main dashboard card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              {/* Dashboard header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    Dashboard Overview
                  </span>
                </div>
                <span className="text-xs text-gray-300">SwiftPOS</span>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-[#EEF2FF] to-white rounded-xl p-4 border border-[#2563EB]/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-xs font-medium text-gray-500">
                        Revenue
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[#0F172A]">$48.5k</p>
                    <p className="text-xs text-[#10B981]">+12.5%</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-[#10B981]" />
                      <span className="text-xs font-medium text-gray-500">
                        Orders
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[#0F172A]">284</p>
                    <p className="text-xs text-[#10B981]">+8.2%</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-gray-500">
                        Growth
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[#0F172A]">23.6%</p>
                    <p className="text-xs text-[#10B981]">+3.1%</p>
                  </div>
                </div>

                {/* Mini chart area */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500">
                      Monthly Revenue
                    </span>
                    <span className="text-xs text-[#2563EB] font-medium">
                      +18.4%
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    {[40, 55, 45, 70, 65, 85, 75, 90, 80, 95, 88, 100].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-md bg-gradient-to-t from-[#2563EB] to-[#60A5FA] opacity-80 hover:opacity-100 transition-opacity"
                          style={{ height: `${h}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-500">
                    Recent Activity
                  </span>
                  {[
                    {
                      text: "Purchase Order #PO-2024 approved",
                      time: "2 min ago",
                    },
                    {
                      text: "Stock opname for Warehouse A completed",
                      time: "15 min ago",
                    },
                    {
                      text: "Low stock alert: Product SKU-0452",
                      time: "1 hour ago",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs text-gray-600 py-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <span className="flex-1">{item.text}</span>
                      <span className="text-gray-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[200px] hidden sm:block animate-float">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-xs font-medium text-gray-600">
                  Inventory Status
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">In Stock</span>
                  <span className="font-medium text-[#0F172A]">1,284</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Low Stock</span>
                  <span className="font-medium text-amber-600">23</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Out of Stock</span>
                  <span className="font-medium text-red-600">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
