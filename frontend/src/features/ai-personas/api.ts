import { apiClient } from "@/shared/lib/api-client";
import type { AIPersona } from "@/types/study";

export interface InteractPayload {
  message: string;
  session_id?: string;
}

export interface InteractResponse {
  response: string;
  interaction_id: string;
}

export const aiPersonasApi = {
  list: () =>
    apiClient.get<AIPersona[]>("/v1/personas/"),

  get: (personaId: string) =>
    apiClient.get<AIPersona>(`/v1/personas/${personaId}`),

  interact: (personaId: string, body: InteractPayload) =>
    apiClient.post<InteractResponse>(`/v1/personas/${personaId}/interact`, body),
};
