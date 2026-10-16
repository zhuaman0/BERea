"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@berea/ui-kit";
import { readingAuthApi } from "@berea/api";
import type { ReadingTeam, ReadingTeamInvite } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { formatReadingDate } from "@/features/reading/lib/formatReadingDate";

function inviteUrl(token: string): string {
  return `${window.location.origin}/reading/register?invite=${encodeURIComponent(token)}`;
}

function expiryLabel(iso: string, locale: string): string {
  return formatReadingDate(iso, locale, "dayMonth");
}

interface InvitePlayersModalProps {
  team:    ReadingTeam;
  onClose: () => void;
}

export function InvitePlayersModal({ team, onClose }: InvitePlayersModalProps) {
  const t = useTranslations("reading.team.invite");
  const tTeam = useTranslations("reading.team");
  const locale = useLocale();
  const [invite, setInvite] = useState<ReadingTeamInvite | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    readingAuthApi
      .teamInvite()
      .then(setInvite)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : t("loadError")));
  }, [t]);

  const openSpots = team.max_members - team.members.length;
  // Mounted only after a click, so reading navigator can't cause a hydration mismatch.
  const shareSupported = typeof navigator !== "undefined" && "share" in navigator;

  async function handleCopy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(inviteUrl(invite.token));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked: the link is still selectable in the field */ }
  }

  async function handleShare() {
    if (!invite) return;
    try {
      await navigator.share({
        title: t("shareTitle", { team: team.name }),
        text: t("shareText", { team: team.name }),
        url: inviteUrl(invite.token),
      });
    } catch { /* share sheet dismissed */ }
  }

  return (
    <Modal title={tTeam("invitePlayers")} onClose={onClose}>
      <p className="text-sm leading-relaxed text-[var(--rd-text-muted)]">
        {t.rich("intro", {
          name: team.name,
          count: openSpots,
          team: (chunks) => <span className="text-[var(--rd-text)]">{chunks}</span>,
        })}
      </p>

      {loadError ? (
        <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">{loadError}</p>
      ) : !invite ? (
        <p className="mt-5 text-sm text-[var(--rd-text-muted)]">{t("creating")}</p>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 py-3">
            <input
              readOnly
              value={inviteUrl(invite.token)}
              onFocus={(e) => e.currentTarget.select()}
              aria-label={t("linkLabel")}
              className="min-w-0 flex-1 truncate bg-transparent text-sm text-[var(--rd-text)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-1.5 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-[var(--rd-text-muted)]">
            {t("expiry", { date: expiryLabel(invite.expires_at, locale) })}
          </p>

          {shareSupported && (
            <button
              type="button"
              onClick={handleShare}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--rd-border)] px-4 py-2.5 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
            >
              <Send size={14} />
              {t("share")}
            </button>
          )}
        </>
      )}
    </Modal>
  );
}
