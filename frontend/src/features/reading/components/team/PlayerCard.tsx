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
import { Flame, Mail, UserRound } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeamMember } from "@/features/reading/authTypes";
import { PagePattern } from "./PagePattern";
import { initials, type TeamTheme } from "./teamTheme";

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
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [7, -7]), TILT_SPRING);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-9, 9]), TILT_SPRING);
  const glareX = useTransform(pointerX, (v) => `${v * 100}%`);
  const glareY = useTransform(pointerY, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.12), transparent 55%)`;

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
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--rd-ink)] transition-shadow duration-300 [transform-style:preserve-3d] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]",
          isMe ? theme.border : "border-[var(--rd-border)]"
        )}
      >
        <motion.div
          aria-hidden="true"
          style={{ backgroundImage: glare }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className={cn("relative h-24 overflow-hidden", theme.bandSoft)}>
          <PagePattern theme={theme} className="inset-0 h-full w-full" />
          {isMe && (
            <span className={cn("absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-black/80", theme.band)}>
              You
            </span>
          )}
        </div>

        <div className="relative flex flex-1 flex-col px-5 pb-5">
          <span
            className={cn(
              "-mt-7 flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-black/80 ring-4 ring-[var(--rd-ink)]",
              theme.band
            )}
          >
            {initials(member.full_name)}
          </span>

          <p className="mt-3 truncate font-display text-lg font-semibold text-[var(--rd-text)]">{member.full_name}</p>
          <p className="truncate text-xs text-[var(--rd-text-muted)]">
            @{member.email.split("@")[0]} · joined {joinedLabel(member.created_at)}
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3.5 py-3">
            <motion.span
              animate={isLit && !reduceMotion ? { scale: [1, 1.12, 0.96, 1], rotate: [0, -4, 3, 0] } : undefined}
              transition={isLit ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
              className="flex"
            >
              <Flame
                size={22}
                className={cn(
                  isLit
                    ? "fill-[var(--rd-accent-from)]/35 text-[var(--rd-accent-from)] drop-shadow-[0_0_8px_rgba(255,107,44,0.6)]"
                    : "text-[var(--rd-text-muted)]/40"
                )}
              />
            </motion.span>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold leading-tight text-[var(--rd-text)]">
                {member.current_streak}-day streak
              </p>
              <p className={cn("truncate text-[11px]", isLit ? "text-emerald-400" : "text-[var(--rd-text-muted)]")}>
                {streakStatus(member)}
              </p>
            </div>
          </div>

          {isMe ? (
            <Link
              href={"/reading/profile" as Route}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-2 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)]"
            >
              <UserRound size={13} />
              Your profile
            </Link>
          ) : (
            <div className="mt-4 flex gap-2">
              <a
                href={`mailto:${member.email}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-2 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)]"
              >
                <Mail size={13} />
                Message
              </a>
              <Link
                href={`/reading/team/${member.id}` as Route}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-2 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)]"
              >
                <UserRound size={13} />
                View profile
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
