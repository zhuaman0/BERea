from __future__ import annotations

import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Database ────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://berea:berea_dev_password@db:5432/berea_db"

    # ─── JWT ─────────────────────────────────────────────────────────────────
    secret_key: str = "change_this_to_a_long_random_secret_key_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ─── CORS ────────────────────────────────────────────────────────────────
    backend_cors_origins: list[str] = ["http://localhost:5173", "http://localhost"]

    # ─── OAuth ───────────────────────────────────────────────────────────────
    google_client_id: str = ""
    google_client_secret: str = ""

    # ─── AI ──────────────────────────────────────────────────────────────────
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # ─── YouTube ─────────────────────────────────────────────────────────────
    youtube_api_key: str = ""

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return json.loads(v)
        return v


settings = Settings()
