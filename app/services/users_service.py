from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate


async def get_me(current_user: User) -> UserResponse:
    return current_user


async def update_me(db: AsyncSession, current_user: User, body: UserUpdate) -> UserResponse:
    if body.name is not None:
        current_user.name = body.name
    if body.study_preferences is not None:
        current_user.study_preferences = body.study_preferences
    await db.commit()
    await db.refresh(current_user)
    return current_user

