import { CalendarRange, Crown, Send, Users, Vote, Wallet, type LucideIcon } from "lucide-react";
import { PAYMENT_STEP_ENABLED } from "./paymentStatus";

export const ENTRY_FEE = "3 000 ₸";
export const PAYMENT_PHONE = "87057287996";
export const PAYMENT_PHONE_DISPLAY = "8 705 728 79 96";

export type SeasonRuleId = "entryFee" | "team" | "telegram" | "vote" | "season" | "winner";

export interface SeasonRule {
  id:      SeasonRuleId;
  bodyKey: "body" | "bodyWithReceipt";
  icon:    LucideIcon;
}

export const SEASON_RULES: readonly SeasonRule[] = [
  { id: "entryFee", bodyKey: PAYMENT_STEP_ENABLED ? "bodyWithReceipt" : "body", icon: Wallet },
  { id: "team",     bodyKey: "body", icon: Users },
  { id: "telegram", bodyKey: "body", icon: Send },
  { id: "vote",     bodyKey: "body", icon: Vote },
  { id: "season",   bodyKey: "body", icon: CalendarRange },
  { id: "winner",   bodyKey: "body", icon: Crown },
];

export const SEASON_GOALS = ["habit", "readers", "community"] as const;

export const SEASON_FACTS: readonly { id: "months" | "books" | "languages" | "players"; value: number }[] = [
  { id: "months",    value: 4 },
  { id: "books",     value: 4 },
  { id: "languages", value: 3 },
  { id: "players",   value: 3 },
];
