# BERea — AI Coding Guidelines

## Project Vision
BERea is a personalized study lab that helps students discover *how* they learn best. Core pillars:
- **Method Testing**: Pomodoro, spaced repetition, flashcards, practice tests
- **AI Personas**: Distinct characters (kind, tough, intense) that coach users differently
- **Analytics Engine**: Weekly/monthly insight reports on what study conditions work best
- **Content Processing**: YouTube subtitle extraction + simplification
- **Streak & Planning**: Duolingo-style accountability for goals like IELTS prep

## Repository Layout
```
frontend/   React + Vite + Tailwind (user-facing SPA)
backend/    FastAPI + SQLAlchemy + PostgreSQL
docker/     Per-service Dockerfiles
nginx/      Reverse proxy config
scripts/    Dev automation (seed, migrate, reset)
```

## Code Style Rules

### General
- Prefer explicit over clever. Readable beats compact.
- No `any` types anywhere — if a type is unknown, model it correctly.
- No dead code. Remove it rather than commenting it out.
- Write no comments unless the WHY is non-obvious (hidden constraint, workaround, invariant).
- No placeholder TODOs unless linked to a GitHub issue.

### Python / FastAPI
- Python 3.12+. Use `from __future__ import annotations` in every file.
- Strictly typed: all function signatures must have full type hints including return types.
- Use Pydantic v2 models for all request/response schemas. Never use raw dicts at API boundaries.
- SQLAlchemy 2.x mapped-column style only (`Mapped[T]`, `mapped_column()`). No legacy Column() style.
- Routers are thin. Business logic lives in `services/`. DB queries live in `repositories/`.
- Dependency injection via FastAPI `Depends()`. No global state.
- All endpoints return typed Pydantic response models. Never return bare ORM objects.
- Async-first: all route handlers and DB sessions use `async def`.
- Error handling: raise `HTTPException` with explicit status codes and `detail` strings.
- Environment config via `pydantic-settings` (`BaseSettings`). Never read `os.environ` directly.

### TypeScript / React
- TypeScript strict mode everywhere (`"strict": true` in tsconfig).
- Functional components only. No class components.
- Props interfaces defined above the component they belong to.
- `useState` for local UI state. `zustand` for cross-component or persisted state.
- API calls live in `src/services/`. Components never call `fetch` directly.
- Forms use `react-hook-form` + `zod` schemas. No uncontrolled inputs.
- No inline styles. Tailwind utility classes only. Custom design tokens in `tailwind.config.ts`.
- `React.memo` only when profiling proves it necessary. No premature optimization.
- Named exports for components. Default exports only for page-level route components.

### Commit Messages
- Format: `<type>(<scope>): <short description>` (max 72 chars)
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- Examples: `feat(auth): add JWT refresh token rotation`, `fix(pomodoro): correct timer drift on tab blur`

### Docker & Infrastructure
- Each service has its own Dockerfile in `docker/`.
- `.env.example` always kept up to date. Never commit real secrets.
- `docker-compose.yml` at root is the single source of truth for local dev.
- Healthchecks on every container that other services depend on.

## Module Naming Conventions
| Layer | Pattern | Example |
|---|---|---|
| API Router | `router_<domain>.py` | `router_auth.py` |
| Pydantic Schema | `schema_<domain>.py` | `schema_users.py` |
| SQLAlchemy Model | `model_<domain>.py` | `model_users.py` |
| Service | `service_<domain>.py` | `service_study_sessions.py` |
| Repository | `repo_<domain>.py` | `repo_materials.py` |
| React Page | `<Name>Page.tsx` | `DashboardPage.tsx` |
| React Component | `<Name>.tsx` | `PomodoroTimer.tsx` |
| Zustand Store | `use<Name>Store.ts` | `useStudySessionStore.ts` |
| API Service | `<domain>Api.ts` | `authApi.ts` |

## Domain Glossary
- **StudySession**: One timed work block (e.g., a Pomodoro round) with method, duration, material, focus score
- **Material**: A learning object — flashcard deck, test, or YouTube-sourced summary
- **Persona**: An AI coaching character with a defined tone, escalation rules, and prompt template
- **Streak**: Consecutive days meeting a study goal threshold
- **AnalyticReport**: Aggregated insight snapshot (weekly/monthly) comparing methods and conditions
