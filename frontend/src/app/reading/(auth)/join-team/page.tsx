import { Suspense } from "react";
import { JoinTeamForm } from "@/features/reading/components/auth/JoinTeamForm";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";

export default function ReadingJoinTeamPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-no-team" />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Connect your team
        </h1>
        <p className="text-[13px] text-[var(--rd-text-muted)]">
          One last step — join your team to see the leaderboard and the book of the month.
        </p>
      </div>

      <Suspense fallback={null}>
        <JoinTeamForm />
      </Suspense>
    </div>
  );
}
