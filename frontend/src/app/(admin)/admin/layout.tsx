"use client";

import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";
import { AdminSidebar } from "@/shared/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  function handleLogout() {
    document.cookie = "berea-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar />

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top header */}
        <header className="shrink-0 flex items-center justify-between bg-white border-b border-slate-200 px-6 h-16">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">BERea Admin</span>
          </div>

          {/* Page context (desktop fills the left side naturally) */}
          <div className="hidden md:block" />

          {/* Right: admin identity + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-sm font-semibold text-slate-900">Admin</span>
                <span className="text-xs text-slate-400">admin@berea.com</span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors font-medium focus-visible:outline-none"
            >
              <LogOut size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
