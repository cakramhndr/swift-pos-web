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
  // If data is FormData (contains file upload), send as multipart/form-data.
  // Axios will auto-detect and set the correct Content-Type with boundary.
  // For plain objects, send as JSON (existing behavior).
  return client.post("/products", data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
  });
}

export function updateProduct(id, data) {
  // Support both JSON and FormData
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return client.post(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return client.put(`/products/${id}`, data);
}

export function deleteProduct(id) {
  return client.delete(`/products/${id}`);
}
