from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: uuid.UUID
    name_ru: str
    name_kk: str
    name_en: str
    slug: str
    icon: str | None
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name_ru: str
    name_kk: str
    name_en: str
    slug: str
    icon: str | None = None
    sort_order: int = 0
