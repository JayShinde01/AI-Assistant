from pydantic import BaseModel

class GoogleAuth(BaseModel):
    token: str