from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.focus_session import FocusSession
from app.models.progress_tracker import ProgressTracker
from app.models.task import Task


async def recompute_priority_scores_for_user(db: AsyncSession, user_id: UUID) -> int:
    result = await db.execute(select(Task).where(Task.user_id == user_id))
    tasks = list(result.scalars().all())
    for t in tasks:
        t.compute_priority_score()
    await db.commit()
    return len(tasks)


async def recompute_progress_tracker_for_user(db: AsyncSession, user_id: UUID) -> ProgressTracker:
    result = await db.execute(select(ProgressTracker).where(ProgressTracker.user_id == user_id))
    pt = result.scalar_one_or_none()
    if not pt:
        pt = ProgressTracker(user_id=user_id)
        db.add(pt)
        await db.commit()
        await db.refresh(pt)

    total_tasks = await db.scalar(select(func.count(Task.id)).where(Task.user_id == user_id))
    done_tasks = await db.scalar(
        select(func.count(Task.id)).where(Task.user_id == user_id, Task.status == "Done")
    )

    total_focus_minutes = await db.scalar(
        select(func.coalesce(func.sum(FocusSession.duration_minutes), 0)).where(
            FocusSession.user_id == user_id, FocusSession.completed == True  # noqa: E712
        )
    )

    # "Completed today" means at least one completed focus session today (UTC).
    today = datetime.now(timezone.utc).date()
    completed_today = bool(
        await db.scalar(
            select(func.count(FocusSession.id)).where(
                FocusSession.user_id == user_id,
                FocusSession.completed == True,  # noqa: E712
                func.date(FocusSession.start_time) == today,
            )
        )
    )

    pt.calculate_completion_rate(db, total_tasks or 0, done_tasks or 0)
    pt.total_focus_hours = float((total_focus_minutes or 0) / 60.0)
    pt.update_streak(db, completed_today=completed_today)

    await db.commit()
    await db.refresh(pt)
    return pt

