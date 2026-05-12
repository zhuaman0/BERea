from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import CurrentUserId, DbSession
from app.domains.users.schema_users import UserResponse, UserUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(user_id: CurrentUserId, db: DbSession) -> UserResponse:
    from app.domains.users.service_users import get_user_by_id

    return await get_user_by_id(user_id, db)


@router.patch("/me", response_model=UserResponse)
async def update_me(payload: UserUpdateRequest, user_id: CurrentUserId, db: DbSession) -> UserResponse:
    from app.domains.users.service_users import update_user

    return await update_user(user_id, payload, db)


@router.get("/me/streak", response_model=dict)
async def get_streak(user_id: CurrentUserId, db: DbSession) -> dict:
    from app.domains.users.service_users import get_streak_summary

    return await get_streak_summary(user_id, db)
