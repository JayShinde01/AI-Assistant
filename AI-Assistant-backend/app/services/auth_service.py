from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.token_verifier import verify_google_token


def get_or_create_user(token: str, db: Session):

    user_data = verify_google_token(token)

    if not user_data:
        return None

    google_id = user_data["sub"]
    email = user_data["email"]
    name = user_data.get("name")
    picture = user_data.get("picture")

    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:

        user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    return user