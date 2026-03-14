from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.interaction import InteractionLog
from app.schemas.interaction import InteractionLogCreate, InteractionLogResponse

router = APIRouter()


@router.post("", response_model=InteractionLogResponse, status_code=201)
async def create_interaction(
    body: InteractionLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone
    log = InteractionLog(
        user_id=current_user.id,
        session_id=body.session_id,
        event_type=body.event_type,
        metadata_=body.metadata,
        page_url=body.page_url,
        element_id=body.element_id,
        time_spent_ms=body.time_spent_ms,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.get("", response_model=list[InteractionLogResponse])
async def list_interactions(
    limit: int = Query(100, le=500),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import desc
    stmt = (
        select(InteractionLog)
        .where(InteractionLog.user_id == current_user.id)
        .order_by(desc(InteractionLog.timestamp))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/patterns")
async def get_user_patterns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func
    stmt = (
        select(InteractionLog.event_type, func.count(InteractionLog.id).label("cnt"))
        .where(InteractionLog.user_id == current_user.id)
        .group_by(InteractionLog.event_type)
    )
    result = await db.execute(stmt)
    return [{"event_type": r[0], "count": r[1]} for r in result.all()]
