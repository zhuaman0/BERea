from __future__ import annotations

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, undefer

from app.domains.reading.model_reading import (
    ReadingAppSettings,
    ReadingBook,
    ReadingProgress,
    ReadingQuiz,
    ReadingQuizAnswer,
    ReadingQuizParticipant,
    ReadingQuizQuestion,
    ReadingQuizSession,
    ReadingQuizSubmission,
    ReadingRefreshToken,
    ReadingSemesterRound,
    ReadingTeam,
    ReadingTeamRegistration,
    ReadingUser,
    ReadingVote,
    ReadingVoteOption,
    ReadingVoteRound,
)
from app.domains.reading.schema_reading import ReadingBookWrite, ReadingQuizQuestionWrite, ReadingQuizWrite

APP_SETTINGS_ROW_ID = 1


async def get_user_by_email(email: str, db: AsyncSession) -> ReadingUser | None:
    result = await db.execute(
        select(ReadingUser)
        .where(ReadingUser.email == email)
        .options(selectinload(ReadingUser.team))
    )
    return result.scalar_one_or_none()


async def get_user_by_id(user_id: uuid.UUID, db: AsyncSession) -> ReadingUser | None:
    result = await db.execute(
        select(ReadingUser)
        .where(ReadingUser.id == user_id)
        .options(selectinload(ReadingUser.team))
    )
    return result.scalar_one_or_none()


async def get_team_by_name(name: str, db: AsyncSession) -> ReadingTeam | None:
    result = await db.execute(select(ReadingTeam).where(ReadingTeam.name == name))
    return result.scalar_one_or_none()


async def create_team(name: str, db: AsyncSession) -> ReadingTeam:
    team = ReadingTeam(name=name)
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return team


async def get_team_by_invite_token(token: str, db: AsyncSession) -> ReadingTeam | None:
    result = await db.execute(select(ReadingTeam).where(ReadingTeam.invite_token == token))
    return result.scalar_one_or_none()


async def set_team_invite(team: ReadingTeam, token: str, expires_at: datetime, db: AsyncSession) -> ReadingTeam:
    team.invite_token = token
    team.invite_expires_at = expires_at
    await db.commit()
    await db.refresh(team)
    return team


async def get_team_captain(team_id: uuid.UUID, db: AsyncSession) -> ReadingUser | None:
    result = await db.execute(
        select(ReadingUser).where(ReadingUser.team_id == team_id, ReadingUser.is_captain.is_(True))
    )
    return result.scalars().first()


async def get_team_by_id(team_id: uuid.UUID, db: AsyncSession) -> ReadingTeam | None:
    result = await db.execute(select(ReadingTeam).where(ReadingTeam.id == team_id))
    return result.scalar_one_or_none()


async def count_team_members(team_id: uuid.UUID, db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count()).select_from(ReadingUser).where(ReadingUser.team_id == team_id)
    )
    return result.scalar_one()


async def get_team_members(team_id: uuid.UUID, db: AsyncSession) -> list[ReadingUser]:
    result = await db.execute(
        select(ReadingUser).where(ReadingUser.team_id == team_id).order_by(ReadingUser.created_at)
    )
    return list(result.scalars().all())


async def list_teams_ranked(db: AsyncSession) -> list[tuple[ReadingTeam, int, int]]:
    """Every team with its member count and season points (sum of its quiz-night scores),
    best first: points, then roster size, then name."""
    member_counts = (
        select(ReadingUser.team_id, func.count(ReadingUser.id).label("member_count"))
        .group_by(ReadingUser.team_id)
        .subquery()
    )
    team_points = (
        select(ReadingQuizParticipant.team_id, func.sum(ReadingQuizParticipant.score).label("points"))
        .group_by(ReadingQuizParticipant.team_id)
        .subquery()
    )
    member_count = func.coalesce(member_counts.c.member_count, 0)
    points = func.coalesce(team_points.c.points, 0)
    result = await db.execute(
        select(ReadingTeam, member_count, points)
        .outerjoin(member_counts, member_counts.c.team_id == ReadingTeam.id)
        .outerjoin(team_points, team_points.c.team_id == ReadingTeam.id)
        .order_by(points.desc(), member_count.desc(), ReadingTeam.name.asc())
    )
    return [(row[0], int(row[1]), int(row[2])) for row in result.all()]


async def count_books_finished_by_all(user_ids: list[uuid.UUID], db: AsyncSession) -> int:
    """Books that every one of these readers has finished (saved page reached the book's page count)."""
    if not user_ids:
        return 0
    finished_by_all = (
        select(ReadingProgress.book_id)
        .join(ReadingBook, ReadingBook.id == ReadingProgress.book_id)
        .where(
            ReadingProgress.user_id.in_(user_ids),
            ReadingBook.page_count.is_not(None),
            ReadingProgress.current_page >= ReadingBook.page_count,
        )
        .group_by(ReadingProgress.book_id)
        .having(func.count(func.distinct(ReadingProgress.user_id)) == len(user_ids))
        .subquery()
    )
    result = await db.execute(select(func.count()).select_from(finished_by_all))
    return int(result.scalar_one())


async def rename_team(team: ReadingTeam, new_name: str, db: AsyncSession) -> ReadingTeam:
    team.name = new_name
    await db.commit()
    await db.refresh(team)
    return team


async def update_team_cover(
    team: ReadingTeam,
    *,
    title: str | None,
    color: str,
    pattern: str,
    emblem: str,
    animation: str,
    db: AsyncSession,
) -> ReadingTeam:
    team.cover_title = title
    team.cover_color = color
    team.cover_pattern = pattern
    team.cover_emblem = emblem
    team.cover_animation = animation
    await db.commit()
    await db.refresh(team)
    return team


async def create_user_record(
    email: str, hashed_password: str, full_name: str, db: AsyncSession
) -> ReadingUser:
    user = ReadingUser(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user, attribute_names=["team"])
    return user


async def set_user_team(
    user: ReadingUser, team_id: uuid.UUID, *, is_captain: bool, db: AsyncSession
) -> ReadingUser:
    user.team_id = team_id
    user.is_captain = is_captain
    await db.commit()
    await db.refresh(user, attribute_names=["team"])
    return user


async def save_refresh_token(user_id: uuid.UUID, token_hash: str, expires_at: datetime, db: AsyncSession) -> None:
    record = ReadingRefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        created_at=datetime.now(UTC),
    )
    db.add(record)
    await db.commit()


async def get_refresh_token_record(token_hash: str, db: AsyncSession) -> ReadingRefreshToken | None:
    result = await db.execute(
        select(ReadingRefreshToken).where(ReadingRefreshToken.token_hash == token_hash)
    )
    return result.scalar_one_or_none()


async def revoke_token(record: ReadingRefreshToken, db: AsyncSession) -> None:
    record.revoked = True
    await db.commit()


async def create_team_registration(
    team_id: uuid.UUID,
    submitted_by_user_id: uuid.UUID,
    team_name: str,
    member_1_name: str,
    member_2_name: str,
    member_3_name: str,
    contact_email: str,
    contact_phone: str | None,
    payment_description: str,
    amount_tenge: int,
    receipt_path: str,
    receipt_content_type: str,
    db: AsyncSession,
) -> ReadingTeamRegistration:
    registration = ReadingTeamRegistration(
        team_id=team_id,
        submitted_by_user_id=submitted_by_user_id,
        team_name=team_name,
        member_1_name=member_1_name,
        member_2_name=member_2_name,
        member_3_name=member_3_name,
        contact_email=contact_email,
        contact_phone=contact_phone,
        payment_description=payment_description,
        amount_tenge=amount_tenge,
        receipt_path=receipt_path,
        receipt_content_type=receipt_content_type,
    )
    db.add(registration)
    await db.commit()
    await db.refresh(registration)
    return registration


async def get_team_registration_by_team_id(
    team_id: uuid.UUID, db: AsyncSession
) -> ReadingTeamRegistration | None:
    result = await db.execute(
        select(ReadingTeamRegistration).where(ReadingTeamRegistration.team_id == team_id)
    )
    return result.scalar_one_or_none()


async def get_team_registration_by_id(
    registration_id: uuid.UUID, db: AsyncSession
) -> ReadingTeamRegistration | None:
    result = await db.execute(
        select(ReadingTeamRegistration).where(ReadingTeamRegistration.id == registration_id)
    )
    return result.scalar_one_or_none()


async def list_team_registrations(db: AsyncSession) -> list[ReadingTeamRegistration]:
    result = await db.execute(
        select(ReadingTeamRegistration)
        .where(ReadingTeamRegistration.team_id.is_not(None))
        .order_by(ReadingTeamRegistration.created_at.desc())
    )
    return list(result.scalars().all())


async def update_team_registration_status(
    registration: ReadingTeamRegistration, payment_status: str, db: AsyncSession
) -> ReadingTeamRegistration:
    registration.status = payment_status
    await db.commit()
    await db.refresh(registration)
    return registration


async def resubmit_team_registration(
    registration: ReadingTeamRegistration,
    submitted_by_user_id: uuid.UUID,
    member_names: list[str],
    contact_email: str,
    payment_description: str,
    receipt_path: str,
    receipt_content_type: str,
    db: AsyncSession,
) -> ReadingTeamRegistration:
    registration.submitted_by_user_id = submitted_by_user_id
    registration.member_1_name = member_names[0]
    registration.member_2_name = member_names[1]
    registration.member_3_name = member_names[2]
    registration.contact_email = contact_email
    registration.payment_description = payment_description
    registration.receipt_path = receipt_path
    registration.receipt_content_type = receipt_content_type
    registration.status = "pending"
    await db.commit()
    await db.refresh(registration)
    return registration


async def create_vote_round(
    stage: str,
    opens_at: datetime,
    closes_at: datetime,
    options: list[tuple[str, uuid.UUID | None]],
    db: AsyncSession,
) -> ReadingVoteRound:
    round_ = ReadingVoteRound(stage=stage, opens_at=opens_at, closes_at=closes_at)
    db.add(round_)
    await db.flush()
    db.add_all([ReadingVoteOption(round_id=round_.id, label=label, book_id=book_id) for label, book_id in options])
    await db.commit()
    await db.refresh(round_, attribute_names=["options"])
    return round_


async def list_vote_rounds(db: AsyncSession) -> list[ReadingVoteRound]:
    result = await db.execute(
        select(ReadingVoteRound)
        .options(selectinload(ReadingVoteRound.options))
        .order_by(ReadingVoteRound.opens_at.asc())
    )
    return list(result.scalars().all())


async def get_vote_round_by_id(round_id: uuid.UUID, db: AsyncSession) -> ReadingVoteRound | None:
    result = await db.execute(
        select(ReadingVoteRound)
        .where(ReadingVoteRound.id == round_id)
        .options(selectinload(ReadingVoteRound.options))
    )
    return result.scalar_one_or_none()


async def get_vote_tally(round_id: uuid.UUID, db: AsyncSession) -> dict[uuid.UUID, int]:
    result = await db.execute(
        select(ReadingVote.option_id, func.count())
        .where(ReadingVote.round_id == round_id)
        .group_by(ReadingVote.option_id)
    )
    return {row[0]: row[1] for row in result.all()}


async def get_user_vote(round_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> ReadingVote | None:
    result = await db.execute(
        select(ReadingVote).where(ReadingVote.round_id == round_id, ReadingVote.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def cast_vote(round_id: uuid.UUID, option_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> ReadingVote:
    existing = await get_user_vote(round_id, user_id, db)
    if existing:
        existing.option_id = option_id
        existing.created_at = datetime.now(UTC)
        await db.commit()
        await db.refresh(existing)
        return existing

    vote = ReadingVote(
        round_id=round_id, option_id=option_id, user_id=user_id, created_at=datetime.now(UTC)
    )
    db.add(vote)
    await db.commit()
    await db.refresh(vote)
    return vote


async def touch_user_streak(user: ReadingUser, today: date, db: AsyncSession) -> ReadingUser:
    """Updates the user's daily-activity streak if today hasn't already been counted."""
    if user.last_active_date == today:
        return user

    if user.last_active_date is not None and (today - user.last_active_date).days == 1:
        user.current_streak += 1
    else:
        user.current_streak = 1
    user.last_active_date = today

    await db.commit()
    await db.refresh(user)
    return user


async def create_semester_round(
    index: int, label: str, starts_at: datetime, ends_at: datetime, db: AsyncSession
) -> ReadingSemesterRound:
    round_ = ReadingSemesterRound(index=index, label=label, starts_at=starts_at, ends_at=ends_at)
    db.add(round_)
    await db.commit()
    await db.refresh(round_)
    return round_


async def list_semester_rounds(db: AsyncSession) -> list[ReadingSemesterRound]:
    result = await db.execute(select(ReadingSemesterRound).order_by(ReadingSemesterRound.index.asc()))
    return list(result.scalars().all())


async def get_app_settings(db: AsyncSession) -> ReadingAppSettings:
    result = await db.execute(select(ReadingAppSettings).where(ReadingAppSettings.id == APP_SETTINGS_ROW_ID))
    settings_row = result.scalar_one_or_none()
    if settings_row:
        return settings_row

    settings_row = ReadingAppSettings(id=APP_SETTINGS_ROW_ID)
    db.add(settings_row)
    await db.commit()
    await db.refresh(settings_row)
    return settings_row


async def update_app_settings(
    leaderboard_enabled: bool | None, season_started: bool | None, db: AsyncSession
) -> ReadingAppSettings:
    settings_row = await get_app_settings(db)
    if leaderboard_enabled is not None:
        settings_row.leaderboard_enabled = leaderboard_enabled
    if season_started is not None:
        settings_row.season_started = season_started
    await db.commit()
    await db.refresh(settings_row)
    return settings_row


async def list_books(db: AsyncSession) -> list[ReadingBook]:
    result = await db.execute(select(ReadingBook).order_by(ReadingBook.created_at.desc()))
    return list(result.scalars().all())


async def get_book(book_id: uuid.UUID, db: AsyncSession) -> ReadingBook | None:
    result = await db.execute(select(ReadingBook).where(ReadingBook.id == book_id))
    return result.scalar_one_or_none()


async def get_book_with_cover(book_id: uuid.UUID, db: AsyncSession) -> ReadingBook | None:
    result = await db.execute(
        select(ReadingBook).where(ReadingBook.id == book_id).options(undefer(ReadingBook.cover_image))
    )
    return result.scalar_one_or_none()


async def create_book(payload: ReadingBookWrite, db: AsyncSession) -> ReadingBook:
    book = ReadingBook(
        title=payload.title,
        description=payload.description,
        cover_url=payload.cover_url,
        language=payload.language,
        genre=payload.genre,
        page_count=payload.page_count,
    )
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book


async def update_book(book: ReadingBook, payload: ReadingBookWrite, db: AsyncSession) -> ReadingBook:
    book.title = payload.title
    book.description = payload.description
    book.language = payload.language
    book.genre = payload.genre
    book.page_count = payload.page_count
    if payload.cover_url is not None:
        book.cover_url = payload.cover_url
        book.cover_image = None
        book.cover_mime = None
    await db.commit()
    await db.refresh(book)
    return book


async def set_book_cover_image(book: ReadingBook, image: bytes, mime: str, db: AsyncSession) -> ReadingBook:
    book.cover_image = image
    book.cover_mime = mime
    book.cover_url = None
    await db.commit()
    await db.refresh(book)
    return book


async def clear_book_cover(book: ReadingBook, db: AsyncSession) -> ReadingBook:
    book.cover_image = None
    book.cover_mime = None
    book.cover_url = None
    await db.commit()
    await db.refresh(book)
    return book


async def delete_book(book: ReadingBook, db: AsyncSession) -> None:
    await db.delete(book)
    await db.commit()


def _quiz_query() -> Select[tuple[ReadingQuiz]]:
    return select(ReadingQuiz).options(
        selectinload(ReadingQuiz.questions).selectinload(ReadingQuizQuestion.answers)
    )


async def list_quizzes(db: AsyncSession) -> list[ReadingQuiz]:
    result = await db.execute(_quiz_query().order_by(ReadingQuiz.created_at.desc()))
    return list(result.scalars().all())


async def get_quiz(quiz_id: uuid.UUID, db: AsyncSession) -> ReadingQuiz | None:
    result = await db.execute(_quiz_query().where(ReadingQuiz.id == quiz_id))
    return result.scalar_one_or_none()


def _build_questions(questions: list[ReadingQuizQuestionWrite]) -> list[ReadingQuizQuestion]:
    return [
        ReadingQuizQuestion(
            position=i,
            text=q.text,
            time_limit_seconds=q.time_limit_seconds,
            points=q.points,
            answers=[
                ReadingQuizAnswer(position=j, text=a.text, is_correct=a.is_correct) for j, a in enumerate(q.answers)
            ],
        )
        for i, q in enumerate(questions)
    ]


async def save_quiz(quiz: ReadingQuiz | None, payload: ReadingQuizWrite, db: AsyncSession) -> uuid.UUID:
    """Creates the quiz or replaces an existing one's fields and full question list."""
    if quiz is None:
        quiz = ReadingQuiz()
        db.add(quiz)
    quiz.title = payload.title
    quiz.month_label = payload.month_label
    quiz.scheduled_for = payload.scheduled_for
    quiz.status = payload.status
    quiz.questions = _build_questions(payload.questions)
    await db.commit()
    return quiz.id


async def delete_quiz(quiz: ReadingQuiz, db: AsyncSession) -> None:
    await db.delete(quiz)
    await db.commit()


async def get_books_by_ids(book_ids: list[uuid.UUID], db: AsyncSession) -> list[ReadingBook]:
    result = await db.execute(select(ReadingBook).where(ReadingBook.id.in_(book_ids)))
    return list(result.scalars().all())


async def list_closed_book_rounds(now: datetime, db: AsyncSession) -> list[ReadingVoteRound]:
    result = await db.execute(
        select(ReadingVoteRound)
        .where(ReadingVoteRound.stage == "book", ReadingVoteRound.closes_at <= now)
        .options(selectinload(ReadingVoteRound.options))
        .order_by(ReadingVoteRound.closes_at.desc())
    )
    return list(result.scalars().all())


async def get_progress_for_users(
    book_id: uuid.UUID, user_ids: list[uuid.UUID], db: AsyncSession
) -> dict[uuid.UUID, int]:
    result = await db.execute(
        select(ReadingProgress.user_id, ReadingProgress.current_page).where(
            ReadingProgress.book_id == book_id, ReadingProgress.user_id.in_(user_ids)
        )
    )
    return {row[0]: row[1] for row in result.all()}


async def set_progress(user_id: uuid.UUID, book_id: uuid.UUID, current_page: int, db: AsyncSession) -> None:
    result = await db.execute(
        select(ReadingProgress).where(ReadingProgress.user_id == user_id, ReadingProgress.book_id == book_id)
    )
    progress = result.scalar_one_or_none()
    if progress is None:
        db.add(ReadingProgress(user_id=user_id, book_id=book_id, current_page=current_page))
    else:
        progress.current_page = current_page
    await db.commit()


async def list_progress_with_books(user_id: uuid.UUID, db: AsyncSession) -> list[tuple[ReadingProgress, ReadingBook]]:
    result = await db.execute(
        select(ReadingProgress, ReadingBook)
        .join(ReadingBook, ReadingBook.id == ReadingProgress.book_id)
        .where(ReadingProgress.user_id == user_id)
        .order_by(ReadingProgress.updated_at.desc())
    )
    return [(row[0], row[1]) for row in result.all()]


async def get_user_quiz_totals(user_id: uuid.UUID, db: AsyncSession) -> tuple[int, int, int, int]:
    """(points, quiz nights joined, answers given, answers correct) across every live quiz the user played."""
    participants = await db.execute(
        select(func.coalesce(func.sum(ReadingQuizParticipant.score), 0), func.count(ReadingQuizParticipant.id))
        .where(ReadingQuizParticipant.user_id == user_id)
    )
    points, nights = participants.one()
    answers = await db.execute(
        select(func.count(ReadingQuizSubmission.id), func.count().filter(ReadingQuizSubmission.is_correct))
        .join(ReadingQuizParticipant, ReadingQuizParticipant.id == ReadingQuizSubmission.participant_id)
        .where(ReadingQuizParticipant.user_id == user_id)
    )
    total, correct = answers.one()
    return int(points), int(nights), int(total), int(correct)


async def count_votes_by_user(user_id: uuid.UUID, db: AsyncSession) -> int:
    result = await db.execute(select(func.count(ReadingVote.id)).where(ReadingVote.user_id == user_id))
    return int(result.scalar_one())


def _session_query() -> Select[tuple[ReadingQuizSession]]:
    return select(ReadingQuizSession).options(
        selectinload(ReadingQuizSession.quiz)
        .selectinload(ReadingQuiz.questions)
        .selectinload(ReadingQuizQuestion.answers),
        selectinload(ReadingQuizSession.participants).selectinload(ReadingQuizParticipant.user),
        selectinload(ReadingQuizSession.participants).selectinload(ReadingQuizParticipant.team),
    )


async def finish_active_sessions(db: AsyncSession) -> None:
    result = await db.execute(select(ReadingQuizSession).where(ReadingQuizSession.status != "finished"))
    for session in result.scalars().all():
        session.status = "finished"
    await db.commit()


async def create_quiz_session(quiz_id: uuid.UUID, pin: str, db: AsyncSession) -> uuid.UUID:
    session = ReadingQuizSession(quiz_id=quiz_id, pin=pin, status="lobby", current_index=-1)
    db.add(session)
    await db.commit()
    return session.id


async def get_quiz_session(session_id: uuid.UUID, db: AsyncSession) -> ReadingQuizSession | None:
    result = await db.execute(_session_query().where(ReadingQuizSession.id == session_id))
    return result.scalar_one_or_none()


async def get_active_quiz_session(db: AsyncSession, pin: str | None = None) -> ReadingQuizSession | None:
    query = _session_query().where(ReadingQuizSession.status != "finished")
    if pin is not None:
        query = query.where(ReadingQuizSession.pin == pin)
    result = await db.execute(query.order_by(ReadingQuizSession.created_at.desc()).limit(1))
    return result.scalar_one_or_none()


async def set_quiz_session_phase(
    session: ReadingQuizSession, status: str, current_index: int, started_at: datetime | None, db: AsyncSession
) -> None:
    session.status = status
    session.current_index = current_index
    session.question_started_at = started_at
    await db.commit()


async def add_quiz_participant(
    session_id: uuid.UUID, user_id: uuid.UUID, team_id: uuid.UUID | None, db: AsyncSession
) -> None:
    db.add(
        ReadingQuizParticipant(
            session_id=session_id, user_id=user_id, team_id=team_id, score=0, joined_at=datetime.now(UTC)
        )
    )
    await db.commit()


async def get_question_responses(
    session_id: uuid.UUID, question_id: uuid.UUID, db: AsyncSession
) -> list[ReadingQuizSubmission]:
    result = await db.execute(
        select(ReadingQuizSubmission)
        .join(ReadingQuizParticipant, ReadingQuizParticipant.id == ReadingQuizSubmission.participant_id)
        .where(ReadingQuizParticipant.session_id == session_id, ReadingQuizSubmission.question_id == question_id)
    )
    return list(result.scalars().all())


async def record_quiz_response(
    participant: ReadingQuizParticipant,
    question_id: uuid.UUID,
    answer_id: uuid.UUID,
    is_correct: bool,
    points: int,
    db: AsyncSession,
) -> None:
    db.add(
        ReadingQuizSubmission(
            participant_id=participant.id,
            question_id=question_id,
            answer_id=answer_id,
            is_correct=is_correct,
            points=points,
            answered_at=datetime.now(UTC),
        )
    )
    participant.score += points
    await db.commit()
