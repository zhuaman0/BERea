import type { ApiError } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost/api";

interface SessionShape {
  accessToken:  string | null;
  refreshToken: string | null;
}

interface ApiClientConfig {
  /** sessionStorage key of the zustand-persisted auth store (`{state: {accessToken, refreshToken}}`) */
  sessionStorageKey: string;
  /** name of the lightweight boolean cookie the proxy reads to gate protected routes */
  sessionCookieName: string;
  /** path to send the user to when the refresh token is invalid/expired */
  loginPath: string;
  /** path (relative to API_BASE) used to exchange a refresh token for a new access token */
  refreshPath: string;
}

function createApiClient(config: ApiClientConfig) {
  function readSession(): SessionShape {
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

  function clearSession(): void {
    sessionStorage.removeItem(config.sessionStorageKey);
    document.cookie = `${config.sessionCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }

  let refreshPromise: Promise<string> | null = null;

  async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const { refreshToken } = readSession();
      if (!refreshToken) throw new Error("No refresh token");

      const res = await fetch(`${API_BASE}${config.refreshPath}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        clearSession();
        window.location.href = config.loginPath;
        throw new Error("Refresh failed");
      }

      const data = (await res.json()) as { access_token: string };
      writeAccessToken(data.access_token);
      return data.access_token;
    })().finally(() => { refreshPromise = null; });

    return refreshPromise;
  }

  class ApiClient {
    private async request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
      const { accessToken } = readSession();
      const headers = new Headers(init.headers);
      headers.set("Content-Type", "application/json");
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

      if (res.status === 401 && retry) {
        try {
          const newToken = await refreshAccessToken();
          const retryHeaders = new Headers(init.headers);
          retryHeaders.set("Content-Type", "application/json");
          retryHeaders.set("Authorization", `Bearer ${newToken}`);
          const retryRes = await fetch(`${API_BASE}${path}`, { ...init, headers: retryHeaders });
          if (!retryRes.ok) {
            const body = await retryRes.json().catch(() => ({})) as { detail?: string };
            throw { detail: body.detail ?? `HTTP ${retryRes.status}`, status: retryRes.status } satisfies ApiError;
          }
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json() as Promise<T>;
        } catch (e) {
          if ((e as ApiError).status) throw e;
          throw { detail: "Session expired", status: 401 } satisfies ApiError;
        }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw { detail: body.detail ?? `HTTP ${res.status}`, status: res.status } satisfies ApiError;
      }

      if (res.status === 204) return undefined as T;
      return res.json() as Promise<T>;
    }

    get<T>(path: string): Promise<T> {
      return this.request<T>(path, { method: "GET" });
    }

    post<T>(path: string, body: unknown): Promise<T> {
      return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
    }

    patch<T>(path: string, body: unknown): Promise<T> {
      return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
    }

    delete<T = void>(path: string): Promise<T> {
      return this.request<T>(path, { method: "DELETE" });
    }
  }

  return new ApiClient();
}

export { createApiClient };
