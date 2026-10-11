"""add team cover fields

Revision ID: 34d14c9c9526
Revises: 36b655f7721a
Create Date: 2026-10-11 10:15:14.389611

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '34d14c9c9526'
down_revision: Union[str, None] = '36b655f7721a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('reading_teams', sa.Column('cover_title', sa.String(length=24), nullable=True))
    op.add_column('reading_teams', sa.Column('cover_color', sa.String(length=20), server_default='ember', nullable=False))
    op.add_column('reading_teams', sa.Column('cover_pattern', sa.String(length=20), server_default='plain', nullable=False))
    op.add_column('reading_teams', sa.Column('cover_emblem', sa.String(length=20), server_default='monogram', nullable=False))
    op.add_column('reading_teams', sa.Column('cover_animation', sa.String(length=20), server_default='float', nullable=False))


def downgrade() -> None:
    op.drop_column('reading_teams', 'cover_animation')
    op.drop_column('reading_teams', 'cover_emblem')
    op.drop_column('reading_teams', 'cover_pattern')
    op.drop_column('reading_teams', 'cover_color')
    op.drop_column('reading_teams', 'cover_title')
