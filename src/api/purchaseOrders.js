import client from "./client";

/**
 * Purchase Orders API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function getPurchaseOrders(params = {}) {
  return client.get("/purchase-orders", { params });
}

export function getPurchaseOrderById(id) {
  return client.get(`/purchase-orders/${id}`);
}

export function createPurchaseOrder(data) {
  return client.post("/purchase-orders", data);
}

export function updatePurchaseOrder(id, data) {
  return client.put(`/purchase-orders/${id}`, data);
}

export function deletePurchaseOrder(id) {
  return client.delete(`/purchase-orders/${id}`);
}

export function receivePurchaseOrder(id, data) {
  return client.post(`/purchase-orders/${id}/receive`, data);
}

export function getPurchaseAnalytics(params = {}) {
  return client.get("/purchase-orders/analytics", { params });
}