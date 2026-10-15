"use client";

import { useEffect, useState } from "react";
import { readingSettingsApi } from "@berea/api";
import type { ReadingAppSettings } from "@berea/api";
import { isApiError } from "@/features/auth/utils";

type SettingKey = keyof ReadingAppSettings;

interface SettingRowProps {
  title:       string;
  description: string;
  isOn:        boolean;
  isSaving:    boolean;
  onToggle:    () => void;
}

function SettingRow({ title, description, isOn, isSaving, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6">
      <div>
        <p className="text-sm font-medium text-[var(--rd-text)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--rd-text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label={title}
        disabled={isSaving}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          isOn ? "rd-accent-gradient" : "bg-[var(--rd-border)]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            isOn ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function ReadingAdminSettingsPage() {
  const [settings, setSettings] = useState<ReadingAppSettings | null>(null);
  const [savingKey, setSavingKey] = useState<SettingKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readingSettingsApi
      .get()
      .then(setSettings)
      .catch((err) => setError(isApiError(err) ? err.detail : "Couldn't load settings."));
  }, []);

  async function handleToggle(key: SettingKey) {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, [key]: !settings[key] });
    setSavingKey(key);
    setError(null);
    try {
      setSettings(await readingSettingsApi.update({ [key]: !previous[key] }));
    } catch (err) {
      setSettings(previous);
      setError(isApiError(err) ? err.detail : "Couldn't save that change.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
        Feature toggles that apply site-wide for every student.
      </p>

      {!settings ? (
        !error && <p className="mt-6 text-sm text-[var(--rd-text-muted)]">Loading settings…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <SettingRow
            title="Season started"
            description="Off during registration: semester rounds haven't started, and Leaderboard, Profile and Quiz stay locked. Home and Book vote are available so students can choose the first book. Turn on at kickoff."
            isOn={settings.season_started}
            isSaving={savingKey === "season_started"}
            onToggle={() => handleToggle("season_started")}
          />
          <SettingRow
            title="Leaderboard"
            description="When off, students can't see the Leaderboard page or its nav link."
            isOn={settings.leaderboard_enabled}
            isSaving={savingKey === "leaderboard_enabled"}
            onToggle={() => handleToggle("leaderboard_enabled")}
          />
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
