import { Suspense } from "react";
import Link from "next/link";
import { ReadingRegisterForm } from "@/features/reading/components/auth/RegisterForm";
import { ReadingGoogleButton } from "@/features/reading/components/auth/ReadingGoogleButton";

export default function ReadingRegisterPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Create your account
        </h1>
      </div>

      <Suspense fallback={null}>
        <ReadingRegisterForm />
      </Suspense>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[var(--rd-text-muted)]">
        <span className="h-px flex-1 bg-[var(--rd-border)]" />
        or
        <span className="h-px flex-1 bg-[var(--rd-border)]" />
      </div>

      <ReadingGoogleButton />

      <p className="text-center text-[13px] text-[var(--rd-text-muted)]">
        Already have an account?{" "}
        <Link href="/reading/login" className="font-semibold text-[var(--rd-text)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
