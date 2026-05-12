from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.dependencies import CurrentUserId, DbSession
from app.domains.study_sessions.schema_study_sessions import (
    AnalyticReportResponse,
    StudySessionCreate,
    StudySessionEnd,
    StudySessionResponse,
)

router = APIRouter()


@router.post("/", response_model=StudySessionResponse, status_code=201)
async def start_session(payload: StudySessionCreate, user_id: CurrentUserId, db: DbSession) -> StudySessionResponse:
    from app.domains.study_sessions.service_study_sessions import start_study_session

    return await start_study_session(user_id, payload, db)


@router.patch("/{session_id}/end", response_model=StudySessionResponse)
async def end_session(session_id: uuid.UUID, payload: StudySessionEnd, user_id: CurrentUserId, db: DbSession) -> StudySessionResponse:
    from app.domains.study_sessions.service_study_sessions import end_study_session

    return await end_study_session(session_id, user_id, payload, db)


@router.get("/", response_model=list[StudySessionResponse])
async def list_sessions(user_id: CurrentUserId, db: DbSession) -> list[StudySessionResponse]:
    from app.domains.study_sessions.service_study_sessions import list_user_sessions

    return await list_user_sessions(user_id, db)


@router.get("/analytics/weekly", response_model=list[AnalyticReportResponse])
async def weekly_analytics(user_id: CurrentUserId, db: DbSession) -> list[AnalyticReportResponse]:
    from app.domains.study_sessions.service_study_sessions import get_weekly_reports

    return await get_weekly_reports(user_id, db)


@router.get("/analytics/monthly", response_model=list[AnalyticReportResponse])
async def monthly_analytics(user_id: CurrentUserId, db: DbSession) -> list[AnalyticReportResponse]:
    from app.domains.study_sessions.service_study_sessions import get_monthly_reports

    return await get_monthly_reports(user_id, db)
