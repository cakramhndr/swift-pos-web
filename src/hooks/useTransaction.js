import { useState, useCallback, useRef } from "react";
import { getTransactions, createTransaction } from "@/api/transactions";

/**
 * useTransaction — manages transaction list state with search, date range,
 * pagination, and transaction creation.
 *
 * @param {Object} options
 * @param {number} options.perPage - items per page (default 15)
 * @returns {{ transactions, loading, error, meta, refetch, setSearch, setDateRange, setPage, createTransaction }}
 */
export default function useTransaction({ perPage = 15 } = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  });

  const filtersRef = useRef({ page: 1, search: "", date_from: "", date_to: "" });
  const abortRef = useRef(null);

  // ── Fetch transactions ────────────────────────────────────────────
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
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;

        const res = await getTransactions(params);
        const body = res.data.data ?? res.data;

        if (Array.isArray(body)) {
          setTransactions(body);
          setMeta((prev) => ({
            ...prev,
            current_page: 1,
            last_page: 1,
            total: body.length,
          }));
        } else {
          setTransactions(body.data ?? []);
          setMeta({
            current_page: body.current_page ?? filters.page,
            last_page: body.last_page ?? 1,
            per_page: body.per_page ?? perPage,
            total: body.total ?? 0,
          });
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load transactions";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [perPage],
  );

  // ── Create transaction ────────────────────────────────────────────
  const create = useCallback(
    async (payload) => {
      const res = await createTransaction(payload);
      await refetch();
      // Return full receipt data from response
      return res.data;
    },
    [refetch],
  );

  // ── Search helper ─────────────────────────────────────────────────
  const setSearch = useCallback(
    (search) => {
      filtersRef.current.search = search;
      filtersRef.current.page = 1;
      refetch({ search, page: 1 });
    },
    [refetch],
  );

  // ── Date range helper ─────────────────────────────────────────────
  const setDateRange = useCallback(
    (date_from, date_to) => {
      filtersRef.current.date_from = date_from || "";
      filtersRef.current.date_to = date_to || "";
      filtersRef.current.page = 1;
      refetch({ date_from: date_from || "", date_to: date_to || "", page: 1 });
    },
    [refetch],
  );

  // ── Page helper ───────────────────────────────────────────────────
  const setPage = useCallback(
    (page) => {
      filtersRef.current.page = page;
      refetch({ page });
    },
    [refetch],
  );

  return {
    transactions,
    loading,
    error,
    meta,
    refetch,
    setSearch,
    setDateRange,
    setPage,
    createTransaction: create,
  };
}