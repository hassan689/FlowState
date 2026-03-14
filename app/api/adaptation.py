from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.adaptive_rule import AdaptiveRule
from app.models.progress_tracker import ProgressTracker
from app.schemas.adaptation import AdaptiveRuleResponse, ProgressTrackerResponse

router = APIRouter()


@router.get("/rules", response_model=list[AdaptiveRuleResponse])
async def list_adaptive_rules(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(AdaptiveRule).order_by(AdaptiveRule.priority.desc())
    if active_only:
        stmt = stmt.where(AdaptiveRule.is_active == True)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/progress", response_model=ProgressTrackerResponse)
async def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProgressTracker).where(ProgressTracker.user_id == current_user.id))
    pt = result.scalar_one_or_none()
    if not pt:
        pt = ProgressTracker(user_id=current_user.id)
        db.add(pt)
        await db.commit()
        await db.refresh(pt)
    return pt


@router.get("/productivity-score")
async def get_productivity_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    score = await current_user.get_productivity_score(db)
    return {"productivity_score": score}
