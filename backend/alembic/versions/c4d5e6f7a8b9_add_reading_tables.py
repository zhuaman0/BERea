"""add_reading_tables

Revision ID: c4d5e6f7a8b9
Revises: b26627e67d22
Create Date: 2026-09-15 09:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c4d5e6f7a8b9'
down_revision: Union[str, None] = 'b26627e67d22'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_teams',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_teams_name'), 'reading_teams', ['name'], unique=True)

    op.create_table('reading_users',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('full_name', sa.String(length=120), nullable=False),
    sa.Column('team_id', sa.Uuid(), nullable=True),
    sa.Column('token_balance', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['team_id'], ['reading_teams.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_users_email'), 'reading_users', ['email'], unique=True)
    op.create_index(op.f('ix_reading_users_team_id'), 'reading_users', ['team_id'], unique=False)

    op.create_table('reading_refresh_tokens',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('token_hash', sa.String(length=512), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('revoked', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['reading_users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('token_hash')
    )
    op.create_index(op.f('ix_reading_refresh_tokens_user_id'), 'reading_refresh_tokens', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_reading_refresh_tokens_user_id'), table_name='reading_refresh_tokens')
    op.drop_table('reading_refresh_tokens')
    op.drop_index(op.f('ix_reading_users_team_id'), table_name='reading_users')
    op.drop_index(op.f('ix_reading_users_email'), table_name='reading_users')
    op.drop_table('reading_users')
    op.drop_index(op.f('ix_reading_teams_name'), table_name='reading_teams')
    op.drop_table('reading_teams')
