"""State-aware single-task recommendation."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.models.user import User


def _pending_stmt(user_id: UUID):
    return select(Task).where(
        Task.user_id == user_id,
        Task.status != TaskStatus.DONE.value,
    )


async def recommend_task(
    db: AsyncSession,
    user: User,
    interaction_state: str | None,
    last_task_id: UUID | None,
    pending_task_count: int | None,
) -> tuple[Task | None, str]:
    state = (interaction_state or "neutral").lower()
    r = await db.execute(_pending_stmt(user.id).order_by(Task.deadline.asc().nulls_last()))
    tasks = list(r.scalars().all())
    if not tasks:
        return None, "no_pending_tasks"

    now = datetime.now(timezone.utc)

    def overload_high_overdue() -> Task | None:
        for t in tasks:
            if t.deadline and t.deadline < now and (t.priority or "").lower() == "high":
                return t
        for t in tasks:
            if t.deadline and t.deadline < now and t.priority_score >= 0.85:
                return t
        return None

    def smallest_easy() -> Task | None:
        return min(tasks, key=lambda t: (t.time_estimate_minutes or 9999, t.priority_score))

    def default_pick() -> Task:
        return sorted(
            tasks,
            key=lambda t: (
                t.deadline is None,
                t.deadline or datetime.max.replace(tzinfo=timezone.utc),
                {"high": 0, "medium": 1, "low": 2}.get((t.priority or "medium").lower(), 1),
                t.time_estimate_minutes or 9999,
            ),
        )[0]

    if state == "overload" or (pending_task_count is not None and pending_task_count > 10):
        picked = overload_high_overdue()
        if picked:
            return picked, "overload_high_overdue"
        return default_pick(), "overload_default"

    if state == "hesitation":
        return smallest_easy(), "hesitation_smallest"

    if state == "distraction":
        if last_task_id:
            r2 = await db.execute(
                select(Task).where(
                    Task.id == last_task_id,
                    Task.user_id == user.id,
                    Task.status != TaskStatus.DONE.value,
                )
            )
            prev = r2.scalar_one_or_none()
            if prev:
                return prev, "distraction_resume_last"
        return default_pick(), "distraction_fallback"

    if state == "focus":
        return default_pick(), "focus_full_ranking"

    return default_pick(), "default_ranking"
