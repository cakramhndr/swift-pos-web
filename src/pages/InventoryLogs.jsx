import { useState, useMemo } from "react";
import { toast } from "sonner";

import {
  ClipboardList,
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  Building2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Download,
} from "lucide-react";
import { exportInventoryLogsPDF } from "@/lib/exportUtils";

import { getStockMovements, getRestockLogs } from "@/lib/inventoryLogUtils";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/lib/supplierUtils";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatRp = (num) => {
  if (isNaN(num)) return "";
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
};

const formatDate = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ITEMS_PER_PAGE = 10;

// ─── Type Badge ──────────────────────────────────────────────────────────
const typeBadge = (type) => {
  switch (type) {
    case "sale":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium text-red-300">
          Penjualan
        </span>
      );
    case "restock":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          Restock
        </span>
      );
    case "adjustment":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-300">
          Adjustment
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/15 border border-gray-500/30 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {type}
        </span>
      );
  }
};

// ─── Qty Display ─────────────────────────────────────────────────────────
const qtyDisplay = (qty) => {
  const num = Number(qty || 0);
  if (num > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-semibold text-green-600 dark:text-green-400">
        <Plus className="h-3 w-3" />
        {num}
      </span>
    );
  }
  if (num < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-semibold text-red-600 dark:text-red-400">
        <Minus className="h-3 w-3" />
        {Math.abs(num)}
      </span>
    );
  }
  return <span className="text-gray-400 dark:text-gray-400">0</span>;
};

// ─── Time filter helper ──────────────────────────────────────────────────
const getTimeRangeStart = (range) => {
  const now = new Date();
  switch (range) {
    case "7":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return start;
    }
    default:
      return null;
  }
};

export default function InventoryLogs() {
  const [activeTab, setActiveTab] = useState("movement");

  // ─── Stock Movement State ────────────────────────────────────────────
  const [movementData] = useState(() => getStockMovements());
  const [movementSearch, setMovementSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [movementTimeFilter, setMovementTimeFilter] = useState("all");
  const [movementPage, setMovementPage] = useState(1);

  // ─── Restock Log State ───────────────────────────────────────────────
  const [restockData] = useState(() => getRestockLogs());
  const [restockSearch, setRestockSearch] = useState("");
  const [restockTimeFilter, setRestockTimeFilter] = useState("all");
  const [restockPage, setRestockPage] = useState(1);

  // ─── Supplier State ──────────────────────────────────────────────────
  const [supplierData, setSupplierData] = useState(() => getSuppliers());
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierPage, setSupplierPage] = useState(1);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [expandedSupplier, setExpandedSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  // ─── Compute stats ────────────────────────────────────────────────────
  const totalMovements = movementData.length;

  const thisMonthMovements = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return movementData.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= startOfMonth;
    });
  }, [movementData]);

  const stockInMonth = useMemo(
    () =>
      thisMonthMovements
        .filter((m) => Number(m.qty) > 0)
        .reduce((sum, m) => sum + Number(m.qty), 0),
    [thisMonthMovements],
  );

  const stockOutMonth = useMemo(
    () =>
      thisMonthMovements
        .filter((m) => Number(m.qty) < 0)
        .reduce((sum, m) => sum + Math.abs(Number(m.qty)), 0),
    [thisMonthMovements],
  );

  // ─── Supplier Stats ───────────────────────────────────────────────────
  const totalSupplierPembelian = useMemo(
    () => restockData.reduce((sum, log) => sum + Number(log.totalCost || 0), 0),
    [restockData],
  );

  const mostActiveSupplier = useMemo(() => {
    const counts = {};
    restockData.forEach((log) => {
      const name = log.supplierName || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    let maxName = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxName = name;
      }
    });
    return maxName ? { name: maxName, count: maxCount } : null;
  }, [restockData]);

  // ─── Enrich suppliers with stats ─────────────────────────────────────
  const enrichedSuppliers = useMemo(() => {
    return supplierData.map((s) => {
      const logs = restockData.filter(
        (log) =>
          log.supplierId === s.id ||
          (log.supplierName && log.supplierName === s.name),
      );
      const totalTransaksi = logs.length;
      const totalUnit = logs.reduce(
        (sum, log) => sum + Number(log.qty || 0),
        0,
      );
      const totalPembelian = logs.reduce(
        (sum, log) => sum + Number(log.totalCost || 0),
        0,
      );
      return { ...s, totalTransaksi, totalUnit, totalPembelian };
    });
  }, [supplierData, restockData]);

  // ─── Filtered suppliers ──────────────────────────────────────────────
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return enrichedSuppliers;
    const q = supplierSearch.toLowerCase();
    return enrichedSuppliers.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)),
    );
  }, [enrichedSuppliers, supplierSearch]);

  const totalSupplierPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE),
  );
  const paginatedSuppliers = filteredSuppliers.slice(
    (supplierPage - 1) * ITEMS_PER_PAGE,
    supplierPage * ITEMS_PER_PAGE,
  );

  // ─── Filtered & paginated movements ──────────────────────────────────
  const filteredMovements = useMemo(() => {
    let result = [...movementData];

    if (movementSearch.trim()) {
      const q = movementSearch.toLowerCase();
      result = result.filter(
        (m) =>
          (m.productName && m.productName.toLowerCase().includes(q)) ||
          (m.variantName && m.variantName.toLowerCase().includes(q)) ||
          (m.refId && m.refId.toLowerCase().includes(q)),
      );
    }

    if (movementTypeFilter !== "all") {
      result = result.filter((m) => m.type === movementTypeFilter);
    }

    const timeStart = getTimeRangeStart(movementTimeFilter);
    if (timeStart) {
      result = result.filter((m) => {
        const d = new Date(m.createdAt);
        return d >= timeStart;
      });
    }

    return result;
  }, [movementData, movementSearch, movementTypeFilter, movementTimeFilter]);

  const totalMovementPages = Math.max(
    1,
    Math.ceil(filteredMovements.length / ITEMS_PER_PAGE),
  );
  const paginatedMovements = filteredMovements.slice(
    (movementPage - 1) * ITEMS_PER_PAGE,
    movementPage * ITEMS_PER_PAGE,
  );

  // ─── Filtered & paginated restocks ───────────────────────────────────
  const filteredRestocks = useMemo(() => {
    let result = [...restockData];

    if (restockSearch.trim()) {
      const q = restockSearch.toLowerCase();
      result = result.filter(
        (r) =>
          (r.productName && r.productName.toLowerCase().includes(q)) ||
          (r.variantName && r.variantName.toLowerCase().includes(q)) ||
          (r.supplierName && r.supplierName.toLowerCase().includes(q)),
      );
    }

    const timeStart = getTimeRangeStart(restockTimeFilter);
    if (timeStart) {
      result = result.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= timeStart;
      });
    }

    return result;
  }, [restockData, restockSearch, restockTimeFilter]);

  const totalRestockPages = Math.max(
    1,
    Math.ceil(filteredRestocks.length / ITEMS_PER_PAGE),
  );
  const paginatedRestocks = filteredRestocks.slice(
    (restockPage - 1) * ITEMS_PER_PAGE,
    restockPage * ITEMS_PER_PAGE,
  );

  // ─── Supplier form handlers ──────────────────────────────────────────
  const openAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({ name: "", phone: "", email: "", address: "", note: "" });
    setShowSupplierModal(true);
  };

  const openEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      note: supplier.note || "",
    });
    setShowSupplierModal(true);
  };

  const handleSupplierFormChange = (field, value) => {
    setSupplierForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSupplier = () => {
    if (!supplierForm.name.trim()) {
      toast.error("Nama supplier harus diisi");
      return;
    }

    let result;
    if (editingSupplier) {
      result = updateSupplier(editingSupplier.id, supplierForm);
      if (result) {
        toast.success("Supplier berhasil diperbarui");
      }
    } else {
      result = addSupplier(supplierForm);
      if (result) {
        toast.success("Supplier berhasil ditambahkan");
      }
    }

    if (result) {
      setSupplierData(getSuppliers());
      setShowSupplierModal(false);
      setEditingSupplier(null);
    }
  };

  const handleDeleteSupplier = (supplier) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus supplier "${supplier.name}"? Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;

    const deleted = deleteSupplier(supplier.id);
    if (deleted) {
      setSupplierData(getSuppliers());
      toast.success("Supplier berhasil dihapus");
      if (expandedSupplier?.id === supplier.id) {
        setExpandedSupplier(null);
      }
    }
  };

  const handleSupplierSearch = (val) => {
    setSupplierSearch(val);
    setSupplierPage(1);
  };

  // ─── Reset page on filter change ──────────────────────────────────────
  const handleMovementSearch = (val) => {
    setMovementSearch(val);
    setMovementPage(1);
  };

  const handleMovementTypeFilter = (val) => {
    setMovementTypeFilter(val);
    setMovementPage(1);
  };

  const handleMovementTimeFilter = (val) => {
    setMovementTimeFilter(val);
    setMovementPage(1);
  };

  const handleRestockSearch = (val) => {
    setRestockSearch(val);
    setRestockPage(1);
  };

  const handleRestockTimeFilter = (val) => {
    setRestockTimeFilter(val);
    setRestockPage(1);
  };

  // ─── Supplier restock history ────────────────────────────────────────
  const supplierRestockHistory = useMemo(() => {
    if (!expandedSupplier) return [];
    const s = expandedSupplier;
    return restockData.filter(
      (log) =>
        log.supplierId === s.id ||
        (log.supplierName && log.supplierName === s.name),
    );
  }, [expandedSupplier, restockData]);

  return (
    <div className="space-y-6 p-6 bg-white rounded-3xl shadow-sm dark:bg-gray-800 dark:shadow-none">
      {/* ══════════════ Page Header ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Inventory Logs
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
                Track stock movements and restock history
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportInventoryLogsPDF(movementData, restockData)}
            className="relative z-10 flex items-center gap-2 rounded-2xl border border-violet-200 dark:border-violet-800/40 px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-300 transition-all duration-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 dark:hover:bg-violet-900/30 text-sm"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <div className="flex items-center gap-2 rounded-2xl bg-[#f8f8fc] dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════ Stats Row ════════════════════════════════════════ */}
      {activeTab !== "suppliers" && (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-800/30 shrink-0">
                <RotateCcw className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Total Pergerakan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {totalMovements}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30 shrink-0">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Stok Masuk (Bulan Ini)
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{stockInMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30 shrink-0">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Stok Keluar (Bulan Ini)
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5">
                  -{stockOutMonth}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Supplier Stats Row ═══════════════════════════════ */}
      {activeTab === "suppliers" && (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 shrink-0">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Total Supplier
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {filteredSuppliers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30 shrink-0">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Total Pembelian
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                  {formatRp(totalSupplierPembelian)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_16px_-2px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30 shrink-0">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Supplier Paling Aktif
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {mostActiveSupplier
                    ? mostActiveSupplier.name
                    : "Belum ada data"}
                </p>
                {mostActiveSupplier && (
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                    {mostActiveSupplier.count} transaksi
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Tab Bar ══════════════════════════════════════════ */}
      <div className="flex items-center gap-1 rounded-2xl bg-[#f8f8fc] dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 p-1.5">
        <button
          onClick={() => setActiveTab("movement")}
          className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "movement"
              ? "bg-violet-600 dark:bg-violet-600 text-white dark:text-white shadow-lg shadow-violet-500/20"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
          }`}
        >
          Stock Movement
        </button>
        <button
          onClick={() => setActiveTab("restock")}
          className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "restock"
              ? "bg-violet-600 dark:bg-violet-600 text-white dark:text-white shadow-lg shadow-violet-500/20"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
          }`}
        >
          Restock Logs
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "suppliers"
              ? "bg-violet-600 dark:bg-violet-600 text-white dark:text-white shadow-lg shadow-violet-500/20"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
          }`}
        >
          Suppliers
        </button>
      </div>

      {/* ══════════════ TAB: Stock Movement ═════════════════════════════ */}
      {activeTab === "movement" && (
        <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="relative p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={movementSearch}
                  onChange={(e) => handleMovementSearch(e.target.value)}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none dark:text-white dark:placeholder-gray-400 transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <select
                value={movementTypeFilter}
                onChange={(e) => handleMovementTypeFilter(e.target.value)}
                className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"
              >
                <option value="all">Semua Tipe</option>
                <option value="sale">Penjualan</option>
                <option value="restock">Restock</option>
                <option value="adjustment">Adjustment</option>
              </select>

              <select
                value={movementTimeFilter}
                onChange={(e) => handleMovementTimeFilter(e.target.value)}
                className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"
              >
                <option value="all">Semua Waktu</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>

            {paginatedMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                  <ClipboardList className="h-7 w-7 text-gray-400 dark:text-gray-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {movementData.length === 0
                    ? "Belum ada pergerakan stok"
                    : "Tidak ada hasil untuk filter saat ini"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {movementData.length === 0
                    ? "Pergerakan stok akan muncul setelah ada transaksi"
                    : "Coba ubah filter pencarian"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80">
                      <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-[0.08em] py-3.5">
                        Waktu
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-[0.08em] py-3.5">
                        Produk
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5">
                        Tipe
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Stok Akhir
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5">
                        Ref
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMovements.map((movement) => (
                      <TableRow
                        key={movement.id}
                        className="hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors"
                      >
                        <TableCell className="py-3.5">
                          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {formatDate(movement.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {movement.productName}
                          </p>
                          {movement.variantName && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {movement.variantName}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {typeBadge(movement.type)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          {qtyDisplay(movement.qty)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {Number(movement.stockAfter || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {movement.refId ? (
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-500/10 dark:bg-gray-500/15 border border-gray-400/20 dark:border-gray-400/15 px-2 py-1 rounded-lg">
                              #{movement.refId}
                            </span>
                          ) : movement.note ? (
                            <span className="text-xs text-gray-400 italic max-w-[120px] truncate block">
                              {movement.note}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#ececf2] dark:border-gray-700/60">
                  <p className="text-sm text-gray-400 dark:text-gray-400">
                    Menampilkan{" "}
                    {Math.min(
                      (movementPage - 1) * ITEMS_PER_PAGE + 1,
                      filteredMovements.length,
                    )}
                    –
                    {Math.min(
                      movementPage * ITEMS_PER_PAGE,
                      filteredMovements.length,
                    )}{" "}
                    dari {filteredMovements.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setMovementPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={movementPage <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                      {movementPage}
                    </span>
                    <button
                      onClick={() =>
                        setMovementPage((prev) =>
                          Math.min(prev + 1, totalMovementPages),
                        )
                      }
                      disabled={movementPage >= totalMovementPages}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Restock Logs ════════════════════════════════ */}
      {activeTab === "restock" && (
        <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="relative p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Cari produk atau supplier..."
                  value={restockSearch}
                  onChange={(e) => handleRestockSearch(e.target.value)}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <select
                value={restockTimeFilter}
                onChange={(e) => handleRestockTimeFilter(e.target.value)}
                className="rounded-2xl border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-violet-400 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] cursor-pointer dark:text-white"
              >
                <option value="all">Semua Waktu</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>

            {paginatedRestocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                  <Package className="h-7 w-7 text-gray-400 dark:text-gray-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {restockData.length === 0
                    ? "Belum ada restock"
                    : "Tidak ada hasil untuk filter saat ini"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {restockData.length === 0
                    ? "Restock akan muncul setelah ada pengisian stok"
                    : "Coba ubah filter pencarian"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80">
                      <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-[0.08em] py-3.5">
                        Tanggal
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-[0.08em] py-3.5">
                        Produk
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5">
                        Supplier
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Harga Beli
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRestocks.map((log) => (
                      <TableRow
                        key={log.id}
                        className="hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors"
                      >
                        <TableCell className="py-3.5">
                          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {log.productName}
                          </p>
                          {log.variantName && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {log.variantName}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {log.supplierName ? (
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              {log.supplierName}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            +{Number(log.qty).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {formatRp(log.buyPrice)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <span className="text-sm font-bold text-violet-600">
                            {formatRp(log.totalCost)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#ececf2] dark:border-gray-700/60">
                  <p className="text-sm text-gray-400 dark:text-gray-400">
                    Menampilkan{" "}
                    {Math.min(
                      (restockPage - 1) * ITEMS_PER_PAGE + 1,
                      filteredRestocks.length,
                    )}
                    –
                    {Math.min(
                      restockPage * ITEMS_PER_PAGE,
                      filteredRestocks.length,
                    )}{" "}
                    dari {filteredRestocks.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setRestockPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={restockPage <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                      {restockPage}
                    </span>
                    <button
                      onClick={() =>
                        setRestockPage((prev) =>
                          Math.min(prev + 1, totalRestockPages),
                        )
                      }
                      disabled={restockPage >= totalRestockPages}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Suppliers ═══════════════════════════════════ */}
      {activeTab === "suppliers" && (
        <div className="overflow-hidden rounded-3xl border border-[#ececf2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="relative p-6">
            {/* Header + Add Button */}
            <div className="flex items-center justify-between mb-5">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Cari supplier..."
                  value={supplierSearch}
                  onChange={(e) => handleSupplierSearch(e.target.value)}
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <button
                onClick={openAddSupplier}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Tambah Supplier
              </button>
            </div>

            {/* Table */}
            {paginatedSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50">
                  <Building2 className="h-7 w-7 text-gray-400 dark:text-gray-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {supplierData.length === 0
                    ? "Belum ada supplier"
                    : "Tidak ada hasil untuk filter saat ini"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {supplierData.length === 0
                    ? "Klik 'Tambah Supplier' untuk menambahkan supplier pertama"
                    : "Coba ubah filter pencarian"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#f8f8fc] dark:from-gray-800/80 to-white dark:to-gray-800/80">
                      <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-[0.08em] py-3.5 w-8"></TableHead>
                      <TableHead className="font-semibold text-gray-500 text-xs uppercase tracking-[0.08em] py-3.5">
                        Nama Supplier
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5">
                        Kontak
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Transaksi
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Total Unit
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-right">
                        Total Pembelian
                      </TableHead>
                      <TableHead className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[0.08em] py-3.5 text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSuppliers.map((supplier) => (
                      <>
                        <TableRow
                          key={supplier.id}
                          className="hover:bg-violet-50 dark:hover:bg-gray-700/60 hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.2)] transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedSupplier(
                              expandedSupplier?.id === supplier.id
                                ? null
                                : supplier,
                            )
                          }
                        >
                          <TableCell className="py-3.5">
                            <button className="text-gray-400 dark:text-gray-400 hover:text-violet-600">
                              {expandedSupplier?.id === supplier.id ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                                {supplier.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {supplier.name}
                                </p>
                                {supplier.email && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {supplier.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5">
                            {supplier.phone ? (
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                {supplier.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3.5 text-right">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {supplier.totalTransaksi}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 text-right">
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              {Number(supplier.totalUnit || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 text-right">
                            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                              {formatRp(supplier.totalPembelian)}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSupplier(supplier);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-all hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSupplier(supplier);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ececf2] dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-all hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded restock history */}
                        {expandedSupplier?.id === supplier.id && (
                          <tr key={`history-${supplier.id}`}>
                            <td
                              colSpan={7}
                              className="px-6 py-4 bg-purple-50/30"
                            >
                              <div className="pl-10">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">
                                  Riwayat Restock
                                </p>
                                {supplierRestockHistory.length === 0 ? (
                                  <p className="text-sm text-gray-400 dark:text-gray-400 py-4 text-center">
                                    Belum ada riwayat restock untuk supplier ini
                                  </p>
                                ) : (
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="text-xs text-gray-400 dark:text-gray-400">
                                        <th className="pb-2 font-medium pr-4">
                                          Tanggal
                                        </th>
                                        <th className="pb-2 font-medium pr-4">
                                          Produk
                                        </th>
                                        <th className="pb-2 font-medium pr-4 text-right">
                                          Qty
                                        </th>
                                        <th className="pb-2 font-medium text-right">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-100">
                                      {supplierRestockHistory.map((log) => (
                                        <tr
                                          key={log.id}
                                          className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                        >
                                          <td className="py-2 pr-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                              {formatDateShort(log.createdAt)}
                                            </span>
                                          </td>
                                          <td className="py-2 pr-4">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                              {log.productName}
                                            </span>
                                            {log.variantName && (
                                              <span className="text-xs text-gray-400 ml-1">
                                                ({log.variantName})
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 pr-4 text-right">
                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                              +
                                              {Number(log.qty).toLocaleString()}
                                            </span>
                                          </td>
                                          <td className="py-2 text-right">
                                            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                                              {formatRp(log.totalCost)}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#ececf2] dark:border-gray-700/60">
                  <p className="text-sm text-gray-400 dark:text-gray-400">
                    Menampilkan{" "}
                    {Math.min(
                      (supplierPage - 1) * ITEMS_PER_PAGE + 1,
                      filteredSuppliers.length,
                    )}
                    –
                    {Math.min(
                      supplierPage * ITEMS_PER_PAGE,
                      filteredSuppliers.length,
                    )}{" "}
                    dari {filteredSuppliers.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSupplierPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={supplierPage <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                      {supplierPage}
                    </span>
                    <button
                      onClick={() =>
                        setSupplierPage((prev) =>
                          Math.min(prev + 1, totalSupplierPages),
                        )
                      }
                      disabled={supplierPage >= totalSupplierPages}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf2] dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.1)] hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ Supplier Modal (Add/Edit) ════════════════════════ */}
      {showSupplierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowSupplierModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800/95 p-6 shadow-2xl backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-t-3xl -mt-6 -mx-6 mb-6" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingSupplier ? "Edit Supplier" : "Tambah Supplier"}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                  {editingSupplier
                    ? "Ubah informasi supplier"
                    : "Masukkan informasi supplier baru"}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Nama Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama supplier"
                  value={supplierForm.name}
                  onChange={(e) =>
                    handleSupplierFormChange("name", e.target.value)
                  }
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nomor telepon"
                  value={supplierForm.phone}
                  onChange={(e) =>
                    handleSupplierFormChange("phone", e.target.value)
                  }
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={supplierForm.email}
                  onChange={(e) =>
                    handleSupplierFormChange("email", e.target.value)
                  }
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Alamat
                </label>
                <textarea
                  placeholder="Masukkan alamat"
                  value={supplierForm.address}
                  onChange={(e) =>
                    handleSupplierFormChange("address", e.target.value)
                  }
                  rows="2"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 block">
                  Catatan
                </label>
                <textarea
                  placeholder="Catatan tambahan..."
                  value={supplierForm.note}
                  onChange={(e) =>
                    handleSupplierFormChange("note", e.target.value)
                  }
                  rows="2"
                  className="w-full rounded-2xl border border-[#ececf2] dark:border-gray-700 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSupplierModal(false);
                  setEditingSupplier(null);
                }}
                className="flex-1 rounded-2xl border border-[#ececf2] dark:border-gray-700 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {editingSupplier ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
