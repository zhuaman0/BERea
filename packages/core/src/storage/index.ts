export interface SessionTokens {
  accessToken:  string | null;
  refreshToken: string | null;
}

export interface SessionStorageConfig {
  /** sessionStorage key of the zustand-persisted auth store (`{state: {accessToken, refreshToken}}`) */
  sessionStorageKey: string;
  /** name of the lightweight boolean cookie the proxy reads to gate protected routes */
  sessionCookieName: string;
}

/**
 * Reads/writes the auth tokens a zustand `persist` store keeps in `sessionStorage`,
 * plus the boolean route-guard cookie that mirrors "is there a session at all" for
 * the edge proxy (which can't read sessionStorage). One of these is created per
 * product (furniture, reading, ...) with that product's own storage key and cookie name.
 */
export function createSessionStorage(config: SessionStorageConfig) {
  function readSession(): SessionTokens {
    try {
      const raw = sessionStorage.getItem(config.sessionStorageKey);
      if (!raw) return { accessToken: null, refreshToken: null };
      const parsed = JSON.parse(raw) as { state?: { accessToken?: string; refreshToken?: string } };
      return {
        accessToken:  parsed?.state?.accessToken  ?? null,
        refreshToken: parsed?.state?.refreshToken ?? null,
      };
    } catch {
      return { accessToken: null, refreshToken: null };
    }
  }

  function writeAccessToken(newToken: string): void {
    try {
      const raw = sessionStorage.getItem(config.sessionStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { state?: Record<string, unknown>; version?: number };
      if (parsed.state) {
        parsed.state.accessToken = newToken;
        sessionStorage.setItem(config.sessionStorageKey, JSON.stringify(parsed));
      }
    } catch { /* no-op */ }
  }

  function markSignedIn(): void {
    document.cookie = `${config.sessionCookieName}=1; path=/; SameSite=Lax`;
  }

  function clearSession(): void {
    sessionStorage.removeItem(config.sessionStorageKey);
    document.cookie = `${config.sessionCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }

  return { readSession, writeAccessToken, markSignedIn, clearSession };
}

export type SessionStorage = ReturnType<typeof createSessionStorage>;
