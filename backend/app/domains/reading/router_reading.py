from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError

from app.dependencies import CurrentUserId, DbSession
from app.domains.reading.schema_reading import (
    ReadingLoginRequest,
    ReadingRefreshRequest,
    ReadingRegisterRequest,
    ReadingTeamJoinRequest,
    ReadingTeamRegistrationCreate,
    ReadingTeamRegistrationResponse,
    ReadingTeamResponse,
    ReadingTeamSummaryResponse,
    ReadingTokenResponse,
    ReadingUserResponse,
    ReadingVoteCastRequest,
    ReadingVoteRoundCreate,
    ReadingVoteRoundResponse,
)

router = APIRouter()


@router.post("/auth/register", response_model=ReadingTokenResponse, status_code=201)
async def register(payload: ReadingRegisterRequest, db: DbSession) -> ReadingTokenResponse:
    from app.domains.reading.service_reading import register_user

    return await register_user(payload, db)


@router.post("/auth/login", response_model=ReadingTokenResponse)
async def login(payload: ReadingLoginRequest, db: DbSession) -> ReadingTokenResponse:
    from app.domains.reading.service_reading import login_user

    return await login_user(payload, db)


@router.post("/auth/refresh", response_model=ReadingTokenResponse)
async def refresh(payload: ReadingRefreshRequest, db: DbSession) -> ReadingTokenResponse:
    from app.domains.reading.service_reading import refresh_tokens

    return await refresh_tokens(payload.refresh_token, db)


@router.post("/auth/logout", status_code=204)
async def logout(payload: ReadingRefreshRequest, db: DbSession) -> None:
    from app.domains.reading.service_reading import revoke_refresh_token

    await revoke_refresh_token(payload.refresh_token, db)


@router.get("/users/me", response_model=ReadingUserResponse)
async def get_me(user_id: CurrentUserId, db: DbSession) -> ReadingUserResponse:
    from app.domains.reading.service_reading import get_current_reading_user

    return await get_current_reading_user(user_id, db)


@router.post("/teams/join", response_model=ReadingUserResponse)
async def join_team(payload: ReadingTeamJoinRequest, user_id: CurrentUserId, db: DbSession) -> ReadingUserResponse:
    from app.domains.reading.service_reading import join_team as join_team_service

    return await join_team_service(user_id, payload, db)


@router.get("/teams", response_model=list[ReadingTeamSummaryResponse])
async def list_teams(user_id: CurrentUserId, db: DbSession) -> list[ReadingTeamSummaryResponse]:
    from app.domains.reading.service_reading import list_teams as list_teams_service

    return await list_teams_service(db)


@router.get("/teams/me", response_model=ReadingTeamResponse)
async def get_my_team(user_id: CurrentUserId, db: DbSession) -> ReadingTeamResponse:
    from app.domains.reading.service_reading import get_my_team as get_my_team_service

    return await get_my_team_service(user_id, db)


@router.patch("/teams/me", response_model=ReadingTeamResponse)
async def rename_my_team(payload: ReadingTeamJoinRequest, user_id: CurrentUserId, db: DbSession) -> ReadingTeamResponse:
    from app.domains.reading.service_reading import rename_my_team as rename_my_team_service

    return await rename_my_team_service(user_id, payload, db)


@router.post("/teams/register", response_model=ReadingTeamRegistrationResponse, status_code=201)
async def register_team(
    db: DbSession,
    team_name: Annotated[str, Form()],
    member_1_name: Annotated[str, Form()],
    member_2_name: Annotated[str, Form()],
    member_3_name: Annotated[str, Form()],
    contact_email: Annotated[str, Form()],
    contact_phone: Annotated[str | None, Form()] = None,
    receipt: UploadFile = File(...),
) -> ReadingTeamRegistrationResponse:
    from app.domains.reading.service_reading import register_team as register_team_service

    try:
        payload = ReadingTeamRegistrationCreate(
            team_name=team_name,
            member_1_name=member_1_name,
            member_2_name=member_2_name,
            member_3_name=member_3_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc

    return await register_team_service(payload, receipt, db)


@router.post("/vote-rounds", response_model=ReadingVoteRoundResponse, status_code=201)
async def create_vote_round(
    payload: ReadingVoteRoundCreate, user_id: CurrentUserId, db: DbSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.service_reading import create_vote_round_for_admin

    return await create_vote_round_for_admin(payload, db)


@router.get("/vote-rounds", response_model=list[ReadingVoteRoundResponse])
async def list_vote_rounds(user_id: CurrentUserId, db: DbSession) -> list[ReadingVoteRoundResponse]:
    from app.domains.reading.service_reading import list_vote_rounds_for_user

    return await list_vote_rounds_for_user(user_id, db)


@router.post("/vote-rounds/{round_id}/vote", response_model=ReadingVoteRoundResponse)
async def cast_vote(
    round_id: str, payload: ReadingVoteCastRequest, user_id: CurrentUserId, db: DbSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.service_reading import cast_vote_for_user

    return await cast_vote_for_user(round_id, user_id, payload, db)
