import { Suspense } from "react";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";
import { VerifyEmailForm } from "@/features/reading/components/auth/VerifyEmailForm";

export default function ReadingVerifyEmailPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-unverified" />
      <RegistrationSteps current={2} />

      <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">Check your email</h1>

      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
