"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { readingAuthApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import type { ReadingTeamMemberProfile } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";
import { formatReadingDate } from "@/features/reading/lib/formatReadingDate";
import { ReaderAvatar } from "@/features/reading/components/ReaderAvatar";

function memberSinceLabel(iso: string, locale: string): string {
  if (!iso) return "";
  return formatReadingDate(iso, locale, "monthYear");
}

interface PageProps {
  params: Promise<{ memberId: string }>;
}

export default function TeammateProfilePage({ params }: PageProps) {
  const { memberId } = use(params);
  const t = useTranslations("reading.member");
  const locale = useLocale();

  const [profile, setProfile] = useState<ReadingTeamMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    readingAuthApi
      .teamMemberProfile(memberId)
      .then(setProfile)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : t("loadError")))
      .finally(() => setIsLoading(false));
  }, [memberId, t]);

  return (
    <div className={READING_PAGE_CONTAINER}>
      <Link
        href={"/reading/team" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
      >
        <ArrowLeft size={15} />
        {t("backToTeam")}
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{t("loading")}</p>
      ) : loadError || !profile ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{loadError ?? t("notFound")}</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <ReaderAvatar
                userId={profile.id}
                name={profile.full_name}
                version={profile.avatar_version}
                className="h-20 w-20 bg-[var(--rd-border)] text-xl font-semibold text-[var(--rd-text)]"
              />
              <div>
                <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">{profile.full_name}</h1>
                <p className="mt-1 text-sm text-[var(--rd-text-muted)]">@{profile.email.split("@")[0]}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-[var(--rd-border)] pt-6 sm:grid-cols-4">
            <p className="text-sm">
              <span className="text-[var(--rd-text-muted)]">{t("teamLabel")} </span>
              <span className="font-medium text-[var(--rd-text)]">{profile.team_name}</span>
            </p>
            <p className="text-sm">
              <span className="text-[var(--rd-text-muted)]">{t("memberSinceLabel")} </span>
              <span className="font-medium text-[var(--rd-text)]">{memberSinceLabel(profile.created_at, locale)}</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm">
              <Flame size={14} className="text-[var(--rd-accent-from)]" />
              <span className="text-[var(--rd-text-muted)]">{t("streakLabel")} </span>
              <span className="font-medium text-[var(--rd-text)]">{t("streakDays", { count: profile.current_streak })}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
