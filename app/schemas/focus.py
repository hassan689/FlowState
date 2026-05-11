from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class FocusSessionCreate(BaseModel):
    task_id: UUID | None = None


class FocusSessionUpdate(BaseModel):
    end_time: datetime | None = None
    completed: bool | None = None
    interruptions: int | None = Field(default=None, ge=0)
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

    model_config = {"from_attributes": True}
