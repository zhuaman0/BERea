"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, FlaskConical, BarChart3, Settings, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { authApi } from "@/features/auth/api";

const NAV_ITEMS = [
  { href: "/profile",   label: "Profile",   icon: User         },
  { href: "/study",     label: "Study Lab",  icon: FlaskConical },
  { href: "/methods",   label: "Methods",    icon: BookOpen     },
  { href: "/analytics", label: "Analytics",  icon: BarChart3    },
  { href: "/settings",  label: "Settings",   icon: Settings     },
] as const;

export function AppSidebar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user, refreshToken, clearSession } = useAuthStore();

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Clear local session even if server-side revocation fails
    }
    clearSession();
    // Expire the session cookie so the middleware guard redirects correctly
    document.cookie = "berea-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full bg-white border-r border-slate-100 px-4 py-6">

        {/* Logo */}
        <Link href="/profile" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-200/60">
            B
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">BERea</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-100 pt-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.full_name || user?.email?.split("@")[0] || "—"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email ?? "—"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-1.5 safe-area-inset-bottom">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
