"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ReadingUser } from "@berea/api";

interface ReadingAuthState {
  user:            ReadingUser | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;

  setSession: (user: ReadingUser, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  updateUser: (partial: Partial<ReadingUser>) => void;
}

export const useReadingAuthStore = create<ReadingAuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setSession(user, accessToken, refreshToken) {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearSession() {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser(partial) {
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null }));
      },
    }),
    {
      name:    "nats-auth",
      storage: createJSONStorage(() => sessionStorage),
      // Never persist tokens to localStorage — sessionStorage clears on tab close
      partialize: (s) => ({
        user:            s.user,
        accessToken:     s.accessToken,
        refreshToken:    s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
