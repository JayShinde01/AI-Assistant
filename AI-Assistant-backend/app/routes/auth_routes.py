from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.auth_schema import GoogleAuth
from google.oauth2 import id_token
from google.auth.transport import requests
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

router = APIRouter(prefix="/api")

print("in auth route")

@router.post("/auth/google")
def google_login(data: GoogleAuth, db: Session = Depends(get_db)):

    print("route called")

    token = data.token

    idinfo = id_token.verify_oauth2_token(
        token,
        requests.Request(),
        GOOGLE_CLIENT_ID
    )

    email = idinfo["email"]
    google_id = idinfo["sub"]   # unique google id
    picture = idinfo.get("picture")

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        user = models.User(
            google_id=google_id,
            email=email,
            picture=picture
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "user_id": str(user.id),
        "email": user.email,
        "picture": user.picture
    }