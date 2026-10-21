"""add profile photo to reading users

Revision ID: e3f9a7b1c2d4
Revises: d8e4f1a2b3c5
Create Date: 2026-10-21 10:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e3f9a7b1c2d4"
down_revision: Union[str, None] = "d8e4f1a2b3c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("reading_users", sa.Column("avatar_image", sa.LargeBinary(), nullable=True))
    op.add_column("reading_users", sa.Column("avatar_mime", sa.String(length=32), nullable=True))
    op.add_column("reading_users", sa.Column("avatar_updated_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("reading_users", "avatar_updated_at")
    op.drop_column("reading_users", "avatar_mime")
    op.drop_column("reading_users", "avatar_image")
