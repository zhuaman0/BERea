import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { TeamPaymentForm } from "@/features/reading/components/auth/TeamPaymentForm";
import { ENTRY_FEE } from "@/features/reading/lib/seasonRules";

export default function ReadingPaymentPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-unpaid-team" />
      <RegistrationSteps current={4} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Confirm your team payment
        </h1>
        <p className="text-[13px] leading-relaxed text-[var(--rd-text-muted)]">
          The team captain sends the {ENTRY_FEE} entry fee once for the whole team and uploads the receipt.
          Everyone can use the app right away while we review it.
        </p>
      </div>

      <TeamPaymentForm />
    </div>
  );
}
