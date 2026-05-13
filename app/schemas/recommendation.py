from uuid import UUID

from pydantic import BaseModel

from app.schemas.task import TaskResponse


class RecommendationRequest(BaseModel):
    interaction_state: str | None = None
    last_task_id: UUID | None = None
    pending_task_count: int | None = None


class RecommendationResponse(BaseModel):
    task: TaskResponse | None = None
    reason: str = ""
