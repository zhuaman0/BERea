"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Sofa,
  BookMarked,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { authApi } from "@/features/auth/api";
import { LocaleSwitcher } from "@/shared/components/ui/LocaleSwitcher";

interface NavItem {
  href:  string;
  label: string;
  icon:  LucideIcon;
}

interface NavGroup {
  heading: string;
  items:   NavItem[];
}

const COLLAPSED_KEY = "sidebar-collapsed";
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(onChange: () => void): () => void {
  collapsedListeners.add(onChange);
  return () => collapsedListeners.delete(onChange);
}

function readCollapsed(): boolean {
  return localStorage.getItem(COLLAPSED_KEY) === "true";
}

function readCollapsedOnServer(): boolean {
  return false;
}

function setCollapsed(value: boolean): void {
  localStorage.setItem(COLLAPSED_KEY, String(value));
  collapsedListeners.forEach((notify) => notify());
}

export function AppSidebar() {
  const t        = useTranslations("nav");
  const pathname = usePathname();
  const router   = useRouter();
  const { user, refreshToken, clearSession } = useAuthStore();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, readCollapsedOnServer);

  const NAV_GROUPS: NavGroup[] = [
    {
      heading: "Обзор",
      items: [
        { href: "/dashboard",    label: t("dashboard"),    icon: LayoutDashboard },
      ],
    },
    {
      heading: "Мебель",
      items: [
        { href: "/catalog",      label: t("catalog"),      icon: ShoppingBag },
        { href: "/configurator", label: t("configurator"), icon: Sofa        },
        { href: "/my-designs",   label: t("myDesigns"),    icon: BookMarked  },
      ],
    },
    {
      heading: "Аккаунт",
      items: [
        { href: "/profile",      label: t("profile"),      icon: User },
      ],
    },
  ];

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // clear local session even if server revocation fails
    }
    clearSession();
    document.cookie = "berea-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push("/login");
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const displayName = user?.full_name || user?.email?.split("@")[0] || "—";

  function NavLink({ href, label, icon: Icon }: NavItem) {
    const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
    return (
      <Link
        href={href as Route}
        title={collapsed ? label : undefined}
        className={`relative flex items-center transition-colors duration-150 ${
          collapsed
            ? "justify-center py-3 px-0"
            : "gap-3 px-3 py-2"
        } ${
          isActive
            ? "text-stone-900 font-medium"
            : "text-stone-400 hover:text-stone-700"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-stone-900" />
        )}
        <Icon size={15} strokeWidth={isActive ? 2 : 1.75} className="shrink-0" />
        {!collapsed && <span className="text-[13px]">{label}</span>}
      </Link>
    );
  }

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full bg-white border-r border-stone-100 transition-[width] duration-300 overflow-hidden ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* Logo + toggle */}
        <div className={`flex items-center shrink-0 h-[60px] border-b border-stone-100 ${
          collapsed ? "justify-center" : "pl-5 pr-3 gap-2"
        }`}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <div className="w-6 h-6 bg-stone-900 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
              M
            </div>
            {!collapsed && (
              <span className="text-[13px] font-light tracking-[0.18em] uppercase text-stone-900 truncate">
                Мебель Studio
              </span>
            )}
          </Link>

          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              title="Развернуть"
              className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-colors duration-150"
            >
              <PanelLeftOpen size={14} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(true)}
              title="Свернуть"
              className="shrink-0 w-7 h-7 flex items-center justify-center text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-colors duration-150"
            >
              <PanelLeftClose size={14} />
            </button>
          )}
        </div>

        {/* Navigation groups */}
        <nav className={`flex flex-col flex-1 overflow-y-auto ${
          collapsed ? "px-2 pt-2" : "gap-5 px-3 pt-6"
        }`}>
          {NAV_GROUPS.map(({ heading, items }, idx) => (
            <div key={heading}>
              {!collapsed ? (
                <p className="text-[9px] tracking-[0.25em] uppercase text-stone-300 px-3 mb-1">
                  {heading}
                </p>
              ) : (
                idx > 0 && <div className="h-px bg-stone-100 my-2" />
              )}
              {items.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          ))}
        </nav>

        {/* Language switcher */}
        {!collapsed && (
          <div className="px-5 py-3 border-t border-stone-100">
            <LocaleSwitcher />
          </div>
        )}

        {/* User + Logout */}
        <div className={`border-t border-stone-100 py-3 flex flex-col gap-1 ${
          collapsed ? "px-2" : "px-3"
        }`}>
          <div className={`flex items-center py-2 ${
            collapsed ? "justify-center" : "gap-2.5 px-3"
          }`}>
            <div
              className="w-7 h-7 bg-stone-900 flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
              title={collapsed ? displayName : undefined}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-stone-900 truncate leading-none">
                  {displayName}
                </p>
                <p className="text-[11px] text-stone-400 truncate mt-0.5">{user?.email ?? "—"}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={collapsed ? t("signOut") : undefined}
            className={`w-full flex items-center gap-3 py-2 text-stone-400 hover:text-red-500 transition-colors duration-150 ${
              collapsed ? "justify-center" : "px-3"
            }`}
          >
            <LogOut size={14} />
            {!collapsed && <span className="text-[13px]">{t("signOut")}</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 flex items-center justify-around px-2 py-2">
        {NAV_GROUPS.flatMap((g) => g.items).map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href as Route}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] tracking-wide transition-colors duration-150 ${
                isActive ? "text-stone-900" : "text-stone-400"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
