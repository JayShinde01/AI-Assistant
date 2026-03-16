"""
config.py
---------
Centralized configuration loader for the AI Assistant backend.

All environment variables are loaded here from the .env file using python-dotenv.
Import from this module instead of using os.getenv() directly in other files.
"""

import os
from dotenv import load_dotenv

# Load variables from .env file into the environment
load_dotenv()

# ─── Database ────────────────────────────────────────────────────────────────
# PostgreSQL connection string, e.g. postgresql://user:pass@host:port/dbname
DATABASE_URL: str = os.getenv("DATABASE_URL", "")

# ─── AI / Gemini ─────────────────────────────────────────────────────────────
# Google Gemini API key — get yours at https://aistudio.google.com/
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

# ─── Google OAuth ────────────────────────────────────────────────────────────
# Google OAuth 2.0 Client ID — used to verify Google login tokens
GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

# ─── App Settings ────────────────────────────────────────────────────────────
# Maximum number of previous messages to send to the AI for context
# Keeping this low saves tokens and reduces latency
MAX_HISTORY_MESSAGES: int = int(os.getenv("MAX_HISTORY_MESSAGES", "20"))

# Maximum file size allowed for uploads (in bytes). Default: 5 MB
MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(5 * 1024 * 1024)))

# Allowed MIME types for file uploads
ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_FILE_TYPES: list[str] = ALLOWED_IMAGE_TYPES + ["application/pdf", "text/plain"]
