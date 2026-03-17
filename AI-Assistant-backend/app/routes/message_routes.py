"""
routes/message_routes.py
------------------------
Routes for sending and retrieving messages within a chat session.

Endpoints:
  GET  /api/chats/{chat_id}/messages         → Load chat history
  POST /api/chats/{chat_id}/messages         → Send message, get AI reply (normal)
  POST /api/chats/{chat_id}/messages/stream  → Send message, stream AI reply (live typing)
  POST /api/chats/temp                       → Stateless temp chat (no DB storage)
"""

import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.chat_session import ChatSession
from app.schemas.message_schema import (
    MessageCreate, MessageResponse, AIReply,
    TempChatRequest, TempChatReply,
)
from app.services.gemini_service import (
    generate_ai_response, generate_temp_response, generate_ai_stream,
)
from app.services.log_service import write_log
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
    """Load all messages in a chat, ordered oldest → newest."""
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at)
        .all()
    )


@router.post("/{chat_id}/messages", response_model=AIReply)
def send_message(
    chat_id: UUID,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a user message and get a full AI reply (non-streaming).

    Flow:
      1. Validate chat ownership
      2. Save user message
      3. Fetch last N messages for context (keeps token usage low)
      4. Call Gemini API
      5. Save AI reply
      6. Log the interaction to DB
    """
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Save user message
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

    # Fetch recent history — limit to MAX_HISTORY_MESSAGES to save tokens
    recent_messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )
    recent_messages.reverse()

    # Call Gemini
    try:
        ai_text, tokens_used = generate_ai_response(
            messages=recent_messages,
            model_name=chat.model,
        )
    except Exception as e:
        write_log(db, event="ai_error", level="ERROR", user_email=current_user.email,
                  detail=str(e))
        raise HTTPException(status_code=500, detail="AI service error")

    # Save AI reply
    ai_message = Message(
        chat_id=chat_id,
        role="assistant",
        message=ai_text,
        tokens_used=tokens_used,
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    # Log the interaction — helpful for debugging and usage tracking
    write_log(
        db, event="ai_response", level="INFO",
        user_email=current_user.email,
        detail=f"model={chat.model} tokens={tokens_used} chat={chat_id}",
    )

    logger.info(f"Message sent | chat={chat_id} | model={chat.model} | tokens={tokens_used}")

    return AIReply(reply=ai_text, chat_id=chat_id, tokens_used=tokens_used)


@router.post("/{chat_id}/messages/stream")
def stream_message(
    chat_id: UUID,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Stream an AI reply chunk by chunk — gives the live typing effect like ChatGPT.

    The frontend reads this as a Server-Sent Events (SSE) stream.
    Each chunk is a JSON line: {"chunk": "..."} or {"done": true, "tokens": N}

    Flow:
      1. Save user message to DB
      2. Start streaming from Gemini
      3. Collect full reply while streaming
      4. After stream ends, save the full AI reply to DB
    """
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Save user message first
    user_message = Message(
        chat_id=chat_id,
        role="user",
        message=body.message,
        attachment_url=body.attachment_url,
        attachment_type=body.attachment_type,
    )
    db.add(user_message)
    db.commit()

    # Fetch recent history for context
    recent_messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )
    recent_messages.reverse()

    def event_generator():
        """
        Generator that streams chunks to the frontend.
        After all chunks are sent, saves the full reply to the DB.
        """
        full_reply = []

        for chunk in generate_ai_stream(messages=recent_messages, model_name=chat.model):
            full_reply.append(chunk)
            # Send each chunk as a JSON line — frontend parses this
            yield json.dumps({"chunk": chunk}) + "\n"

        # Stream is done — save the complete reply to DB
        complete_text = "".join(full_reply)
        ai_message = Message(
            chat_id=chat_id,
            role="assistant",
            message=complete_text,
            tokens_used=0,  # Streaming doesn't return token count easily
        )
        db.add(ai_message)
        db.commit()

        # Log it
        write_log(
            db, event="ai_stream_response", level="INFO",
            user_email=current_user.email,
            detail=f"model={chat.model} chat={chat_id} chars={len(complete_text)}",
        )

        # Tell the frontend the stream is complete
        yield json.dumps({"done": True}) + "\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/plain",
        headers={"X-Accel-Buffering": "no"},  # Disable nginx buffering for real-time streaming
    )


@router.post("/temp", response_model=TempChatReply)
def temp_chat(
    body: TempChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Stateless temp chat — nothing is saved to the database.
    The frontend manages history locally and sends it with each request.
    """
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    ai_text, tokens_used = generate_temp_response(
        message=body.message,
        history=body.history,
        model_name=body.model,
    )

    return TempChatReply(reply=ai_text, tokens_used=tokens_used)
