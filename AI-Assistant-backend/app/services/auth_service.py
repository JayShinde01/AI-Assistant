"""
services/auth_service.py
------------------------
Business logic for user authentication.

This service handles the "get or create" pattern:
- If the user has logged in before → fetch from DB
- If it's their first login → create a new user record

This is called on every API request (via get_current_user dependency)
to validate the Google token and identify the user.
"""

import logging
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.token_verifier import verify_google_token

logger = logging.getLogger(__name__)


def get_or_create_user(token: str, db: Session) -> User | None:
    """
    Verify a Google token and return the corresponding User from the database.
    If the user doesn't exist yet, create a new record.

    Args:
        token: Raw Google OAuth2 ID token string.
        db:    SQLAlchemy database session.

    Returns:
        User ORM object if token is valid, None otherwise.
    """

    # ── Step 1: Verify the Google token ───────────────────────────────────────
    user_data = verify_google_token(token)

    if not user_data:
        logger.warning("Token verification returned None — invalid token")
        return None

    # ── Step 2: Extract user info from the verified token payload ─────────────
    google_id: str = user_data["sub"]          # Stable unique Google user ID
    email: str = user_data["email"]
    name: str | None = user_data.get("name")
    picture: str | None = user_data.get("picture")

    # ── Step 3: Look up existing user by google_id ────────────────────────────
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        # ── Step 4: First-time login — create a new user record ───────────────
        logger.info(f"New user signing up: {email}")
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # ── Step 5: Update profile info in case it changed on Google ──────────
        # (e.g., user changed their profile picture)
        updated = False
        if user.name != name:
            user.name = name
            updated = True
        if user.picture != picture:
            user.picture = picture
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    return user
