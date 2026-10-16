import { Vote } from "lucide-react";
import { VoteRoundManager } from "@/features/reading/components/admin/VoteRoundManager";
import { ReadingPageHero } from "@/features/reading/components/layout/ReadingPageHero";
import { READING_PAGE_CONTAINER } from "@/features/reading/lib/pageContainer";

export default function ReadingAdminVotesPage() {
  return (
    <div className={READING_PAGE_CONTAINER}>
      <ReadingPageHero
        eyebrow="Admin"
        eyebrowIcon={Vote}
        title="Book vote"
        description="Language and genre together, with one 6-hour deadline, followed by a book vote. Manage options and results here."
      />

      <div className="mt-8">
        <VoteRoundManager />
      </div>
    </div>
  );
}
