"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, LayoutGrid, Settings, UserRound, Users, Vote, Plus, type LucideIcon } from "lucide-react";

interface NavItem {
  href:  string;
  label: string;
  icon:  LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/reading/admin",       label: "Quizzes", icon: LayoutGrid },
  { href: "/reading/admin/books", label: "Books",   icon: BookOpen },
  { href: "/reading/admin/votes", label: "Book vote", icon: Vote },
  { href: "/reading/admin/teams", label: "Teams",   icon: Users },
  { href: "/reading/admin/players", label: "Players", icon: UserRound },
  { href: "/reading/admin/payments", label: "Payments", icon: ClipboardCheck },
  { href: "/reading/admin/settings", label: "Settings", icon: Settings },
];

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/reading/admin") return pathname.startsWith("/reading/admin/quizzes");
  return pathname.startsWith(`${href}/`);
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

export function ReadingAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--rd-border)] bg-[var(--rd-panel)] md:flex">
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <Image src="/logo_451.png" alt="451° gradus" width={36} height={36} priority className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-semibold text-[var(--rd-text)]">451 GRADUS</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">Admin panel</p>
        </div>
      </div>

      <div className="px-3 pt-5">
        <Link
          href={"/reading/admin/quizzes/new" as Route}
          className="rd-accent-gradient flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-black/85 transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          Create Quiz
        </Link>
      </div>

      <nav className="mt-5 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} isActive={isNavActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--rd-border)] px-3 py-3">
        <Link
          href={"/reading" as Route}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[var(--rd-text-muted)] transition-colors duration-150 hover:text-[var(--rd-text)]"
        >
          Back to student view
        </Link>
      </div>
    </aside>
  );
}
