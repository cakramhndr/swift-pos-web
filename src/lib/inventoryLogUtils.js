/**
 * SwiftPOS Inventory Log Utilities
 *
 * Helper functions for inventory logging with localStorage.
 * Tracks stock movements and restock activities.
 */

const STOCK_MOVEMENTS_KEY = "stockMovements";
const RESTOCK_LOGS_KEY = "restockLogs";

/**
 * Generate a unique ID with a prefix and sequential number.
 * @param {string} prefix - ID prefix (e.g., 'MOV', 'RST')
 * @returns {string} Generated ID (e.g., 'MOV-0001', 'RST-0042')
 */
export function generateLogId(prefix) {
  const movements = getStockMovements();
  const restocks = getRestockLogs();

  let maxNum = 0;

  // Check existing movement IDs
  movements.forEach((m) => {
    if (m.id && m.id.startsWith(prefix + "-")) {
      const num = parseInt(m.id.split("-")[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });

  // Check existing restock IDs
  restocks.forEach((r) => {
    if (r.id && r.id.startsWith(prefix + "-")) {
      const num = parseInt(r.id.split("-")[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  return `${prefix}-${String(nextNum).padStart(4, "0")}`;
}

// ─── Stock Movements ────────────────────────────────────────────────────

/**
 * Get all stock movements from localStorage.
 * @returns {Array} Array of stock movement objects
 */
export function getStockMovements() {
  try {
    const data = localStorage.getItem(STOCK_MOVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error("Failed to parse stock movements from localStorage");
    return [];
  }
}

/**
 * Add a new stock movement entry.
 *
 * @param {Object} data - Stock movement data
 * @param {string} data.productId - Product ID
 * @param {string} data.productName - Product name
 * @param {string} [data.variantId] - Variant ID (optional)
 * @param {string} [data.variantName] - Variant name (optional)
 * @param {'sale'|'restock'|'adjustment'} data.type - Movement type
 * @param {number} data.qty - Quantity (positive = stock in, negative = stock out)
 * @param {number} data.stockBefore - Stock before the movement
 * @param {number} data.stockAfter - Stock after the movement
 * @param {string} [data.refId] - Reference ID (e.g., transaction ID)
 * @param {string} [data.note] - Optional note
 * @returns {Object} The created stock movement entry
 */
export function addStockMovement(data) {
  const movements = getStockMovements();

  const entry = {
    id: data.id || generateLogId("MOV"),
    productId: data.productId,
    productName: data.productName,
    variantId: data.variantId || null,
    variantName: data.variantName || null,
    type: data.type, // 'sale' | 'restock' | 'adjustment'
    qty: Number(data.qty),
    stockBefore: Number(data.stockBefore),
    stockAfter: Number(data.stockAfter),
    refId: data.refId || null,
    note: data.note || "",
    createdAt: data.createdAt || new Date().toISOString(),
  };

  movements.unshift(entry);
  localStorage.setItem(STOCK_MOVEMENTS_KEY, JSON.stringify(movements));

  return entry;
}

// ─── Restock Logs ──────────────────────────────────────────────────────

/**
 * Get all restock logs from localStorage.
 * @returns {Array} Array of restock log objects
 */
export function getRestockLogs() {
  try {
    const data = localStorage.getItem(RESTOCK_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error("Failed to parse restock logs from localStorage");
    return [];
  }
}

/**
 * Add a new restock log entry.
 *
 * @param {Object} data - Restock log data
 * @param {string} data.productId - Product ID
 * @param {string} data.productName - Product name
 * @param {string} [data.variantId] - Variant ID (optional)
 * @param {string} [data.variantName] - Variant name (optional)
 * @param {string} [data.supplierId] - Supplier ID (optional)
 * @param {string} [data.supplierName] - Supplier name (optional)
 * @param {number} data.qty - Quantity restocked
 * @param {number} data.buyPrice - Purchase price per unit
 * @param {number} data.totalCost - Total cost (qty * buyPrice)
 * @param {string} [data.note] - Optional note
 * @returns {Object} The created restock log entry
 */
export function addRestockLog(data) {
  const logs = getRestockLogs();

  const buyPrice = Number(data.buyPrice);
  const qty = Number(data.qty);

  const entry = {
    id: data.id || generateLogId("RST"),
    productId: data.productId,
    productName: data.productName,
    variantId: data.variantId || null,
    variantName: data.variantName || null,
    supplierId: data.supplierId || null,
    supplierName: data.supplierName || null,
    qty: qty,
    buyPrice: buyPrice,
    totalCost: data.totalCost != null ? Number(data.totalCost) : buyPrice * qty,
    note: data.note || "",
    createdAt: data.createdAt || new Date().toISOString(),
  };

  logs.unshift(entry);
  localStorage.setItem(RESTOCK_LOGS_KEY, JSON.stringify(logs));

  return entry;
}
