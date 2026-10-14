import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { TeamPaymentForm } from "@/features/reading/components/auth/TeamPaymentForm";

export default function ReadingPaymentPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-unpaid-team" />
      <RegistrationSteps current={3} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Confirm your team payment
        </h1>
        <p className="text-[13px] leading-relaxed text-[var(--rd-text-muted)]">
          Add a short description and upload the receipt for the 3 000 ₸ team entry fee.
          We&apos;ll review it after submission.
        </p>
      </div>

      <TeamPaymentForm />
    </div>
  );
}
