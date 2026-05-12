from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.enums import PersonaTone


class AIPersonaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    tone: PersonaTone
    description: str
    avatar_url: str | None
    is_active: bool


class PersonaInteractRequest(BaseModel):
    message: str
    session_id: uuid.UUID | None = None


class PersonaInteractResponse(BaseModel):
    response: str
    interaction_id: uuid.UUID
