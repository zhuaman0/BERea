"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { readingAuthApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { nextReadingStage } from "@/features/reading/lib/nextStage";

const codeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code from the email");

export function VerifyEmailForm() {
  const router = useRouter();
  const invite = useSearchParams().get("invite");
  const { user, updateUser } = useReadingAuthStore();

  const [code,         setCode]         = useState("");
  const [fieldError,   setFieldError]   = useState<string | null>(null);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [notice,       setNotice]       = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending,  setIsResending]  = useState(false);

  function handleChange(value: string) {
    setCode(value.replace(/\D/g, "").slice(0, 6));
    if (fieldError) setFieldError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setNotice(null);
    const result = codeSchema.safeParse(code);
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter the code");
      return;
    }
    setIsSubmitting(true);
    try {
      const profile = await readingAuthApi.verifyEmail(result.data);
      updateUser(profile);
      router.push(nextReadingStage(profile, invite));
    } catch (err: unknown) {
      setServerError(isApiError(err) ? err.detail : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setServerError(null);
    setNotice(null);
    setIsResending(true);
    try {
      await readingAuthApi.resendCode();
      setCode("");
      setNotice("We sent a new code. Codes expire after 10 minutes.");
    } catch (err: unknown) {
      setServerError(isApiError(err) ? err.detail : "Couldn't send a new code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-[var(--rd-text-muted)]">
        We sent a 6-digit code to <span className="font-medium text-[var(--rd-text)]">{user?.email ?? "your email"}</span>.
        Enter it below to confirm the address is yours.
      </p>

      {serverError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-[13px] text-red-400">{serverError}</p>
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
          <p className="text-[13px] text-emerald-300">{notice}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="verify-code" className="text-[13px] font-medium text-[var(--rd-text)]">
          Verification code
        </label>
        <input
          id="verify-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="000000"
          className={cn(
            "h-14 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 text-center font-display text-2xl tracking-[0.5em] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)]/40 transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]",
            fieldError && "border-red-400 focus:border-red-400"
          )}
        />
        {fieldError && <p className="text-[11px] text-red-400">{fieldError}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rd-accent-gradient mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0e05] border-t-transparent" />}
        Verify email
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="text-[13px] text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)] disabled:opacity-50"
      >
        {isResending ? "Sending…" : "Didn't get it? Send a new code"}
      </button>
    </form>
  );
}
