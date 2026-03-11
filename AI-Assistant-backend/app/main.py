from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat_routes
from app.routes import message_routes
from app.routes import auth_routes
from app.models import user, chat_session, message
from app.database import Base, engine

app = FastAPI()

Base.metadata.create_all(bind=engine)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_routes.router)
app.include_router(message_routes.router)
app.include_router(auth_routes.router)
@app.get("/")
def homeRoute():
    return {"msg" : "AI Assistant Backend is Running..."}