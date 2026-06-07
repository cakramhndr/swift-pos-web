import { useState, useCallback, useRef } from "react";
import {
  getStockOpnames,
  createStockOpname,
  updateStockOpname,
  deleteStockOpname,
  startStockOpname,
  completeStockOpname,
  cancelStockOpname,
} from "@/api/stockOpnames";

/**
 * useStockOpnames — manages stock opname list state with search, pagination, and CRUD.
 *
 * Call `refetch()` on mount to trigger the initial load.
 *
 * @param {Object} options
 * @param {number} options.perPage - items per page (default 15)
 * @returns {{ data, loading, error, meta, refetch, create, update, remove, start, complete, cancel, setSearch, setPage, setStatus, setDateRange }}
 */
export default function useStockOpnames({ perPage = 15 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  });

  const filtersRef = useRef({ page: 1, search: "", status: "", start_date: "", end_date: "" });
  const abortRef = useRef(null);

  // ── Fetch stock opnames ──────────────────────────────────────────────
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
        if (filters.status) params.status = filters.status;
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date) params.end_date = filters.end_date;

        const res = await getStockOpnames(params);
        const body = res.data;

        if (body.data && Array.isArray(body.data) && body.meta) {
          setData(body.data);
          setMeta({
            current_page: body.meta.current_page ?? filters.page,
            last_page: body.meta.last_page ?? 1,
            per_page: body.meta.per_page ?? perPage,
            total: body.meta.total ?? 0,
          });
        } else if (Array.isArray(body)) {
          setData(body);
          setMeta((prev) => ({
            ...prev,
            current_page: 1,
            last_page: 1,
            total: body.length,
          }));
        } else if (Array.isArray(body.data)) {
          setData(body.data);
          setMeta((prev) => ({
            ...prev,
            current_page: 1,
            last_page: 1,
            total: body.data.length,
          }));
        } else {
          setData([]);
          setMeta((prev) => ({ ...prev, last_page: 1, total: 0 }));
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load stock opnames";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [perPage],
  );

  // ── Create ─────────────────────────────────────────────────────────
  const create = useCallback(
    async (payload) => {
      const res = await createStockOpname(payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Update ─────────────────────────────────────────────────────────
  const update = useCallback(
    async (id, payload) => {
      const res = await updateStockOpname(id, payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Remove ─────────────────────────────────────────────────────────
  const remove = useCallback(
    async (id) => {
      const res = await deleteStockOpname(id);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Start ──────────────────────────────────────────────────────────
  const start = useCallback(async (id) => {
    const res = await startStockOpname(id);
    return res.data;
  }, []);

  // ── Complete ───────────────────────────────────────────────────────
  const complete = useCallback(async (id) => {
    const res = await completeStockOpname(id);
    return res.data;
  }, []);

  // ── Cancel ─────────────────────────────────────────────────────────
  const cancel = useCallback(async (id) => {
    const res = await cancelStockOpname(id);
    return res.data;
  }, []);

  // ── Search helper (sets search + resets page) ──────────────────────
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

  // ── Status filter helper ───────────────────────────────────────────
  const setStatus = useCallback(
    (status) => {
      filtersRef.current.status = status;
      filtersRef.current.page = 1;
      refetch({ status, page: 1 });
    },
    [refetch],
  );

  // ── Date range filter helper ───────────────────────────────────────
  const setDateRange = useCallback(
    (start_date, end_date) => {
      filtersRef.current.start_date = start_date;
      filtersRef.current.end_date = end_date;
      filtersRef.current.page = 1;
      refetch({ start_date, end_date, page: 1 });
    },
    [refetch],
  );

  return {
    data,
    loading,
    error,
    meta,
    refetch,
    create,
    update,
    remove,
    start,
    complete,
    cancel,
    setSearch,
    setPage,
    setStatus,
    setDateRange,
  };
}