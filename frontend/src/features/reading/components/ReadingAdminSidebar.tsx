"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, ClipboardCheck, LayoutGrid, Settings, UserRound, Users, Vote, Plus, type LucideIcon } from "lucide-react";

type NavKey = "quizzes" | "books" | "votes" | "teams" | "players" | "payments" | "settings";

interface NavItem {
  href:     string;
  labelKey: NavKey;
  icon:     LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/reading/admin",          labelKey: "quizzes",  icon: LayoutGrid },
  { href: "/reading/admin/books",    labelKey: "books",    icon: BookOpen },
  { href: "/reading/admin/votes",    labelKey: "votes",    icon: Vote },
  { href: "/reading/admin/teams",    labelKey: "teams",    icon: Users },
  { href: "/reading/admin/players",  labelKey: "players",  icon: UserRound },
  { href: "/reading/admin/payments", labelKey: "payments", icon: ClipboardCheck },
  { href: "/reading/admin/settings", labelKey: "settings", icon: Settings },
];

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/reading/admin") return pathname.startsWith("/reading/admin/quizzes");
  return pathname.startsWith(`${href}/`);
}

interface NavLinkProps {
  href:     string;
  label:    string;
  icon:     LucideIcon;
  isActive: boolean;
}

function NavLink({ href, label, icon: Icon, isActive }: NavLinkProps) {
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
  const t = useTranslations("reading.admin.sidebar");

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--rd-border)] bg-[var(--rd-panel)] md:flex">
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <Image src="/logo_451.png" alt={t("logoAlt")} width={36} height={36} priority className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-semibold text-[var(--rd-text)]">451 GRADUS</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--rd-text-muted)]">{t("panel")}</p>
        </div>
      </div>

      <div className="px-3 pt-5">
        <Link
          href={"/reading/admin/quizzes/new" as Route}
          className="rd-accent-gradient flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-black/85 transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          {t("createQuiz")}
        </Link>
      </div>

      <nav className="mt-5 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={t(`nav.${item.labelKey}`)}
            icon={item.icon}
            isActive={isNavActive(pathname, item.href)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--rd-border)] px-3 py-3">
        <Link
          href={"/reading" as Route}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[var(--rd-text-muted)] transition-colors duration-150 hover:text-[var(--rd-text)]"
        >
          {t("backToStudent")}
        </Link>
      </div>
    </aside>
  );
}
