import { useState, useCallback } from "react";
import { openShift, getCurrentShift } from "@/api/shifts";

/**
 * useShifts — manages shift state (current shift + open shift).
 *
 * Responsibilities:
 *   - API calls
 *   - state updates
 *   - loading handling
 *   - error handling
 *
 * No business rules. No side effects on transactions.
 */
export default function useShifts() {
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentShift = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getCurrentShift();
      const body = res.data?.data ?? res.data;

      // The API returns { success, data: null } when no active shift
      if (body && body.id) {
        setCurrentShift(body);
      } else {
        setCurrentShift(null);
      }
    } catch (err) {
      setCurrentShift(null);
      setError(err?.response?.data?.message || "Failed to load current shift");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenShift = useCallback(async (openingCash) => {
    setLoading(true);
    setError(null);

    try {
      const res = await openShift({ opening_cash: openingCash });
      const body = res.data?.data ?? res.data;

      setCurrentShift(body);

      return { success: true, data: body };
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to open shift";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentShift,
    loading,
    error,
    fetchCurrentShift,
    handleOpenShift,
  };
}
