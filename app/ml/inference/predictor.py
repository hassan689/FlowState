from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np

from app.core.config import settings
from app.ml.constants import COGNITIVE_STATES
from app.ml.features.extractor import effort_feature_vector, state_feature_vector

logger = logging.getLogger(__name__)


def _heuristic_state(features: dict[str, float]) -> tuple[str, float]:
    """Rule-based fallback when no trained classifier is available."""
    overload_r = features["overload_ratio"]
    idle_r = features["idle_ratio"]
    hes_r = features["hesitation_ratio"]
    intr = features["avg_focus_interruptions"]
    dur = features["avg_focus_duration_min"]
    pv = features["page_view_ratio"]
    ev = max(int(features["events_24h"]), 1)

    if overload_r > 0.18 or (overload_r > 0.1 and features["interaction_state_ratio"] > 0.2):
        return "overloaded", 0.72
    if idle_r > 0.25 or (idle_r > 0.12 and hes_r < 0.05):
        return "idle", 0.65
    if hes_r > 0.2 or (hes_r > 0.12 and dur < 8 and features["focus_sessions_7d"] > 0):
        return "stuck", 0.62
    if pv > 0.55 and intr > 1.2:
        return "distracted", 0.58
    if ev > 30 and hes_r + overload_r < 0.08:
        return "focused", 0.55
    return "focused", 0.5


def _heuristic_effort_minutes(features: dict[str, float]) -> tuple[float, float]:
    """Returns (predicted_minutes, difficulty_score in [0,1])."""
    base = features["user_median_actual_minutes"]
    if base <= 0:
        base = 30.0
    cat = features["category_idx"]
    exam_boost = 1.35 if cat == 1 else 1.0
    prio = features["priority_idx"]
    prio_boost = 1.0 + 0.12 * prio
    overrun = max(0.5, min(2.0, features["user_avg_actual_over_estimate"]))
    minutes = float(np.clip(base * exam_boost * prio_boost * overrun, 5.0, 240.0))
    difficulty = float(
        np.clip(0.25 * prio + 0.15 * cat / 4.0 + 0.35 * min(1.0, overrun - 0.5), 0.0, 1.0)
    )
    return minutes, difficulty


class MLPredictor:
    """Loads sklearn joblib bundles; falls back to heuristics."""

    def __init__(
        self,
        state_bundle: Any | None = None,
        effort_bundle: Any | None = None,
    ):
        self._state = state_bundle
        self._effort = effort_bundle

    @classmethod
    def from_settings(cls) -> MLPredictor:
        state_path = Path(settings.ML_STATE_MODEL_PATH)
        effort_path = Path(settings.ML_EFFORT_MODEL_PATH)
        state_b = _try_load(state_path)
        effort_b = _try_load(effort_path)
        if state_b is None:
            logger.info("ML state model not found at %s — using heuristics", state_path)
        if effort_b is None:
            logger.info("ML effort model not found at %s — using heuristics", effort_path)
        return cls(state_bundle=state_b, effort_bundle=effort_b)

    def predict_state(self, features: dict[str, float]) -> tuple[str, float, str]:
        """
        Returns (label, confidence_or_score, source) where source is sklearn|heuristic.
        """
        x = np.asarray([state_feature_vector(features)], dtype=np.float64)
        if self._state and isinstance(self._state, dict) and "model" in self._state:
            model = self._state["model"]
            le = self._state.get("label_encoder")
            proba = getattr(model, "predict_proba", None)
            if proba is not None:
                p = proba(x)[0]
                idx = int(np.argmax(p))
                conf = float(p[idx])
                if le is not None:
                    label = str(le.inverse_transform([idx])[0])
                elif hasattr(model, "classes_"):
                    label = str(model.classes_[idx])
                else:
                    label = str(COGNITIVE_STATES[idx % len(COGNITIVE_STATES)])
                return label, conf, "sklearn"
            pred = model.predict(x)[0]
            if le is not None:
                label = str(le.inverse_transform([int(pred)])[0])
            else:
                label = str(pred)
            return label, 0.66, "sklearn"
        label, score = _heuristic_state(features)
        return label, score, "heuristic"

    def predict_effort(self, features: dict[str, float]) -> tuple[float, float, str]:
        """Returns (minutes, difficulty_score, source)."""
        x = np.asarray([effort_feature_vector(features)], dtype=np.float64)
        if self._effort and isinstance(self._effort, dict) and "model" in self._effort:
            model = self._effort["model"]
            pred = model.predict(x)[0]
            minutes = float(np.clip(float(pred), 5.0, 240.0))
            diff_model = self._effort.get("difficulty_model")
            if diff_model is not None:
                difficulty = float(np.clip(float(diff_model.predict(x)[0]), 0.0, 1.0))
            else:
                _, difficulty = _heuristic_effort_minutes(features)
            return minutes, difficulty, "sklearn"
        minutes, difficulty = _heuristic_effort_minutes(features)
        return minutes, difficulty, "heuristic"


def _try_load(path: Path) -> Any | None:
    if not path.is_file():
        return None
    try:
        import joblib

        return joblib.load(path)
    except Exception as e:  # pragma: no cover - defensive
        logger.warning("Failed to load ML bundle %s: %s", path, e)
        return None
