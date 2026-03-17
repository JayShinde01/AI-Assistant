# models/activity_log.py
# Stores structured logs in the database.
# Useful for debugging, auditing, and recovering context after server restarts.

import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level      = Column(String, nullable=False)          # INFO | WARNING | ERROR
    event      = Column(String, nullable=False)          # e.g. "user_login", "ai_response"
    user_email = Column(String, nullable=True)           # who triggered it (if known)
    detail     = Column(Text, nullable=True)             # extra context / error message
    created_at = Column(DateTime(timezone=True), server_default=func.now())
