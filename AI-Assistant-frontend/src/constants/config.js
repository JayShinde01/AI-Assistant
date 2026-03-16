/**
 * constants/config.js
 * -------------------
 * App-wide configuration constants.
 *
 * Centralizing these here means you only need to change one file
 * if the backend URL or other settings change.
 */

/** Base URL for all API requests */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Base URL for serving uploaded files (images, PDFs, etc.) */
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL;

/** Max file size the user can upload (5 MB in bytes) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Accepted file types for the file picker */
export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain";

/** LocalStorage keys — centralized to avoid typos */
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};
