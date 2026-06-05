import { useState, useEffect } from "react";
import { getDashboard } from "@/api/dashboard";

/**
 * useDashboard — fetches dashboard data on mount.
 *
 * Returns:
 *   { data, loading, error, refetch }
 *
 * The `data` object contains fields consumed by Dashboard.jsx:
 *   today_sales, today_transactions, today_customers,
 *   total_products, total_customers, total_products_sold,
 *   low_stock_products, out_of_stock_products, low_stock_items,
 *   sales_change, yesterday_sales, yesterday_sales_percent,
 *   transactions_change, yesterday_transactions, yesterday_transactions_percent,
 *   customers_change, yesterday_customers, yesterday_customers_percent,
 *   sales_chart[] (→ mapped from weekly_sales with { day, total }),
 *   top_products[] (→ { name, sold }),
 *   recent_transactions[] (→ { id, invoice_number, customer_name, total, date, status }),
 *   chart_label, chart_period_label
 */
export default function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getDashboard();
      const body = res.data;

      // Support both flat data and nested { data } key
      const raw = body.data ?? body;

      // Normalise backend fields to what Dashboard.jsx expects
      const normalized = {
        ...raw,

        // Map weekly_sales → sales_chart (shape { day, total })
        sales_chart: Array.isArray(raw.weekly_sales) ? raw.weekly_sales : [],

        // Keep today_revenue as today_sales for backwards compat
        today_sales: raw.today_revenue ?? 0,

        // top_products already has { name, sold }
        top_products: Array.isArray(raw.top_products) ? raw.top_products : [],

        recent_transactions: Array.isArray(raw.recent_transactions)
          ? raw.recent_transactions
          : [],

        low_stock_items: Array.isArray(raw.low_stock_items)
          ? raw.low_stock_items
          : [],
      };

      // If the old api.js `getDashboardApi` was returning something else,
      // we still handle fallback: if raw has a nested sales_chart already use it
      setData(normalized);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}