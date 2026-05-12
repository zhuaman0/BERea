from __future__ import annotations

from pydantic import BaseModel, HttpUrl


class YouTubeProcessRequest(BaseModel):
    url: HttpUrl
    target_language: str = "en"
    simplify: bool = True


class YouTubeProcessResponse(BaseModel):
    video_id: str
    title: str
    transcript_text: str
    simplified_text: str | None
    detected_language: str
