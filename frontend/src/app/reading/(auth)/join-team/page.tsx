import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { TeamStep } from "@/features/reading/components/auth/TeamStep";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";

export default async function ReadingJoinTeamPage() {
  const t = await getTranslations("reading.auth.team");

  return (
    <div className="mt-8 flex flex-col gap-6">
      <ReadingStageGuard mode="require-no-team" />
      <RegistrationSteps current={2} />

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          {t("title")}
        </h1>
        <p className="text-[13px] text-[var(--rd-text-muted)]">
          {t("subtitle")}
        </p>
      </div>

      <Suspense fallback={null}>
        <TeamStep />
      </Suspense>
    </div>
  );
}
