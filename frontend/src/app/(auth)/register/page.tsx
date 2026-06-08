import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GoogleButton } from "@/shared/components/ui/GoogleButton";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="text-center px-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t("createYourAccount")}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          {t("joinBerea")}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-7 flex flex-col gap-5">
        <GoogleButton />
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-bold text-slate-400 tracking-[0.12em] whitespace-nowrap">
            {t("orContinueWithEmail")}
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <RegisterForm />
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-slate-500">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
