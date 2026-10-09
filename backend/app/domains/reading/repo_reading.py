from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.reading.model_reading import (
    ReadingRefreshToken,
    ReadingSemesterRound,
    ReadingTeam,
    ReadingTeamRegistration,
    ReadingUser,
    ReadingVote,
    ReadingVoteOption,
    ReadingVoteRound,
)


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
        created_at=datetime.now(timezone.utc),
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
    stage: str, opens_at: datetime, closes_at: datetime, option_labels: list[str], db: AsyncSession
) -> ReadingVoteRound:
    round_ = ReadingVoteRound(stage=stage, opens_at=opens_at, closes_at=closes_at)
    db.add(round_)
    await db.flush()
    db.add_all([ReadingVoteOption(round_id=round_.id, label=label) for label in option_labels])
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
        existing.created_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(existing)
        return existing

    vote = ReadingVote(
        round_id=round_id, option_id=option_id, user_id=user_id, created_at=datetime.now(timezone.utc)
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
