from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

bearer_scheme = HTTPBearer()

DbSession = Annotated[AsyncSession, Depends(get_db)]
BearerToken = Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]


async def get_current_user_id(token: BearerToken) -> str:
    """
    Decodes the JWT and returns the user ID.
    Full implementation lives in service_auth.py once the auth domain is built out.
    """
    from app.domains.auth.service_auth import decode_access_token

    user_id = decode_access_token(token.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
