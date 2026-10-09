import { ReadingTopbar } from "@/features/reading/components/ReadingTopbar";
import { ReadingSidebar } from "@/features/reading/components/ReadingSidebar";
import { ReadingStageGuard } from "@/features/reading/components/auth/ReadingStageGuard";
import { MOCK_DASHBOARD } from "@/features/reading/mockData";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ReadingStageGuard mode="require-team" />
      <ReadingTopbar
        seasonLabel={MOCK_DASHBOARD.seasonLabel}
        monthIndex={MOCK_DASHBOARD.monthIndex}
        monthTotal={MOCK_DASHBOARD.monthTotal}
        totalPoints={MOCK_DASHBOARD.totalPoints}
      />

      <div className="flex min-h-0 flex-1">
        <ReadingSidebar team={MOCK_DASHBOARD.team} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
