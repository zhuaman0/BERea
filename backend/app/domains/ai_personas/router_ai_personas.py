from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.dependencies import CurrentUserId, DbSession
from app.domains.ai_personas.schema_ai_personas import (
    AIPersonaResponse,
    PersonaInteractRequest,
    PersonaInteractResponse,
)

router = APIRouter()


@router.get("/", response_model=list[AIPersonaResponse])
async def list_personas(db: DbSession) -> list[AIPersonaResponse]:
    from app.domains.ai_personas.service_ai_personas import list_active_personas

    return await list_active_personas(db)


@router.get("/{persona_id}", response_model=AIPersonaResponse)
async def get_persona(persona_id: uuid.UUID, db: DbSession) -> AIPersonaResponse:
    from app.domains.ai_personas.service_ai_personas import get_persona

    return await get_persona(persona_id, db)


@router.post("/{persona_id}/interact", response_model=PersonaInteractResponse)
async def interact(persona_id: uuid.UUID, payload: PersonaInteractRequest, user_id: CurrentUserId, db: DbSession) -> PersonaInteractResponse:
    from app.domains.ai_personas.service_ai_personas import interact_with_persona

    return await interact_with_persona(persona_id, user_id, payload, db)
