"""
models/user.py
--------------
SQLAlchemy ORM model for the 'users' table.

Each row represents a user who has authenticated via Google OAuth.
The google_id is the stable unique identifier from Google.
"""

import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    # ── Primary Key ──────────────────────────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Internal UUID primary key",
    )

    # ── Google OAuth Fields ───────────────────────────────────────────────────
    google_id = Column(
        String,
        unique=True,
        nullable=False,
        comment="Unique Google user ID (sub field from Google token)",
    )
    email = Column(
        String,
        unique=True,
        nullable=False,
        comment="User's Google email address",
    )
    name = Column(
        String,
        nullable=True,
        comment="User's display name from Google profile",
    )
    picture = Column(
        String,
        nullable=True,
        comment="URL to user's Google profile picture",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp when the user first logged in",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    # One user can have many chat sessions
    chats = relationship("ChatSession", back_populates="user", cascade="all, delete")
