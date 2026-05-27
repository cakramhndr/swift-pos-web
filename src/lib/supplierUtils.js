/**
 * SwiftPOS Supplier Utilities
 *
 * Helper functions for supplier management with localStorage.
 */

const SUPPLIERS_KEY = "suppliers";

/**
 * Generate a unique supplier ID with sequential numbering.
 * @returns {string} Generated ID (e.g., 'SUP-0001', 'SUP-0042')
 */
export function generateSupplierId() {
  const suppliers = getSuppliers();

  let maxNum = 0;

  suppliers.forEach((s) => {
    if (s.id && s.id.startsWith("SUP-")) {
      const num = parseInt(s.id.split("-")[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  return `SUP-${String(nextNum).padStart(4, "0")}`;
}

/**
 * Get all suppliers from localStorage.
 * @returns {Array} Array of supplier objects
 */
export function getSuppliers() {
  try {
    const data = localStorage.getItem(SUPPLIERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error("Failed to parse suppliers from localStorage");
    return [];
  }
}

/**
 * Add a new supplier.
 *
 * @param {Object} data - Supplier data
 * @param {string} data.name - Supplier name (required)
 * @param {string} [data.phone] - Phone number
 * @param {string} [data.email] - Email
 * @param {string} [data.address] - Address
 * @param {string} [data.note] - Note
 * @returns {Object|null} The created supplier, or null if name is empty
 */
export function addSupplier(data) {
  if (!data.name || !data.name.trim()) {
    console.error("Supplier name is required");
    return null;
  }

  const suppliers = getSuppliers();

  const entry = {
    id: generateSupplierId(),
    name: data.name.trim(),
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    note: data.note || "",
    createdAt: new Date().toISOString(),
  };

  suppliers.push(entry);
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));

  return entry;
}

/**
 * Update an existing supplier by ID.
 *
 * @param {string} id - Supplier ID
 * @param {Object} data - Fields to update (partial supplier object)
 * @returns {Object|null} The updated supplier, or null if not found
 */
export function updateSupplier(id, data) {
  const suppliers = getSuppliers();
  let updatedEntry = null;

  const updated = suppliers.map((s) => {
    if (s.id === id) {
      updatedEntry = {
        ...s,
        ...data,
        id: s.id, // Prevent overwriting ID
        createdAt: s.createdAt, // Preserve original creation date
      };
      return updatedEntry;
    }
    return s;
  });

  if (!updatedEntry) {
    console.error(`Supplier with ID "${id}" not found`);
    return null;
  }

  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(updated));
  return updatedEntry;
}

/**
 * Delete a supplier by ID.
 *
 * @param {string} id - Supplier ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteSupplier(id) {
  const suppliers = getSuppliers();
  const filtered = suppliers.filter((s) => s.id !== id);

  if (filtered.length === suppliers.length) {
    console.error(`Supplier with ID "${id}" not found`);
    return false;
  }

  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get stats for a supplier based on restock logs.
 *
 * @param {string} supplierId - Supplier ID
 * @returns {Object} Stats object: { totalTransaksi, totalUnit, totalPembelian }
 */
export function getSupplierStats(supplierId) {
  try {
    const restockLogs = JSON.parse(localStorage.getItem("restockLogs") || "[]");

    const supplierLogs = restockLogs.filter(
      (log) => log.supplierId === supplierId,
    );

    const totalTransaksi = supplierLogs.length;
    const totalUnit = supplierLogs.reduce(
      (sum, log) => sum + Number(log.qty || 0),
      0,
    );
    const totalPembelian = supplierLogs.reduce(
      (sum, log) => sum + Number(log.totalCost || 0),
      0,
    );

    return {
      totalTransaksi,
      totalUnit,
      totalPembelian,
    };
  } catch {
    console.error("Failed to calculate supplier stats");
    return { totalTransaksi: 0, totalUnit: 0, totalPembelian: 0 };
  }
}
