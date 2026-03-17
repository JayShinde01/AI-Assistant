"""
routes/auth_routes.py
---------------------
Authentication routes — Google OAuth login + current user info.

Endpoints:
  POST /api/auth/google  → Verify Google token, return user info
  GET  /api/auth/me      → Return current user (requires auth)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import GoogleAuth, UserResponse
from app.utils.get_current_user import get_current_user
from app.services.auth_service import get_or_create_user
from app.services.log_service import write_log

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Authentication"])


@router.post("/auth/google", response_model=UserResponse)
def google_login(data: GoogleAuth, db: Session = Depends(get_db)):
    """
    Verify a Google OAuth2 ID token and log the user in.
    Creates the user in our DB if it's their first time.
    """
    logger.info("Google login attempt received")

    user = get_or_create_user(data.token, db)

    if not user:
        # Log failed login attempts — useful for security audits
        write_log(db, event="login_failed", level="WARNING", detail="Invalid Google token")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google token. Please try logging in again.",
        )

    # Log successful login — who logged in and when
    write_log(db, event="user_login", level="INFO", user_email=user.email,
              detail=f"User logged in: {user.name}")

    logger.info(f"User logged in: {user.email}")

    return UserResponse(
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        picture=user.picture,
    )


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Return the currently authenticated user's profile.
    Useful for the frontend to refresh user info on page load.
    """
    return UserResponse(
        user_id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        picture=current_user.picture,
    )
