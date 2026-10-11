from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin


class ReadingTeam(TimestampMixin, Base):
    __tablename__ = "reading_teams"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    cover_title: Mapped[str | None] = mapped_column(String(24), nullable=True)
    cover_color: Mapped[str] = mapped_column(String(20), default="ember", server_default="ember", nullable=False)
    cover_pattern: Mapped[str] = mapped_column(String(20), default="plain", server_default="plain", nullable=False)
    cover_emblem: Mapped[str] = mapped_column(String(20), default="monogram", server_default="monogram", nullable=False)
    cover_animation: Mapped[str] = mapped_column(String(20), default="float", server_default="float", nullable=False)

    members: Mapped[list[ReadingUser]] = relationship(back_populates="team")


class ReadingUser(TimestampMixin, Base):
    __tablename__ = "reading_users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_teams.id", ondelete="SET NULL"), nullable=True, index=True
    )
    token_balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    team: Mapped[ReadingTeam | None] = relationship(back_populates="members")
    refresh_tokens: Mapped[list[ReadingRefreshToken]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class ReadingTeamRegistration(TimestampMixin, Base):
    __tablename__ = "reading_team_registrations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    member_1_name: Mapped[str] = mapped_column(String(120), nullable=False)
    member_2_name: Mapped[str] = mapped_column(String(120), nullable=False)
    member_3_name: Mapped[str] = mapped_column(String(120), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    receipt_path: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)


class ReadingVoteRound(TimestampMixin, Base):
    __tablename__ = "reading_vote_rounds"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stage: Mapped[str] = mapped_column(String(20), nullable=False)
    opens_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    closes_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    options: Mapped[list[ReadingVoteOption]] = relationship(
        back_populates="round", cascade="all, delete-orphan"
    )


class ReadingVoteOption(Base):
    __tablename__ = "reading_vote_options"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    round_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_vote_rounds.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(120), nullable=False)

    round: Mapped[ReadingVoteRound] = relationship(back_populates="options")
    votes: Mapped[list[ReadingVote]] = relationship(back_populates="option", cascade="all, delete-orphan")


class ReadingVote(Base):
    __tablename__ = "reading_votes"
    __table_args__ = (UniqueConstraint("round_id", "user_id", name="uq_reading_votes_round_user"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    round_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_vote_rounds.id", ondelete="CASCADE"), nullable=False, index=True
    )
    option_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_vote_options.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    option: Mapped[ReadingVoteOption] = relationship(back_populates="votes")


class ReadingSemesterRound(TimestampMixin, Base):
    __tablename__ = "reading_semester_rounds"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    index: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ReadingAppSettings(TimestampMixin, Base):
    """Single-row table of app-wide toggles editable from the admin panel."""

    __tablename__ = "reading_app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    leaderboard_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class ReadingRefreshToken(Base):
    __tablename__ = "reading_refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[ReadingUser] = relationship(back_populates="refresh_tokens")
