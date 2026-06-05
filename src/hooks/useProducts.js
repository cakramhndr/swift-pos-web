import { useState, useCallback, useRef } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/products";

/**
 * useProducts — manages product list state with search, pagination, and CRUD.
 *
 * Call `refetch()` on mount to trigger the initial load.
 *
 * @param {Object} options
 * @param {number} options.perPage - items per page (default 15)
 * @returns {{ data, loading, error, meta, refetch, create, update, remove, setSearch, setPage, setCategory }}
 */
export default function useProducts({ perPage = 15 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  });

  const filtersRef = useRef({ page: 1, search: "", category: "" });
  const abortRef = useRef(null);

  // ── Fetch products ──────────────────────────────────────────────────
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
        if (filters.category && filters.category !== "All Categories") {
          params.category = filters.category;
        }

        const res = await getProducts(params);
        const body = res.data;

        if (body.data && Array.isArray(body.data) && body.meta) {
          // Laravel paginated resource collection: { data: [...], meta: { current_page, last_page, per_page, total } }
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
          // Handle { data: [...] } without meta
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
            "Failed to load products";
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
      const res = await createProduct(payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Update ─────────────────────────────────────────────────────────
  const update = useCallback(
    async (id, payload) => {
      const res = await updateProduct(id, payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  // ── Remove ─────────────────────────────────────────────────────────
  const remove = useCallback(
    async (id) => {
      const res = await deleteProduct(id);
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

  // ── Category filter helper ─────────────────────────────────────────
  const setCategory = useCallback(
    (category) => {
      filtersRef.current.category = category;
      filtersRef.current.page = 1;
      refetch({ category, page: 1 });
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
    setSearch,
    setPage,
    setCategory,
  };
}