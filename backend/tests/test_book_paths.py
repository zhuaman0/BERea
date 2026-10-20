from __future__ import annotations

from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domains.auth.service_auth import create_access_token
from app.domains.reading import repo_reading as repo
from app.domains.reading.model_reading import (
    ReadingBook,
    ReadingBookPart,
    ReadingBookPartAnswer,
    ReadingBookPartCompletion,
    ReadingBookPartQuestion,
    ReadingUser,
)
from app.domains.reading.router_reading import router


@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncIterator[AsyncClient]:
    app = FastAPI()
    app.include_router(router, prefix="/api/v1/reading")

    async def test_db() -> AsyncIterator[AsyncSession]:
        yield db

    app.dependency_overrides[get_db] = test_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1/reading/") as test_client:
        yield test_client


def auth(user: ReadingUser) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(str(user.id))}"}


@pytest.mark.asyncio
async def test_admin_creates_book_parts_and_editor_returns_answers(
    client: AsyncClient,
    voters: tuple[ReadingUser, ReadingUser],
) -> None:
    admin, _ = voters
    created = await client.post(
        "books",
        headers=auth(admin),
        json={
            "title": "Fahrenheit 451",
            "description": "",
            "cover_url": None,
            "language": "English",
            "genre": "Classic",
            "page_count": 256,
            "parts": [
                {
                    "title": "The Hearth and the Salamander",
                    "points_reward": 100,
                    "questions": [
                        {
                            "text": "Who is the protagonist?",
                            "answers": [
                                {"text": "Guy Montag", "is_correct": True},
                                {"text": "Clarisse", "is_correct": False},
                            ],
                        }
                    ],
                }
            ],
        },
    )
    assert created.status_code == 201
    assert created.json()["part_count"] == 1
    assert "parts" not in created.json()

    editor = await client.get(f"books/{created.json()['id']}/editor", headers=auth(admin))
    assert editor.status_code == 200
    assert editor.json()["parts"][0]["questions"][0]["answers"][0]["is_correct"] is True


@pytest_asyncio.fixture
async def path_book(db: AsyncSession) -> tuple[ReadingBook, list[ReadingBookPart]]:
    book = ReadingBook(
        title="Fahrenheit 451",
        parts=[
            ReadingBookPart(
                position=index,
                title=f"Part {index + 1}",
                points_reward=(index + 1) * 50,
                questions=[
                    ReadingBookPartQuestion(
                        position=0,
                        text=f"Question {index + 1}",
                        answers=[
                            ReadingBookPartAnswer(position=0, text="Correct", is_correct=True),
                            ReadingBookPartAnswer(position=1, text="Wrong", is_correct=False),
                        ],
                    )
                ],
            )
            for index in range(3)
        ],
    )
    db.add(book)
    await db.commit()
    return book, list(book.parts)


@pytest.mark.asyncio
async def test_only_captain_sees_and_advances_book_path(
    client: AsyncClient,
    db: AsyncSession,
    voters: tuple[ReadingUser, ReadingUser],
    path_book: tuple[ReadingBook, list[ReadingBookPart]],
) -> None:
    admin, captain = voters
    captain.is_captain = True
    await db.commit()
    book, parts = path_book

    member_view = await client.get(f"books/{book.id}/path", headers=auth(admin))
    assert member_view.status_code == 200
    assert member_view.json()["is_captain"] is False
    assert member_view.json()["parts"] == []

    first_view = await client.get(f"books/{book.id}/path", headers=auth(captain))
    assert first_view.status_code == 200
    assert [part["status"] for part in first_view.json()["parts"]] == ["available", "locked", "locked"]
    assert first_view.json()["parts"][1]["questions"] == []

    locked = await client.post(
        f"books/{book.id}/parts/{parts[1].id}/complete",
        headers=auth(captain),
        json={"answers": [{"question_id": str(parts[1].questions[0].id), "answer_id": str(parts[1].questions[0].answers[0].id)}]},
    )
    assert locked.status_code == 409

    wrong_answer = parts[0].questions[0].answers[1]
    reviewed = await client.post(
        f"books/{book.id}/parts/{parts[0].id}/complete",
        headers=auth(captain),
        json={"answers": [{"question_id": str(parts[0].questions[0].id), "answer_id": str(wrong_answer.id)}]},
    )
    assert reviewed.status_code == 200
    attempt = reviewed.json()
    assert attempt["passed"] is False
    assert attempt["score"] == 0
    assert attempt["points_awarded"] == 0
    assert attempt["review"] == [{
        "question_id": str(parts[0].questions[0].id),
        "question_text": "Question 1",
        "selected_answer_id": str(wrong_answer.id),
        "selected_answer_text": "Wrong",
        "correct_answer_id": str(parts[0].questions[0].answers[0].id),
        "correct_answer_text": "Correct",
        "is_correct": False,
    }]
    assert [part["status"] for part in attempt["path"]["parts"]] == ["available", "locked", "locked"]
    assert await db.scalar(select(func.count(ReadingBookPartCompletion.id))) == 0

    # Results saved by the old buggy behavior are ignored and can be replaced by a valid retry.
    await repo.complete_book_part(parts[0].id, captain.team_id, captain.id, 0, 50, db)
    stale = await client.get(f"books/{book.id}/path", headers=auth(captain))
    assert [part["status"] for part in stale.json()["parts"]] == ["available", "locked", "locked"]
    assert stale.json()["total_points"] == 0

    completed = await client.post(
        f"books/{book.id}/parts/{parts[0].id}/complete",
        headers=auth(captain),
        json={"answers": [{"question_id": str(parts[0].questions[0].id), "answer_id": str(parts[0].questions[0].answers[0].id)}]},
    )
    assert completed.status_code == 200
    completed_attempt = completed.json()
    assert completed_attempt["passed"] is True
    assert completed_attempt["score"] == 100
    assert completed_attempt["points_awarded"] == 50
    assert completed_attempt["review"][0]["is_correct"] is True
    assert [part["status"] for part in completed_attempt["path"]["parts"]] == ["completed", "available", "locked"]
    assert completed_attempt["path"]["parts"][0]["score"] == 100
    assert await db.scalar(select(func.count(ReadingBookPartCompletion.id))) == 1
    assert completed_attempt["path"]["total_points"] == 50

    repeated = await client.post(
        f"books/{book.id}/parts/{parts[0].id}/complete",
        headers=auth(captain),
        json={"answers": [{"question_id": str(parts[0].questions[0].id), "answer_id": str(parts[0].questions[0].answers[0].id)}]},
    )
    assert repeated.status_code == 200
    assert await db.scalar(select(func.count(ReadingBookPartCompletion.id))) == 1


@pytest.mark.asyncio
async def test_captain_finishes_every_part_and_gets_victory(
    client: AsyncClient,
    db: AsyncSession,
    voters: tuple[ReadingUser, ReadingUser],
    path_book: tuple[ReadingBook, list[ReadingBookPart]],
) -> None:
    _, captain = voters
    captain.is_captain = True
    await db.commit()
    book, parts = path_book

    response = None
    for part in parts:
        question = part.questions[0]
        response = await client.post(
            f"books/{book.id}/parts/{part.id}/complete",
            headers=auth(captain),
            json={"answers": [{"question_id": str(question.id), "answer_id": str(question.answers[0].id)}]},
        )
        assert response.status_code == 200

    assert response is not None
    result = response.json()["path"]
    assert result["is_complete"] is True
    assert result["completed_parts"] == 3
    assert result["total_points"] == 300
    assert all(part["score"] == 100 for part in result["parts"])
