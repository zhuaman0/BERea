"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { ReadingTeam, SemesterRound } from "@berea/api";
import { PAYMENT_STEP_ENABLED } from "@/features/reading/lib/paymentStatus";
import { formatReadingDate } from "@/features/reading/lib/formatReadingDate";

type ItemState = "done" | "waiting" | "todo";

interface ChecklistItem {
  title:   string;
  detail:  string;
  state:   ItemState;
  action?: React.ReactNode;
}

function formatDate(iso: string, locale: string): string {
  return formatReadingDate(iso, locale, "weekdayDayMonth");
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
  const t = useTranslations("reading.team.kickoff");
  const tTeam = useTranslations("reading.team");
  const locale = useLocale();
  const openSpots = team.max_members - team.members.length;
  const firstRound = [...rounds].sort((a, b) => a.index - b.index)[0];

  const paymentItem: ChecklistItem = {
    title:  t("payment.title"),
    detail: paymentStatus === "approved"
      ? t("payment.approved")
      : paymentStatus === "pending"
        ? t("payment.pending")
        : paymentStatus === "rejected"
          ? t("payment.rejected")
          : t("payment.unpaid"),
    state:  paymentStatus === "approved" ? "done" : paymentStatus === "pending" ? "waiting" : "todo",
    action: isCaptain && (paymentStatus === "rejected" || !paymentStatus)
      ? <Link href={"/reading/payment" as Route} className={actionClass}>{t("payment.upload")}</Link>
      : undefined,
  };

  const items: ChecklistItem[] = [
    {
      title:  t("fill.title"),
      detail: openSpots === 0
        ? t("fill.full", { count: team.max_members })
        : `${t("fill.partial", { count: team.members.length, max: team.max_members })} ${isCaptain ? t("fill.captainHint") : t("fill.memberHint")}`,
      state:  openSpots === 0 ? "done" : "todo",
      action: isCaptain && openSpots > 0
        ? <button type="button" onClick={onInvite} className={actionClass}>{tTeam("invitePlayers")}</button>
        : undefined,
    },
    ...(PAYMENT_STEP_ENABLED ? [paymentItem] : []),
    {
      title:  t("start.title"),
      detail: firstRound
        ? t("start.date", { round: firstRound.label, date: formatDate(firstRound.starts_at, locale) })
        : t("start.tba"),
      state:  "waiting",
    },
  ];

  const doneCount = items.filter((item) => item.state === "done").length;

  return (
    <section className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-[var(--rd-text)]">{t("title")}</h2>
        <p className="text-sm text-[var(--rd-text-muted)]">{t("progress", { done: doneCount, total: items.length - 1 })}</p>
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
