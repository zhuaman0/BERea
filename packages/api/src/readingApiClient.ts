"use client";

import { createApiClient } from "@berea/core";

export const readingApiClient = createApiClient({
  sessionStorageKey: "nats-auth",
  sessionCookieName: "nats-session",
  loginPath:         "/reading/login",
  refreshPath:       "/v1/reading/auth/refresh",
});
