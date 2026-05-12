from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.study_sessions.model_study_sessions import AnalyticReport, StudySession
from app.domains.study_sessions.schema_study_sessions import StudySessionCreate


async def create_session(user_id: uuid.UUID, payload: StudySessionCreate, db: AsyncSession) -> StudySession:
    session = StudySession(
        user_id=user_id,
        method=payload.method,
        planned_duration_minutes=payload.planned_duration_minutes,
        material_id=payload.material_id,
        persona_id=payload.persona_id,
        started_at=payload.started_at,
        environment_notes=payload.environment_notes,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def fetch_session(session_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> StudySession | None:
    result = await db.execute(
        select(StudySession).where(StudySession.id == session_id, StudySession.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_session(session: StudySession, db: AsyncSession) -> None:
    db.add(session)
    await db.commit()
    await db.refresh(session)


async def fetch_user_sessions(user_id: uuid.UUID, db: AsyncSession) -> list[StudySession]:
    result = await db.execute(
        select(StudySession).where(StudySession.user_id == user_id).order_by(StudySession.started_at.desc())
    )
    return list(result.scalars().all())


async def fetch_reports(user_id: uuid.UUID, period_type: str, db: AsyncSession) -> list[AnalyticReport]:
    result = await db.execute(
        select(AnalyticReport)
        .where(AnalyticReport.user_id == user_id, AnalyticReport.period_type == period_type)
        .order_by(AnalyticReport.period_start.desc())
    )
    return list(result.scalars().all())
