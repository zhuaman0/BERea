from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.auth.model_auth import RefreshToken
from app.domains.users.model_users import User


async def get_user_by_email(email: str, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user_record(email: str, hashed_password: str, full_name: str, db: AsyncSession) -> User:
    user = User(email=email, hashed_password=hashed_password, full_name=full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_google_id(google_id: str, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def create_oauth_user(
    email: str, full_name: str, google_id: str, avatar_url: str | None, db: AsyncSession
) -> User:
    user = User(
        email=email,
        full_name=full_name,
        google_id=google_id,
        avatar_url=avatar_url,
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def link_google_to_user(user: User, google_id: str, avatar_url: str | None, db: AsyncSession) -> None:
    user.google_id = google_id
    if avatar_url and not user.avatar_url:
        user.avatar_url = avatar_url
    user.is_verified = True
    await db.commit()


async def save_refresh_token(user_id: str, token_hash: str, expires_at: datetime, db: AsyncSession) -> None:
    record = RefreshToken(
        user_id=uuid.UUID(user_id),
        token_hash=token_hash,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc),
    )
    db.add(record)
    await db.commit()


async def get_refresh_token_record(raw_token: str, db: AsyncSession) -> RefreshToken | None:
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    return result.scalar_one_or_none()


async def revoke_token(record: RefreshToken, db: AsyncSession) -> None:
    record.revoked = True
    await db.commit()
