import type { ApiError } from "@berea/core";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost/api";

export interface TeamRegistrationInput {
  teamName:     string;
  member1Name:  string;
  member2Name:  string;
  member3Name:  string;
  contactEmail: string;
  contactPhone?: string;
  receipt:      File;
}

export interface TeamRegistrationResult {
  id:         string;
  team_name:  string;
  status:     string;
  created_at: string;
}

export const readingRegistrationApi = {
  async registerTeam(input: TeamRegistrationInput): Promise<TeamRegistrationResult> {
    const form = new FormData();
    form.set("team_name",      input.teamName);
    form.set("member_1_name",  input.member1Name);
    form.set("member_2_name",  input.member2Name);
    form.set("member_3_name",  input.member3Name);
    form.set("contact_email",  input.contactEmail);
    if (input.contactPhone) form.set("contact_phone", input.contactPhone);
    form.set("receipt", input.receipt);

    const res = await fetch(`${API_BASE}/v1/reading/teams/register`, {
      method: "POST",
      body:   form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { detail?: unknown };
      const detail =
        typeof body.detail === "string" ? body.detail : "Could not submit registration. Please try again.";
      throw { detail, status: res.status } satisfies ApiError;
    }

    return res.json() as Promise<TeamRegistrationResult>;
  },
};
