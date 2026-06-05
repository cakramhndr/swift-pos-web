import client from "./client";

/**
 * Customers API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function getCustomers(params = {}) {
  return client.get("/customers", { params });
}

export function getCustomerById(id) {
  return client.get(`/customers/${id}`);
}

export function createCustomer(data) {
  return client.post("/customers", data);
}

export function updateCustomer(id, data) {
  return client.put(`/customers/${id}`, data);
}

export function deleteCustomer(id) {
  return client.delete(`/customers/${id}`);
}