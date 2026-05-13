"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 600));

    if (email === "admin@berea.com" && password === "admin123") {
      document.cookie = "berea-admin-session=1; path=/; SameSite=Lax";
      router.push("/admin");
    } else {
      setError("Invalid email or password.");
    }

    setIsSubmitting(false);
  }

  const inputBase =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 mb-4">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">BERea Administration Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 px-8 py-8">

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
              <span className="text-red-400 mt-px shrink-0">⚠</span>
              <p className="text-sm text-red-600 leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@berea.com"
                autoComplete="email"
                required
                className={inputBase}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={cn(inputBase, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="mt-1 h-11 w-full rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:bg-black transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
            >
              {isSubmitting && (
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Sign in
            </button>
          </form>
        </div>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
          <Shield size={12} />
          <span>Restricted access — authorised personnel only</span>
        </div>
      </div>
    </div>
  );
}
