"""
models/chat_session.py
----------------------
SQLAlchemy ORM model for the 'chat_sessions' table.

Each row represents a single conversation thread belonging to a user.
A chat session contains many messages.
"""

import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class ChatSession(Base):
    __tablename__ = "chat_session"

    # ── Primary Key ──────────────────────────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Internal UUID primary key",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        comment="The user who owns this chat session",
    )

    # ── Chat Metadata ─────────────────────────────────────────────────────────
    title = Column(
        String,
        nullable=False,
        default="New Chat",
        comment="Display title shown in the sidebar",
    )

    # Which AI model was selected for this chat session
    # e.g. "models/gemini-2.0-flash-lite", "models/gemini-2.0-flash-001"
    model = Column(
        String,
        nullable=False,
        default="models/gemini-2.0-flash-lite",
        comment="Gemini model used for this chat session",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="When this chat session was created",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user = relationship("User", back_populates="chats")

    # cascade="all, delete" means deleting a chat also deletes all its messages
    messages = relationship("Message", back_populates="chat", cascade="all, delete")
