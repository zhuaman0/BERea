from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.enums import MaterialType


class MaterialCreate(BaseModel):
    type: MaterialType
    title: str = Field(min_length=1, max_length=512)
    description: str | None = None
    source_url: str | None = None
    content: dict[str, Any] | None = None


class MaterialUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=512)
    description: str | None = None
    content: dict[str, Any] | None = None


class MaterialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    type: MaterialType
    title: str
    description: str | None
    source_url: str | None
    created_at: Any  # datetime


class FlashcardCreate(BaseModel):
    front: str = Field(min_length=1)
    back: str = Field(min_length=1)
    sort_order: int = 0


class FlashcardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    material_id: uuid.UUID
    front: str
    back: str
    sort_order: int
    ease_factor: float
    interval_days: int
    repetitions: int


class TestQuestionCreate(BaseModel):
    question: str = Field(min_length=1)
    options: list[str] = Field(min_length=2)
    correct_index: int = Field(ge=0)
    explanation: str | None = None
    sort_order: int = 0


class TestQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    material_id: uuid.UUID
    question: str
    options: list[str]
    correct_index: int
    explanation: str | None
    sort_order: int
