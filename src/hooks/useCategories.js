import { useState, useCallback, useRef } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories";

export default function useCategories({ perPage = 15 } = {}) {
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

        const res = await getCategories(params);
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
            "Failed to load categories";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [perPage],
  );

  const create = useCallback(
    async (payload) => {
      const res = await createCategory(payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  const update = useCallback(
    async (id, payload) => {
      const res = await updateCategory(id, payload);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  const remove = useCallback(
    async (id) => {
      const res = await deleteCategory(id);
      await refetch();
      return res.data;
    },
    [refetch],
  );

  const setSearch = useCallback(
    (search) => {
      filtersRef.current.search = search;
      filtersRef.current.page = 1;
      refetch({ search, page: 1 });
    },
    [refetch],
  );

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
    update,
    remove,
    setSearch,
    setPage,
  };
}
