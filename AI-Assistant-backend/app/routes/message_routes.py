from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.message import Message
from app.models.chat_session import ChatSession
from app.schemas.message_schema import MessageCreate, AIReply, MessageResponse

from app.services.gemini_service import generate_ai_response

router = APIRouter(prefix="/api/chats", tags=["Messages"])

@router.get("/{chat_id}/messages")
def get_messages(chat_id:UUID, db:Session=Depends(get_db)):

    messages = db.query(Message).filter(Message.chat_id == chat_id).all()

    return messages