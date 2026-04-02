from datetime import datetime

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.focus_session import FocusSession
from app.models.user import User


async def start_focus_session(db: AsyncSession, current_user: User, body) -> FocusSession:
    now = datetime.now(datetime.UTC)
    session = FocusSession(
        user_id=current_user.id,
        task_id=body.task_id,
        start_time=now,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def list_focus_sessions(db: AsyncSession, current_user: User, limit: int) -> list[FocusSession]:
    stmt = (
        select(FocusSession)
        .where(FocusSession.user_id == current_user.id)
        .order_by(desc(FocusSession.start_time))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_my_focus_sessions(db: AsyncSession, current_user: User, limit: int) -> list[FocusSession]:
    return await current_user.get_focus_sessions(db, limit=limit)


async def get_focus_session(
    db: AsyncSession, current_user: User, session_id
) -> FocusSession | None:
    result = await db.execute(
        select(FocusSession).where(
            FocusSession.id == session_id,
            FocusSession.user_id == current_user.id,
        )
    )
    return result.scalar_one_or_none()


async def end_focus_session(
    db: AsyncSession, current_user: User, session_id, body
) -> FocusSession | None:
    result = await db.execute(
        select(FocusSession).where(
            FocusSession.id == session_id,
            FocusSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return None

    if body.end_time is not None or body.completed is not None:
        session.end_session(body.end_time)
    if body.interruptions is not None:
        session.interruptions = body.interruptions
    if body.notes is not None:
        session.notes = body.notes

    await db.commit()
    await db.refresh(session)
    return session

