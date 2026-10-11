---
name: db-migration
description: Create and apply an Alembic migration in BERea safely. Use whenever a SQLAlchemy model in backend/app/domains/*/model_*.py gains, loses or changes a column/table, when the user says "add a column", "new table", "migrate", "alembic", or when a backend change needs a schema update. Covers this repo's known autogenerate trap (it tries to DROP old study-lab tables) and NOT NULL columns on tables that already have rows.
---

# DB migration (BERea)

Alembic runs inside the `berea_backend` container. Autogenerate in this repo is **not** safe to apply
as-is — always read and trim the generated file.

## Steps

1. **Register new models** — if you added a new model class, import it in `backend/alembic/env.py`
   (the big `from app.domains.reading.model_reading import (...)` block), or autogenerate won't see it.
2. **Generate**
   ```bash
   docker exec berea_backend alembic revision --autogenerate -m "<what changed, lowercase>"
   ```
3. **Trim the noise.** The database still has pre-pivot "study lab" tables with no models:
   `analytic_reports`, `materials`, `test_questions`, `ai_personas`, `flashcards`, `study_sessions`,
   `persona_interactions`. Autogenerate emits `drop_table`/`drop_index` for all of them (and a huge
   `downgrade` recreating them). **Delete every one of those operations** — `upgrade()` and
   `downgrade()` must contain only the change you actually made. Also drop the unused
   `from sqlalchemy.dialects import postgresql` import if nothing uses it.
4. **NOT NULL on existing tables** — any `add_column(..., nullable=False)` on a table that already has
   rows needs `server_default=...` (e.g. `server_default='0'`, `server_default='ember'`), or the upgrade
   fails. Mirror it in the model with `server_default=` too.
5. **Apply and verify**
   ```bash
   docker exec berea_backend alembic upgrade head
   docker exec berea_backend python -c "import app.main"
   ```
   Then hit an endpoint that reads the new column with curl.
6. Commit the migration together with the model/schema/service change it belongs to.

## Don't
- Don't run `alembic downgrade` against the shared dev DB to "retry" — fix forward with a new revision.
- Don't hand-edit an already-applied migration that's been pushed; add a new one.
