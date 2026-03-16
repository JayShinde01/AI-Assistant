"""
utils/get_current_user.py
-------------------------
FastAPI dependency that extracts and validates the current authenticated user
from the Authorization header on every protected request.

Usage in a route:
    @router.get("/protected")
    def protected_route(current_user: User = Depends(get_current_user)):
        return {"email": current_user.email}

The frontend must send:
    Authorization: Bearer <google_id_token>
"""

import logging
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import get_or_create_user

logger = logging.getLogger(__name__)


def get_current_user(
    authorization: str = Header(..., description="Bearer <google_id_token>"),
    db: Session = Depends(get_db),
):
    """
    Dependency that:
    1. Reads the Authorization header
    2. Extracts the Bearer token
    3. Verifies it with Google
    4. Returns the User ORM object (creating the user if first login)

    Raises:
        HTTPException 401: If the header is missing, malformed, or token is invalid.
    """

    # ── Step 1: Check header format ───────────────────────────────────────────
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization header must be in format: Bearer <token>",
        )

    # ── Step 2: Extract the raw token ─────────────────────────────────────────
    token = authorization.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=401, detail="Token is missing")

    # ── Step 3: Verify token and get/create user ──────────────────────────────
    user = get_or_create_user(token, db)

    if not user:
        logger.warning("Failed to authenticate user — invalid Google token")
        raise HTTPException(status_code=401, detail="Invalid or expired Google token")

    return user
