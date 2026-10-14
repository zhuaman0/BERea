"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeam, SemesterRound } from "@berea/api";

type ItemState = "done" | "waiting" | "todo";

interface ChecklistItem {
  title:   string;
  detail:  string;
  state:   ItemState;
  action?: React.ReactNode;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

const actionClass =
  "inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--rd-border)] px-3.5 text-[13px] font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] hover:text-[var(--rd-accent-from)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]";

function StateIcon({ state }: { state: ItemState }) {
  if (state === "done") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
        <Check size={15} strokeWidth={2.5} />
      </span>
    );
  }
  if (state === "waiting") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--rd-accent-to)]/15 text-[var(--rd-accent-to)]">
        <Clock size={14} />
      </span>
    );
  }
  return <span className="h-7 w-7 shrink-0 rounded-full border-2 border-dashed border-[var(--rd-border)]" />;
}

interface KickoffChecklistProps {
  team:          ReadingTeam;
  paymentStatus: string | null;
  rounds:        SemesterRound[];
  isCaptain:     boolean;
  onInvite:      () => void;
}

export function KickoffChecklist({ team, paymentStatus, rounds, isCaptain, onInvite }: KickoffChecklistProps) {
  const openSpots = team.max_members - team.members.length;
  const firstRound = [...rounds].sort((a, b) => a.index - b.index)[0];

  const items: ChecklistItem[] = [
    {
      title:  "Fill the team",
      detail: openSpots === 0
        ? `All ${team.max_members} players are in.`
        : `${team.members.length} of ${team.max_members} players joined. ${isCaptain ? "Share your invite link with the rest." : "Your captain sends the invite link."}`,
      state:  openSpots === 0 ? "done" : "todo",
      action: isCaptain && openSpots > 0
        ? <button type="button" onClick={onInvite} className={actionClass}>Invite players</button>
        : undefined,
    },
    {
      title:  "Pay the entry fee",
      detail: paymentStatus === "approved"
        ? "Paid and confirmed by the organisers."
        : paymentStatus === "pending"
          ? "Receipt sent. The organisers are checking it."
          : paymentStatus === "rejected"
            ? "The receipt was rejected. Upload a new one."
            : "Not paid yet.",
      state:  paymentStatus === "approved" ? "done" : paymentStatus === "pending" ? "waiting" : "todo",
      action: isCaptain && (paymentStatus === "rejected" || !paymentStatus)
        ? <Link href={"/reading/payment" as Route} className={actionClass}>Upload receipt</Link>
        : undefined,
    },
    {
      title:  "Kickoff",
      detail: firstRound
        ? `${firstRound.label} starts ${formatDate(firstRound.starts_at)}.`
        : "The start date is announced in the 451° Telegram channel.",
      state:  "waiting",
    },
  ];

  const doneCount = items.filter((item) => item.state === "done").length;

  return (
    <section className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">Before kickoff</h2>
        <p className="text-sm text-[var(--rd-text-muted)]">{doneCount} of {items.length - 1} done</p>
      </div>

      <ul className="mt-5 divide-y divide-[var(--rd-border)]">
        {items.map((item) => (
          <li key={item.title} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3.5">
              <StateIcon state={item.state} />
              <div className="min-w-0">
                <p className={cn("text-[15px] font-medium", item.state === "done" ? "text-[var(--rd-text-muted)]" : "text-[var(--rd-text)]")}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--rd-text-muted)]">{item.detail}</p>
              </div>
            </div>
            {item.action && <div className="pl-[42px] sm:pl-0">{item.action}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
