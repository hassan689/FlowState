from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    study_preferences: dict | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    created_at: datetime
    last_active: datetime | None
    study_preferences: dict

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: int
