from uuid import uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.interaction import (
    InteractionLogCreate,
    InteractionLogResponse,
    InteractionStateCreate,
)
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


@router.post("/state", response_model=InteractionLogResponse, status_code=201)
async def log_interaction_state(
    body: InteractionStateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sid = body.session_id or uuid4()
    meta = {**(body.metadata or {}), "interaction_state": body.state}
    if body.pending_task_count is not None:
        meta["pending_task_count"] = body.pending_task_count
    wrapped = InteractionLogCreate(
        session_id=sid,
        event_type="interaction_state",
        metadata=meta,
        page_url=None,
        element_id=None,
        time_spent_ms=None,
    )
    return await create_interaction_service(db=db, current_user=current_user, body=wrapped)


@router.get("", response_model=list[InteractionLogResponse])
async def list_interactions(
    limit: int = Query(100, le=500),
    event_type: str | None = Query(None, description="Filter by event_type, e.g. vision_metrics"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_interactions_service(
        db=db, current_user=current_user, limit=limit, event_type=event_type
    )


@router.get("/patterns")
async def get_user_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_patterns_service(db=db, current_user=current_user)
