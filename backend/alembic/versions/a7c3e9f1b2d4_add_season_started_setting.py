"""add season_started setting

Revision ID: a7c3e9f1b2d4
Revises: e7b8c9d0a1f2
Create Date: 2026-10-14 16:00:00

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a7c3e9f1b2d4"
down_revision: Union[str, None] = "e7b8c9d0a1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "reading_app_settings",
        sa.Column("season_started", sa.Boolean(), server_default=sa.false(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("reading_app_settings", "season_started")
