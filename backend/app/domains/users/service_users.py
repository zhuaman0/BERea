from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.users.schema_users import UserResponse, UserUpdateRequest


async def get_user_by_id(user_id: str, db: AsyncSession) -> UserResponse:
    from app.domains.users.repo_users import fetch_user_by_id

    user = await fetch_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserResponse.model_validate(user)


async def update_user(user_id: str, payload: UserUpdateRequest, db: AsyncSession) -> UserResponse:
    from app.domains.users.repo_users import fetch_user_by_id, save_user

    user = await fetch_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url

    await save_user(user, db)
    return UserResponse.model_validate(user)


async def get_streak_summary(user_id: str, db: AsyncSession) -> dict:
    from app.domains.users.repo_users import fetch_user_by_id

    user = await fetch_user_by_id(uuid.UUID(user_id), db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "last_study_date": user.last_study_date.isoformat() if user.last_study_date else None,
    }
