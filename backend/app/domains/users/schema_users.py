from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None
    is_active: bool
    is_verified: bool
    current_streak: int
    longest_streak: int
    last_study_date: date | None
    created_at: datetime


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
