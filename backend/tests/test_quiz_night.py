from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.reading import repo_reading as repo
from app.domains.reading import service_quiz_night as night
from app.domains.reading import service_reading as service
from app.domains.reading.model_reading import ReadingQuizQuestion, ReadingTeam, ReadingUser
from app.domains.reading.schema_reading import (
    ReadingLiveJoinRequest,
    ReadingLiveSessionCreate,
    ReadingNightGradeWrite,
    ReadingNightTeamAnswerWrite,
    ReadingQuizQuestionWrite,
    ReadingQuizWrite,
)

T0 = datetime(2026, 10, 31, 19, 0, tzinfo=UTC)


def open_question(round_number: int, text: str, correct: str, accepted: list[str] | None = None) -> ReadingQuizQuestionWrite:
    return ReadingQuizQuestionWrite(
        text=text,
        time_limit_seconds=30,
        points=1,
        kind="open",
        round_number=round_number,
        correct_text=correct,
        accepted_answers=accepted or [],
        quote="pass the meridian ==seventy-nine== times",
    )


def plan_of(sizes: list[int], seconds: int = 30) -> night.NightPlan:
    questions = []
    position = 0
    for round_number, size in enumerate(sizes, start=1):
        for _ in range(size):
            questions.append(
                ReadingQuizQuestion(
                    id=uuid.uuid4(), position=position, text="Q", time_limit_seconds=seconds, points=1,
                    round_number=round_number, kind="open", correct_text="A",
                )
            )
            position += 1
    return night.NightPlan(questions)


# ── Answer matching ──────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "answer",
    ["79", "79 days", "Seventy-nine days", "seventy nine", "  SEVENTY-NINE!  ", "the 79 days"],
)
def test_matches_number_answers(answer: str) -> None:
    assert night.answer_matches(answer, ["Seventy-nine days", "79"])


@pytest.mark.parametrize("answer", ["80", "eighty days", "", "it was not seventy nine but way more days"])
def test_rejects_wrong_or_rambling_answers(answer: str) -> None:
    assert not night.answer_matches(answer, ["Seventy-nine days", "79"])


def test_matches_cyrillic_case_and_yo() -> None:
    assert night.answer_matches("Аллахабад", ["аллахабад"])
    assert night.answer_matches("ЁЛКА", ["елка"])


def test_matches_names_with_punctuation() -> None:
    assert night.answer_matches("By the Treaty of Nankin.", ["Treaty of Nankin"])


# ── Phase machine ────────────────────────────────────────────────────────────


def test_timed_phases_run_on_their_own() -> None:
    plan = plan_of([2])
    start = night.NightCursor("round_intro", 1, 1, T0)
    assert night.resolve(start, plan, T0 + timedelta(seconds=2)).phase == "round_intro"
    assert night.resolve(start, plan, T0 + timedelta(seconds=3)).phase == "number"
    question = night.resolve(start, plan, T0 + timedelta(seconds=7))
    assert (question.phase, question.question_number) == ("question", 1)
    # 3 s intro + 3 s number + 30 s question → locked, then the next number.
    assert night.resolve(start, plan, T0 + timedelta(seconds=36)).phase == "locked"
    second = night.resolve(start, plan, T0 + timedelta(seconds=38))
    assert (second.phase, second.question_number) == ("number", 2)
    # After the last question locks, the night waits for the host on the ANSWERS break.
    assert night.resolve(start, plan, T0 + timedelta(hours=1)).phase == "answers_intro"


def test_review_runs_back_to_the_board() -> None:
    plan = plan_of([2, 1])
    close_last = night.NightCursor("review_close", 1, 2, T0)
    board = night.resolve(close_last, plan, T0 + timedelta(seconds=2))
    assert (board.phase, board.round_number) == ("board", 1)
    assert night.round_status(board, 1) == "done"
    assert night.round_status(board, 2) == "current"


def test_answers_stay_hidden_until_their_review() -> None:
    during_question = night.NightCursor("question", 1, 2, T0)
    assert not night.is_revealed(during_question, 1, 1)
    reviewing_q1 = night.NightCursor("review_question", 1, 1, T0)
    assert not night.is_revealed(reviewing_q1, 1, 1)
    answer_q1 = night.NightCursor("review_answer", 1, 1, T0)
    assert night.is_revealed(answer_q1, 1, 1)
    assert not night.is_revealed(answer_q1, 1, 2)
    next_round = night.NightCursor("question", 2, 1, T0)
    assert night.is_revealed(next_round, 1, 2)


def test_rounds_format_requires_open_questions_without_gaps() -> None:
    with pytest.raises(ValidationError):
        ReadingQuizWrite(title="Night", month_label="Oct", format="rounds", questions=[open_question(2, "Q", "A")])
    with pytest.raises(ValidationError):
        ReadingQuizQuestionWrite(text="Q", time_limit_seconds=30, points=1, kind="open", round_number=1)


# ── Full flow against PostgreSQL ─────────────────────────────────────────────


def freeze(monkeypatch: pytest.MonkeyPatch, clock: list[datetime]) -> None:
    class FixedDateTime(datetime):
        @classmethod
        def now(cls, tz: object = None) -> datetime:
            return clock[0]

    monkeypatch.setattr(night, "datetime", FixedDateTime)
    monkeypatch.setattr(service, "datetime", FixedDateTime)


@pytest.mark.asyncio
async def test_quiz_night_round_scores_each_team_once(
    db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], monkeypatch: pytest.MonkeyPatch
) -> None:
    admin, student = voters
    rival_team = ReadingTeam(name="QA Night Rivals")
    db.add(rival_team)
    await db.flush()
    rival = ReadingUser(email="qa-night-rival-verify@gmail.com", full_name="QA Rival", hashed_password="unused", team_id=rival_team.id)
    db.add(rival)
    await db.commit()
    admin_id, student_id, rival_id = str(admin.id), str(student.id), str(rival.id)

    clock = [T0]
    freeze(monkeypatch, clock)
    quiz = await service.save_quiz_for_admin(
        admin_id,
        None,
        ReadingQuizWrite(
            title="Around the World",
            month_label="October",
            format="rounds",
            questions=[
                open_question(1, "In how many days?", "Seventy-nine days", ["79"]),
                open_question(1, "Which city?", "Allahabad"),
            ],
        ),
        db,
    )
    summary = await service.start_live_session_for_admin(admin_id, ReadingLiveSessionCreate(quiz_id=quiz.id), db)
    assert summary.format == "rounds"
    session_id = str(summary.id)
    for user_id in (student_id, rival_id):
        await service.join_live_session(user_id, ReadingLiveJoinRequest(pin=summary.pin), db)

    # Instant-quiz endpoints refuse a quiz night.
    with pytest.raises(HTTPException) as instant:
        await service.get_live_player_state(student_id, session_id, db)
    assert instant.value.status_code == 409

    await night.advance_night(admin_id, session_id, db)  # lobby → board
    state = await night.advance_night(admin_id, session_id, db)  # board → round 1 intro
    assert state.phase == "round_intro"

    q1, q2 = (q.id for q in quiz.questions)
    with pytest.raises(HTTPException):
        await night.save_team_answer(student_id, session_id, ReadingNightTeamAnswerWrite(question_id=q1, text="79"), db)

    clock[0] = T0 + timedelta(seconds=7)  # question 1 is running
    mine = await night.save_team_answer(student_id, session_id, ReadingNightTeamAnswerWrite(question_id=q1, text="80 days"), db)
    mine = await night.save_team_answer(student_id, session_id, ReadingNightTeamAnswerWrite(question_id=q1, text="79 days"), db)
    assert mine.your_answer is not None and mine.your_answer.text == "79 days"
    assert mine.your_answer.grade is None  # nothing about correctness while playing
    assert mine.reveal is None
    await night.save_team_answer(rival_id, session_id, ReadingNightTeamAnswerWrite(question_id=q1, text="eighty"), db)

    clock[0] = T0 + timedelta(seconds=37)  # just after the lock, inside the grace period
    await night.save_team_answer(rival_id, session_id, ReadingNightTeamAnswerWrite(question_id=q1, text="eighty days"), db)
    clock[0] = T0 + timedelta(seconds=40)
    with pytest.raises(HTTPException):
        await night.save_team_answer(rival_id, session_id, ReadingNightTeamAnswerWrite(question_id=q1, text="79"), db)

    clock[0] = T0 + timedelta(seconds=45)  # question 2 is running
    await night.save_team_answer(rival_id, session_id, ReadingNightTeamAnswerWrite(question_id=q2, text="Alahabad"), db)

    clock[0] = T0 + timedelta(minutes=5)
    host = await night.get_night_host_state(admin_id, session_id, db)
    assert host.phase == "answers_intro" and host.marking is not None
    rival_q2 = host.marking[1].answers[0]
    assert rival_q2.auto_grade == "wrong"  # typo: the host decides
    host = await night.grade_team_answer(admin_id, session_id, str(rival_q2.id), ReadingNightGradeWrite(grade="correct"), db)
    assert all(score.score == 0 for score in host.team_scores)  # still hidden

    await night.advance_night(admin_id, session_id, db)  # → review number 1
    await night.advance_night(admin_id, session_id, db)  # → review question 1
    await night.advance_night(admin_id, session_id, db)  # → review answer 1
    player = await night.get_night_player_state(student_id, session_id, db)
    assert player.reveal is not None and player.reveal.correct_text == "Seventy-nine days"
    assert player.reveal.correct_team_count == 1
    assert player.your_answer is not None and player.your_answer.grade == "correct"

    with pytest.raises(HTTPException):  # marking is closed once answers are shown
        await night.grade_team_answer(admin_id, session_id, str(rival_q2.id), ReadingNightGradeWrite(grade="wrong"), db)

    for _ in range(5):  # close 1 → number 2 → question 2 → answer 2 → close 2 → board
        await night.advance_night(admin_id, session_id, db)
    board = await night.advance_night(admin_id, session_id, db)
    assert board.phase == "board"
    assert {s.team_name: s.score for s in board.team_scores} == {"QA Vote Tests": 1, "QA Night Rivals": 1}

    finished = await night.advance_night(admin_id, session_id, db)
    assert finished.phase == "finished"
    await night.advance_night(admin_id, session_id, db)  # pressing again doesn't score twice
    ranked = {team.name: points for team, _, points in await repo.list_teams_ranked(db)}
    assert ranked["QA Vote Tests"] == 1
    assert ranked["QA Night Rivals"] == 1
