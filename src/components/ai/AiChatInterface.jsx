import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendAiMessage } from "@/api/ai";

export default function AiChatInterface({
  sessionId,
  onSessionChange,
  quickActionMessage,
  onQuickActionConsumed,
}) {
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Halo! Saya adalah AI Assistant SwiftPOS.\n\n" +
        "Saya dapat membantu Anda menganalisis data bisnis seperti:\n\n" +
        "📈 **Ringkasan Penjualan**\nLihat performa penjualan dan omzet toko.\n\n" +
        "📦 **Insight Produk**\nTemukan produk terlaris dan produk yang perlu diperhatikan.\n\n" +
        "🏷️ **Status Stok**\nPantau stok menipis dan kebutuhan restock.\n\n" +
        "👥 **Insight Pelanggan**\nIdentifikasi pelanggan terbaik dan pola pembelian.\n\n" +
        "🕒 **Aktivitas Terbaru**\nLihat transaksi dan aktivitas terbaru di toko.\n\n" +
        "Silakan tanyakan apa yang ingin Anda ketahui.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastQuickActionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle quick action messages from parent
  useEffect(() => {
    if (
      quickActionMessage &&
      quickActionMessage !== lastQuickActionRef.current
    ) {
      lastQuickActionRef.current = quickActionMessage;
      sendMessage(quickActionMessage);
    }
  }, [quickActionMessage]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Notify parent that the quick action message was consumed
    if (onQuickActionConsumed) {
      onQuickActionConsumed();
    }

    try {
      const response = await sendAiMessage(trimmed, sessionId);
      const data = response.data;

      if (onSessionChange && data.session_id) {
        onSessionChange(data.session_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          wasFallback: data.was_fallback,
          flagged: data.flagged,
          flagReason: data.flag_reason,
        },
      ]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Gagal mendapatkan respons. Silakan coba kembali.";
      setError(errorMsg);

      if (err.response?.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ **Batas permintaan tercapai.** ${errorMsg}`,
            wasFallback: true,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput("");
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-sm">
                <Bot size={16} className="text-white" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md",
              )}
            >
              {msg.role === "assistant" && msg.wasFallback && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle size={12} />
                  <span>Mode offline</span>
                </div>
              )}

              {msg.role === "assistant" && msg.flagged && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={12} />
                  <span>{msg.flagReason || "Permintaan ditandai"}</span>
                </div>
              )}

              <div className="whitespace-pre-wrap">
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line.startsWith("• ") ? (
                      <span className="block pl-2 -ml-2">
                        <span className="text-accent mr-1.5">•</span>
                        {line.substring(2)}
                      </span>
                    ) : line.startsWith("**") && line.endsWith("**") ? (
                      <strong className="block text-sm font-semibold mt-2 mb-1">
                        {line.replace(/\*\*/g, "")}
                      </strong>
                    ) : (
                      <>
                        {line}
                        {j < msg.content.split("\n").length - 1 && <br />}
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <User size={16} className="text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                <span>Memproses...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && !loading && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertCircle size={12} />
            {error}
          </p>
        </div>
      )}

      <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan tentang penjualan, produk, stok, atau pelanggan..."
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              style={{ minHeight: "42px", maxHeight: "120px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={cn(
              "shrink-0 flex items-center justify-center w-[42px] h-[42px] rounded-xl transition-all duration-200",
              input.trim() && !loading
                ? "bg-accent text-white shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:brightness-110"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed",
            )}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Jawaban AI dibuat berdasarkan data toko Anda. Verifikasi informasi
          penting secara berkala.
        </p>
      </div>
    </div>
  );
}
