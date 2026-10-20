"""add quiz night rounds and team answers

Revision ID: d8e4f1a2b3c5
Revises: c5d2e8a1f4b7
Create Date: 2026-10-19 12:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "d8e4f1a2b3c5"
down_revision: str | None = "c5d2e8a1f4b7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("reading_quizzes", sa.Column("format", sa.String(length=20), server_default="instant", nullable=False))

    op.add_column("reading_quiz_questions", sa.Column("round_number", sa.Integer(), nullable=True))
    op.add_column("reading_quiz_questions", sa.Column("kind", sa.String(length=20), server_default="choice", nullable=False))
    op.add_column("reading_quiz_questions", sa.Column("correct_text", sa.String(length=300), nullable=True))
    op.add_column("reading_quiz_questions", sa.Column("accepted_answers", sa.JSON(), nullable=True))
    op.add_column("reading_quiz_questions", sa.Column("quote", sa.Text(), nullable=True))
    op.add_column("reading_quiz_questions", sa.Column("source_ref", sa.String(length=120), nullable=True))

    op.add_column("reading_quiz_sessions", sa.Column("round_number", sa.Integer(), server_default="0", nullable=False))
    op.add_column("reading_quiz_sessions", sa.Column("question_number", sa.Integer(), server_default="0", nullable=False))
    op.add_column("reading_quiz_sessions", sa.Column("phase_started_at", sa.DateTime(timezone=True), nullable=True))

    op.create_table(
        "reading_quiz_team_answers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("session_id", sa.Uuid(), nullable=False),
        sa.Column("question_id", sa.Uuid(), nullable=False),
        sa.Column("team_id", sa.Uuid(), nullable=False),
        sa.Column("text", sa.String(length=300), nullable=False),
        sa.Column("last_edited_by", sa.Uuid(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("grade", sa.String(length=10), nullable=True),
        sa.Column("points", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["reading_quiz_sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["reading_quiz_questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["team_id"], ["reading_teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["last_edited_by"], ["reading_users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "question_id", "team_id", name="uq_quiz_team_answer"),
    )
    op.create_index(op.f("ix_reading_quiz_team_answers_session_id"), "reading_quiz_team_answers", ["session_id"])
    op.create_index(op.f("ix_reading_quiz_team_answers_question_id"), "reading_quiz_team_answers", ["question_id"])
    op.create_index(op.f("ix_reading_quiz_team_answers_team_id"), "reading_quiz_team_answers", ["team_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_reading_quiz_team_answers_team_id"), table_name="reading_quiz_team_answers")
    op.drop_index(op.f("ix_reading_quiz_team_answers_question_id"), table_name="reading_quiz_team_answers")
    op.drop_index(op.f("ix_reading_quiz_team_answers_session_id"), table_name="reading_quiz_team_answers")
    op.drop_table("reading_quiz_team_answers")
    op.drop_column("reading_quiz_sessions", "phase_started_at")
    op.drop_column("reading_quiz_sessions", "question_number")
    op.drop_column("reading_quiz_sessions", "round_number")
    for column in ("source_ref", "quote", "accepted_answers", "correct_text", "kind", "round_number"):
        op.drop_column("reading_quiz_questions", column)
    op.drop_column("reading_quizzes", "format")
