import { useState, useCallback, useRef } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/api/customers";

/**
 * useCustomers — manages customer list state with search, pagination, and CRUD.
 *
 * Calls `refetch()` on mount to trigger the initial load.
 *
 * @param {Object} options
 * @param {number} options.perPage - items per page (default 15)
 * @returns {{ data, loading, error, meta, refetch, create, update, remove, setSearch, setPage }}
 */
export default function useCustomers({ perPage = 15 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  });

  const filtersRef = useRef({ page: 1, search: "" });
  const abortRef = useRef(null);

  // ── Fetch customers ────────────────────────────────────────────────
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

        const res = await getCustomers(params);
        const body = res.data.data ?? res.data;

        if (Array.isArray(body)) {
          setData(body);
          setMeta((prev) => ({
            ...prev,
            current_page: 1,
            last_page: 1,
            total: body.length,
          }));
        } else {
          setData(body.data ?? []);
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
            "Failed to load customers";
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
      const res = await createCustomer({
        name: payload.name.trim(),
        phone: payload.phone?.replace(/\D/g, "") ?? null,
        email: payload.email || null,
        address: payload.address || null,
      });
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Update ─────────────────────────────────────────────────────────
  const _update = useCallback(
    async (id, payload) => {
      const res = await updateCustomer(id, payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Remove ─────────────────────────────────────────────────────────
  const remove = useCallback(
    async (id) => {
      const res = await deleteCustomer(id);
      await refetch();
      return res.data;
    },
    [refetch],
  );

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

  return {
    data,
    loading,
    error,
    meta,
    refetch,
    create,
    update: _update,
    remove,
    setSearch,
    setPage,
  };
}