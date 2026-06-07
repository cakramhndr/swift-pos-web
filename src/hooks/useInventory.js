import { useState, useCallback, useRef } from "react";
import {
  getInventory,
  getInventoryLogs,
  getSummary,
  adjustStock,
} from "@/api/inventory";

/**
 * useInventory — manages inventory list state with search, pagination,
 * low-stock filtering, summary, logs, and stock adjustments.
 *
 * @param {Object} options
 * @param {number} options.perPage - items per page (default 15)
 * @returns {{ data, loading, error, meta, summary, logs, refetch, adjust, setSearch, setPage, setLowStockOnly }}
 */
export default function useInventory({ perPage = 15 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  });
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);

  const filtersRef = useRef({ page: 1, search: "", low_stock: "" });
  const abortRef = useRef(null);

  // ── Fetch inventory (calls GET /api/products) ───────────────────────
  const refetch = useCallback(
    async (overrides = {}) => {
      const filters = { ...filtersRef.current, ...overrides };
      filtersRef.current = filters;

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = { page: filters.page, per_page: perPage };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.low_stock) params.low_stock = filters.low_stock;

        const res = await getInventory(params);
        // Laravel paginated resource: { data: [...], meta: { current_page, last_page, per_page, total }, links: {...} }
        const responseData = res.data;
        const items = responseData.data ?? responseData;

        if (Array.isArray(items)) {
          setData(items);
          setMeta({
            current_page: responseData.meta?.current_page ?? filters.page,
            last_page: responseData.meta?.last_page ?? 1,
            per_page: responseData.meta?.per_page ?? perPage,
            total: responseData.meta?.total ?? items.length,
          });
        } else if (items?.data) {
          // Nested pagination: items.data is the array
          setData(items.data);
          setMeta({
            current_page: items.current_page ?? filters.page,
            last_page: items.last_page ?? 1,
            per_page: items.per_page ?? perPage,
            total: items.total ?? 0,
          });
        } else {
          setData([]);
          setMeta((prev) => ({ ...prev, total: 0 }));
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load inventory";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [perPage],
  );

  // ── Fetch summary (independent, not tied to filters) ───────────────
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getSummary();
      setSummary(res.data.data ?? res.data);
    } catch {
      // silently fail — summary is optional
    }
  }, []);

  const [logsMeta, setLogsMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  // ── Fetch logs (independent) ───────────────────────────────────────
  const fetchLogs = useCallback(
    async (params = {}) => {
      try {
        const res = await getInventoryLogs(params);
        const body = res.data;
        const items = body.data ?? body;
        setLogs(Array.isArray(items) ? items : items?.data ?? []);
        setLogsMeta({
          current_page: body.meta?.current_page ?? body.current_page ?? 1,
          last_page: body.meta?.last_page ?? body.last_page ?? 1,
          per_page: body.meta?.per_page ?? body.per_page ?? 20,
          total: body.meta?.total ?? body.total ?? (Array.isArray(items) ? items.length : 0),
        });
      } catch {
        // silently fail — logs are optional
      }
    },
    [],
  );

  // ── Adjust stock ───────────────────────────────────────────────────
  const adjust = useCallback(
    async (payload) => {
      const res = await adjustStock(payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Search helper ──────────────────────────────────────────────────
  const setSearch = useCallback(
    (search) => {
      filtersRef.current.search = search;
      filtersRef.current.page = 1;
      refetch({ search, page: 1 });
    },
    [refetch],
  );

  // ── Page helper ────────────────────────────────────────────────────
  const setPage = useCallback(
    (page) => {
      filtersRef.current.page = page;
      refetch({ page });
    },
    [refetch],
  );

  // ── Low stock only toggle ─────────────────────────────────────────
  const setLowStockOnly = useCallback(
    (enabled) => {
      filtersRef.current.low_stock = enabled ? "1" : "";
      filtersRef.current.page = 1;
      refetch({ low_stock: enabled ? "1" : "", page: 1 });
    },
    [refetch],
  );

  return {
    data,
    loading,
    error,
    meta,
    summary,
    logs,
    logsMeta,
    refetch,
    adjust,
    setSearch,
    setPage,
    setLowStockOnly,
    fetchSummary,
    fetchLogs,
  };
}