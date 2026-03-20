/**
 * services/chat_services.js
 * -------------------------
 * Helper functions for all chat-related API calls.
 */

import API from "./api";
import { STORAGE_KEYS } from "../constants/config";

// ── Auth ──────────────────────────────────────────────────────────────────────

export function handleLogout(navigate) {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  navigate("/login");
}

// ── Chat Sessions ─────────────────────────────────────────────────────────────

export async function loadChats() {
  const res = await API.get("/chats");
  return res.data;
}

export async function createChat(
  title = "New Chat",
  model = "gemini-1.5-flash"
) {
  const res = await API.post("/chats", { title, model });
  return res.data;
}

export async function renameChat(chatId, title) {
  const res = await API.put(`/chats/${chatId}`, { title });
  return res.data;
}
export async function autoTitle(chatId) {
  res = await API.put(`/chats/autotitle/${chatId}`);
  console.log(res);
  
  return res.data;
}
export async function onDeleteChat(chatId) {
  await API.delete(`/chats/${chatId}`);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function loadMessages(chatId) {
  const res = await API.get(`/chats/${chatId}/messages`);
  return res.data;
}

export async function sendMessage(
  chatId,
  message,
  attachmentUrl = null,
  attachmentType = null
) {
  const res = await API.post(`/chats/${chatId}/messages`, {
    message,
    attachment_url: attachmentUrl,
    attachment_type: attachmentType,
  });
  return res.data;
}

/**
 * Stream message response (live typing effect)
 * NOTE: fetch is used because Axios doesn't support streaming in browser
 */
export async function streamMessage(
  chatId,
  message,
  onChunk,
  onDone,
  attachmentUrl = null,
  attachmentType = null
) {
  // ✅ Correct way to get token (interceptor does NOT work with fetch)
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(
    `${baseUrl}/chats/${chatId}/messages/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ required
      },
      body: JSON.stringify({
        message,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      }),
    }
  );

  if (!response.ok) throw new Error("Stream request failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.chunk) onChunk(parsed.chunk);
        if (parsed.done) onDone();
      } catch {
        // ignore bad chunks
      }
    }
  }
}

// ── Temp Chat ─────────────────────────────────────────────────────────────────

export async function sendTempMessage(
  message,
  history = [],
  model = "gemini-1.5-flash"
) {
  const res = await API.post("/chats/temp", {
    message,
    history,
    model,
  });
  return res.data;
}

// ── File Upload ───────────────────────────────────────────────────────────────

export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });

  return res.data;
}