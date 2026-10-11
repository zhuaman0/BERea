from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.domains.auth.service_auth import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.domains.reading.model_reading import (
    ReadingBook,
    ReadingQuiz,
    ReadingSemesterRound,
    ReadingTeam,
    ReadingUser,
    ReadingVoteRound,
)
from app.domains.reading.schema_reading import (
    TEAM_MAX_MEMBERS,
    ReadingAppSettingsResponse,
    ReadingAppSettingsUpdate,
    ReadingBookResponse,
    ReadingBookWrite,
    ReadingLoginRequest,
    ReadingQuizAnswerResponse,
    ReadingQuizQuestionResponse,
    ReadingQuizResponse,
    ReadingQuizWrite,
    ReadingRegisterRequest,
    ReadingSemesterRoundCreate,
    ReadingSemesterRoundResponse,
    ReadingTeamCover,
    ReadingTeamCoverUpdate,
    ReadingTeamJoinRequest,
    ReadingTeamMemberAddRequest,
    ReadingTeamMemberProfileResponse,
    ReadingTeamMemberResponse,
    ReadingTeamRegistrationCreate,
    ReadingTeamRegistrationResponse,
    ReadingTeamResponse,
    ReadingTeamSummaryResponse,
    ReadingTokenResponse,
    ReadingUserResponse,
    ReadingVoteCastRequest,
    ReadingVoteOptionResult,
    ReadingVoteRoundCreate,
    ReadingVoteRoundResponse,
)

RECEIPT_CONTENT_TYPE = "application/pdf"


def _to_user_response(user: ReadingUser) -> ReadingUserResponse:
    return ReadingUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        team_name=user.team.name if user.team else None,
        token_balance=user.token_balance,
        current_streak=user.current_streak,
        is_admin=user.is_admin,
        created_at=user.created_at,
    )


async def register_user(payload: ReadingRegisterRequest, db: AsyncSession) -> ReadingTokenResponse:
    from app.domains.reading.repo_reading import create_user_record, get_user_by_email

    existing = await get_user_by_email(payload.email, db)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await create_user_record(payload.email, hash_password(payload.password), payload.full_name, db)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    await _store_refresh_token(user.id, refresh, db)
    return ReadingTokenResponse(access_token=access, refresh_token=refresh)


async def login_user(payload: ReadingLoginRequest, db: AsyncSession) -> ReadingTokenResponse:
    from app.domains.reading.repo_reading import get_user_by_email

    user = await get_user_by_email(payload.email, db)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    await _store_refresh_token(user.id, refresh, db)
    return ReadingTokenResponse(access_token=access, refresh_token=refresh)


async def refresh_tokens(refresh_token: str, db: AsyncSession) -> ReadingTokenResponse:
    from app.domains.reading.repo_reading import get_refresh_token_record, revoke_token

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    record = await get_refresh_token_record(token_hash, db)
    if not record or record.revoked or record.expires_at < datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    await revoke_token(record, db)
    access = create_access_token(str(record.user_id))
    new_refresh = create_refresh_token(str(record.user_id))
    await _store_refresh_token(record.user_id, new_refresh, db)
    return ReadingTokenResponse(access_token=access, refresh_token=new_refresh)


async def revoke_refresh_token(refresh_token: str, db: AsyncSession) -> None:
    from app.domains.reading.repo_reading import get_refresh_token_record, revoke_token

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    record = await get_refresh_token_record(token_hash, db)
    if record:
        await revoke_token(record, db)


async def get_current_reading_user(user_id: str, db: AsyncSession) -> ReadingUserResponse:
    from app.domains.reading.repo_reading import get_user_by_id, touch_user_streak

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user = await touch_user_streak(user, _today(), db)
    return _to_user_response(user)


async def join_team(user_id: str, payload: ReadingTeamJoinRequest, db: AsyncSession) -> ReadingUserResponse:
    from app.domains.reading.repo_reading import (
        count_team_members,
        get_or_create_team,
        get_user_by_id,
        set_user_team,
    )

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    team = await get_or_create_team(payload.team_name, db)
    if team.id != user.team_id:
        member_count = await count_team_members(team.id, db)
        if member_count >= TEAM_MAX_MEMBERS:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{payload.team_name} already has {TEAM_MAX_MEMBERS} players",
            )

    user = await set_user_team(user, team.id, db)
    return _to_user_response(user)


async def add_team_member(
    user_id: str, payload: ReadingTeamMemberAddRequest, db: AsyncSession
) -> ReadingTeamResponse:
    """Creates a real account for a teammate and adds them to the captain's team directly.

    This is the stand-in for a proper invite-link flow (see TEAM_INVITE_LINK_ENABLED on the
    frontend): the new member gets a random password they don't know yet, so logging in will
    require a password reset once that flow exists. Until then this just gets them onto the
    roster immediately.
    """
    from app.domains.reading.repo_reading import (
        count_team_members,
        create_team_member_record,
        get_team_members,
        get_user_by_email,
        get_user_by_id,
    )

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")

    existing = await get_user_by_email(payload.email, db)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That email is already registered")

    member_count = await count_team_members(user.team_id, db)
    if member_count >= TEAM_MAX_MEMBERS:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Your team is already full")

    placeholder_password = hash_password(secrets.token_urlsafe(24))
    await create_team_member_record(payload.email, placeholder_password, payload.full_name, user.team_id, db)

    members = await get_team_members(user.team_id, db)
    place, teams_total = await _compute_team_rank(user.team_id, db)
    return _to_team_response(user.team, members, place, teams_total)


async def get_my_team(user_id: str, db: AsyncSession) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import get_team_members, get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")

    members = await get_team_members(user.team_id, db)
    place, teams_total = await _compute_team_rank(user.team_id, db)
    return _to_team_response(user.team, members, place, teams_total)


async def rename_my_team(user_id: str, payload: ReadingTeamJoinRequest, db: AsyncSession) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import (
        get_team_by_name,
        get_team_members,
        get_user_by_id,
        rename_team,
    )

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")

    existing = await get_team_by_name(payload.team_name, db)
    if existing and existing.id != user.team_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That team name is already taken")

    team = await rename_team(user.team, payload.team_name, db)
    members = await get_team_members(team.id, db)
    place, teams_total = await _compute_team_rank(team.id, db)
    return _to_team_response(team, members, place, teams_total)


async def get_team_member_profile(
    user_id: str, member_id: str, db: AsyncSession
) -> ReadingTeamMemberProfileResponse:
    from app.domains.reading.repo_reading import get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")

    member = await get_user_by_id(uuid.UUID(member_id), db)
    if not member or member.team_id != user.team_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teammate not found")

    return ReadingTeamMemberProfileResponse(
        id=member.id,
        full_name=member.full_name,
        email=member.email,
        team_name=member.team.name if member.team else "",
        current_streak=_effective_streak(member, _today()),
        token_balance=member.token_balance,
        created_at=member.created_at,
    )


def _today() -> date:
    return datetime.now(UTC).date()


def _effective_streak(user: ReadingUser, today: date) -> int:
    """`current_streak` is only recomputed when the user next visits, so for anyone viewed
    by someone else a streak whose last day is older than yesterday is already broken."""
    if user.last_active_date is None or (today - user.last_active_date).days > 1:
        return 0
    return user.current_streak


async def list_teams(db: AsyncSession) -> list[ReadingTeamSummaryResponse]:
    from app.domains.reading.repo_reading import list_teams_with_member_counts

    rows = await list_teams_with_member_counts(db)
    return [
        ReadingTeamSummaryResponse(
            id=team.id, name=team.name, member_count=member_count, cover=_to_team_cover(team)
        )
        for team, member_count in rows
    ]


async def update_my_team_cover(
    user_id: str, payload: ReadingTeamCoverUpdate, db: AsyncSession
) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import get_team_members, get_user_by_id, update_team_cover

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")

    team = await update_team_cover(
        user.team,
        title=payload.title,
        color=payload.color,
        pattern=payload.pattern,
        emblem=payload.emblem,
        animation=payload.animation,
        db=db,
    )
    members = await get_team_members(team.id, db)
    place, teams_total = await _compute_team_rank(team.id, db)
    return _to_team_response(team, members, place, teams_total)


def _to_team_cover(team: ReadingTeam) -> ReadingTeamCover:
    return ReadingTeamCover(
        title=team.cover_title,
        color=team.cover_color,  # type: ignore[arg-type]
        pattern=team.cover_pattern,  # type: ignore[arg-type]
        emblem=team.cover_emblem,  # type: ignore[arg-type]
        animation=team.cover_animation,  # type: ignore[arg-type]
    )


async def _compute_team_rank(team_id: uuid.UUID, db: AsyncSession) -> tuple[int, int]:
    """Ranks teams the same way the leaderboard does — by roster size until real
    quiz/reading points exist to rank by instead."""
    from app.domains.reading.repo_reading import list_teams_with_member_counts

    rows = await list_teams_with_member_counts(db)
    place = next((i + 1 for i, (team, _) in enumerate(rows) if team.id == team_id), len(rows))
    return place, len(rows)


def _to_team_response(
    team: ReadingTeam, members: list[ReadingUser], place: int, teams_total: int
) -> ReadingTeamResponse:
    today = _today()
    return ReadingTeamResponse(
        id=team.id,
        name=team.name,
        members=[
            ReadingTeamMemberResponse(
                id=m.id,
                full_name=m.full_name,
                email=m.email,
                current_streak=_effective_streak(m, today),
                active_today=m.last_active_date == today,
                created_at=m.created_at,
            )
            for m in members
        ],
        place=place,
        teams_total=teams_total,
        cover=_to_team_cover(team),
    )


async def register_team(
    payload: ReadingTeamRegistrationCreate, receipt: UploadFile, db: AsyncSession
) -> ReadingTeamRegistrationResponse:
    from app.domains.reading.repo_reading import create_team_registration

    if receipt.content_type != RECEIPT_CONTENT_TYPE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payment receipt must be a PDF file",
        )

    contents = await receipt.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Payment receipt must be under {settings.max_upload_size_mb}MB",
        )

    upload_dir = Path(settings.upload_dir) / "team-registrations"
    upload_dir.mkdir(parents=True, exist_ok=True)
    receipt_path = upload_dir / f"{uuid.uuid4()}.pdf"
    receipt_path.write_bytes(contents)

    registration = await create_team_registration(
        team_name=payload.team_name,
        member_1_name=payload.member_1_name,
        member_2_name=payload.member_2_name,
        member_3_name=payload.member_3_name,
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        receipt_path=str(receipt_path),
        db=db,
    )
    return ReadingTeamRegistrationResponse(
        id=registration.id,
        team_name=registration.team_name,
        status=registration.status,
        created_at=registration.created_at,
    )


async def _store_refresh_token(user_id: uuid.UUID, token: str, db: AsyncSession) -> None:
    from app.domains.reading.repo_reading import save_refresh_token

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    await save_refresh_token(user_id, token_hash, expires_at, db)


async def create_vote_round_for_admin(
    user_id: str, payload: ReadingVoteRoundCreate, db: AsyncSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.repo_reading import create_vote_round

    await _require_admin(user_id, db)
    opens_at = datetime.now(UTC)
    closes_at = opens_at + timedelta(hours=payload.duration_hours)
    round_ = await create_vote_round(payload.stage, opens_at, closes_at, payload.options, db)
    return await _to_vote_round_response(round_, None, db)


async def list_vote_rounds_for_user(user_id: str, db: AsyncSession) -> list[ReadingVoteRoundResponse]:
    from app.domains.reading.repo_reading import list_vote_rounds

    rounds = await list_vote_rounds(db)
    return [await _to_vote_round_response(round_, user_id, db) for round_ in rounds]


async def cast_vote_for_user(
    round_id: str, user_id: str, payload: ReadingVoteCastRequest, db: AsyncSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.repo_reading import cast_vote, get_vote_round_by_id

    round_ = await get_vote_round_by_id(uuid.UUID(round_id), db)
    if not round_:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote round not found")
    if datetime.now(UTC) >= round_.closes_at:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Voting has closed for this round")
    if payload.option_id not in {option.id for option in round_.options}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="That option isn't part of this round")

    await cast_vote(round_.id, payload.option_id, uuid.UUID(user_id), db)
    return await _to_vote_round_response(round_, user_id, db)


async def _to_vote_round_response(
    round_: ReadingVoteRound, user_id: str | None, db: AsyncSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.repo_reading import get_user_vote, get_vote_tally

    tally = await get_vote_tally(round_.id, db)
    total_votes = sum(tally.values())
    is_open = datetime.now(UTC) < round_.closes_at

    options = [
        ReadingVoteOptionResult(
            id=option.id,
            label=option.label,
            vote_count=tally.get(option.id, 0),
            percent=round((tally.get(option.id, 0) / total_votes) * 100) if total_votes else 0,
        )
        for option in round_.options
    ]

    winner_option_id = None
    if not is_open and total_votes:
        winner_option_id = max(options, key=lambda option: option.vote_count).id

    your_vote_option_id = None
    if user_id:
        vote = await get_user_vote(round_.id, uuid.UUID(user_id), db)
        your_vote_option_id = vote.option_id if vote else None

    return ReadingVoteRoundResponse(
        id=round_.id,
        stage=round_.stage,  # type: ignore[arg-type]
        is_open=is_open,
        opens_at=round_.opens_at,
        closes_at=round_.closes_at,
        total_votes=total_votes,
        options=options,
        winner_option_id=winner_option_id,
        your_vote_option_id=your_vote_option_id,
    )


async def create_semester_round_for_admin(
    user_id: str, payload: ReadingSemesterRoundCreate, db: AsyncSession
) -> ReadingSemesterRoundResponse:
    from app.domains.reading.repo_reading import create_semester_round

    await _require_admin(user_id, db)
    round_ = await create_semester_round(payload.index, payload.label, payload.starts_at, payload.ends_at, db)
    return _to_semester_round_response(round_)


async def list_semester_rounds_for_user(db: AsyncSession) -> list[ReadingSemesterRoundResponse]:
    from app.domains.reading.repo_reading import list_semester_rounds

    rounds = await list_semester_rounds(db)
    return [_to_semester_round_response(round_) for round_ in rounds]


def _to_semester_round_response(round_: ReadingSemesterRound) -> ReadingSemesterRoundResponse:
    now = datetime.now(UTC)
    if now < round_.starts_at:
        status_ = "locked"
    elif now > round_.ends_at:
        status_ = "done"
    else:
        status_ = "in_progress"

    return ReadingSemesterRoundResponse(
        id=round_.id,
        index=round_.index,
        label=round_.label,
        starts_at=round_.starts_at,
        ends_at=round_.ends_at,
        status=status_,  # type: ignore[arg-type]
    )


async def get_app_settings_for_user(db: AsyncSession) -> ReadingAppSettingsResponse:
    from app.domains.reading.repo_reading import get_app_settings

    settings_row = await get_app_settings(db)
    return ReadingAppSettingsResponse.model_validate(settings_row)


async def update_app_settings_for_admin(
    user_id: str, payload: ReadingAppSettingsUpdate, db: AsyncSession
) -> ReadingAppSettingsResponse:
    from app.domains.reading.repo_reading import set_leaderboard_enabled

    await _require_admin(user_id, db)
    settings_row = await set_leaderboard_enabled(payload.leaderboard_enabled, db)
    return ReadingAppSettingsResponse.model_validate(settings_row)


BOOK_COVER_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
BOOK_COVER_MAX_BYTES = 2 * 1024 * 1024


def _to_book_response(book: ReadingBook) -> ReadingBookResponse:
    cover_url = book.cover_url
    if book.cover_mime:
        # Version by updated_at so a replaced cover never shows a stale cached image.
        cover_url = f"/v1/reading/books/{book.id}/cover?v={int(book.updated_at.timestamp())}"
    return ReadingBookResponse(id=book.id, title=book.title, description=book.description, cover_url=cover_url)


async def _get_book_or_404(book_id: str, db: AsyncSession) -> ReadingBook:
    from app.domains.reading.repo_reading import get_book

    book = await get_book(uuid.UUID(book_id), db)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book


async def list_books_for_user(db: AsyncSession) -> list[ReadingBookResponse]:
    from app.domains.reading.repo_reading import list_books

    return [_to_book_response(book) for book in await list_books(db)]


async def get_book_for_user(book_id: str, db: AsyncSession) -> ReadingBookResponse:
    return _to_book_response(await _get_book_or_404(book_id, db))


async def create_book_for_admin(user_id: str, payload: ReadingBookWrite, db: AsyncSession) -> ReadingBookResponse:
    from app.domains.reading.repo_reading import create_book

    await _require_admin(user_id, db)
    book = await create_book(payload.title, payload.description, payload.cover_url, db)
    return _to_book_response(book)


async def update_book_for_admin(
    user_id: str, book_id: str, payload: ReadingBookWrite, db: AsyncSession
) -> ReadingBookResponse:
    from app.domains.reading.repo_reading import update_book

    await _require_admin(user_id, db)
    book = await _get_book_or_404(book_id, db)
    book = await update_book(
        book, title=payload.title, description=payload.description, cover_url=payload.cover_url, db=db
    )
    return _to_book_response(book)


async def upload_book_cover_for_admin(
    user_id: str, book_id: str, cover: UploadFile, db: AsyncSession
) -> ReadingBookResponse:
    from app.domains.reading.repo_reading import set_book_cover_image

    await _require_admin(user_id, db)
    if cover.content_type not in BOOK_COVER_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Cover must be a JPEG, PNG or WebP image"
        )
    contents = await cover.read()
    if len(contents) > BOOK_COVER_MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Cover must be under 2MB")

    book = await _get_book_or_404(book_id, db)
    book = await set_book_cover_image(book, contents, cover.content_type, db)
    return _to_book_response(book)


async def remove_book_cover_for_admin(user_id: str, book_id: str, db: AsyncSession) -> ReadingBookResponse:
    from app.domains.reading.repo_reading import clear_book_cover

    await _require_admin(user_id, db)
    book = await clear_book_cover(await _get_book_or_404(book_id, db), db)
    return _to_book_response(book)


async def delete_book_for_admin(user_id: str, book_id: str, db: AsyncSession) -> None:
    from app.domains.reading.repo_reading import delete_book

    await _require_admin(user_id, db)
    await delete_book(await _get_book_or_404(book_id, db), db)


async def get_book_cover_image(book_id: str, db: AsyncSession) -> tuple[bytes, str]:
    from app.domains.reading.repo_reading import get_book_with_cover

    book = await get_book_with_cover(uuid.UUID(book_id), db)
    if not book or not book.cover_image or not book.cover_mime:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover not found")
    return book.cover_image, book.cover_mime


async def _require_admin(user_id: str, db: AsyncSession) -> None:
    from app.domains.reading.repo_reading import get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")


def _to_quiz_response(quiz: ReadingQuiz) -> ReadingQuizResponse:
    return ReadingQuizResponse(
        id=quiz.id,
        title=quiz.title,
        month_label=quiz.month_label,
        scheduled_for=quiz.scheduled_for,
        status=quiz.status,  # type: ignore[arg-type]
        questions=[
            ReadingQuizQuestionResponse(
                id=q.id,
                text=q.text,
                time_limit_seconds=q.time_limit_seconds,
                points=q.points,
                answers=[ReadingQuizAnswerResponse(id=a.id, text=a.text, is_correct=a.is_correct) for a in q.answers],
            )
            for q in quiz.questions
        ],
    )


async def _get_quiz_or_404(quiz_id: str, db: AsyncSession) -> ReadingQuiz:
    from app.domains.reading.repo_reading import get_quiz

    quiz = await get_quiz(uuid.UUID(quiz_id), db)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz


async def list_quizzes_for_admin(user_id: str, db: AsyncSession) -> list[ReadingQuizResponse]:
    from app.domains.reading.repo_reading import list_quizzes

    await _require_admin(user_id, db)
    return [_to_quiz_response(quiz) for quiz in await list_quizzes(db)]


async def get_quiz_for_admin(user_id: str, quiz_id: str, db: AsyncSession) -> ReadingQuizResponse:
    await _require_admin(user_id, db)
    return _to_quiz_response(await _get_quiz_or_404(quiz_id, db))


async def save_quiz_for_admin(
    user_id: str, quiz_id: str | None, payload: ReadingQuizWrite, db: AsyncSession
) -> ReadingQuizResponse:
    from app.domains.reading.repo_reading import get_quiz, save_quiz

    await _require_admin(user_id, db)
    existing = await _get_quiz_or_404(quiz_id, db) if quiz_id else None
    saved_id = await save_quiz(existing, payload, db)
    # Re-read so the replaced question/answer lists come back fully loaded and ordered.
    db.expire_all()
    quiz = await get_quiz(saved_id, db)
    assert quiz is not None
    return _to_quiz_response(quiz)


async def delete_quiz_for_admin(user_id: str, quiz_id: str, db: AsyncSession) -> None:
    from app.domains.reading.repo_reading import delete_quiz

    await _require_admin(user_id, db)
    await delete_quiz(await _get_quiz_or_404(quiz_id, db), db)
