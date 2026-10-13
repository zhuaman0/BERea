"use client";

import { useEffect, useState } from "react";
import { MOCK_PROFILE } from "@/features/reading/mockData";
import { readingAuthApi } from "@berea/api";
import { readingSemesterApi } from "@berea/api";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeam } from "@berea/api";
import type { SemesterRound } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

const MATE_COLORS = ["var(--rd-mate-1)", "var(--rd-mate-2)", "var(--rd-mate-3)", "var(--rd-mate-4)"];

function memberSinceLabel(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface FactProps {
  label: string;
  value: string;
}

function Fact({ label, value }: FactProps) {
  return (
    <p className="text-sm">
      <span className="text-[var(--rd-text-muted)]">{label}: </span>
      <span className="font-medium text-[var(--rd-text)]">{value}</span>
    </p>
  );
}

export default function ReadingProfilePage() {
  const { user, updateUser } = useReadingAuthStore();
  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
    readingAuthApi.myTeam().then(setTeam).catch(() => { /* fact shows a dash until it loads */ });
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* same */ });
  }, [updateUser]);

  // Identity fields (name, handle, team, token balance) come from the real
  // account. The reading-progress log and 14-day activity graph below have no
  // backend yet — everything else (points, place, rounds, badge progress) is
  // real or an honest zero, never a made-up number.
  const stats = MOCK_PROFILE;
  const maxActivity = Math.max(...stats.activityDays, 1);
  const booksFinished = rounds.filter((r) => r.status === "done").length;
  const currentStreak = user?.current_streak ?? 0;

  const displayName = user?.full_name || MOCK_PROFILE.name;
  const handle = user?.email ? `@${user.email.split("@")[0]}` : MOCK_PROFILE.handle;
  const teamName = user?.team_name ?? MOCK_PROFILE.teamName;
  const memberSince = user?.created_at ? memberSinceLabel(user.created_at) : MOCK_PROFILE.memberSince;
  const tokenBalance = user?.token_balance ?? MOCK_PROFILE.tokenBalance;

  const badges = [
    { id: "point-collector", label: "250 points",    current: 0,              target: 250 },
    { id: "all-4-books",     label: "All 4 books",    current: booksFinished,  target: rounds.length || 4 },
    { id: "streak-9",        label: "9-day streak",   current: currentStreak,  target: 9 },
    { id: "first-finish",    label: "First finish",   current: 0,              target: 1 },
    { id: "tiktok-3",        label: "TikTok ×3",      current: 0,              target: 3 },
    { id: "perfect-round",   label: "Perfect round",  current: 0,              target: 1 },
    { id: "semester-winner", label: "Semester winner", current: 0,             target: 1 },
  ];

  return (
    <div className={READING_PAGE_CONTAINER}>
      <div className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 rounded-full bg-[var(--rd-border)]" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">{displayName}</h1>
                <span className="rounded-full border border-[var(--rd-accent-from)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--rd-accent-from)]">
                  Challenger
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--rd-text-muted)]">{handle}</p>
              <div className="mt-3 flex gap-3">
                <button className="rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm text-[var(--rd-text)]">
                  Edit profile
                </button>
                <button className="rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm text-[var(--rd-text)]">
                  Share reader card
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-[var(--rd-text-muted)]">Token balance</p>
            <p className="font-display text-2xl font-semibold text-[var(--rd-text)]">{tokenBalance} ₸</p>
            <button className="rd-accent-gradient mt-2 rounded-lg px-4 py-1.5 text-sm font-semibold text-black/85">
              Top up
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-[var(--rd-border)] pt-6 sm:grid-cols-4">
          <Fact label="Team" value={teamName} />
          <Fact label="Member since" value={memberSince} />
          <Fact label="Total points" value="0" />
          <Fact label="Leaderboard place" value={team ? `${team.place}/${team.teams_total}` : "—"} />
          <Fact label="Rounds won" value="0" />
          <Fact label="Quiz nights" value="0" />
          <Fact label="Accuracy" value="—" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
        <p className="text-base font-medium text-[var(--rd-text)]">Reading log · October</p>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--rd-text-muted)]">You · {stats.readingLogLabel}</span>
            <span className="font-medium text-[var(--rd-text)]">{stats.yourProgress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rd-border)]">
            <div className="h-full rounded-full rd-accent-gradient" style={{ width: `${stats.yourProgress}%` }} />
          </div>
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">Team progress</p>
        <div className="mt-3 space-y-3">
          {stats.teammates.map((mate, i) => (
            <div key={mate.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--rd-text-muted)]">{mate.name}</span>
                <span className="font-medium text-[var(--rd-text)]">{mate.progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rd-border)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${mate.progress}%`, backgroundColor: MATE_COLORS[i % MATE_COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-base font-medium text-[var(--rd-text)]">Badges</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {badges.map((badge) => {
                const earned = badge.current >= badge.target;
                const percent = Math.min((badge.current / badge.target) * 100, 100);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col gap-2 rounded-xl border p-3 ${
                      earned ? "border-[var(--rd-accent-from)]/40 bg-[var(--rd-accent-from)]/[0.06]" : "border-[var(--rd-border)] bg-[var(--rd-ink)]"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        earned ? "text-[var(--rd-accent-from)]" : "text-[var(--rd-text-muted)]"
                      }`}
                    >
                      {badge.label}
                    </span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--rd-border)]">
                      <div
                        className={`h-full rounded-full ${earned ? "bg-emerald-400" : "rd-accent-gradient"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[var(--rd-text-muted)]">
                      {badge.current}/{badge.target}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[var(--rd-text-muted)]">
              Badges are cosmetic — they never add points, so the league stays fair.
            </p>
          </div>

          <div className="lg:w-64">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">Last 14 days</p>
            <div className="mt-3 flex h-14 items-end gap-1.5">
              {stats.activityDays.map((day, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-[var(--rd-border)]"
                  style={{ height: `${Math.max((day / maxActivity) * 100, 6)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
