"""add quizzes and admin flag

Revision ID: 8648d19ac8c6
Revises: 15d3422291fa
Create Date: 2026-10-11

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '8648d19ac8c6'
down_revision: Union[str, None] = '15d3422291fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_quizzes',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('month_label', sa.String(length=60), nullable=False),
    sa.Column('scheduled_for', sa.DateTime(timezone=True), nullable=True),
    sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('reading_quiz_questions',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('quiz_id', sa.Uuid(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('text', sa.Text(), nullable=False),
    sa.Column('time_limit_seconds', sa.Integer(), nullable=False),
    sa.Column('points', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['reading_quizzes.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_quiz_questions_quiz_id'), 'reading_quiz_questions', ['quiz_id'], unique=False)
    op.create_table('reading_quiz_answers',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('question_id', sa.Uuid(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('text', sa.String(length=300), nullable=False),
    sa.Column('is_correct', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['question_id'], ['reading_quiz_questions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_quiz_answers_question_id'), 'reading_quiz_answers', ['question_id'], unique=False)
    op.add_column('reading_users', sa.Column('is_admin', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('reading_users', 'is_admin')
    op.drop_index(op.f('ix_reading_quiz_answers_question_id'), table_name='reading_quiz_answers')
    op.drop_table('reading_quiz_answers')
    op.drop_index(op.f('ix_reading_quiz_questions_quiz_id'), table_name='reading_quiz_questions')
    op.drop_table('reading_quiz_questions')
    op.drop_table('reading_quizzes')
