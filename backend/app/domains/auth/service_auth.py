from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.domains.auth.schema_auth import LoginRequest, RegisterRequest, TokenResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    return jwt.encode({"sub": user_id, "exp": expire, "type": "refresh"}, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None


async def register_user(payload: RegisterRequest, db: AsyncSession) -> TokenResponse:
    from app.domains.auth.repo_auth import create_user_record, get_user_by_email

    existing = await get_user_by_email(payload.email, db)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await create_user_record(payload.email, hash_password(payload.password), payload.full_name, db)
    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    await _store_refresh_token(str(user.id), refresh, db)
    return TokenResponse(access_token=access, refresh_token=refresh)


async def login_user(payload: LoginRequest, db: AsyncSession) -> TokenResponse:
    from app.domains.auth.repo_auth import get_user_by_email

    user = await get_user_by_email(payload.email, db)
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    await _store_refresh_token(str(user.id), refresh, db)
    return TokenResponse(access_token=access, refresh_token=refresh)


async def refresh_tokens(refresh_token: str, db: AsyncSession) -> TokenResponse:
    from app.domains.auth.repo_auth import get_refresh_token_record, revoke_token

    record = await get_refresh_token_record(refresh_token, db)
    if not record or record.revoked or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    await revoke_token(record, db)
    user_id = str(record.user_id)
    access = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)
    await _store_refresh_token(user_id, new_refresh, db)
    return TokenResponse(access_token=access, refresh_token=new_refresh)


async def revoke_refresh_token(refresh_token: str, db: AsyncSession) -> None:
    from app.domains.auth.repo_auth import get_refresh_token_record, revoke_token

    record = await get_refresh_token_record(refresh_token, db)
    if record:
        await revoke_token(record, db)


async def _store_refresh_token(user_id: str, token: str, db: AsyncSession) -> None:
    from app.domains.auth.repo_auth import save_refresh_token

    import hashlib
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await save_refresh_token(user_id, token_hash, expires_at, db)


def get_google_authorize_url() -> str:
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": secrets.token_urlsafe(16),
    }
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)


async def google_oauth_callback(code: str, db: AsyncSession) -> tuple[str, str]:
    from app.domains.auth.repo_auth import (
        create_oauth_user,
        get_user_by_email,
        get_user_by_google_id,
        link_google_to_user,
    )

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_res.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token exchange failed")

        google_access_token = token_res.json().get("access_token")

        userinfo_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        if userinfo_res.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch Google user info")

        google_user = userinfo_res.json()

    google_id: str = google_user["sub"]
    email: str = google_user.get("email", "")
    full_name: str = google_user.get("name") or email
    avatar_url: str | None = google_user.get("picture")

    user = await get_user_by_google_id(google_id, db)
    if not user:
        user = await get_user_by_email(email, db)
        if user:
            await link_google_to_user(user, google_id, db)
        else:
            user = await create_oauth_user(email, full_name, google_id, avatar_url, db)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    await _store_refresh_token(str(user.id), refresh, db)
    return access, refresh
