from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import  UUID 
from app.models.user import User
from app.utils.get_current_user import get_current_user
from app.database import get_db
from app.models.chat_session import ChatSession
from app.schemas.chat_schema import ChatCreate, ChatResponse

router = APIRouter(prefix="/api/chats", tags=["Chats"])

@router.post("/", response_model=ChatResponse)
def create_chat(
    chat:ChatCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):
    new_chat = ChatSession(
        title = chat.title,
        user_id = chat.user_id # here replace 0auth
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return new_chat


@router.get("/",response_model=list[ChatResponse])
def get_chats(
              db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)
              ):
    chats = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).all()
     

    return chats # later here need to filter by user id


@router.put("/{chat_id}", response_model=ChatResponse)
def update_chat(chat_id : UUID, chat : ChatCreate, db: Session = Depends(get_db)):
    db_chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()

    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found..!")
    
    db_chat.title = chat.title
    db.commit()
    db.refresh(db_chat)
    
    return db_chat


@router.delete("/{chat_id}")
def delete_chat(chat_id: UUID, db: Session = Depends(get_db)):

    db_chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()

    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(db_chat)
    db.commit()

    return {"message": "Chat deleted successfully"}