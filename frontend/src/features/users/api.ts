import { apiClient } from "@/shared/lib/api-client";
import type { User } from "@/types/auth";

export interface UserUpdatePayload {
  full_name?: string;
  avatar_url?: string;
}

export const usersApi = {
  me: () => apiClient.get<User>("/v1/users/me"),

  updateMe: (body: UserUpdatePayload) =>
    apiClient.patch<User>("/v1/users/me", body),

  streakSummary: () =>
    apiClient.get<{ current_streak: number; longest_streak: number; last_study_date: string | null }>(
      "/v1/users/me/streak"
    ),
};
