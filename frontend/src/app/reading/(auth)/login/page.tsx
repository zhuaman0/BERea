import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ReadingLoginForm } from "@/features/reading/components/auth/LoginForm";

export default async function ReadingLoginPage() {
  const t = await getTranslations("reading.auth.login");

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          {t("title")}
        </h1>
      </div>

      <Suspense fallback={null}>
        <ReadingLoginForm />
      </Suspense>

      <p className="text-center text-[13px] text-[var(--rd-text-muted)]">
        {t("noAccount")}{" "}
        <Link href="/reading/register" className="font-semibold text-[var(--rd-text)] hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
