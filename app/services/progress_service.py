"""Progress aggregates (7-day window) and recovery suggestions."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.types import Date

from app.models.progress_tracker import ProgressTracker
from app.models.task import Task, TaskStatus
from app.models.user import User


async def _count_completions_on_calendar_day(
    db: AsyncSession, user_id: UUID, day: datetime.date
) -> int:
    start = datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    r = await db.execute(
        select(func.count())
        .select_from(Task)
        .where(
            Task.user_id == user_id,
            Task.status == TaskStatus.DONE.value,
            Task.updated_at >= start,
            Task.updated_at < end,
        )
    )
    return int(r.scalar() or 0)


async def compute_streak_days(db: AsyncSession, user_id: UUID) -> int:
    """Streak = consecutive calendar days with ≥1 completion, counting back from the most recent completion."""
    stmt = (
        select(cast(Task.updated_at, Date))
        .where(Task.user_id == user_id, Task.status == TaskStatus.DONE.value)
        .distinct()
    )
    r = await db.execute(stmt)
    days = sorted({row[0] for row in r.all()}, reverse=True)
    if not days:
        return 0
    today = datetime.now(timezone.utc).date()
    if days[0] < today - timedelta(days=1):
        return 0
    streak = 1
    for i in range(len(days) - 1):
        if days[i] - days[i + 1] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak


async def get_progress_detail(db: AsyncSession, user: User) -> dict:
    now = datetime.now(timezone.utc)
    seven_ago = now - timedelta(days=7)
    total_r = await db.execute(select(func.count()).select_from(Task).where(Task.user_id == user.id))
    total = int(total_r.scalar() or 0)
    done_r = await db.execute(
        select(func.count())
        .select_from(Task)
        .where(
            Task.user_id == user.id,
            Task.status == TaskStatus.DONE.value,
            Task.updated_at >= seven_ago,
        )
    )
    done_window = int(done_r.scalar() or 0)
    rate = done_window / max(1, total)

    daily = []
    for i in range(6, -1, -1):
        d = (now.date() - timedelta(days=i))
        cnt = await _count_completions_on_calendar_day(db, user.id, d)
        daily.append({"date": d.isoformat(), "completed_count": cnt})

    streak = await compute_streak_days(db, user.id)

    done_all_r = await db.execute(
        select(func.count())
        .select_from(Task)
        .where(Task.user_id == user.id, Task.status == TaskStatus.DONE.value)
    )
    done_all = int(done_all_r.scalar() or 0)

    return {
        "completion_rate_7d": round(rate, 4),
        "streak_days": streak,
        "total_tasks": total,
        "tasks_completed_7d": done_window,
        "tasks_completed_all": done_all,
        "daily_completed": daily,
    }


async def pick_recovery_task(db: AsyncSession, user: User) -> Task | None:
    stmt = (
        select(Task)
        .where(
            Task.user_id == user.id,
            Task.status != TaskStatus.DONE.value,
        )
        .order_by(Task.priority_score.desc(), Task.deadline.asc().nulls_last())
    )
    r = await db.execute(stmt)
    return r.scalars().first()


async def get_recovery_suggestions(db: AsyncSession, user: User) -> dict:
    now = datetime.now(timezone.utc)
    last = user.last_active
    if not last:
        return {
            "show_recovery": False,
            "minutes_inactive": None,
            "message": "",
            "suggested_task": None,
        }
    inactive_sec = (now - last).total_seconds()
    if inactive_sec <= 600:
        return {
            "show_recovery": False,
            "minutes_inactive": round(inactive_sec / 60, 1),
            "message": "",
            "suggested_task": None,
        }
    task = await pick_recovery_task(db, user)
    return {
        "show_recovery": True,
        "minutes_inactive": round(inactive_sec / 60, 1),
        "message": "Welcome back — pick up where you left off.",
        "suggested_task": task,
    }


async def sync_progress_tracker(db: AsyncSession, user: User) -> ProgressTracker:
    """Recompute aggregate progress fields after task changes."""
    total_r = await db.execute(select(func.count()).select_from(Task).where(Task.user_id == user.id))
    total = int(total_r.scalar() or 0)
    done_r = await db.execute(
        select(func.count())
        .select_from(Task)
        .where(
            Task.user_id == user.id,
            Task.status == TaskStatus.DONE.value,
        )
    )
    done = int(done_r.scalar() or 0)
    pt_r = await db.execute(select(ProgressTracker).where(ProgressTracker.user_id == user.id))
    pt = pt_r.scalar_one_or_none()
    if not pt:
        pt = ProgressTracker(user_id=user.id)
        db.add(pt)
    pt.tasks_completed = done
    pt.completion_rate = (done / total) if total else 0.0
    pt.streak_days = await compute_streak_days(db, user.id)
    pt.longest_streak = max(pt.longest_streak or 0, pt.streak_days)
    pt.last_calculated = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(pt)
    return pt
