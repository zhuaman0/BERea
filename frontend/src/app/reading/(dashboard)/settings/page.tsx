"use client";

import { LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useReadingLogout } from "@/features/reading/hooks/useReadingLogout";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { AvatarUploader } from "@/features/reading/components/AvatarUploader";

export default function ReadingSettingsPage() {
  const t = useTranslations("reading.settings");
  const user = useReadingAuthStore((s) => s.user);
  const updateUser = useReadingAuthStore((s) => s.updateUser);
  const { logout, isLoggingOut } = useReadingLogout();

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero eyebrow={t("eyebrow")} eyebrowIcon={Settings} title={t("title")} description={t("subtitle")} />

      {user && (
        <section className="mt-8 flex flex-wrap items-start gap-5 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-5 py-5" aria-labelledby="photo-title">
          <AvatarUploader user={user} onChange={updateUser} />
          <div className="min-w-0 flex-1">
            <h2 id="photo-title" className="text-[13px] font-medium text-[var(--rd-text)]">{t("photoTitle")}</h2>
            <p className="mt-1 max-w-md text-[12px] text-[var(--rd-text-muted)]">{t("photoHint")}</p>
          </div>
        </section>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[var(--rd-text)]">
            {user?.full_name || t("signedIn")}
          </span>
          <span className="text-[12px] text-[var(--rd-text-muted)]">
            {user?.email} · {user?.team_name ?? t("noTeam")}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--rd-border)] px-4 py-2 text-[12px] font-semibold text-[var(--rd-text)] transition-colors hover:border-red-400 hover:text-red-400"
        >
          <LogOut size={14} />
          {isLoggingOut ? t("loggingOut") : t("logout")}
        </button>
      </div>
    </div>
  );
}
