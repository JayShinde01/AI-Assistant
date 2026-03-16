/**
 * services/chat_services.js
 * -------------------------
 * Helper functions for all chat-related API calls.
 *
 * Keeping API calls in a service layer (instead of directly in components)
 * makes the code easier to maintain and test.
 */

import API from "./api";
import { STORAGE_KEYS } from "../constants/config";

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Log the user out by clearing localStorage and redirecting to /login.
 * @param {Function} navigate - React Router's navigate function
 */
export function handleLogout(navigate) {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  navigate("/login");
}

// ── Chat Sessions ─────────────────────────────────────────────────────────────

/**
 * Fetch all chat sessions for the current user.
 * @returns {Promise<Array>} Array of chat objects
 */
export async function loadChats() {
  const res = await API.get("/chats");
  return res.data;
}

/**
 * Create a new chat session.
 * @param {string} title - Chat title (default: "New Chat")
 * @param {string} model - AI model to use (default: "gemini-1.5-flash")
 * @returns {Promise<Object>} The newly created chat object
 */
export async function createChat(title = "New Chat", model = "gemini-1.5-flash") {
  const res = await API.post("/chats", { title, model });
  return res.data;
}

/**
 * Rename an existing chat session.
 * @param {string} chatId - UUID of the chat to rename
 * @param {string} title  - New title
 * @returns {Promise<Object>} Updated chat object
 */
export async function renameChat(chatId, title) {
  const res = await API.put(`/chats/${chatId}`, { title });
  return res.data;
}

/**
 * Delete a chat session and all its messages.
 * @param {string} chatId - UUID of the chat to delete
 */
export async function onDeleteChat(chatId) {
  await API.delete(`/chats/${chatId}`);
}

// ── Messages ──────────────────────────────────────────────────────────────────

/**
 * Load all messages for a chat session.
 * @param {string} chatId - UUID of the chat
 * @returns {Promise<Array>} Array of message objects
 */
export async function loadMessages(chatId) {
  const res = await API.get(`/chats/${chatId}/messages`);
  return res.data;
}

/**
 * Send a message in a chat session and get the AI reply.
 * @param {string} chatId         - UUID of the chat
 * @param {string} message        - User's message text
 * @param {string|null} attachmentUrl  - URL of uploaded file (optional)
 * @param {string|null} attachmentType - MIME type of the file (optional)
 * @returns {Promise<Object>} { reply, chat_id, tokens_used }
 */
export async function sendMessage(chatId, message, attachmentUrl = null, attachmentType = null) {
  const res = await API.post(`/chats/${chatId}/messages`, {
    message,
    attachment_url: attachmentUrl,
    attachment_type: attachmentType,
  });
  return res.data;
}

// ── Temp Chat ─────────────────────────────────────────────────────────────────

/**
 * Send a message in temp (stateless) mode — nothing is saved to the database.
 * The frontend manages the conversation history locally.
 *
 * @param {string} message  - User's current message
 * @param {Array}  history  - Previous messages [{role, message}, ...]
 * @param {string} model    - AI model to use
 * @returns {Promise<Object>} { reply, tokens_used }
 */
export async function sendTempMessage(message, history = [], model = "gemini-1.5-flash") {
  const res = await API.post("/chats/temp", { message, history, model });
  return res.data;
}

// ── File Upload ───────────────────────────────────────────────────────────────

/**
 * Upload a file or image to the server.
 * Returns the URL that can be included in a message.
 *
 * @param {File} file - The File object from the file input
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<Object>} { url, mime_type, original_name, size_bytes }
 */
export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return res.data;
}
