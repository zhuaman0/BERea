"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Home,
  Gamepad2,
  Trophy,
  Users,
  BookOpen,
  UserCircle,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { ReadingTeam } from "@berea/api";
import { readingSettingsApi } from "@berea/api";

interface NavItem {
  href:  string;
  label: string;
  icon:  LucideIcon;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/reading",             label: "Home",        icon: Home },
  { href: "/reading/games",       label: "Games",       icon: Gamepad2 },
  { href: "/reading/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/reading/team",        label: "My team",     icon: Users },
  { href: "/reading/rules",       label: "Rules",       icon: BookOpen },
  { href: "/reading/profile",     label: "Profile",     icon: UserCircle },
];

interface ReadingSidebarProps {
  team: ReadingTeam | null;
}

function NavLink({ href, label, icon: Icon, isActive }: NavItem & { isActive: boolean }) {
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

export function ReadingSidebar({ team }: ReadingSidebarProps) {
  const pathname = usePathname();
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);

  useEffect(() => {
    readingSettingsApi.get().then((s) => setLeaderboardEnabled(s.leaderboard_enabled)).catch(() => {
      /* keep the leaderboard link visible if settings fail to load */
    });
  }, []);

  const navItems = leaderboardEnabled
    ? BASE_NAV_ITEMS
    : BASE_NAV_ITEMS.filter((item) => item.href !== "/reading/leaderboard");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--rd-border)] bg-[var(--rd-panel)] md:flex">
        <nav className="flex flex-col gap-1 px-3 pt-5">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} isActive={pathname === item.href} />
          ))}
        </nav>

        {team && (
          <div className="mt-6 flex-1 overflow-y-auto px-3">
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">
              Team · {team.name}
            </p>
            <div className="flex flex-col gap-1">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                  <span className="h-7 w-7 shrink-0 rounded-full bg-[var(--rd-border)]" />
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
            label="Settings"
            icon={Settings}
            isActive={pathname === "/reading/settings"}
          />
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-[var(--rd-text-muted)] transition-colors duration-150 hover:text-red-400">
            <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--rd-border)] bg-[var(--rd-panel)] px-2 py-2 md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href as Route}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] transition-colors duration-150 ${
                isActive ? "text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
