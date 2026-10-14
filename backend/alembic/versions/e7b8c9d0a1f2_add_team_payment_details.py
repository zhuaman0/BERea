"""add team payment details

Revision ID: e7b8c9d0a1f2
Revises: f332f9a76ae7
Create Date: 2026-10-14 14:00:00

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e7b8c9d0a1f2"
down_revision: Union[str, None] = "f332f9a76ae7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("reading_team_registrations", sa.Column("team_id", sa.Uuid(), nullable=True))
    op.add_column(
        "reading_team_registrations",
        sa.Column("submitted_by_user_id", sa.Uuid(), nullable=True),
    )
    op.add_column(
        "reading_team_registrations",
        sa.Column("payment_description", sa.Text(), server_default="", nullable=False),
    )
    op.add_column(
        "reading_team_registrations",
        sa.Column("amount_tenge", sa.Integer(), server_default="3000", nullable=False),
    )
    op.add_column(
        "reading_team_registrations",
        sa.Column("receipt_content_type", sa.String(length=50), server_default="application/pdf", nullable=False),
    )
    op.create_foreign_key(
        "fk_team_registrations_team_id",
        "reading_team_registrations",
        "reading_teams",
        ["team_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_team_registrations_submitted_by_user_id",
        "reading_team_registrations",
        "reading_users",
        ["submitted_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_reading_team_registrations_team_id",
        "reading_team_registrations",
        ["team_id"],
        unique=True,
    )
    op.create_index(
        "ix_reading_team_registrations_submitted_by_user_id",
        "reading_team_registrations",
        ["submitted_by_user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_reading_team_registrations_submitted_by_user_id", table_name="reading_team_registrations")
    op.drop_index("ix_reading_team_registrations_team_id", table_name="reading_team_registrations")
    op.drop_constraint(
        "fk_team_registrations_submitted_by_user_id",
        "reading_team_registrations",
        type_="foreignkey",
    )
    op.drop_constraint("fk_team_registrations_team_id", "reading_team_registrations", type_="foreignkey")
    op.drop_column("reading_team_registrations", "receipt_content_type")
    op.drop_column("reading_team_registrations", "amount_tenge")
    op.drop_column("reading_team_registrations", "payment_description")
    op.drop_column("reading_team_registrations", "submitted_by_user_id")
    op.drop_column("reading_team_registrations", "team_id")
