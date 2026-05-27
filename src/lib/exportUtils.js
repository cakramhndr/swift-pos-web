import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

// ─── Helper: format date for filename & header ─────────────────────────────
const getDateStr = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const getDateDisplay = () => {
  const d = new Date();
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatRp = (num) => {
  if (num === undefined || num === null) return "Rp 0";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

// ─── Helper: add header & date to PDF ──────────────────────────────────────
function addHeader(doc, title) {
  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237); // violet-600
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(`Exported: ${getDateDisplay()}`, 14, 28);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // Reset text color
  doc.setTextColor(31, 41, 55); // gray-800
}

// ─── Helper: auto-download ────────────────────────────────────────────────
function savePDF(doc, pageName) {
  doc.save(`swiftpos-${pageName}-${getDateStr()}.pdf`);
}

// ─── Reports PDF ────────────────────────────────────────────────────────────
export function exportReportsPDF({
  revenue,
  totalTransaksi,
  produkTerjual,
  avgOrderValue,
  topProducts,
  transactions,
  periode,
}) {
  const doc = new jsPDF("portrait", "mm", "a4");

  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237);
  doc.text("SwiftPOS — Sales Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Periode: ${periode}`, 14, 28);
  doc.text(`Exported: ${getDateDisplay()}`, 14, 34);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);
  doc.setTextColor(31, 41, 55);

  // Section 1: Summary Stats
  let y = 44;
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Ringkasan", 14, y);
  y += 4;

  const summaryRows = [
    ["Total Revenue", formatRp(revenue)],
    ["Total Transaksi", String(totalTransaksi ?? 0)],
    ["Produk Terjual", String(produkTerjual ?? 0)],
    ["Avg Order Value", formatRp(avgOrderValue)],
  ];

  doc.autoTable({
    startY: y + 2,
    head: [["Metric", "Value"]],
    body: summaryRows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  // Section 2: Top Products
  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Produk Terlaris", 14, y);
  y += 4;

  const topRows = (topProducts || []).map((p, i) => [
    String(i + 1),
    p.name || "-",
    p.sku || "-",
    String(p.qty ?? 0),
    formatRp(p.revenue ?? 0),
    (p.percentage ?? 0).toFixed(1) + "%",
  ]);

  doc.autoTable({
    startY: y + 2,
    head: [["No", "Produk", "SKU", "Qty Terjual", "Revenue", "% dari Total"]],
    body: topRows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  // Section 3: Transaction Details
  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Rincian Transaksi", 14, y);
  y += 4;

  const txnRows = (transactions || []).map((t) => [
    `#${t.id ?? ""}`,
    t.date || "-",
    t.customerName || t.customer || "Walk-in Customer",
    formatRp(t.total ?? 0),
    t.paymentMethod || t.payment || "Cash",
    "Completed",
  ]);

  doc.autoTable({
    startY: y + 2,
    head: [
      ["Invoice", "Tanggal", "Customer", "Total", "Metode Bayar", "Status"],
    ],
    body: txnRows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "report");
}

// ─── 1. Dashboard PDF ──────────────────────────────────────────────────────
export function exportDashboardPDF({
  revenue,
  orders,
  productsSold,
  topProducts,
  recentOrders,
}) {
  const doc = new jsPDF("portrait", "mm", "a4");

  addHeader(doc, "SwiftPOS — Dashboard Report");

  // Section 1: Summary Stats
  let y = 40;
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Summary Statistics", 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  const stats = [
    ["Total Revenue", formatRp(revenue)],
    ["Total Orders", String(orders ?? 0)],
    ["Products Sold", String(productsSold ?? 0)],
  ];
  stats.forEach(([label, value]) => {
    doc.text(label, 18, y);
    doc.text(value, 180, y, { align: "right" });
    y += 7;
  });

  // Section 2: Top Products
  y += 6;
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Top Products", 14, y);
  y += 4;

  const topProductsData = (topProducts || []).map((p, i) => [
    String(i + 1),
    p.name || "-",
    String(p.sold ?? 0),
  ]);

  doc.autoTable({
    startY: y + 2,
    head: [["No", "Product Name", "Qty Sold"]],
    body: topProductsData,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  // Section 3: Recent Orders
  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Recent Orders", 14, y);
  y += 4;

  const recentOrdersData = (recentOrders || []).map((t) => [
    String(t.id ?? ""),
    t.customerName || t.customer || "-",
    formatRp(t.total ?? 0),
    t.date || "-",
  ]);

  doc.autoTable({
    startY: y + 2,
    head: [["Order ID", "Customer", "Total", "Date"]],
    body: recentOrdersData,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "dashboard");
}

// ─── 2. Transactions PDF ────────────────────────────────────────────────────
export function exportTransactionsPDF(transactions) {
  const doc = new jsPDF("portrait", "mm", "a4");

  addHeader(doc, "SwiftPOS — Transactions Report");

  const rows = (transactions || []).map((t, i) => [
    String(i + 1),
    t.date || "-",
    t.customerName || t.customer || "-",
    (t.items || []).map((item) => `${item.name} x${item.qty}`).join(", ") ||
      "-",
    t.payment || t.paymentMethod || "-",
    formatRp(t.total ?? 0),
  ]);

  doc.autoTable({
    startY: 36,
    head: [["No", "Date", "Customer", "Items", "Payment", "Total"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      3: { cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "transactions");
}

// ─── 3. Inventory PDF ───────────────────────────────────────────────────────
export function exportInventoryPDF(products) {
  const doc = new jsPDF("portrait", "mm", "a4");

  addHeader(doc, "SwiftPOS — Inventory Report");

  const getStatus = (product) => {
    const stock =
      product.variants && product.variants.length > 0
        ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
        : Number(product.stock || 0);
    const minStock = product.minStock || 5;
    if (stock === 0) return "Out of Stock";
    if (stock <= minStock) return "Low Stock";
    return "In Stock";
  };

  const getStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    }
    return Number(product.stock || 0);
  };

  const rows = (products || []).map((p, i) => [
    String(i + 1),
    p.name || "-",
    p.sku || "-",
    p.category || "-",
    String(getStock(p)),
    String(p.minStock || 5),
    formatRp(p.price ?? p.sellingPrice ?? 0),
    getStatus(p),
  ]);

  doc.autoTable({
    startY: 36,
    head: [
      [
        "No",
        "Product Name",
        "SKU",
        "Category",
        "Stock",
        "Min Stock",
        "Price",
        "Status",
      ],
    ],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "inventory");
}

// ─── 4. Inventory Logs PDF ──────────────────────────────────────────────────
export function exportInventoryLogsPDF(movements, restockLogs) {
  const doc = new jsPDF("portrait", "mm", "a4");

  addHeader(doc, "SwiftPOS — Inventory Logs Report");

  // Section 1: Stock Movement
  let y = 36;
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55);
  doc.text("Stock Movements", 14, y);
  y += 4;

  const movementRows = (movements || []).map((m, i) => [
    String(i + 1),
    m.createdAt || m.date || "-",
    m.productName || "-",
    m.type || "-",
    String(m.qty ?? 0),
    String(m.stockAfter ?? m.afterStock ?? 0),
  ]);

  doc.autoTable({
    startY: y + 2,
    head: [["No", "Time", "Product", "Type", "Qty", "Final Stock"]],
    body: movementRows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  // Section 2: Restock Logs
  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55);
  doc.text("Restock Logs", 14, y);
  y += 4;

  const restockRows = (restockLogs || []).map((r, i) => [
    String(i + 1),
    r.createdAt || r.date || "-",
    r.productName || "-",
    r.supplierName || "-",
    String(r.qty ?? 0),
    formatRp(r.totalCost ?? r.total ?? 0),
  ]);

  doc.autoTable({
    startY: y + 2,
    head: [["No", "Date", "Product", "Supplier", "Qty", "Total"]],
    body: restockRows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "inventory-logs");
}

// ─── 5. Customers PDF ──────────────────────────────────────────────────────
export function exportCustomersPDF(customers) {
  const doc = new jsPDF("portrait", "mm", "a4");

  addHeader(doc, "SwiftPOS — Customers Report");

  const rows = (customers || []).map((c, i) => [
    String(i + 1),
    c.fullName || c.name || "-",
    c.email || "-",
    c.phone || "-",
    String(c.totalTransactions ?? c.totalOrders ?? 0),
    formatRp(c.totalSpent ?? c.totalSpending ?? 0),
  ]);

  doc.autoTable({
    startY: 36,
    head: [
      ["No", "Name", "Email", "Phone", "Total Transactions", "Total Spending"],
    ],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "customers");
}

// ─── 6. Products PDF ───────────────────────────────────────────────────────
export function exportProductsPDF(products) {
  const doc = new jsPDF("portrait", "mm", "a4");

  addHeader(doc, "SwiftPOS — Products Report");

  const getStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    }
    return Number(product.stock || 0);
  };

  const getStatus = (product) => {
    const stock = getStock(product);
    const minStock = product.minStock || 5;
    if (stock === 0) return "Out of Stock";
    if (stock <= minStock) return "Low Stock";
    return "In Stock";
  };

  const rows = (products || []).map((p, i) => [
    String(i + 1),
    p.name || "-",
    p.sku || "-",
    p.category || "-",
    formatRp(p.price ?? p.sellingPrice ?? 0),
    String(getStock(p)),
    getStatus(p),
  ]);

  doc.autoTable({
    startY: 36,
    head: [["No", "Name", "SKU", "Category", "Price", "Stock", "Status"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
    },
    margin: { left: 14, right: 14 },
  });

  savePDF(doc, "products");
}
