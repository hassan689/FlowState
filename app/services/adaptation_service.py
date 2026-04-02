from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.adaptive_rule import AdaptiveRule
from app.models.progress_tracker import ProgressTracker
from app.models.user import User


async def list_adaptive_rules(db: AsyncSession, active_only: bool = True) -> list[AdaptiveRule]:
    stmt = select(AdaptiveRule).order_by(AdaptiveRule.priority.desc())
    if active_only:
        stmt = stmt.where(AdaptiveRule.is_active)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_my_progress(db: AsyncSession, current_user: User) -> ProgressTracker:
    result = await db.execute(select(ProgressTracker).where(ProgressTracker.user_id == current_user.id))
    pt = result.scalar_one_or_none()
    if not pt:
        pt = ProgressTracker(user_id=current_user.id)
        db.add(pt)
        await db.commit()
        await db.refresh(pt)
    return pt


async def get_productivity_score(db: AsyncSession, current_user: User) -> float:
    return await current_user.get_productivity_score(db)

