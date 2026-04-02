from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.user import User


async def list_tasks(db: AsyncSession, current_user: User, status_filter: str | None = None) -> list[Task]:
    stmt = select(Task).where(Task.user_id == current_user.id).order_by(Task.order_index, Task.deadline)
    if status_filter:
        stmt = stmt.where(Task.status == status_filter)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_task(db: AsyncSession, current_user: User, body) -> Task:
    task = Task(
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        deadline=body.deadline,
        category=body.category,
        estimated_effort=body.estimated_effort,
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

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.deadline is not None:
        task.deadline = body.deadline
    if body.category is not None:
        task.category = body.category
    if body.status is not None:
        task.update_status(body.status)
    if body.estimated_effort is not None:
        task.estimated_effort = body.estimated_effort
    if body.actual_time_spent is not None:
        task.actual_time_spent = body.actual_time_spent
    if body.order_index is not None:
        task.order_index = body.order_index
    if body.tags is not None:
        task.tags = body.tags

    task.compute_priority_score()
    await db.commit()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, current_user: User, task_id) -> bool:
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    task = result.scalar_one_or_none()
    if not task:
        return False
    await db.delete(task)
    await db.commit()
    return True

