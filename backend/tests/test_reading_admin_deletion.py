from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domains.auth.service_auth import create_access_token
from app.domains.reading.model_reading import (
    ReadingBook,
    ReadingProgress,
    ReadingQuiz,
    ReadingQuizAnswer,
    ReadingQuizParticipant,
    ReadingQuizQuestion,
    ReadingQuizSession,
    ReadingQuizSubmission,
    ReadingRefreshToken,
    ReadingTeam,
    ReadingTeamRegistration,
    ReadingUser,
    ReadingVote,
    ReadingVoteOption,
    ReadingVoteRound,
)
from app.domains.reading.router_reading import router


@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncIterator[AsyncClient]:
    app = FastAPI()
    app.include_router(router, prefix="/api/v1/reading")

    async def test_db() -> AsyncIterator[AsyncSession]:
        yield db

    app.dependency_overrides[get_db] = test_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1/reading/") as client:
        yield client


def auth(user: ReadingUser) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(str(user.id))}"}


@pytest_asyncio.fixture
async def activity(db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], tmp_path: Path) -> Path:
    _, student = voters
    student.is_captain = True
    now = datetime.now(UTC)
    receipt = tmp_path / "receipt.pdf"
    receipt.write_bytes(b"%PDF test receipt")
    book = ReadingBook(title="Deletion test book")
    quiz = ReadingQuiz(title="Deletion test quiz", month_label="October")
    round_ = ReadingVoteRound(stage="language", opens_at=now, closes_at=now + timedelta(hours=1))
    db.add_all([book, quiz, round_])
    await db.flush()
    question = ReadingQuizQuestion(quiz_id=quiz.id, position=0, text="Question", time_limit_seconds=20, points=10)
    session = ReadingQuizSession(quiz_id=quiz.id, pin="123456")
    option = ReadingVoteOption(round_id=round_.id, label="Kazakh")
    db.add_all([question, session, option])
    await db.flush()
    participant = ReadingQuizParticipant(
        session_id=session.id, user_id=student.id, team_id=student.team_id, score=10, joined_at=now,
    )
    answer = ReadingQuizAnswer(question_id=question.id, position=0, text="Answer", is_correct=True)
    db.add_all([participant, answer])
    await db.flush()
    db.add_all([
        ReadingProgress(user_id=student.id, book_id=book.id, current_page=25),
        ReadingRefreshToken(user_id=student.id, token_hash="test-token", expires_at=now + timedelta(days=1), created_at=now),
        ReadingVote(user_id=student.id, round_id=round_.id, option_id=option.id, created_at=now),
        ReadingQuizSubmission(
            participant_id=participant.id, question_id=question.id, answer_id=answer.id,
            is_correct=True, points=10, answered_at=now,
        ),
        ReadingTeamRegistration(
            team_id=student.team_id, submitted_by_user_id=student.id, team_name="QA Vote Tests",
            member_1_name=student.full_name, member_2_name="Teammate", member_3_name="Pending teammate",
            contact_email=student.email, receipt_path=str(receipt),
        ),
    ])
    await db.commit()
    return receipt


@pytest.mark.asyncio
async def test_delete_captain_cleans_activity_and_promotes_teammate(
    client: AsyncClient, db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], activity: Path,
) -> None:
    admin, student = voters
    student_id, team_id = student.id, student.team_id
    response = await client.delete(f"users/{student_id}", headers=auth(admin))
    assert response.status_code == 204
    assert response.content == b""
    db.expire_all()
    assert await db.get(ReadingUser, student_id) is None
    for model in (ReadingRefreshToken, ReadingProgress, ReadingVote, ReadingQuizParticipant, ReadingQuizSubmission):
        assert await db.scalar(select(model.id)) is None
    await db.refresh(admin)
    assert admin.team_id == team_id and admin.is_captain
    assert await db.get(ReadingTeam, team_id) is not None
    registration = await db.scalar(select(ReadingTeamRegistration))
    assert registration is not None and registration.submitted_by_user_id is None
    assert activity.exists()  # The team's payment is retained when one member leaves.
    assert (await client.get("users", headers=auth(admin))).json()[0]["id"] == str(admin.id)
    assert (await client.get("users", headers={"Authorization": f"Bearer {create_access_token(str(student_id))}"})).status_code == 403


@pytest.mark.asyncio
async def test_delete_team_preserves_accounts_and_individual_results(
    client: AsyncClient, db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], activity: Path,
) -> None:
    admin, student = voters
    team_id = student.team_id
    response = await client.delete(f"teams/{team_id}", headers=auth(admin))
    assert response.status_code == 204 and response.content == b""
    db.expire_all()
    assert await db.get(ReadingTeam, team_id) is None
    assert await db.scalar(select(ReadingTeamRegistration.id)) is None
    assert not activity.exists()
    for user in (admin, student):
        await db.refresh(user)
        assert user.team_id is None and not user.is_captain
    for model in (ReadingRefreshToken, ReadingProgress, ReadingVote, ReadingQuizSubmission):
        assert await db.scalar(select(model.id)) is not None
    participant = await db.scalar(select(ReadingQuizParticipant))
    assert participant is not None and participant.team_id is None and participant.score == 10
    profile = await client.get("users/me", headers=auth(student))
    assert profile.status_code == 200
    assert profile.json()["team_name"] is None and profile.json()["payment_status"] is None
    assert (await client.get("teams", headers=auth(admin))).json() == []
    assert (await client.get("team-payments", headers=auth(admin))).json() == []


@pytest.mark.asyncio
@pytest.mark.parametrize("resource", ["users", "teams"])
async def test_delete_requires_admin_and_valid_target(
    resource: str, client: AsyncClient, db: AsyncSession, voters: tuple[ReadingUser, ReadingUser],
) -> None:
    admin, student = voters
    target_id = student.id if resource == "users" else student.team_id
    path = f"{resource}/{target_id}"
    assert (await client.delete(path)).status_code in (401, 403)
    assert (await client.delete(path, headers=auth(student))).status_code == 403
    assert (await client.delete(f"{resource}/{uuid.uuid4()}", headers=auth(admin))).status_code == 404
    assert (await client.delete(f"{resource}/invalid-id", headers=auth(admin))).status_code == 422
    assert await db.get(ReadingUser if resource == "users" else ReadingTeam, target_id) is not None


@pytest.mark.asyncio
async def test_admin_cannot_delete_own_account(
    client: AsyncClient, db: AsyncSession, voters: tuple[ReadingUser, ReadingUser],
) -> None:
    admin, _ = voters
    response = await client.delete(f"users/{admin.id}", headers=auth(admin))
    assert response.status_code == 409
    assert await db.get(ReadingUser, admin.id) is not None


@pytest.mark.asyncio
@pytest.mark.parametrize("membership", ["member", "without_team", "only_captain"])
async def test_delete_user_with_different_membership(
    membership: str, client: AsyncClient, db: AsyncSession, voters: tuple[ReadingUser, ReadingUser],
) -> None:
    admin, student = voters
    student_id, team_id = student.id, student.team_id
    admin.is_captain = membership == "member"
    if membership == "without_team":
        student.team_id = None
    elif membership == "only_captain":
        admin.team_id = None
        student.is_captain = True
    await db.commit()
    assert (await client.delete(f"users/{student_id}", headers=auth(admin))).status_code == 204
    assert await db.get(ReadingUser, student_id) is None
    await db.refresh(admin)
    assert admin.is_captain == (membership == "member")
    assert await db.get(ReadingTeam, team_id) is not None
    assert (await client.delete(f"users/{student_id}", headers=auth(admin))).status_code == 404
    if membership == "only_captain":
        assert (await client.delete(f"teams/{team_id}", headers=auth(admin))).status_code == 204


@pytest.mark.asyncio
async def test_delete_team_succeeds_when_receipt_is_already_missing(
    client: AsyncClient, db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], activity: Path,
) -> None:
    admin, student = voters
    team_id = student.team_id
    activity.unlink()
    assert (await client.delete(f"teams/{team_id}", headers=auth(admin))).status_code == 204
    assert await db.get(ReadingTeam, team_id) is None
