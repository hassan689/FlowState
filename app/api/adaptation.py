import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.adaptation import (
    AdaptiveRuleResponse,
    DailyProgressRow,
    ProgressDetailResponse,
    ProgressTrackerResponse,
    RecoverySuggestionResponse,
)
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.schemas.task import TaskResponse
from app.services.adaptation_service import (
    get_my_progress as get_my_progress_service,
)
from app.services.adaptation_service import (
    get_productivity_score as get_productivity_score_service,
)
from app.services.adaptation_service import (
    list_adaptive_rules as list_adaptive_rules_service,
)
from app.services.progress_service import get_progress_detail, get_recovery_suggestions
from app.services.ai_service import get_ai_service
from app.services.recommendation_service import recommend_task as recommend_task_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/rules", response_model=list[AdaptiveRuleResponse])
async def list_adaptive_rules(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Delegates DB querying to a service so routers stay thin.
    return await list_adaptive_rules_service(db=db, active_only=active_only)


@router.get("/progress", response_model=ProgressTrackerResponse)
async def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_my_progress_service(db=db, current_user=current_user)


@router.get("/progress/summary", response_model=ProgressDetailResponse)
async def progress_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw = await get_progress_detail(db=db, user=current_user)
    daily = [DailyProgressRow(**row) for row in raw["daily_completed"]]
    return ProgressDetailResponse(
        completion_rate_7d=raw["completion_rate_7d"],
        streak_days=raw["streak_days"],
        total_tasks=raw["total_tasks"],
        tasks_completed_7d=raw["tasks_completed_7d"],
        tasks_completed_all=raw["tasks_completed_all"],
        daily_completed=daily,
    )


@router.get("/recovery-suggestions", response_model=RecoverySuggestionResponse)
async def recovery_suggestions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw = await get_recovery_suggestions(db=db, user=current_user)
    st = raw["suggested_task"]
    return RecoverySuggestionResponse(
        show_recovery=raw["show_recovery"],
        minutes_inactive=raw["minutes_inactive"],
        message=raw["message"],
        suggested_task=TaskResponse.model_validate(st) if st else None,
    )


@router.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(
    body: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task, reason = await recommend_task_service(
        db=db,
        user=current_user,
        interaction_state=body.interaction_state,
        last_task_id=body.last_task_id,
        pending_task_count=body.pending_task_count,
    )
    try:
        snap = await get_ai_service().build_snapshot(
            db,
            current_user.id,
            pending_task_count=body.pending_task_count,
            client_reported_state=body.interaction_state,
        )
        return RecommendationResponse(
            task=TaskResponse.model_validate(task) if task else None,
            reason=reason,
            cognitive_state=snap.cognitive_state,
            suggested_action=snap.suggested_action,
        )
    except Exception:
        logger.warning("ML enrichment for recommendations failed", exc_info=True)
        return RecommendationResponse(
            task=TaskResponse.model_validate(task) if task else None,
            reason=reason,
        )


@router.get("/productivity-score")
async def get_productivity_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    score = await get_productivity_score_service(db=db, current_user=current_user)
    return {"productivity_score": score}
