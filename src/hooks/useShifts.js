import { useState, useCallback } from "react";
import {
  openShift,
  getCurrentShift,
  closeShift,
  getShiftHistory,
  getOpenShifts,
} from "@/api/shifts";

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

  const [shiftHistory, setShiftHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMeta, setHistoryMeta] = useState(null);

  const [openShifts, setOpenShifts] = useState([]);
  const [openShiftsLoading, setOpenShiftsLoading] = useState(false);

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

  const handleCloseShift = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const res = await closeShift(data);
      const body = res.data?.data ?? res.data;

      setCurrentShift(null);

      return { success: true, data: body };
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to close shift";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShiftHistory = useCallback(async (params = {}) => {
    setHistoryLoading(true);

    try {
      const res = await getShiftHistory(params);
      const body = res.data;

      setShiftHistory(body.data ?? []);
      setHistoryMeta(body.meta ?? null);

      return { success: true, data: body.data, meta: body.meta };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load shift history";
      setShiftHistory([]);
      setHistoryMeta(null);
      return { success: false, message };
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /**
   * Fetch all currently OPEN shifts across the store.
   * Used by the monitoring widget in CashRegister.
   */
  const fetchOpenShifts = useCallback(async () => {
    setOpenShiftsLoading(true);

    try {
      const res = await getOpenShifts();
      const body = res.data;

      setOpenShifts(body.data ?? []);

      return { success: true, data: body.data };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load open shifts";
      setOpenShifts([]);
      return { success: false, message };
    } finally {
      setOpenShiftsLoading(false);
    }
  }, []);

  return {
    currentShift,
    loading,
    error,
    shiftHistory,
    historyLoading,
    historyMeta,
    openShifts,
    openShiftsLoading,
    fetchCurrentShift,
    handleOpenShift,
    handleCloseShift,
    fetchShiftHistory,
    fetchOpenShifts,
  };
}
