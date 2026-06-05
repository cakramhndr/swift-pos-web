import client from "./client";

/**
 * Transactions API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 *   For createTransaction, data includes full receipt: { transaction, items, customer }
 */

export function getTransactions(params = {}) {
  return client.get("/transactions", { params });
}

export function getTransactionById(id) {
  return client.get(`/transactions/${id}`);
}

export function createTransaction(data) {
  return client.post("/transactions", data);
}