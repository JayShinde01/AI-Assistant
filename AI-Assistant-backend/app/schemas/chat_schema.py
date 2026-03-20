"""
schemas/chat_schema.py
----------------------
Pydantic schemas for chat session request/response bodies.

ChatCreate  → used when creating or renaming a chat
ChatResponse → returned to the frontend when listing/creating chats
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class ChatCreate(BaseModel):
    """
    Request body for creating or renaming a chat session.
    """
    title: str = Field(..., min_length=1, max_length=200, description="Chat title")

    # Optional: which AI model to use for this chat
    # Defaults to the lightest available model to minimize token usage
    model: str = Field(
        default="models/gemini-2.0-flash-lite",
        description="Gemini model: models/gemini-2.0-flash-lite | models/gemini-2.0-flash-lite-001 | models/gemini-2.0-flash-001",
    )


class ChatResponse(BaseModel):
    """
    Response body returned when listing or creating chat sessions.
    """
    id: UUID
    title: str
    model: str
    created_at: datetime

    class Config:
        # Allows Pydantic to read data from SQLAlchemy ORM objects directly
        from_attributes = True

class AutoTitleResponse(BaseModel):
    """
    Request body for generating an automatic title for a chat session.
    """
    generated_title: str = Field(..., min_length=1, description="The first user message to generate a title from")