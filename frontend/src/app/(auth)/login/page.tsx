import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to continue learning</p>
      </div>

      {/* LoginForm will be built in features/auth/components */}
      <div className="bg-surface rounded-card shadow-card border border-gray-100 p-6 flex flex-col gap-4">
        <p className="text-sm text-text-muted text-center">Login form — coming in feature build</p>
      </div>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
