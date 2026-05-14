"""
Export ML training CSVs from the Flowstate database.

Run from the repository root (with .env / DATABASE_URL configured):

  python scripts/export_ml_datasets.py

Outputs:
  - Effort regression rows: one row per completed task (features at task creation time).
    By default only tasks with ``actual_time_spent`` > 0 are included; use
    ``--effort-missing-actual=estimate`` to use ``time_estimate_minutes`` when actual is missing
    (see ``minutes_target_source`` in the CSV).
  - State classification rows: one row per user per day (24h window ending that day UTC),
    with ``heuristic_label`` / ``cognitive_state`` seeded from rules — replace ``cognitive_state``
    with real labels when you have them.

Default paths: data/ml/exports/effort_training.csv, data/ml/exports/state_training.csv
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.config import settings  # noqa: E402
from app.ml.constants import COGNITIVE_STATES, EFFORT_FEATURE_KEYS, STATE_FEATURE_KEYS  # noqa: E402
from app.ml.features.extractor import (  # noqa: E402
    extract_effort_features_at,
    extract_state_features_at,
)
from app.ml.inference.predictor import _heuristic_state  # noqa: E402
from app.models.task import Task, TaskStatus  # noqa: E402
from app.models.user import User  # noqa: E402


def _ensure_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def _write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in fieldnames})


async def export_effort(
    db: AsyncSession,
    *,
    missing_actual: str,
) -> tuple[list[dict], str | None]:
    """
    ``missing_actual``: ``skip`` (only rows with logged actual time) or ``estimate``
    (use ``time_estimate_minutes`` when actual is 0 / missing).
    """
    r = await db.execute(select(Task).where(Task.status == TaskStatus.DONE.value))
    tasks = list(r.scalars().all())
    rows: list[dict] = []
    for t in tasks:
        raw_actual = int(t.actual_time_spent or 0)
        est = int(t.time_estimate_minutes or 0) or 30
        if raw_actual > 0:
            target = raw_actual
            source = "actual"
        elif missing_actual == "estimate":
            target = est
            source = "estimate_fallback"
        else:
            continue
        as_of = _ensure_utc(t.created_at)
        if as_of is None:
            continue
        feats = await extract_effort_features_at(
            db,
            t.user_id,
            category=t.category,
            priority=(t.priority or "medium"),
            as_of=as_of,
        )
        row = {k: feats[k] for k in EFFORT_FEATURE_KEYS}
        row["task_id"] = str(t.id)
        row["user_id"] = str(t.user_id)
        row["task_created_at"] = as_of.isoformat()
        row["actual_time_spent_minutes"] = target
        row["time_estimate_minutes_at_create"] = est
        row["minutes_target_source"] = source
        rows.append(row)

    hint: str | None = None
    if not rows and tasks:
        with_actual = sum(1 for t in tasks if (t.actual_time_spent or 0) > 0)
        hint = (
            f"No effort rows: {len(tasks)} Done task(s), {with_actual} with actual_time_spent > 0. "
            "Log minutes when completing tasks, or re-run with --effort-missing-actual=estimate "
            "(uses time_estimate_minutes as a weak label; see minutes_target_source column)."
        )
    elif not rows and not tasks:
        hint = "No Done tasks in the database yet — complete a few tasks to export effort rows."
    return rows, hint


async def export_state(
    db: AsyncSession,
    *,
    days: int,
    skip_empty: bool,
) -> list[dict]:
    ur = await db.execute(select(User.id))
    user_ids = list(ur.scalars().all())
    now = datetime.now(UTC)
    rows: list[dict] = []
    for uid in user_ids:
        for d in range(days):
            as_of = (now - timedelta(days=d)).replace(
                hour=23, minute=59, second=59, microsecond=0, tzinfo=UTC
            )
            feats = await extract_state_features_at(db, uid, as_of=as_of, window_hours=24)
            if skip_empty:
                if feats["events_24h"] <= 0 and feats["focus_sessions_7d"] <= 0:
                    continue
            label, _conf = _heuristic_state(feats)
            row = {
                "user_id": str(uid),
                "window_end_utc": as_of.isoformat(),
                "heuristic_label": label,
                "cognitive_state": label,
            }
            row.update(feats)
            rows.append(row)
    return rows


async def _run(args: argparse.Namespace) -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    effort_fieldnames = [
        "task_id",
        "user_id",
        "task_created_at",
        *EFFORT_FEATURE_KEYS,
        "actual_time_spent_minutes",
        "time_estimate_minutes_at_create",
        "minutes_target_source",
    ]
    state_fieldnames = [
        "user_id",
        "window_end_utc",
        *STATE_FEATURE_KEYS,
        "heuristic_label",
        "cognitive_state",
    ]

    async with factory() as db:
        effort_rows, effort_hint = await export_effort(db, missing_actual=args.effort_missing_actual)
    async with factory() as db:
        state_rows = await export_state(db, days=args.days, skip_empty=args.skip_empty_windows)

    _write_csv(Path(args.effort_out), effort_fieldnames, effort_rows)
    _write_csv(Path(args.state_out), state_fieldnames, state_rows)

    allowed = ", ".join(COGNITIVE_STATES)
    print(f"Wrote {len(effort_rows)} rows -> {args.effort_out}")
    if effort_hint:
        print(effort_hint)
    print(f"Wrote {len(state_rows)} rows -> {args.state_out}")
    print(f"Edit ``cognitive_state`` in the state CSV to one of: {allowed}")

    await engine.dispose()


def main() -> None:
    p = argparse.ArgumentParser(description="Export ML training CSVs from PostgreSQL.")
    p.add_argument(
        "--effort-out",
        default=str(ROOT / "data" / "ml" / "exports" / "effort_training.csv"),
        help="Output path for effort regression CSV",
    )
    p.add_argument(
        "--state-out",
        default=str(ROOT / "data" / "ml" / "exports" / "state_training.csv"),
        help="Output path for cognitive-state CSV",
    )
    p.add_argument("--days", type=int, default=30, help="Days of daily windows per user (state export)")
    p.add_argument(
        "--skip-empty-windows",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Skip state rows with no interactions and no focus in the windows",
    )
    p.add_argument(
        "--effort-missing-actual",
        choices=("skip", "estimate"),
        default="skip",
        help="For Done tasks with no logged actual time: skip row (default) or use time_estimate as label",
    )
    args = p.parse_args()
    asyncio.run(_run(args))


if __name__ == "__main__":
    main()
