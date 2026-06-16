import client from "./client";

/**
 * Sales Returns API — pure axios calls, no business logic.
 */

export function getSalesReturns(params = {}) {
  return client.get("/sales-returns", { params });
}

export function getSalesReturnById(id) {
  return client.get(`/sales-returns/${id}`);
}

export function createSalesReturn(data) {
  return client.post("/sales-returns", data);
}
