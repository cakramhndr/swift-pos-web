import { CreditCard, CheckCircle, Printer, Receipt, X } from "lucide-react";

const formatDateTime = (ds) => {
  if (!ds) return "-";
  const d = new Date(ds);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function InvoiceModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}
            >
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice</h2>
              <p className="text-xs text-gray-400 mt-0.5">#{transaction.invoice_number || transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-sm font-bold text-red-500 transition-all hover:shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Transaction Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDateTime(transaction.date)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Customer</span>
            <span className="text-sm font-medium">{transaction.customerName || transaction.customer_name || "Walk-in Customer"}</span>
          </div>
        </div>

        <div className="space-y-2.5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Items</p>
          {(transaction.items || []).map((item, idx) => (
            <div key={item.cartId || item.id || idx} className="flex items-center justify-between rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4 transition-all hover:border-accent">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  Rp {Number(item.unitPrice || 0).toLocaleString()} x {item.qty}
                </p>
              </div>
              <p className="font-bold text-accent">
                Rp {(Number(item.unitPrice || 0) * item.qty).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 p-4 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              {transaction.paymentMethod || transaction.payment_method || "Cash"}
            </p>
          </div>
          {transaction.paidAmount && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                <p className="font-semibold text-gray-900 dark:text-white">Rp {Number(transaction.paidAmount).toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">Change</p>
                <p className="font-bold text-green-600 dark:text-green-400">Rp {(transaction.change || 0).toLocaleString()}</p>
              </div>
            </>
          )}
          <div className="border-t border-[#ececf2] dark:border-gray-700/60 pt-2.5 flex items-center justify-between">
            <p className="text-base font-bold text-gray-900 dark:text-white">Total</p>
            <p className="text-2xl font-bold text-accent">Rp {Number(transaction.total).toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full rounded-2xl bg-gradient-to-r py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))" }}
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>
    </div>
  );
}