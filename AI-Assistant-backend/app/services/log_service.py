# services/log_service.py
# A simple helper to write structured logs into the database.
# This is super useful when the server restarts — you can still see what happened.

import logging
from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog

logger = logging.getLogger(__name__)


def write_log(
    db: Session,
    event: str,
    level: str = "INFO",
    user_email: str = None,
    detail: str = None,
):
    """
    Save a log entry to the database.

    Args:
        db:         Database session
        event:      Short event name, e.g. "user_login", "ai_response", "upload_file"
        level:      "INFO", "WARNING", or "ERROR"
        user_email: Who triggered this (optional)
        detail:     Any extra info — error message, model used, tokens, etc.
    """
    try:
        log = ActivityLog(
            level=level,
            event=event,
            user_email=user_email,
            detail=detail,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        # Don't crash the main request just because logging failed
        logger.error(f"Failed to write log to DB: {e}")
