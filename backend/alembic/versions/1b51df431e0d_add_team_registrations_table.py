"""add_team_registrations_table

Revision ID: 1b51df431e0d
Revises: c4d5e6f7a8b9
Create Date: 2026-10-09 12:23:04.699634

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '1b51df431e0d'
down_revision: Union[str, None] = 'c4d5e6f7a8b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_team_registrations',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('team_name', sa.String(length=120), nullable=False),
    sa.Column('member_1_name', sa.String(length=120), nullable=False),
    sa.Column('member_2_name', sa.String(length=120), nullable=False),
    sa.Column('member_3_name', sa.String(length=120), nullable=False),
    sa.Column('contact_email', sa.String(length=255), nullable=False),
    sa.Column('contact_phone', sa.String(length=32), nullable=True),
    sa.Column('receipt_path', sa.String(length=512), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_team_registrations_team_name'), 'reading_team_registrations', ['team_name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_reading_team_registrations_team_name'), table_name='reading_team_registrations')
    op.drop_table('reading_team_registrations')
