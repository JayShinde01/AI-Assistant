"""
main.py
-------
FastAPI application entry point for the AI Assistant backend.

This file:
  - Creates the FastAPI app instance
  - Registers middleware (CORS)
  - Includes all route routers
  - Creates database tables on startup
  - Serves uploaded files as static assets
  - Provides a health check endpoint

To run the server:
    uvicorn app.main:app --reload --port 8000
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import Base, engine
from app.routes import auth_routes, chat_routes, message_routes, upload_routes

# ── Logging setup ─────────────────────────────────────────────────────────────
# Configure basic logging so we can see info/warning/error messages in the console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Create FastAPI app ────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Assistant API",
    description="Backend API for the AI Chat Assistant — powered by Google Gemini",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI at http://localhost:8000/docs
    redoc_url="/redoc",     # ReDoc UI at http://localhost:8000/redoc
)

# ── Database table creation ───────────────────────────────────────────────────
# Creates all tables defined in ORM models if they don't already exist.
# In production, use Alembic migrations instead of create_all().
logger.info("Creating database tables if they don't exist...")
Base.metadata.create_all(bind=engine)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# CORS (Cross-Origin Resource Sharing) allows the frontend (running on a
# different port/domain) to make requests to this backend.
#
# ⚠️  In production, replace "*" with your actual frontend domain:
#     allow_origins=["https://your-app.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-assistant-frontend-9qwn.onrender.com"],          # Allow all origins (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],          # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],          # Allow all headers including Authorization
)

# ── Static file serving ───────────────────────────────────────────────────────
# Serve uploaded files (images, PDFs, etc.) at /uploads/<filename>
# The uploads/ directory is created by upload_routes.py
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Register routers ──────────────────────────────────────────────────────────
# Each router handles a group of related endpoints
app.include_router(auth_routes.router)       # /api/auth/*
app.include_router(chat_routes.router)       # /api/chats/*
app.include_router(message_routes.router)    # /api/chats/{id}/messages, /api/chats/temp
app.include_router(upload_routes.router)     # /api/upload


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/", tags=["Health"])
def health_check():
    """
    Simple health check endpoint.
    Returns a 200 OK with a status message.
    Used by load balancers and monitoring tools to verify the server is running.
    """
    return {"status": "ok", "message": "AI Assistant Backend is running"}
