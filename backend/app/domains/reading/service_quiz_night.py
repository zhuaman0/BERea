"""Quiz night: rounds of open questions, team answers, answers revealed at the end of each round.

The session row stores a cursor (phase, round, question, when the phase started). Timed phases
run out on their own: every read resolves the stored cursor forward to "now", so the host and
every phone agree without anyone having to press a button. See docs/reading/quiz-night-format.md.
"""

from __future__ import annotations

import re
import unicodedata
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.reading.model_reading import (
    ReadingQuizParticipant,
    ReadingQuizQuestion,
    ReadingQuizSession,
    ReadingQuizTeamAnswer,
)
from app.domains.reading.schema_reading import (
    QuizNightGrade,
    QuizNightPhase,
    ReadingNightGradeWrite,
    ReadingNightMarkingAnswer,
    ReadingNightMarkingQuestion,
    ReadingNightQuestion,
    ReadingNightReveal,
    ReadingNightRound,
    ReadingNightState,
    ReadingNightTeamAnswerWrite,
    ReadingNightTeamScore,
    ReadingNightYourAnswer,
)

# Fixed-length phases (the question phase lasts the question's own time limit).
PHASE_DURATIONS = {
    "round_intro": timedelta(seconds=3),
    "number": timedelta(seconds=3),
    "locked": timedelta(seconds=2),
    "review_number": timedelta(seconds=2),
    "review_close": timedelta(milliseconds=1500),
}
# A save still counts this long after the timer hits zero, so the last debounced keystrokes
# of a slow phone aren't lost.
ANSWER_GRACE = timedelta(milliseconds=1500)

REVIEW_PHASES = ("review_number", "review_question", "review_answer", "review_close")


# ── Answer matching ────────────────────────────────────────────────────────────

_ARTICLES = {"the", "a", "an"}
_UNITS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8,
    "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
}
_TENS = {"twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90}
# How many extra words an answer may carry around an accepted answer and still match
# ("79 days" for "79"), before it needs a human look.
_MAX_EXTRA_WORDS = 2


def _words_to_numbers(tokens: list[str]) -> list[str]:
    """English number words up to 999 become digits: "seventy nine" → "79"."""
    out: list[str] = []
    value: int | None = None
    for token in tokens:
        if token in _UNITS or token in _TENS:
            number = _UNITS.get(token, _TENS.get(token, 0))
            value = number if value is None else value + number
        elif token == "hundred" and value is not None:
            value *= 100
        elif token == "and" and value is not None:
            continue
        else:
            if value is not None:
                out.append(str(value))
                value = None
            out.append(token)
    if value is not None:
        out.append(str(value))
    return out


def normalize_answer(text: str) -> list[str]:
    folded = unicodedata.normalize("NFKC", text).casefold().replace("ё", "е")
    cleaned = re.sub(r"[^\w\s]", " ", folded.replace("-", " "))
    tokens = [t for t in cleaned.split() if t not in _ARTICLES]
    return _words_to_numbers(tokens)


def answer_matches(text: str, accepted: list[str]) -> bool:
    answer = normalize_answer(text)
    if not answer:
        return False
    for candidate in accepted:
        target = normalize_answer(candidate)
        if not target or len(answer) > len(target) + _MAX_EXTRA_WORDS:
            continue
        if any(answer[i : i + len(target)] == target for i in range(len(answer) - len(target) + 1)):
            return True
    return False


def auto_grade(question: ReadingQuizQuestion, text: str) -> QuizNightGrade:
    accepted = [*(question.accepted_answers or []), *([question.correct_text] if question.correct_text else [])]
    return "correct" if answer_matches(text, accepted) else "wrong"


def effective_grade(question: ReadingQuizQuestion, answer: ReadingQuizTeamAnswer) -> QuizNightGrade:
    if answer.grade in ("correct", "wrong"):
        return answer.grade  # type: ignore[return-value]
    return auto_grade(question, answer.text)


# ── Phase machine ──────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class NightCursor:
    phase: QuizNightPhase
    round_number: int
    question_number: int
    started_at: datetime | None


class NightPlan:
    """The quiz's questions grouped into rounds, in play order."""

    def __init__(self, questions: list[ReadingQuizQuestion]) -> None:
        self.rounds: dict[int, list[ReadingQuizQuestion]] = {}
        for question in sorted(questions, key=lambda q: q.position):
            if question.round_number is not None:
                self.rounds.setdefault(question.round_number, []).append(question)

    @property
    def round_count(self) -> int:
        return len(self.rounds)

    def size(self, round_number: int) -> int:
        return len(self.rounds.get(round_number, []))

    def question(self, round_number: int, question_number: int) -> ReadingQuizQuestion | None:
        questions = self.rounds.get(round_number, [])
        return questions[question_number - 1] if 1 <= question_number <= len(questions) else None

    def position_of(self, question_id: uuid.UUID) -> tuple[int, int] | None:
        for round_number, questions in self.rounds.items():
            for index, question in enumerate(questions, start=1):
                if question.id == question_id:
                    return round_number, index
        return None


def _duration(cursor: NightCursor, plan: NightPlan) -> timedelta | None:
    if cursor.phase == "question":
        question = plan.question(cursor.round_number, cursor.question_number)
        return timedelta(seconds=question.time_limit_seconds) if question else timedelta(0)
    return PHASE_DURATIONS.get(cursor.phase)


def _next(cursor: NightCursor, plan: NightPlan, started_at: datetime) -> NightCursor:
    """The phase that follows `cursor`, whether its timer ran out or the host pressed Next."""
    r, q = cursor.round_number, cursor.question_number
    last_question = q >= plan.size(r)
    match cursor.phase:
        case "lobby":
            return NightCursor("board", 0, 0, started_at)
        case "board":
            if r >= plan.round_count:
                return NightCursor("finished", r, 0, started_at)
            return NightCursor("round_intro", r + 1, 1, started_at)
        case "round_intro":
            return NightCursor("number", r, 1, started_at)
        case "number":
            return NightCursor("question", r, q, started_at)
        case "question":
            return NightCursor("locked", r, q, started_at)
        case "locked":
            return NightCursor("answers_intro", r, q, started_at) if last_question else NightCursor("number", r, q + 1, started_at)
        case "answers_intro":
            return NightCursor("review_number", r, 1, started_at)
        case "review_number":
            return NightCursor("review_question", r, q, started_at)
        case "review_question":
            return NightCursor("review_answer", r, q, started_at)
        case "review_answer":
            return NightCursor("review_close", r, q, started_at)
        case "review_close":
            return NightCursor("board", r, 0, started_at) if last_question else NightCursor("review_number", r, q + 1, started_at)
        case _:
            return cursor


def resolve(cursor: NightCursor, plan: NightPlan, now: datetime) -> NightCursor:
    """Runs timed phases forward to `now`. Each next phase starts exactly when the previous one
    ended (not when someone looked), so every client computes the same answer."""
    while cursor.started_at is not None:
        duration = _duration(cursor, plan)
        if duration is None or now < cursor.started_at + duration:
            break
        cursor = _next(cursor, plan, cursor.started_at + duration)
    return cursor


def time_left_ms(cursor: NightCursor, plan: NightPlan, now: datetime) -> int:
    duration = _duration(cursor, plan)
    if duration is None or cursor.started_at is None:
        return 0
    return max(0, int((cursor.started_at + duration - now).total_seconds() * 1000))


def is_revealed(cursor: NightCursor, round_number: int, question_number: int) -> bool:
    if cursor.phase == "finished":
        return True
    if cursor.phase in ("lobby", "board"):
        return round_number <= cursor.round_number
    if round_number != cursor.round_number:
        return round_number < cursor.round_number
    if cursor.phase not in REVIEW_PHASES:
        return False
    if question_number < cursor.question_number:
        return True
    return question_number == cursor.question_number and cursor.phase in ("review_answer", "review_close")


def round_status(cursor: NightCursor, round_number: int) -> str:
    if cursor.phase == "finished":
        return "done"
    if cursor.phase in ("lobby", "board"):
        if round_number <= cursor.round_number:
            return "done"
        return "current" if round_number == cursor.round_number + 1 else "upcoming"
    if round_number < cursor.round_number:
        return "done"
    return "current" if round_number == cursor.round_number else "upcoming"


def stored_cursor(session: ReadingQuizSession) -> NightCursor:
    return NightCursor(
        session.status,  # type: ignore[arg-type]
        session.round_number,
        session.question_number,
        session.phase_started_at,
    )


def current_phase(session: ReadingQuizSession, now: datetime) -> QuizNightPhase:
    return resolve(stored_cursor(session), NightPlan(session.quiz.questions), now).phase


# ── Service ────────────────────────────────────────────────────────────────────


def _require_night(session: ReadingQuizSession) -> None:
    if session.quiz.format != "rounds":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This live quiz isn't a quiz night")


def _participant(session: ReadingQuizSession, user_id: str) -> ReadingQuizParticipant:
    participant = next((p for p in session.participants if str(p.user_id) == user_id), None)
    if not participant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join the quiz with its PIN first")
    return participant


def _team_scores(
    session: ReadingQuizSession, plan: NightPlan, cursor: NightCursor, answers: list[ReadingQuizTeamAnswer]
) -> list[ReadingNightTeamScore]:
    totals = {p.team.name: 0 for p in session.participants if p.team}
    for answer in answers:
        position = plan.position_of(answer.question_id)
        question = plan.question(*position) if position else None
        if not question or not position or not is_revealed(cursor, *position):
            continue
        if effective_grade(question, answer) == "correct":
            totals[answer.team.name] = totals.get(answer.team.name, 0) + question.points
    return [
        ReadingNightTeamScore(team_name=name, score=score)
        for name, score in sorted(totals.items(), key=lambda item: (-item[1], item[0]))
    ]


def _question_payload(question: ReadingQuizQuestion) -> ReadingNightQuestion:
    return ReadingNightQuestion(
        id=question.id, text=question.text, time_limit_seconds=question.time_limit_seconds, points=question.points
    )


def _marking(
    plan: NightPlan, cursor: NightCursor, answers: list[ReadingQuizTeamAnswer]
) -> list[ReadingNightMarkingQuestion]:
    marking: list[ReadingNightMarkingQuestion] = []
    for number, question in enumerate(plan.rounds.get(cursor.round_number, []), start=1):
        rows = sorted((a for a in answers if a.question_id == question.id and a.text.strip()), key=lambda a: a.team.name)
        marking.append(
            ReadingNightMarkingQuestion(
                question_number=number,
                question=_question_payload(question),
                correct_text=question.correct_text or "",
                answers=[
                    ReadingNightMarkingAnswer(
                        id=a.id,
                        team_name=a.team.name,
                        text=a.text,
                        auto_grade=auto_grade(question, a.text),
                        grade=effective_grade(question, a),
                        overridden=a.grade is not None,
                    )
                    for a in rows
                ],
            )
        )
    return marking


async def _load(session_id: str, db: AsyncSession) -> ReadingQuizSession:
    from app.domains.reading.repo_reading import get_quiz_session

    db.expire_all()
    session = await get_quiz_session(uuid.UUID(session_id), db)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz session not found")
    _require_night(session)
    return session


async def _build_state(
    session: ReadingQuizSession, participant: ReadingQuizParticipant | None, for_host: bool, db: AsyncSession
) -> ReadingNightState:
    from app.domains.reading.repo_reading import list_team_answers

    now = datetime.now(UTC)
    plan = NightPlan(session.quiz.questions)
    cursor = resolve(stored_cursor(session), plan, now)
    answers = await list_team_answers(session.id, db)
    question = plan.question(cursor.round_number, cursor.question_number)
    shows_question = cursor.phase in ("question", "locked", "review_question", "review_answer", "review_close")
    revealed = question is not None and is_revealed(cursor, cursor.round_number, cursor.question_number)
    current_answers = [a for a in answers if question and a.question_id == question.id and a.text.strip()]

    reveal = None
    if question and revealed and cursor.phase in ("review_answer", "review_close"):
        reveal = ReadingNightReveal(
            correct_text=question.correct_text or "",
            quote=question.quote,
            source_ref=question.source_ref,
            correct_team_count=sum(effective_grade(question, a) == "correct" for a in current_answers),
        )

    your_answer = None
    team_id = participant.team_id if participant else None
    if question and team_id and cursor.phase in ("question", "locked", *REVIEW_PHASES):
        mine = next((a for a in answers if a.question_id == question.id and a.team_id == team_id), None)
        grade = effective_grade(question, mine) if (mine and revealed) else ("wrong" if revealed else None)
        your_answer = ReadingNightYourAnswer(
            text=mine.text if mine else "",
            updated_at=mine.updated_at if mine else None,
            grade=grade,
            points=(question.points if grade == "correct" else 0) if revealed else None,
        )

    return ReadingNightState(
        id=session.id,
        pin=session.pin,
        quiz_title=session.quiz.title,
        phase=cursor.phase,
        rounds=[
            ReadingNightRound(number=n, question_count=plan.size(n), status=round_status(cursor, n))  # type: ignore[arg-type]
            for n in sorted(plan.rounds)
        ],
        round_number=cursor.round_number,
        question_number=cursor.question_number,
        phase_time_left_ms=time_left_ms(cursor, plan, now),
        question=_question_payload(question) if (question and shows_question) else None,
        reveal=reveal,
        team_scores=_team_scores(session, plan, cursor, answers),
        teams_joined=len({p.team_id for p in session.participants if p.team_id}),
        teams_answered=len(current_answers),
        your_team_name=participant.team.name if participant and participant.team else None,
        your_answer=your_answer,
        marking=_marking(plan, cursor, answers) if (for_host and cursor.phase == "answers_intro") else None,
    )


async def get_night_host_state(user_id: str, session_id: str, db: AsyncSession) -> ReadingNightState:
    from app.domains.reading.service_reading import _require_admin

    await _require_admin(user_id, db)
    session = await _load(session_id, db)
    return await _build_state(session, None, True, db)


async def get_night_player_state(user_id: str, session_id: str, db: AsyncSession) -> ReadingNightState:
    session = await _load(session_id, db)
    return await _build_state(session, _participant(session, user_id), False, db)


async def advance_night(user_id: str, session_id: str, db: AsyncSession) -> ReadingNightState:
    from app.domains.reading.repo_reading import list_team_answers, set_night_cursor, set_team_answer_points
    from app.domains.reading.service_reading import _require_admin

    await _require_admin(user_id, db)
    session = await _load(session_id, db)
    now = datetime.now(UTC)
    plan = NightPlan(session.quiz.questions)
    cursor = resolve(stored_cursor(session), plan, now)
    if cursor.phase == "finished":
        return await _build_state(session, None, True, db)

    following = _next(cursor, plan, now)
    if following.phase == "finished":
        # Points are written once, here, so the season leaderboard counts each night exactly once.
        points: dict[uuid.UUID, int] = {}
        for answer in await list_team_answers(session.id, db):
            position = plan.position_of(answer.question_id)
            question = plan.question(*position) if position else None
            points[answer.id] = question.points if question and effective_grade(question, answer) == "correct" else 0
        await set_team_answer_points(points, db)
    await set_night_cursor(session, following, db)
    return await _build_state(session, None, True, db)


async def save_team_answer(
    user_id: str, session_id: str, payload: ReadingNightTeamAnswerWrite, db: AsyncSession
) -> ReadingNightState:
    from app.domains.reading.repo_reading import upsert_team_answer

    session = await _load(session_id, db)
    participant = _participant(session, user_id)
    if participant.team_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Join a team to answer quiz-night questions")

    now = datetime.now(UTC)
    plan = NightPlan(session.quiz.questions)
    position = plan.position_of(payload.question_id)
    open_now = resolve(stored_cursor(session), plan, now)
    in_grace = resolve(stored_cursor(session), plan, now - ANSWER_GRACE)
    accepting = any(
        c.phase == "question" and position == (c.round_number, c.question_number) for c in (open_now, in_grace)
    )
    if not accepting:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Time's up for this question")

    await upsert_team_answer(session.id, payload.question_id, participant.team_id, participant.user_id, payload.text.strip(), db)
    return await _build_state(session, participant, False, db)


async def grade_team_answer(
    user_id: str, session_id: str, answer_id: str, payload: ReadingNightGradeWrite, db: AsyncSession
) -> ReadingNightState:
    from app.domains.reading.repo_reading import get_team_answer, set_team_answer_grade
    from app.domains.reading.service_reading import _require_admin

    await _require_admin(user_id, db)
    session = await _load(session_id, db)
    cursor = resolve(stored_cursor(session), NightPlan(session.quiz.questions), datetime.now(UTC))
    if cursor.phase != "answers_intro":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Answers can only be marked during the answers break")
    answer = await get_team_answer(uuid.UUID(answer_id), db)
    if not answer or answer.session_id != session.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found")
    await set_team_answer_grade(answer, payload.grade, db)
    return await _build_state(session, None, True, db)

