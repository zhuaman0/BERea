"use client";

import { LogOut } from "lucide-react";
import { useReadingLogout } from "@/features/reading/hooks/useReadingLogout";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

export default function ReadingSettingsPage() {
  const user = useReadingAuthStore((s) => s.user);
  const { logout, isLoggingOut } = useReadingLogout();

  return (
    <div className={READING_PAGE_CONTAINER}>
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Settings</h1>
      <p className="mt-1 text-[13px] text-[var(--rd-text-muted)]">
        Account and notification preferences are coming in a later step.
      </p>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[var(--rd-text)]">
            {user?.full_name || "Signed in"}
          </span>
          <span className="text-[12px] text-[var(--rd-text-muted)]">
            {user?.email} · {user?.team_name ?? "No team yet"}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--rd-border)] px-4 py-2 text-[12px] font-semibold text-[var(--rd-text)] transition-colors hover:border-red-400 hover:text-red-400"
        >
          <LogOut size={14} />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </div>
  );
}
