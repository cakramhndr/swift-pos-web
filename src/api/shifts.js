import client from "./client";

/**
 * Shifts API — pure axios calls, no business logic.
 *
 * Response shape from Laravel:
 *   { success, data, message, meta: { current_page, last_page, per_page, total } }
 */

export function openShift(data) {
  return client.post("/shifts/open", data);
}

export function getCurrentShift() {
  return client.get("/shifts/current");
}

export function closeShift(data) {
  return client.post("/shifts/close", data);
}

export function getShiftHistory(params = {}) {
  return client.get("/shifts/history", { params });
}

export function getOpenShifts() {
  return client.get("/shifts/open");
}
