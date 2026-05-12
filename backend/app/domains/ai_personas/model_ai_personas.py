from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin
from app.enums import PersonaTone

if TYPE_CHECKING:
    from app.domains.study_sessions.model_study_sessions import StudySession


class AIPersona(TimestampMixin, Base):
    __tablename__ = "ai_personas"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    tone: Mapped[PersonaTone] = mapped_column(SAEnum(PersonaTone), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    system_prompt_template: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    study_sessions: Mapped[list[StudySession]] = relationship(back_populates="persona")
    interactions: Mapped[list[PersonaInteraction]] = relationship(back_populates="persona", cascade="all, delete-orphan")


class PersonaInteraction(Base):
    """Log of every user ↔ AI persona exchange."""

    __tablename__ = "persona_interactions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    persona_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_personas.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("study_sessions.id", ondelete="SET NULL"), nullable=True)

    user_message: Mapped[str] = mapped_column(Text, nullable=False)
    persona_response: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    persona: Mapped[AIPersona] = relationship(back_populates="interactions")
