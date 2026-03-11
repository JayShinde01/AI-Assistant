from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.utils.get_current_user import get_current_user
from app.models.user import User
from app.database import get_db
from app.models.message import Message
from app.models.chat_session import ChatSession
from app.schemas.message_schema import MessageCreate, AIReply, MessageResponse

from app.services.gemini_service import generate_ai_response

router = APIRouter(prefix="/api/chats", tags=["Messages"])

@router.get("/{chat_id}/messages")
def get_messages(chat_id:UUID, db:Session=Depends(get_db)):

    messages = db.query(Message)\
    .filter(Message.chat_id == chat_id)\
    .order_by(Message.created_at)\
    .all()

    return messages


@router.post("/{chat_id}/messages", response_model=AIReply)
def send_message(
    chat_id: UUID, 
    body: MessageCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):

    chat = db.query(ChatSession).filter(
    ChatSession.id == chat_id,
    ChatSession.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    # save user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        message=body.message
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # fetch chat history
    messages = db.query(Message)\
    .filter(Message.chat_id == chat_id)\
    .order_by(Message.created_at.desc())\
    .limit(20)\
    .all()

    messages.reverse()

    # generate AI response
    ai_text = generate_ai_response(messages)

    # save AI response
    ai_message = Message(
        chat_id=chat_id,
        role="assistant",
        message=ai_text
    )

    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    return{
    "reply": ai_text,
    "chat_id": chat_id
    }