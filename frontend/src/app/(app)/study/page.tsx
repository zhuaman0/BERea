import type { Metadata } from "next";

export const metadata: Metadata = { title: "Study" };

export default function StudyPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">Study lab</h1>
      <p className="text-text-secondary">Choose a method and start a session.</p>
      {/* Method selector + Pomodoro timer — built in features/pomodoro */}
    </div>
  );
}
