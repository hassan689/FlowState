from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.focus_session import FocusSession
from app.schemas.focus import FocusSessionCreate, FocusSessionUpdate, FocusSessionResponse

router = APIRouter()


@router.post("", response_model=FocusSessionResponse, status_code=201)
async def start_focus_session(
    body: FocusSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    session = FocusSession(
        user_id=current_user.id,
        task_id=body.task_id,
        start_time=now,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("", response_model=list[FocusSessionResponse])
async def list_focus_sessions(
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(FocusSession)
        .where(FocusSession.user_id == current_user.id)
        .order_by(desc(FocusSession.start_time))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/sessions", response_model=list[FocusSessionResponse])
async def get_my_focus_sessions(
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await current_user.get_focus_sessions(db, limit=limit)


@router.get("/{session_id}", response_model=FocusSessionResponse)
async def get_focus_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FocusSession).where(
            FocusSession.id == session_id,
            FocusSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Focus session not found")
    return session


@router.patch("/{session_id}", response_model=FocusSessionResponse)
async def end_focus_session(
    session_id: UUID,
    body: FocusSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FocusSession).where(
            FocusSession.id == session_id,
            FocusSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Focus session not found")
    if body.end_time is not None or body.completed is not None:
        session.end_session(body.end_time)
    if body.interruptions is not None:
        session.interruptions = body.interruptions
    if body.notes is not None:
        session.notes = body.notes
    await db.commit()
    await db.refresh(session)
    return session
