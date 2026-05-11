from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

from app.schemas.enums import InteractionEventType


class InteractionLogCreate(BaseModel):
    session_id: UUID
    event_type: InteractionEventType
    metadata: dict = Field(default_factory=dict)
    page_url: str | None = None
    element_id: str | None = None
    time_spent_ms: int | None = Field(default=None, ge=0)


class InteractionLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    session_id: UUID
    event_type: InteractionEventType
    timestamp: datetime
    metadata: dict
    page_url: str | None
    element_id: str | None
    time_spent_ms: int | None

    model_config = {"from_attributes": True}
