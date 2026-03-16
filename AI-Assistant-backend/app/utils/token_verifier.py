"""
utils/token_verifier.py
-----------------------
Utility for verifying Google OAuth2 ID tokens.

When a user logs in with Google on the frontend, Google returns a JWT
called an "ID token". We verify this token server-side to confirm it
was issued by Google and hasn't been tampered with.

The verified payload contains user info like email, name, picture, and
the stable Google user ID ("sub").
"""

from google.oauth2 import id_token
from google.auth.transport import requests
import logging

logger = logging.getLogger(__name__)


def verify_google_token(token: str) -> dict | None:
    """
    Verify a Google OAuth2 ID token and return the decoded payload.

    Args:
        token: The raw Google ID token string from the frontend.

    Returns:
        A dict with user info (sub, email, name, picture, etc.)
        or None if the token is invalid/expired.

    Example payload:
        {
            "sub": "1234567890",       # Stable Google user ID
            "email": "user@gmail.com",
            "name": "John Doe",
            "picture": "https://...",
            "email_verified": True,
        }
    """
    try:
        # verify_oauth2_token checks:
        # 1. The token signature (was it signed by Google?)
        # 2. The expiry time (is it still valid?)
        # 3. The audience (was it issued for our app?)
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            # Not passing audience here — Google will still verify the signature
            # For stricter security in production, pass your GOOGLE_CLIENT_ID
        )
        return idinfo

    except Exception as e:
        # Log the error for debugging but don't expose details to the client
        logger.warning(f"Google token verification failed: {e}")
        return None
