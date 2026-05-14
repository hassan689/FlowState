"""
Train a cognitive-state classifier from synthetic data (placeholder for real labels).

Usage (from Flowstate repo root):
  python -m app.ml.training.train_state

Writes: app/ml/models/state_classifier.joblib
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier

from app.ml.constants import COGNITIVE_STATES, STATE_FEATURE_KEYS


def main() -> None:
    n_features = len(STATE_FEATURE_KEYS)
    n_classes = len(COGNITIVE_STATES)
    X, y = make_classification(
        n_samples=800,
        n_features=n_features,
        n_informative=min(8, n_features),
        n_redundant=2,
        n_classes=n_classes,
        random_state=42,
    )
    scale = np.array(
        [10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1000.0, 5.0, 30.0, 2.0, 20.0, 1.5],
        dtype=np.float64,
    )
    X = np.abs(X) * scale[:n_features]
    y_labels = np.array([COGNITIVE_STATES[int(i) % n_classes] for i in y])

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X, y_labels)

    out_dir = Path(__file__).resolve().parents[1] / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "state_classifier.joblib"

    import joblib

    joblib.dump({"model": clf, "label_encoder": None, "feature_keys": list(STATE_FEATURE_KEYS)}, path)
    print(f"Saved state model to {path}")


if __name__ == "__main__":
    main()
