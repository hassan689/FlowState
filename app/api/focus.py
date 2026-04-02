from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.focus import FocusSessionCreate, FocusSessionResponse, FocusSessionUpdate
from app.services.focus_service import (
    end_focus_session as end_focus_session_service,
)
from app.services.focus_service import (
    get_focus_session as get_focus_session_service,
)
from app.services.focus_service import (
    get_my_focus_sessions as get_my_focus_sessions_service,
)
from app.services.focus_service import (
    list_focus_sessions as list_focus_sessions_service,
)
from app.services.focus_service import (
    start_focus_session as start_focus_session_service,
)

router = APIRouter()


@router.post("", response_model=FocusSessionResponse, status_code=201)
async def start_focus_session(
    body: FocusSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await start_focus_session_service(db=db, current_user=current_user, body=body)


@router.get("", response_model=list[FocusSessionResponse])
async def list_focus_sessions(
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_focus_sessions_service(db=db, current_user=current_user, limit=limit)


@router.get("/sessions", response_model=list[FocusSessionResponse])
async def get_my_focus_sessions(
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_my_focus_sessions_service(db=db, current_user=current_user, limit=limit)


@router.get("/{session_id}", response_model=FocusSessionResponse)
async def get_focus_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await get_focus_session_service(db=db, current_user=current_user, session_id=session_id)
    if not session:  # Preserve previous HTTP semantics
        raise HTTPException(status_code=404, detail="Focus session not found")
    return session


@router.patch("/{session_id}", response_model=FocusSessionResponse)
async def end_focus_session(
    session_id: UUID,
    body: FocusSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await end_focus_session_service(db=db, current_user=current_user, session_id=session_id, body=body)
    if not session:  # Preserve previous HTTP semantics
        raise HTTPException(status_code=404, detail="Focus session not found")
    return session
