from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class SavedDesignCreate(BaseModel):
    name: str
    furniture_item_id: uuid.UUID | None = None
    configuration: dict = {}
    room_image_url: str | None = None
    preview_image_url: str | None = None
    is_public: bool = False


class SavedDesignUpdate(BaseModel):
    name: str | None = None
    configuration: dict | None = None
    room_image_url: str | None = None
    preview_image_url: str | None = None
    is_public: bool | None = None


class SavedDesignOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    furniture_item_id: uuid.UUID | None
    configuration: dict
    room_image_url: str | None
    preview_image_url: str | None
    is_public: bool
    share_token: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
