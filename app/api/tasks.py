from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.tasks_service import (
    create_task as create_task_service,
)
from app.services.tasks_service import (
    delete_task as delete_task_service,
)
from app.services.tasks_service import (
    get_active_tasks as get_active_tasks_service,
)
from app.services.tasks_service import (
    get_task as get_task_service,
)
from app.services.tasks_service import (
    list_tasks as list_tasks_service,
)
from app.services.tasks_service import (
    update_task as update_task_service,
)

router = APIRouter()


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    status_filter: str | None = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_tasks_service(db=db, current_user=current_user, status_filter=status_filter)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_task_service(db=db, current_user=current_user, body=body)


@router.get("/active", response_model=list[TaskResponse])
async def get_active_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_active_tasks_service(db=db, current_user=current_user)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await get_task_service(db=db, current_user=current_user, task_id=task_id)
    if not task:  # Preserve previous HTTP semantics
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await update_task_service(db=db, current_user=current_user, task_id=task_id, body=body)
    if not task:  # Preserve previous HTTP semantics
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await delete_task_service(db=db, current_user=current_user, task_id=task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return None
