export interface QuizNight {
  daysLeft:    number;
  hoursLeft:   number;
  minutesLeft: number;
  dateLabel:   string;
  location:    string;
  teamsCount:  number;
  entryNote:   string;
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
  greetingName: string;
  greetingNote: string;
  quizNight:    QuizNight;
  bonusTasks:   BonusTask[];
}
