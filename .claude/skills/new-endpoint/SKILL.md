---
name: new-endpoint
description: Add a backend API endpoint to BERea end-to-end — Pydantic schema, repo query, service logic, thin router, and the matching frontend type + API client method. Use whenever the user asks for a new backend feature, "an endpoint for X", "save this to the backend", "make this real data instead of mock", or any change that needs FastAPI + the frontend to talk. Follows the repo's router_/schema_/service_/repo_<domain>.py layering.
---

# New endpoint (BERea)

Work through the layers in this order — each one only talks to the layer below it.

## Backend (`backend/app/domains/<domain>/`)

1. **`schema_<domain>.py`** — request/response Pydantic v2 models. Use `Literal[...]` for fixed option
   sets, `Field(min_length=..., max_length=...)` for strings, and a `field_validator` to normalise input
   (e.g. strip a title, turn `""` into `None`). Never return raw dicts or ORM objects.
2. **`repo_<domain>.py`** — the DB query/mutation only (`select(...)`, set fields, `commit`, `refresh`).
   No HTTP errors here.
3. **`service_<domain>.py`** — business rules: load the current user, enforce scoping
   (e.g. "teammate must be on *your* team" → 404, "team full" → 409), call the repo, map to the
   response schema with a small `_to_<thing>_response()` helper. Raise `HTTPException` with an explicit
   status and `detail`. Repo imports go inside the function (existing pattern in this file).
4. **`router_<domain>.py`** — thin: `CurrentUserId` + `DbSession` deps, `response_model=...`, call the
   service, return. Static paths before parameterised ones of the same method.
5. Schema change? → use the **db-migration** skill.
6. Verify with curl through nginx: `http://localhost/api/v1/<domain>/...` (register a throwaway
   `qa-<name>-verify@gmail.com` user for a token — `@example.*` emails are rejected by the validator).

## Frontend (`frontend/src/features/<domain>/`)

7. Mirror the response type in `authTypes.ts` / `types.ts` (exact field names, `snake_case` as sent).
8. Add the call to the domain's `*Api.ts` object using `readingApiClient.get/post/put/patch/delete`.
   Components never call `fetch` directly.
9. Load data in pages with a promise chain inside `useEffect` (`.then(setX).catch(...).finally(...)`) —
   don't call `setState` synchronously in an effect body (React Compiler lint rule).

## Done when
- `docker exec berea_backend python -c "import app.main"`, `npm run typecheck`, `npm run lint` pass.
- No fabricated numbers: if the backend can't provide a value yet, show an honest `0` / `—`, never mock data.
