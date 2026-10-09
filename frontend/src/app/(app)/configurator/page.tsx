"use client";

import dynamic from "next/dynamic";
import { ConfiguratorPanel } from "@/features/configurator/ConfiguratorPanel";
import { useConfiguratorStore } from "@/features/configurator/useConfiguratorStore";

const FurnitureScene = dynamic(
  () => import("@/features/configurator/FurnitureScene").then((m) => m.FurnitureScene),
  { ssr: false, loading: () => <SceneLoader /> }
);

function SceneLoader() {
  return (
    <div className="flex-1 bg-[#FAFAF8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border border-stone-300 border-t-stone-900 rounded-full animate-spin" />
        <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400">Загрузка сцены</p>
      </div>
    </div>
  );
}

function PriceSummary() {
  const { totalPrice, selectedColor, selectedDoorStyle, selectedHandle, selectedTemplate } = useConfiguratorStore();

  const rows = [
    { label: "Корпус",   value: "85 000 ₸" },
    { label: "Дверей",   value: `${selectedTemplate.bottomDoors + selectedTemplate.topDoors} шт` },
    { label: "Материал", value: selectedDoorStyle.label },
    { label: "Цвет",     value: selectedColor.label, dot: selectedColor.hex },
    { label: "Ручки",    value: selectedHandle.label },
    ...(selectedTemplate.hasIsland ? [{ label: "Остров", value: "50 000 ₸" }] : []),
  ] as const;

  return (
    <aside className="hidden xl:flex flex-col w-60 shrink-0 border-l border-stone-100 bg-white">
      <div className="p-5 border-b border-stone-100">
        <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400">Состав</p>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[12px] text-stone-400 font-light">{row.label}</span>
            <span className="text-[12px] text-stone-900 font-light flex items-center gap-1.5">
              {"dot" in row && row.dot && (
                <span
                  className="w-3 h-3 inline-block border border-stone-200"
                  style={{ backgroundColor: row.dot }}
                />
              )}
              {row.value}
            </span>
          </div>
        ))}

        <div className="border-t border-stone-100 pt-3 mt-1 flex items-baseline justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">Итого</span>
          <span className="text-lg font-light text-stone-900">{totalPrice.toLocaleString("ru")} ₸</span>
        </div>
      </div>

      <div className="p-5 border-t border-stone-100 flex flex-col gap-2">
        <button className="w-full py-3 bg-stone-900 text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-800 transition-colors duration-200">
          Оставить заявку
        </button>
        <button className="w-full py-2.5 border border-stone-200 text-stone-500 text-[11px] tracking-widest uppercase hover:border-stone-400 hover:text-stone-700 transition-colors duration-200">
          Сохранить дизайн
        </button>
      </div>
    </aside>
  );
}

function MobilePriceChip() {
  const { totalPrice } = useConfiguratorStore();
  return (
    <span className="text-base font-light text-stone-900">
      {totalPrice.toLocaleString("ru")} ₸
    </span>
  );
}

function MobileBottomBar() {
  const { totalPrice } = useConfiguratorStore();
  return (
    <div className="lg:hidden shrink-0 bg-white border-t border-stone-100 px-5 py-3 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400">Итого</p>
        <p className="text-lg font-light text-stone-900">{totalPrice.toLocaleString("ru")} ₸</p>
      </div>
      <button className="px-6 py-2.5 bg-stone-900 text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-stone-800 transition-colors duration-200">
        Заказать
      </button>
    </div>
  );
}

export default function ConfiguratorPage() {
  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-stone-100 bg-white flex items-center justify-between">
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase text-stone-400 mb-1">
            Конфигуратор
          </p>
          <h1 className="text-xl font-extralight text-stone-900">Настройте вашу мебель</h1>
        </div>
        <div className="flex items-center gap-2 xl:hidden">
          <MobilePriceChip />
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:flex">
          <ConfiguratorPanel />
        </div>

        <main className="flex-1 bg-[#FAFAF8] min-h-0 relative">
          <FurnitureScene />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.25em] uppercase text-stone-300 pointer-events-none">
            Вращайте мышью · Прокрутите для зума
          </p>
        </main>

        <PriceSummary />
      </div>

      <MobileBottomBar />
    </div>
  );
}
