# BERea Docker Environment

All Docker Compose commands must be run from the `docker/` directory, or use the
`-f` flag from the project root.

## Prerequisites

- Docker Engine 24+
- Docker Compose v2 (`docker compose`, not `docker-compose`)
- A `.env` file at the **project root** (copy from `../.env.example`)

```bash
# One-time setup from the project root
cp .env.example .env
# Fill in secrets: SECRET_KEY, POSTGRES_PASSWORD, API keys …
```

---

## Quick Start

The frontend is **not** part of this compose stack — run it on the host so you
get native `npm run dev` hot reload without a container layer in between.

```bash
# From project root
cd docker

# 1. Build images (db, backend, nginx)
docker compose build

# 2. Start those services in the background
docker compose up -d

# 3. Run database migrations (first run only, or after new migrations)
docker compose exec backend alembic upgrade head

# 4. Verify everything is healthy
docker compose ps
```

```bash
# In a separate terminal, from the project root (or frontend/)
npm run dev
```

The stack is now reachable at:

| URL | Service |
|-----|---------|
| `http://localhost` | Next.js frontend (via Nginx → host `npm run dev`) |
| `http://localhost/api/v1/...` | FastAPI backend (via Nginx) |
| `http://localhost/docs` | FastAPI Swagger UI |
| `http://localhost:8000` | FastAPI direct (dev only) |
| `http://localhost:3003` | Next.js direct (dev only) |

---

## Common Commands

### Logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f backend
docker compose logs -f nginx
docker compose logs -f db

# Frontend runs on the host — its logs are just the `npm run dev` terminal
```

### Database

```bash
# Run pending migrations
docker compose exec backend alembic upgrade head

# Create a new migration (after editing SQLAlchemy models)
docker compose exec backend alembic revision --autogenerate -m "describe change"

# Roll back one migration
docker compose exec backend alembic downgrade -1

# Open a psql shell
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### Shell access

```bash
# Backend (Python)
docker compose exec backend bash

# Nginx
docker compose exec nginx sh
```

### Reload Nginx config (without restart)

```bash
docker compose exec nginx nginx -s reload
```

---

## Build Commands

```bash
# Rebuild a single service image
docker compose build backend

# Force rebuild from scratch (no cache)
docker compose build --no-cache
```

`docker/Dockerfile.frontend` still exists for a containerized production build
(`docker build -f docker/Dockerfile.frontend --target runner .`); it's just
not part of the local dev compose stack anymore.

---

## Stop & Clean Up

```bash
# Stop containers (preserve volumes)
docker compose down

# Stop and remove named volumes (⚠ destroys database data)
docker compose down -v

# Remove all stopped containers and dangling images
docker system prune
```

---

## Production Deployment

1. Reintroduce a `frontend` service built from `docker/Dockerfile.frontend` with `target: runner`, or deploy it separately (e.g. Vercel) — it's intentionally left out of local dev compose.
2. Set `--reload` → `--workers 4` in the `backend` CMD (or override via `command:`).
3. Generate SSL certificates and follow the instructions in `../nginx/conf.d/default.ssl.conf.template`.
4. Set all secrets in `.env` (strong `SECRET_KEY`, real `POSTGRES_PASSWORD`, etc.).
5. Remove or IP-restrict the FastAPI `/docs` and `/redoc` locations in `default.conf`.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   berea_net (bridge)                │
│                                                     │
│  ┌──────────┐   port 80/443   ┌──────────────────┐ │
│  │  Nginx   │ ←── internet    │   docker host    │ │
│  └────┬─────┘                 └──────────────────┘ │
│       │ /api/*                                      │
│       ├──────────────────► berea_backend:8000        │
│       │ /*                                          │
│       └──────────────────► host.docker.internal:3003 ┼──► npm run dev (host)
│                                                     │
│  berea_backend ──────────► berea_db:5432            │
└─────────────────────────────────────────────────────┘
```
