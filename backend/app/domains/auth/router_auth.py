from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import DbSession
from app.domains.auth.schema_auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db: DbSession) -> TokenResponse:
    from app.domains.auth.service_auth import register_user

    return await register_user(payload, db)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    from app.domains.auth.service_auth import login_user

    return await login_user(payload, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: DbSession) -> TokenResponse:
    from app.domains.auth.service_auth import refresh_tokens

    return await refresh_tokens(payload.refresh_token, db)


@router.post("/logout", status_code=204)
async def logout(payload: RefreshRequest, db: DbSession) -> None:
    from app.domains.auth.service_auth import revoke_refresh_token

    await revoke_refresh_token(payload.refresh_token, db)
