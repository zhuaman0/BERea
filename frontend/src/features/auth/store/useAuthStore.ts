"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
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
      name: "berea-auth",
      storage: createJSONStorage(() => sessionStorage),
      // Never persist tokens to localStorage — sessionStorage clears on tab close
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
