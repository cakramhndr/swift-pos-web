import { useState, useEffect } from "react";
import { Bot, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAiStatus } from "@/api/ai";
import AiChatInterface from "@/components/ai/AiChatInterface";
import AiQuickActions from "@/components/ai/AiQuickActions";
import AiInsightsPanel from "@/components/ai/AiInsightsPanel";
import AiInsightsToday from "@/components/ai/AiInsightsToday";

export default function AiAssistant() {
  const [sessionId, setSessionId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [quickActionInput, setQuickActionInput] = useState(null);
  const [status, setStatus] = useState({
    provider: "",
    model: "",
    status: "offline",
  });

  // Load AI status on mount
  useEffect(() => {
    getAiStatus()
      .then((res) => {
        setStatus(res.data);
      })
      .catch(() => {
        setStatus({ provider: "unknown", model: "unknown", status: "offline" });
      });
  }, []);

  const handleQuickAction = (message) => {
    setQuickActionInput(message);
  };

  const handleQuickActionConsumed = () => {
    setQuickActionInput(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-md shadow-accent/20">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Assistant
                </h1>
                {/* Model badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  <Sparkles size={10} className="text-accent" />
                  {status.model || "Unknown"}
                </span>
                {/* Status badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium",
                    status.status === "online"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      status.status === "online"
                        ? "bg-emerald-500"
                        : "bg-amber-500",
                    )}
                  />
                  {status.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tanyakan tentang data bisnis Anda
              </p>
            </div>
          </div>
        </div>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-50 dark:hover:bg-gray-700",
            "text-gray-600 dark:text-gray-300",
          )}
        >
          <MessageSquare size={16} />
          {showSidebar ? "Sembunyikan Panel" : "Tampilkan Panel"}
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Quick actions */}
          <div className="shrink-0 px-4 md:px-6 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <AiQuickActions onAction={handleQuickAction} disabled={false} />
          </div>

          {/* Chat interface */}
          <div className="flex-1 overflow-hidden">
            <AiChatInterface
              sessionId={sessionId}
              onSessionChange={setSessionId}
              quickActionMessage={quickActionInput}
              onQuickActionConsumed={handleQuickActionConsumed}
            />
          </div>
        </div>

        {/* Side panel */}
        {showSidebar && (
          <div className="shrink-0 w-80 overflow-y-auto space-y-4">
            {/* Insight Hari Ini */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <AiInsightsToday />
            </div>

            {/* Conversation History */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <AiInsightsPanel
                onSelectConversation={() => {
                  // Future: load specific conversation
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
