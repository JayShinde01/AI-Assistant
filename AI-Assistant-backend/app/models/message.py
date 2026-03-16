"""
models/message.py
-----------------
SQLAlchemy ORM model for the 'messages' table.

Each row is a single message in a chat session.
Role is either "user" (human) or "assistant" (AI).
Optionally stores a file/image attachment URL.
"""

import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    # ── Primary Key ──────────────────────────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Internal UUID primary key",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    chat_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chat_session.id"),
        nullable=False,
        comment="The chat session this message belongs to",
    )

    # ── Message Content ───────────────────────────────────────────────────────
    role = Column(
        String,
        nullable=False,
        comment="Who sent this message: 'user' or 'assistant'",
    )

    message = Column(
        Text,
        nullable=False,
        comment="The text content of the message",
    )

    # ── File Attachment (optional) ────────────────────────────────────────────
    # Stores the server-side path or URL of an uploaded file/image
    attachment_url = Column(
        String,
        nullable=True,
        comment="Path to uploaded file or image (if any)",
    )

    # MIME type of the attachment, e.g. 'image/png', 'application/pdf'
    attachment_type = Column(
        String,
        nullable=True,
        comment="MIME type of the attachment",
    )

    # ── Token Usage ───────────────────────────────────────────────────────────
    # Track how many tokens the AI used to generate this response
    # Only populated for assistant messages
    tokens_used = Column(
        Integer,
        nullable=True,
        comment="Number of tokens consumed by the AI for this response",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="When this message was created",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    chat = relationship("ChatSession", back_populates="messages")
