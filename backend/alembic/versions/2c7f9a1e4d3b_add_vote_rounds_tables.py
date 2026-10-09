"""add_vote_rounds_tables

Revision ID: 2c7f9a1e4d3b
Revises: 1b51df431e0d
Create Date: 2026-10-09 18:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '2c7f9a1e4d3b'
down_revision: Union[str, None] = '1b51df431e0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_vote_rounds',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('stage', sa.String(length=20), nullable=False),
    sa.Column('opens_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('closes_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )

    op.create_table('reading_vote_options',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('round_id', sa.Uuid(), nullable=False),
    sa.Column('label', sa.String(length=120), nullable=False),
    sa.ForeignKeyConstraint(['round_id'], ['reading_vote_rounds.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_vote_options_round_id'), 'reading_vote_options', ['round_id'], unique=False)

    op.create_table('reading_votes',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('round_id', sa.Uuid(), nullable=False),
    sa.Column('option_id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['round_id'], ['reading_vote_rounds.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['option_id'], ['reading_vote_options.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['reading_users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('round_id', 'user_id', name='uq_reading_votes_round_user')
    )
    op.create_index(op.f('ix_reading_votes_round_id'), 'reading_votes', ['round_id'], unique=False)
    op.create_index(op.f('ix_reading_votes_option_id'), 'reading_votes', ['option_id'], unique=False)
    op.create_index(op.f('ix_reading_votes_user_id'), 'reading_votes', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_reading_votes_user_id'), table_name='reading_votes')
    op.drop_index(op.f('ix_reading_votes_option_id'), table_name='reading_votes')
    op.drop_index(op.f('ix_reading_votes_round_id'), table_name='reading_votes')
    op.drop_table('reading_votes')
    op.drop_index(op.f('ix_reading_vote_options_round_id'), table_name='reading_vote_options')
    op.drop_table('reading_vote_options')
    op.drop_table('reading_vote_rounds')
