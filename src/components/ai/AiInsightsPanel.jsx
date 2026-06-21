import { useState, useEffect } from "react";
import { getAiConversations, deleteAiConversations } from "@/api/ai";
import {
  MessageSquare,
  Bot,
  Clock,
  TrendingUp,
  Package,
  Users,
  Activity,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const intentIcons = {
  sales_overview: TrendingUp,
  product_insights: Package,
  customer_insights: Users,
  recent_activity: Activity,
};

const intentColors = {
  sales_overview: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  product_insights: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  customer_insights: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
  recent_activity: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
};

export default function AiInsightsPanel({
  onSelectConversation,
  compact = false,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [showAll, setShowAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadConversations = async (p = 1) => {
    try {
      const perPage = showAll ? 50 : 20;
      const response = await getAiConversations(perPage, p);
      const data = response.data;
      setConversations(data.data || []);
      setMeta(data.meta || { total: 0, last_page: 1 });
    } catch {
      setError("Gagal memuat riwayat percakapan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations(page);
  }, [page, showAll]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAiConversations();
      setConversations([]);
      setMeta({ total: 0, last_page: 1 });
      setShowDeleteConfirm(false);
    } catch {
      setError("Gagal menghapus riwayat");
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const getIntentInfo = (intent) => {
    if (!intent) return null;
    const Icon = intentIcons[intent] || Bot;
    const colorClass =
      intentColors[intent] || "text-gray-500 bg-gray-50 dark:bg-gray-500/10";
    return { Icon, colorClass };
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Riwayat Percakapan
        </h3>
        <div className="flex items-center gap-1">
          {conversations.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title="Hapus riwayat"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {showAll ? "Ringkas" : "Lihat Semua"}
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                Hapus semua riwayat?
              </p>
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="shrink-0 p-0.5 rounded text-red-400 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
      )}

      {!loading && !error && conversations.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
            <MessageSquare
              size={20}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada percakapan
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Ajukan pertanyaan untuk memulai
          </p>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const intentInfo = getIntentInfo(conv.intent);
            const firstMessage =
              conv.user_message?.length > 60
                ? conv.user_message.substring(0, 60) + "..."
                : conv.user_message;

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation?.(conv)}
                className={cn(
                  "w-full text-left rounded-xl p-3 transition-all duration-200",
                  "bg-white dark:bg-gray-800/30",
                  "border border-gray-100 dark:border-gray-800",
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  "hover:border-gray-200 dark:hover:border-gray-700",
                )}
              >
                <div className="flex items-start gap-3">
                  {intentInfo && (
                    <div
                      className={cn(
                        "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg",
                        intentInfo.colorClass,
                      )}
                    >
                      <intentInfo.Icon size={15} />
                    </div>
                  )}
                  {!intentInfo && (
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400">
                      <Bot size={15} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {firstMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(conv.created_at)}
                      </span>
                      {conv.was_fallback && (
                        <span className="text-[10px] text-amber-500">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
            Sebelumnya
          </button>
          <span className="text-[11px] text-gray-400">
            {meta.total} percakapan
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Selanjutnya
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
