"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { authApi } from "@/features/auth/api";
import { isApiError } from "@/features/auth/utils";
import { usersApi } from "@/features/users/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { User } from "@/types/auth";

export function LoginForm() {
  const t      = useTranslations("auth");
  const router = useRouter();
  const { setSession, updateUser } = useAuthStore();

  const loginSchema = z.object({
    email:    z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  });

  type LoginValues = z.infer<typeof loginSchema>;
  type FieldErrors = Partial<Record<keyof LoginValues, string>>;

  const [values, setValues]           = useState<LoginValues>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof LoginValues>(key: K, value: string) {
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
      const { access_token, refresh_token } = await authApi.login(result.data);

      const placeholder: User = {
        id: "", email: result.data.email, full_name: "", avatar_url: null,
        is_active: true, is_verified: false, current_streak: 0,
        longest_streak: 0, last_study_date: null, created_at: new Date().toISOString(),
      };
      setSession(placeholder, access_token, refresh_token);
      document.cookie = "berea-session=1; path=/; SameSite=Lax";

      try {
        const profile = await usersApi.me();
        updateUser(profile);
      } catch {
        // Continue with placeholder
      }

      router.push("/profile");
    } catch (err: unknown) {
      setServerError(
        isApiError(err) ? err.detail : t("somethingWentWrong")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputBase =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <span className="text-red-400 mt-px shrink-0">⚠</span>
          <p className="text-sm text-red-600 leading-snug">{serverError}</p>
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
          {t("email")}
        </label>
        <input
          id="login-email"
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          aria-invalid={fieldErrors.email ? "true" : undefined}
          aria-describedby={fieldErrors.email ? "login-email-err" : undefined}
          className={cn(inputBase, fieldErrors.email && "border-red-400 focus:ring-red-400")}
        />
        {fieldErrors.email && (
          <p id="login-email-err" role="alert" className="text-xs text-red-500">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
            {t("password")}
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            aria-invalid={fieldErrors.password ? "true" : undefined}
            aria-describedby={fieldErrors.password ? "login-password-err" : undefined}
            className={cn(
              inputBase, "pr-11",
              fieldErrors.password && "border-red-400 focus:ring-red-400"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="login-password-err" role="alert" className="text-xs text-red-500">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-11 w-full rounded-xl bg-blue-800 text-white text-sm font-semibold hover:bg-blue-900 active:bg-blue-950 transition-colors disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {isSubmitting && (
          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {t("login")}
      </button>
    </form>
  );
}
