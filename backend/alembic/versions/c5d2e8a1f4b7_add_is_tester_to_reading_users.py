"""add is_tester to reading_users

Revision ID: c5d2e8a1f4b7
Revises: b3e1f7c2d9a4
Create Date: 2026-10-16 16:00:00

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c5d2e8a1f4b7"
down_revision: Union[str, None] = "b3e1f7c2d9a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "reading_users",
        sa.Column("is_tester", sa.Boolean(), server_default=sa.false(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("reading_users", "is_tester")
