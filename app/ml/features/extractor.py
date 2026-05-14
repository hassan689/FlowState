from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime, timedelta
from statistics import median
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.constants import EFFORT_FEATURE_KEYS, STATE_FEATURE_KEYS
from app.models.focus_session import FocusSession
from app.models.interaction import InteractionLog
from app.models.task import Task, TaskStatus


def _safe_ratio(n: float, d: float) -> float:
    if d <= 0:
        return 0.0
    return float(n) / float(d)


def _normalize_as_of(as_of: datetime) -> datetime:
    if as_of.tzinfo is None:
        return as_of.replace(tzinfo=UTC)
    return as_of


async def extract_state_features_at(
    db: AsyncSession,
    user_id: UUID,
    *,
    as_of: datetime,
    window_hours: int = 24,
) -> dict[str, float]:
    """
    Same semantics as live inference, but anchored at ``as_of`` (for training exports).
    """
    end = _normalize_as_of(as_of)
    since_wh = end - timedelta(hours=window_hours)
    since_7d = end - timedelta(days=7)

    ir = await db.execute(
        select(InteractionLog).where(
            InteractionLog.user_id == user_id,
            InteractionLog.timestamp >= since_wh,
            InteractionLog.timestamp <= end,
        )
    )
    logs = list(ir.scalars().all())
    n = len(logs)
    counts = Counter((log.event_type or "").lower() for log in logs)

    hesitation = counts.get("hesitation", 0)
    overload = counts.get("overload", 0)
    idle = counts.get("idle", 0)
    interaction_state = counts.get("interaction_state", 0)
    page_view = counts.get("page_view", 0)

    time_vals = [float(log.time_spent_ms or 0) for log in logs if log.time_spent_ms]
    avg_time = sum(time_vals) / len(time_vals) if time_vals else 0.0

    fr = await db.execute(
        select(FocusSession).where(
            FocusSession.user_id == user_id,
            FocusSession.start_time >= since_7d,
            FocusSession.start_time <= end,
        )
    )
    sessions = list(fr.scalars().all())
    n_focus = len(sessions)
    avg_dur = sum(s.duration_minutes or 0 for s in sessions) / n_focus if n_focus else 0.0
    avg_intr = sum(s.interruptions or 0 for s in sessions) / n_focus if n_focus else 0.0

    tr = await db.execute(
        select(Task).where(
            Task.user_id == user_id,
            Task.status == TaskStatus.DONE.value,
            Task.updated_at <= end,
        )
    )
    done = list(tr.scalars().all())
    n_done = len(done)
    ratios: list[float] = []
    for t in done:
        est = float(t.time_estimate_minutes or 1)
        act = float(t.actual_time_spent or 0)
        if est > 0:
            ratios.append(act / est)
    avg_ratio = sum(ratios) / len(ratios) if ratios else 1.0

    return {
        "events_24h": float(n),
        "hesitation_ratio": _safe_ratio(hesitation, n),
        "overload_ratio": _safe_ratio(overload, n),
        "idle_ratio": _safe_ratio(idle, n),
        "interaction_state_ratio": _safe_ratio(interaction_state, n),
        "page_view_ratio": _safe_ratio(page_view, n),
        "avg_time_spent_ms": float(avg_time),
        "focus_sessions_7d": float(n_focus),
        "avg_focus_duration_min": float(avg_dur),
        "avg_focus_interruptions": float(avg_intr),
        "completed_tasks_count": float(n_done),
        "avg_actual_over_estimate_ratio": float(avg_ratio),
    }


async def extract_state_features(db: AsyncSession, user_id: UUID) -> dict[str, float]:
    """Aggregate interaction + focus signals (24h window ending now)."""
    return await extract_state_features_at(
        db, user_id, as_of=datetime.now(UTC), window_hours=24
    )


def state_feature_vector(features: dict[str, float]) -> list[float]:
    return [float(features[k]) for k in STATE_FEATURE_KEYS]


_CATEGORY_IDX = {
    "assignment": 0,
    "exam": 1,
    "project": 2,
    "reading": 3,
    "other": 4,
}

_PRIORITY_IDX = {"low": 0, "medium": 1, "high": 2}


async def extract_effort_features_at(
    db: AsyncSession,
    user_id: UUID,
    *,
    category: str,
    priority: str,
    as_of: datetime,
) -> dict[str, float]:
    """
    User history = tasks already marked Done with ``updated_at <= as_of`` (point-in-time).
    Use ``as_of = task.created_at`` when exporting a training row for that task.
    """
    end = _normalize_as_of(as_of)
    cat = (category or "Other").strip()
    key = cat.lower() if cat.lower() in _CATEGORY_IDX else "other"
    if key not in _CATEGORY_IDX:
        key = "other"
    prio = (priority or "medium").lower()
    if prio not in _PRIORITY_IDX:
        prio = "medium"

    proxy = {"low": 0.35, "medium": 0.55, "high": 0.85}[prio]

    tr = await db.execute(
        select(Task).where(
            Task.user_id == user_id,
            Task.status == TaskStatus.DONE.value,
            Task.updated_at <= end,
        )
    )
    done = list(tr.scalars().all())
    actuals = [float(t.actual_time_spent or 0) for t in done if (t.actual_time_spent or 0) > 0]
    ratios: list[float] = []
    for t in done:
        est = float(t.time_estimate_minutes or 0)
        act = float(t.actual_time_spent or 0)
        if est > 0 and act > 0:
            ratios.append(act / est)

    return {
        "category_idx": float(_CATEGORY_IDX[key]),
        "priority_idx": float(_PRIORITY_IDX[prio]),
        "priority_score_proxy": float(proxy),
        "user_avg_actual_minutes": float(sum(actuals) / len(actuals)) if actuals else 30.0,
        "user_median_actual_minutes": float(median(actuals)) if actuals else 30.0,
        "user_tasks_done_count": float(len(done)),
        "user_avg_actual_over_estimate": float(sum(ratios) / len(ratios)) if ratios else 1.0,
    }


async def extract_effort_features_for_draft(
    db: AsyncSession,
    user_id: UUID,
    *,
    category: str,
    priority: str,
) -> dict[str, float]:
    """Features for predicting effort on a not-yet-created task (history up to now)."""
    return await extract_effort_features_at(
        db,
        user_id,
        category=category,
        priority=priority,
        as_of=datetime.now(UTC),
    )


def effort_feature_vector(features: dict[str, float]) -> list[float]:
    return [float(features[k]) for k in EFFORT_FEATURE_KEYS]
