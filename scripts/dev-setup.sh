#!/usr/bin/env bash
# Initial dev environment setup. Run once after cloning.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "→ Checking dependencies..."
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker is not installed"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "ERROR: docker compose v2 is not installed"; exit 1; }

echo "→ Copying .env.example → .env (if not already present)..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env — fill in secrets before running the app."
else
  echo "  .env already exists, skipping."
fi

echo "→ Building containers..."
docker compose build

echo "→ Starting database..."
docker compose up -d db

echo "→ Waiting for Postgres to be ready..."
until docker compose exec db pg_isready -U berea -d berea_db -q; do
  printf "."
  sleep 1
done
echo ""

echo "→ Running Alembic migrations..."
docker compose run --rm backend alembic upgrade head

echo ""
echo "✓ BERea dev environment is ready."
echo "  Run: docker compose up          (db, backend, nginx)"
echo "  Then, in another terminal: npm run dev   (frontend, on the host)"
echo "  Frontend direct: http://localhost:3003"
echo "  Backend API: http://localhost:8000/docs"
echo "  Full stack via Nginx: http://localhost"
