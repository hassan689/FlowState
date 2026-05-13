from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.models.user import User
from app.services.progress_service import sync_progress_tracker


async def list_tasks(
    db: AsyncSession,
    current_user: User,
    status_filter: str | None = None,
    category_filter: str | None = None,
    priority_filter: str | None = None,
) -> list[Task]:
    stmt = select(Task).where(Task.user_id == current_user.id).order_by(Task.order_index, Task.deadline)
    if status_filter:
        stmt = stmt.where(Task.status == status_filter)
    if category_filter:
        stmt = stmt.where(Task.category == category_filter)
    if priority_filter:
        stmt = stmt.where(Task.priority == priority_filter.lower())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_task(db: AsyncSession, current_user: User, body) -> Task:
    prio = (body.priority or "medium").lower()
    if prio not in ("low", "medium", "high"):
        prio = "medium"
    task = Task(
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        deadline=body.deadline,
        category=body.category,
        priority=prio,
        estimated_effort=body.estimated_effort,
        time_estimate_minutes=getattr(body, "time_estimate_minutes", None) or 30,
        order_index=body.order_index,
        tags=body.tags or [],
    )
    task.compute_priority_score()
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def get_active_tasks(db: AsyncSession, current_user: User) -> list[Task]:
    return await current_user.get_active_tasks(db)


async def get_task(db: AsyncSession, current_user: User, task_id) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    return result.scalar_one_or_none()


async def update_task(db: AsyncSession, current_user: User, task_id, body) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    task = result.scalar_one_or_none()
    if not task:
        return None

    old_status = task.status

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.deadline is not None:
        task.deadline = body.deadline
    if body.category is not None:
        task.category = body.category
    if body.priority is not None:
        p = body.priority.lower()
        task.priority = p if p in ("low", "medium", "high") else "medium"
    if body.status is not None:
        task.update_status(body.status)
    if body.estimated_effort is not None:
        task.estimated_effort = body.estimated_effort
    if body.time_estimate_minutes is not None:
        task.time_estimate_minutes = body.time_estimate_minutes
    if body.actual_time_spent is not None:
        task.actual_time_spent = body.actual_time_spent
    if body.order_index is not None:
        task.order_index = body.order_index
    if body.tags is not None:
        task.tags = body.tags

    task.compute_priority_score()
    became_done = (
        body.status is not None
        and body.status == TaskStatus.DONE.value
        and old_status != TaskStatus.DONE.value
    )
    await db.commit()
    await db.refresh(task)
    if became_done:
        await sync_progress_tracker(db, current_user)
    return task


async def delete_task(db: AsyncSession, current_user: User, task_id) -> bool:
    res = await db.execute(delete(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    await db.commit()
    return (res.rowcount or 0) > 0
