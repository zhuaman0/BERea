from __future__ import annotations

import uuid
from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel


class FurnitureItemOut(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    name_ru: str
    name_kk: str
    name_en: str
    description_ru: str | None
    description_kk: str | None
    description_en: str | None
    price: Decimal
    price_currency: str
    images: list
    materials: list
    dimensions: dict
    is_active: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FurnitureItemCreate(BaseModel):
    category_id: uuid.UUID
    name_ru: str
    name_kk: str
    name_en: str
    description_ru: str | None = None
    description_kk: str | None = None
    description_en: str | None = None
    price: Decimal
    price_currency: str = "KZT"
    images: list = []
    materials: list = []
    dimensions: dict = {}
    is_active: bool = True
    is_featured: bool = False


class FurnitureItemUpdate(BaseModel):
    name_ru: str | None = None
    name_kk: str | None = None
    name_en: str | None = None
    description_ru: str | None = None
    description_kk: str | None = None
    description_en: str | None = None
    price: Decimal | None = None
    images: list | None = None
    materials: list | None = None
    dimensions: dict | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
