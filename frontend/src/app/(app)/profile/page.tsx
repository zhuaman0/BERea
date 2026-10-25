"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  Pencil, ShoppingBag, Heart, Calendar,
  ChevronRight, Bell, Shield, LogOut, Palette, Settings,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { authApi } from "@/features/auth/api";
import { configuratorApi } from "@/features/configurator/configuratorApi";

function daysSince(iso: string | null | undefined): string {
  if (!iso) return "0";
  return String(Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export default function ProfilePage() {
  const { user, refreshToken, clearSession } = useAuthStore();
  const router = useRouter();
  const [designCount, setDesignCount] = useState(0);

  useEffect(() => {
    configuratorApi.list().then(d => setDesignCount(d.length)).catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* revoke best-effort */ }
    clearSession();
    document.cookie = "berea-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push("/login");
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const displayName = user?.full_name || "—";

  const STATS = [
    { icon: <Heart size={13} />,       label: "Дизайнов",    value: String(designCount)        },
    { icon: <ShoppingBag size={13} />, label: "Заказов",     value: "0"                        },
    { icon: <Calendar size={13} />,    label: "Дней с нами", value: daysSince(user?.created_at) },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-stone-900">
        <div className="px-8 md:px-12 max-w-5xl">

          {/* Identity row */}
          <div className="flex items-center justify-between gap-6 py-10 border-b border-stone-800">

            <div className="flex items-center gap-7">
              {/* Avatar */}
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- Google profile picture on a host we don't allow-list for next/image
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-24 h-24 object-cover shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 select-none">
                  <span className="text-3xl font-extralight text-stone-400">{initials}</span>
                </div>
              )}

              {/* Name + meta */}
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-stone-600 mb-2">Аккаунт</p>
                <h1 className="text-4xl font-extralight text-white leading-none tracking-tight">
                  {displayName}
                </h1>
                <p className="text-stone-500 text-[13px] mt-2 font-light">{user?.email ?? "—"}</p>
                {user && !user.is_verified && (
                  <p className="text-[11px] text-amber-500 mt-2">Email не подтверждён</p>
                )}
              </div>
            </div>

            <button className="shrink-0 flex items-center gap-2 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 text-[10px] tracking-[0.15em] uppercase font-medium px-4 py-2.5 transition-colors">
              <Pencil size={11} strokeWidth={2} />
              Изменить
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3">
            {STATS.map(({ icon, label, value }) => (
              <div key={label} className="py-6 pr-8 border-r border-stone-800 last:border-r-0">
                <p className="text-3xl font-extralight text-white tabular-nums leading-none mb-2">{value}</p>
                <div className="flex items-center gap-1.5 text-stone-500">
                  {icon}
                  <p className="text-[11px]">{label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="px-8 md:px-12 py-10 max-w-5xl flex flex-col gap-10">

        {/* ── Quick actions ──────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-5">Разделы</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/my-designs"
              className="group flex flex-col gap-4 p-5 border border-stone-200 bg-white hover:border-stone-400 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-9 h-9 border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-stone-900 group-hover:text-stone-900 transition-colors">
                <Palette size={15} strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-light text-stone-900">Мои дизайны</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Сохранённые конфигурации</p>
              </div>
              <ArrowRight size={13} className="text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            <Link
              href={"/orders" as Route}
              className="group flex flex-col gap-4 p-5 border border-stone-200 bg-white hover:border-stone-400 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-9 h-9 border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-stone-900 group-hover:text-stone-900 transition-colors">
                <ShoppingBag size={15} strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-light text-stone-900">Мои заказы</p>
                <p className="text-[11px] text-stone-400 mt-0.5">История и статусы</p>
              </div>
              <ArrowRight size={13} className="text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            <Link
              href="/configurator"
              className="group flex flex-col gap-4 p-5 border border-stone-900 bg-stone-900 hover:bg-stone-800 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-9 h-9 border border-stone-700 flex items-center justify-center text-stone-400 group-hover:border-stone-500 group-hover:text-white transition-colors">
                <Settings size={15} strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-light text-white">Конфигуратор</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Создать новую мебель</p>
              </div>
              <ArrowRight size={13} className="text-stone-600 group-hover:text-stone-400 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          </div>
        </div>

        {/* ── Settings ───────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-5">Настройки</p>

          <div className="bg-white border border-stone-200">
            {[
              {
                icon: <Bell size={14} strokeWidth={1.75} />,
                label: "Уведомления",
                desc: "Заказы, акции и новинки",
              },
              {
                icon: <Shield size={14} strokeWidth={1.75} />,
                label: "Безопасность",
                desc: "Пароль и двухфакторная защита",
              },
            ].map(({ icon, label, desc }) => (
              <button
                key={label}
                className="group w-full flex items-center gap-4 px-5 py-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
              >
                <span className="text-stone-400 group-hover:text-stone-700 transition-colors shrink-0">
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-light text-stone-900">{label}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={13} className="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="group w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut size={14} strokeWidth={1.75} className="text-red-400 shrink-0" />
              <p className="text-[13px] font-light text-red-500">Выйти</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
