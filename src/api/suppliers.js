import client from "./client";

/**
 * Suppliers API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function getSuppliers(params = {}) {
  return client.get("/suppliers", { params });
}

export function getSupplierById(id) {
  return client.get(`/suppliers/${id}`);
}

export function createSupplier(data) {
  return client.post("/suppliers", data);
}

export function updateSupplier(id, data) {
  return client.put(`/suppliers/${id}`, data);
}

export function deleteSupplier(id) {
  return client.delete(`/suppliers/${id}`);
}