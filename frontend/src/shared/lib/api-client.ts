"use client";

import { createApiClient } from "@berea/core";

export const apiClient = createApiClient({
  sessionStorageKey: "berea-auth",
  sessionCookieName: "berea-session",
  loginPath:         "/login",
  refreshPath:       "/v1/auth/refresh",
});
