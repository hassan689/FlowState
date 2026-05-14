from uuid import UUID

from pydantic import BaseModel

from app.schemas.adaptive_ml import AdaptiveAction, CognitiveStatePrediction
from app.schemas.task import TaskResponse


class RecommendationRequest(BaseModel):
    interaction_state: str | None = None
    last_task_id: UUID | None = None
    pending_task_count: int | None = None


class RecommendationResponse(BaseModel):
    task: TaskResponse | None = None
    reason: str = ""
    cognitive_state: CognitiveStatePrediction | None = None
    suggested_action: AdaptiveAction | None = None
