from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse

from app.config import settings
from app.dependencies import DbSession
from app.domains.auth.schema_auth import GoogleAuthorizeResponse, LoginRequest, RefreshRequest, RegisterRequest, TokenResponse

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


@router.get("/google/authorize", response_model=GoogleAuthorizeResponse)
async def google_authorize() -> GoogleAuthorizeResponse:
    from app.domains.auth.service_auth import get_google_authorize_url

    if not settings.google_client_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google OAuth is not configured")

    return GoogleAuthorizeResponse(url=get_google_authorize_url())


@router.get("/google/callback")
async def google_callback(code: str, db: DbSession) -> RedirectResponse:
    from app.domains.auth.service_auth import google_oauth_callback

    try:
        access_token, refresh_token = await google_oauth_callback(code, db)
    except HTTPException:
        return RedirectResponse(f"{settings.frontend_url}/login?error=google_auth_failed", status_code=302)

    return RedirectResponse(
        f"{settings.frontend_url}/callback?access_token={access_token}&refresh_token={refresh_token}",
        status_code=302,
    )
