from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, File, Response, UploadFile
from fastapi.responses import FileResponse

from app.dependencies import CurrentUserId, DbSession
from app.domains.reading.schema_reading import (
    ReadingAdminUserResponse,
    ReadingAppSettingsResponse,
    ReadingAppSettingsUpdate,
    ReadingBookOfMonthResponse,
    ReadingBookResponse,
    ReadingBookWrite,
    ReadingLiveAnswerRequest,
    ReadingLiveHostState,
    ReadingLiveJoinRequest,
    ReadingLivePlayerState,
    ReadingLiveSessionCreate,
    ReadingLiveSummary,
    ReadingLoginRequest,
    ReadingNightGradeWrite,
    ReadingNightState,
    ReadingNightTeamAnswerWrite,
    ReadingProfileStatsResponse,
    ReadingProgressUpdate,
    ReadingQuizResponse,
    ReadingQuizWrite,
    ReadingRefreshRequest,
    ReadingRegisterRequest,
    ReadingSemesterRoundCreate,
    ReadingSemesterRoundResponse,
    ReadingTeamCoverUpdate,
    ReadingTeamInviteJoinRequest,
    ReadingTeamInvitePreview,
    ReadingTeamInviteResponse,
    ReadingTeamJoinRequest,
    ReadingTeamMemberProfileResponse,
    ReadingTeamPaymentAdminResponse,
    ReadingTeamPaymentStatusUpdate,
    ReadingTeamRegistrationResponse,
    ReadingTeamResponse,
    ReadingTeamSummaryResponse,
    ReadingTokenResponse,
    ReadingUserResponse,
    ReadingVoteCastRequest,
    ReadingVoteRoundCreate,
    ReadingVoteRoundResponse,
    ReadingVoteSelectionCreate,
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


@router.get("/users/me/stats", response_model=ReadingProfileStatsResponse)
async def get_my_profile_stats(user_id: CurrentUserId, db: DbSession) -> ReadingProfileStatsResponse:
    from app.domains.reading.service_reading import get_my_profile_stats as get_my_profile_stats_service

    return await get_my_profile_stats_service(user_id, db)


@router.post("/teams", response_model=ReadingUserResponse, status_code=201)
async def create_team(payload: ReadingTeamJoinRequest, user_id: CurrentUserId, db: DbSession) -> ReadingUserResponse:
    from app.domains.reading.service_reading import create_team as create_team_service

    return await create_team_service(user_id, payload, db)


@router.post("/teams/join", response_model=ReadingUserResponse)
async def join_team(
    payload: ReadingTeamInviteJoinRequest, user_id: CurrentUserId, db: DbSession
) -> ReadingUserResponse:
    from app.domains.reading.service_reading import join_team as join_team_service

    return await join_team_service(user_id, payload, db)


@router.get("/teams/invites/{token}", response_model=ReadingTeamInvitePreview)
async def preview_team_invite(token: str, user_id: CurrentUserId, db: DbSession) -> ReadingTeamInvitePreview:
    from app.domains.reading.service_reading import preview_team_invite as preview_team_invite_service

    return await preview_team_invite_service(token, db)


@router.post("/teams/me/invite", response_model=ReadingTeamInviteResponse)
async def get_team_invite(user_id: CurrentUserId, db: DbSession) -> ReadingTeamInviteResponse:
    from app.domains.reading.service_reading import get_or_create_team_invite

    return await get_or_create_team_invite(user_id, db)


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


@router.put("/teams/me/cover", response_model=ReadingTeamResponse)
async def update_my_team_cover(
    payload: ReadingTeamCoverUpdate, user_id: CurrentUserId, db: DbSession
) -> ReadingTeamResponse:
    from app.domains.reading.service_reading import update_my_team_cover as update_my_team_cover_service

    return await update_my_team_cover_service(user_id, payload, db)


@router.get("/teams/members/{member_id}", response_model=ReadingTeamMemberProfileResponse)
async def get_team_member_profile(
    member_id: str, user_id: CurrentUserId, db: DbSession
) -> ReadingTeamMemberProfileResponse:
    from app.domains.reading.service_reading import get_team_member_profile as get_team_member_profile_service

    return await get_team_member_profile_service(user_id, member_id, db)


@router.post("/teams/payment", response_model=ReadingTeamRegistrationResponse, status_code=201)
async def submit_team_payment(
    db: DbSession,
    user_id: CurrentUserId,
    receipt: UploadFile = File(...),
) -> ReadingTeamRegistrationResponse:
    from app.domains.reading.service_reading import register_team as register_team_service

    return await register_team_service(user_id, receipt, db)


@router.get("/users", response_model=list[ReadingAdminUserResponse])
async def list_users(user_id: CurrentUserId, db: DbSession) -> list[ReadingAdminUserResponse]:
    from app.domains.reading.service_reading import list_users_for_admin

    return await list_users_for_admin(user_id, db)


@router.delete("/users/{target_user_id}", status_code=204)
async def delete_user(target_user_id: UUID, user_id: CurrentUserId, db: DbSession) -> Response:
    from app.domains.reading.service_reading import delete_user_for_admin

    await delete_user_for_admin(user_id, target_user_id, db)
    return Response(status_code=204)


@router.delete("/teams/{team_id}", status_code=204)
async def delete_team(team_id: UUID, user_id: CurrentUserId, db: DbSession) -> Response:
    from app.domains.reading.service_reading import delete_team_for_admin

    await delete_team_for_admin(user_id, team_id, db)
    return Response(status_code=204)


@router.get("/team-payments", response_model=list[ReadingTeamPaymentAdminResponse])
async def list_team_payments(
    user_id: CurrentUserId, db: DbSession
) -> list[ReadingTeamPaymentAdminResponse]:
    from app.domains.reading.service_reading import list_team_payments_for_admin

    return await list_team_payments_for_admin(user_id, db)


@router.patch("/team-payments/{payment_id}", response_model=ReadingTeamRegistrationResponse)
async def update_team_payment_status(
    payment_id: str,
    payload: ReadingTeamPaymentStatusUpdate,
    user_id: CurrentUserId,
    db: DbSession,
) -> ReadingTeamRegistrationResponse:
    from app.domains.reading.service_reading import update_team_payment_status_for_admin

    return await update_team_payment_status_for_admin(user_id, payment_id, payload, db)


@router.get("/team-payments/{payment_id}/receipt", response_class=FileResponse)
async def get_team_payment_receipt(
    payment_id: str, user_id: CurrentUserId, db: DbSession
) -> FileResponse:
    from app.domains.reading.service_reading import get_team_payment_receipt_for_admin

    receipt_path, content_type, team_name = await get_team_payment_receipt_for_admin(user_id, payment_id, db)
    return FileResponse(
        path=receipt_path,
        media_type=content_type,
        filename=f"{team_name}-receipt{receipt_path.suffix}",
        content_disposition_type="inline",
    )


@router.post("/vote-selections", response_model=list[ReadingVoteRoundResponse], status_code=201)
async def create_vote_selection(
    payload: ReadingVoteSelectionCreate, user_id: CurrentUserId, db: DbSession
) -> list[ReadingVoteRoundResponse]:
    from app.domains.reading.service_reading import create_vote_selection_for_admin

    return await create_vote_selection_for_admin(user_id, payload, db)


@router.post("/vote-rounds", response_model=ReadingVoteRoundResponse, status_code=201)
async def create_vote_round(
    payload: ReadingVoteRoundCreate, user_id: CurrentUserId, db: DbSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.service_reading import create_vote_round_for_admin

    return await create_vote_round_for_admin(user_id, payload, db)


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


@router.post("/semester-rounds", response_model=ReadingSemesterRoundResponse, status_code=201)
async def create_semester_round(
    payload: ReadingSemesterRoundCreate, user_id: CurrentUserId, db: DbSession
) -> ReadingSemesterRoundResponse:
    from app.domains.reading.service_reading import create_semester_round_for_admin

    return await create_semester_round_for_admin(user_id, payload, db)


@router.get("/semester-rounds", response_model=list[ReadingSemesterRoundResponse])
async def list_semester_rounds(user_id: CurrentUserId, db: DbSession) -> list[ReadingSemesterRoundResponse]:
    from app.domains.reading.service_reading import list_semester_rounds_for_user

    return await list_semester_rounds_for_user(db)


@router.get("/settings", response_model=ReadingAppSettingsResponse)
async def get_settings(user_id: CurrentUserId, db: DbSession) -> ReadingAppSettingsResponse:
    from app.domains.reading.service_reading import get_app_settings_for_user

    return await get_app_settings_for_user(db)


@router.patch("/settings", response_model=ReadingAppSettingsResponse)
async def update_settings(
    payload: ReadingAppSettingsUpdate, user_id: CurrentUserId, db: DbSession
) -> ReadingAppSettingsResponse:
    from app.domains.reading.service_reading import update_app_settings_for_admin

    return await update_app_settings_for_admin(user_id, payload, db)


@router.get("/books", response_model=list[ReadingBookResponse])
async def list_books(user_id: CurrentUserId, db: DbSession) -> list[ReadingBookResponse]:
    from app.domains.reading.service_reading import list_books_for_user

    return await list_books_for_user(db)


@router.post("/books", response_model=ReadingBookResponse, status_code=201)
async def create_book(payload: ReadingBookWrite, user_id: CurrentUserId, db: DbSession) -> ReadingBookResponse:
    from app.domains.reading.service_reading import create_book_for_admin

    return await create_book_for_admin(user_id, payload, db)


@router.get("/books/{book_id}", response_model=ReadingBookResponse)
async def get_book(book_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingBookResponse:
    from app.domains.reading.service_reading import get_book_for_user

    return await get_book_for_user(book_id, db)


@router.patch("/books/{book_id}", response_model=ReadingBookResponse)
async def update_book(
    book_id: str, payload: ReadingBookWrite, user_id: CurrentUserId, db: DbSession
) -> ReadingBookResponse:
    from app.domains.reading.service_reading import update_book_for_admin

    return await update_book_for_admin(user_id, book_id, payload, db)


@router.delete("/books/{book_id}", status_code=204)
async def delete_book(book_id: str, user_id: CurrentUserId, db: DbSession) -> None:
    from app.domains.reading.service_reading import delete_book_for_admin

    await delete_book_for_admin(user_id, book_id, db)


@router.put("/books/{book_id}/cover", response_model=ReadingBookResponse)
async def upload_book_cover(
    book_id: str, user_id: CurrentUserId, db: DbSession, cover: UploadFile = File(...)
) -> ReadingBookResponse:
    from app.domains.reading.service_reading import upload_book_cover_for_admin

    return await upload_book_cover_for_admin(user_id, book_id, cover, db)


@router.delete("/books/{book_id}/cover", response_model=ReadingBookResponse)
async def remove_book_cover(book_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingBookResponse:
    from app.domains.reading.service_reading import remove_book_cover_for_admin

    return await remove_book_cover_for_admin(user_id, book_id, db)


# Public: <img> tags can't send a bearer token, and book covers aren't sensitive.
@router.get("/books/{book_id}/cover")
async def get_book_cover(book_id: str, db: DbSession) -> Response:
    from app.domains.reading.service_reading import get_book_cover_image

    image, mime = await get_book_cover_image(book_id, db)
    return Response(content=image, media_type=mime, headers={"Cache-Control": "public, max-age=31536000, immutable"})


@router.get("/quizzes", response_model=list[ReadingQuizResponse])
async def list_quizzes(user_id: CurrentUserId, db: DbSession) -> list[ReadingQuizResponse]:
    from app.domains.reading.service_reading import list_quizzes_for_admin

    return await list_quizzes_for_admin(user_id, db)


@router.post("/quizzes", response_model=ReadingQuizResponse, status_code=201)
async def create_quiz(payload: ReadingQuizWrite, user_id: CurrentUserId, db: DbSession) -> ReadingQuizResponse:
    from app.domains.reading.service_reading import save_quiz_for_admin

    return await save_quiz_for_admin(user_id, None, payload, db)


@router.get("/quizzes/{quiz_id}", response_model=ReadingQuizResponse)
async def get_quiz(quiz_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingQuizResponse:
    from app.domains.reading.service_reading import get_quiz_for_admin

    return await get_quiz_for_admin(user_id, quiz_id, db)


@router.put("/quizzes/{quiz_id}", response_model=ReadingQuizResponse)
async def update_quiz(
    quiz_id: str, payload: ReadingQuizWrite, user_id: CurrentUserId, db: DbSession
) -> ReadingQuizResponse:
    from app.domains.reading.service_reading import save_quiz_for_admin

    return await save_quiz_for_admin(user_id, quiz_id, payload, db)


@router.delete("/quizzes/{quiz_id}", status_code=204)
async def delete_quiz(quiz_id: str, user_id: CurrentUserId, db: DbSession) -> None:
    from app.domains.reading.service_reading import delete_quiz_for_admin

    await delete_quiz_for_admin(user_id, quiz_id, db)


@router.get("/book-of-the-month", response_model=ReadingBookOfMonthResponse | None)
async def get_book_of_the_month(user_id: CurrentUserId, db: DbSession) -> ReadingBookOfMonthResponse | None:
    from app.domains.reading.service_reading import get_book_of_month_for_user

    return await get_book_of_month_for_user(user_id, db)


@router.put("/book-of-the-month/progress", response_model=ReadingBookOfMonthResponse)
async def update_reading_progress(
    payload: ReadingProgressUpdate, user_id: CurrentUserId, db: DbSession
) -> ReadingBookOfMonthResponse:
    from app.domains.reading.service_reading import update_progress_for_user

    return await update_progress_for_user(user_id, payload, db)


@router.post("/quiz-sessions", response_model=ReadingLiveSummary, status_code=201)
async def start_live_session(
    payload: ReadingLiveSessionCreate, user_id: CurrentUserId, db: DbSession
) -> ReadingLiveSummary:
    from app.domains.reading.service_reading import start_live_session_for_admin

    return await start_live_session_for_admin(user_id, payload, db)


@router.get("/quiz-sessions/live", response_model=ReadingLiveSummary | None)
async def get_live_session(user_id: CurrentUserId, db: DbSession) -> ReadingLiveSummary | None:
    from app.domains.reading.service_reading import get_active_live_session

    return await get_active_live_session(db)


@router.post("/quiz-sessions/join", response_model=ReadingLiveSummary)
async def join_live_session(payload: ReadingLiveJoinRequest, user_id: CurrentUserId, db: DbSession) -> ReadingLiveSummary:
    from app.domains.reading.service_reading import join_live_session as join_live_session_service

    return await join_live_session_service(user_id, payload, db)


@router.get("/quiz-sessions/{session_id}/host", response_model=ReadingLiveHostState)
async def get_live_host_state(session_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingLiveHostState:
    from app.domains.reading.service_reading import get_live_host_state_for_admin

    return await get_live_host_state_for_admin(user_id, session_id, db)


@router.post("/quiz-sessions/{session_id}/next", response_model=ReadingLiveHostState)
async def advance_live_session(session_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingLiveHostState:
    from app.domains.reading.service_reading import advance_live_session_for_admin

    return await advance_live_session_for_admin(user_id, session_id, db)


@router.get("/quiz-sessions/{session_id}/state", response_model=ReadingLivePlayerState)
async def get_live_player_state(session_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingLivePlayerState:
    from app.domains.reading.service_reading import get_live_player_state as get_live_player_state_service

    return await get_live_player_state_service(user_id, session_id, db)


@router.post("/quiz-sessions/{session_id}/answer", response_model=ReadingLivePlayerState)
async def answer_live_question(
    session_id: str, payload: ReadingLiveAnswerRequest, user_id: CurrentUserId, db: DbSession
) -> ReadingLivePlayerState:
    from app.domains.reading.service_reading import answer_live_question as answer_live_question_service

    return await answer_live_question_service(user_id, session_id, payload, db)


@router.get("/quiz-sessions/{session_id}/night/host", response_model=ReadingNightState)
async def get_night_host_state(session_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingNightState:
    from app.domains.reading.service_quiz_night import get_night_host_state as get_night_host_state_service

    return await get_night_host_state_service(user_id, session_id, db)


@router.post("/quiz-sessions/{session_id}/night/advance", response_model=ReadingNightState)
async def advance_night(session_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingNightState:
    from app.domains.reading.service_quiz_night import advance_night as advance_night_service

    return await advance_night_service(user_id, session_id, db)


@router.get("/quiz-sessions/{session_id}/night/state", response_model=ReadingNightState)
async def get_night_player_state(session_id: str, user_id: CurrentUserId, db: DbSession) -> ReadingNightState:
    from app.domains.reading.service_quiz_night import get_night_player_state as get_night_player_state_service

    return await get_night_player_state_service(user_id, session_id, db)


@router.put("/quiz-sessions/{session_id}/night/answer", response_model=ReadingNightState)
async def save_night_answer(
    session_id: str, payload: ReadingNightTeamAnswerWrite, user_id: CurrentUserId, db: DbSession
) -> ReadingNightState:
    from app.domains.reading.service_quiz_night import save_team_answer

    return await save_team_answer(user_id, session_id, payload, db)


@router.patch("/quiz-sessions/{session_id}/night/answers/{answer_id}", response_model=ReadingNightState)
async def grade_night_answer(
    session_id: str, answer_id: str, payload: ReadingNightGradeWrite, user_id: CurrentUserId, db: DbSession
) -> ReadingNightState:
    from app.domains.reading.service_quiz_night import grade_team_answer

    return await grade_team_answer(user_id, session_id, answer_id, payload, db)
