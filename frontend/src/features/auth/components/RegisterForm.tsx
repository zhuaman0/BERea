"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { authApi } from "@/features/auth/api";
import { isApiError } from "@/features/auth/utils";
import { usersApi } from "@/features/users/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { User } from "@/types/auth";

const registerSchema = z.object({
  full_name: z.string().min(2, "Имя должно содержать не менее 2 символов").max(100),
  email:     z.string().email("Введите корректный адрес почты"),
  password:  z.string().min(8, "Пароль должен содержать не менее 8 символов"),
});

type RegisterValues = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterValues, string>>;

const inputBase =
  "h-11 w-full border border-stone-200 bg-white px-4 text-[13px] text-stone-900 placeholder:text-stone-300 transition-colors focus:outline-none focus:border-stone-500";

export function RegisterForm() {
  const router = useRouter();
  const { setSession, updateUser } = useAuthStore();

  const [values,       setValues]       = useState<RegisterValues>({ full_name: "", email: "", password: "" });
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
      const { access_token, refresh_token } = await authApi.register(result.data);

      const placeholder: User = {
        id: "", email: result.data.email, full_name: result.data.full_name,
        avatar_url: null, is_active: true, is_verified: false,
        current_streak: 0, longest_streak: 0, last_study_date: null,
        created_at: new Date().toISOString(),
      };
      setSession(placeholder, access_token, refresh_token);
      document.cookie = "berea-session=1; path=/; SameSite=Lax";

      try {
        const profile = await usersApi.me();
        updateUser(profile);
      } catch { /* continue with placeholder */ }

      router.push("/dashboard");
    } catch (err: unknown) {
      setServerError(
        isApiError(err) ? err.detail : "Что-то пошло не так. Попробуйте ещё раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {serverError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-600">{serverError}</p>
        </div>
      )}

      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-[11px] tracking-[0.08em] uppercase font-medium text-stone-500">
          Полное имя
        </label>
        <input
          id="reg-name"
          type="text"
          value={values.full_name}
          onChange={(e) => setField("full_name", e.target.value)}
          placeholder="Иван Иванов"
          autoComplete="name"
          className={cn(inputBase, fieldErrors.full_name && "border-red-400 focus:border-red-400")}
        />
        {fieldErrors.full_name && (
          <p className="text-[11px] text-red-500">{fieldErrors.full_name}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-[11px] tracking-[0.08em] uppercase font-medium text-stone-500">
          Электронная почта
        </label>
        <input
          id="reg-email"
          type="email"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={cn(inputBase, fieldErrors.email && "border-red-400 focus:border-red-400")}
        />
        {fieldErrors.email && (
          <p className="text-[11px] text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-[11px] tracking-[0.08em] uppercase font-medium text-stone-500">
          Пароль
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Не менее 8 символов"
            autoComplete="new-password"
            className={cn(inputBase, "pr-11", fieldErrors.password && "border-red-400 focus:border-red-400")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-[11px] text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full bg-stone-900 text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-800 active:bg-black transition-colors disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
        )}
        Создать аккаунт
      </button>
    </form>
  );
}
