from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError
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
    ReadingQuizParticipant,
    ReadingQuizSession,
    ReadingQuizSubmission,
    ReadingSemesterRound,
    ReadingTeam,
    ReadingUser,
    ReadingVoteOption,
    ReadingVoteRound,
)
from app.domains.reading.schema_reading import (
    TEAM_MAX_MEMBERS,
    ReadingAdminUserResponse,
    ReadingAppSettingsResponse,
    ReadingAppSettingsUpdate,
    ReadingBookOfMonthResponse,
    ReadingBookResponse,
    ReadingBookWrite,
    ReadingLiveAnswerOption,
    ReadingLiveAnswerRequest,
    ReadingLiveHostState,
    ReadingLiveJoinRequest,
    ReadingLivePlayer,
    ReadingLivePlayerState,
    ReadingLiveQuestion,
    ReadingLiveSessionCreate,
    ReadingLiveSummary,
    ReadingLiveTeamScore,
    ReadingLoginRequest,
    ReadingProfileStatsResponse,
    ReadingProgressUpdate,
    ReadingQuizAnswerResponse,
    ReadingQuizQuestionResponse,
    ReadingQuizResponse,
    ReadingQuizWrite,
    ReadingRegisterRequest,
    ReadingSemesterRoundCreate,
    ReadingSemesterRoundResponse,
    ReadingShelfEntry,
    ReadingTeamCover,
    ReadingTeamCoverUpdate,
    ReadingTeamInviteJoinRequest,
    ReadingTeamInvitePreview,
    ReadingTeamInviteResponse,
    ReadingTeamJoinRequest,
    ReadingTeamMemberProfileResponse,
    ReadingTeamMemberResponse,
    ReadingTeamPaymentAdminResponse,
    ReadingTeamPaymentStatusUpdate,
    ReadingTeamRegistrationResponse,
    ReadingTeamResponse,
    ReadingTeamSummaryResponse,
    ReadingTokenResponse,
    ReadingUserResponse,
    ReadingVoteCastRequest,
    ReadingVoteOptionResult,
    ReadingVoteRoundCreate,
    ReadingVoteRoundResponse,
    ReadingVoteSelectionCreate,
)

TEAM_ENTRY_FEE_TENGE = 3000
TEAM_INVITE_TTL = timedelta(days=7)
RECEIPT_TYPES = {
    "application/pdf": (".pdf", lambda data: data.startswith(b"%PDF")),
    "image/jpeg": (".jpg", lambda data: data.startswith(b"\xff\xd8\xff")),
    "image/png": (".png", lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/webp": (".webp", lambda data: len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"),
}


def _to_user_response(user: ReadingUser, payment_status: str | None = None) -> ReadingUserResponse:
    return ReadingUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        team_name=user.team.name if user.team else None,
        payment_status=payment_status,
        token_balance=user.token_balance,
        current_streak=user.current_streak,
        is_admin=user.is_admin,
        is_captain=user.is_captain,
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
    from app.domains.reading.repo_reading import (
        get_team_registration_by_team_id,
        get_user_by_id,
        touch_user_streak,
    )

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user:
        # A still-valid token for a deleted account: 401 makes the client drop the session and go to login.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your account no longer exists")
    user = await touch_user_streak(user, _today(), db)
    registration = await get_team_registration_by_team_id(user.team_id, db) if user.team_id else None
    return _to_user_response(user, registration.status if registration else None)


async def _load_user_ready_for_team(user_id: str, db: AsyncSession) -> ReadingUser:
    """An account that isn't on any team yet: the only state that may create or join one."""
    from app.domains.reading.repo_reading import get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.team:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You're already on {user.team.name}. A player can only be on one team.",
        )
    return user


async def create_team(user_id: str, payload: ReadingTeamJoinRequest, db: AsyncSession) -> ReadingUserResponse:
    from app.domains.reading.repo_reading import create_team as create_team_record
    from app.domains.reading.repo_reading import get_team_by_name, set_user_team

    user = await _load_user_ready_for_team(user_id, db)
    if await get_team_by_name(payload.team_name, db):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That team name is already taken")

    team = await create_team_record(payload.team_name, db)
    user = await set_user_team(user, team.id, is_captain=True, db=db)
    return _to_user_response(user)


def _active_invite_team(team: ReadingTeam | None) -> ReadingTeam:
    if not team or not team.invite_expires_at or team.invite_expires_at < datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This invite link is invalid or has expired")
    return team


async def preview_team_invite(token: str, db: AsyncSession) -> ReadingTeamInvitePreview:
    from app.domains.reading.repo_reading import count_team_members, get_team_by_invite_token, get_team_captain

    team = _active_invite_team(await get_team_by_invite_token(token, db))
    captain = await get_team_captain(team.id, db)
    return ReadingTeamInvitePreview(
        team_name=team.name,
        captain_name=captain.full_name if captain else None,
        member_count=await count_team_members(team.id, db),
        max_members=TEAM_MAX_MEMBERS,
    )


async def join_team(user_id: str, payload: ReadingTeamInviteJoinRequest, db: AsyncSession) -> ReadingUserResponse:
    from app.domains.reading.repo_reading import (
        count_team_members,
        get_team_by_invite_token,
        get_team_registration_by_team_id,
        set_user_team,
    )

    user = await _load_user_ready_for_team(user_id, db)
    team = _active_invite_team(await get_team_by_invite_token(payload.invite_token, db))
    if await count_team_members(team.id, db) >= TEAM_MAX_MEMBERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"{team.name} already has {TEAM_MAX_MEMBERS} players"
        )

    user = await set_user_team(user, team.id, is_captain=False, db=db)
    registration = await get_team_registration_by_team_id(team.id, db)
    return _to_user_response(user, registration.status if registration else None)


async def _load_captain(user_id: str, db: AsyncSession) -> ReadingUser:
    from app.domains.reading.repo_reading import get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")
    if not user.is_captain:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only your team captain can do this")
    return user


async def get_or_create_team_invite(user_id: str, db: AsyncSession) -> ReadingTeamInviteResponse:
    """The team's current invite link, or a fresh one if it has none or it expired."""
    from app.domains.reading.repo_reading import set_team_invite

    team = (await _load_captain(user_id, db)).team
    assert team is not None
    if not team.invite_token or not team.invite_expires_at or team.invite_expires_at < datetime.now(UTC):
        team = await set_team_invite(team, secrets.token_urlsafe(16), datetime.now(UTC) + TEAM_INVITE_TTL, db)
    assert team.invite_token is not None and team.invite_expires_at is not None
    return ReadingTeamInviteResponse(token=team.invite_token, expires_at=team.invite_expires_at)


async def get_my_team(user_id: str, db: AsyncSession) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import get_team_members, get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't joined a team yet")

    members = await get_team_members(user.team_id, db)
    return await _build_team_response(user.team, members, db)


async def rename_my_team(user_id: str, payload: ReadingTeamJoinRequest, db: AsyncSession) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import get_team_by_name, get_team_members, rename_team

    user = await _load_captain(user_id, db)
    assert user.team is not None

    existing = await get_team_by_name(payload.team_name, db)
    if existing and existing.id != user.team_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That team name is already taken")

    team = await rename_team(user.team, payload.team_name, db)
    members = await get_team_members(team.id, db)
    return await _build_team_response(team, members, db)


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
    from app.domains.reading.repo_reading import list_teams_ranked

    rows = await list_teams_ranked(db)
    return [
        ReadingTeamSummaryResponse(
            id=team.id, name=team.name, member_count=member_count, points=points, cover=_to_team_cover(team)
        )
        for team, member_count, points in rows
    ]


async def update_my_team_cover(
    user_id: str, payload: ReadingTeamCoverUpdate, db: AsyncSession
) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import get_team_members, update_team_cover

    user = await _load_captain(user_id, db)
    assert user.team is not None

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
    return await _build_team_response(team, members, db)


def _to_team_cover(team: ReadingTeam) -> ReadingTeamCover:
    return ReadingTeamCover(
        title=team.cover_title,
        color=team.cover_color,  # type: ignore[arg-type]
        pattern=team.cover_pattern,  # type: ignore[arg-type]
        emblem=team.cover_emblem,  # type: ignore[arg-type]
        animation=team.cover_animation,  # type: ignore[arg-type]
    )


async def _build_team_response(
    team: ReadingTeam, members: list[ReadingUser], db: AsyncSession
) -> ReadingTeamResponse:
    from app.domains.reading.repo_reading import count_books_finished_by_all, list_teams_ranked

    rows = await list_teams_ranked(db)
    place = next((i + 1 for i, (row_team, _, _) in enumerate(rows) if row_team.id == team.id), len(rows))
    team_points = next((points for row_team, _, points in rows if row_team.id == team.id), 0)

    books_finished = await count_books_finished_by_all([m.id for m in members], db)

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
                is_captain=m.is_captain,
                created_at=m.created_at,
            )
            for m in members
        ],
        points=team_points,
        books_finished=books_finished,
        place=place,
        teams_total=len(rows),
        cover=_to_team_cover(team),
    )


async def register_team(
    user_id: str, receipt: UploadFile, db: AsyncSession
) -> ReadingTeamRegistrationResponse:
    from app.domains.reading.repo_reading import (
        create_team_registration,
        get_team_members,
        get_team_registration_by_team_id,
        get_user_by_id,
    )

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team_id or not user.team:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Create or join a team before paying")
    if not user.is_captain:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only your team captain can submit the payment")

    existing = await get_team_registration_by_team_id(user.team_id, db)
    if existing and existing.status != "rejected":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A payment receipt has already been submitted for this team",
        )

    receipt_type = receipt.content_type or ""
    receipt_config = RECEIPT_TYPES.get(receipt_type)
    if not receipt_config:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payment receipt must be a PDF, JPG, PNG, or WebP file",
        )

    contents = await receipt.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Payment receipt must be under {settings.max_upload_size_mb}MB",
        )
    if not contents:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Payment receipt is empty")

    extension, signature_matches = receipt_config
    if not signature_matches(contents):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded file does not match its file type",
        )

    upload_dir = Path(settings.upload_dir) / "team-registrations"
    upload_dir.mkdir(parents=True, exist_ok=True)
    receipt_path = upload_dir / f"{uuid.uuid4()}{extension}"
    receipt_path.write_bytes(contents)

    members = await get_team_members(user.team_id, db)
    member_names = [member.full_name for member in members[:3]]
    member_names.extend(["Pending teammate"] * (3 - len(member_names)))
    if existing:
        from app.domains.reading.repo_reading import resubmit_team_registration

        old_receipt_path = Path(existing.receipt_path)
        registration = await resubmit_team_registration(
            existing,
            submitted_by_user_id=user.id,
            member_names=member_names,
            contact_email=user.email,
            payment_description="",
            receipt_path=str(receipt_path),
            receipt_content_type=receipt_type,
            db=db,
        )
        if old_receipt_path != receipt_path:
            old_receipt_path.unlink(missing_ok=True)
    else:
        registration = await create_team_registration(
            team_id=user.team_id,
            submitted_by_user_id=user.id,
            team_name=user.team.name,
            member_1_name=member_names[0],
            member_2_name=member_names[1],
            member_3_name=member_names[2],
            contact_email=user.email,
            contact_phone=None,
            payment_description="",
            amount_tenge=TEAM_ENTRY_FEE_TENGE,
            receipt_path=str(receipt_path),
            receipt_content_type=receipt_type,
            db=db,
        )
    return ReadingTeamRegistrationResponse(
        id=registration.id,
        team_name=registration.team_name,
        payment_description=registration.payment_description,
        amount_tenge=registration.amount_tenge,
        status=registration.status,
        created_at=registration.created_at,
    )


async def _store_refresh_token(user_id: uuid.UUID, token: str, db: AsyncSession) -> None:
    from app.domains.reading.repo_reading import save_refresh_token

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    await save_refresh_token(user_id, token_hash, expires_at, db)


def _vote_winner(round_: ReadingVoteRound, tally: dict[uuid.UUID, int]) -> ReadingVoteOption | None:
    highest = max(tally.values(), default=0)
    leaders = [option for option in round_.options if tally.get(option.id, 0) == highest]
    return leaders[0] if highest and len(leaders) == 1 else None


def _current_vote_selection(rounds: list[ReadingVoteRound]) -> list[ReadingVoteRound]:
    start = next((i for i in range(len(rounds) - 1, -1, -1) if rounds[i].stage == "language"), None)
    return rounds[start:] if start is not None else []


async def create_vote_selection_for_admin(
    user_id: str, payload: ReadingVoteSelectionCreate, db: AsyncSession
) -> list[ReadingVoteRoundResponse]:
    from app.domains.reading.repo_reading import create_vote_round, list_vote_rounds, lock_vote_creation

    await _require_admin(user_id, db)
    await lock_vote_creation(db)
    rounds = await list_vote_rounds(db)
    opens_at = datetime.now(UTC)
    if any(round_.closes_at > opens_at for round_ in rounds):
        raise HTTPException(status_code=409, detail="Wait for the current vote to finish")
    closes_at = opens_at + timedelta(hours=6)
    language = await create_vote_round(
        "language", opens_at, closes_at, [(label, None) for label in payload.language_options], db, commit=False
    )
    genre = await create_vote_round(
        "genre", opens_at, closes_at,
        [(label, None) for label in payload.genre_options], db, commit=False,
    )
    await db.commit()
    return [await _to_vote_round_response(round_, user_id, db) for round_ in (language, genre)]


async def create_vote_round_for_admin(
    user_id: str, payload: ReadingVoteRoundCreate, db: AsyncSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.repo_reading import (
        create_vote_round,
        get_books_by_ids,
        get_vote_tally,
        list_vote_rounds,
        lock_vote_creation,
    )

    await _require_admin(user_id, db)
    if payload.stage != "book":
        raise HTTPException(status_code=422, detail="Start language and genre together using a six-hour selection")
    await lock_vote_creation(db)
    rounds = await list_vote_rounds(db)
    opens_at = datetime.now(UTC)
    if any(round_.closes_at > opens_at for round_ in rounds):
        raise HTTPException(status_code=409, detail="Wait for the current vote to finish")
    selection = _current_vote_selection(rounds)
    winners: dict[str, str] = {}
    for stage in ("language", "genre"):
        previous = next((round_ for round_ in reversed(selection) if round_.stage == stage), None)
        winner = _vote_winner(previous, await get_vote_tally(previous.id, db)) if previous else None
        if not winner:
            raise HTTPException(status_code=409, detail=f"The {stage} vote needs a winner. Start a new selection.")
        winners[stage] = winner.label.casefold()
    previous_book = next((round_ for round_ in reversed(selection) if round_.stage == "book"), None)
    if previous_book and _vote_winner(previous_book, await get_vote_tally(previous_book.id, db)):
        raise HTTPException(status_code=409, detail="This selection already has a book. Start a new selection.")
    unique_ids = list(dict.fromkeys(payload.book_ids or []))
    books = await get_books_by_ids(unique_ids, db)
    if len(books) != len(unique_ids):
        raise HTTPException(status_code=422, detail="Some of those books no longer exist")
    if any(
        (book.language or "").strip().casefold() != winners["language"]
        or (book.genre or "").strip().casefold() != winners["genre"]
        for book in books
    ):
        raise HTTPException(status_code=422, detail="Books must match the winning language and genre")
    closes_at = opens_at + timedelta(hours=payload.duration_hours)
    books_by_id = {book.id: book for book in books}
    options = [(books_by_id[book_id].title[:120], book_id) for book_id in unique_ids]
    round_ = await create_vote_round(payload.stage, opens_at, closes_at, options, db)
    return await _to_vote_round_response(round_, None, db)


async def list_vote_rounds_for_user(user_id: str, db: AsyncSession) -> list[ReadingVoteRoundResponse]:
    from app.domains.reading.repo_reading import list_vote_rounds

    rounds = await list_vote_rounds(db)
    return [await _to_vote_round_response(round_, user_id, db) for round_ in rounds]


async def cast_vote_for_user(
    round_id: str, user_id: str, payload: ReadingVoteCastRequest, db: AsyncSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.repo_reading import (
        cast_vote,
        get_user_by_id,
        get_user_vote,
        get_vote_round_by_id,
        list_vote_rounds,
    )

    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user or not user.team_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join a team before voting")
    try:
        round_uuid = uuid.UUID(round_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Vote round not found") from exc
    round_ = await get_vote_round_by_id(round_uuid, db, for_update=True)
    if not round_:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote round not found")
    now = datetime.now(UTC)
    if now < round_.opens_at:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This voting round has not opened yet")
    if now >= round_.closes_at:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Voting has closed for this round")
    if payload.option_id not in {option.id for option in round_.options}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="That option isn't part of this round")
    if round_.stage == "genre":
        rounds = await list_vote_rounds(db)
        preceding = rounds[:next(i for i, item in enumerate(rounds) if item.id == round_.id)]
        language = next((item for item in reversed(preceding) if item.stage == "language"), None)
        if language is None or not await get_user_vote(language.id, user.id, db):
            raise HTTPException(status_code=409, detail="Choose a language before choosing a genre")

    await cast_vote(round_.id, payload.option_id, uuid.UUID(user_id), db)
    return await _to_vote_round_response(round_, user_id, db)


async def _to_vote_round_response(
    round_: ReadingVoteRound, user_id: str | None, db: AsyncSession
) -> ReadingVoteRoundResponse:
    from app.domains.reading.repo_reading import get_user_vote, get_vote_tally

    tally = await get_vote_tally(round_.id, db)
    total_votes = sum(tally.values())
    now = datetime.now(UTC)
    round_status = "scheduled" if now < round_.opens_at else "open" if now < round_.closes_at else "closed"
    is_open = round_status == "open"

    options = [
        ReadingVoteOptionResult(
            id=option.id,
            label=option.label,
            book_id=option.book_id,
            vote_count=tally.get(option.id, 0),
            percent=round((tally.get(option.id, 0) / total_votes) * 100) if total_votes else 0,
        )
        for option in sorted(round_.options, key=lambda option: (option.label.casefold(), str(option.id)))
    ]

    winner = _vote_winner(round_, tally) if round_status == "closed" else None
    winner_option_id = winner.id if winner else None

    your_vote_option_id = None
    if user_id:
        vote = await get_user_vote(round_.id, uuid.UUID(user_id), db)
        your_vote_option_id = vote.option_id if vote else None

    return ReadingVoteRoundResponse(
        id=round_.id,
        stage=round_.stage,  # type: ignore[arg-type]
        is_open=is_open,
        status=round_status,
        is_tied=round_status == "closed" and total_votes > 0 and winner is None,
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
    from app.domains.reading.repo_reading import create_semester_round, get_app_settings

    await _require_admin(user_id, db)
    round_ = await create_semester_round(payload.index, payload.label, payload.starts_at, payload.ends_at, db)
    settings_row = await get_app_settings(db)
    return _to_semester_round_response(round_, settings_row.season_started)


async def list_semester_rounds_for_user(db: AsyncSession) -> list[ReadingSemesterRoundResponse]:
    from app.domains.reading.repo_reading import get_app_settings, list_semester_rounds

    settings_row = await get_app_settings(db)
    rounds = await list_semester_rounds(db)
    return [_to_semester_round_response(round_, settings_row.season_started) for round_ in rounds]


def _to_semester_round_response(round_: ReadingSemesterRound, season_started: bool) -> ReadingSemesterRoundResponse:
    now = datetime.now(UTC)
    if not season_started or now < round_.starts_at:
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
    from app.domains.reading.repo_reading import update_app_settings

    await _require_admin(user_id, db)
    settings_row = await update_app_settings(payload.leaderboard_enabled, payload.season_started, db)
    return ReadingAppSettingsResponse.model_validate(settings_row)


BOOK_COVER_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
BOOK_COVER_MAX_BYTES = 2 * 1024 * 1024


def _to_book_response(book: ReadingBook) -> ReadingBookResponse:
    cover_url = book.cover_url
    if book.cover_mime:
        # Version by updated_at so a replaced cover never shows a stale cached image.
        cover_url = f"/v1/reading/books/{book.id}/cover?v={int(book.updated_at.timestamp())}"
    return ReadingBookResponse(
        id=book.id,
        title=book.title,
        description=book.description,
        cover_url=cover_url,
        language=book.language,
        genre=book.genre,
        page_count=book.page_count,
    )


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
    book = await create_book(payload, db)
    return _to_book_response(book)


async def update_book_for_admin(
    user_id: str, book_id: str, payload: ReadingBookWrite, db: AsyncSession
) -> ReadingBookResponse:
    from app.domains.reading.repo_reading import update_book

    await _require_admin(user_id, db)
    book = await _get_book_or_404(book_id, db)
    book = await update_book(book, payload, db)
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


async def list_users_for_admin(user_id: str, db: AsyncSession) -> list[ReadingAdminUserResponse]:
    from app.domains.reading.repo_reading import list_users

    await _require_admin(user_id, db)
    today = _today()
    return [
        ReadingAdminUserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            team_name=user.team.name if user.team else None,
            is_admin=user.is_admin,
            current_streak=_effective_streak(user, today),
            last_active_date=user.last_active_date,
            created_at=user.created_at,
        )
        for user in await list_users(db)
    ]


async def list_team_payments_for_admin(
    user_id: str, db: AsyncSession
) -> list[ReadingTeamPaymentAdminResponse]:
    from app.domains.reading.repo_reading import list_team_registrations, list_teams_ranked

    await _require_admin(user_id, db)
    teams = await list_teams_ranked(db)
    registrations = await list_team_registrations(db)
    registrations_by_team = {
        registration.team_id: registration
        for registration in registrations
        if registration.team_id is not None
    }
    return [
        ReadingTeamPaymentAdminResponse(
            team_id=team.id,
            team_name=team.name,
            member_count=member_count,
            payment_id=registration.id if registration else None,
            submitted_by_email=registration.contact_email if registration else None,
            payment_description=registration.payment_description if registration else None,
            amount_tenge=registration.amount_tenge if registration else TEAM_ENTRY_FEE_TENGE,
            receipt_content_type=registration.receipt_content_type if registration else None,
            status=registration.status if registration else None,
            submitted_at=registration.created_at if registration else None,
        )
        for team, member_count, _ in teams
        for registration in [registrations_by_team.get(team.id)]
    ]


async def update_team_payment_status_for_admin(
    user_id: str,
    payment_id: str,
    payload: ReadingTeamPaymentStatusUpdate,
    db: AsyncSession,
) -> ReadingTeamRegistrationResponse:
    from app.domains.reading.repo_reading import (
        get_team_registration_by_id,
        update_team_registration_status,
    )

    await _require_admin(user_id, db)
    registration = await get_team_registration_by_id(uuid.UUID(payment_id), db)
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team payment not found")
    registration = await update_team_registration_status(registration, payload.status, db)
    return ReadingTeamRegistrationResponse(
        id=registration.id,
        team_name=registration.team_name,
        payment_description=registration.payment_description,
        amount_tenge=registration.amount_tenge,
        status=registration.status,
        created_at=registration.created_at,
    )


async def get_team_payment_receipt_for_admin(
    user_id: str, payment_id: str, db: AsyncSession
) -> tuple[Path, str, str]:
    from app.domains.reading.repo_reading import get_team_registration_by_id

    await _require_admin(user_id, db)
    registration = await get_team_registration_by_id(uuid.UUID(payment_id), db)
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team payment not found")
    receipt_path = Path(registration.receipt_path)
    if not receipt_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment receipt file not found")
    return receipt_path, registration.receipt_content_type, registration.team_name


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



async def _current_book_of_month(db: AsyncSession) -> tuple[ReadingBook, int] | None:
    """The winner of the most recent closed book round that had votes, with its share of the vote."""
    from app.domains.reading.repo_reading import get_book, get_vote_tally, list_closed_book_rounds

    for round_ in await list_closed_book_rounds(datetime.now(UTC), db):
        tally = await get_vote_tally(round_.id, db)
        total_votes = sum(tally.values())
        if not total_votes:
            continue
        winner = _vote_winner(round_, tally)
        if winner is None or winner.book_id is None:
            continue
        book = await get_book(winner.book_id, db)
        if book:
            return book, round(tally.get(winner.id, 0) / total_votes * 100)
    return None


async def get_book_of_month_for_user(user_id: str, db: AsyncSession) -> ReadingBookOfMonthResponse | None:
    from app.domains.reading.repo_reading import get_progress_for_users, get_team_members, get_user_by_id

    user = await get_user_by_id(uuid.UUID(user_id), db)
    current = await _current_book_of_month(db)
    if not user or not current:
        return None
    book, chosen_by_percent = current

    member_ids = [m.id for m in await get_team_members(user.team_id, db)] if user.team_id else [user.id]
    pages = await get_progress_for_users(book.id, member_ids, db)
    team_average_percent = 0
    if book.page_count:
        percents = [min(pages.get(member_id, 0), book.page_count) / book.page_count * 100 for member_id in member_ids]
        team_average_percent = round(sum(percents) / len(percents))

    return ReadingBookOfMonthResponse(
        book=_to_book_response(book),
        chosen_by_percent=chosen_by_percent,
        your_page=pages.get(user.id, 0),
        team_average_percent=team_average_percent,
    )


async def update_progress_for_user(
    user_id: str, payload: ReadingProgressUpdate, db: AsyncSession
) -> ReadingBookOfMonthResponse:
    from app.domains.reading.repo_reading import set_progress

    current = await _current_book_of_month(db)
    if not current:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="There's no book of the month yet")
    book, _ = current
    if book.page_count and payload.current_page > book.page_count:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"This book only has {book.page_count} pages"
        )

    await set_progress(uuid.UUID(user_id), book.id, payload.current_page, db)
    result = await get_book_of_month_for_user(user_id, db)
    assert result is not None
    return result


async def get_my_profile_stats(user_id: str, db: AsyncSession) -> ReadingProfileStatsResponse:
    from app.domains.reading.repo_reading import count_votes_by_user, get_user_quiz_totals, list_progress_with_books

    uid = uuid.UUID(user_id)
    shelf = await list_progress_with_books(uid, db)
    quiz_points, quiz_nights, answers_total, answers_correct = await get_user_quiz_totals(uid, db)
    return ReadingProfileStatsResponse(
        quiz_points=quiz_points,
        quiz_nights=quiz_nights,
        answers_total=answers_total,
        answers_correct=answers_correct,
        votes_cast=await count_votes_by_user(uid, db),
        pages_read=sum(progress.current_page for progress, _ in shelf),
        books_finished=sum(
            1 for progress, book in shelf if book.page_count and progress.current_page >= book.page_count
        ),
        shelf=[
            ReadingShelfEntry(book=_to_book_response(book), current_page=progress.current_page, updated_at=progress.updated_at)
            for progress, book in shelf
        ],
    )


SPEED_BONUS_SHARE = 0.5


def _live_phase(session: ReadingQuizSession, now: datetime) -> str:
    """A running question becomes "reveal" on its own once the time limit passes."""
    if session.status == "question" and session.question_started_at is not None:
        question = session.quiz.questions[session.current_index]
        if now >= session.question_started_at + timedelta(seconds=question.time_limit_seconds):
            return "reveal"
    return session.status


def _time_left_ms(session: ReadingQuizSession, now: datetime) -> int:
    if session.status != "question" or session.question_started_at is None:
        return 0
    question = session.quiz.questions[session.current_index]
    deadline = session.question_started_at + timedelta(seconds=question.time_limit_seconds)
    return max(0, int((deadline - now).total_seconds() * 1000))


def _visible_scores(
    session: ReadingQuizSession, phase: str, responses: list[ReadingQuizSubmission]
) -> dict[uuid.UUID, int]:
    """Scores as players should see them: points from a still-running question stay hidden
    until the reveal, otherwise a jump in your score would give the answer away."""
    pending = {r.participant_id: r.points for r in responses} if phase == "question" else {}
    return {p.id: p.score - pending.get(p.id, 0) for p in session.participants}


def _team_scores(session: ReadingQuizSession, scores: dict[uuid.UUID, int]) -> list[ReadingLiveTeamScore]:
    totals: dict[str, int] = {}
    for p in session.participants:
        team_name = p.team.name if p.team else p.user.full_name
        totals[team_name] = totals.get(team_name, 0) + scores[p.id]
    return [
        ReadingLiveTeamScore(team_name=name, score=score)
        for name, score in sorted(totals.items(), key=lambda item: (-item[1], item[0]))
    ]


async def _live_question(
    session: ReadingQuizSession, phase: str, now: datetime, for_host: bool, db: AsyncSession
) -> tuple[ReadingLiveQuestion | None, list[ReadingQuizSubmission]]:
    from app.domains.reading.repo_reading import get_question_responses

    if phase not in ("question", "reveal") or session.current_index < 0:
        return None, []
    question = session.quiz.questions[session.current_index]
    responses = await get_question_responses(session.id, question.id, db)
    revealed = phase == "reveal"
    answers = [
        ReadingLiveAnswerOption(
            id=a.id,
            text=a.text,
            is_correct=a.is_correct if (revealed or for_host) else None,
            picked_count=sum(r.answer_id == a.id for r in responses) if for_host else None,
        )
        for a in question.answers
    ]
    return (
        ReadingLiveQuestion(
            index=session.current_index,
            total=len(session.quiz.questions),
            text=question.text,
            points=question.points,
            time_limit_seconds=question.time_limit_seconds,
            time_left_ms=_time_left_ms(session, now) if phase == "question" else 0,
            answers=answers,
        ),
        responses,
    )


async def _get_session_or_404(session_id: str, db: AsyncSession) -> ReadingQuizSession:
    from app.domains.reading.repo_reading import get_quiz_session

    session = await get_quiz_session(uuid.UUID(session_id), db)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz session not found")
    return session


async def start_live_session_for_admin(
    user_id: str, payload: ReadingLiveSessionCreate, db: AsyncSession
) -> ReadingLiveSummary:
    from app.domains.reading.repo_reading import create_quiz_session, finish_active_sessions, get_quiz_session

    await _require_admin(user_id, db)
    quiz = await _get_quiz_or_404(str(payload.quiz_id), db)
    if not quiz.questions:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Add questions before going live")

    # One live quiz at a time keeps "join the live quiz" unambiguous for students.
    await finish_active_sessions(db)
    pin = f"{secrets.randbelow(1_000_000):06d}"
    session_id = await create_quiz_session(quiz.id, pin, db)
    session = await get_quiz_session(session_id, db)
    assert session is not None
    return ReadingLiveSummary(id=session.id, pin=session.pin, quiz_title=quiz.title, phase="lobby")


async def advance_live_session_for_admin(user_id: str, session_id: str, db: AsyncSession) -> ReadingLiveHostState:
    from app.domains.reading.repo_reading import set_quiz_session_phase

    await _require_admin(user_id, db)
    session = await _get_session_or_404(session_id, db)
    now = datetime.now(UTC)
    phase = _live_phase(session, now)
    total = len(session.quiz.questions)

    if phase == "lobby":
        await set_quiz_session_phase(session, "question", 0, now, db)
    elif phase == "question":
        await set_quiz_session_phase(session, "reveal", session.current_index, session.question_started_at, db)
    elif phase == "reveal" and session.current_index + 1 < total:
        await set_quiz_session_phase(session, "question", session.current_index + 1, now, db)
    elif phase == "reveal":
        await set_quiz_session_phase(session, "finished", session.current_index, None, db)

    return await get_live_host_state_for_admin(user_id, session_id, db)


async def get_live_host_state_for_admin(user_id: str, session_id: str, db: AsyncSession) -> ReadingLiveHostState:
    await _require_admin(user_id, db)
    db.expire_all()
    session = await _get_session_or_404(session_id, db)
    now = datetime.now(UTC)
    phase = _live_phase(session, now)
    question, responses = await _live_question(session, phase, now, True, db)
    scores = _visible_scores(session, phase, responses)
    players = sorted(session.participants, key=lambda p: (-scores[p.id], p.joined_at))
    return ReadingLiveHostState(
        id=session.id,
        pin=session.pin,
        quiz_title=session.quiz.title,
        phase=phase,  # type: ignore[arg-type]
        players=[
            ReadingLivePlayer(name=p.user.full_name, team_name=p.team.name if p.team else None, score=scores[p.id])
            for p in players
        ],
        question=question,
        answered_count=len(responses),
        team_scores=_team_scores(session, scores),
    )


async def get_active_live_session(db: AsyncSession) -> ReadingLiveSummary | None:
    from app.domains.reading.repo_reading import get_active_quiz_session

    session = await get_active_quiz_session(db)
    if not session:
        return None
    return ReadingLiveSummary(
        id=session.id,
        pin=session.pin,
        quiz_title=session.quiz.title,
        phase=_live_phase(session, datetime.now(UTC)),  # type: ignore[arg-type]
    )


async def join_live_session(user_id: str, payload: ReadingLiveJoinRequest, db: AsyncSession) -> ReadingLiveSummary:
    from app.domains.reading.repo_reading import add_quiz_participant, get_active_quiz_session, get_user_by_id

    session = await get_active_quiz_session(db, pin=payload.pin)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No live quiz with that PIN")
    user = await get_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not any(p.user_id == user.id for p in session.participants):
        try:
            await add_quiz_participant(session.id, user.id, user.team_id, db)
        except IntegrityError:
            await db.rollback()  # joined twice at the same moment — already in, carry on
    return ReadingLiveSummary(
        id=session.id,
        pin=session.pin,
        quiz_title=session.quiz.title,
        phase=_live_phase(session, datetime.now(UTC)),  # type: ignore[arg-type]
    )


def _find_participant(session: ReadingQuizSession, user_id: str) -> ReadingQuizParticipant:
    participant = next((p for p in session.participants if str(p.user_id) == user_id), None)
    if not participant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join the quiz with its PIN first")
    return participant


async def get_live_player_state(user_id: str, session_id: str, db: AsyncSession) -> ReadingLivePlayerState:
    db.expire_all()
    session = await _get_session_or_404(session_id, db)
    participant = _find_participant(session, user_id)
    now = datetime.now(UTC)
    phase = _live_phase(session, now)
    question, responses = await _live_question(session, phase, now, False, db)
    mine = next((r for r in responses if r.participant_id == participant.id), None)
    scores = _visible_scores(session, phase, responses)
    ranking = sorted(session.participants, key=lambda p: (-scores[p.id], p.joined_at))
    return ReadingLivePlayerState(
        id=session.id,
        quiz_title=session.quiz.title,
        phase=phase,  # type: ignore[arg-type]
        player_count=len(session.participants),
        question=question,
        your_answer_id=mine.answer_id if mine else None,
        your_points_this_question=(mine.points if mine else 0) if phase == "reveal" else None,
        your_score=scores[participant.id],
        your_rank=ranking.index(participant) + 1,
        team_scores=_team_scores(session, scores),
    )


async def answer_live_question(
    user_id: str, session_id: str, payload: ReadingLiveAnswerRequest, db: AsyncSession
) -> ReadingLivePlayerState:
    from app.domains.reading.repo_reading import record_quiz_response

    session = await _get_session_or_404(session_id, db)
    participant = _find_participant(session, user_id)
    now = datetime.now(UTC)
    if _live_phase(session, now) != "question" or session.question_started_at is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Time's up for this question")

    question = session.quiz.questions[session.current_index]
    answer = next((a for a in question.answers if a.id == payload.answer_id), None)
    if not answer:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="That answer isn't part of this question")

    elapsed = (now - session.question_started_at).total_seconds()
    speed = max(0.0, 1 - elapsed / question.time_limit_seconds)
    points = round(question.points * ((1 - SPEED_BONUS_SHARE) + SPEED_BONUS_SHARE * speed)) if answer.is_correct else 0
    try:
        await record_quiz_response(participant, question.id, answer.id, answer.is_correct, points, db)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already answered this question") from exc
    return await get_live_player_state(user_id, session_id, db)
