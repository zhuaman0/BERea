#!/usr/bin/env sh
# Lints staged backend files with the repo's pinned ruff config. If ruff isn't installed
# locally the commit still goes through — CI runs the same check on every push.
if ! command -v ruff >/dev/null 2>&1; then
  echo "⚠ ruff not installed — skipping backend lint (CI will still check). Install: pipx install ruff==0.17.0"
  exit 0
fi

exec ruff check --fix --config backend/ruff.toml "$@"
