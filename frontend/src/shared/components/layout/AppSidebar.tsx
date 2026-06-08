"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, ShoppingBag, Sofa, BookMarked, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { authApi } from "@/features/auth/api";
import { LocaleSwitcher } from "@/shared/components/ui/LocaleSwitcher";

export function AppSidebar() {
  const t        = useTranslations("nav");
  const pathname = usePathname();
  const router   = useRouter();
  const { user, refreshToken, clearSession } = useAuthStore();

  const NAV_ITEMS = [
    { href: "/dashboard",   label: t("dashboard"),   icon: LayoutDashboard },
    { href: "/catalog",     label: t("catalog"),     icon: ShoppingBag     },
    { href: "/configurator",label: t("configurator"),icon: Sofa            },
    { href: "/my-designs",  label: t("myDesigns"),   icon: BookMarked      },
    { href: "/profile",     label: t("profile"),     icon: User            },
  ] as const;

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Clear local session even if server-side revocation fails
    }
    clearSession();
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-md">
            M
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">Мебель Studio</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div className="px-3 py-3">
          <LocaleSwitcher />
        </div>

        {/* User + Logout */}
        <div className="border-t border-slate-100 pt-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold shrink-0">
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
            {t("signOut")}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-1.5 safe-area-inset-bottom">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150",
                isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
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
