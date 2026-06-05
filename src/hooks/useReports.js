import { useState, useCallback, useRef } from "react";
import {
  getSalesReport,
  getProductsReport,
  getCustomersReport,
  getTrendsReport,
  getCategoriesReport,
  getPaymentMethodsReport,
  getOverviewReport,
} from "@/api/reports";

/**
 * useReports — manages all report data with date range filtering.
 *
 * Fetches 7 endpoints in parallel on fetchAll():
 *  - sales, products, trends, categories, payment-methods, overview, customers
 * Plus a fetchTrends() that accepts group_by for the chart dropdown.
 */
export default function useReports() {
  // ─── State per endpoint ────────────────────────────────────────────
  const [sales, setSales] = useState({
    total_revenue: 0,
    total_transactions: 0,
    total_items_sold: 0,
    avg_order_value: 0,
    hpp: 0,
    profit: 0,
    transactions: [],
  });
  const [products, setProducts] = useState({
    products_sold: 0,
    top_products: [],
  });
  const [trends, setTrends] = useState({ revenue_trend: [] });
  const [categories, setCategories] = useState({ categories: [] });
  const [paymentMethods, setPaymentMethods] = useState({
    payment_methods: [],
  });
  const [overview, setOverview] = useState({
    insights: {
      revenue_growth: 0,
      top_product: { name: "", percentage: 0 },
      top_payment_method: "",
      highest_margin_product: { name: "", margin_percentage: 0 },
    },
    customer_analytics: {
      total_customers: 0,
      new_customers: 0,
      repeat_customers: 0,
      repeat_rate: 0,
      growth_total: 0,
      growth_new: 0,
      growth_repeat: 0,
    },
    transaction_summary: {
      total_transactions: 0,
      completed: 0,
      cancelled: 0,
      total_items: 0,
      completion_rate: 0,
    },
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRangeState] = useState({
    date_from: "",
    date_to: "",
  });

  const abortRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────
  const parseBody = (res) => res.data.data ?? res.data;

  const formatRupiah = (value) =>
    value == null
      ? "Rp 0"
      : "Rp " + Number(value).toLocaleString("id-ID");

  const formatGrowth = (pct) => {
    const num = Number(pct) || 0;
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  // ── Generic fetch for all endpoints ──────────────────────────────
  const fetchAll = useCallback(
    async (startDate, endDate) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      try {
        const [
          salesRes,
          productsRes,
          trendsRes,
          categoriesRes,
          paymentMethodsRes,
          overviewRes,
          customersRes,
        ] = await Promise.all([
          getSalesReport(params),
          getProductsReport(params),
          getTrendsReport(params),
          getCategoriesReport(params),
          getPaymentMethodsReport(params),
          getOverviewReport(params),
          getCustomersReport(params),
        ]);

        // Sales
        const sBody = parseBody(salesRes);
        setSales({
          total_revenue: sBody.total_revenue ?? 0,
          total_transactions: sBody.total_transactions ?? 0,
          total_items_sold: sBody.total_items_sold ?? 0,
          avg_order_value: sBody.avg_order_value ?? 0,
          hpp: sBody.hpp ?? 0,
          profit: sBody.profit ?? 0,
          transactions: Array.isArray(sBody.transactions)
            ? sBody.transactions
            : [],
        });

        // Products
        const pBody = parseBody(productsRes);
        setProducts({
          products_sold: pBody.products_sold ?? 0,
          top_products: Array.isArray(pBody.top_products)
            ? pBody.top_products
            : [],
        });

        // Trends
        const tBody = parseBody(trendsRes);
        setTrends({
          revenue_trend: Array.isArray(tBody.revenue_trend)
            ? tBody.revenue_trend
            : [],
        });

        // Categories
        const cBody = parseBody(categoriesRes);
        setCategories({
          categories: Array.isArray(cBody.categories) ? cBody.categories : [],
        });

        // Payment Methods
        const pmBody = parseBody(paymentMethodsRes);
        setPaymentMethods({
          payment_methods: Array.isArray(pmBody.payment_methods)
            ? pmBody.payment_methods
            : [],
        });

        // Overview
        const oBody = parseBody(overviewRes);
        setOverview({
          insights: oBody.insights ?? {
            revenue_growth: 0,
            top_product: { name: "", percentage: 0 },
            top_payment_method: "",
            highest_margin_product: { name: "", margin_percentage: 0 },
          },
          customer_analytics: oBody.customer_analytics ?? {
            total_customers: 0,
            new_customers: 0,
            repeat_customers: 0,
            repeat_rate: 0,
            growth_total: 0,
            growth_new: 0,
            growth_repeat: 0,
          },
          transaction_summary: oBody.transaction_summary ?? {
            total_transactions: 0,
            completed: 0,
            cancelled: 0,
            total_items: 0,
            completion_rate: 0,
          },
        });

        // Customers
        const custBody = parseBody(customersRes);
        if (Array.isArray(custBody)) {
          setCustomers(custBody);
        } else if (custBody?.data && Array.isArray(custBody.data)) {
          setCustomers(custBody.data);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        if (err.code !== "ERR_CANCELED" && err.name !== "CanceledError") {
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
    [],
  );

  // ── Fetch trends with group_by ──────────────────────────────────────
  const fetchTrends = useCallback(
    async (startDate, endDate, groupBy = "day") => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (groupBy) params.group_by = groupBy;

      try {
        const res = await getTrendsReport(params);
        const body = parseBody(res);
        setTrends({
          revenue_trend: Array.isArray(body.revenue_trend)
            ? body.revenue_trend
            : [],
        });
      } catch (err) {
        if (err.code !== "ERR_CANCELED" && err.name !== "CanceledError") {
          console.error("Failed to fetch trends", err);
        }
      }
    },
    [],
  );

  // ── Date range setter ───────────────────────────────────────────────
  const setDateRange = useCallback(
    (date_from, date_to) => {
      setDateRangeState({
        date_from: date_from || "",
        date_to: date_to || "",
      });
    },
    [],
  );

  return {
    sales,
    products,
    trends,
    categories,
    paymentMethods,
    overview,
    customers,
    loading,
    error,
    dateRange,
    setDateRange,
    fetchAll,
    fetchTrends,
    formatRupiah,
    formatGrowth,
  };
}