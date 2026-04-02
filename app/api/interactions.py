from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.interaction import InteractionLogCreate, InteractionLogResponse
from app.services.interactions_service import (
    create_interaction as create_interaction_service,
)
from app.services.interactions_service import (
    get_user_patterns as get_user_patterns_service,
)
from app.services.interactions_service import (
    list_interactions as list_interactions_service,
)

router = APIRouter()


@router.post("", response_model=InteractionLogResponse, status_code=201)
async def create_interaction(
    body: InteractionLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_interaction_service(db=db, current_user=current_user, body=body)


@router.get("", response_model=list[InteractionLogResponse])
async def list_interactions(
    limit: int = Query(100, le=500),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_interactions_service(db=db, current_user=current_user, limit=limit)


@router.get("/patterns")
async def get_user_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_patterns_service(db=db, current_user=current_user)
