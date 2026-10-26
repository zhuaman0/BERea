export type BonusTaskStatus = "open" | "done";

export interface BonusTask {
  id:     string;
  title:  string;
  points: number;
  status: BonusTaskStatus;
  note:   string;
}
