"use client";

import { useEffect, useState } from "react";
import { readingSettingsApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";

export default function ReadingAdminSettingsPage() {
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readingSettingsApi
      .get()
      .then((s) => setLeaderboardEnabled(s.leaderboard_enabled))
      .catch((err) => setError(isApiError(err) ? err.detail : "Couldn't load settings."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggle() {
    const next = !leaderboardEnabled;
    setLeaderboardEnabled(next);
    setIsSaving(true);
    setError(null);
    try {
      await readingSettingsApi.update({ leaderboard_enabled: next });
    } catch (err) {
      setLeaderboardEnabled(!next);
      setError(isApiError(err) ? err.detail : "Couldn't save that change.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
        Feature toggles that apply site-wide for every student.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">Loading settings…</p>
      ) : (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
          <div>
            <p className="text-sm font-medium text-[var(--rd-text)]">Leaderboard</p>
            <p className="mt-1 text-xs text-[var(--rd-text-muted)]">
              When off, students can&apos;t see the Leaderboard page or its nav link.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={leaderboardEnabled}
            disabled={isSaving}
            onClick={handleToggle}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
              leaderboardEnabled ? "rd-accent-gradient" : "bg-[var(--rd-border)]"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                leaderboardEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
