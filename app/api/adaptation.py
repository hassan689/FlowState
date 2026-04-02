from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.adaptation import AdaptiveRuleResponse, ProgressTrackerResponse
from app.services.adaptation_service import (
    get_my_progress as get_my_progress_service,
)
from app.services.adaptation_service import (
    get_productivity_score as get_productivity_score_service,
)
from app.services.adaptation_service import (
    list_adaptive_rules as list_adaptive_rules_service,
)

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


@router.get("/productivity-score")
async def get_productivity_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    score = await get_productivity_score_service(db=db, current_user=current_user)
    return {"productivity_score": score}
