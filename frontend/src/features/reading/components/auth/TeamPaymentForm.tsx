"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Copy, FileText, ImageIcon, Loader2, Phone, Upload } from "lucide-react";
import { readingAuthApi, readingRegistrationApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import { ENTRY_FEE, PAYMENT_PHONE, PAYMENT_PHONE_DISPLAY } from "@/features/reading/lib/seasonRules";

const MAX_RECEIPT_SIZE_MB = 5;
const MAX_RECEIPT_SIZE_BYTES = MAX_RECEIPT_SIZE_MB * 1024 * 1024;
const RECEIPT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function TeamPaymentForm() {
  const router = useRouter();
  const t = useTranslations("reading.auth.payment");
  const updateUser = useReadingAuthStore((state) => state.updateUser);
  const teamName = useReadingAuthStore((state) => state.user?.team_name);
  const isCaptain = useReadingAuthStore((state) => state.user?.is_captain ?? false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPhoneCopied, setIsPhoneCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleReceiptChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReceiptError(null);

    if (!file) {
      setReceipt(null);
      return;
    }
    if (!RECEIPT_TYPES.includes(file.type)) {
      setReceipt(null);
      setReceiptError(t("invalidType"));
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setReceipt(null);
      setReceiptError(t("tooLarge", { size: MAX_RECEIPT_SIZE_MB }));
      return;
    }
    setReceipt(file);
  }

  async function handleCopyPhone() {
    try {
      await navigator.clipboard.writeText(PAYMENT_PHONE);
      setIsPhoneCopied(true);
      window.setTimeout(() => setIsPhoneCopied(false), 2000);
    } catch { /* clipboard blocked — the number is still on screen to type */ }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (!receipt) {
      setReceiptError(t("receiptRequired", { fee: ENTRY_FEE }));
      return;
    }

    setIsSubmitting(true);
    try {
      const payment = await readingRegistrationApi.submitTeamPayment({ receipt });
      updateUser({ payment_status: payment.status });
      router.push("/reading");
    } catch (error: unknown) {
      setServerError(isApiError(error) ? error.detail : t("uploadFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCheckAgain() {
    setIsChecking(true);
    // Once the captain has paid, the stage guard sees the new status and moves this player on.
    readingAuthApi
      .me()
      .then(updateUser)
      .catch(() => { /* API client handles expired sessions */ })
      .finally(() => setIsChecking(false));
  }

  if (!isCaptain) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-4">
          <p className="text-[13px] font-medium text-[var(--rd-text)]">{t("waitingTitle", { team: teamName ?? t("yourTeam") })}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--rd-text-muted)]">
            {t("waitingBody", { fee: ENTRY_FEE })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCheckAgain}
          disabled={isChecking}
          className="h-12 w-full rounded-xl border border-[var(--rd-border)] text-[14px] font-semibold text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] disabled:opacity-50"
        >
          {isChecking ? t("checking") : t("checkAgain")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-[13px] text-red-400">{serverError}</p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rd-text-muted)]">{t("teamPayment")}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="truncate text-[13px] font-medium text-[var(--rd-text)]">{teamName ?? t("yourTeam")}</p>
          <p className="shrink-0 font-display text-lg font-semibold text-[var(--rd-accent-from)]">{ENTRY_FEE}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--rd-accent-from)]/40 bg-[var(--rd-accent-from)]/[0.06] px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rd-text-muted)]">
          {t("sendTo", { fee: ENTRY_FEE })}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <a
            href={`tel:${PAYMENT_PHONE}`}
            className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-wide text-[var(--rd-text)]"
          >
            <Phone size={18} className="shrink-0 text-[var(--rd-accent-from)]" />
            {PAYMENT_PHONE_DISPLAY}
          </a>
          <button
            type="button"
            onClick={handleCopyPhone}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3 py-1.5 text-[12px] font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
          >
            {isPhoneCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {isPhoneCopied ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--rd-text-muted)]">
          {t("transferHint")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--rd-text)]">{t("receiptLabel")}</span>
        <label
          className={cn(
            "flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[var(--rd-panel)] px-4 text-center transition-colors",
            receiptError ? "border-red-400" : "border-[var(--rd-border)] hover:border-[var(--rd-accent-from)]"
          )}
        >
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleReceiptChange}
          />
          {receipt ? (
            <>
              {receipt.type === "application/pdf" ? (
                <FileText size={22} className="text-[var(--rd-accent-from)]" />
              ) : (
                <ImageIcon size={22} className="text-[var(--rd-accent-from)]" />
              )}
              <span className="max-w-full truncate text-[13px] text-[var(--rd-text)]">{receipt.name}</span>
              <span className="text-[11px] text-[var(--rd-text-muted)]">{t("clickToReplace")}</span>
            </>
          ) : (
            <>
              <Upload size={22} className="text-[var(--rd-text-muted)]" />
              <span className="text-[13px] text-[var(--rd-text)]">{t("uploadReceipt", { fee: ENTRY_FEE })}</span>
              <span className="text-[11px] text-[var(--rd-text-muted)]">{t("receiptFormats", { size: MAX_RECEIPT_SIZE_MB })}</span>
            </>
          )}
        </label>
        {receiptError && <p className="text-[11px] text-red-400">{receiptError}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rd-accent-gradient mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {t("submit", { fee: ENTRY_FEE })}
      </button>
    </form>
  );
}
