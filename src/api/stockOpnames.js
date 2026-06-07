import client from "./client";

/**
 * Stock Opnames API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function getStockOpnames(params = {}) {
  return client.get("/stock-opnames", { params });
}

export function getStockOpnameById(id) {
  return client.get(`/stock-opnames/${id}`);
}

export function createStockOpname(data) {
  return client.post("/stock-opnames", data);
}

export function updateStockOpname(id, data) {
  return client.put(`/stock-opnames/${id}`, data);
}

export function deleteStockOpname(id) {
  return client.delete(`/stock-opnames/${id}`);
}

export function startStockOpname(id) {
  return client.post(`/stock-opnames/${id}/start`);
}

export function completeStockOpname(id) {
  return client.post(`/stock-opnames/${id}/complete`);
}

export function cancelStockOpname(id) {
  return client.post(`/stock-opnames/${id}/cancel`);
}