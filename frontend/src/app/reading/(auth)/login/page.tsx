import Link from "next/link";
import { ReadingLoginForm } from "@/features/reading/components/auth/LoginForm";
import { ReadingGoogleButton } from "@/features/reading/components/auth/ReadingGoogleButton";

export default function ReadingLoginPage() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[28px] font-semibold text-[var(--rd-text)]">
          Sign in to your account
        </h1>
      </div>

      <ReadingLoginForm />

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[var(--rd-text-muted)]">
        <span className="h-px flex-1 bg-[var(--rd-border)]" />
        or
        <span className="h-px flex-1 bg-[var(--rd-border)]" />
      </div>

      <ReadingGoogleButton />

      <p className="text-center text-[13px] text-[var(--rd-text-muted)]">
        Still don&apos;t have an account?{" "}
        <Link href="/reading/register" className="font-semibold text-[var(--rd-text)] hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
