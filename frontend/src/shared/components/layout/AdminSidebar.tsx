"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { href: "/admin",          label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users",    label: "Users",    icon: Users            },
  { href: "/admin/settings", label: "Settings", icon: Settings         },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    document.cookie = "berea-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-60 h-full bg-slate-900 shrink-0">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
          <Shield size={16} className="text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-white text-sm font-bold tracking-tight">BERea</span>
          <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left",
                "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-slate-800 pt-4 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors duration-100"
        >
          <LogOut size={17} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
