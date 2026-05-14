from pydantic import BaseModel, Field


class CognitiveStatePrediction(BaseModel):
    state: str
    confidence: float = Field(ge=0.0, le=1.0)
    source: str = Field(default="heuristic", description="Model origin: sklearn | heuristic")


class AdaptiveAction(BaseModel):
    type: str = Field(
        ...,
        description="One of: break, reschedule, split_task, notify, none",
    )
    message: str


class EffortPrediction(BaseModel):
    time_estimate_minutes: int = Field(ge=1, le=24 * 60)
    estimated_effort_hours: int = Field(ge=0, le=48)
    difficulty_score: float = Field(ge=0.0, le=1.0)
    source: str = Field(default="heuristic", description="sklearn | heuristic")


class AISnapshot(BaseModel):
    """Full adaptive snapshot for dashboards or debugging."""

    cognitive_state: CognitiveStatePrediction
    suggested_action: AdaptiveAction
    features_version: str = "v1"
