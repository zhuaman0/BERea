from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.users.model_users import User


async def fetch_user_by_id(user_id: uuid.UUID, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def save_user(user: User, db: AsyncSession) -> None:
    db.add(user)
    await db.commit()
    await db.refresh(user)
