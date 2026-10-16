import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ReadingRegisterForm } from "@/features/reading/components/auth/RegisterForm";
import { RegistrationSteps } from "@/features/reading/components/auth/RegistrationSteps";

export default async function ReadingRegisterPage() {
  const t = await getTranslations("reading.auth.register");

  return (
    <div className="mt-8 flex flex-col gap-6">
      <RegistrationSteps current={1} />
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          {t("title")}
        </h1>
      </div>

      <Suspense fallback={null}>
        <ReadingRegisterForm />
      </Suspense>

      <p className="text-center text-[13px] text-[var(--rd-text-muted)]">
        {t("hasAccount")}{" "}
        <Link href="/reading/login" className="font-semibold text-[var(--rd-text)] hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
