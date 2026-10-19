import { Vote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { VoteRoundManager } from "@/features/reading/components/admin/VoteRoundManager";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

export default async function ReadingAdminVotesPage() {
  const t = await getTranslations("reading.admin.votes");
  const tCommon = await getTranslations("reading.admin.common");

  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero
        eyebrow={tCommon("eyebrow")}
        eyebrowIcon={Vote}
        title={t("title")}
        description={t("description")}
      />

      <div className="mt-8">
        <VoteRoundManager />
      </div>
    </div>
  );
}
