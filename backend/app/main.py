from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_v1_router
from app.config import settings
from app.database import engine

# Eagerly import all ORM models so SQLAlchemy's mapper registry is fully
# populated before any query runs.  Cross-domain relationships (e.g.
# User → StudySession) fail with "failed to locate name" when the routers
# use lazy imports and only some models have been loaded.
import app.domains.auth.model_auth  # noqa: F401
import app.domains.users.model_users  # noqa: F401
import app.domains.study_sessions.model_study_sessions  # noqa: F401
import app.domains.materials.model_materials  # noqa: F401
import app.domains.ai_personas.model_ai_personas  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    await engine.dispose()


app = FastAPI(
    title="BERea API",
    description="Personalized study lab — discover how you learn best.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
