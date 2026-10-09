"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Trash2, ArrowRight, Settings,
  Loader2, LayoutGrid, Palette, Layers, DoorOpen,
} from "lucide-react";
import { configuratorApi, SavedDesignOut } from "@/features/configurator/configuratorApi";
import { useConfiguratorStore, COLORS, TEMPLATES } from "@/features/configurator/useConfiguratorStore";
import { FurniturePreview } from "@/features/configurator/FurniturePreview";
import type {
  ConfiguratorTemplate, MaterialColor, DoorStyle, HandleStyle, FurnitureCategory,
} from "@/features/configurator/useConfiguratorStore";

const CATEGORY_LABEL: Record<string, string> = {
  kitchen: "Кухня", living: "Гостиная", bedroom: "Спальня",
  hallway: "Прихожая", office: "Офис",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatPrice(n: unknown): string {
  const num = typeof n === "number" ? n : Number(n);
  if (!num) return "—";
  return num.toLocaleString("ru-RU") + " ₸";
}

export default function DesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const loadFromSaved = useConfiguratorStore(s => s.loadFromSaved);

  const [design,   setDesign]   = useState<SavedDesignOut | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    configuratorApi.get(id)
      .then(setDesign)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!design) return;
    setDeleting(true);
    try {
      await configuratorApi.delete(design.id);
      router.push("/my-designs");
    } catch {
      setDeleting(false);
    }
  }

  function handleOpenInConfigurator() {
    if (!design) return;
    loadFromSaved(design.configuration);
    router.push("/configurator");
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 size={24} className="text-stone-300 animate-spin" />
    </div>
  );

  if (notFound || !design) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
      <p className="text-[11px] tracking-[0.25em] uppercase text-stone-400">Не найдено</p>
      <Link href="/my-designs" className="text-[13px] font-light text-stone-700 underline underline-offset-4">
        Вернуться к дизайнам
      </Link>
    </div>
  );

  const cfg        = design.configuration as Record<string, unknown>;
  const category   = (cfg.category as string | undefined) ?? "kitchen";
  const template   = (cfg.template  as ConfiguratorTemplate | undefined) ?? TEMPLATES[category as FurnitureCategory]?.[0] ?? TEMPLATES.kitchen[0];
  const color      = (cfg.color     as MaterialColor        | undefined) ?? COLORS[0];
  const doorStyle  = cfg.doorStyle as DoorStyle  | undefined;
  const handle     = cfg.handle    as HandleStyle | undefined;
  const totalPrice = cfg.totalPrice;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-stone-900">
        <div className="px-8 md:px-12 max-w-5xl">

          {/* Breadcrumb */}
          <div className="pt-8 pb-0">
            <Link
              href="/my-designs"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-white text-[11px] tracking-[0.08em] uppercase font-medium transition-colors"
            >
              <ArrowLeft size={11} />
              Мои дизайны
            </Link>
          </div>

          {/* Main row */}
          <div className="flex items-end justify-between gap-6 py-10 border-b border-stone-800">
            <div className="flex items-center gap-6">
              {/* Color swatch */}
              <div
                className="w-20 h-20 shrink-0 border border-stone-700"
                style={{ backgroundColor: color?.hex ?? "#a8a29e" }}
              />
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-stone-500 mb-2">
                  {CATEGORY_LABEL[category] ?? category}
                </p>
                <h1 className="text-4xl font-extralight text-white leading-none tracking-tight">
                  {design.name}
                </h1>
                <div className="flex items-center gap-2 mt-3 text-stone-500">
                  <Calendar size={11} />
                  <span className="text-[11px]">{formatDate(design.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="shrink-0 text-right">
              <p className="text-[9px] tracking-[0.3em] uppercase text-stone-500 mb-1">Стоимость</p>
              <p className="text-3xl font-extralight text-white tabular-nums">{formatPrice(totalPrice)}</p>
            </div>
          </div>

          {/* Spec strip */}
          <div className="grid grid-cols-4 border-b border-stone-800">
            {[
              { icon: <LayoutGrid size={12} />, label: "Шаблон",   value: template.label },
              { icon: <Palette    size={12} />, label: "Цвет",     value: color.label  },
              { icon: <Layers     size={12} />, label: "Фасад",    value: doorStyle?.label   ?? "—" },
              { icon: <DoorOpen   size={12} />, label: "Ручка",    value: handle?.label      ?? "—" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="py-5 pr-6 border-r border-stone-800 last:border-r-0">
                <div className="flex items-center gap-1.5 text-stone-600 mb-1.5">
                  {icon}
                  <span className="text-[9px] tracking-[0.2em] uppercase">{label}</span>
                </div>
                <p className="text-[13px] font-light text-stone-300 truncate">{value}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── 3D Preview ───────────────────────────────────────────────── */}
      <div className="bg-stone-100 border-b border-stone-200" style={{ height: 340 }}>
        <FurniturePreview template={template} color={color} />
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="px-8 md:px-12 py-10 max-w-5xl flex flex-col gap-8">

        {/* Configurator details card */}
        <div className="border border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-6 py-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400">Конфигурация</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">

            {/* Left: structure */}
            <div className="px-6 py-6 flex flex-col gap-5">
              <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400">Структура</p>

              {[
                { label: "Категория",      value: CATEGORY_LABEL[category] ?? category },
                { label: "Шаблон",         value: template.label },
                { label: "Нижние секции",  value: String(template.bottomDoors) },
                { label: "Верхние секции", value: String(template.topDoors) },
                { label: "Остров",         value: template.hasIsland ? "Есть" : "Нет" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[12px] text-stone-400 font-light">{label}</span>
                  <span className="text-[13px] text-stone-900 font-light">{value}</span>
                </div>
              ))}
            </div>

            {/* Right: materials */}
            <div className="px-6 py-6 flex flex-col gap-5">
              <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400">Материалы</p>

              {[
                { label: "Цвет корпуса", value: color.label, swatch: color.hex },
                { label: "Фасад",        value: doorStyle?.label ?? "—" },
                { label: "Материал фасада", value: doorStyle?.sub ?? "—" },
                { label: "Ручки",        value: handle?.label    ?? "—" },
              ].map(({ label, value, swatch }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[12px] text-stone-400 font-light">{label}</span>
                  <div className="flex items-center gap-2">
                    {swatch && (
                      <div
                        className="w-4 h-4 border border-stone-200 shrink-0"
                        style={{ backgroundColor: swatch }}
                      />
                    )}
                    <span className="text-[13px] text-stone-900 font-light">{value}</span>
                  </div>
                </div>
              ))}

              {/* Price row */}
              <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[12px] text-stone-400 font-light">Итого</span>
                <span className="text-[15px] text-stone-900 font-light tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleOpenInConfigurator}
            className="group sm:col-span-2 flex items-center justify-between gap-4 p-5 border border-stone-900 bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 border border-stone-700 flex items-center justify-center text-stone-400 group-hover:border-stone-500 group-hover:text-white transition-colors">
                <Settings size={15} strokeWidth={1.75} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-light text-white">Открыть в конфигураторе</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Изменить и сохранить снова</p>
              </div>
            </div>
            <ArrowRight size={13} className="text-stone-600 group-hover:text-stone-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="group flex items-center justify-between gap-4 p-5 border border-stone-200 bg-white hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            <div className="text-left">
              <p className="text-[13px] font-light text-stone-700 group-hover:text-red-600 transition-colors">Удалить дизайн</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Без возможности восстановления</p>
            </div>
            {deleting
              ? <Loader2 size={14} className="text-stone-300 animate-spin shrink-0" />
              : <Trash2  size={14} className="text-stone-300 group-hover:text-red-400 transition-colors shrink-0" />
            }
          </button>
        </div>

      </div>
    </div>
  );
}
