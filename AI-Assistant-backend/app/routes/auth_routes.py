"""
routes/auth_routes.py
---------------------
Authentication routes for the AI Assistant API.

Endpoints:
  POST /api/auth/google  → Verify Google OAuth token, return user info
  GET  /api/auth/me      → Return current user info (requires auth)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import GoogleAuth, UserResponse
from app.utils.get_current_user import get_current_user
from app.services.auth_service import get_or_create_user

logger = logging.getLogger(__name__)

# All routes in this file are prefixed with /api
router = APIRouter(prefix="/api", tags=["Authentication"])


@router.post("/auth/google", response_model=UserResponse)
def google_login(data: GoogleAuth, db: Session = Depends(get_db)):
    """
    Verify a Google OAuth2 ID token and log the user in.

    The frontend sends the raw credential token from the Google Sign-In button.
    We verify it server-side, then create or retrieve the user from our database.

    Returns:
        UserResponse with user_id, email, name, and picture.

    Raises:
        HTTPException 401: If the Google token is invalid or expired.
    """
    logger.info("Google login attempt received")

    # Verify token and get/create user in one step
    user = get_or_create_user(data.token, db)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google token. Please try logging in again.",
        )

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
    Requires a valid Bearer token in the Authorization header.
    """
    return UserResponse(
        user_id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        picture=current_user.picture,
    )
