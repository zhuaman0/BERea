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

```bash
# From project root
cd docker

# 1. Build all images
docker compose build

# 2. Start all services in the background
docker compose up -d

# 3. Run database migrations (first run only, or after new migrations)
docker compose exec backend alembic upgrade head

# 4. Verify everything is healthy
docker compose ps
```

The stack is now reachable at:

| URL | Service |
|-----|---------|
| `http://localhost` | Next.js frontend (via Nginx) |
| `http://localhost/api/v1/...` | FastAPI backend (via Nginx) |
| `http://localhost/docs` | FastAPI Swagger UI |
| `http://localhost:8000` | FastAPI direct (dev only) |
| `http://localhost:3000` | Next.js direct (dev only) |

---

## Common Commands

### Logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f db
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

# Frontend (Node)
docker compose exec frontend sh

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
docker compose build frontend

# Force rebuild from scratch (no cache)
docker compose build --no-cache

# Build the production frontend image (standalone output)
docker compose build --build-arg TARGET=runner frontend
```

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

1. Set `target: runner` (instead of `development`) in the `frontend` service build section.
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
│       └──────────────────► berea_frontend:3000       │
│                                                     │
│  berea_backend ──────────► berea_db:5432            │
└─────────────────────────────────────────────────────┘
```
