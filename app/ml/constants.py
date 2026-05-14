from typing import Final

# Cognitive state labels (must match training `train_state.py` ordering if using LabelEncoder)
COGNITIVE_STATES: Final[tuple[str, ...]] = (
    "focused",
    "distracted",
    "overloaded",
    "idle",
    "stuck",
)

# Fixed order for sklearn `feature_names_in_` / training rows
STATE_FEATURE_KEYS: Final[tuple[str, ...]] = (
    "events_24h",
    "hesitation_ratio",
    "overload_ratio",
    "idle_ratio",
    "interaction_state_ratio",
    "page_view_ratio",
    "avg_time_spent_ms",
    "focus_sessions_7d",
    "avg_focus_duration_min",
    "avg_focus_interruptions",
    "completed_tasks_count",
    "avg_actual_over_estimate_ratio",
)

EFFORT_FEATURE_KEYS: Final[tuple[str, ...]] = (
    "category_idx",
    "priority_idx",
    "priority_score_proxy",
    "user_avg_actual_minutes",
    "user_median_actual_minutes",
    "user_tasks_done_count",
    "user_avg_actual_over_estimate",
)
