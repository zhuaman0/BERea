"""add email verification captain and team invite

Revision ID: a035c8b446e6
Revises: a7c3e9f1b2d4
Create Date: 2026-10-14 15:49:24.388073

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = 'a035c8b446e6'
down_revision: str | None = 'a7c3e9f1b2d4'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("reading_teams", sa.Column("invite_token", sa.String(length=64), nullable=True))
    op.add_column("reading_teams", sa.Column("invite_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.create_unique_constraint("reading_teams_invite_token_key", "reading_teams", ["invite_token"])
    op.add_column("reading_users", sa.Column("is_captain", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column(
        "reading_users", sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False)
    )
    op.add_column("reading_users", sa.Column("email_code_hash", sa.String(length=64), nullable=True))
    op.add_column("reading_users", sa.Column("email_code_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("reading_users", sa.Column("email_code_sent_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("reading_users", sa.Column("email_code_attempts", sa.Integer(), server_default="0", nullable=False))

    # Accounts that existed before verification shipped keep working; only new sign-ups need a code.
    op.execute("UPDATE reading_users SET email_verified = true")
    # Each existing team's earliest member becomes its captain.
    op.execute(
        """
        UPDATE reading_users SET is_captain = true
        WHERE id IN (
            SELECT DISTINCT ON (team_id) id FROM reading_users
            WHERE team_id IS NOT NULL
            ORDER BY team_id, created_at
        )
        """
    )


def downgrade() -> None:
    op.drop_column("reading_users", "email_code_attempts")
    op.drop_column("reading_users", "email_code_sent_at")
    op.drop_column("reading_users", "email_code_expires_at")
    op.drop_column("reading_users", "email_code_hash")
    op.drop_column("reading_users", "email_verified")
    op.drop_column("reading_users", "is_captain")
    op.drop_constraint("reading_teams_invite_token_key", "reading_teams", type_="unique")
    op.drop_column("reading_teams", "invite_expires_at")
    op.drop_column("reading_teams", "invite_token")
