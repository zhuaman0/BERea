import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">Your analytics</h1>
      <p className="text-text-secondary">
        Weekly and monthly breakdowns of your study habits.
      </p>
      {/* Charts wired to /v1/study-sessions/analytics — built in features/analytics */}
    </div>
  );
}
