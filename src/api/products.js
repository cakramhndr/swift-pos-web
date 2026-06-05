import client from "./client";

/**
 * Product API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function getProducts(params = {}) {
  return client.get("/products", { params });
}

export function getProductById(id) {
  return client.get(`/products/${id}`);
}

export function createProduct(data) {
  return client.post("/products", data);
}

export function updateProduct(id, data) {
  return client.put(`/products/${id}`, data);
}

export function deleteProduct(id) {
  return client.delete(`/products/${id}`);
}