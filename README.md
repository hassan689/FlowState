# MASS (Flowstate) – Moment-Adaptive Study System

FastAPI backend for an intelligent study platform that adapts to student behavior (hesitation, overload, inactivity).

## Team onboarding

1. **Clone** the repo and open it in your editor.
2. **Setup** – Follow [Setup](#setup) below (env, DB, migrations).
3. **Read** – [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for daily dev workflow (run API, tests, Celery).
4. **Contribute** – [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, PRs, and code style.
5. **Architecture** – [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for folder structure and where to add code.

## Project structure (high level)

```
Flowstate/
├── app/
│   ├── api/          # HTTP routes (auth, users, tasks, interactions, focus, adaptation)
│   ├── core/         # Config, security
│   ├── db/           # SQLAlchemy base, session
│   ├── models/       # DB models
│   ├── schemas/      # Pydantic request/response
│   ├── worker/       # Celery tasks
│   └── main.py       # App entry, routers
├── alembic/          # DB migrations
├── docs/             # Architecture & development guides
├── tests/            # pytest
├── CONTRIBUTING.md   # How to contribute
├── requirements.txt
├── pyproject.toml    # Ruff, pytest, coverage config
└── .env.example      # Copy to .env and fill
```

## Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL 14+ (async via asyncpg)
- **Auth**: JWT (python-jose + passlib)
- **Cache**: Redis
- **Task queue**: Celery + Redis
- **ML**: scikit-learn, pandas (for adaptive logic)
- **API docs**: OpenAPI at `/docs` and `/redoc`
- **Monitoring**: Prometheus at `/metrics`
- **Tests**: pytest, 70%+ coverage target
- **Code style**: Ruff (format + lint), see `pyproject.toml`

## Setup

1. **Clone and enter**
   ```bash
   cd Flowstate
   ```

2. **Env**
   ```bash
   cp .env.example .env
   # Edit .env: SECRET_KEY, POSTGRES_PASSWORD, DATABASE_URL, etc.
   ```

3. **PostgreSQL**
   - Create DB and enable extension: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

4. **Migrations**
   ```bash
   pip install -r requirements.txt
   alembic upgrade head
   ```

5. **Run**
   ```bash
   uvicorn app.main:app --reload
   ```
   - API: http://localhost:8000  
   - Docs: http://localhost:8000/docs  
   - Metrics: http://localhost:8000/metrics  

6. **Tests**
   ```bash
   pytest
   ```

## API overview

- `POST /api/auth/register` – Register
- `POST /api/auth/login` – Login (JSON body: email, password)
- `POST /api/auth/refresh` – Refresh tokens
- `GET /api/auth/me` – Current user (Bearer)
- `GET/POST/PATCH/DELETE /api/tasks` – Tasks
- `POST/GET /api/interactions` – Interaction logs
- `POST/GET/PATCH /api/focus` – Focus sessions
- `GET /api/adaptation/rules` – Adaptive rules
- `GET /api/adaptation/progress` – Progress tracker

## Models

- **User** – id (UUID), email, name, password_hash, study_preferences (JSON)
- **Task** – title, deadline, category, priority_score, status, estimated_effort, actual_time_spent, order_index, tags
- **InteractionLog** – session_id, event_type (page_view/click/scroll/hesitation/overload/idle), metadata (JSONB), time_spent_ms
- **FocusSession** – task_id, start_time, end_time, duration_minutes, completed, interruptions, notes
- **AdaptiveRule** – trigger_type, threshold_value, action_type (JSON), is_active, priority
- **ProgressTracker** – completion_rate, streak_days, longest_streak, total_focus_hours, tasks_completed
