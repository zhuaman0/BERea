import { getTranslations } from "next-intl/server";
import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { TeamPaymentForm } from "@/features/reading/components/auth/TeamPaymentForm";
import { ENTRY_FEE } from "@/features/reading/lib/seasonRules";

export default async function ReadingPaymentPage() {
  const t = await getTranslations("reading.auth.payment");

  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-unpaid-team" />
      <RegistrationSteps current={3} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          {t("title")}
        </h1>
        <p className="text-[13px] leading-relaxed text-[var(--rd-text-muted)]">
          {t("subtitle", { fee: ENTRY_FEE })}
        </p>
      </div>

      <TeamPaymentForm />
    </div>
  );
}
