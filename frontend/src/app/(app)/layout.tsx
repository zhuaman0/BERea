import { AppSidebar } from "@/shared/components/layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AppSidebar />

      <div className="flex flex-col flex-1 min-h-0">
        {/* Mobile top bar — sidebar is hidden on small screens */}
        <header className="md:hidden shrink-0 flex items-center gap-2.5 bg-white border-b border-slate-100 px-4 h-14">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            B
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">BERea</span>
        </header>

        {/* Scrollable content area — pb-20 leaves room for the mobile bottom tab bar */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
