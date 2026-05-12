import { apiClient } from "@/shared/lib/api-client";
import type { TokenResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<TokenResponse>("/v1/auth/login", body),

  register: (body: RegisterRequest) =>
    apiClient.post<TokenResponse>("/v1/auth/register", body),

  refresh: (refreshToken: string) =>
    apiClient.post<TokenResponse>("/v1/auth/refresh", { refresh_token: refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<void>("/v1/auth/logout", { refresh_token: refreshToken }),
};
