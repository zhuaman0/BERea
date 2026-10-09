import { AppSidebar } from "@/shared/components/layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAFAF8] overflow-hidden">
      <AppSidebar />

      <div className="flex flex-col flex-1 min-h-0">
        {/* Mobile top bar */}
        <header className="md:hidden shrink-0 flex items-center gap-2.5 bg-white border-b border-stone-100 px-4 h-14">
          <div className="w-6 h-6 bg-stone-900 flex items-center justify-center text-white text-[11px] font-semibold">
            M
          </div>
          <span className="text-[13px] font-light tracking-[0.18em] uppercase text-stone-900">Мебель Studio</span>
        </header>

        {/* Scrollable content area — pb-20 leaves room for the mobile bottom tab bar */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
