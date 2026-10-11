from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, LargeBinary, String, Text, UniqueConstraint, Uuid
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
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
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
    book_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_books.id", ondelete="SET NULL"), nullable=True
    )

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


class ReadingBook(TimestampMixin, Base):
    __tablename__ = "reading_books"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", server_default="", nullable=False)
    cover_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    # Uploaded covers are resized client-side to ~100 KB, small enough to keep in the row itself.
    cover_image: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True, deferred=True)
    cover_mime: Mapped[str | None] = mapped_column(String(32), nullable=True)
    language: Mapped[str | None] = mapped_column(String(40), nullable=True)
    genre: Mapped[str | None] = mapped_column(String(60), nullable=True)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)


class ReadingProgress(TimestampMixin, Base):
    """The page a student has reached in a given book — one row per (user, book)."""

    __tablename__ = "reading_progress"
    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_reading_progress_user_book"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    book_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_books.id", ondelete="CASCADE"), nullable=False, index=True
    )
    current_page: Mapped[int] = mapped_column(Integer, nullable=False)


class ReadingQuiz(TimestampMixin, Base):
    __tablename__ = "reading_quizzes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    month_label: Mapped[str] = mapped_column(String(60), nullable=False)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft", server_default="draft", nullable=False)

    questions: Mapped[list[ReadingQuizQuestion]] = relationship(
        back_populates="quiz", cascade="all, delete-orphan", order_by="ReadingQuizQuestion.position"
    )


class ReadingQuizQuestion(Base):
    __tablename__ = "reading_quiz_questions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    time_limit_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)

    quiz: Mapped[ReadingQuiz] = relationship(back_populates="questions")
    answers: Mapped[list[ReadingQuizAnswer]] = relationship(
        back_populates="question", cascade="all, delete-orphan", order_by="ReadingQuizAnswer.position"
    )


class ReadingQuizAnswer(Base):
    __tablename__ = "reading_quiz_answers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(String(300), nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    question: Mapped[ReadingQuizQuestion] = relationship(back_populates="answers")


class ReadingQuizSession(TimestampMixin, Base):
    """One live run of a quiz. `status` is what the host last set; the service derives the
    effective phase (a question auto-reveals once its time limit passes)."""

    __tablename__ = "reading_quiz_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    pin: Mapped[str] = mapped_column(String(6), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="lobby", nullable=False)
    current_index: Mapped[int] = mapped_column(Integer, default=-1, nullable=False)
    question_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    quiz: Mapped[ReadingQuiz] = relationship()
    participants: Mapped[list[ReadingQuizParticipant]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class ReadingQuizParticipant(Base):
    __tablename__ = "reading_quiz_participants"
    __table_args__ = (UniqueConstraint("session_id", "user_id", name="uq_quiz_participant_session_user"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quiz_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_teams.id", ondelete="SET NULL"), nullable=True
    )
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    session: Mapped[ReadingQuizSession] = relationship(back_populates="participants")
    user: Mapped[ReadingUser] = relationship()
    team: Mapped[ReadingTeam | None] = relationship()


class ReadingQuizSubmission(Base):
    __tablename__ = "reading_quiz_responses"
    __table_args__ = (UniqueConstraint("participant_id", "question_id", name="uq_quiz_response_participant_question"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quiz_participants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    answer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reading_quiz_answers.id", ondelete="CASCADE"), nullable=False
    )
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


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
