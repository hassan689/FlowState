from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.features.extractor import extract_effort_features_for_draft, extract_state_features
from app.ml.inference.predictor import MLPredictor
from app.schemas.adaptive_ml import (
    AdaptiveAction,
    CognitiveStatePrediction,
    EffortPrediction,
    AISnapshot,
)


def suggest_adaptive_action(
    inferred_state: str,
    *,
    pending_task_count: int | None,
    client_reported_state: str | None,
) -> AdaptiveAction:
    """
    Rules engine: maps inferred cognitive state → next action for the product layer.
    (LLMs should not replace this core mapping; they may only rephrase `message` later.)
    """
    state = (inferred_state or "focused").lower()
    pending = pending_task_count or 0
    hint = (client_reported_state or "").lower()

    if state == "overloaded" or pending > 12:
        return AdaptiveAction(
            type="break",
            message="You look overloaded. Take a 5–10 minute break, then pick one small task.",
        )
    if state == "idle" or hint == "idle":
        return AdaptiveAction(
            type="notify",
            message="Low activity detected. Open your smallest task and work on it for 5 minutes.",
        )
    if state == "stuck" or hint == "hesitation":
        return AdaptiveAction(
            type="split_task",
            message="Try splitting the current task into three concrete sub-steps.",
        )
    if state == "distracted" or hint == "distraction":
        return AdaptiveAction(
            type="reschedule",
            message="Reduce context switching: hide other tabs and focus on a single task for 15 minutes.",
        )
    return AdaptiveAction(type="none", message="Keep your current rhythm.")


class AIService:
    """Decision points: (1) cognitive state (2) effort prediction (3) adaptive action."""

    __slots__ = ("_predictor",)

    def __init__(self, predictor: MLPredictor | None = None):
        self._predictor = predictor or MLPredictor.from_settings()

    async def infer_cognitive_state(
        self,
        db: AsyncSession,
        user_id: UUID,
    ) -> CognitiveStatePrediction:
        features = await extract_state_features(db, user_id)
        label, conf, src = self._predictor.predict_state(features)
        return CognitiveStatePrediction(state=label, confidence=conf, source=src)

    async def predict_effort_for_new_task(
        self,
        db: AsyncSession,
        user_id: UUID,
        *,
        category: str,
        priority: str,
    ) -> EffortPrediction:
        feats = await extract_effort_features_for_draft(db, user_id, category=category, priority=priority)
        minutes, difficulty, src = self._predictor.predict_effort(feats)
        minutes_i = int(round(minutes))
        hours = max(0, min(48, int(round(minutes_i / 60))))
        return EffortPrediction(
            time_estimate_minutes=max(5, min(1440, minutes_i)),
            estimated_effort_hours=hours,
            difficulty_score=difficulty,
            source=src,
        )

    async def build_snapshot(
        self,
        db: AsyncSession,
        user_id: UUID,
        *,
        pending_task_count: int | None = None,
        client_reported_state: str | None = None,
    ) -> AISnapshot:
        cognitive = await self.infer_cognitive_state(db, user_id)
        action = suggest_adaptive_action(
            cognitive.state,
            pending_task_count=pending_task_count,
            client_reported_state=client_reported_state,
        )
        return AISnapshot(cognitive_state=cognitive, suggested_action=action)


_ai_singleton: AIService | None = None


def get_ai_service() -> AIService:
    global _ai_singleton
    if _ai_singleton is None:
        _ai_singleton = AIService()
    return _ai_singleton
