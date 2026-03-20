"""
routes/chat_routes.py
---------------------
Routes for managing chat sessions.

Endpoints:
  GET    /api/chats              → List all chats for the current user
  POST   /api/chats              → Create a new chat session
  PUT    /api/chats/{chat_id}    → Rename a chat session
  DELETE /api/chats/{chat_id}    → Delete a chat session and all its messages
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.chat_session import ChatSession
from app.schemas.chat_schema import AutoTitleResponse, ChatCreate, ChatResponse
from app.utils.get_current_user import get_current_user
from app.services.gemini_service import generate_title
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chats", tags=["Chats"])


@router.get("/", response_model=list[ChatResponse])
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all chat sessions belonging to the current user,
    ordered by most recently created first.
    """
    chats = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())  # newest first
        .all()
    )
    return chats


@router.post("/", response_model=ChatResponse)
def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new chat session for the current user.

    The frontend sends a title and optionally a model name.
    Returns the newly created chat session.
    """
    new_chat = ChatSession(
        title=chat.title,
        model=chat.model,
        user_id=current_user.id,
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    logger.info(f"New chat created: '{chat.title}' (model: {chat.model}) for user {current_user.email}")
    return new_chat


@router.put("/{chat_id}", response_model=ChatResponse)
def update_chat(
    chat_id: UUID,
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Rename a chat session.

    Only the owner of the chat can rename it.
    Raises 404 if the chat doesn't exist or doesn't belong to the user.
    """
    db_chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )

    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db_chat.title = chat.title
    db.commit()
    db.refresh(db_chat)

    return db_chat


@router.delete("/{chat_id}")
def delete_chat(
    chat_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a chat session and all its messages.

    The cascade="all, delete" on the ChatSession.messages relationship
    ensures all associated messages are deleted automatically.

    Raises 404 if the chat doesn't exist or doesn't belong to the user.
    """
    db_chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id, ChatSession.user_id == current_user.id)
        .first()
    )

    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(db_chat)
    db.commit()

    logger.info(f"Chat {chat_id} deleted by user {current_user.email}")
    return {"message": "Chat deleted successfully"}


@router.put("/autotitle/{chat_id}", response_model=AutoTitleResponse)
def generate_chat_title(
    chat_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── 1. Get chat ─────────────────────────────────────────────
    db_chat = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_id,
            ChatSession.user_id == current_user.id
        )
        .first()
    )

    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # ── 2. Check messages exist ─────────────────────────────────
    if not db_chat.messages:
        raise HTTPException(status_code=400, detail="No messages found in this chat")

    # ── 3. Get only USER messages (important) ───────────────────
    user_messages = [m for m in db_chat.messages if m.role == "user"]

    if not user_messages:
        raise HTTPException(status_code=400, detail="No user messages found")

    # ── 4. Sort by created_at (ensure first message) ────────────
    first_message = sorted(user_messages, key=lambda x: x.created_at)[0]

    # ── 5. Validate message content ─────────────────────────────
    if not first_message.message:
        raise HTTPException(status_code=400, detail="First message is empty")

    first_prompt = first_message.message

    # ── 6. Generate title ───────────────────────────────────────
    generated_title = generate_title(first_prompt)
    print(generate_title)
    # fallback safety
    if not generated_title or generated_title.strip() == "":
        generated_title = "New Chat"

    # ── 7. Save to DB ───────────────────────────────────────────
    db_chat.title = generated_title

    db.commit()
    db.refresh(db_chat)
    print(db_chat.title)

    # ── 8. Return response ──────────────────────────────────────
    return {"generated_title": generated_title}