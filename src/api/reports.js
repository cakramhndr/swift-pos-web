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

export function getTrendsReport(params = {}) {
  return client.get("/reports/trends", { params });
}

export function getCategoriesReport(params = {}) {
  return client.get("/reports/categories", { params });
}

export function getPaymentMethodsReport(params = {}) {
  return client.get("/reports/payment-methods", { params });
}

export function getOverviewReport(params = {}) {
  return client.get("/reports/overview", { params });
}
