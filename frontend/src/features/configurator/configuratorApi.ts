import { apiClient } from "@/shared/lib/api-client";

export interface SavedDesignOut {
  id: string;
  user_id: string;
  name: string;
  configuration: Record<string, unknown>;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveDesignPayload {
  name: string;
  configuration: Record<string, unknown>;
}

export const configuratorApi = {
  save: (payload: SaveDesignPayload) =>
    apiClient.post<SavedDesignOut>("/v1/configurator", payload),

  list: () =>
    apiClient.get<SavedDesignOut[]>("/v1/configurator/my"),

  get: (id: string) =>
    apiClient.get<SavedDesignOut>(`/v1/configurator/${id}`),

  delete: (id: string) =>
    apiClient.delete(`/v1/configurator/${id}`),
};
