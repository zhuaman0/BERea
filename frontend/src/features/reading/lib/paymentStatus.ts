/**
 * Payment step of registration. Off for now: players go Account → Team → app, and nothing asks for a
 * receipt. Flip to `true` to bring back the Payment step, the redirect to it and the checklist item.
 */
export const PAYMENT_STEP_ENABLED = false;

/** A team that has sent its receipt can use the app while an admin reviews it; only a rejected or missing payment sends it back to the payment step. */
export function hasSubmittedPayment(status: string | null | undefined): boolean {
  return status === "pending" || status === "approved";
}

export function needsPayment(status: string | null | undefined): boolean {
  return PAYMENT_STEP_ENABLED && !hasSubmittedPayment(status);
}
