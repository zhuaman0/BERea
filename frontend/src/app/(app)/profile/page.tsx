"use client";

import Link from "next/link";
import { TrendingUp, Pencil, Plus, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

// ─── Placeholder data (wire to studySessionsApi when analytics is ready) ─────

const FOCUS_SCORE      = 87;
const FOCUS_DELTA_PCT  = 5;

const STUDY_METHODS = [
  { name: "Pomodoro",       emoji: "🍅", minutes: 720, color: "bg-blue-500"    },
  { name: "Flashcards",     emoji: "📚", minutes: 240, color: "bg-violet-500"  },
  { name: "Practice Tests", emoji: "📝", minutes: 180, color: "bg-emerald-500" },
] as const;

const TOTAL_MINUTES = STUDY_METHODS.reduce((sum, m) => sum + m.minutes, 0);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nextStreakMilestone(streak: number): number {
  for (const m of [7, 14, 30, 60, 100, 365]) {
    if (m > streak) return m;
  }
  return streak + 30;
}

function fmtHours(minutes: number): string {
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-6 flex flex-col", className)}>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuthStore();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";
  const initials  = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const streak      = user?.current_streak ?? 0;
  const milestone   = nextStreakMilestone(streak);
  const streakPct   = Math.min((streak / milestone) * 100, 100);
  const daysLeft    = milestone - streak;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">

      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <header className="md:col-span-3">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Ready to find your focus today?
        </p>
      </header>

      {/* ── User Identity Card ──────────────────────────────────────────── */}
      <Card className="items-center text-center gap-5">

        {/* Avatar */}
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-50 shadow-lg shadow-blue-100/60 shrink-0">
            {initials}
          </div>
        )}

        <div className="space-y-1 min-w-0 w-full">
          <h2 className="text-lg font-bold text-slate-900 truncate">
            {user?.full_name || user?.email?.split("@")[0] || "—"}
          </h2>
          <p className="text-sm text-slate-400 truncate">{user?.email ?? "—"}</p>

          {user && !user.is_verified && (
            <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
              Email not verified
            </span>
          )}
        </div>

        <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 mt-auto">
          <Pencil size={13} strokeWidth={2.5} />
          Edit Profile
        </button>
      </Card>

      {/* ── Streak Card ─────────────────────────────────────────────────── */}
      <Card className="gap-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Day Study Streak
        </p>

        <div className="flex items-end gap-2.5">
          <span className="text-7xl font-black leading-none text-orange-500 tabular-nums">
            {streak}
          </span>
          <span className="text-3xl mb-1.5" aria-hidden>🔥</span>
        </div>

        {/* Progress toward next milestone */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{streak} days</span>
            <span className="text-xs font-medium text-slate-500">
              Goal: {milestone} days
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700"
              style={{ width: `${streakPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {streak === 0
              ? "Complete a session today to start your streak!"
              : `${daysLeft} more day${daysLeft !== 1 ? "s" : ""} to your next milestone`}
          </p>
        </div>
      </Card>

      {/* ── Focus Score Card ────────────────────────────────────────────── */}
      <Card className="gap-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          BERea Focus Score
        </p>

        <div className="flex items-end gap-1.5">
          <span className="text-7xl font-black leading-none text-slate-900 tabular-nums">
            {FOCUS_SCORE}
          </span>
          <span className="text-2xl font-light text-slate-300 mb-2">/100</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <TrendingUp size={16} strokeWidth={2.5} aria-hidden />
          <span>+{FOCUS_DELTA_PCT}% improvement this week</span>
        </div>

        {/* Score bar */}
        <div className="space-y-1.5 mt-auto">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
              style={{ width: `${FOCUS_SCORE}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            Based on session completion rate and self-reported focus
          </p>
        </div>
      </Card>

      {/* ── Preferred Methods Card (full-width) ─────────────────────────── */}
      <Card className="md:col-span-3 gap-6">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Preferred Study Methods
            </h2>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Clock size={13} aria-hidden />
              {fmtHours(TOTAL_MINUTES)} total this month
            </p>
          </div>

          <Link
            href="/study"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-md shadow-blue-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            Start New Session
          </Link>
        </div>

        {/* Method rows */}
        <div className="flex flex-col gap-5">
          {STUDY_METHODS.map(({ name, emoji, minutes, color }) => {
            const pct      = Math.round((minutes / TOTAL_MINUTES) * 100);
            const barWidth = (minutes / TOTAL_MINUTES) * 100;
            return (
              <div key={name} className="flex items-center gap-4">
                {/* Label */}
                <div className="flex items-center gap-2.5 w-44 shrink-0">
                  <span className="text-xl leading-none" aria-hidden>{emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{name}</span>
                </div>

                {/* Bar */}
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", color)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 w-20 justify-end shrink-0">
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {fmtHours(minutes)}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
