from app.celery_app import celery_app


@celery_app.task
def compute_priority_scores_for_user(user_id: str):
    """Recompute priority scores for all tasks of a user (e.g. after deadline change)."""
    # Use sync SQLAlchemy or run in thread; for now placeholder
    return {"user_id": user_id, "status": "ok"}


@celery_app.task
def update_progress_tracker(user_id: str):
    """Recalculate completion rate and streak for a user."""
    return {"user_id": user_id, "status": "ok"}
