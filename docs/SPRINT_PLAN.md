# Agile sprint plan — Adaptive Academic Task Manager (Flowstate)

Three sprints sized for a software engineering course. Each sprint ends with a demo against acceptance criteria.

## Sprint 1 — Identity, tasks, and safety net (2 weeks)

**Goal:** Students can register, sign in, manage a personal profile, and perform full task CRUD with categories and priorities.

| ID   | User story                                                                 | Acceptance criteria |
|------|----------------------------------------------------------------------------|---------------------|
| S1-1 | As a student, I register with email and password so my data is private.   | `POST /api/auth/register` creates user; password never returned; bcrypt hash stored. |
| S1-2 | As a student, I log in and stay signed in across refreshes.               | JWT access + refresh returned; `/api/users/me` works with Bearer token. |
| S1-3 | As a student, I edit my display name and study preferences.                 | `PATCH /api/users/me` persists `study_preferences` (theme, focus default). |
| S1-4 | As a student, I create tasks with due date, category, and priority.     | Tasks linked to user; filters by `category` and `priority` on list endpoint. |
| S1-5 | As a student, I update status to completed and delete mistakes.           | `PATCH` and `DELETE` return correct HTTP semantics; list reflects changes. |

**Definition of done:** Auth flows covered in automated tests; OpenAPI `/docs` accurate; README setup steps verified on Postgres.

---

## Sprint 2 — Adaptation, focus, and recommendations (2 weeks)

**Goal:** The product reacts to overload, hesitation, and context switches; focus mode supports deep work; server suggests the next best task.

| ID   | User story                                                                 | Acceptance criteria |
|------|----------------------------------------------------------------------------|---------------------|
| S2-1 | As a student, I see fewer controls when I freeze on the page.              | Client logs `interaction_state`; UI hides non-essential filters in hesitation mode. |
| S2-2 | As a student with many open items, the UI highlights priorities.          | Overload state shows banner; recommendation prefers overdue high-priority work. |
| S2-3 | As a student, I enter focus mode with one task and a Pomodoro timer.      | `/focus` hides chrome; timer start/pause/reset; optional task from navigation state. |
| S2-4 | As a student, I request a single next task that respects my current state.| `POST /api/adaptation/recommendations` returns one task and a machine-readable reason. |
| S2-5 | As a student returning from a long break, I see a gentle re-entry path.     | `GET /api/adaptation/recovery-suggestions` after 10+ minutes idle suggests a task. |

**Definition of done:** Interaction logs stored in `interaction_logs`; manual test script for each adaptive path; focus mode usable on mobile width.

---

## Sprint 3 — Progress, quality, and release (2 weeks)

**Goal:** Stakeholders see trends; automated tests protect core flows; repository is demo-ready.

| ID   | User story                                                                 | Acceptance criteria |
|------|----------------------------------------------------------------------------|---------------------|
| S3-1 | As a student, I see my streak and last-seven-days completion chart.       | `GET /api/adaptation/progress/summary` drives dashboard chart data. |
| S3-2 | As a teammate, I trust CI to catch regressions on task APIs.              | Pytest covers task create + list; Vitest covers a pure client module. |
| S3-3 | As a reviewer, I read how sprints map to learning outcomes.                | This `SPRINT_PLAN.md` kept in repo; retro notes in PR template optional. |
| S3-4 | As a user on a phone, I can navigate core flows with the bottom bar.      | Responsive layout passes manual checklist (login, tasks, focus, progress). |
| S3-5 | As a course staff member, I can grade against a clear architecture doc.   | `docs/ARCHITECTURE.md` references new adaptation and progress services. |

**Definition of done:** `pytest` green on Postgres-backed CI; `npm run build` green; demo script with seed user and two tasks.

---

## Wireframe notes (text)

**Mobile shell:** Top area reserved for optional distraction ribbon; scrollable content; fixed bottom navigation (Home, Tasks, Add, Focus, Stats). Cards stack vertically with priority chip and three actions (Edit, Delete, Focus).

**Desktop shell:** Fixed 260px left sidebar with account + logout; main column uses CSS grid for dashboard (stats row + two-column sections). Tasks use auto-fill card grid (min 280px).

**Focus mode:** Single centered column (max ~720px); primary block is large `MM:SS` timer with Start/Pause and Reset; secondary block is “Current task” title and meta line; top-left text button exits to dashboard.

**Progress:** KPI row (four equal cards); full-width line chart for seven-day completions; secondary bar chart placeholder for future priority breakdown.

**Auth:** Split card: marketing column (desktop only) + form column with segmented Login / Sign Up control; inline validation errors.
