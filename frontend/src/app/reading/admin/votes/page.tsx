import { VoteRoundManager } from "@/features/reading/components/admin/VoteRoundManager";

export default function ReadingAdminVotesPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10 lg:px-12">
      <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">Book vote</h1>
      <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
        Language and genre together, with one 6-hour deadline, followed by a book vote. Manage options and results here.
      </p>

      <div className="mt-6">
        <VoteRoundManager />
      </div>
    </div>
  );
}
