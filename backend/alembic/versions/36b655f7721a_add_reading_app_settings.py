"""add reading app settings

Revision ID: 36b655f7721a
Revises: 9ddf8ee532f8
Create Date: 2026-10-09 23:32:52.951448

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '36b655f7721a'
down_revision: Union[str, None] = '9ddf8ee532f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_app_settings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('leaderboard_enabled', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('reading_app_settings')
