import { Suspense } from "react";
import { TeamStep } from "@/features/reading/components/auth/TeamStep";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";

export default function ReadingJoinTeamPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-no-team" />
      <RegistrationSteps current={3} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Your team
        </h1>
        <p className="text-[13px] text-[var(--rd-text-muted)]">
          Teams have up to 3 players. Create one and invite your friends, or join with your captain&apos;s invite link.
        </p>
      </div>

      <Suspense fallback={null}>
        <TeamStep />
      </Suspense>
    </div>
  );
}
