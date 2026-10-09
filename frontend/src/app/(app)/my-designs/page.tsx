"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, ArrowRight, Sofa, Trash2, Share2, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { configuratorApi, SavedDesignOut } from "@/features/configurator/configuratorApi";

const FILTERS = [
  { id: "all",     label: "Все"      },
  { id: "kitchen", label: "Кухня"    },
  { id: "living",  label: "Гостиная" },
  { id: "bedroom", label: "Спальня"  },
  { id: "office",  label: "Офис"     },
] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function thisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function categoryFromConfig(configuration: Record<string, unknown>): string {
  const cat = configuration.category as string | undefined;
  if (!cat) return "all";
  if (cat === "kitchen")  return "kitchen";
  if (cat === "living")   return "living";
  if (cat === "bedroom")  return "bedroom";
  if (cat === "office")   return "office";
  return "all";
}

export default function MyDesignsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [query,        setQuery]        = useState("");
  const [designs,      setDesigns]      = useState<SavedDesignOut[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await configuratorApi.list();
      setDesigns(data);
    } catch {
      // stays empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await configuratorApi.delete(id);
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = designs.filter(d => {
    const matchesFilter = activeFilter === "all" || categoryFromConfig(d.configuration) === activeFilter;
    const matchesQuery  = !query || d.name.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const thisMonthCount = designs.filter(d => thisMonth(d.created_at)).length;

  const STATS = [
    { label: "Всего дизайнов", value: String(designs.length),  sub: "конфигураций" },
    { label: "В этом месяце",  value: String(thisMonthCount),  sub: "новых"        },
    { label: "Заказов",        value: "0",                      sub: "оформлено"    },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Dark header band ─────────────────────────────────────────── */}
      <div className="bg-stone-900 px-8 md:px-12 pt-12 pb-0">
        <div className="max-w-5xl">

          {/* Title row */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-stone-500 mb-2">Мебель</p>
              <h1 className="text-3xl font-extralight text-white leading-tight">Мои дизайны</h1>
              <p className="text-stone-500 text-[13px] mt-1 font-light">Сохранённые конфигурации мебели</p>
            </div>
            <Link
              href="/configurator"
              className="shrink-0 inline-flex items-center gap-2 border border-stone-700 text-white text-[10px] font-semibold tracking-widest uppercase px-5 py-3 hover:border-stone-400 transition-colors duration-200"
            >
              <Plus size={12} strokeWidth={2.5} />
              Новый дизайн
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 border-t border-stone-800">
            {STATS.map(({ label, value }) => (
              <div key={label} className="py-6 pr-6 border-r border-stone-800 last:border-r-0">
                <p className="text-2xl font-extralight text-white tabular-nums leading-none mb-1">{value}</p>
                <p className="text-[11px] text-stone-500">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="px-8 md:px-12 py-8 max-w-5xl flex flex-col gap-6">

        {/* ── Search + filters ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" strokeWidth={2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск дизайнов..."
              className="w-full pl-10 pr-4 py-3 text-[13px] bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-500 transition-colors font-light"
            />
          </div>

          <div className="flex border border-stone-200 bg-white shrink-0">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveFilter(id)}
                className={cn(
                  "px-4 py-3 text-[11px] tracking-[0.08em] uppercase font-semibold transition-colors duration-150 border-r border-stone-200 last:border-r-0",
                  activeFilter === id
                    ? "bg-stone-900 text-white"
                    : "text-stone-400 hover:text-stone-700 hover:bg-stone-50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Designs panel ──────────────────────────────────────────── */}
        <div className="border border-stone-200 bg-white">

          {/* Header strip */}
          <div className="border-b border-stone-100 px-6 py-4 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400">
              {activeFilter === "all" ? "Все дизайны" : FILTERS.find(f => f.id === activeFilter)?.label}
            </p>
            <p className="text-[11px] text-stone-300">{filtered.length} позиций</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="text-stone-300 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-24 px-6 text-center">
              <div className="w-20 h-20 border border-stone-200 flex items-center justify-center mb-8">
                <Sofa size={28} strokeWidth={1} className="text-stone-300" />
              </div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 mb-4">Пусто</p>
              <h3 className="text-xl font-extralight text-stone-900 mb-3 max-w-xs leading-snug">
                {designs.length === 0 ? "Нет сохранённых дизайнов" : "Нет результатов"}
              </h3>
              <p className="text-stone-400 text-[13px] max-w-sm mb-10 leading-relaxed font-light">
                {designs.length === 0
                  ? "Создайте свою первую конфигурацию мебели в конфигураторе — она сохранится здесь автоматически"
                  : "Попробуйте изменить фильтр или поисковый запрос"}
              </p>
              {designs.length === 0 && (
                <Link
                  href="/configurator"
                  className="group inline-flex items-center gap-2 border border-stone-900 bg-stone-900 text-white text-[11px] font-semibold tracking-widest uppercase px-6 py-3 hover:bg-stone-800 transition-colors duration-200"
                >
                  Открыть конфигуратор
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              )}
            </div>
          )}

          {/* Design cards */}
          {!loading && filtered.length > 0 && (
            <div className="divide-y divide-stone-100">
              {filtered.map(design => (
                <DesignRow
                  key={design.id}
                  design={design}
                  deleting={deletingId === design.id}
                  onDelete={() => handleDelete(design.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Promo tile ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-stone-200 bg-white p-6 flex flex-col gap-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400">Подсказка</p>
            <p className="text-[13px] font-light text-stone-700 leading-relaxed">
              Используйте конфигуратор для создания кухни, спальни или гостиной. Готовый дизайн появится здесь.
            </p>
            <Link
              href="/configurator"
              className="self-start inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-semibold text-stone-900 hover:gap-3 transition-all duration-200"
            >
              Начать <ArrowRight size={11} />
            </Link>
          </div>

          <div className="border border-stone-900 bg-stone-900 p-6 flex flex-col gap-4">
            <p className="text-[9px] tracking-[0.25em] uppercase text-stone-500">Каталог</p>
            <p className="text-[13px] font-light text-stone-300 leading-relaxed">
              Посмотрите готовые изделия в каталоге и добавьте понравившиеся в корзину или конфигуратор.
            </p>
            <Link
              href="/catalog"
              className="self-start inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-semibold text-white hover:gap-3 transition-all duration-200"
            >
              Каталог <ArrowRight size={11} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

interface DesignRowProps {
  design: SavedDesignOut;
  deleting: boolean;
  onDelete: () => void;
}

function DesignRow({ design, deleting, onDelete }: DesignRowProps) {
  const cfg = design.configuration as Record<string, unknown>;
  const category = (cfg.category as string | undefined) || "—";
  const templateObj = cfg.template as { label?: string } | undefined;
  const colorObj    = cfg.color    as { label?: string; hex?: string } | undefined;
  const template    = templateObj?.label || "—";
  const color       = colorObj?.label    || "—";
  const colorHex    = colorObj?.hex      || "#a8a29e";

  const categoryLabel: Record<string, string> = {
    kitchen: "Кухня", living: "Гостиная", bedroom: "Спальня",
    hallway: "Прихожая", office: "Офис",
  };

  return (
    <div className="group flex items-center gap-5 px-6 py-5 hover:bg-stone-50 transition-colors">

      {/* Clickable main area → detail page */}
      <Link href={`/my-designs/${design.id}`} className="contents">
        {/* Color swatch */}
        <div
          className="w-10 h-10 shrink-0 border border-stone-100"
          style={{ backgroundColor: colorHex }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-light text-stone-900 truncate group-hover:text-stone-600 transition-colors">{design.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-stone-400">{categoryLabel[category] ?? category}</span>
            <span className="text-stone-200 text-[11px]">·</span>
            <span className="text-[11px] text-stone-400">{template}</span>
            <span className="text-stone-200 text-[11px]">·</span>
            <span className="text-[11px] text-stone-400">{color}</span>
          </div>
        </div>
      </Link>

      {/* Date */}
      <div className="hidden sm:flex items-center gap-1.5 text-stone-300 shrink-0">
        <Calendar size={11} />
        <span className="text-[11px]">{formatDate(design.created_at)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          title="Поделиться"
          className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-stone-700 transition-colors"
        >
          <Share2 size={14} />
        </button>
        <button
          title="Удалить"
          onClick={onDelete}
          disabled={deleting}
          className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          {deleting
            ? <Loader2 size={14} className="animate-spin" />
            : <Trash2 size={14} />
          }
        </button>
      </div>

    </div>
  );
}
