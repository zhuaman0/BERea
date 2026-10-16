"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Vote,
  Trophy,
  Users,
  BookOpen,
  UserCircle,
  Settings,
  LogOut,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { initials } from "@berea/core";
import { isReadingRouteLocked } from "@/features/reading/lib/launchSections";
import type { ReadingTeam } from "@berea/api";
import { useReadingLogout } from "../hooks/useReadingLogout";

type NavKey = "home" | "vote" | "leaderboard" | "team" | "rules" | "profile";

interface NavItem {
  href:   string;
  navKey: NavKey;
  icon:   LucideIcon;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/reading",             navKey: "home",        icon: Home },
  { href: "/reading/games",       navKey: "vote",        icon: Vote },
  { href: "/reading/leaderboard", navKey: "leaderboard", icon: Trophy },
  { href: "/reading/team",        navKey: "team",        icon: Users },
  { href: "/reading/rules",       navKey: "rules",       icon: BookOpen },
  { href: "/reading/profile",     navKey: "profile",     icon: UserCircle },
];

interface ReadingSidebarProps {
  team:               ReadingTeam | null;
  seasonStarted:      boolean;
  leaderboardEnabled: boolean;
}

interface NavEntryProps {
  href:     string;
  label:    string;
  icon:     LucideIcon;
  isActive: boolean;
  isLocked: boolean;
}

function NavLink({ href, label, icon: Icon, isActive, isLocked }: NavEntryProps) {
  const t = useTranslations("reading.shell");

  if (isLocked) {
    return (
      <span
        aria-disabled="true"
        title={t("lockedHint")}
        className={`flex cursor-not-allowed select-none items-center gap-3 rounded-lg px-3 py-2 text-[13px] ${
          isActive ? "bg-white/[0.04] text-[var(--rd-text-muted)]" : "text-[var(--rd-text-muted)]/50"
        }`}
      >
        <Icon size={16} strokeWidth={1.75} className="shrink-0" />
        <span className="flex-1">{label}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--rd-border)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--rd-text-muted)]">
          <Lock size={9} strokeWidth={2.25} />
          {t("soon")}
        </span>
      </span>
    );
  }

  return (
    <Link
      href={href as Route}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${
        isActive
          ? "bg-white/[0.06] font-medium text-[var(--rd-text)]"
          : "text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
      }`}
    >
      <Icon size={16} strokeWidth={isActive ? 2 : 1.75} className="shrink-0" />
      {label}
    </Link>
  );
}

function MobileTab({ href, label, icon: Icon, isActive, isLocked }: NavEntryProps) {
  const t = useTranslations("reading.shell");

  if (isLocked) {
    return (
      <span
        aria-disabled="true"
        title={t("lockedHint")}
        className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] text-[var(--rd-text-muted)]/50"
      >
        <span className="relative">
          <Icon size={18} strokeWidth={1.75} />
          <Lock
            size={9}
            strokeWidth={2.5}
            className="absolute -bottom-0.5 -right-1.5 rounded-full bg-[var(--rd-panel)] text-[var(--rd-accent-from)]"
          />
        </span>
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href as Route}
      className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] transition-colors duration-150 ${
        isActive ? "text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]"
      }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
      {label}
    </Link>
  );
}

export function ReadingSidebar({ team, seasonStarted, leaderboardEnabled }: ReadingSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useReadingLogout();
  const t = useTranslations("reading.shell");

  const navItems = leaderboardEnabled
    ? BASE_NAV_ITEMS
    : BASE_NAV_ITEMS.filter((item) => item.href !== "/reading/leaderboard");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--rd-border)] bg-[var(--rd-panel)] md:flex">
        <nav className="flex flex-col gap-1 px-3 pt-5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.navKey}`)}
              icon={item.icon}
              isActive={pathname === item.href}
              isLocked={isReadingRouteLocked(item.href, seasonStarted)}
            />
          ))}
        </nav>

        {team && (
          <div className="mt-6 flex-1 overflow-y-auto px-3">
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">
              {t("teamHeading", { name: team.name })}
            </p>
            <div className="flex flex-col gap-1">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                  <span className="rd-accent-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black/80">
                    {initials(member.full_name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] leading-none text-[var(--rd-text)]">{member.full_name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--rd-text-muted)]">
                      @{member.email.split("@")[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 border-t border-[var(--rd-border)] px-3 py-3">
          <NavLink
            href="/reading/settings"
            label={t("nav.settings")}
            icon={Settings}
            isActive={pathname === "/reading/settings"}
            isLocked={false}
          />
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-[var(--rd-text-muted)] transition-colors duration-150 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
            {isLoggingOut ? t("loggingOut") : t("logout")}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--rd-border)] bg-[var(--rd-panel)] px-2 py-2 md:hidden">
        {navItems.map((item) => (
          <MobileTab
            key={item.href}
            href={item.href}
            label={t(`nav.${item.navKey}`)}
            icon={item.icon}
            isActive={pathname === item.href}
            isLocked={isReadingRouteLocked(item.href, seasonStarted)}
          />
        ))}
      </nav>
    </>
  );
}
