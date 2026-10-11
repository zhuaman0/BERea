"""add book metadata and reading progress

Revision ID: 27d371b17c80
Revises: 8648d19ac8c6
Create Date: 2026-10-11

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '27d371b17c80'
down_revision: Union[str, None] = '8648d19ac8c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_progress',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('book_id', sa.Uuid(), nullable=False),
    sa.Column('current_page', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['book_id'], ['reading_books.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['reading_users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'book_id', name='uq_reading_progress_user_book')
    )
    op.create_index(op.f('ix_reading_progress_book_id'), 'reading_progress', ['book_id'], unique=False)
    op.create_index(op.f('ix_reading_progress_user_id'), 'reading_progress', ['user_id'], unique=False)
    op.add_column('reading_books', sa.Column('language', sa.String(length=40), nullable=True))
    op.add_column('reading_books', sa.Column('genre', sa.String(length=60), nullable=True))
    op.add_column('reading_books', sa.Column('page_count', sa.Integer(), nullable=True))
    op.add_column('reading_vote_options', sa.Column('book_id', sa.Uuid(), nullable=True))
    op.create_foreign_key(
        'fk_reading_vote_options_book_id', 'reading_vote_options', 'reading_books', ['book_id'], ['id'], ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('fk_reading_vote_options_book_id', 'reading_vote_options', type_='foreignkey')
    op.drop_column('reading_vote_options', 'book_id')
    op.drop_column('reading_books', 'page_count')
    op.drop_column('reading_books', 'genre')
    op.drop_column('reading_books', 'language')
    op.drop_index(op.f('ix_reading_progress_user_id'), table_name='reading_progress')
    op.drop_index(op.f('ix_reading_progress_book_id'), table_name='reading_progress')
    op.drop_table('reading_progress')
