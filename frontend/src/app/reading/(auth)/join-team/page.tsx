import { Suspense } from "react";
import { JoinTeamForm } from "@/features/reading/components/auth/JoinTeamForm";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";

export default function ReadingJoinTeamPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-no-team" />
      <RegistrationSteps current={2} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Register your team
        </h1>
        <p className="text-[13px] text-[var(--rd-text-muted)]">
          Create a new team or join an existing one. Each team can have up to 3 players.
        </p>
      </div>

      <Suspense fallback={null}>
        <JoinTeamForm />
      </Suspense>
    </div>
  );
}
