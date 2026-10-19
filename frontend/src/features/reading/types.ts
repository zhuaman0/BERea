export interface QuizNight {
  daysLeft:    number;
  hoursLeft:   number;
  minutesLeft: number;
  startsAt:    string;
  location:    string;
  teamsCount:  number;
}

export type BonusTaskStatus = "open" | "done";

export interface BonusTask {
  id:     string;
  title:  string;
  points: number;
  status: BonusTaskStatus;
  note:   string;
}

export interface ReadingDashboard {
  quizNight:    QuizNight;
  bonusTasks:   BonusTask[];
}
