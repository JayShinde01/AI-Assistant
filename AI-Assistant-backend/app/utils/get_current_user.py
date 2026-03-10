from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import get_or_create_user


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    token = authorization.split(" ")[1]

    user = get_or_create_user(token, db)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    return user