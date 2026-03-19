/**
 * services/api.js
 * ---------------
 * Axios instance configured for the AI Assistant backend.
 *
 * Features:
 *  - Base URL set to the backend API
 *  - Request interceptor: automatically attaches the Bearer token
 *    from localStorage to every outgoing request
 *  - Response interceptor: handles 401 errors globally (auto-logout)
 */

import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../constants/config";

// Create a reusable Axios instance with our backend's base URL
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout — AI responses can take a moment
});
console.log("env",API_BASE_URL);

// ── Request Interceptor ───────────────────────────────────────────────────────
// Runs before every request is sent.
// Reads the token from localStorage and adds it to the Authorization header.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Runs after every response is received.
// If the server returns 401 (unauthorized), clear the token and redirect to login.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
