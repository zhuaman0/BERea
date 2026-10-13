"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readingAuthService } from "@berea/api";
import { useReadingAuthStore } from "../store/useReadingAuthStore";

export function useReadingLogout() {
  const router = useRouter();
  const pending = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { refreshToken, clearSession } = useReadingAuthStore();

  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setIsLoggingOut(true);

    try {
      await readingAuthService.logout(refreshToken);
    } catch {
      // The service clears storage and the cookie even if revocation fails.
    } finally {
      clearSession();
      router.replace("/reading/login");
      router.refresh();
    }
  }

  return { logout, isLoggingOut };
}
