from app.celery_app import celery_app


@celery_app.task
def compute_priority_scores_for_user(user_id: str):
    """Recompute priority scores for all tasks of a user (e.g. after deadline change)."""
    import asyncio
    from uuid import UUID

    from app.db.session import AsyncSessionLocal
    from app.services.recalculation import recompute_priority_scores_for_user

    async def _run() -> int:
        async with AsyncSessionLocal() as db:
            return await recompute_priority_scores_for_user(db, UUID(user_id))

    updated = asyncio.run(_run())
    return {"user_id": user_id, "updated_tasks": updated}


@celery_app.task
def update_progress_tracker(user_id: str):
    """Recalculate completion rate and streak for a user."""
    import asyncio
    from uuid import UUID

    from app.db.session import AsyncSessionLocal
    from app.services.recalculation import recompute_progress_tracker_for_user

    async def _run() -> dict:
        async with AsyncSessionLocal() as db:
            pt = await recompute_progress_tracker_for_user(db, UUID(user_id))
            return {
                "completion_rate": pt.completion_rate,
                "streak_days": pt.streak_days,
                "longest_streak": pt.longest_streak,
                "total_focus_hours": pt.total_focus_hours,
                "tasks_completed": pt.tasks_completed,
            }

    data = asyncio.run(_run())
    return {"user_id": user_id, **data}
