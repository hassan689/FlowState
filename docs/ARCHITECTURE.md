# Flowstate (MASS) – Architecture

## Overview

Flowstate is a **Moment-Adaptive Study System**: a FastAPI backend that adapts to student behavior (hesitation, overload, inactivity) and powers study tasks, focus sessions, and progress tracking.

## High-Level Stack

| Layer        | Technology                    |
|-------------|-------------------------------|
| API         | FastAPI                       |
| Database    | PostgreSQL 14+ (async via asyncpg) |
| ORM         | SQLAlchemy 2 (async)          |
| Auth        | JWT (python-jose + passlib)   |
| Cache/Queue | Redis                         |
| Background  | Celery + Redis                |
| ML/Logic    | scikit-learn, pandas          |
| Observability | Prometheus at `/metrics`    |

## Folder Structure & Ownership

```
Flowstate/
├── app/
│   ├── api/           # HTTP routes – add new endpoints here
│   │   ├── auth.py    # Register, login, refresh, /me
│   │   ├── users.py   # User CRUD
│   │   ├── tasks.py   # Task CRUD
│   │   ├── interactions.py  # Interaction logs
│   │   ├── focus.py   # Focus sessions
│   │   ├── adaptation.py    # Adaptive rules & progress
│   │   └── deps.py    # Shared dependencies (get_current_user, get_db)
│   ├── core/          # Config & security – change with care
│   │   ├── config.py  # Settings from env
│   │   └── security.py # JWT, password hashing
│   ├── db/            # Database setup
│   │   ├── base.py    # SQLAlchemy Base, UUID helpers
│   │   └── session.py # Engine, session factory, get_db
│   ├── models/        # SQLAlchemy models – one file per entity
│   ├── schemas/       # Pydantic request/response schemas
│   ├── worker/        # Celery tasks
│   ├── main.py        # App entry, CORS, routers, /health
│   └── celery_app.py
├── alembic/           # Migrations – run after model changes
├── tests/             # pytest – mirror app structure where useful
├── docs/              # This folder – architecture & dev guides
└── [config files]     # requirements.txt, pyproject.toml, .env.example
```

## Data Flow

1. **Request** → FastAPI router → **deps** (auth, DB session) → **route handler**.
2. Handlers use **schemas** for validation and **models** for DB access.
3. Long-running or offload work → **Celery** via `app.worker.tasks`.
4. **Redis** is used for Celery broker and optional caching.

## Key Conventions

- **API prefix**: All app routes live under `/api/*` (e.g. `/api/auth/login`).
- **Auth**: Protected routes depend on `get_current_user` from `app.api.deps`.
- **Async**: Use `AsyncSession` and `async def` for DB and route handlers.
- **IDs**: UUIDs for primary keys (see `app.db.base`).

## Related Docs

- [Development setup & workflows](DEVELOPMENT.md)
- [Contributing & PR process](../CONTRIBUTING.md)
