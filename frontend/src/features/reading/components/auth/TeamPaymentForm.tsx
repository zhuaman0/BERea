"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ImageIcon, Loader2, Upload } from "lucide-react";
import { readingRegistrationApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";

const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;
const RECEIPT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function TeamPaymentForm() {
  const router = useRouter();
  const updateUser = useReadingAuthStore((state) => state.updateUser);
  const teamName = useReadingAuthStore((state) => state.user?.team_name);
  const [description, setDescription] = useState("");
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
      setReceiptError("Upload a PDF, JPG, PNG, or WebP file");
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setReceipt(null);
      setReceiptError("Receipt must be under 5 MB");
      return;
    }
    setReceipt(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (description.trim().length < 3) {
      setServerError("Add a short payment description");
      return;
    }
    if (!receipt) {
      setReceiptError("Attach the 3 000 ₸ payment receipt");
      return;
    }

    setIsSubmitting(true);
    try {
      const payment = await readingRegistrationApi.submitTeamPayment({
        paymentDescription: description.trim(),
        receipt,
      });
      updateUser({ payment_status: payment.status });
      router.push("/reading");
    } catch (error: unknown) {
      setServerError(isApiError(error) ? error.detail : "Could not upload the receipt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-[13px] text-red-400">{serverError}</p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rd-text-muted)]">Team payment</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="truncate text-[13px] font-medium text-[var(--rd-text)]">{teamName ?? "Your team"}</p>
          <p className="shrink-0 font-display text-lg font-semibold text-[var(--rd-accent-from)]">3 000 ₸</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payment-description" className="text-xs font-medium text-[var(--rd-text)]">
          Payment description
        </label>
        <textarea
          id="payment-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="For example: Team entry fee, paid by the captain"
          className="w-full resize-none rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 py-3 text-[13px] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:border-[var(--rd-accent-from)] focus:outline-none"
        />
        <p className="text-right text-[10px] text-[var(--rd-text-muted)]">{description.length}/500</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--rd-text)]">Payment receipt</span>
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
              <span className="text-[11px] text-[var(--rd-text-muted)]">Click to replace</span>
            </>
          ) : (
            <>
              <Upload size={22} className="text-[var(--rd-text-muted)]" />
              <span className="text-[13px] text-[var(--rd-text)]">Upload the 3 000 ₸ receipt</span>
              <span className="text-[11px] text-[var(--rd-text-muted)]">PDF, JPG, PNG, or WebP · up to 5 MB</span>
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
        Submit receipt — 3 000 ₸
      </button>
    </form>
  );
}
