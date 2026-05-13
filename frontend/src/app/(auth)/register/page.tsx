import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "@/shared/components/ui/GoogleButton";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[10px] font-bold text-slate-400 tracking-[0.12em] whitespace-nowrap">
        OR CONTINUE WITH EMAIL
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header — outside the card */}
      <div className="text-center px-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Join BERea to find your perfect study method
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-7 flex flex-col gap-5">
        <GoogleButton />
        <AuthDivider />
        <RegisterForm />
      </div>

      {/* Footer — outside the card */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
