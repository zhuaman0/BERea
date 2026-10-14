import type { Route } from "next";
import type { ReadingUser } from "@berea/api";
import { hasSubmittedPayment } from "./paymentStatus";

function withInvite(path: string, invite: string | null): Route {
  return (invite ? `${path}?invite=${encodeURIComponent(invite)}` : path) as Route;
}

/** Where a signed-in player belongs next: verify email → create/join a team → pay → the app. A pending invite rides along until it's used. */
export function nextReadingStage(user: Pick<ReadingUser, "email_verified" | "team_name" | "payment_status">, invite: string | null = null): Route {
  if (!user.email_verified) return withInvite("/reading/verify-email", invite);
  if (!user.team_name) return withInvite("/reading/join-team", invite);
  return hasSubmittedPayment(user.payment_status) ? "/reading" : "/reading/payment";
}
