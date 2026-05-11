from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

from app.schemas.enums import TaskCategory, TaskStatus


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    deadline: datetime | None = None
    category: TaskCategory
    estimated_effort: int = Field(default=0, ge=0)  # hours
    order_index: int = Field(default=0, ge=0)
    tags: list[str] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    deadline: datetime | None = None
    category: TaskCategory | None = None
    status: TaskStatus | None = None
    estimated_effort: int | None = Field(default=None, ge=0)
    actual_time_spent: int | None = Field(default=None, ge=0)  # minutes
    order_index: int | None = Field(default=None, ge=0)
    tags: list[str] | None = None


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None
    deadline: datetime | None
    category: TaskCategory
    priority_score: float
    status: TaskStatus
    estimated_effort: int
    actual_time_spent: int
    created_at: datetime
    updated_at: datetime
    order_index: int
    tags: list[str]

    model_config = {"from_attributes": True}
