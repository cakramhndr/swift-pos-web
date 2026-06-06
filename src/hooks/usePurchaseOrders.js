import { useState, useCallback } from "react";
import { toast } from "sonner";
import * as api from "@/api/purchaseOrders";

export default function usePurchaseOrders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPurchaseOrders(params);
      const body = res.data;
      const list = body.data || body;
      setData(Array.isArray(list) ? list : []);
      if (body.meta) setMeta(body.meta);
      return body;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch purchase orders";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPurchaseOrderById(id);
      const body = res.data;
      const order = body.data || body;
      return order;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch purchase order";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.createPurchaseOrder(data);
      toast.success(res.data?.message || "Purchase order created ✅");
      return res.data?.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create purchase order";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const res = await api.updatePurchaseOrder(id, data);
      toast.success(res.data?.message || "Purchase order updated ✅");
      return res.data?.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update purchase order";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setLoading(true);
    try {
      await api.deletePurchaseOrder(id);
      toast.success("Purchase order deleted 🗑️");
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete purchase order";
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const receive = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const res = await api.receivePurchaseOrder(id, data);
      toast.success(res.data?.message || "Stock received successfully ✅");
      return res.data?.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to receive stock";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.getPurchaseAnalytics(params);
      return res.data?.data || res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch analytics";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    meta,
    fetchAll,
    getById,
    create,
    update,
    remove,
    receive,
    getAnalytics,
  };
}