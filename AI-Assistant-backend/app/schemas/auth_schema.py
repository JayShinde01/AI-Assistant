"""
schemas/auth_schema.py
----------------------
Pydantic schemas for authentication-related request/response bodies.

Pydantic validates incoming JSON automatically — if a required field is
missing or has the wrong type, FastAPI returns a 422 error automatically.
"""

from pydantic import BaseModel


class GoogleAuth(BaseModel):
    """
    Request body for POST /api/auth/google.
    The frontend sends the raw Google credential token after the user
    clicks the Google Sign-In button.
    """
    token: str  # Raw Google OAuth2 ID token (JWT string)


class UserResponse(BaseModel):
    """
    Response body returned after a successful Google login.
    """
    user_id: str
    email: str
    name: str | None = None
    picture: str | None = None
