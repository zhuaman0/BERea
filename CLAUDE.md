# BERea — AI Coding Guidelines

This repository hosts **two independent products** sharing one Next.js + FastAPI stack. Check
which one a request targets before writing code — don't assume furniture just because this file
used to be furniture-only.

| Product | Entry points | Audience |
|---|---|---|
| **Furniture Studio** | `frontend/src/app/(app)/*`, `frontend/src/app/furniture/page.tsx`, `backend/app/domains/{catalog,categories,orders,configurator}` | Kazakhstan furniture business |
| **451° / NATS Spirea** (reading league) | `frontend/src/app/page.tsx` (public landing), `frontend/src/app/reading/**`, `backend/app/domains/reading` | Student reading competition |

Both share the same **Code Style Rules**, **Module Naming Conventions**, and **Git Workflow**
below — those are repo-wide, not per-product.

## Furniture Studio — Project Vision
An AI-powered furniture configurator and room visualizer for a Kazakhstan furniture business.
The goal: become the #1 furniture company in Kazakhstan through superior digital tools.

Core pillars:
- **3D Furniture Configurator**: Modular builder — pick category, template, customize colors/handles/materials
- **AI Room Visualizer**: Upload wall photos → AI generates a beautiful room → place your furniture in it
- **Furniture Catalog**: Full product catalog with 3D preview, filtering, pricing
- **Saved Designs**: Users save and share their configured rooms
- **Orders & Quotes**: Request a quote or book a measurement visit directly

## 451° / NATS Spirea — Project Vision
A gamified reading league for students: teams of 2–3 read one book a month, vote on what they
read next, compete in live quiz nights, and climb a semester-long leaderboard.

Core pillars:
- **Team Registration**: Public landing page lets a team captain register the team + 3 players and upload a bank-transfer receipt for the season fee
- **Book Selection Vote**: Sequential `language → genre → book` rounds, admin-run with a time limit, winner decided automatically by majority vote once a round closes
- **Dashboard**: Per-student home with reading progress, team rank, streaks, and the semester map (shown as a bookshelf, not a generic stepper)
- **Quiz Nights & Bonus Tasks**: Live monthly quiz tied to that month's book, plus small bonus challenges worth extra points
- **Admin Panel**: Run quizzes, manage the book catalog, start vote rounds, review team registrations

## Repository Layout
```
frontend/   Next.js 16 + Tailwind + Three.js — both products' UI
backend/    FastAPI + SQLAlchemy + PostgreSQL — both products' domains
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

### TypeScript / React (Next.js)
- TypeScript strict mode everywhere (`"strict": true` in tsconfig).
- Functional components only. No class components.
- Props interfaces defined above the component they belong to.
- `useState` for local UI state. `zustand` for cross-component or persisted state.
- API calls live in `src/features/<domain>/api.ts`. Components never call `fetch` directly.
- Forms use `react-hook-form` + `zod` schemas. No uncontrolled inputs.
- No inline styles. Tailwind utility classes only.
- Named exports for components. Default exports only for page-level route components.

### Commit Messages
- Format: `<type>(<scope>): <short description>` (max 72 chars)
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`
- Examples: `feat(configurator): add modular template selector`, `fix(catalog): correct price filter range`

### Docker & Infrastructure
- Each service has its own Dockerfile in `docker/`.
- `.env.example` always kept up to date. Never commit real secrets.
- `docker-compose.yml` at root is the single source of truth for local dev.
- Healthchecks on every container that other services depend on.

## Git Workflow
- **One branch per task.** Never commit a new task's work directly to `main`.
- **Branch name**: `<product>/<type>/<kebab-slug>`.
  - `<product>` says which product the task is for — `rd` for 451°/NATS Spirea (reading league),
    `fs` for Furniture Studio. Use the repo-wide type when a task genuinely touches shared
    infra/docs/tooling rather than one product (see the `docs/project-governance` branch).
  - `<type>` is the same list as commit messages above (`feat`, `fix`, `refactor`, `chore`,
    `docs`, `test`).
  - Examples: `rd/feat/dashboard-left-align-animations`, `rd/fix/leaderboard-session-guard`,
    `fs/feat/catalog-price-filter`, `fs/fix/configurator-save-race`.
  - Scope the slug to the task, not the whole feature area — `rd/feat/dashboard-gamification`
    beats `rd/feat/dashboard-stuff`.
- **Commit as you go**, in logically separate commits where the diff naturally splits (e.g.
  backend migration/model/service/router as one commit, the matching frontend UI as another) —
  not one giant commit at the end of the task.
- **Before opening a PR**: run `/simplify` then `/code-review` (built-in) and `/cleanup-review`
  (project-specific — checks this file's conventions specifically: typing, Pydantic v2 at API
  boundaries, module naming, dead code, Tailwind-only styling). Fix what they find, then push.
- **Merge into `main`** only after review. `main` should always be in a deployable state.

## Hooks & CI
- **Husky (local, runs on `git commit` / `git push`)** — installed automatically by `npm install` at the repo root.
  - `pre-commit`: lint-staged → ESLint `--fix` on staged frontend files, `ruff check --fix` on staged backend files
    (skipped with a warning if ruff isn't installed locally: `pipx install ruff==0.17.0`).
  - `commit-msg`: enforces `<type>(<scope>): <description>` (≤ 72 chars).
  - `pre-push`: `npm run typecheck`.
  - Never bypass with `--no-verify`; fix what the hook reports.
- **GitHub Actions (`.github/workflows/ci.yml`, runs on every PR and push to `main`)** — frontend lint + typecheck,
  backend `ruff check` + import check, and the commit-message rule for every commit in the PR.
- Backend lint rules live in `backend/ruff.toml` (ruff pinned in `requirements-dev.txt`).
- Project skills in `.claude/skills/`: `cleanup-review`, `db-migration`, `new-endpoint`, `verify-in-browser`, `ship-pr`,
  `reading-design` (colors, layout and the shared page hero for every 451° page).

## Module Naming Conventions
| Layer | Pattern | Example |
|---|---|---|
| API Router | `router_<domain>.py` | `router_catalog.py` |
| Pydantic Schema | `schema_<domain>.py` | `schema_catalog.py` |
| SQLAlchemy Model | `model_<domain>.py` | `model_catalog.py` |
| Service | `service_<domain>.py` | `service_orders.py` |
| Repository | `repo_<domain>.py` | `repo_catalog.py` |
| React Page | `page.tsx` (Next.js app router) | `app/(app)/catalog/page.tsx` |
| React Component | `<Name>.tsx` | `FurnitureCard.tsx` |
| Zustand Store | `use<Name>Store.ts` | `useConfiguratorStore.ts` |
| API Service | `<domain>Api.ts` | `catalogApi.ts` |

## Domain Glossary

### Furniture Studio
- **FurnitureItem**: A product in the catalog with name, category, price, materials, 3D model ref
- **Category**: Furniture category (kitchen, living room, bedroom, office, etc.)
- **ConfiguratorTemplate**: A modular furniture structure (e.g. "4 bottom doors + 2 top doors")
- **SavedDesign**: A user's saved furniture configuration with selected materials/colors
- **RoomGeneration**: An AI-generated room image based on uploaded wall photos
- **Order**: A customer quote request or confirmed order with contact details

### 451° / NATS Spirea
- **ReadingTeam**: A team of 2–3 students competing together; `token_balance` tracks quiz-night credit
- **ReadingTeamRegistration**: A public pre-registration (team name + 3 players + payment receipt PDF), reviewed by an admin, separate from account creation
- **VoteRound**: One stage (`language` | `genre` | `book`) of the monthly book-selection vote, with a `closes_at` deadline; the winner is computed from vote counts once it closes — no manual admin step
- **VoteOption**: One choice within a `VoteRound` (e.g. a language, a genre, a book title)
- **SemesterMonth**: One month of the 4-month season (`done` | `in_progress` | `locked`), shown on the dashboard as a bookshelf, not a stepper
- **BonusTask**: An optional extra-credit challenge (e.g. a TikTok review) worth bonus points
- **QuizNight**: The live monthly Kahoot-style quiz on that month's book
