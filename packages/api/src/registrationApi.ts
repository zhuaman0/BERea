import { readingApiClient } from "./readingApiClient";

export interface TeamPaymentInput {
  receipt: File;
}

export interface TeamRegistrationResult {
  id:         string;
  team_name:  string;
  payment_description: string;
  amount_tenge: number;
  status:     string;
  created_at: string;
}

export interface TeamPaymentAdminRow {
  team_id: string;
  team_name: string;
  member_count: number;
  payment_id: string | null;
  submitted_by_email: string | null;
  payment_description: string | null;
  amount_tenge: number;
  receipt_content_type: string | null;
  status: "pending" | "approved" | "rejected" | null;
  submitted_at: string | null;
}

export const readingRegistrationApi = {
  submitTeamPayment(input: TeamPaymentInput): Promise<TeamRegistrationResult> {
    const form = new FormData();
    form.set("receipt", input.receipt);
    return readingApiClient.postForm<TeamRegistrationResult>("/v1/reading/teams/payment", form);
  },

  listTeamPayments: () =>
    readingApiClient.get<TeamPaymentAdminRow[]>("/v1/reading/team-payments"),

  updatePaymentStatus: (paymentId: string, status: "pending" | "approved" | "rejected") =>
    readingApiClient.patch<TeamRegistrationResult>(`/v1/reading/team-payments/${paymentId}`, { status }),

  getReceipt: (paymentId: string) =>
    readingApiClient.getBlob(`/v1/reading/team-payments/${paymentId}/receipt`),
};
