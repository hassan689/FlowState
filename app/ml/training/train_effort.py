"""
Train effort (minutes) regressor from synthetic data (placeholder for real task outcomes).

Usage (from Flowstate repo root):
  python -m app.ml.training.train_effort

Writes: app/ml/models/effort_regressor.joblib
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestRegressor

from app.ml.constants import EFFORT_FEATURE_KEYS


def main() -> None:
    n_features = len(EFFORT_FEATURE_KEYS)
    rng = np.random.default_rng(42)
    X = rng.normal(size=(1200, n_features)).astype(np.float64)
    X[:, 0] = np.clip(X[:, 0] + 2.0, 0.0, 4.0)
    X[:, 1] = np.clip(X[:, 1] + 1.0, 0.0, 2.0)
    X[:, 2] = np.clip(0.5 + 0.15 * X[:, 2], 0.0, 1.0)
    X[:, 3] = np.clip(25.0 + 10.0 * X[:, 3], 5.0, 120.0)
    X[:, 4] = np.clip(25.0 + 12.0 * X[:, 4], 5.0, 120.0)
    X[:, 5] = np.clip(5.0 * rng.random(1200), 0.0, 80.0)
    X[:, 6] = np.clip(1.0 + 0.25 * X[:, 6], 0.5, 2.5)

    minutes = (
        18.0
        + 8.0 * X[:, 0]
        + 6.0 * X[:, 1]
        + 22.0 * X[:, 2]
        + 0.35 * X[:, 3]
        + 0.12 * X[:, 4]
        + 0.08 * X[:, 5]
        + 10.0 * np.maximum(0.0, X[:, 6] - 1.0)
        + rng.normal(0, 4.0, size=1200)
    )
    minutes = np.clip(minutes, 5.0, 240.0)

    reg = RandomForestRegressor(
        n_estimators=140,
        max_depth=14,
        min_samples_leaf=3,
        random_state=42,
    )
    reg.fit(X, minutes)

    out_dir = Path(__file__).resolve().parents[1] / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "effort_regressor.joblib"

    import joblib

    joblib.dump({"model": reg, "difficulty_model": None, "feature_keys": list(EFFORT_FEATURE_KEYS)}, path)
    print(f"Saved effort model to {path}")


if __name__ == "__main__":
    main()
