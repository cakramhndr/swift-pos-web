import { useEffect, useState, useMemo } from "react";
import useSuppliers from "@/hooks/useSuppliers";
import { toast } from "sonner";
import {
  Building2,
  UserCheck,
  UserX,
  ClipboardList,
  Search,
  Plus,
  X,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] animate-pulse p-7">
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 h-4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

const INITIAL_FORM = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
  is_active: true,
};

export default function Suppliers() {
  const {
    data: suppliers,
    loading,
    meta,
    refetch,
    create,
    update,
    remove,
    setSearch: setSuppliersSearch,
    setPage,
  } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);

  const { last_page: lastPage, total } = meta;

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ─── Computed Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s) => s.is_active).length;
    const inactiveSuppliers = suppliers.filter((s) => !s.is_active).length;
    const totalPOs = suppliers.reduce((sum, s) => sum + (s.purchase_orders_count ?? 0), 0);
    return { totalSuppliers, activeSuppliers, inactiveSuppliers, totalPOs };
  }, [suppliers]);

  // ─── Search handler ──────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearchQuery(value);
    setSuppliersSearch(value);
  };

  // ─── Form helpers ────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
    setEditingSupplier(null);
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name ?? "",
      contact_person: supplier.contact_person ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      city: supplier.city ?? "",
      notes: supplier.notes ?? "",
      is_active: supplier.is_active ?? true,
    });
    setShowAddModal(true);
  };

  // ─── Create / Update ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSupplier) {
        await update(editingSupplier.id, form);
        toast.success("Supplier updated successfully ✏️");
      } else {
        await create(form);
        toast.success("Supplier created successfully ✅");
      }
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save supplier";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await remove(deleteConfirm.id);
      toast.success("Supplier deleted successfully 🗑️");
      setDeleteConfirm(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete supplier";
      toast.error(msg);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ═══ Page Header ══════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Suppliers
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
              Manage your supplier relationships
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
          }}
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* ═══ Summary Cards ════════════════════════════════════════════ */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Suppliers */}
          <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(124,58,237,0.12)] hover:border-accent/80 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-2.5">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                  Total Suppliers
                </p>
                <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                  {stats.totalSuppliers}
                </h2>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-accent/20 shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                }}
              >
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] hover:border-emerald-200/80 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-2.5">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                  Active Suppliers
                </p>
                <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                  {stats.activeSuppliers}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 shrink-0">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Inactive Suppliers */}
          <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(239,68,68,0.12)] hover:border-red-200/80 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-2.5">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                  Inactive Suppliers
                </p>
                <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                  {stats.inactiveSuppliers}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20 shrink-0">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Purchase Orders */}
          <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.12)] hover:border-blue-200/80 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-2.5">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                  Total Purchase Orders
                </p>
                <h2 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-white leading-none">
                  {stats.totalPOs}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20 shrink-0">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Table Card ═══════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        {/* Search Bar */}
        <div className="p-6 pb-0">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-11 pr-4 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <TableSkeleton />
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <Building2 className="h-8 w-8 text-gray-400 dark:text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                No suppliers found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first supplier to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#ececf2] dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/60 text-left text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-semibold">Supplier Name</th>
                    <th className="px-6 py-4 font-semibold">Contact Person</th>
                    <th className="px-6 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-t border-[#ececf2] dark:border-gray-700/60 transition-colors hover:bg-accent-light dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-bold text-accent">
                            {supplier.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {supplier.name}
                            </span>
                            {supplier.email && (
                              <p className="text-xs text-gray-400 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        {supplier.contact_person || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {supplier.phone ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {supplier.phone}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {supplier.city ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {supplier.city}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                            supplier.is_active
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/15 text-red-300 border border-red-500/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              supplier.is_active ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {supplier.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(supplier)}
                            className="relative z-10 flex items-center gap-1.5 rounded-xl border border-accent bg-gradient-to-r from-violet-50 dark:from-violet-900/20 to-purple-50 dark:to-purple-900/20 px-4 py-2 text-sm font-medium text-accent dark:text-accent transition-all duration-200 hover:bg-accent-light dark:hover:bg-accent/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(supplier)}
                            className="relative z-10 flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-50 dark:from-red-900/20 to-rose-50 dark:to-rose-900/20 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-300 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.15)] hover:-translate-y-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Pagination ──────────────────────────────────────────── */}
          {!loading && lastPage > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/40">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {meta.current_page} of {lastPage} ({total} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, meta.current_page - 1))}
                  disabled={meta.current_page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage(Math.min(lastPage, meta.current_page + 1))}
                  disabled={meta.current_page >= lastPage}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Add/Edit Modal ═══════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm max-h-[90vh] overflow-y-auto">
            <div
              className="h-1 bg-gradient-to-r rounded-t-3xl -mt-6 -mx-6 mb-6"
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
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                    {editingSupplier
                      ? "Update supplier information"
                      : "Enter supplier details"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                  Supplier Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tech Distributor"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0812-3456-7890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. john@supplier.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Address & City */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                  Address
                </label>
                <textarea
                  placeholder="e.g. Jl. Sudirman No. 123"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jakarta"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1.5 block">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Active Supplier
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-gradient-to-r py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                  }}
                >
                  {submitting
                    ? "Saving…"
                    : editingSupplier
                      ? "Update Supplier"
                      : "Save Supplier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirm Modal ═════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Delete Supplier
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteConfirm.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3 font-medium text-white shadow-sm transition-all hover:shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}