from fastapi import FastAPI

from app.routes import chat_routes
from app.models import user, chat_session, message
from app.database import Base, engine

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(chat_routes.router)

@app.get("/")
def homeRoute():
    return {"msg" : "AI Assistant Backend is Running..."}