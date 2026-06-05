import client from "./client";

/**
 * Inventory API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function getInventory(params = {}) {
  return client.get("/products", { params });
}

export function getInventoryLogs(params = {}) {
  return client.get("/inventory-logs", { params });
}

export function getSummary() {
  return client.get("/inventory/summary");
}

export function adjustStock(data) {
  return client.post("/stock-adjustments", data);
}