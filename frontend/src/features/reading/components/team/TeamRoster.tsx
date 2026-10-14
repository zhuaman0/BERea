"use client";

import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, Crown, Flame, UserPlus } from "lucide-react";
import { initials } from "@berea/core";
import type { ReadingTeam } from "@berea/api";

interface TeamRosterProps {
  team:      ReadingTeam;
  meId:      string | undefined;
  isCaptain: boolean;
  onInvite:  () => void;
}

export function TeamRoster({ team, meId, isCaptain, onInvite }: TeamRosterProps) {
  const teamStreak = team.members.length > 0 ? Math.min(...team.members.map((m) => m.current_streak)) : 0;
  const openSpots = team.max_members - team.members.length;

  return (
    <section className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">Players</h2>
        <p className="text-sm text-[var(--rd-text-muted)]">
          {team.members.length} of {team.max_members} players
        </p>
      </div>
      <p className="mt-1 text-[13px] text-[var(--rd-text-muted)]">
        {teamStreak > 0
          ? `Team streak: ${teamStreak} ${teamStreak === 1 ? "day" : "days"}. It counts the days everyone opened the app.`
          : "Team streak starts when every player opens the app on the same days."}
      </p>

      <ul className="mt-5 flex flex-col gap-2">
        {team.members.map((member) => {
          const isMe = member.id === meId;
          return (
            <li key={member.id}>
              <Link
                href={`/reading/team/${member.id}` as Route}
                className="group flex items-center gap-4 rounded-xl border border-transparent bg-[var(--rd-ink)] px-4 py-3.5 transition-colors hover:border-[var(--rd-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]"
              >
                <span className="rd-accent-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black/80">
                  {initials(member.full_name)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-[15px] font-medium text-[var(--rd-text)]">{member.full_name}</span>
                    {member.is_captain && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--rd-accent-from)]/12 px-2 py-0.5 text-[11px] font-semibold text-[var(--rd-accent-from)]">
                        <Crown size={11} />
                        Captain
                      </span>
                    )}
                    {isMe && (
                      <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] font-semibold text-[var(--rd-text)]">You</span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--rd-text-muted)]">@{member.email.split("@")[0]}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--rd-text-muted)] sm:hidden">{member.current_streak}-day streak</p>
                </div>

                <div className="hidden sm:block">
                  <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--rd-text)]">
                    <Flame
                      size={15}
                      className={member.current_streak > 0 ? "text-[var(--rd-accent-from)]" : "text-[var(--rd-text-muted)]/50"}
                    />
                    {member.current_streak}-day streak
                  </p>
                </div>

                <ChevronRight size={16} className="shrink-0 text-[var(--rd-text-muted)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}

        {Array.from({ length: openSpots }, (_, i) => (
          <li key={`open-${i}`}>
            {isCaptain ? (
              <button
                type="button"
                onClick={onInvite}
                className="flex w-full items-center gap-4 rounded-xl border border-dashed border-[var(--rd-border)] px-4 py-3.5 text-left transition-colors hover:border-[var(--rd-accent-from)]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--rd-border)] text-[var(--rd-text-muted)]">
                  <UserPlus size={17} />
                </span>
                <span className="text-[14px] font-medium text-[var(--rd-text)]">Open spot</span>
                <span className="ml-auto text-[13px] font-medium text-[var(--rd-accent-from)]">Invite</span>
              </button>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-[var(--rd-border)] px-4 py-3.5">
                <span className="h-11 w-11 shrink-0 rounded-full border border-dashed border-[var(--rd-border)]" />
                <span className="text-[14px] text-[var(--rd-text-muted)]">Open spot, waiting for the captain&apos;s invite</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
