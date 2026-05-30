import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Package,
  Receipt,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { exportReportsPDF } from "@/lib/exportUtils";

export default function Reports() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [transactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ─── Period Filter Helpers ──────────────────────────────────────────────
  const getPeriodDates = () => {
    const now = new Date();
    let start, end;

    switch (selectedPeriod) {
      case "today": {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      }
      case "week": {
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - diffToMonday,
        );
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - diffToMonday + 7,
        );
        break;
      }
      case "month": {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      }
      case "custom":
        if (customDateFrom && customDateTo) {
          start = new Date(customDateFrom);
          end = new Date(customDateTo);
          end.setDate(end.getDate() + 1);
        } else {
          start = new Date(0);
          end = new Date(0);
        }
        break;
      default:
        start = new Date(0);
        end = new Date(0);
    }

    return { start, end };
  };

  const filteredTransactions = useMemo(() => {
    const { start, end } = getPeriodDates();

    if (selectedPeriod === "custom" && (!customDateFrom || !customDateTo)) {
      return [];
    }

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate < end;
    });
  }, [transactions, selectedPeriod, customDateFrom, customDateTo]);

  // ─── Summary Stats ──────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce(
      (sum, t) => sum + (t.total || 0),
      0,
    );
    const totalTransactions = filteredTransactions.length;
    const totalItems = filteredTransactions.reduce(
      (sum, t) =>
        sum + (t.items || []).reduce((s, item) => s + (item.qty || 0), 0),
      0,
    );
    const avgOrderValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      avgOrderValue,
    };
  }, [filteredTransactions]);

  // ─── Sales by Product ───────────────────────────────────────────────────
  const salesByProduct = useMemo(() => {
    const productSales = new Map();

    filteredTransactions.forEach((transaction) => {
      (transaction.items || []).forEach((item) => {
        const key = item.cartId || item.id || item.name;
        const existing = productSales.get(key) || {
          id: item.id,
          name: item.variantName
            ? `${item.name} - ${item.variantName}`
            : item.name,
          sku: item.sku || "-",
          qty: 0,
          revenue: 0,
          variantName: item.variantName || null,
        };

        existing.qty += item.qty || 0;
        existing.revenue += (item.unitPrice || 0) * (item.qty || 0);

        productSales.set(key, existing);
      });
    });

    const sortedProducts = Array.from(productSales.values()).sort(
      (a, b) => b.qty - a.qty,
    );

    const totalRevenue = sortedProducts.reduce((sum, p) => sum + p.revenue, 0);

    return sortedProducts.map((product) => ({
      ...product,
      percentage: totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0,
    }));
  }, [filteredTransactions]);

  // ─── Paginated Transactions ─────────────────────────────────────────────
  const paginatedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return {
      data: sorted.slice(start, end),
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / ITEMS_PER_PAGE),
    };
  }, [filteredTransactions, currentPage]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    exportReportsPDF({
      revenue: summaryStats.totalRevenue,
      totalTransaksi: summaryStats.totalTransactions,
      produkTerjual: summaryStats.totalItems,
      avgOrderValue: summaryStats.avgOrderValue,
      topProducts: salesByProduct,
      transactions: filteredTransactions,
      periode: getPeriodLabel(),
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Invoice",
      "Tanggal",
      "Customer",
      "Items",
      "Total",
      "Metode Bayar",
      "Status",
    ];
    const rows = filteredTransactions.map((t) => [
      `#${t.id}`,
      t.date,
      t.customerName || "Walk-in Customer",
      (t.items || []).map((item) => `${item.name} x${item.qty}`).join("; "),
      t.total || 0,
      t.paymentMethod || "Cash",
      "Completed",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const periodNames = {
      today: "hari-ini",
      week: "minggu-ini",
      month: "bulan-ini",
      custom: "custom",
    };

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `swiftpos-report-${periodNames[selectedPeriod]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully");
  };

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  const getPeriodLabel = () => {
    const { start, end } = getPeriodDates();
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return `${start.toLocaleDateString("id-ID", options)} - ${end.toLocaleDateString("id-ID", options)}`;
  };

  const handleViewInvoice = (transaction) => {
    // Open invoice in new tab or show modal - for now we'll use the same approach as Transactions
    const invoiceWindow = window.open("", "_blank");
    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${transaction.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #7c3aed; margin: 0; }
          .info { margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { color: #6b7280; }
          .items { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          .item-row { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
          .item-row:last-child { border-bottom: none; }
          .total { text-align: right; font-size: 24px; font-weight: bold; color: #7c3aed; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SwiftPOS</h1>
          <p>Invoice #${transaction.id}</p>
        </div>
        <div class="info">
          <div class="info-row"><span class="label">Tanggal:</span><span>${transaction.date}</span></div>
          <div class="info-row"><span class="label">Customer:</span><span>${transaction.customerName || "Walk-in Customer"}</span></div>
          <div class="info-row"><span class="label">Metode Bayar:</span><span>${transaction.paymentMethod || "Cash"}</span></div>
        </div>
        <div class="items">
          ${(transaction.items || [])
            .map(
              (item) => `
            <div class="item-row">
              <span>${item.name} x${item.qty}</span>
              <span>Rp ${(item.unitPrice * item.qty).toLocaleString("id-ID")}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="total">${formatCurrency(transaction.total)}</div>
        <div class="footer">
          <p>Terima kasih telah berbelanja di SwiftPOS</p>
          <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">Print</button>
        </div>
      </body>
      </html>
    `);
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md" style={{background:"linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))"}}>
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Reports
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Laporan penjualan & transaksi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-accent px-5 py-2.5 font-semibold text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_-2px_rgba(124,58,237,0.4)] hover:-translate-y-0.5" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ══════════════ Period Filter ══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "today", label: "Hari ini" },
            { key: "week", label: "Minggu ini" },
            { key: "month", label: "Bulan ini" },
            { key: "custom", label: "Custom" },
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => {
                setSelectedPeriod(period.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPeriod === period.key
                  ? "bg-gradient-to-r from-accent to-accent-hover text-white dark:text-white shadow-lg shadow-accent/20"
                  : "px-4 py-2 rounded-xl text-sm font-medium transition-all border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-slate-400 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-gray-700/60 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent dark:hover:text-white"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {selectedPeriod === "custom" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-400" />
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => {
                  setCustomDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-[#ececf2] dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-400 dark:text-gray-400">-</span>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => {
                  setCustomDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 dark:text-gray-400">Periode: {getPeriodLabel()}</p>
      </div>

      {/* ══════════════ Summary Cards ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="mt-1 text-3xl font-bold text-accent">
                {formatCurrency(summaryStats.totalRevenue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light dark:bg-accent/20 border border-accent/30 dark:bg-accent/30 border border-purple-200/50 dark:border-accent/30">
              <TrendingUp className="h-6 w-6 text-accent dark:text-accent dark:text-accent" />
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Transaksi
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalTransactions}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30">
              <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Produk Terjual */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Produk Terjual
              </p>
              <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
                {summaryStats.totalItems}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30">
              <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_16px_-2px_rgba(168,85,247,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Order Value
              </p>
              <p className="mt-1 text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(summaryStats.avgOrderValue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30">
              <FileSpreadsheet className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Sales by Product Table ═════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-6 border-b border-[#ececf2] dark:border-gray-700/60">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Produk Terlaris
          </h2>
        </div>

        {salesByProduct.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
              <Package className="h-7 w-7 text-gray-400 dark:text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              No product data for this period
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">SKU</th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Qty Terjual
                  </th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Revenue
                  </th>
                  <th className="px-6 py-4 font-semibold">% dari Total</th>
                </tr>
              </thead>
              <tbody>
                {salesByProduct.map((product, index) => (
                  <tr
                    key={product.id || index}
                    className="border-t border-[#ececf2] dark:border-gray-700/60 bg-white dark:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-purple-200">
                          <Package className="h-4 w-4 text-accent" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {product.qty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-accent">
                        {formatCurrency(product.revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r rounded-full" style={{background:"linear-gradient(to right, var(--color-accent), var(--color-accent-hover))"}}
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">
                          {product.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════ Transaction Detail Table ═══════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
        <div className="p-6 border-b border-[#ececf2] dark:border-gray-700/60">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-accent" />
            Rincian Transaksi
          </h2>
        </div>

        {paginatedTransactions.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
              <Receipt className="h-7 w-7 text-gray-400 dark:text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              No transactions for this period
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80 text-left text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-semibold">Invoice</th>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Items</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Total
                    </th>
                    <th className="px-6 py-4 font-semibold">Metode Bayar</th>
                    <th className="px-6 py-4 font-semibold text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.data.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)]"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewInvoice(transaction)}
                          className="text-accent font-semibold hover:underline cursor-pointer"
                        >
                          #{transaction.id}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {formatDate(transaction.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {transaction.customerName || "Walk-in Customer"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(transaction.items || [])
                            .slice(0, 2)
                            .map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-block rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400"
                              >
                                {item.name} x{item.qty}
                              </span>
                            ))}
                          {(transaction.items || []).length > 2 && (
                            <span className="inline-block rounded-lg bg-accent-light px-2.5 py-1 text-xs font-medium text-accent">
                              +{(transaction.items || []).length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-accent dark:text-accent">
                          {formatCurrency(transaction.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <CreditCard className="h-3 w-3" />
                          {transaction.paymentMethod || "Cash"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginatedTransactions.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#ececf2] dark:border-gray-700/60">
                <p className="text-sm text-gray-400 dark:text-gray-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    paginatedTransactions.total,
                  )}{" "}
                  of {paginatedTransactions.total}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  {Array.from(
                    { length: paginatedTransactions.totalPages },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        page === currentPage
                          ? "bg-gradient-to-r from-accent to-accent-hover text-white dark:text-white shadow-lg shadow-accent/20"
                          : "border border-[#ececf2] dark:border-gray-700 text-gray-600 hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:text-accent"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, paginatedTransactions.totalPages),
                      )
                    }
                    disabled={currentPage === paginatedTransactions.totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-accent dark:hover:border-accent hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════ Print Styles ═══════════════════════════════════════ */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
