import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl" aria-hidden="true">📬</span>
        <h1 className="text-2xl font-bold text-text-primary">Check your inbox</h1>
        <p className="text-sm text-text-secondary">
          We sent a verification link to your email. Click it to activate your account.
        </p>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-gray-100 p-5">
        <p className="text-sm text-text-muted">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button className="text-brand-600 font-medium hover:underline">
            resend the email
          </button>
          .
        </p>
      </div>

      <Link href="/login" className="text-sm text-brand-600 font-medium hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
