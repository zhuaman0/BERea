# Furniture Studio — AI Coding Guidelines

## Project Vision
An AI-powered furniture configurator and room visualizer for a Kazakhstan furniture business.
The goal: become the #1 furniture company in Kazakhstan through superior digital tools.

Core pillars:
- **3D Furniture Configurator**: Modular builder — pick category, template, customize colors/handles/materials
- **AI Room Visualizer**: Upload wall photos → AI generates a beautiful room → place your furniture in it
- **Furniture Catalog**: Full product catalog with 3D preview, filtering, pricing
- **Saved Designs**: Users save and share their configured rooms
- **Orders & Quotes**: Request a quote or book a measurement visit directly

## Repository Layout
```
frontend/   Next.js 16 + Tailwind + Three.js (user-facing app)
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
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- Examples: `feat(configurator): add modular template selector`, `fix(catalog): correct price filter range`

### Docker & Infrastructure
- Each service has its own Dockerfile in `docker/`.
- `.env.example` always kept up to date. Never commit real secrets.
- `docker-compose.yml` at root is the single source of truth for local dev.
- Healthchecks on every container that other services depend on.

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
- **FurnitureItem**: A product in the catalog with name, category, price, materials, 3D model ref
- **Category**: Furniture category (kitchen, living room, bedroom, office, etc.)
- **ConfiguratorTemplate**: A modular furniture structure (e.g. "4 bottom doors + 2 top doors")
- **SavedDesign**: A user's saved furniture configuration with selected materials/colors
- **RoomGeneration**: An AI-generated room image based on uploaded wall photos
- **Order**: A customer quote request or confirmed order with contact details
