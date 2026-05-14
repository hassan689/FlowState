from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.adaptive_ml import AISnapshot, EffortPrediction
from app.services.ai_service import get_ai_service

router = APIRouter()


@router.get("/snapshot", response_model=AISnapshot)
async def ai_snapshot(
    pending_task_count: int | None = Query(None, ge=0, le=500),
    interaction_state: str | None = Query(None, max_length=64),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Current cognitive-state inference + rule-based next action from recent logs.
    """
    return await get_ai_service().build_snapshot(
        db,
        current_user.id,
        pending_task_count=pending_task_count,
        client_reported_state=interaction_state,
    )


@router.get("/predict-effort", response_model=EffortPrediction)
async def predict_effort(
    category: str = Query(..., max_length=50),
    priority: str = Query("medium", max_length=20),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Preview ML/heuristic effort for a task before creating it (optional UX helper)."""
    return await get_ai_service().predict_effort_for_new_task(
        db,
        current_user.id,
        category=category,
        priority=priority,
    )
