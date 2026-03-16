"""
schemas/__init__.py
-------------------
Exports all Pydantic schemas for clean imports across the app.
"""

from app.schemas.auth_schema import GoogleAuth, UserResponse
from app.schemas.chat_schema import ChatCreate, ChatResponse
from app.schemas.message_schema import (
    MessageCreate,
    MessageResponse,
    AIReply,
    TempChatRequest,
    TempChatReply,
)

__all__ = [
    "GoogleAuth",
    "UserResponse",
    "ChatCreate",
    "ChatResponse",
    "MessageCreate",
    "MessageResponse",
    "AIReply",
    "TempChatRequest",
    "TempChatReply",
]
