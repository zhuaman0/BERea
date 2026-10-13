"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Flame } from "lucide-react";
import { readingAuthApi } from "@berea/api";
import { initials } from "@berea/core";
import { isApiError } from "@/features/auth/utils";
import type { ReadingTeamMemberProfile } from "@berea/api";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

function memberSinceLabel(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}


interface PageProps {
  params: Promise<{ memberId: string }>;
}

export default function TeammateProfilePage({ params }: PageProps) {
  const { memberId } = use(params);

  const [profile, setProfile] = useState<ReadingTeamMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    readingAuthApi
      .teamMemberProfile(memberId)
      .then(setProfile)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load this profile."))
      .finally(() => setIsLoading(false));
  }, [memberId]);

  return (
    <div className={READING_PAGE_CONTAINER}>
      <Link
        href={"/reading/team" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
      >
        <ArrowLeft size={15} />
        Back to team
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">Loading profile…</p>
      ) : loadError || !profile ? (
        <p className="mt-6 text-sm text-[var(--rd-text-muted)]">{loadError ?? "Profile not found."}</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--rd-border)] text-xl font-semibold text-[var(--rd-text)]">
                {initials(profile.full_name)}
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">{profile.full_name}</h1>
                <p className="mt-1 text-sm text-[var(--rd-text-muted)]">@{profile.email.split("@")[0]}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-[var(--rd-border)] pt-6 sm:grid-cols-4">
            <p className="text-sm">
              <span className="text-[var(--rd-text-muted)]">Team: </span>
              <span className="font-medium text-[var(--rd-text)]">{profile.team_name}</span>
            </p>
            <p className="text-sm">
              <span className="text-[var(--rd-text-muted)]">Member since: </span>
              <span className="font-medium text-[var(--rd-text)]">{memberSinceLabel(profile.created_at)}</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm">
              <Flame size={14} className="text-[var(--rd-accent-from)]" />
              <span className="text-[var(--rd-text-muted)]">Reading streak: </span>
              <span className="font-medium text-[var(--rd-text)]">{profile.current_streak} days</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
