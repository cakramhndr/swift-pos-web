import { Package, BarChart3, Users, ShieldCheck } from "lucide-react";
import LoginFeatureCard from "./LoginFeatureCard";

const features = [
  {
    icon: Package,
    title: "Manajemen Penjualan",
    desc: "Proses transaksi cepat dan akurat",
  },
  {
    icon: BarChart3,
    title: "Kelola Stok dengan Mudah",
    desc: "Pantau stok real-time di semua cabang",
  },
  {
    icon: Users,
    title: "Laporan & Analitik Lengkap",
    desc: "Ambil keputusan berdasarkan data",
  },
  {
    icon: ShieldCheck,
    title: "Aman & Terpercaya",
    desc: "Data bisnis kamu aman bersama kami",
  },
];

export default function LoginHero() {
  return (
    <div className="hidden lg:flex w-[40%] flex-col justify-center px-10 py-12 relative overflow-hidden bg-gradient-to-br from-[#6D5DF6] to-[#4c3dd4]">
      {/* Decorative blobs — white/transparent */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-white/20 animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-8 h-8 rounded-full border-2 border-white/20 animate-float" />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6D5DF6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            SwiftPOS
          </h1>
        </div>

        {/* Headline */}
        <div className="mt-8 space-y-3">
          <h2 className="text-[40px] leading-[1.1] font-extrabold tracking-tight text-white">
            Kelola bisnismu <br />
            <span className="text-purple-200">lebih cerdas</span>
          </h2>
          <p className="text-base text-white/70 leading-relaxed max-w-sm">
            SwiftPOS membantu mengelola penjualan, stok, pelanggan, dan laporan
            dalam satu platform terintegrasi.
          </p>
        </div>

        {/* Feature cards — dark variant */}
        <div className="mt-8 space-y-3">
          {features.map((item, i) => (
            <LoginFeatureCard
              key={i}
              icon={item.icon}
              title={item.title}
              description={item.desc}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 left-10 text-xs text-white/50">
        © 2026 SwiftPOS
      </p>
    </div>
  );
}
