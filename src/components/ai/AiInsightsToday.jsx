import { useState, useEffect } from "react";
import { getAiInsightsToday } from "@/api/ai";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  "trending-up": TrendingUp,
  package: Package,
  "shopping-bag": ShoppingBag,
  users: Users,
};

const colorMap = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: "text-amber-500",
    border: "border-amber-200 dark:border-amber-800",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    icon: "text-green-500",
    border: "border-green-200 dark:border-green-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-500",
    border: "border-blue-200 dark:border-blue-800",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    icon: "text-violet-500",
    border: "border-violet-200 dark:border-violet-800",
  },
};

export default function AiInsightsToday() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cachedAt, setCachedAt] = useState(null);
  const [error, setError] = useState(null);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const response = await getAiInsightsToday();
      setInsights(response.data.insights || []);
      setCachedAt(response.data.cached_at || null);
    } catch {
      setError("Gagal memuat insight");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const formatCacheTime = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    return `${Math.floor(diffMins / 60)}j lalu`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-amber-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Insight Hari Ini
          </h3>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Muat ulang"
        >
          <RefreshCw size={12} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {loading && insights.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
      )}

      {!loading && !error && insights.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Belum ada data insight
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = iconMap[insight.icon] || TrendingUp;
            const colors = colorMap[insight.color] || colorMap.blue;

            return (
              <div
                key={insight.id}
                className={cn(
                  "rounded-xl p-3.5 border transition-all",
                  "bg-white dark:bg-gray-800/30",
                  "border-gray-100 dark:border-gray-800",
                  "hover:border-gray-200 dark:hover:border-gray-700",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg",
                      colors.bg,
                    )}
                  >
                    <Icon size={18} className={colors.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {insight.label}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {insight.value}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cache indicator */}
      {cachedAt && !loading && (
        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-3">
          Diperbarui {formatCacheTime(cachedAt)}
        </p>
      )}
    </div>
  );
}
