#!/usr/bin/env bash
# Wipes and recreates the database. DESTRUCTIVE — local dev only.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

read -r -p "This will DELETE all local data. Are you sure? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

echo "→ Stopping services..."
docker compose down -v

echo "→ Restarting database..."
docker compose up -d db

echo "→ Waiting for Postgres..."
until docker compose exec db pg_isready -U berea -d berea_db -q; do
  printf "."
  sleep 1
done
echo ""

echo "→ Running migrations from scratch..."
docker compose run --rm backend alembic upgrade head

echo "✓ Database reset complete."
