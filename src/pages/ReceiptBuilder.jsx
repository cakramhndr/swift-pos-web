import { useState } from "react";
import { toast } from "sonner";
import { FileText, Save, Printer, ShoppingCart } from "lucide-react";

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
        checked ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const DEFAULT_RECEIPT_SETTINGS = {
  footerText: "Terima kasih telah berbelanja!",
  showLogo: true,
  showPhone: true,
  showAddress: true,
};

export default function ReceiptBuilder({ storeProfile, previewInvoiceId }) {
  const [receiptSettings, setReceiptSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_receipt_settings");
      return saved ? JSON.parse(saved) : { ...DEFAULT_RECEIPT_SETTINGS };
    } catch {
      return { ...DEFAULT_RECEIPT_SETTINGS };
    }
  });

  const saveReceiptSettings = () => {
    localStorage.setItem(
      "swiftpos_receipt_settings",
      JSON.stringify(receiptSettings),
    );
    toast.success("Receipt settings saved successfully ✅");
  };

  const commonInputClass =
    "w-full rounded-xl border border-gray-200/70 dark:border-gray-700/60 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-900/80 dark:text-white bg-white";
  const saveBtnClass =
    "flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0";

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Receipt Settings
              </p>
              <p className="text-xs text-gray-400">
                Customize receipt content and appearance
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                Receipt Footer Text
              </label>
              <textarea
                value={receiptSettings.footerText}
                onChange={(e) =>
                  setReceiptSettings({
                    ...receiptSettings,
                    footerText: e.target.value,
                  })
                }
                rows={2}
                className={`${commonInputClass} resize-none`}
                placeholder="Terima kasih telah berbelanja!"
              />
            </div>
            <div className="space-y-4 border-t border-gray-100 dark:border-gray-700/60 pt-4">
              <Toggle
                checked={receiptSettings.showLogo}
                onChange={(v) =>
                  setReceiptSettings({
                    ...receiptSettings,
                    showLogo: v,
                  })
                }
                label="Show Logo on Receipt"
                description="Display store logo at the top"
              />
              <Toggle
                checked={receiptSettings.showPhone}
                onChange={(v) =>
                  setReceiptSettings({
                    ...receiptSettings,
                    showPhone: v,
                  })
                }
                label="Show Phone Number"
                description="Display store phone on receipt"
              />
              <Toggle
                checked={receiptSettings.showAddress}
                onChange={(v) =>
                  setReceiptSettings({
                    ...receiptSettings,
                    showAddress: v,
                  })
                }
                label="Show Store Address"
                description="Display store address on receipt"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={saveReceiptSettings} className={saveBtnClass}>
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="relative">
        {/* Live Preview badge */}
        <div className="absolute -top-2.5 right-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r text-[10px] font-semibold text-white shadow-sm" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          Live Preview
        </div>

        {/* Print button */}
        <button
          onClick={() => window.print()}
          className="absolute -top-2.5 right-32 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 text-[10px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <Printer size={12} />
          Print
        </button>

        {/* Thermal Receipt Paper */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="relative bg-white dark:bg-gray-900 mx-auto max-w-[340px]">
            {/* Top edge */}
            <div className="flex justify-between px-6 pt-5 pb-2 text-gray-300 dark:text-gray-700 select-none">
              <span className="text-[8px]">·····························</span>
              <span className="text-[8px]">····················</span>
            </div>

            <div className="px-6 pb-2 font-mono text-[11px] leading-relaxed text-gray-800 dark:text-gray-200">
              <div className="text-center mb-3">
                {receiptSettings.showLogo && (
                  <div className="flex justify-center mb-2">
                    {storeProfile.logo ? (
                      <img
                        src={storeProfile.logo}
                        alt="logo"
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
                        <ShoppingCart size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
                <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white not-mono">
                  {storeProfile.name || "SwiftPOS"}
                </h2>
                {receiptSettings.showAddress && storeProfile.address && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 not-mono leading-relaxed mt-0.5">
                    {storeProfile.address}
                  </p>
                )}
                {receiptSettings.showPhone && storeProfile.phone && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 not-mono mt-px">
                    {storeProfile.phone}
                  </p>
                )}
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mb-2" />

              <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Invoice</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {previewInvoiceId()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Admin
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2" />

              <div className="flex text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pb-1">
                <span className="flex-[2]">Item</span>
                <span className="flex-1 text-right">Qty</span>
                <span className="flex-[1.5] text-right">Price</span>
                <span className="flex-[1.5] text-right">Total</span>
              </div>

              {[
                { name: "Nasi Goreng Spesial", qty: 2, price: 25000 },
                { name: "Es Teh Manis", qty: 3, price: 8000 },
                { name: "Ayam Bakar", qty: 1, price: 35000 },
                { name: "French Fries", qty: 2, price: 15000 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex text-[11px] py-1 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="flex-[2] truncate pr-2 text-gray-700 dark:text-gray-300">
                    {item.name}
                  </div>
                  <div className="flex-1 text-right text-gray-600 dark:text-gray-400">
                    {item.qty}
                  </div>
                  <div className="flex-[1.5] text-right text-gray-600 dark:text-gray-400">
                    Rp{item.price.toLocaleString()}
                  </div>
                  <div className="flex-[1.5] text-right font-medium text-gray-800 dark:text-gray-200">
                    Rp{(item.qty * item.price).toLocaleString()}
                  </div>
                </div>
              ))}

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2" />

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Rp 130.000
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -Rp 5.000
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax (11%)</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Rp 13.750
                  </span>
                </div>
                <div className="border-t-2 border-double border-gray-300 dark:border-gray-600 my-1.5" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-900 dark:text-white">TOTAL</span>
                  <span className="text-accent dark:text-accent">
                    Rp 138.750
                  </span>
                </div>
                <div className="border-t-2 border-double border-gray-300 dark:border-gray-600 my-1.5" />
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Cash</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Rp 150.000
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Change</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Rp 11.250
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-3" />

              <div className="text-center">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic leading-relaxed">
                  {receiptSettings.footerText ||
                    "Terima kasih telah berbelanja!"}
                </p>
                <p className="text-[8px] text-gray-300 dark:text-gray-600 mt-1.5 tracking-wider uppercase">
                  SwiftPOS · Point of Sale
                </p>
              </div>
            </div>

            {/* Torn paper bottom */}
            <div className="relative h-4 overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 340 16"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 Q10,8 20,4 T40,8 T60,4 T80,8 T100,4 T120,8 T140,4 T160,8 T180,4 T200,8 T220,4 T240,8 T260,4 T280,8 T300,4 T320,8 T340,4 L340,16 L0,16 Z"
                  fill="#f9fafb"
                  className="fill-white dark:fill-gray-950"
                />
                <path
                  d="M0,0 Q10,8 20,4 T40,8 T60,4 T80,8 T100,4 T120,8 T140,4 T160,8 T180,4 T200,8 T220,4 T240,8 T260,4 T280,8 T300,4 T320,8 T340,4"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
