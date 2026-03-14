from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


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
