from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class FocusSessionCreate(BaseModel):
    task_id: UUID | None = None


class FocusSessionUpdate(BaseModel):
    end_time: datetime | None = None
    completed: bool | None = None
    interruptions: int | None = None
    notes: str | None = None


class FocusSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    task_id: UUID | None
    start_time: datetime
    end_time: datetime | None
    duration_minutes: int
    completed: bool
    interruptions: int
    notes: str | None

    class Config:
        from_attributes = True
