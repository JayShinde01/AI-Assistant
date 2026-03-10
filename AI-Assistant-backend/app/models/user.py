import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func 
from sqlalchemy.orm import relationship

from app.database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True,  default=uuid.uuid4)
    google_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    picture = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chats = relationship("ChatSession", back_populates="user")