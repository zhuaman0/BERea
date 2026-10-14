"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { readingAuthService } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { nextReadingStage } from "@/features/reading/lib/nextStage";
import type { ReadingUser } from "@berea/api";

const loginSchema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginValues, string>>;

const inputBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 text-[13px] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

export function ReadingLoginForm() {
  const router = useRouter();
  const invite = useSearchParams().get("invite");
  const { setSession, updateUser } = useReadingAuthStore();

  const [values,       setValues]       = useState<LoginValues>({ email: "", password: "" });
  const [fieldErrors,  setFieldErrors]  = useState<FieldErrors>({});
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof LoginValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginValues;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const { access_token, refresh_token } = await readingAuthService.login(result.data);

      const placeholder: ReadingUser = {
        id: "", email: result.data.email, full_name: "",
        team_name: null, payment_status: null, token_balance: 0, current_streak: 0, is_admin: false,
        is_captain: false, created_at: new Date().toISOString(),
      };
      setSession(placeholder, access_token, refresh_token);

      let profile: ReadingUser = placeholder;
      try {
        profile = await readingAuthService.me();
        updateUser(profile);
      } catch { /* continue with placeholder */ }

      router.push(nextReadingStage(profile, invite));
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

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <input
          id="login-email"
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

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rd-accent-gradient mt-2 h-12 w-full rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0e05] border-t-transparent" />
        )}
        Sign in
      </button>
    </form>
  );
}
