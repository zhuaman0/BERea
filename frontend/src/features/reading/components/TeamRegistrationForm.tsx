"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { readingRegistrationApi } from "@/features/reading/registrationApi";
import { isApiError } from "@/features/auth/utils";

const REGISTRATION_FEE = "3 000 ₸";
const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;

const teamRegistrationSchema = z.object({
  teamName:     z.string().min(2, "Team name is required").max(120),
  member1Name:  z.string().min(1, "Required").max(120),
  member2Name:  z.string().min(1, "Required").max(120),
  member3Name:  z.string().min(1, "Required").max(120),
  contactEmail: z.string().email("Enter a valid email address"),
  contactPhone: z.string().max(32).optional(),
});

type TeamRegistrationValues = z.infer<typeof teamRegistrationSchema>;

const inputBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 text-[13px] text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

export function TeamRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamRegistrationValues>({ resolver: zodResolver(teamRegistrationSchema) });

  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setReceipt(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setReceipt(null);
      setReceiptError("Receipt must be a PDF file");
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setReceipt(null);
      setReceiptError("Receipt must be under 5MB");
      return;
    }
    setReceiptError(null);
    setReceipt(file);
  }

  async function onSubmit(values: TeamRegistrationValues) {
    if (!receipt) {
      setReceiptError("Attach your payment receipt (PDF)");
      return;
    }
    setServerError(null);
    setIsSubmitting(true);
    try {
      await readingRegistrationApi.registerTeam({
        teamName:     values.teamName,
        member1Name:  values.member1Name,
        member2Name:  values.member2Name,
        member3Name:  values.member3Name,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        receipt,
      });
      setIsDone(true);
    } catch (err: unknown) {
      setServerError(isApiError(err) ? err.detail : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[var(--rd-accent-from)]/40 bg-[var(--rd-panel)] px-8 py-14 text-center">
        <span className="rd-accent-gradient flex h-14 w-14 items-center justify-center rounded-full">
          <CheckCircle2 size={26} className="text-[#1a0e05]" />
        </span>
        <h3 className="font-display text-xl font-semibold text-[var(--rd-text)]">
          Team registered
        </h3>
        <p className="max-w-sm text-sm text-[var(--rd-text-muted)]">
          We&apos;ve received your team and payment receipt. We&apos;ll confirm your spot by
          email once it&apos;s reviewed.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-[28px] border border-[var(--rd-border)] bg-[var(--rd-panel)] p-8"
    >
      {serverError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-[13px] text-red-400">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
          Team name
        </label>
        <input
          type="text"
          placeholder="e.g. Алау"
          className={cn(inputBase, errors.teamName && "border-red-400 focus:border-red-400")}
          {...register("teamName")}
        />
        {errors.teamName && <p className="text-[11px] text-red-400">{errors.teamName.message}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
          Teammates (3 players)
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["member1Name", "member2Name", "member3Name"] as const).map((field, i) => (
            <div key={field} className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder={`Player ${i + 1} full name`}
                className={cn(inputBase, errors[field] && "border-red-400 focus:border-red-400")}
                {...register(field)}
              />
              {errors[field] && <p className="text-[11px] text-red-400">{errors[field]?.message}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
            Contact email
          </label>
          <input
            type="email"
            placeholder="captain@example.com"
            className={cn(inputBase, errors.contactEmail && "border-red-400 focus:border-red-400")}
            {...register("contactEmail")}
          />
          {errors.contactEmail && <p className="text-[11px] text-red-400">{errors.contactEmail.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
            Phone (optional)
          </label>
          <input
            type="tel"
            placeholder="+7 701 123 4567"
            className={inputBase}
            {...register("contactPhone")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--rd-text-muted)]">
          Payment receipt — {REGISTRATION_FEE} per team (PDF)
        </label>
        <label
          className={cn(
            "flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center transition-colors",
            receiptError
              ? "border-red-400 bg-red-500/5"
              : "border-[var(--rd-border)] bg-[var(--rd-ink)] hover:border-[var(--rd-accent-from)]/50"
          )}
        >
          <input type="file" accept="application/pdf" className="hidden" onChange={handleReceiptChange} />
          {receipt ? (
            <>
              <FileText size={20} className="text-[var(--rd-accent-from)]" />
              <span className="px-4 text-[13px] text-[var(--rd-text)]">{receipt.name}</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-[var(--rd-text-muted)]" />
              <span className="text-[13px] text-[var(--rd-text-muted)]">
                Click to upload your bank transfer receipt
              </span>
            </>
          )}
        </label>
        {receiptError && <p className="text-[11px] text-red-400">{receiptError}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rd-accent-gradient mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-[#1a0e05] transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Register our team — {REGISTRATION_FEE}
      </button>
    </form>
  );
}
