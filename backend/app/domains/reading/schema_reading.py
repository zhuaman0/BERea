from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, ValidationInfo, field_validator


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


class ReadingTeamMemberAddRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr


class ReadingUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    team_name: str | None
    token_balance: int
    current_streak: int
    created_at: datetime


TEAM_MAX_MEMBERS = 3


class ReadingTeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr


class ReadingTeamResponse(BaseModel):
    id: uuid.UUID
    name: str
    members: list[ReadingTeamMemberResponse]
    max_members: int = TEAM_MAX_MEMBERS
    place: int
    teams_total: int


class ReadingTeamSummaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    member_count: int


class ReadingTeamMemberProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    team_name: str
    current_streak: int
    token_balance: int
    created_at: datetime


class ReadingTeamRegistrationCreate(BaseModel):
    team_name: str = Field(min_length=2, max_length=120)
    member_1_name: str = Field(min_length=1, max_length=120)
    member_2_name: str = Field(min_length=1, max_length=120)
    member_3_name: str = Field(min_length=1, max_length=120)
    contact_email: EmailStr
    contact_phone: str | None = Field(default=None, max_length=32)


class ReadingTeamRegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    team_name: str
    status: str
    created_at: datetime


VoteStage = Literal["language", "genre", "book"]


class ReadingVoteRoundCreate(BaseModel):
    stage: VoteStage
    options: list[str] = Field(min_length=2, max_length=12)
    duration_hours: float = Field(gt=0, le=168)

    @field_validator("options")
    @classmethod
    def _clean_options(cls, value: list[str]) -> list[str]:
        cleaned = [option.strip() for option in value if option.strip()]
        if len(cleaned) < 2:
            raise ValueError("Add at least 2 options")
        return cleaned


class ReadingVoteCastRequest(BaseModel):
    option_id: uuid.UUID


class ReadingVoteOptionResult(BaseModel):
    id: uuid.UUID
    label: str
    vote_count: int
    percent: int


class ReadingVoteRoundResponse(BaseModel):
    id: uuid.UUID
    stage: VoteStage
    is_open: bool
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


class ReadingAppSettingsUpdate(BaseModel):
    leaderboard_enabled: bool
