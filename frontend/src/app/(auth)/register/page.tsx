import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
        <p className="mt-1 text-sm text-text-secondary">Start discovering how you learn</p>
      </div>

      {/* RegisterForm will be built in features/auth/components */}
      <div className="bg-surface rounded-card shadow-card border border-gray-100 p-6 flex flex-col gap-4">
        <p className="text-sm text-text-muted text-center">Register form — coming in feature build</p>
      </div>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
