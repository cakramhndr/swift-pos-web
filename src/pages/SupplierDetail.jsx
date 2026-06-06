import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupplierById } from "@/api/suppliers";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  Clock,
  Calendar,
  Package,
  FileText,
  User,
} from "lucide-react";
import { formatRp, formatDateShort } from "@/lib/purchaseUtils";
import { StatusBadge } from "./PurchaseOrders";

// ── Skeleton ──────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />)}
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded" />)}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-accent/60 dark:hover:border-accent/40 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// ── Main Supplier Detail Page ─────────────────────────────────────────
export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getSupplierById(id);
        setSupplier(res.data?.data || res.data);
      } catch {
        setSupplier(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!supplier) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-sm font-medium text-gray-500">Supplier not found</p>
      <button onClick={() => navigate("/suppliers")} className="mt-4 flex items-center gap-2 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Suppliers
      </button>
    </div>
  );

  const stats = supplier.stats || {};
  const purchaseOrders = supplier.purchase_orders || [];
  const topProducts = supplier.top_products || [];

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/suppliers")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-accent hover:bg-accent-light dark:hover:bg-accent/20 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))" }}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{supplier.name}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              {supplier.city ? `${supplier.city} · ` : ""}
              {supplier.is_active ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
              ) : (
                <span className="text-gray-400 font-medium">Inactive</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Summary Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Purchase Orders"
          value={stats.total_purchase_orders ?? 0}
          iconBg="bg-accent-light dark:bg-accent/20"
          iconColor="text-accent"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spending"
          value={formatRp(stats.total_spending)}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="Outstanding PO"
          value={stats.outstanding_po ?? 0}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          icon={Calendar}
          label="Last Purchase Date"
          value={stats.last_purchase_date ? formatDateShort(stats.last_purchase_date) : "-"}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* ═══ Main Content Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Purchase History + Top Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase History */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Purchase History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">PO Number</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No purchase orders yet</p>
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map((po) => (
                      <tr
                        key={po.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer group"
                        onClick={() => navigate(`/purchase-orders/${po.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-accent group-hover:underline">{po.po_number}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDateShort(po.order_date)}</td>
                        <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{formatRp(po.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Purchased Products */}
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-accent" />
              Top Purchased Products
            </h3>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="h-6 w-6 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">No products purchased yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-gray-400 w-5">{idx + 1}.</span>
                      <span className="text-[13px] font-medium text-gray-900 dark:text-white truncate">{product.product_name}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-3">
                      <span className="text-xs text-gray-400">{product.quantity_purchased}x</span>
                      <span className="text-xs font-semibold text-accent">{formatRp(product.total_spend)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Supplier Information */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-accent" />
              Supplier Information
            </h3>
            <div className="space-y-4">
              {supplier.contact_person && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-light dark:bg-accent/20">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Contact Person</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.contact_person}</p>
                  </div>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.phone}</p>
                  </div>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{supplier.email}</p>
                  </div>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                    <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}