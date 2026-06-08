"use client";

import Link from "next/link";
import { TrendingUp, Pencil, Plus, Clock, Dna, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

// ─── Placeholder data ─────────────────────────────────────────────────────────

const FOCUS_SCORE     = 87;
const FOCUS_DELTA_PCT = 5;

const STUDY_METHODS = [
  { name: "Pomodoro",       emoji: "🍅", minutes: 720, color: "bg-blue-500"    },
  { name: "Flashcards",     emoji: "📚", minutes: 240, color: "bg-violet-500"  },
  { name: "Practice Tests", emoji: "📝", minutes: 180, color: "bg-emerald-500" },
] as const;

const TOTAL_MINUTES = STUDY_METHODS.reduce((sum, m) => sum + m.minutes, 0);

const LEARNING_DNA = {
  absorptionModes: [
    { id: "watching",    emoji: "📺", label: "Watching"     },
    { id: "kinesthetic", emoji: "✍️", label: "Kinesthetic"  },
    { id: "interactive", emoji: "🗣️", label: "Interactive"  },
  ],
  audioPreference: { emoji: "🎧", label: "Lo-Fi Beats" },
};

const AI_COACH = {
  id:      "sergeant",
  emoji:   "😤",
  name:    "The Drill Sergeant",
  tagline: "Strict & tough love",
  quote:   "Stop staring at your stats and start your Pomodoro. You're burning daylight, soldier.",
  ringBg:  "bg-red-50",
  dot:     "bg-red-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const t       = useTranslations("profile");
  const { user } = useAuthStore();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";
  const initials  = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const streak    = user?.current_streak ?? 0;
  const milestone = nextStreakMilestone(streak);
  const streakPct = Math.min((streak / milestone) * 100, 100);
  const daysLeft  = milestone - streak;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">

      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <header className="md:col-span-3">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          {t("welcomeBack", { name: firstName })}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {t("readyToFocus")}
        </p>
      </header>

      {/* ── User Identity Card ──────────────────────────────────────────── */}
      <Card className="items-center text-center gap-5">

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
              {t("emailNotVerified")}
            </span>
          )}
        </div>

        <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 mt-auto">
          <Pencil size={13} strokeWidth={2.5} />
          {t("editProfile")}
        </button>
      </Card>

      {/* ── Streak Card ─────────────────────────────────────────────────── */}
      <Card className="gap-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {t("dayStudyStreak")}
        </p>

        <div className="flex items-end gap-2.5">
          <span className="text-7xl font-black leading-none text-orange-500 tabular-nums">
            {streak}
          </span>
          <span className="text-3xl mb-1.5" aria-hidden>🔥</span>
        </div>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{streak} days</span>
            <span className="text-xs font-medium text-slate-500">{t("goal", { count: milestone })}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700"
              style={{ width: `${streakPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {streak === 0 ? t("streakEmpty") : t("streakProgress", { count: daysLeft })}
          </p>
        </div>
      </Card>

      {/* ── Focus Score Card ────────────────────────────────────────────── */}
      <Card className="gap-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {t("focusScore")}
        </p>

        <div className="flex items-end gap-1.5">
          <span className="text-7xl font-black leading-none text-slate-900 tabular-nums">
            {FOCUS_SCORE}
          </span>
          <span className="text-2xl font-light text-slate-300 mb-2">/100</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <TrendingUp size={16} strokeWidth={2.5} aria-hidden />
          <span>{t("improvementThisWeek", { pct: FOCUS_DELTA_PCT })}</span>
        </div>

        <div className="space-y-1.5 mt-auto">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
              style={{ width: `${FOCUS_SCORE}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {t("focusBasis")}
          </p>
        </div>
      </Card>

      {/* ── Learning DNA Card ───────────────────────────────────────────── */}
      <Card className="md:col-span-2 gap-6">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Dna size={18} className="text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("learningDna")}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{t("brainPrefers")}</p>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="shrink-0 text-xs font-medium text-slate-400 hover:text-blue-500 transition-colors mt-1"
          >
            Edit
          </Link>
        </div>

        {/* Absorption modes */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            {t("howYouAbsorb")}
          </p>
          <div className="flex flex-wrap gap-2">
            {LEARNING_DNA.absorptionModes.map((mode) => (
              <span
                key={mode.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-700"
              >
                <span className="text-base leading-none">{mode.emoji}</span>
                {mode.label}
              </span>
            ))}
          </div>
        </div>

        {/* Audio vibe */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            {t("studyVibe")}
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600 self-start">
            <span className="text-base leading-none">{LEARNING_DNA.audioPreference.emoji}</span>
            {LEARNING_DNA.audioPreference.label}
          </span>
        </div>
      </Card>

      {/* ── AI Coach Card ────────────────────────────────────────────────── */}
      <Card className="md:col-span-1 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-slate-500" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-slate-900">{t("aiCoach")}</h2>
          </div>

          <Link
            href="/onboarding"
            className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            {t("change")}
          </Link>
        </div>

        {/* Coach identity */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl select-none shrink-0",
            AI_COACH.ringBg
          )}>
            {AI_COACH.emoji}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-snug">{AI_COACH.name}</p>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", AI_COACH.dot)} />
              <p className="text-xs text-slate-400">{AI_COACH.tagline}</p>
            </div>
          </div>
        </div>

        {/* Quote block */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 mt-auto">
          <p className="text-xs text-slate-500 italic leading-relaxed">
            "{AI_COACH.quote}"
          </p>
        </div>
      </Card>

      {/* ── Preferred Methods Card (full-width) ─────────────────────────── */}
      <Card className="md:col-span-3 gap-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("preferredMethods")}</h2>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Clock size={13} aria-hidden />
              {t("totalThisMonth", { hours: fmtHours(TOTAL_MINUTES) })}
            </p>
          </div>

          <Link
            href="/configurator"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-md shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            {t("startNewSession")}
          </Link>
        </div>

        <div className="flex flex-col gap-5">
          {STUDY_METHODS.map(({ name, emoji, minutes, color }) => {
            const pct      = Math.round((minutes / TOTAL_MINUTES) * 100);
            const barWidth = (minutes / TOTAL_MINUTES) * 100;
            return (
              <div key={name} className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 w-44 shrink-0">
                  <span className="text-xl leading-none" aria-hidden>{emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{name}</span>
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", color)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

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
