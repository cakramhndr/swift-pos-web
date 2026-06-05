import { useState, useCallback, useRef } from "react";
import {
  getSalesReport,
  getProductsReport,
  getCustomersReport,
} from "@/api/reports";

const formatIDR = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

/**
 * useReports — manages sales, products, and customers reports with date range filtering.
 *
 * @returns {{ sales, products, customers, loading, error, dateRange, setDateRange, refetch, formatIDR }}
 */
export default function useReports() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRangeState] = useState({
    date_from: "",
    date_to: "",
  });

  const abortRef = useRef(null);

  // ── Fetch all reports ─────────────────────────────────────────────
  const refetch = useCallback(
    async (overrides = {}) => {
      const filters = { ...dateRange, ...overrides };

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;

        const [salesRes, productsRes, customersRes] = await Promise.all([
          getSalesReport(params),
          getProductsReport(params),
          getCustomersReport(params),
        ]);

        const salesData = salesRes.data.data ?? salesRes.data;
        const productsData = productsRes.data.data ?? productsRes.data;
        const customersData = customersRes.data.data ?? customersRes.data;

        setSales(Array.isArray(salesData) ? salesData : salesData?.data ?? []);
        setProducts(
          Array.isArray(productsData) ? productsData : productsData?.data ?? [],
        );
        setCustomers(
          Array.isArray(customersData)
            ? customersData
            : customersData?.data ?? [],
        );
      } catch (err) {
        if (err.name !== "CanceledError") {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load reports";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [dateRange],
  );

  // ── Date range setter ─────────────────────────────────────────────
  const setDateRange = useCallback(
    (date_from, date_to) => {
      setDateRangeState({ date_from: date_from || "", date_to: date_to || "" });
    },
    [],
  );

  return {
    sales,
    products,
    customers,
    loading,
    error,
    dateRange,
    setDateRange,
    refetch,
    formatIDR,
  };
}