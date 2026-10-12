import { createSessionStorage } from "@berea/core";
import { readingAuthApi } from "../authApi";
import type {
  ReadingLoginRequest,
  ReadingRegisterRequest,
  ReadingTokenResponse,
  ReadingUser,
} from "../authTypes";

const storage = createSessionStorage({
  sessionStorageKey: "nats-auth",
  sessionCookieName: "nats-session",
});

/**
 * Everything "signing in/out" needs beyond the plain HTTP calls: marking the
 * route-guard cookie on success and clearing both it and the persisted session
 * on logout. Setting the zustand store itself (the user object, `isAuthenticated`)
 * stays in the calling component — that's React state, not something this
 * package reaches into.
 */
export const readingAuthService = {
  async login(credentials: ReadingLoginRequest): Promise<ReadingTokenResponse> {
    const tokens = await readingAuthApi.login(credentials);
    storage.markSignedIn();
    return tokens;
  },

  async register(payload: ReadingRegisterRequest): Promise<ReadingTokenResponse> {
    const tokens = await readingAuthApi.register(payload);
    storage.markSignedIn();
    return tokens;
  },

  async logout(refreshToken: string | null): Promise<void> {
    try {
      if (refreshToken) await readingAuthApi.logout(refreshToken);
    } finally {
      // Session is cleared even if the server-side revoke call fails.
      storage.clearSession();
    }
  },

  me(): Promise<ReadingUser> {
    return readingAuthApi.me();
  },
};
