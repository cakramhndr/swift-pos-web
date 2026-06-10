import { Mail } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Solutions", href: "#solutions" },
    { label: "Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Status", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-semibold">SwiftPOS</span>
            </a>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Modern POS & Inventory Management for growing businesses.
              Streamline your operations with our integrated platform.
            </p>
            {/* Newsletter */}
            <div className="max-w-sm">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                Subscribe to Newsletter
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  />
                </div>
                <button className="px-4 py-2.5 text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2026 SwiftPOS. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
