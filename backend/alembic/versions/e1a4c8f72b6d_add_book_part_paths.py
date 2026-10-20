"""add book part paths

Revision ID: e1a4c8f72b6d
Revises: d8e4f1a2b3c5
Create Date: 2026-10-20
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e1a4c8f72b6d"
down_revision: Union[str, None] = "d8e4f1a2b3c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reading_book_parts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("book_id", sa.Uuid(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("points_reward", sa.Integer(), server_default="100", nullable=False),
        sa.ForeignKeyConstraint(["book_id"], ["reading_books.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reading_book_parts_book_id"), "reading_book_parts", ["book_id"], unique=False)
    op.create_table(
        "reading_book_part_questions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("part_id", sa.Uuid(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["part_id"], ["reading_book_parts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_reading_book_part_questions_part_id"),
        "reading_book_part_questions",
        ["part_id"],
        unique=False,
    )
    op.create_table(
        "reading_book_part_answers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("question_id", sa.Uuid(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("text", sa.String(length=300), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["reading_book_part_questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_reading_book_part_answers_question_id"),
        "reading_book_part_answers",
        ["question_id"],
        unique=False,
    )
    op.create_table(
        "reading_book_part_completions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("part_id", sa.Uuid(), nullable=False),
        sa.Column("team_id", sa.Uuid(), nullable=False),
        sa.Column("completed_by_user_id", sa.Uuid(), nullable=True),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("points_awarded", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["part_id"], ["reading_book_parts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["team_id"], ["reading_teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["completed_by_user_id"], ["reading_users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("part_id", "team_id", name="uq_reading_book_part_completion_team"),
    )
    op.create_index(
        op.f("ix_reading_book_part_completions_part_id"),
        "reading_book_part_completions",
        ["part_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_reading_book_part_completions_team_id"),
        "reading_book_part_completions",
        ["team_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_reading_book_part_completions_team_id"), table_name="reading_book_part_completions")
    op.drop_index(op.f("ix_reading_book_part_completions_part_id"), table_name="reading_book_part_completions")
    op.drop_table("reading_book_part_completions")
    op.drop_index(op.f("ix_reading_book_part_answers_question_id"), table_name="reading_book_part_answers")
    op.drop_table("reading_book_part_answers")
    op.drop_index(op.f("ix_reading_book_part_questions_part_id"), table_name="reading_book_part_questions")
    op.drop_table("reading_book_part_questions")
    op.drop_index(op.f("ix_reading_book_parts_book_id"), table_name="reading_book_parts")
    op.drop_table("reading_book_parts")
