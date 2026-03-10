from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def homeRoute():
    return {"msg" : "AI Assistant Backend is Running..."}