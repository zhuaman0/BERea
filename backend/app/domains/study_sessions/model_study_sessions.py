from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin
from app.enums import StudyMethod

if TYPE_CHECKING:
    from app.domains.ai_personas.model_ai_personas import AIPersona
    from app.domains.materials.model_materials import Material
    from app.domains.users.model_users import User


class StudySession(TimestampMixin, Base):
    __tablename__ = "study_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    material_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("materials.id", ondelete="SET NULL"), nullable=True)
    persona_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("ai_personas.id", ondelete="SET NULL"), nullable=True)

    method: Mapped[StudyMethod] = mapped_column(SAEnum(StudyMethod), nullable=False)
    planned_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # 0.0–1.0 score derived from interruptions, completion rate, self-rating
    focus_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    environment_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ─── Relationships ───────────────────────────────────────────────────────
    user: Mapped[User] = relationship(back_populates="study_sessions")
    material: Mapped[Material | None] = relationship(back_populates="study_sessions")
    persona: Mapped[AIPersona | None] = relationship(back_populates="study_sessions")


class AnalyticReport(TimestampMixin, Base):
    """Aggregated weekly or monthly snapshot of a user's study performance."""

    __tablename__ = "analytic_reports"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    period_type: Mapped[str] = mapped_column(String(10), nullable=False)  # "weekly" | "monthly"
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    total_minutes_studied: Mapped[int] = mapped_column(Integer, default=0)
    avg_focus_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    best_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    best_time_of_day: Mapped[str | None] = mapped_column(String(20), nullable=True)
