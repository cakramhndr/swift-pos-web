import client from "./client";

export function getActivityLogs(params = {}) {
  return client.get("/activity-logs", { params });
}
