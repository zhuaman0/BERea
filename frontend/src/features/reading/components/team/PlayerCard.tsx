"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Flame, UserRound } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeamMember } from "@berea/api";
import { initials } from "@berea/core";
import type { TeamTheme } from "./teamTheme";

const EASE = [0.16, 1, 0.3, 1] as const;
const TILT_SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

function joinedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function streakStatus(member: ReadingTeamMember): string {
  if (member.active_today) return "Checked in today";
  if (member.current_streak > 0) return "Not in yet today — streak at risk";
  return "No active streak";
}

interface PlayerCardProps {
  member:     ReadingTeamMember;
  theme:      TeamTheme;
  isMe:       boolean;
  index:      number;
}

export function PlayerCard({ member, theme, isMe, index }: PlayerCardProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [5, -5]), TILT_SPRING);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-6, 6]), TILT_SPRING);
  const glareX = useTransform(pointerX, (v) => `${v * 100}%`);
  const glareY = useTransform(pointerY, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 55%)`;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const isLit = member.active_today;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 + index * 0.08, ease: EASE }}
      className="[perspective:1000px]"
    >
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--rd-ink)] p-5 transition-[border-color,box-shadow] duration-300 [transform-style:preserve-3d] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]",
          isMe ? theme.border : "border-[var(--rd-border)] hover:border-white/15"
        )}
      >
        <motion.div
          aria-hidden="true"
          style={{ backgroundImage: glare }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {isMe && (
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl", theme.glow)}
          />
        )}

        <div className="relative flex items-start gap-3.5">
          <span className="relative shrink-0">
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-black/80",
                theme.band
              )}
            >
              {initials(member.full_name)}
            </span>
            {isMe && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--rd-text)] px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--rd-ink)] ring-2 ring-[var(--rd-ink)]">
                You
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-semibold leading-tight text-[var(--rd-text)]">
              {member.full_name}
            </p>
            <p className="mt-1 truncate text-xs text-[var(--rd-text-muted)]">
              @{member.email.split("@")[0]} · joined {joinedLabel(member.created_at)}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-3 rounded-xl bg-[var(--rd-panel)] px-4 py-3">
          <Flame
            size={20}
            className={cn(
              "shrink-0",
              isLit
                ? "fill-[var(--rd-accent-from)]/35 text-[var(--rd-accent-from)] drop-shadow-[0_0_6px_rgba(255,107,44,0.6)]"
                : "text-[var(--rd-text-muted)]/50"
            )}
          />
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold leading-tight text-[var(--rd-text)]">
              {member.current_streak}-day streak
            </p>
            <p className={cn("mt-0.5 truncate text-[11px]", isLit ? "text-emerald-400" : "text-[var(--rd-text-muted)]")}>
              {streakStatus(member)}
            </p>
          </div>
        </div>

        <div className="min-h-4 flex-1" aria-hidden="true" />

        <Link
          href={`/reading/team/${member.id}` as Route}
          className="relative flex items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-2 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)]"
        >
          <UserRound size={13} />
          {isMe ? "Your profile" : "View profile"}
        </Link>
      </motion.div>
    </motion.div>
  );
}
