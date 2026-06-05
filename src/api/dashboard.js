import client from "./client";

/**
 * Dashboard API — pure axios calls.
 *
 * Response shape from Laravel:
 *   { success, message, data: { today_revenue, today_transactions, ... } }
 */

export function getDashboard(params = {}) {
  return client.get("/dashboard", { params });
}