import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold text-[#0F172A] tracking-tight">
              SwiftPOS
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-[#2563EB] border border-gray-200 hover:border-[#2563EB] rounded-xl transition-all"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#2563EB]"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#2563EB] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <hr className="my-3 border-gray-100" />
            <a
              href="/login"
              className="block px-3 py-2.5 text-sm font-medium text-center text-gray-700 border border-gray-200 rounded-xl hover:border-[#2563EB] transition-colors"
            >
              Login
            </a>
            <a
              href="/register"
              className="block px-3 py-2.5 text-sm font-medium text-center text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
