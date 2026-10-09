import { ReadingAdminSidebar } from "@/features/reading/components/ReadingAdminSidebar";

export default function ReadingAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <ReadingAdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
