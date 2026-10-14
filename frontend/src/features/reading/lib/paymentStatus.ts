/** A team that has sent its receipt can use the app while an admin reviews it; only a rejected or missing payment sends it back to the payment step. */
export function hasSubmittedPayment(status: string | null | undefined): boolean {
  return status === "pending" || status === "approved";
}
