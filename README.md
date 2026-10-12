# BERea

A monorepo hosting two independent products on one Next.js + FastAPI stack:

| Product | What it is | Try it at |
| --- | --- | --- |
| **451° / NATS Spirea** | A gamified reading league for students — teams read one book a month, vote on what's next, and compete in live quiz nights. | `/reading` |
| **Furniture Studio** | An AI-powered furniture configurator and room visualizer for a Kazakhstan furniture business. | `/furniture` |

They share the same database, backend, Docker setup, and design-system packages, but are otherwise separate products — check which one a task targets before changing code.

## Project Status

🚧 **Under active development.** Features and implementation details may change.

---

## 451° / NATS Spirea — Reading League

451 is built around a simple idea: turn reading into an experience that encourages people to keep going. Teams of 2–3 students choose a book, read, vote on what comes next, and climb a semester-long leaderboard together.

The name references *Fahrenheit 451*, reflecting the project's focus on books, knowledge, and the value of reading.

**Core experience:**

- **Team registration** — a captain registers the team and 3 players, with a bank-transfer receipt for the season fee.
- **Book selection vote** — sequential language → genre → book rounds; the winner is decided automatically once a round closes.
- **Dashboard** — reading progress, team rank, streaks, and a semester map shown as a bookshelf.
- **Quiz nights & bonus tasks** — a live monthly quiz tied to that month's book, plus small bonus challenges for extra points.
- **Admin panel** — run quizzes, manage the book catalog, start vote rounds, and review team registrations.

## Furniture Studio

An AI-powered furniture configurator and room visualizer. The goal: become the #1 furniture company in Kazakhstan through superior digital tools.

**Core experience:**

- **3D furniture configurator** — pick a category and template, then customize colors, handles, and materials.
- **AI room visualizer** — upload wall photos, generate a room, and place your configured furniture in it.
- **Furniture catalog** — full product catalog with 3D previews, filtering, and pricing.
- **Saved designs** — save and share configured rooms.
- **Orders & quotes** — request a quote or book a measurement visit.

---

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind, Three.js |
| Backend | FastAPI, Python, SQLAlchemy (async) |
| Database | PostgreSQL |
| Infrastructure | Docker, Docker Compose, Nginx |
| Auth | JWT access/refresh tokens |
| Code quality | ESLint, Ruff, Husky, lint-staged |

## Repository Structure

```text
frontend/       Next.js UI for both products
backend/        FastAPI app; business logic under app/domains/
  domains/
    catalog/       Furniture Studio — product catalog
    categories/     Furniture Studio — furniture categories
    configurator/  Furniture Studio — modular configurator
    orders/        Furniture Studio — quotes and orders
    reading/       451° / NATS Spirea — all reading-league logic
    auth/, users/  Shared across both products
packages/       Shared workspace packages
  api/          Typed API clients shared by the frontend
  core/         Shared application logic (storage, hooks, utils)
  eslint-config/ Shared lint configuration
  ui-kit/       Reusable UI components (@berea/ui-kit)
docker/         Per-service Dockerfiles
nginx/          Reverse proxy config
scripts/        Dev automation (setup, DB reset)
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) with Docker Compose v2
- [Node.js](https://nodejs.org/) ≥ 22 and npm
- Python 3.12+ (only needed if you run backend tooling outside Docker, e.g. Alembic migrations locally)

### 1. Clone and set up the environment

```bash
git clone https://github.com/zhuaman0/BERea.git
cd BERea
./scripts/dev-setup.sh
```

`dev-setup.sh` copies `.env.example` → `.env` (if missing), builds the Docker images, starts Postgres, and runs the Alembic migrations. Fill in real secrets in `.env` before relying on features that need them (OAuth, AI keys, etc.) — the defaults are fine for local dev otherwise.

### 2. Start the stack

```bash
docker compose up        # db, backend, nginx
npm install               # installs the frontend + all packages/* workspaces
npm run dev                # starts the Next.js dev server on the host, port 3003
```

The frontend intentionally runs on the host (not in Docker) for fast refresh; Nginx proxies to it via `host.docker.internal`.

### 3. Open the app

| URL | What you get |
| --- | --- |
| `http://localhost` | Full stack through Nginx (use this one) |
| `http://localhost/reading` | 451° / NATS Spirea |
| `http://localhost/furniture` | Furniture Studio landing page |
| `http://localhost:8000/docs` | Backend API docs (Swagger) |
| `http://localhost:3003` | Frontend directly, bypassing Nginx |

### Using 451° / NATS Spirea

1. Register an account at `/reading/register`.
2. Create or join a team (2–3 students) at `/reading/join-team`.
3. From the dashboard: log reading pages, vote on the next book once a vote round opens, check the leaderboard, and join quiz nights.
4. Admins manage books, quizzes, and vote rounds from `/reading/admin` (requires an admin account).

### Using Furniture Studio

1. Register or sign in at `/login` / `/register`.
2. Browse the catalog at `/catalog`, or jump straight into `/configurator` to build a piece from a template.
3. Save configured designs from `/my-designs`.
4. Admins manage the catalog and orders from `/admin`.

---

## Useful Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the frontend dev server |
| `npm run build` | Production build of the frontend |
| `npm run lint` | Lint the frontend |
| `npm run typecheck` | Type-check the frontend (also runs on `git push`) |
| `docker compose up` | Start db, backend, nginx |
| `docker compose logs -f backend` | Tail logs for a service |
| `docker compose run --rm backend alembic revision --autogenerate -m "..."` | Create a new DB migration |
| `./scripts/reset-db.sh` | **Destructive.** Wipes and recreates the local database from scratch |

## Configuration

Use `.env.example` as the reference for your local `.env`. Depending on the features you enable, configuration may include:

- Database connection settings
- Authentication and token settings (`SECRET_KEY`, token expiry)
- Allowed frontend origins (CORS)
- Google OAuth credentials
- Optional external service API keys (OpenAI, Anthropic, YouTube)

Keep real credentials in local environment files only. Never commit passwords, secrets, or API keys to the repository.

## Development Conventions

See [`CLAUDE.md`](./CLAUDE.md) for the full set of conventions: code style, module naming, git workflow, and the project's own review skills under `.claude/skills/`. The short version:

- One branch per task, named `<product>/<type>/<slug>` (`rd/` for the reading league, `fs/` for Furniture Studio).
- Commits follow `<type>(<scope>): <description>`.
- Husky runs lint-staged on commit and `npm run typecheck` on push — don't bypass with `--no-verify`.

## Vision

Make reading a habit people enjoy returning to, and make BERea Kazakhstan's #1 furniture company's digital storefront — one book, one room, one configured piece at a time.
