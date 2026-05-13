from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.task import TaskResponse


class AdaptiveRuleResponse(BaseModel):
    id: UUID
    rule_name: str
    trigger_type: str
    threshold_value: float
    threshold_unit: str | None
    action_type: dict
    is_active: bool
    priority: int

    class Config:
        from_attributes = True


class ProgressTrackerResponse(BaseModel):
    id: UUID
    user_id: UUID
    completion_rate: float
    streak_days: int
    longest_streak: int
    total_focus_hours: float
    tasks_completed: int
    last_calculated: datetime | None

    class Config:
        from_attributes = True


class DailyProgressRow(BaseModel):
    date: str
    completed_count: int


class ProgressDetailResponse(BaseModel):
    completion_rate_7d: float
    streak_days: int
    total_tasks: int
    tasks_completed_7d: int
    tasks_completed_all: int
    daily_completed: list[DailyProgressRow]


class RecoverySuggestionResponse(BaseModel):
    show_recovery: bool
    minutes_inactive: float | None = None
    message: str = ""
    suggested_task: TaskResponse | None = None
