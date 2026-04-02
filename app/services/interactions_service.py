from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interaction import InteractionLog
from app.models.user import User


async def create_interaction(db: AsyncSession, current_user: User, body) -> InteractionLog:
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


async def list_interactions(db: AsyncSession, current_user: User, limit: int) -> list[InteractionLog]:
    stmt = (
        select(InteractionLog)
        .where(InteractionLog.user_id == current_user.id)
        .order_by(desc(InteractionLog.timestamp))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_user_patterns(db: AsyncSession, current_user: User) -> list[dict]:
    stmt = (
        select(InteractionLog.event_type, func.count(InteractionLog.id).label("cnt"))
        .where(InteractionLog.user_id == current_user.id)
        .group_by(InteractionLog.event_type)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [{"event_type": r[0], "count": r[1]} for r in rows]

