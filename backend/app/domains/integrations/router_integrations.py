from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import CurrentUserId
from app.domains.integrations.schema_integrations import YouTubeProcessRequest, YouTubeProcessResponse

router = APIRouter()


@router.post("/youtube/process", response_model=YouTubeProcessResponse)
async def process_youtube(payload: YouTubeProcessRequest, user_id: CurrentUserId) -> YouTubeProcessResponse:
    from app.domains.integrations.service_integrations import process_youtube_url

    return await process_youtube_url(str(payload.url), payload.target_language, payload.simplify)
