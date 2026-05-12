from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.study_sessions.schema_study_sessions import (
    AnalyticReportResponse,
    StudySessionCreate,
    StudySessionEnd,
    StudySessionResponse,
)


async def start_study_session(user_id: str, payload: StudySessionCreate, db: AsyncSession) -> StudySessionResponse:
    from app.domains.study_sessions.repo_study_sessions import create_session

    session = await create_session(uuid.UUID(user_id), payload, db)
    return StudySessionResponse.model_validate(session)


async def end_study_session(session_id: uuid.UUID, user_id: str, payload: StudySessionEnd, db: AsyncSession) -> StudySessionResponse:
    from app.domains.study_sessions.repo_study_sessions import fetch_session, update_session

    session = await fetch_session(session_id, uuid.UUID(user_id), db)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    session.actual_duration_minutes = payload.actual_duration_minutes
    session.focus_score = payload.focus_score
    session.ended_at = payload.ended_at
    await update_session(session, db)
    return StudySessionResponse.model_validate(session)


async def list_user_sessions(user_id: str, db: AsyncSession) -> list[StudySessionResponse]:
    from app.domains.study_sessions.repo_study_sessions import fetch_user_sessions

    sessions = await fetch_user_sessions(uuid.UUID(user_id), db)
    return [StudySessionResponse.model_validate(s) for s in sessions]


async def get_weekly_reports(user_id: str, db: AsyncSession) -> list[AnalyticReportResponse]:
    from app.domains.study_sessions.repo_study_sessions import fetch_reports

    reports = await fetch_reports(uuid.UUID(user_id), "weekly", db)
    return [AnalyticReportResponse.model_validate(r) for r in reports]


async def get_monthly_reports(user_id: str, db: AsyncSession) -> list[AnalyticReportResponse]:
    from app.domains.study_sessions.repo_study_sessions import fetch_reports

    reports = await fetch_reports(uuid.UUID(user_id), "monthly", db)
    return [AnalyticReportResponse.model_validate(r) for r in reports]
