# Development Guide

## Prerequisites

- Python 3.11+ (recommended)
- PostgreSQL 14+
- Redis (for Celery and optional cache)
- `pip` and a virtual environment

## One-Time Setup

1. **Clone and enter the repo**
   ```bash
   cd Flowstate
   ```

2. **Create and activate a virtualenv**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`: set `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `CELERY_BROKER_URL`, and optionally `CORS_ALLOWED_ORIGINS`.

5. **PostgreSQL**
   - Create the database (e.g. `flowstate`).
   - Enable extension: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

6. **Migrations**
   ```bash
   alembic upgrade head
   ```

## Running Locally

### API server

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000  
- OpenAPI docs: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc  
- Metrics: http://localhost:8000/metrics  

### Celery worker (optional, for background tasks)

```bash
celery -A app.celery_app worker --loglevel=info
```

### Redis

Ensure Redis is running (e.g. `redis-server` or Docker). Required for Celery and any cache usage.

## Testing

- **Run all tests**
  ```bash
  pytest
  ```

- **With coverage**
  ```bash
  pytest --cov=app --cov-report=term-missing
  ```

- **Verbose**
  ```bash
  pytest -v
  ```

By default, tests use an in-memory SQLite DB. To run against PostgreSQL, set `TEST_DATABASE_URL` in `.env` (e.g. a separate test DB).

## Code Quality (optional but recommended)

- **Format**
  ```bash
  ruff format app tests
  ```

- **Lint**
  ```bash
  ruff check app tests
  ```

Config is in `pyproject.toml`. Fix auto-fixable issues with `ruff check --fix`.

## Database Migrations

After changing models in `app/models/`:

```bash
alembic revision --autogenerate -m "Describe your change"
alembic upgrade head
```

Review the generated migration before committing.

## Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | JWT signing; use a long random value in production |
| `DATABASE_URL` | PostgreSQL connection (async: `postgresql+asyncpg://...`) |
| `REDIS_URL` / `CACHE_URL` / `CELERY_BROKER_URL` | Redis URLs |
| `JWT_ACCESS_LIFETIME_MINUTES` / `JWT_REFRESH_LIFETIME_DAYS` | Token expiry |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins (comma-separated) |
| `TEST_DATABASE_URL` | Optional; override test DB (e.g. Postgres) |

## Where to Put New Code

- **New API route** → New or existing file under `app/api/`, then include router in `app/main.py`.
- **New model** → New file in `app/models/`, import in `app/models/__init__.py`, then create a migration.
- **New request/response shape** → New or existing schema in `app/schemas/`.
- **New background job** → New or existing task in `app/worker/tasks.py`.
- **New test** → Add under `tests/` (e.g. `test_<feature>.py`), use fixtures from `conftest.py`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for folder roles and conventions.
