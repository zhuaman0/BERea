"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  useConfiguratorStore,
  COLORS,
  HANDLES,
  DOOR_STYLES,
  type FurnitureCategory,
  type ConfiguratorTemplate,
} from "./useConfiguratorStore";
import { configuratorApi } from "./configuratorApi";
import { Minus, Plus, Pencil, Check, X } from "lucide-react";

const CATEGORIES: { id: FurnitureCategory; label: string }[] = [
  { id: "kitchen",  label: "Кухня"    },
  { id: "living",   label: "Гостиная" },
  { id: "bedroom",  label: "Спальня"  },
  { id: "hallway",  label: "Прихожая" },
  { id: "office",   label: "Офис"     },
];

// ── Template schematic preview ───────────────────────────────────────────────

function TemplatePreview({
  bottomDoors,
  topDoors,
  hasIsland,
}: Pick<ConfiguratorTemplate, "bottomDoors" | "topDoors" | "hasIsland">) {
  const VW = 56;
  const VH = 42;
  const PAD = 1;
  const AVAIL = VW - PAD * 2;

  const hasBoth = bottomDoors > 0 && topDoors > 0;
  const maxU    = Math.max(bottomDoors, topDoors, 1);
  const uw      = AVAIL / maxU;

  const iH   = hasIsland ? 4 : 0;
  const iGap = hasIsland ? 2 : 0;
  const topH = hasBoth
    ? 10
    : topDoors > 0
    ? (hasIsland ? 26 : 34)
    : 0;
  const botH = hasBoth
    ? 16
    : bottomDoors > 0
    ? (hasIsland ? 26 : 34)
    : 0;
  const ctH = hasBoth ? 2 : 0;
  const GAP = hasBoth ? 2 : 0;

  const iY      = VH - PAD - iH;
  const botBot  = iY - iGap;
  const botY    = botBot - botH;
  const ctY     = botY - ctH;
  const topY    = ctY - GAP - topH;

  const botX = PAD + ((maxU - Math.max(bottomDoors, 0)) / 2) * uw;
  const topX = PAD + ((maxU - Math.max(topDoors, 0)) / 2) * uw;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-10 shrink-0">
      {/* Top cabinets */}
      {Array.from({ length: topDoors }).map((_, i) => (
        <rect
          key={`t${i}`}
          x={topX + i * uw + 0.5}
          y={topY}
          width={uw - 1}
          height={topH}
          fill="#e7e5e4"
          stroke="#a8a29e"
          strokeWidth={0.5}
        />
      ))}
      {/* Countertop */}
      {hasBoth && (
        <rect x={PAD} y={ctY} width={AVAIL} height={ctH} fill="#c9d4e3" />
      )}
      {/* Bottom cabinets */}
      {Array.from({ length: bottomDoors }).map((_, i) => (
        <rect
          key={`b${i}`}
          x={botX + i * uw + 0.5}
          y={botY}
          width={uw - 1}
          height={botH}
          fill="#d6d3d1"
          stroke="#a8a29e"
          strokeWidth={0.5}
        />
      ))}
      {/* Island */}
      {hasIsland && (
        <rect
          x={VW * 0.2}
          y={iY}
          width={VW * 0.6}
          height={iH - 0.5}
          fill="#dde4ef"
          stroke="#a8a29e"
          strokeWidth={0.5}
        />
      )}
    </svg>
  );
}

// ── Stepper control ──────────────────────────────────────────────────────────

interface StepperProps {
  label:    string;
  value:    number;
  min:      number;
  max:      number;
  onChange: (n: number) => void;
}

function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 border border-stone-200 flex items-center justify-center text-stone-500 hover:border-stone-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <Minus size={11} />
        </button>
        <span className="text-[15px] font-light text-stone-900 w-6 text-center tabular-nums">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 border border-stone-200 flex items-center justify-center text-stone-500 hover:border-stone-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function ConfiguratorPanel() {
  const {
    category, setCategory,
    templates, selectedTemplate, setTemplate,
    isCustomMode, selectCustomMode,
    customBottomDoors, customTopDoors, customHasIsland,
    setCustomBottomDoors, setCustomTopDoors, setCustomHasIsland,
    selectedColor, setColor,
    selectedDoorStyle, setDoorStyle,
    selectedHandle, setHandle,
    totalPrice,
  } = useConfiguratorStore();

  const [saveOpen,    setSaveOpen]    = useState(false);
  const [designName,  setDesignName]  = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saveStatus,  setSaveStatus]  = useState<"idle" | "ok" | "err">("idle");

  async function handleSave() {
    if (!designName.trim()) return;
    setSaving(true);
    try {
      await configuratorApi.save({
        name: designName.trim(),
        configuration: {
          category,
          template:  selectedTemplate,
          color:     selectedColor,
          doorStyle: selectedDoorStyle,
          handle:    selectedHandle,
          totalPrice,
        },
      });
      setSaveStatus("ok");
      setDesignName("");
      setTimeout(() => { setSaveOpen(false); setSaveStatus("idle"); }, 1500);
    } catch {
      setSaveStatus("err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <aside className="flex flex-col w-64 shrink-0 border-r border-stone-100 bg-white overflow-y-auto">
      <div className="p-5 flex flex-col gap-7">

        {/* ── 01 Category ────────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400 mb-3">
            01 · Категория
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "py-2 px-3 text-[12px] font-medium text-left border transition-colors duration-150",
                  category === cat.id
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 02 Template ────────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400 mb-3">
            02 · Шаблон
          </p>

          <div className="flex flex-col gap-1.5">
            {templates.map((tpl) => {
              const active = !isCustomMode && selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setTemplate(tpl)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 border text-left transition-colors duration-150",
                    active
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-100 hover:border-stone-300 bg-white"
                  )}
                >
                  {/* Schematic preview */}
                  <div className="w-14 shrink-0">
                    <TemplatePreview
                      bottomDoors={tpl.bottomDoors}
                      topDoors={tpl.topDoors}
                      hasIsland={tpl.hasIsland}
                    />
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-[12px] leading-tight truncate",
                      active ? "text-stone-900 font-medium" : "text-stone-600 font-light"
                    )}>
                      {tpl.label}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {tpl.bottomDoors > 0 && `${tpl.bottomDoors}↓`}
                      {tpl.bottomDoors > 0 && tpl.topDoors > 0 && " · "}
                      {tpl.topDoors > 0 && `${tpl.topDoors}↑`}
                      {tpl.hasIsland && " · остров"}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Custom template card */}
            <button
              onClick={selectCustomMode}
              className={cn(
                "w-full flex items-center gap-3 p-2 border text-left transition-colors duration-150",
                isCustomMode
                  ? "border-stone-900 bg-stone-50"
                  : "border-dashed border-stone-300 hover:border-stone-500 bg-white"
              )}
            >
              <div className="w-14 shrink-0">
                <TemplatePreview
                  bottomDoors={customBottomDoors}
                  topDoors={customTopDoors}
                  hasIsland={customHasIsland}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-[12px] leading-tight flex items-center gap-1.5",
                  isCustomMode ? "text-stone-900 font-medium" : "text-stone-400"
                )}>
                  <Pencil size={10} className="shrink-0" />
                  Свой шаблон
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {customBottomDoors > 0 && `${customBottomDoors}↓`}
                  {customBottomDoors > 0 && customTopDoors > 0 && " · "}
                  {customTopDoors > 0 && `${customTopDoors}↑`}
                  {customHasIsland && " · остров"}
                </p>
              </div>
            </button>
          </div>

          {/* Custom builder — inline below the card when active */}
          {isCustomMode && (
            <div className="mt-3 p-4 border border-stone-100 bg-stone-50 flex flex-col gap-4">
              <Stepper
                label="Нижние секции"
                value={customBottomDoors}
                min={0}
                max={10}
                onChange={setCustomBottomDoors}
              />
              <Stepper
                label="Верхние секции"
                value={customTopDoors}
                min={0}
                max={10}
                onChange={setCustomTopDoors}
              />
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">Остров</p>
                <div className="flex gap-1.5">
                  {([false, true] as const).map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => setCustomHasIsland(v)}
                      className={cn(
                        "flex-1 py-1.5 text-[11px] border tracking-[0.1em] uppercase transition-colors duration-150",
                        customHasIsland === v
                          ? "bg-stone-900 text-white border-stone-900"
                          : "border-stone-200 text-stone-500 hover:border-stone-400"
                      )}
                    >
                      {v ? "Да" : "Нет"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 03 Door style ───────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400 mb-3">
            03 · Материал фасада
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {DOOR_STYLES.map((style) => {
              const active = selectedDoorStyle.id === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setDoorStyle(style)}
                  className={cn(
                    "flex flex-col overflow-hidden border transition-all duration-150",
                    active
                      ? "border-stone-900"
                      : "border-stone-100 hover:border-stone-300"
                  )}
                >
                  {/* Material swatch */}
                  <div
                    className="h-10 w-full"
                    style={{ background: style.bg }}
                  />
                  {/* Label */}
                  <div className={cn(
                    "px-1.5 py-1.5",
                    active ? "bg-stone-900" : "bg-white"
                  )}>
                    <p className={cn(
                      "text-[10px] font-medium leading-none truncate",
                      active ? "text-white" : "text-stone-700"
                    )}>
                      {style.label}
                    </p>
                    <p className={cn(
                      "text-[9px] leading-none mt-0.5 truncate",
                      active ? "text-stone-400" : "text-stone-400"
                    )}>
                      {style.priceAdd > 0 ? `+${(style.priceAdd / 1000).toFixed(0)}к ₸` : "Базовый"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 04 Color ─────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400 mb-1">
            04 · Цвет фасада
          </p>
          <p className="text-[11px] text-stone-400 font-light mb-3">{selectedColor.label}</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setColor(color)}
                title={color.label}
                className={cn(
                  "w-8 h-8 border-2 transition-all duration-150",
                  selectedColor.id === color.id
                    ? "border-stone-900 scale-110"
                    : "border-transparent hover:border-stone-400"
                )}
                style={{
                  backgroundColor: color.hex,
                  outline: selectedColor.id === color.id ? "2px solid #e7e5e4" : "none",
                  outlineOffset: "-4px",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── 05 Handles ───────────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400 mb-3">
            05 · Ручки / фурнитура
          </p>
          <div className="flex flex-col gap-1.5">
            {HANDLES.map((handle) => (
              <button
                key={handle.id}
                onClick={() => setHandle(handle)}
                className={cn(
                  "w-full py-2.5 px-3 text-[12px] text-left border flex items-center justify-between transition-colors duration-150",
                  selectedHandle.id === handle.id
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"
                )}
              >
                <span>{handle.label}</span>
                {handle.priceAdd > 0 && (
                  <span className={cn(
                    "text-[10px]",
                    selectedHandle.id === handle.id ? "text-stone-400" : "text-stone-300"
                  )}>
                    +{handle.priceAdd.toLocaleString("ru")} ₸
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Price + CTA ──────────────────────────────────────────────────────── */}
      <div className="mt-auto border-t border-stone-100 p-5">
        <div className="flex items-baseline justify-between mb-5">
          <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">Итого</span>
          <span className="text-xl font-light text-stone-900">
            {totalPrice.toLocaleString("ru")} ₸
          </span>
        </div>
        <button className="w-full py-3 bg-stone-900 text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-800 transition-colors duration-200">
          Оставить заявку
        </button>
        <button
          onClick={() => { setSaveOpen(true); setSaveStatus("idle"); }}
          className="w-full mt-2 py-2.5 border border-stone-200 text-stone-500 text-[11px] font-medium tracking-widest uppercase hover:border-stone-400 hover:text-stone-700 transition-colors duration-200"
        >
          Сохранить дизайн
        </button>
      </div>
    </aside>

    {/* ── Save modal ──────────────────────────────────────────────────────── */}
    {saveOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => { setSaveOpen(false); setSaveStatus("idle"); }}
        />
        <div className="relative bg-white w-full max-w-sm mx-4 p-6 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400">Сохранить дизайн</p>
            <button
              onClick={() => { setSaveOpen(false); setSaveStatus("idle"); }}
              className="text-stone-300 hover:text-stone-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {saveStatus === "ok" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 bg-stone-900 flex items-center justify-center">
                <Check size={18} className="text-white" />
              </div>
              <p className="text-[13px] font-light text-stone-700">Дизайн сохранён</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-[0.08em] uppercase font-medium text-stone-500">
                  Название
                </label>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder={`${selectedTemplate.label} · ${selectedColor.label}`}
                  autoFocus
                  className="h-11 border border-stone-200 px-4 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
                />
              </div>

              {saveStatus === "err" && (
                <p className="text-[12px] text-red-500">Ошибка. Попробуйте ещё раз.</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !designName.trim()}
                className="h-11 bg-stone-900 text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />}
                Сохранить
              </button>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
