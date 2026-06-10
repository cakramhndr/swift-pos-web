import { useState, useCallback } from "react";
import { getActivityLogs } from "@/api/activityLogs";

export default function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getActivityLogs(params);
      const body = res.data;
      const items = body.data ?? body;
      setLogs(Array.isArray(items) ? items : (items?.data ?? []));
      setMeta({
        current_page: body.meta?.current_page ?? body.current_page ?? 1,
        last_page: body.meta?.last_page ?? body.last_page ?? 1,
        per_page: body.meta?.per_page ?? body.per_page ?? 20,
        total:
          body.meta?.total ??
          body.total ??
          (Array.isArray(items) ? items.length : 0),
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, loading, meta, fetchLogs };
}
