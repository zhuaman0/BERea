"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { readingAuthApi, readingAuthService } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingUser } from "@berea/api";

const registerSchema = z.object({
  full_name: z.string().min(1, "Enter your name").max(120),
  email:     z.string().email("Enter a valid email address"),
  password:  z.string().min(8, "At least 8 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterValues, string>>;

const inputBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 text-[13px] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

export function ReadingRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedTeam = searchParams.get("team");
  const { setSession, updateUser } = useReadingAuthStore();

  const [values, setValues] = useState<RegisterValues>({ full_name: "", email: "", password: "" });
  const [fieldErrors,  setFieldErrors]  = useState<FieldErrors>({});
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof RegisterValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterValues;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const { access_token, refresh_token } = await readingAuthService.register(result.data);

      const placeholder: ReadingUser = {
        id: "", email: result.data.email, full_name: result.data.full_name,
        team_name: null, token_balance: 0, current_streak: 0, is_admin: false, created_at: new Date().toISOString(),
      };
      setSession(placeholder, access_token, refresh_token);

      try {
        const profile = await readingAuthService.me();
        updateUser(profile);
      } catch { /* continue with placeholder */ }

      // Came in through a teammate's invite link — join that team immediately
      // instead of making them retype the name on the onboarding step.
      if (invitedTeam) {
        try {
          const profile = await readingAuthApi.joinTeam({ team_name: invitedTeam });
          updateUser(profile);
          router.push("/reading");
          return;
        } catch { /* team may be full or renamed — let them join manually below */ }
      }

      router.push(
        invitedTeam ? `/reading/join-team?team=${encodeURIComponent(invitedTeam)}` : "/reading/join-team"
      );
    } catch (err: unknown) {
      setServerError(
        isApiError(err) ? err.detail : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      {serverError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-[13px] text-red-400">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <input
          id="register-name"
          type="text"
          value={values.full_name}
          onChange={(e) => setField("full_name", e.target.value)}
          placeholder="Full name"
          autoComplete="name"
          aria-label="Full name"
          className={cn(inputBase, fieldErrors.full_name && "border-red-400 focus:border-red-400")}
        />
        {fieldErrors.full_name && <p className="text-[11px] text-red-400">{fieldErrors.full_name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          id="register-email"
          type="email"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-label="Email"
          className={cn(inputBase, fieldErrors.email && "border-red-400 focus:border-red-400")}
        />
        {fieldErrors.email && <p className="text-[11px] text-red-400">{fieldErrors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            aria-label="Password"
            className={cn(inputBase, "pr-11", fieldErrors.password && "border-red-400 focus:border-red-400")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--rd-text-muted)] hover:text-[var(--rd-text)] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-[11px] text-red-400">{fieldErrors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rd-accent-gradient mt-2 h-12 w-full rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0e05] border-t-transparent" />
        )}
        Create account
      </button>
    </form>
  );
}
