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
    ReadingQuizQuestion,
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


async def get_or_create_team(name: str, db: AsyncSession) -> ReadingTeam:
    team = await get_team_by_name(name, db)
    if team:
        return team
    return await create_team(name, db)


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


async def list_teams_with_member_counts(db: AsyncSession) -> list[tuple[ReadingTeam, int]]:
    member_count = func.count(ReadingUser.id).label("member_count")
    result = await db.execute(
        select(ReadingTeam, member_count)
        .outerjoin(ReadingUser, ReadingUser.team_id == ReadingTeam.id)
        .group_by(ReadingTeam.id)
        .order_by(member_count.desc(), ReadingTeam.name.asc())
    )
    return [(row[0], row[1]) for row in result.all()]


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


async def create_team_member_record(
    email: str, hashed_password: str, full_name: str, team_id: uuid.UUID, db: AsyncSession
) -> ReadingUser:
    user = ReadingUser(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        team_id=team_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user, attribute_names=["team"])
    return user


async def set_user_team(user: ReadingUser, team_id: uuid.UUID, db: AsyncSession) -> ReadingUser:
    user.team_id = team_id
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
    team_name: str,
    member_1_name: str,
    member_2_name: str,
    member_3_name: str,
    contact_email: str,
    contact_phone: str | None,
    receipt_path: str,
    db: AsyncSession,
) -> ReadingTeamRegistration:
    registration = ReadingTeamRegistration(
        team_name=team_name,
        member_1_name=member_1_name,
        member_2_name=member_2_name,
        member_3_name=member_3_name,
        contact_email=contact_email,
        contact_phone=contact_phone,
        receipt_path=receipt_path,
    )
    db.add(registration)
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


async def set_leaderboard_enabled(enabled: bool, db: AsyncSession) -> ReadingAppSettings:
    settings_row = await get_app_settings(db)
    settings_row.leaderboard_enabled = enabled
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
