"""
routes/message_routes.py
------------------------
Routes for sending and retrieving messages within a chat session.

Endpoints:
  GET  /api/chats/{chat_id}/messages  → Load chat history
  POST /api/chats/{chat_id}/messages  → Send a message and get AI reply
  POST /api/chats/temp                → Stateless temp chat (no DB storage)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.chat_session import ChatSession
from app.schemas.message_schema import (
    MessageCreate,
    MessageResponse,
    AIReply,
    TempChatRequest,
    TempChatReply,
)
from app.services.gemini_service import generate_ai_response, generate_temp_response
from app.utils.get_current_user import get_current_user
from app.config import MAX_HISTORY_MESSAGES

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chats", tags=["Messages"])


@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def get_messages(
    chat_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all messages in a chat session, ordered oldest → newest.

    This is called when the user opens a chat to load the full history.
    """
    # Verify the chat belongs to the current user
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at)
        .all()
    )
    return messages


@router.post("/{chat_id}/messages", response_model=AIReply)
def send_message(
    chat_id: UUID,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a user message and receive an AI-generated reply.

    Flow:
      1. Validate the chat belongs to the current user
      2. Save the user's message to the database
      3. Fetch the last N messages for context (token-efficient)
      4. Call the Gemini API with the conversation history
      5. Save the AI reply to the database
      6. Return the reply + token usage to the frontend

    The MAX_HISTORY_MESSAGES limit keeps token usage low by only sending
    recent context to the AI instead of the entire conversation.
    """

    # ── Step 1: Validate chat ownership ───────────────────────────────────────
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # ── Step 2: Save the user's message ───────────────────────────────────────
    user_message = Message(
        chat_id=chat_id,
        role="user",
        message=body.message,
        attachment_url=body.attachment_url,
        attachment_type=body.attachment_type,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # ── Step 3: Fetch recent history for context ───────────────────────────────
    # We limit to MAX_HISTORY_MESSAGES to control token usage.
    # Fetching desc then reversing gives us the most recent N messages in order.
    recent_messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )
    recent_messages.reverse()  # Put back in chronological order

    # ── Step 4: Call Gemini API ────────────────────────────────────────────────
    ai_text, tokens_used = generate_ai_response(
        messages=recent_messages,
        model_name=chat.model,  # Use the model selected for this chat
    )

    # ── Step 5: Save the AI reply ──────────────────────────────────────────────
    ai_message = Message(
        chat_id=chat_id,
        role="assistant",
        message=ai_text,
        tokens_used=tokens_used,
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    logger.info(
        f"Message sent in chat {chat_id} | Model: {chat.model} | Tokens: {tokens_used}"
    )

    return AIReply(
        reply=ai_text,
        chat_id=chat_id,
        tokens_used=tokens_used,
    )


@router.post("/temp", response_model=TempChatReply)
def temp_chat(
    body: TempChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Stateless / temporary chat — no messages are saved to the database.

    Use this for quick one-off questions where the user doesn't want
    to create a persistent chat session. The frontend manages the
    conversation history locally and sends it with each request.

    This is more token-efficient for short conversations since we don't
    load history from the database.
    """
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    ai_text, tokens_used = generate_temp_response(
        message=body.message,
        history=body.history,
        model_name=body.model,
    )

    return TempChatReply(reply=ai_text, tokens_used=tokens_used)
