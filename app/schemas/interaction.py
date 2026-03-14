from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class InteractionLogCreate(BaseModel):
    session_id: UUID
    event_type: str  # page_view/click/scroll/hesitation/overload/idle
    metadata: dict = {}
    page_url: str | None = None
    element_id: str | None = None
    time_spent_ms: int | None = None


class InteractionLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    session_id: UUID
    event_type: str
    timestamp: datetime
    metadata: dict
    page_url: str | None
    element_id: str | None
    time_spent_ms: int | None

    class Config:
        from_attributes = True
