"""add_streak_and_semester_rounds

Revision ID: 9ddf8ee532f8
Revises: 2c7f9a1e4d3b
Create Date: 2026-10-09 22:54:51.195511

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '9ddf8ee532f8'
down_revision: Union[str, None] = '2c7f9a1e4d3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_semester_rounds',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('index', sa.Integer(), nullable=False),
    sa.Column('label', sa.String(length=120), nullable=False),
    sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('ends_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('reading_users', sa.Column('current_streak', sa.Integer(), server_default='0', nullable=False))
    op.add_column('reading_users', sa.Column('last_active_date', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('reading_users', 'last_active_date')
    op.drop_column('reading_users', 'current_streak')
    op.drop_table('reading_semester_rounds')
