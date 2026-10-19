"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Check, Eye, Loader2, RotateCcw, X } from "lucide-react";
import { readingRegistrationApi } from "@berea/api";
import type { TeamPaymentAdminRow } from "@berea/api";
import { isApiError } from "@/features/auth/utils";

export function PaymentReviewTable() {
  const [payments, setPayments] = useState<TeamPaymentAdminRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptType, setReceiptType] = useState<string | null>(null);
  const t = useTranslations("reading.admin.payments");
  const tCommon = useTranslations("reading.admin.common");
  const format = useFormatter();

  useEffect(() => {
    readingRegistrationApi
      .listTeamPayments()
      .then(setPayments)
      .catch((err) => setLoadError(isApiError(err) ? err.detail : t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  useEffect(() => {
    return () => {
      if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    };
  }, [receiptUrl]);

  async function updatePayment(paymentId: string, status: "pending" | "approved" | "rejected") {
    setUpdatingPaymentId(paymentId);
    setLoadError(null);
    try {
      const updated = await readingRegistrationApi.updatePaymentStatus(paymentId, status);
      setPayments((current) => current.map((payment) => (
        payment.payment_id === paymentId ? { ...payment, status: updated.status as TeamPaymentAdminRow["status"] } : payment
      )));
    } catch (err) {
      setLoadError(isApiError(err) ? err.detail : t("updateError"));
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  async function openReceipt(paymentId: string) {
    setReceiptError(null);
    try {
      const receipt = await readingRegistrationApi.getReceipt(paymentId);
      const url = URL.createObjectURL(receipt);
      setReceiptUrl(url);
      setReceiptType(receipt.type);
    } catch (err) {
      setReceiptError(isApiError(err) ? err.detail : t("receiptError"));
    }
  }

  function closeReceipt() {
    setReceiptUrl(null);
    setReceiptType(null);
  }

  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--rd-text-muted)]">{t("description")}</p>
        </div>
        <span className="rounded-full border border-[var(--rd-border)] px-3 py-1 text-xs text-[var(--rd-text-muted)]">
          {t("pendingCount", { count: payments.filter((payment) => payment.status === "pending").length })}
        </span>
      </div>

      {loadError && <p role="alert" className="mt-6 text-sm text-red-400">{loadError}</p>}
      {receiptError && <p role="alert" className="mt-2 text-sm text-red-400">{receiptError}</p>}
      {!isLoading && payments.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--rd-text-muted)]">{t("empty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rd-border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                <th className="px-6 py-4 font-medium">{t("columns.team")}</th>
                <th className="px-6 py-4 font-medium">{t("columns.amount")}</th>
                <th className="px-6 py-4 font-medium">{t("columns.status")}</th>
                <th className="px-6 py-4 font-medium">{t("columns.receipt")}</th>
                <th className="px-6 py-4 font-medium">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rd-border)]">
              {payments.map((payment) => (
                <tr key={payment.payment_id ?? payment.team_id}>
                  <td className="px-6 py-4"><p className="font-medium text-[var(--rd-text)]">{payment.team_name}</p><p className="mt-1 text-xs text-[var(--rd-text-muted)]">{payment.submitted_by_email ?? t("noEmail")}</p></td>
                  <td className="whitespace-nowrap px-6 py-4 text-[var(--rd-text)]">{t("amount", { amount: format.number(payment.amount_tenge) })}</td>
                  <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${payment.status === "approved" ? "bg-emerald-400/10 text-emerald-300" : payment.status === "rejected" ? "bg-red-400/10 text-red-300" : "bg-amber-400/10 text-amber-300"}`}>{t(`status.${payment.status ?? "none"}`)}</span></td>
                  <td className="px-6 py-4">{payment.payment_id ? <button type="button" onClick={() => openReceipt(payment.payment_id!)} className="inline-flex items-center gap-2 text-[var(--rd-accent-from)] hover:underline"><Eye size={15} /> {t("viewFile")}</button> : "—"}</td>
                  <td className="px-6 py-4">{payment.payment_id && payment.status === "pending" ? <div className="flex items-center gap-2"><button type="button" disabled={updatingPaymentId === payment.payment_id} onClick={() => updatePayment(payment.payment_id!, "approved")} aria-label={t("approve")} title={t("approve")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-50">{updatingPaymentId === payment.payment_id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}</button><button type="button" disabled={updatingPaymentId === payment.payment_id} onClick={() => updatePayment(payment.payment_id!, "rejected")} aria-label={t("reject")} title={t("reject")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-50"><X size={15} /></button></div> : payment.payment_id && payment.status ? <button type="button" disabled={updatingPaymentId === payment.payment_id} onClick={() => updatePayment(payment.payment_id!, "pending")} aria-label={t("returnToPendingAria")} title={t("returnToPending")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 disabled:opacity-50"><RotateCcw size={15} /></button> : <span className="text-xs text-[var(--rd-text-muted)]">{t("reviewed")}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {receiptUrl && (
        <div role="dialog" aria-modal="true" aria-label={t("receiptTitle")} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={closeReceipt}>
          <div className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--rd-border)] px-5 py-3">
              <p className="text-sm font-medium text-[var(--rd-text)]">{t("receiptTitle")}</p>
              <button type="button" onClick={closeReceipt} aria-label={t("closeReceipt")} title={t("closeReceipt")} className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[var(--rd-text-muted)] hover:bg-white/[0.06] hover:text-[var(--rd-text)]">×</button>
            </div>
            <div className="min-h-0 flex-1 bg-black/20 p-3">
              <iframe
                title={receiptType === "application/pdf" ? t("receiptPdf") : t("receiptImage")}
                src={receiptUrl}
                className="h-full w-full rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}