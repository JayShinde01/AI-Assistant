"""
schemas/message_schema.py
-------------------------
Pydantic schemas for message request/response bodies.

MessageCreate  → sent by the frontend when the user sends a message
MessageResponse → returned when loading chat history
AIReply        → returned immediately after the AI responds
TempChatRequest → for stateless/temporary chat (no DB storage)
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class MessageCreate(BaseModel):
    """
    Request body for POST /chats/{chat_id}/messages.
    The frontend sends the user's text message.
    Optionally includes a pre-uploaded file URL.
    """
    message: str = Field(..., min_length=1, description="User's message text")

    # Optional: URL of a file/image that was uploaded before sending the message
    attachment_url: Optional[str] = Field(None, description="URL of uploaded file/image")
    attachment_type: Optional[str] = Field(None, description="MIME type of the attachment")


class MessageResponse(BaseModel):
    """
    Schema for a single message returned from the database.
    Used when loading chat history.
    """
    id: UUID
    role: str                          # "user" or "assistant"
    message: str
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    tokens_used: Optional[int] = None  # Only set for assistant messages
    created_at: datetime

    class Config:
        from_attributes = True


class AIReply(BaseModel):
    """
    Response body returned after the AI generates a reply.
    Includes the reply text and token usage for transparency.
    """
    reply: str
    chat_id: UUID
    tokens_used: Optional[int] = None  # How many tokens the AI consumed


class TempChatRequest(BaseModel):
    """
    Request body for POST /chats/temp — a stateless chat that does NOT
    save messages to the database. Useful for quick one-off questions.
    """
    message: str = Field(..., min_length=1, description="User's message")
    model: str = Field(
        default="models/gemini-2.0-flash-lite",
        description="Which Gemini model to use",
    )
    # Optional: previous messages to maintain context in temp chat
    history: list[dict] = Field(
        default=[],
        description="Previous messages [{role: 'user'|'assistant', message: '...'}]",
    )


class TempChatReply(BaseModel):
    """
    Response body for temp chat — just the AI reply and token usage.
    """
    reply: str
    tokens_used: Optional[int] = None
