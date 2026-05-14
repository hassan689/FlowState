from datetime import datetime
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class InteractionStateCreate(BaseModel):
    """Shortcut for logging adaptive UI interaction states from the client."""

    session_id: UUID | None = None
    state: str
    pending_task_count: int | None = None
    metadata: dict = Field(default_factory=dict)


class InteractionLogCreate(BaseModel):
    session_id: UUID
    event_type: str  # page_view/click/scroll/hesitation/overload/idle
    metadata: dict = Field(default_factory=dict)
    page_url: str | None = None
    element_id: str | None = None
    time_spent_ms: int | None = None


class InteractionLogResponse(BaseModel):
    """ORM uses attribute ``metadata_`` (column ``metadata``); ``metadata`` alone would read SQLAlchemy ``MetaData``."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    session_id: UUID
    event_type: str
    timestamp: datetime
    metadata: dict = Field(
        validation_alias=AliasChoices("metadata_", "metadata"),
    )
    page_url: str | None
    element_id: str | None
    time_spent_ms: int | None
