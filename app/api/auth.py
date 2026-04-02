from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshBody
from app.schemas.user import Token, UserCreate, UserResponse
from app.services.auth_service import (
    login as login_service,
)
from app.services.auth_service import (
    me as me_service,
)
from app.services.auth_service import (
    refresh as refresh_service,
)
from app.services.auth_service import (
    register as register_service,
)

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    return await register_service(db=db, body=body)


@router.post("/login", response_model=Token)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await login_service(db=db, body=body)


@router.post("/refresh", response_model=Token)
async def refresh(body: RefreshBody):
    return await refresh_service(body=body)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return await me_service(current_user=current_user)
