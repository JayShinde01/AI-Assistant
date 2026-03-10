from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class MessageCreate(BaseModel):
    message: str


class MessageResponse(BaseModel):
    id : UUID
    role : str 
    message : str
    created_at : datetime

    class Config:
        from_attributes = True


class ChatHistory(BaseModel):
    role: str
    message: str


class AIReply(BaseModel):
    reply: str