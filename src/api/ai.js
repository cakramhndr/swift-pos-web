import api from "@/lib/api";

/**
 * Get AI provider status (model, online/offline).
 * @returns {Promise<{provider: string, model: string, is_fallback: boolean, status: string}>}
 */
export function getAiStatus() {
  return api.get("/ai/status");
}

/**
 * Send a chat message to the AI assistant.
 * @param {string} message - The user's message
 * @param {string} [sessionId] - Optional session ID for conversation continuity
 * @returns {Promise<{response: string, intent: string|null, skill_used: string|null, was_fallback: boolean, session_id: string}>}
 */
export function sendAiMessage(message, sessionId) {
  return api.post("/ai/chat", {
    message,
    session_id: sessionId,
  });
}

/**
 * Get conversation history for a session.
 * @param {string} sessionId
 * @returns {Promise<{history: Array}>}
 */
export function getAiHistory(sessionId) {
  return api.get("/ai/history", {
    params: { session_id: sessionId },
  });
}

/**
 * Get user's conversation list (paginated).
 * @param {number} [perPage=20]
 * @param {number} [page=1]
 * @returns {Promise<{data: Array, meta: {total, current_page, last_page}}>}
 */
export function getAiConversations(perPage = 20, page = 1) {
  return api.get("/ai/conversations", {
    params: { per_page: perPage, page },
  });
}

/**
 * Delete all conversations for the current user.
 * @returns {Promise<{message: string, deleted_count: number}>}
 */
export function deleteAiConversations() {
  return api.delete("/ai/conversations");
}

/**
 * Get available AI skills/intents.
 * @returns {Promise<{skills: Array}>}
 */
export function getAiSkills() {
  return api.get("/ai/skills");
}

/**
 * Get daily business insights (cached).
 * @returns {Promise<{insights: Array, cached_at: string}>}
 */
export function getAiInsightsToday() {
  return api.get("/ai/insights-today");
}
