from __future__ import annotations

from fastapi import HTTPException, status

from app.domains.integrations.schema_integrations import YouTubeProcessResponse


async def process_youtube_url(url: str, target_language: str, simplify: bool) -> YouTubeProcessResponse:
    """
    YouTube subtitle extraction pipeline.
    Implementation will use youtube-transcript-api + an LLM for simplification.
    Placeholder structure is in place; wire in the ML components here.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="YouTube processor is not yet implemented.",
    )
