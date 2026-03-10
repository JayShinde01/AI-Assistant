import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    chat_id = Column(UUID(as_uuid=True), ForeignKey("chat_session.id"))

    role = Column(String)  # user or assistant

    message = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chat = relationship("ChatSession", back_populates="messages")