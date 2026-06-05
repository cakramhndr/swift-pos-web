import client from "./client";

/**
 * Reports API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message }
 */

export function getSalesReport(params = {}) {
  return client.get("/reports/sales", { params });
}

export function getProductsReport(params = {}) {
  return client.get("/reports/products", { params });
}

export function getCustomersReport(params = {}) {
  return client.get("/reports/customers", { params });
}