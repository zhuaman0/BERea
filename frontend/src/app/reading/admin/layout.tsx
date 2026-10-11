import { ReadingAdminSidebar } from "@/features/reading/components/ReadingAdminSidebar";
import { AdminGate } from "@/features/reading/components/admin/AdminGate";

export default function ReadingAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <ReadingAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminGate>{children}</AdminGate>
      </main>
    </div>
  );
}
