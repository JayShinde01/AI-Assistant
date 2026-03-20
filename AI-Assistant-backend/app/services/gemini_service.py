"""
services/gemini_service.py
--------------------------
Service layer for interacting with the Google Gemini AI API.

This module handles:
  - Initializing Gemini models (one instance per model name, cached)
  - Building the conversation history in the format Gemini expects
  - Generating AI responses with token usage tracking
  - Supporting image/file inputs via base64 encoding
  - Temp (stateless) chat for quick one-off questions

Supported models (all optimized for low token usage):
  - models/gemini-2.0-flash-lite   → Lightest model, lowest token cost
  - models/gemini-2.0-flash-lite-001 → Pinned stable version of Flash Lite
  - models/gemini-2.0-flash-001    → Full Flash, more capable, still efficient
"""

import base64
import logging
from typing import Optional
import google.generativeai as genai

from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# ── Configure Gemini with our API key ─────────────────────────────────────────
genai.configure(api_key=GEMINI_API_KEY)

# ── Model cache ───────────────────────────────────────────────────────────────
# We cache model instances so we don't recreate them on every request.
# This is a simple in-memory cache — fine for a single-process server.
_model_cache: dict[str, genai.GenerativeModel] = {}

# All available models — full "models/<name>" path required by the Gemini SDK.
# Note: embedding/TTS models are included for completeness but don't support
# multi-turn chat — the frontend labels them accordingly.
AVAILABLE_MODELS = {
    # ── Gemini 2.5 series ─────────────────────────────────────────────────────
    "models/gemini-2.5-flash":                        "Gemini 2.5 Flash",
    "models/gemini-2.5-pro":                          "Gemini 2.5 Pro",
    "models/gemini-2.5-flash-lite":                   "Gemini 2.5 Flash Lite",
    "models/gemini-2.5-flash-image":                  "Gemini 2.5 Flash Image",
    "models/gemini-2.5-flash-lite-preview-09-2025":   "Gemini 2.5 Flash Lite Preview (09-2025)",
    "models/gemini-2.5-flash-preview-tts":            "Gemini 2.5 Flash Preview TTS",
    "models/gemini-2.5-pro-preview-tts":              "Gemini 2.5 Pro Preview TTS",
    # ── Gemini 2.0 series ─────────────────────────────────────────────────────
    "models/gemini-2.0-flash":                        "Gemini 2.0 Flash",
    "models/gemini-2.0-flash-001":                    "Gemini 2.0 Flash 001",
    "models/gemini-2.0-flash-lite":                   "Gemini 2.0 Flash Lite",
    "models/gemini-2.0-flash-lite-001":               "Gemini 2.0 Flash Lite 001",
    # ── Gemini 3.x preview series ─────────────────────────────────────────────
    "models/gemini-3-pro-preview":                    "Gemini 3 Pro Preview",
    "models/gemini-3-flash-preview":                  "Gemini 3 Flash Preview",
    "models/gemini-3.1-pro-preview":                  "Gemini 3.1 Pro Preview",
    "models/gemini-3.1-pro-preview-customtools":      "Gemini 3.1 Pro Preview (Custom Tools)",
    "models/gemini-3.1-flash-lite-preview":           "Gemini 3.1 Flash Lite Preview",
    "models/gemini-3-pro-image-preview":              "Gemini 3 Pro Image Preview",
    "models/gemini-3.1-flash-image-preview":          "Gemini 3.1 Flash Image Preview",
    # ── Gemini latest aliases ─────────────────────────────────────────────────
    "models/gemini-flash-latest":                     "Gemini Flash (Latest)",
    "models/gemini-flash-lite-latest":                "Gemini Flash Lite (Latest)",
    "models/gemini-pro-latest":                       "Gemini Pro (Latest)",
    # ── Gemma 3 open models ───────────────────────────────────────────────────
    "models/gemma-3-1b-it":                           "Gemma 3 1B IT",
    "models/gemma-3-4b-it":                           "Gemma 3 4B IT",
    "models/gemma-3-12b-it":                          "Gemma 3 12B IT",
    "models/gemma-3-27b-it":                          "Gemma 3 27B IT",
    "models/gemma-3n-e4b-it":                         "Gemma 3n E4B IT",
    "models/gemma-3n-e2b-it":                         "Gemma 3n E2B IT",
    # ── Specialty / preview models ────────────────────────────────────────────
    "models/nano-banana-pro-preview":                 "Nano Banana Pro Preview",
    "models/gemini-robotics-er-1.5-preview":          "Gemini Robotics ER 1.5 Preview",
    "models/gemini-2.5-computer-use-preview-10-2025": "Gemini 2.5 Computer Use Preview (10-2025)",
    "models/deep-research-pro-preview-12-2025":       "Deep Research Pro Preview (12-2025)",
    # ── Embedding models (not for chat) ───────────────────────────────────────
    "models/gemini-embedding-001":                    "Gemini Embedding 001",
    "models/gemini-embedding-2-preview":              "Gemini Embedding 2 Preview",
    # ── AQA ───────────────────────────────────────────────────────────────────
    "models/aqa":                                     "AQA",
}

# Default model — good balance of speed and token efficiency
DEFAULT_MODEL = "models/gemma-3-4b-it"


def _get_model(model_name: str) -> genai.GenerativeModel:
    """
    Return a cached GenerativeModel instance for the given model name.
    Creates a new instance if one doesn't exist yet.

    Args:
        model_name: One of the keys in AVAILABLE_MODELS (e.g. "models/gemini-2.0-flash-lite").

    Returns:
        A genai.GenerativeModel instance.
    """
    if model_name not in _model_cache:
        # Validate model name — fall back to the lightest model if unknown
        if model_name not in AVAILABLE_MODELS:
            logger.warning(f"Unknown model '{model_name}', falling back to {DEFAULT_MODEL}")
            model_name = DEFAULT_MODEL

        logger.info(f"Initializing Gemini model: {model_name}")
        _model_cache[model_name] = genai.GenerativeModel(model_name)

    return _model_cache[model_name]


def generate_ai_response(
    messages: list,
    model_name: str = "gemini-1.5-flash",
    attachment_data: Optional[bytes] = None,
    attachment_mime: Optional[str] = None,
) -> tuple[str, int]:
    """
    Generate an AI response given a list of Message ORM objects.

    Args:
        messages:        List of Message ORM objects (ordered oldest → newest).
        model_name:      Which Gemini model to use.
        attachment_data: Raw bytes of an uploaded file/image (optional).
        attachment_mime: MIME type of the attachment, e.g. 'image/png' (optional).

    Returns:
        A tuple of (reply_text, tokens_used).
        tokens_used is 0 if the API doesn't return usage metadata.
    """
    try:
        model = _get_model(model_name)

        # ── Build conversation history ─────────────────────────────────────────
        # Gemini expects a list of dicts with "role" and "parts" keys.
        # Roles must be "user" or "model" (not "assistant").
        prompt_parts = []

        for msg in messages:
            gemini_role = "user" if msg.role == "user" else "model"
            prompt_parts.append({
                "role": gemini_role,
                "parts": [msg.message],
            })

        # ── Attach file/image to the last user message ────────────────────────
        if attachment_data and attachment_mime and prompt_parts:
            last_msg = prompt_parts[-1]
            if last_msg["role"] == "user":
                # Gemini accepts inline image data as a dict with mime_type + data
                last_msg["parts"].append({
                    "inline_data": {
                        "mime_type": attachment_mime,
                        "data": base64.b64encode(attachment_data).decode("utf-8"),
                    }
                })

        # ── Call the Gemini API ────────────────────────────────────────────────
        response = model.generate_content(prompt_parts)

        reply_text = response.text

        # ── Extract token usage ────────────────────────────────────────────────
        # usage_metadata is available on most Gemini responses
        tokens_used = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            tokens_used = getattr(response.usage_metadata, "total_token_count", 0)

        logger.info(f"Gemini [{model_name}] responded. Tokens used: {tokens_used}")
        return reply_text, tokens_used

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return "Sorry, the AI service is temporarily unavailable. Please try again.", 0


def generate_temp_response(
    message: str,
    history: list[dict],
    model_name: str = "gemini-1.5-flash",
) -> tuple[str, int]:
    """
    Generate a one-off AI response without saving anything to the database.
    Used for the "Temp Chat" feature.

    Args:
        message:    The user's current message.
        history:    Previous messages as dicts [{role, message}, ...].
        model_name: Which Gemini model to use.

    Returns:
        A tuple of (reply_text, tokens_used).
    """
    try:
        model = _get_model(model_name)

        # Build history from the provided dicts
        prompt_parts = []
        for item in history:
            gemini_role = "user" if item.get("role") == "user" else "model"
            prompt_parts.append({
                "role": gemini_role,
                "parts": [item.get("message", "")],
            })

        # Append the current user message
        prompt_parts.append({
            "role": "user",
            "parts": [message],
        })

        response = model.generate_content(prompt_parts)
        reply_text = response.text

        tokens_used = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            tokens_used = getattr(response.usage_metadata, "total_token_count", 0)

        return reply_text, tokens_used

    except Exception as e:
        logger.error(f"Gemini temp chat error: {e}")
        return "Sorry, the AI service is temporarily unavailable.", 0


def generate_ai_stream(
    messages: list,
    model_name: str = DEFAULT_MODEL,
    attachment_data: Optional[bytes] = None,
    attachment_mime: Optional[str] = None,
):
    """
    Stream an AI response chunk by chunk — like ChatGPT's typing effect.

    This is a generator function. Each yield is a small piece of the response text.
    The caller (StreamingResponse) sends each chunk to the frontend as it arrives.

    Args:
        messages:        List of Message ORM objects (oldest → newest).
        model_name:      Which Gemini model to use.
        attachment_data: Raw bytes of an uploaded file/image (optional).
        attachment_mime: MIME type of the attachment (optional).

    Yields:
        str — small text chunks from the AI response.
    """
    try:
        model = _get_model(model_name)

        # Build conversation history (same format as non-streaming)
        prompt_parts = []
        for msg in messages:
            gemini_role = "user" if msg.role == "user" else "model"
            prompt_parts.append({"role": gemini_role, "parts": [msg.message]})

        # Attach file/image to the last user message if provided
        if attachment_data and attachment_mime and prompt_parts:
            last_msg = prompt_parts[-1]
            if last_msg["role"] == "user":
                last_msg["parts"].append({
                    "inline_data": {
                        "mime_type": attachment_mime,
                        "data": base64.b64encode(attachment_data).decode("utf-8"),
                    }
                })

        # stream=True tells Gemini to send chunks as they're generated
        response = model.generate_content(prompt_parts, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        logger.error(f"Gemini stream error: {e}")
        yield "Sorry, the AI service is temporarily unavailable."


def generate_title(msg: str) -> str:
    try:
        model = _get_model(DEFAULT_MODEL)

        prompt = f"""
        Generate a short 2-3 word title for this chat.
        Only return the title, no explanation.

        Message:
        {msg}
        """
        print("in generate title1")

        response = model.generate_content(prompt)
        print("in generate title2")

        title = response.text.strip()
        print("in generate title",title)

        # Safety cleanup
        if not title:
            return "New Chat"

        # Optional: limit to 3 words
        title = " ".join(title.split()[:3])

        return title

    except Exception as e:
        logger.error(f"Gemini title generation error: {e}")
        return "New Chat"