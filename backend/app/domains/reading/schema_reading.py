from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


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


class ReadingUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    team_name: str | None
    token_balance: int
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


class ReadingTeamSummaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    member_count: int


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
