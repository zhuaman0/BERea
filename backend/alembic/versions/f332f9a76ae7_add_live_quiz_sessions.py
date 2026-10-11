"""add live quiz sessions

Revision ID: f332f9a76ae7
Revises: 27d371b17c80
Create Date: 2026-10-11 11:39:32.051345

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f332f9a76ae7'
down_revision: Union[str, None] = '27d371b17c80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reading_quiz_sessions',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('quiz_id', sa.Uuid(), nullable=False),
    sa.Column('pin', sa.String(length=6), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('current_index', sa.Integer(), nullable=False),
    sa.Column('question_started_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['reading_quizzes.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_quiz_sessions_pin'), 'reading_quiz_sessions', ['pin'], unique=False)
    op.create_index(op.f('ix_reading_quiz_sessions_quiz_id'), 'reading_quiz_sessions', ['quiz_id'], unique=False)
    op.create_table('reading_quiz_participants',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('session_id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('team_id', sa.Uuid(), nullable=True),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['reading_quiz_sessions.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['team_id'], ['reading_teams.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['reading_users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('session_id', 'user_id', name='uq_quiz_participant_session_user')
    )
    op.create_index(op.f('ix_reading_quiz_participants_session_id'), 'reading_quiz_participants', ['session_id'], unique=False)
    op.create_index(op.f('ix_reading_quiz_participants_user_id'), 'reading_quiz_participants', ['user_id'], unique=False)
    op.create_table('reading_quiz_responses',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('participant_id', sa.Uuid(), nullable=False),
    sa.Column('question_id', sa.Uuid(), nullable=False),
    sa.Column('answer_id', sa.Uuid(), nullable=False),
    sa.Column('is_correct', sa.Boolean(), nullable=False),
    sa.Column('points', sa.Integer(), nullable=False),
    sa.Column('answered_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['answer_id'], ['reading_quiz_answers.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['participant_id'], ['reading_quiz_participants.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['question_id'], ['reading_quiz_questions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('participant_id', 'question_id', name='uq_quiz_response_participant_question')
    )
    op.create_index(op.f('ix_reading_quiz_responses_participant_id'), 'reading_quiz_responses', ['participant_id'], unique=False)
    op.create_index(op.f('ix_reading_quiz_responses_question_id'), 'reading_quiz_responses', ['question_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_reading_quiz_responses_question_id'), table_name='reading_quiz_responses')
    op.drop_index(op.f('ix_reading_quiz_responses_participant_id'), table_name='reading_quiz_responses')
    op.drop_table('reading_quiz_responses')
    op.drop_index(op.f('ix_reading_quiz_participants_user_id'), table_name='reading_quiz_participants')
    op.drop_index(op.f('ix_reading_quiz_participants_session_id'), table_name='reading_quiz_participants')
    op.drop_table('reading_quiz_participants')
    op.drop_index(op.f('ix_reading_quiz_sessions_quiz_id'), table_name='reading_quiz_sessions')
    op.drop_index(op.f('ix_reading_quiz_sessions_pin'), table_name='reading_quiz_sessions')
    op.drop_table('reading_quiz_sessions')
