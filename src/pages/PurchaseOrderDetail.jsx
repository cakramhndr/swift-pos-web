import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import usePurchaseOrders from "@/hooks/usePurchaseOrders";
import {
  ArrowLeft,
  Package,
  Printer,
  Download,
  XCircle,
  Truck,
  FileText,
  Building2,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { formatRp, formatDateShort } from "@/lib/purchaseUtils";
import client from "@/api/client";

// ── Status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const variants = {
    draft: {
      label: "Draft",
      classes:
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    },
    pending: {
      label: "Pending",
      classes:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/50",
    },
    partial: {
      label: "Partial",
      classes:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50",
    },
    completed: {
      label: "Completed",
      classes:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50",
    },
    cancelled: {
      label: "Cancelled",
      classes:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50",
    },
  };
  const v = variants[status?.toLowerCase()] || variants.draft;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${v.classes}`}
    >
      {v.label}
    </span>
  );
}

// ── Timeline step ─────────────────────────────────────────────────────
function TimelineStep({ status, active, completed, isLast }) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
            completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : active
                ? "border-accent text-accent bg-accent-light dark:bg-accent/20"
                : "border-gray-300 dark:border-gray-600 text-gray-400"
          }`}
        >
          {completed ? (
            <CheckCircle className="h-4 w-4" />
          ) : active ? (
            <Clock className="h-4 w-4" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          )}
        </div>
        <span
          className={`text-[10px] font-medium mt-1 whitespace-nowrap ${completed ? "text-emerald-600 dark:text-emerald-400" : active ? "text-accent font-semibold" : "text-gray-400"}`}
        >
          {status}
        </span>
      </div>
      {!isLast && (
        <div
          className={`w-12 sm:w-16 h-0.5 mx-1 sm:mx-2 ${completed ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
        />
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
            />
          ))}
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Receive Stock Modal ───────────────────────────────────────────────
function ReceiveStockModal({ order, onClose, onReceive }) {
  const [items, setItems] = useState(
    (order?.items || []).map((item) => ({
      purchase_order_item_id: item.id,
      product_name: item.product?.name || "Unknown",
      quantity_ordered: item.quantity_ordered,
      quantity_received: item.quantity_received || 0,
      quantity_to_receive: Math.max(
        0,
        (item.quantity_ordered || 0) - (item.quantity_received || 0),
      ),
    })),
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity_to_receive: Math.max(
                0,
                Math.min(value, item.quantity_ordered - item.quantity_received),
              ),
            }
          : item,
      ),
    );
  };

  const handleSubmit = async () => {
    const toReceive = items.filter((item) => item.quantity_to_receive > 0);
    if (toReceive.length === 0) {
      toast.error("Enter at least one item to receive");
      return;
    }
    setSubmitting(true);
    await onReceive(
      order.id,
      toReceive.map((item) => ({
        purchase_order_item_id: item.purchase_order_item_id,
        quantity_received: item.quantity_to_receive,
      })),
    );
    setSubmitting(false);
    onClose();
  };

  const totalToReceive = items.reduce(
    (s, item) => s + item.quantity_to_receive,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div
          className="h-1 rounded-t-3xl -mt-6 -mx-6 mb-6"
          style={{
            background:
              "linear-gradient(to right, var(--color-accent), var(--color-accent-light), var(--color-accent-hover))",
          }}
        />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Receive Stock
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                PO: {order?.po_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const remaining = item.quantity_ordered - item.quantity_received;
            return (
              <div
                key={item.purchase_order_item_id}
                className="rounded-2xl border border-[#ececf2] dark:border-gray-700 p-4"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {item.product_name}
                </p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Ordered</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.quantity_ordered}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Received</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.quantity_received}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Remaining</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {remaining}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
                    Qty to Receive
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={remaining}
                    value={item.quantity_to_receive}
                    onChange={(e) => handleChange(idx, Number(e.target.value))}
                    className="w-full rounded-xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">
            Total receiving:{" "}
            <span className="font-bold text-accent">
              {totalToReceive} items
            </span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-[#ececf2] dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              {submitting ? "Receiving..." : "Receive Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Purchase Order Detail Page ───────────────────────────────────
export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, receive, loading } = usePurchaseOrders();

  const [order, setOrder] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getById(id);
      if (data) setOrder(data);
    })();
  }, [id, getById]);

  const handleReceive = async (orderId, items) => {
    const updated = await receive(orderId, { items });
    if (updated) setOrder(updated);
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this purchase order?"))
      return;
    const updated = await getById(id);
    if (updated) {
      setOrder({ ...updated, status: "cancelled" });
    }
    toast.success("Purchase order cancelled");
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    try {
      const response = await client.get(`/purchase-orders/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${order?.po_number || "PO"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF");
    }
  };

  if (loading && !order) return <DetailSkeleton />;
  if (!order)
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-500">
          Purchase order not found
        </p>
        <button
          onClick={() => navigate("/purchase-orders")}
          className="mt-4 flex items-center gap-2 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Purchase Orders
        </button>
      </div>
    );

  const statusTimeline = ["Draft", "Pending", "Partial", "Completed"];
  const currentStatusIdx = statusTimeline.findIndex(
    (s) => s.toLowerCase() === order.status,
  );
  const isCancelled = order.status === "cancelled";
  const canReceive = !["completed", "cancelled"].includes(order.status);

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/purchase-orders")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {order.po_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Supplier: {order.supplier?.name || "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canReceive && (
            <button
              onClick={() => setShowReceiveModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
              }}
            >
              <Truck className="h-4 w-4" /> Receive Stock
            </button>
          )}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent hover:bg-accent-light dark:hover:bg-accent/30"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent dark:text-accent hover:bg-accent-light dark:hover:bg-accent/30"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          {!["completed", "cancelled"].includes(order.status) && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-2xl border border-red-300 dark:border-red-700/50 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <XCircle className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* ═══ Status Timeline & Info Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timeline + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Status Timeline
            </h3>
            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Order Cancelled
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400">
                    This purchase order has been cancelled
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between overflow-x-auto py-2">
                {statusTimeline.map((status, idx) => (
                  <TimelineStep
                    key={status}
                    status={status}
                    active={idx === currentStatusIdx}
                    completed={idx < currentStatusIdx}
                    isLast={idx === statusTimeline.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Order Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Qty Ordered
                    </th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Qty Received
                    </th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Remaining
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Unit Cost
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(order.items || []).map((item) => {
                    const remaining =
                      (item.quantity_ordered || 0) -
                      (item.quantity_received || 0);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.product?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                          {item.quantity_ordered}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.quantity_received || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-semibold ${remaining > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-500"}`}
                          >
                            {remaining}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                          {formatRp(item.unit_cost)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatRp(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-accent" />
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Supplier</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-400" />{" "}
                  {order.supplier?.name || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Order Date</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />{" "}
                  {formatDateShort(order.order_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Expected Date</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />{" "}
                  {formatDateShort(order.expected_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Created By</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />{" "}
                  {order.created_by_user?.name || "-"}
                </span>
              </div>
              {order.notes && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <DollarSign className="h-4 w-4 text-accent" />
              Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatRp(order.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Discount</span>
                <span className="font-semibold text-red-500">
                  -{formatRp(order.discount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Tax</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  +{formatRp(order.tax)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-lg font-bold text-accent">
                  {formatRp(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {showReceiveModal && (
        <ReceiveStockModal
          order={order}
          onClose={() => setShowReceiveModal(false)}
          onReceive={handleReceive}
        />
      )}
    </div>
  );
}
