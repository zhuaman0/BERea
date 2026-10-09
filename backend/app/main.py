from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_v1_router
from app.config import settings
from app.database import engine

import app.domains.auth.model_auth  # noqa: F401
import app.domains.users.model_users  # noqa: F401
import app.domains.catalog.model_catalog  # noqa: F401
import app.domains.categories.model_categories  # noqa: F401
import app.domains.orders.model_orders  # noqa: F401
import app.domains.configurator.model_configurator  # noqa: F401
import app.domains.reading.model_reading  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    await engine.dispose()


app = FastAPI(
    title="Furniture Studio API",
    description="AI-powered furniture configurator and room visualizer.",
    version="1.0.0",
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
