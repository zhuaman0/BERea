"use client";

import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { Rulebook } from "@/features/reading/components/Rulebook";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";

export default function ReadingRulesPage() {
  const t = useTranslations("reading.rulebook.page");

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero
        eyebrow={t("eyebrow")}
        eyebrowIcon={Flame}
        title={t.rich("title", {
          accent: (chunks) => (
            <span className="bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent">
              {chunks}
            </span>
          ),
        })}
        description={t("subtitle")}
      />

      <Rulebook />
    </div>
  );
}
