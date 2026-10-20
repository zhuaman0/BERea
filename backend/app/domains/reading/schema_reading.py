from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, ValidationInfo, field_validator, model_validator


class ReadingRegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ReadingLoginRequest(BaseModel):
    email: EmailStr
    password: str


class ReadingRefreshRequest(BaseModel):
    refresh_token: str


class ReadingTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ReadingTeamJoinRequest(BaseModel):
    team_name: str = Field(min_length=2, max_length=120)


class ReadingTeamInviteJoinRequest(BaseModel):
    invite_token: str = Field(min_length=8, max_length=64)


class ReadingTeamInviteResponse(BaseModel):
    token: str
    expires_at: datetime


class ReadingTeamInvitePreview(BaseModel):
    team_name: str
    captain_name: str | None
    member_count: int
    max_members: int


class ReadingAdminUserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    team_name: str | None
    is_admin: bool
    is_tester: bool
    current_streak: int
    last_active_date: date | None
    created_at: datetime


class ReadingUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    team_name: str | None
    payment_status: str | None
    token_balance: int
    current_streak: int
    is_admin: bool
    is_tester: bool
    is_captain: bool
    created_at: datetime


TEAM_MAX_MEMBERS = 3


class ReadingTeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    current_streak: int
    active_today: bool
    is_captain: bool
    created_at: datetime


CoverColor = Literal["ember", "crimson", "ocean", "forest", "plum", "midnight", "parchment"]
CoverPattern = Literal["plain", "stripes", "dots", "lines"]
CoverEmblem = Literal["monogram", "flame", "star", "feather", "crown", "moon"]
CoverAnimation = Literal["float", "glow", "still"]


class ReadingTeamCover(BaseModel):
    title: str | None
    color: CoverColor
    pattern: CoverPattern
    emblem: CoverEmblem
    animation: CoverAnimation


class ReadingTeamCoverUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=24)
    color: CoverColor
    pattern: CoverPattern
    emblem: CoverEmblem
    animation: CoverAnimation

    @field_validator("title")
    @classmethod
    def _blank_title_is_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class ReadingTeamResponse(BaseModel):
    id: uuid.UUID
    name: str
    members: list[ReadingTeamMemberResponse]
    max_members: int = TEAM_MAX_MEMBERS
    points: int
    books_finished: int
    place: int
    teams_total: int
    cover: ReadingTeamCover


class ReadingTeamSummaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    member_count: int
    points: int
    cover: ReadingTeamCover


class ReadingTeamMemberProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    team_name: str
    current_streak: int
    token_balance: int
    created_at: datetime


class ReadingTeamRegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    team_name: str
    payment_description: str
    amount_tenge: int
    status: str
    created_at: datetime


class ReadingTeamPaymentAdminResponse(BaseModel):
    team_id: uuid.UUID
    team_name: str
    member_count: int
    payment_id: uuid.UUID | None
    submitted_by_email: EmailStr | None
    payment_description: str | None
    amount_tenge: int
    receipt_content_type: str | None
    status: str | None
    submitted_at: datetime | None


class ReadingTeamPaymentStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"]


VoteStage = Literal["language", "genre", "book"]


def _clean_vote_options(value: list[str]) -> list[str]:
    options = [option.strip() for option in value if option.strip()]
    if not 2 <= len(options) <= 12:
        raise ValueError("Add between 2 and 12 options")
    if any(len(option) > 120 for option in options):
        raise ValueError("Options must be at most 120 characters")
    if len({option.casefold() for option in options}) != len(options):
        raise ValueError("Options must be unique")
    return options


class ReadingVoteSelectionCreate(BaseModel):
    language_options: list[str] = Field(min_length=2, max_length=12)
    genre_options: list[str] = Field(min_length=2, max_length=12)

    @field_validator("language_options", "genre_options")
    @classmethod
    def _clean_options(cls, value: list[str]) -> list[str]:
        return _clean_vote_options(value)


class ReadingVoteRoundCreate(BaseModel):
    stage: VoteStage
    options: list[str] = Field(default_factory=list, max_length=12)
    book_ids: list[uuid.UUID] | None = Field(default=None, max_length=12)
    duration_hours: float = Field(default=6, gt=0, le=168, allow_inf_nan=False)

    @field_validator("options")
    @classmethod
    def _clean_options(cls, value: list[str]) -> list[str]:
        return _clean_vote_options(value) if value else value

    @model_validator(mode="after")
    def _options_or_books(self) -> ReadingVoteRoundCreate:
        if self.stage == "book" and self.book_ids is None:
            raise ValueError("Book rounds must use catalog books")
        if self.book_ids is not None:
            if self.stage != "book":
                raise ValueError("Catalog books can only be offered in a book round")
            if len(set(self.book_ids)) < 2:
                raise ValueError("Pick at least 2 books")
            if self.options:
                raise ValueError("Use catalog books instead of text options")
        elif len(self.options) < 2:
            raise ValueError("Add at least 2 options")
        return self


class ReadingVoteCastRequest(BaseModel):
    option_id: uuid.UUID


class ReadingVoteOptionResult(BaseModel):
    id: uuid.UUID
    label: str
    book_id: uuid.UUID | None = None
    vote_count: int
    percent: int


class ReadingVoteRoundResponse(BaseModel):
    id: uuid.UUID
    stage: VoteStage
    is_open: bool
    status: Literal["scheduled", "open", "closed"]
    is_tied: bool
    opens_at: datetime
    closes_at: datetime
    total_votes: int
    options: list[ReadingVoteOptionResult]
    winner_option_id: uuid.UUID | None
    your_vote_option_id: uuid.UUID | None


SemesterRoundStatus = Literal["done", "in_progress", "locked"]


class ReadingSemesterRoundCreate(BaseModel):
    index: int = Field(ge=1, le=12)
    label: str = Field(min_length=1, max_length=120)
    starts_at: datetime
    ends_at: datetime

    @field_validator("ends_at")
    @classmethod
    def _ends_after_starts(cls, ends_at: datetime, info: ValidationInfo) -> datetime:
        starts_at = info.data.get("starts_at")
        if starts_at is not None and ends_at <= starts_at:
            raise ValueError("ends_at must be after starts_at")
        return ends_at


class ReadingSemesterRoundResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    index: int
    label: str
    starts_at: datetime
    ends_at: datetime
    status: SemesterRoundStatus


class ReadingAppSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    leaderboard_enabled: bool
    season_started: bool


class ReadingAppSettingsUpdate(BaseModel):
    leaderboard_enabled: bool | None = None
    season_started: bool | None = None


class ReadingBookPartAnswerWrite(BaseModel):
    text: str = Field(min_length=1, max_length=300)
    is_correct: bool


class ReadingBookPartQuestionWrite(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    answers: list[ReadingBookPartAnswerWrite] = Field(min_length=2, max_length=4)

    @model_validator(mode="after")
    def _one_correct_answer(self) -> ReadingBookPartQuestionWrite:
        if sum(answer.is_correct for answer in self.answers) != 1:
            raise ValueError("Mark exactly one answer as correct")
        return self


class ReadingBookPartWrite(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    points_reward: int = Field(default=100, ge=1, le=5000)
    questions: list[ReadingBookPartQuestionWrite] = Field(min_length=1, max_length=50)


class ReadingBookWrite(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)
    cover_url: str | None = Field(default=None, max_length=1024)
    language: str | None = Field(default=None, max_length=40)
    genre: str | None = Field(default=None, max_length=60)
    page_count: int | None = Field(default=None, ge=1, le=5000)
    parts: list[ReadingBookPartWrite] = Field(default_factory=list, max_length=30)

    @field_validator("language", "genre")
    @classmethod
    def _blank_is_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None

    @field_validator("title", "description")
    @classmethod
    def _strip(cls, value: str) -> str:
        return value.strip()

    @field_validator("cover_url")
    @classmethod
    def _http_url_or_none(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        url = value.strip()
        if not url.startswith(("http://", "https://")):
            raise ValueError("Cover URL must start with http:// or https://")
        return url


class ReadingBookResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    cover_url: str | None
    language: str | None
    genre: str | None
    page_count: int | None
    part_count: int


class ReadingBookPartAnswerEditorResponse(BaseModel):
    id: uuid.UUID
    text: str
    is_correct: bool


class ReadingBookPartQuestionEditorResponse(BaseModel):
    id: uuid.UUID
    text: str
    answers: list[ReadingBookPartAnswerEditorResponse]


class ReadingBookPartEditorResponse(BaseModel):
    id: uuid.UUID
    title: str
    points_reward: int
    questions: list[ReadingBookPartQuestionEditorResponse]


class ReadingBookEditorResponse(ReadingBookResponse):
    parts: list[ReadingBookPartEditorResponse]


class ReadingBookPathAnswer(BaseModel):
    id: uuid.UUID
    text: str


class ReadingBookPathQuestion(BaseModel):
    id: uuid.UUID
    text: str
    answers: list[ReadingBookPathAnswer]


BookPartStatus = Literal["locked", "available", "completed"]


class ReadingBookPathPart(BaseModel):
    id: uuid.UUID
    position: int
    title: str
    points_reward: int
    status: BookPartStatus
    score: int | None
    questions: list[ReadingBookPathQuestion]


class ReadingBookPathResponse(BaseModel):
    book: ReadingBookResponse
    parts: list[ReadingBookPathPart]
    completed_parts: int
    total_parts: int
    total_points: int
    is_complete: bool
    is_captain: bool


class ReadingBookPathAnswerSubmit(BaseModel):
    question_id: uuid.UUID
    answer_id: uuid.UUID


class ReadingBookPartSubmit(BaseModel):
    answers: list[ReadingBookPathAnswerSubmit] = Field(min_length=1, max_length=50)


class ReadingBookPartAnswerReview(BaseModel):
    question_id: uuid.UUID
    question_text: str
    selected_answer_id: uuid.UUID
    selected_answer_text: str
    correct_answer_id: uuid.UUID
    correct_answer_text: str
    is_correct: bool


class ReadingBookPartAttemptResponse(BaseModel):
    path: ReadingBookPathResponse
    score: int
    passed: bool
    points_awarded: int
    review: list[ReadingBookPartAnswerReview]


class ReadingBookOfMonthResponse(BaseModel):
    book: ReadingBookResponse
    chosen_by_percent: int
    your_page: int
    team_average_percent: int


class ReadingProgressUpdate(BaseModel):
    current_page: int = Field(ge=0, le=5000)


class ReadingShelfEntry(BaseModel):
    book: ReadingBookResponse
    current_page: int
    updated_at: datetime


class ReadingProfileStatsResponse(BaseModel):
    quiz_points: int
    quiz_nights: int
    answers_total: int
    answers_correct: int
    votes_cast: int
    pages_read: int
    books_finished: int
    shelf: list[ReadingShelfEntry]


QuizStatus = Literal["draft", "scheduled"]
QuizFormat = Literal["instant", "rounds"]
QuizQuestionKind = Literal["choice", "open"]

QUIZ_NIGHT_MAX_ROUNDS = 6


class ReadingQuizAnswerWrite(BaseModel):
    text: str = Field(min_length=1, max_length=300)
    is_correct: bool


class ReadingQuizQuestionWrite(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    time_limit_seconds: int = Field(ge=5, le=300)
    points: int = Field(ge=0, le=5000)
    kind: QuizQuestionKind = "choice"
    answers: list[ReadingQuizAnswerWrite] = Field(default_factory=list, max_length=4)
    round_number: int | None = Field(default=None, ge=1, le=QUIZ_NIGHT_MAX_ROUNDS)
    correct_text: str | None = Field(default=None, max_length=300)
    accepted_answers: list[str] = Field(default_factory=list, max_length=20)
    quote: str | None = Field(default=None, max_length=4000)
    source_ref: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def _answers_match_kind(self) -> ReadingQuizQuestionWrite:
        if self.kind == "choice":
            if len(self.answers) < 2:
                raise ValueError("A multiple-choice question needs at least two answers")
            if sum(a.is_correct for a in self.answers) != 1:
                raise ValueError("Mark exactly one answer as correct")
        elif not (self.correct_text or "").strip():
            raise ValueError("An open question needs its correct answer")
        return self


class ReadingQuizWrite(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    month_label: str = Field(min_length=1, max_length=60)
    scheduled_for: datetime | None = None
    status: QuizStatus = "draft"
    format: QuizFormat = "instant"
    questions: list[ReadingQuizQuestionWrite] = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def _questions_match_format(self) -> ReadingQuizWrite:
        if self.format == "rounds":
            if any(q.kind != "open" or q.round_number is None for q in self.questions):
                raise ValueError("Quiz-night questions must be open questions with a round number")
            rounds = sorted({q.round_number for q in self.questions if q.round_number is not None})
            if rounds != list(range(1, len(rounds) + 1)):
                raise ValueError("Rounds must be numbered 1, 2, 3… without gaps")
        elif any(q.kind != "choice" for q in self.questions):
            raise ValueError("Instant quizzes only take multiple-choice questions")
        return self


class ReadingQuizAnswerResponse(BaseModel):
    id: uuid.UUID
    text: str
    is_correct: bool


class ReadingQuizQuestionResponse(BaseModel):
    id: uuid.UUID
    text: str
    time_limit_seconds: int
    points: int
    kind: QuizQuestionKind
    answers: list[ReadingQuizAnswerResponse]
    round_number: int | None
    correct_text: str | None
    accepted_answers: list[str]
    quote: str | None
    source_ref: str | None


class ReadingQuizResponse(BaseModel):
    id: uuid.UUID
    title: str
    month_label: str
    scheduled_for: datetime | None
    status: QuizStatus
    format: QuizFormat
    questions: list[ReadingQuizQuestionResponse]


LiveQuizPhase = Literal["lobby", "question", "reveal", "finished"]


class ReadingLiveSessionCreate(BaseModel):
    quiz_id: uuid.UUID


class ReadingLiveJoinRequest(BaseModel):
    pin: str = Field(pattern=r"^\d{6}$")


class ReadingLiveAnswerRequest(BaseModel):
    answer_id: uuid.UUID


class ReadingLiveAnswerOption(BaseModel):
    id: uuid.UUID
    text: str
    # Only sent once the question is revealed (always to the host).
    is_correct: bool | None
    # Host-only: how many players picked this answer.
    picked_count: int | None


class ReadingLiveQuestion(BaseModel):
    index: int
    total: int
    text: str
    points: int
    time_limit_seconds: int
    time_left_ms: int
    answers: list[ReadingLiveAnswerOption]


class ReadingLivePlayer(BaseModel):
    name: str
    team_name: str | None
    score: int


class ReadingLiveTeamScore(BaseModel):
    team_name: str
    score: int


class ReadingLiveSummary(BaseModel):
    id: uuid.UUID
    pin: str
    quiz_title: str
    # A quiz-night session reports its own phase names (see QuizNightPhase).
    phase: LiveQuizPhase | QuizNightPhase
    format: QuizFormat


class ReadingLiveHostState(BaseModel):
    id: uuid.UUID
    pin: str
    quiz_title: str
    phase: LiveQuizPhase
    players: list[ReadingLivePlayer]
    question: ReadingLiveQuestion | None
    answered_count: int
    team_scores: list[ReadingLiveTeamScore]


class ReadingLivePlayerState(BaseModel):
    id: uuid.UUID
    quiz_title: str
    phase: LiveQuizPhase
    player_count: int
    question: ReadingLiveQuestion | None
    your_answer_id: uuid.UUID | None
    your_points_this_question: int | None
    your_score: int
    your_rank: int
    team_scores: list[ReadingLiveTeamScore]


QuizNightPhase = Literal[
    "lobby",
    "board",
    "round_intro",
    "number",
    "question",
    "locked",
    "answers_intro",
    "review_number",
    "review_question",
    "review_answer",
    "review_close",
    "finished",
]
QuizNightRoundStatus = Literal["done", "current", "upcoming"]
QuizNightGrade = Literal["correct", "wrong"]


class ReadingNightTeamAnswerWrite(BaseModel):
    question_id: uuid.UUID
    text: str = Field(max_length=300)


class ReadingNightGradeWrite(BaseModel):
    # None clears the host's override and falls back to the automatic match.
    grade: QuizNightGrade | None


class ReadingNightRound(BaseModel):
    number: int
    question_count: int
    status: QuizNightRoundStatus


class ReadingNightQuestion(BaseModel):
    id: uuid.UUID
    text: str
    time_limit_seconds: int
    points: int


class ReadingNightReveal(BaseModel):
    correct_text: str
    quote: str | None
    source_ref: str | None
    correct_team_count: int


class ReadingNightYourAnswer(BaseModel):
    text: str
    updated_at: datetime | None
    # Only set once this question's answer has been revealed.
    grade: QuizNightGrade | None
    points: int | None


class ReadingNightTeamScore(BaseModel):
    team_name: str
    score: int


class ReadingNightMarkingAnswer(BaseModel):
    id: uuid.UUID
    team_name: str
    text: str
    auto_grade: QuizNightGrade
    grade: QuizNightGrade
    overridden: bool


class ReadingNightMarkingQuestion(BaseModel):
    question_number: int
    question: ReadingNightQuestion
    correct_text: str
    answers: list[ReadingNightMarkingAnswer]


class ReadingNightState(BaseModel):
    id: uuid.UUID
    pin: str
    quiz_title: str
    phase: QuizNightPhase
    rounds: list[ReadingNightRound]
    round_number: int
    question_number: int
    # Time left in a timed phase, so every screen can run the same countdown.
    phase_time_left_ms: int
    question: ReadingNightQuestion | None
    reveal: ReadingNightReveal | None
    team_scores: list[ReadingNightTeamScore]
    teams_joined: int
    teams_answered: int
    # Player-only.
    your_team_name: str | None
    your_answer: ReadingNightYourAnswer | None
    # Host-only, during "answers_intro".
    marking: list[ReadingNightMarkingQuestion] | None
