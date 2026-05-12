from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.ai_personas.schema_ai_personas import AIPersonaResponse, PersonaInteractRequest, PersonaInteractResponse


async def list_active_personas(db: AsyncSession) -> list[AIPersonaResponse]:
    from app.domains.ai_personas.repo_ai_personas import fetch_active_personas

    personas = await fetch_active_personas(db)
    return [AIPersonaResponse.model_validate(p) for p in personas]


async def get_persona(persona_id: uuid.UUID, db: AsyncSession) -> AIPersonaResponse:
    from app.domains.ai_personas.repo_ai_personas import fetch_persona_by_id

    persona = await fetch_persona_by_id(persona_id, db)
    if not persona:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    return AIPersonaResponse.model_validate(persona)


async def interact_with_persona(
    persona_id: uuid.UUID,
    user_id: str,
    payload: PersonaInteractRequest,
    db: AsyncSession,
) -> PersonaInteractResponse:
    from app.domains.ai_personas.repo_ai_personas import fetch_persona_by_id, save_interaction

    persona = await fetch_persona_by_id(persona_id, db)
    if not persona:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")

    # AI call will go here — prompt is constructed from persona.system_prompt_template
    # Placeholder response until AI integration is wired
    response_text = f"[{persona.name}]: Message received. AI integration pending."

    interaction = await save_interaction(
        persona_id=persona_id,
        user_id=uuid.UUID(user_id),
        session_id=payload.session_id,
        user_message=payload.message,
        persona_response=response_text,
        db=db,
    )
    return PersonaInteractResponse(response=response_text, interaction_id=interaction.id)
