# Contributing to Flowstate

Thanks for helping make Flowstate better. This guide keeps the team aligned on how to work on the project.

## Getting Started

1. Read [README.md](README.md) for project overview and quick setup.
2. Follow [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for local environment and commands.
3. Skim [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for structure and conventions.

## Branch Strategy

- **`main`** – stable, deployable code. Protect it; changes enter via PR.
- **Feature work** – create a branch from `main`:
  - `feature/short-description` (e.g. `feature/focus-session-export`)
  - `fix/short-description` (e.g. `fix/auth-refresh-expiry`)
- Keep branches short-lived and up to date with `main` (rebase or merge as agreed).

## Pull Request Process

1. **Create a branch** from `main`, do your changes, and push.
2. **Run locally**:
   - `pytest` (all tests pass).
   - Optionally: `ruff check app tests` and `ruff format app tests`.
3. **Open a PR** against `main`:
   - Use a clear title and description.
   - Reference any issue (e.g. "Fixes #123").
   - Add a brief note on what you changed and how to test it.
4. **Review**: Address feedback; keep discussions focused.
5. **Merge**: Once approved and CI (if any) is green, merge. Prefer squash or linear history as per team preference.

## Code Conventions

- **Python**: Follow PEP 8. Use the project’s formatter/linter (see below).
- **Imports**: Group stdlib, third-party, then local (`app.*`). Use absolute imports from `app`.
- **API**:
  - New routes under `/api/*`; register routers in `app/main.py`.
  - Use Pydantic schemas for request/response; use `app.api.deps` for auth and DB.
- **Database**: Change models in `app/models/`; add an Alembic migration for each change.
- **Tests**: Put tests in `tests/`; use fixtures from `conftest.py`. Aim to maintain or improve coverage.

## Formatting & Linting

The project uses **Ruff** for formatting and linting. Config is in `pyproject.toml`.

- Format: `ruff format app tests`
- Lint: `ruff check app tests` (use `--fix` for auto-fixable issues)

Run these before committing or ensure your editor runs them on save.

## Where to Ask for Help

- **Architecture / where to put code**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Local setup / tests / migrations**: See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
- **Product/design decisions**: Discuss with the team (Slack, issues, or ADRs in `docs/` if you introduce them).

## Summary

- Branch from `main`, use descriptive branch names.
- PRs require tests passing and optional Ruff checks.
- Follow existing structure: `app/api`, `app/models`, `app/schemas`, `tests/`.
- Document non-obvious decisions in code or in `docs/`.
