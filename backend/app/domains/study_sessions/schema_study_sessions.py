from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.enums import StudyMethod


class StudySessionCreate(BaseModel):
    method: StudyMethod
    planned_duration_minutes: int = Field(gt=0)
    material_id: uuid.UUID | None = None
    persona_id: uuid.UUID | None = None
    started_at: datetime
    environment_notes: str | None = None


class StudySessionEnd(BaseModel):
    actual_duration_minutes: int = Field(gt=0)
    focus_score: float | None = Field(default=None, ge=0.0, le=1.0)
    ended_at: datetime


class StudySessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    method: StudyMethod
    planned_duration_minutes: int
    actual_duration_minutes: int | None
    focus_score: float | None
    environment_notes: str | None
    started_at: datetime
    ended_at: datetime | None
    created_at: datetime


class AnalyticReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    period_type: str
    period_start: datetime
    period_end: datetime
    total_sessions: int
    total_minutes_studied: int
    avg_focus_score: float | None
    best_method: str | None
    best_time_of_day: str | None
