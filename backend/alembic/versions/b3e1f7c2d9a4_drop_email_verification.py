"""drop email verification

Revision ID: b3e1f7c2d9a4
Revises: a035c8b446e6
Create Date: 2026-10-14 18:20:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b3e1f7c2d9a4"
down_revision: str | None = "a035c8b446e6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_column("reading_users", "email_code_attempts")
    op.drop_column("reading_users", "email_code_sent_at")
    op.drop_column("reading_users", "email_code_expires_at")
    op.drop_column("reading_users", "email_code_hash")
    op.drop_column("reading_users", "email_verified")


def downgrade() -> None:
    op.add_column(
        "reading_users", sa.Column("email_verified", sa.Boolean(), server_default=sa.text("true"), nullable=False)
    )
    op.add_column("reading_users", sa.Column("email_code_hash", sa.String(length=64), nullable=True))
    op.add_column("reading_users", sa.Column("email_code_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("reading_users", sa.Column("email_code_sent_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("reading_users", sa.Column("email_code_attempts", sa.Integer(), server_default="0", nullable=False))
