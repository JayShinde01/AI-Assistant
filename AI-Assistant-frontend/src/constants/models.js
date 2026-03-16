/**
 * constants/models.js
 * -------------------
 * Full list of available Gemini / Gemma models for the model selector.
 *
 * Models are grouped by family for easier navigation in the dropdown.
 * The `value` must exactly match the backend's AVAILABLE_MODELS keys.
 *
 * Notes:
 *  - Embedding and TTS models don't support multi-turn chat
 *  - Preview models may change or be removed without notice
 *  - "Latest" aliases always point to the newest stable version
 */

// ── Gemini 2.5 series ─────────────────────────────────────────────────────────
const GEMINI_25 = [
  {
    value: "models/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Fast, efficient — great all-rounder",
    badge: "2.5",
    badgeColor: "blue",
    group: "Gemini 2.5",
  },
  {
    value: "models/gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    description: "Most capable 2.5 model",
    badge: "Pro",
    badgeColor: "purple",
    group: "Gemini 2.5",
  },
  {
    value: "models/gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    description: "Lightest 2.5 model — lowest token cost",
    badge: "Lite",
    badgeColor: "green",
    group: "Gemini 2.5",
  },
  {
    value: "models/gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image",
    description: "Optimized for image understanding",
    badge: "Image",
    badgeColor: "cyan",
    group: "Gemini 2.5",
  },
  {
    value: "models/gemini-2.5-flash-lite-preview-09-2025",
    label: "Gemini 2.5 Flash Lite Preview (09-2025)",
    description: "Preview of upcoming Flash Lite",
    badge: "Preview",
    badgeColor: "orange",
    group: "Gemini 2.5",
  },
  {
    value: "models/gemini-2.5-flash-preview-tts",
    label: "Gemini 2.5 Flash Preview TTS",
    description: "Text-to-speech preview",
    badge: "TTS",
    badgeColor: "gold",
    group: "Gemini 2.5",
  },
  {
    value: "models/gemini-2.5-pro-preview-tts",
    label: "Gemini 2.5 Pro Preview TTS",
    description: "Pro text-to-speech preview",
    badge: "TTS",
    badgeColor: "gold",
    group: "Gemini 2.5",
  },
];

// ── Gemini 2.0 series ─────────────────────────────────────────────────────────
const GEMINI_20 = [
  {
    value: "models/gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    description: "Balanced speed and capability",
    badge: "2.0",
    badgeColor: "blue",
    group: "Gemini 2.0",
  },
  {
    value: "models/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash 001",
    description: "Pinned stable Flash version",
    badge: "Stable",
    badgeColor: "green",
    group: "Gemini 2.0",
  },
  {
    value: "models/gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
    description: "Lightest 2.0 model — very low token cost",
    badge: "Lite",
    badgeColor: "green",
    group: "Gemini 2.0",
  },
  {
    value: "models/gemini-2.0-flash-lite-001",
    label: "Gemini 2.0 Flash Lite 001",
    description: "Pinned stable Flash Lite version",
    badge: "Stable",
    badgeColor: "green",
    group: "Gemini 2.0",
  },
];

// ── Gemini 3.x preview series ─────────────────────────────────────────────────
const GEMINI_3X = [
  {
    value: "models/gemini-3-pro-preview",
    label: "Gemini 3 Pro Preview",
    description: "Next-gen Pro — preview only",
    badge: "Preview",
    badgeColor: "orange",
    group: "Gemini 3.x Preview",
  },
  {
    value: "models/gemini-3-flash-preview",
    label: "Gemini 3 Flash Preview",
    description: "Next-gen Flash — preview only",
    badge: "Preview",
    badgeColor: "orange",
    group: "Gemini 3.x Preview",
  },
  {
    value: "models/gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro Preview",
    description: "3.1 Pro — preview only",
    badge: "Preview",
    badgeColor: "orange",
    group: "Gemini 3.x Preview",
  },
  {
    value: "models/gemini-3.1-pro-preview-customtools",
    label: "Gemini 3.1 Pro Preview (Custom Tools)",
    description: "3.1 Pro with custom tool support",
    badge: "Preview",
    badgeColor: "orange",
    group: "Gemini 3.x Preview",
  },
  {
    value: "models/gemini-3.1-flash-lite-preview",
    label: "Gemini 3.1 Flash Lite Preview",
    description: "3.1 Flash Lite — preview only",
    badge: "Preview",
    badgeColor: "orange",
    group: "Gemini 3.x Preview",
  },
  {
    value: "models/gemini-3-pro-image-preview",
    label: "Gemini 3 Pro Image Preview",
    description: "3 Pro with image generation",
    badge: "Image",
    badgeColor: "cyan",
    group: "Gemini 3.x Preview",
  },
  {
    value: "models/gemini-3.1-flash-image-preview",
    label: "Gemini 3.1 Flash Image Preview",
    description: "3.1 Flash with image generation",
    badge: "Image",
    badgeColor: "cyan",
    group: "Gemini 3.x Preview",
  },
];

// ── Gemini latest aliases ─────────────────────────────────────────────────────
const GEMINI_LATEST = [
  {
    value: "models/gemini-flash-latest",
    label: "Gemini Flash (Latest)",
    description: "Always points to the newest Flash",
    badge: "Latest",
    badgeColor: "blue",
    group: "Latest Aliases",
  },
  {
    value: "models/gemini-flash-lite-latest",
    label: "Gemini Flash Lite (Latest)",
    description: "Always points to the newest Flash Lite",
    badge: "Latest",
    badgeColor: "green",
    group: "Latest Aliases",
  },
  {
    value: "models/gemini-pro-latest",
    label: "Gemini Pro (Latest)",
    description: "Always points to the newest Pro",
    badge: "Latest",
    badgeColor: "purple",
    group: "Latest Aliases",
  },
];

// ── Gemma 3 open models ───────────────────────────────────────────────────────
const GEMMA_3 = [
  {
    value: "models/gemma-3-1b-it",
    label: "Gemma 3 1B IT",
    description: "Tiny open model — 1 billion params",
    badge: "1B",
    badgeColor: "green",
    group: "Gemma 3",
  },
  {
    value: "models/gemma-3-4b-it",
    label: "Gemma 3 4B IT",
    description: "Small open model — 4 billion params",
    badge: "4B",
    badgeColor: "green",
    group: "Gemma 3",
  },
  {
    value: "models/gemma-3-12b-it",
    label: "Gemma 3 12B IT",
    description: "Medium open model — 12 billion params",
    badge: "12B",
    badgeColor: "blue",
    group: "Gemma 3",
  },
  {
    value: "models/gemma-3-27b-it",
    label: "Gemma 3 27B IT",
    description: "Large open model — 27 billion params",
    badge: "27B",
    badgeColor: "purple",
    group: "Gemma 3",
  },
  {
    value: "models/gemma-3n-e4b-it",
    label: "Gemma 3n E4B IT",
    description: "Efficient 4B nano variant",
    badge: "E4B",
    badgeColor: "cyan",
    group: "Gemma 3",
  },
  {
    value: "models/gemma-3n-e2b-it",
    label: "Gemma 3n E2B IT",
    description: "Efficient 2B nano variant — very lightweight",
    badge: "E2B",
    badgeColor: "cyan",
    group: "Gemma 3",
  },
];

// ── Specialty / preview models ────────────────────────────────────────────────
const SPECIALTY = [
  {
    value: "models/nano-banana-pro-preview",
    label: "Nano Banana Pro Preview",
    description: "Experimental preview model",
    badge: "Preview",
    badgeColor: "orange",
    group: "Specialty",
  },
  {
    value: "models/gemini-robotics-er-1.5-preview",
    label: "Gemini Robotics ER 1.5 Preview",
    description: "Robotics-focused model",
    badge: "Preview",
    badgeColor: "orange",
    group: "Specialty",
  },
  {
    value: "models/gemini-2.5-computer-use-preview-10-2025",
    label: "Gemini 2.5 Computer Use Preview",
    description: "Optimized for computer use / agentic tasks",
    badge: "Preview",
    badgeColor: "orange",
    group: "Specialty",
  },
  {
    value: "models/deep-research-pro-preview-12-2025",
    label: "Deep Research Pro Preview",
    description: "Long-form research and analysis",
    badge: "Preview",
    badgeColor: "orange",
    group: "Specialty",
  },
  {
    value: "models/gemini-embedding-001",
    label: "Gemini Embedding 001",
    description: "Text embeddings — not for chat",
    badge: "Embed",
    badgeColor: "default",
    group: "Specialty",
  },
  {
    value: "models/gemini-embedding-2-preview",
    label: "Gemini Embedding 2 Preview",
    description: "Next-gen embeddings — not for chat",
    badge: "Embed",
    badgeColor: "default",
    group: "Specialty",
  },
  {
    value: "models/aqa",
    label: "AQA",
    description: "Attributed Question Answering model",
    badge: "AQA",
    badgeColor: "default",
    group: "Specialty",
  },
];

// ── Combined export ───────────────────────────────────────────────────────────
export const AI_MODELS = [
  ...GEMINI_25,
  ...GEMINI_20,
  ...GEMINI_3X,
  ...GEMINI_LATEST,
  ...GEMMA_3,
  ...SPECIALTY,
];

/**
 * Models grouped by family — used to render <OptGroup> in the selector.
 * Each key is a group label; value is the array of models in that group.
 */
export const AI_MODELS_GROUPED = {
  "Gemini 2.5":          GEMINI_25,
  "Gemini 2.0":          GEMINI_20,
  "Gemini 3.x Preview":  GEMINI_3X,
  "Latest Aliases":      GEMINI_LATEST,
  "Gemma 3":             GEMMA_3,
  "Specialty":           SPECIALTY,
};

/** Default model — fast and token-efficient */
export const DEFAULT_MODEL = "models/gemini-2.0-flash-lite";
