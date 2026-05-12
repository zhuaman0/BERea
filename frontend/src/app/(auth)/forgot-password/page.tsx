import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Forgot your password?</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-gray-100 p-6 flex flex-col gap-4">
        <p className="text-sm text-text-muted text-center">
          ForgotPasswordForm — coming in feature build
        </p>
      </div>

      <p className="text-center text-sm text-text-secondary">
        Remembered it?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
