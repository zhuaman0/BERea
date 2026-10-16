from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.domains.reading import repo_reading as repo
from app.domains.reading import service_reading as service
from app.domains.reading.model_reading import ReadingBook, ReadingUser, ReadingVote, ReadingVoteRound
from app.domains.reading.schema_reading import (
    ReadingVoteCastRequest,
    ReadingVoteRoundCreate,
    ReadingVoteSelectionCreate,
)


def selection_payload() -> ReadingVoteSelectionCreate:
    return ReadingVoteSelectionCreate(
        language_options=["Kazakh", "Russian"], genre_options=["Fiction", "Fantasy"],
    )


def freeze(monkeypatch: pytest.MonkeyPatch, when: datetime) -> None:
    class FixedDateTime(datetime):
        @classmethod
        def now(cls, tz: object = None) -> datetime:
            return when

    monkeypatch.setattr(service, "datetime", FixedDateTime)


@pytest.mark.parametrize("options", [["Kazakh", " kazakh "], ["", "Russian"], ["x" * 121, "Russian"], ["one"], [str(i) for i in range(13)]])
def test_invalid_options(options: list[str]) -> None:
    with pytest.raises(ValidationError):
        ReadingVoteSelectionCreate(language_options=options, genre_options=["Fiction", "Fantasy"])


def test_book_round_requires_catalog_ids() -> None:
    with pytest.raises(ValidationError):
        ReadingVoteRoundCreate(stage="book", options=["Book A", "Book B"])
    book_id = uuid.uuid4()
    with pytest.raises(ValidationError):
        ReadingVoteRoundCreate(stage="book", book_ids=[book_id, book_id])


@pytest.mark.asyncio
@pytest.mark.parametrize("elapsed_hours", [0, 5.5])
async def test_shared_deadline_language_then_genre_without_waiting(
    db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], monkeypatch: pytest.MonkeyPatch, elapsed_hours: float,
) -> None:
    admin, student = voters
    language, genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    assert language.status == genre.status == "open"
    assert language.opens_at == genre.opens_at
    assert language.closes_at == genre.closes_at
    assert genre.closes_at - language.opens_at == timedelta(hours=6)
    freeze(monkeypatch, language.opens_at + timedelta(hours=elapsed_hours))
    with pytest.raises(HTTPException) as rejected:
        await service.cast_vote_for_user(str(genre.id), str(student.id), ReadingVoteCastRequest(option_id=genre.options[0].id), db)
    assert rejected.value.status_code == 409
    assert "language" in rejected.value.detail
    await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=language.options[0].id), db)
    result = await service.cast_vote_for_user(str(genre.id), str(student.id), ReadingVoteCastRequest(option_id=genre.options[0].id), db)
    assert result.total_votes == 1 and result.status == "open"
    # A student arriving near the deadline gets no extra time, and can still revise both choices.
    for round_ in (language, genre):
        changed = await service.cast_vote_for_user(str(round_.id), str(student.id), ReadingVoteCastRequest(option_id=round_.options[1].id), db)
        assert changed.total_votes == 1 and changed.your_vote_option_id == round_.options[1].id
        assert changed.closes_at == language.closes_at
    freeze(monkeypatch, genre.closes_at)
    for round_ in (language, genre):
        with pytest.raises(HTTPException) as rejected:
            await service.cast_vote_for_user(str(round_.id), str(student.id), ReadingVoteCastRequest(option_id=round_.options[0].id), db)
        assert rejected.value.status_code == 409


@pytest.mark.asyncio
async def test_previous_selection_language_does_not_unlock_new_genre(
    db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], monkeypatch: pytest.MonkeyPatch,
) -> None:
    admin, student = voters
    language, genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=language.options[0].id), db)
    freeze(monkeypatch, genre.closes_at)
    _, next_genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    with pytest.raises(HTTPException) as rejected:
        await service.cast_vote_for_user(str(next_genre.id), str(student.id), ReadingVoteCastRequest(option_id=next_genre.options[0].id), db)
    assert rejected.value.status_code == 409


@pytest.mark.asyncio
async def test_permissions_overlap_and_foreign_options(db: AsyncSession, voters: tuple[ReadingUser, ReadingUser]) -> None:
    admin, student = voters
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_selection_for_admin(str(student.id), selection_payload(), db)
    assert rejected.value.status_code == 403
    language, genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    assert rejected.value.status_code == 409
    with pytest.raises(HTTPException) as rejected:
        await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=genre.options[0].id), db)
    assert rejected.value.status_code == 422
    with pytest.raises(HTTPException) as rejected:
        await service.cast_vote_for_user("not-a-uuid", str(student.id), ReadingVoteCastRequest(option_id=language.options[0].id), db)
    assert rejected.value.status_code == 404
    student.team_id = None
    await db.commit()
    with pytest.raises(HTTPException) as rejected:
        await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=language.options[0].id), db)
    assert rejected.value.status_code == 403


@pytest.mark.asyncio
async def test_change_vote_ties_and_no_votes(
    db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], monkeypatch: pytest.MonkeyPatch,
) -> None:
    admin, student = voters
    language, genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    first, second = language.options
    await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=first.id), db)
    changed = await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=second.id), db)
    assert changed.total_votes == 1 and changed.your_vote_option_id == second.id
    assert {option.id: option.vote_count for option in changed.options} == {first.id: 0, second.id: 1}
    await service.cast_vote_for_user(str(language.id), str(admin.id), ReadingVoteCastRequest(option_id=first.id), db)
    freeze(monkeypatch, genre.closes_at)
    closed_language, closed_genre = await service.list_vote_rounds_for_user(str(student.id), db)
    assert closed_language.is_tied and closed_language.winner_option_id is None
    assert not closed_genre.is_tied and closed_genre.winner_option_id is None
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_round_for_admin(str(admin.id), ReadingVoteRoundCreate(stage="book", book_ids=[uuid.uuid4(), uuid.uuid4()]), db)
    assert rejected.value.status_code == 409


async def complete_preferences(
    db: AsyncSession, admin: ReadingUser, student: ReadingUser, monkeypatch: pytest.MonkeyPatch,
) -> None:
    language, genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    language_option = next(option for option in language.options if option.label == "Kazakh")
    genre_option = next(option for option in genre.options if option.label == "Fiction")
    await service.cast_vote_for_user(str(language.id), str(student.id), ReadingVoteCastRequest(option_id=language_option.id), db)
    await service.cast_vote_for_user(str(genre.id), str(student.id), ReadingVoteCastRequest(option_id=genre_option.id), db)
    freeze(monkeypatch, genre.closes_at)


@pytest.mark.asyncio
async def test_book_filter_winner_dashboard_and_new_cycle(
    db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], monkeypatch: pytest.MonkeyPatch,
) -> None:
    admin, student = voters
    await complete_preferences(db, admin, student, monkeypatch)
    books = [ReadingBook(title=f"QA Book {i}", description="", language="Kazakh", genre="Fiction", page_count=200) for i in range(3)]
    books[2].language = "Russian"
    db.add_all(books)
    await db.commit()
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_round_for_admin(str(admin.id), ReadingVoteRoundCreate(stage="book", book_ids=[books[0].id, books[2].id]), db)
    assert rejected.value.status_code == 422
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_round_for_admin(str(admin.id), ReadingVoteRoundCreate(stage="book", book_ids=[books[0].id, uuid.uuid4()]), db)
    assert rejected.value.status_code == 422
    book_round = await service.create_vote_round_for_admin(str(admin.id), ReadingVoteRoundCreate(stage="book", book_ids=[books[0].id, books[1].id]), db)
    choice = next(option for option in book_round.options if option.book_id == books[0].id)
    await service.cast_vote_for_user(str(book_round.id), str(student.id), ReadingVoteCastRequest(option_id=choice.id), db)
    assert await service.get_book_of_month_for_user(str(student.id), db) is None
    freeze(monkeypatch, book_round.closes_at)
    result = await service.get_book_of_month_for_user(str(student.id), db)
    assert result is not None and result.book.id == books[0].id and result.chosen_by_percent == 100
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_round_for_admin(str(admin.id), ReadingVoteRoundCreate(stage="book", book_ids=[books[0].id, books[1].id]), db)
    assert rejected.value.status_code == 409
    _, new_genre = await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), db)
    freeze(monkeypatch, new_genre.closes_at)
    with pytest.raises(HTTPException) as rejected:
        await service.create_vote_round_for_admin(str(admin.id), ReadingVoteRoundCreate(stage="book", book_ids=[books[0].id, books[1].id]), db)
    assert rejected.value.status_code == 409
    assert (await service.get_book_of_month_for_user(str(student.id), db)).book.id == books[0].id


@pytest.mark.asyncio
async def test_concurrent_creation_and_votes(
    db: AsyncSession, vote_engine: AsyncEngine, voters: tuple[ReadingUser, ReadingUser],
) -> None:
    admin, student = voters
    student_id = str(student.id)

    async def start() -> bool:
        async with AsyncSession(vote_engine, expire_on_commit=False) as session:
            try:
                await service.create_vote_selection_for_admin(str(admin.id), selection_payload(), session)
                return True
            except HTTPException as error:
                assert error.status_code == 409
                return False

    assert sorted(await asyncio.gather(start(), start())) == [False, True]
    rounds = await repo.list_vote_rounds(db)
    assert len(rounds) == 2
    language_id = str(rounds[0].id)
    option_ids = [option.id for option in rounds[0].options]
    await db.rollback()

    async def vote(option_id: uuid.UUID) -> None:
        async with AsyncSession(vote_engine, expire_on_commit=False) as session:
            await service.cast_vote_for_user(language_id, student_id, ReadingVoteCastRequest(option_id=option_id), session)

    await asyncio.gather(vote(option_ids[0]), vote(option_ids[1]))
    assert await db.scalar(select(func.count(ReadingVote.id))) == 1
    assert await db.scalar(select(func.count(ReadingVoteRound.id))) == 2
