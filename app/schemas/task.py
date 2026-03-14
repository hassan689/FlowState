from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    deadline: datetime | None = None
    category: str  # Assignment/Exam/Project/Reading
    estimated_effort: int = 0
    order_index: int = 0
    tags: list[str] = []


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    deadline: datetime | None = None
    category: str | None = None
    status: str | None = None
    estimated_effort: int | None = None
    actual_time_spent: int | None = None
    order_index: int | None = None
    tags: list[str] | None = None


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None
    deadline: datetime | None
    category: str
    priority_score: float
    status: str
    estimated_effort: int
    actual_time_spent: int
    created_at: datetime
    updated_at: datetime
    order_index: int
    tags: list[str]

    class Config:
        from_attributes = True
