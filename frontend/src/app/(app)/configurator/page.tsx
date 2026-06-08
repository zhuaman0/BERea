"use client";

import dynamic from "next/dynamic";
import { ConfiguratorPanel } from "@/features/configurator/ConfiguratorPanel";
import { useConfiguratorStore } from "@/features/configurator/useConfiguratorStore";

// Load Three.js only on client side — it needs browser APIs
const FurnitureScene = dynamic(
  () => import("@/features/configurator/FurnitureScene").then((m) => m.FurnitureScene),
  { ssr: false, loading: () => <SceneLoader /> }
);

function SceneLoader() {
  return (
    <div className="flex-1 bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-medium">Загрузка 3D сцены...</p>
      </div>
    </div>
  );
}

function PriceSummary() {
  const { totalPrice, selectedColor, selectedHandle, selectedTemplate } = useConfiguratorStore();

  return (
    <aside className="hidden xl:flex flex-col w-64 shrink-0 border-l border-slate-100 bg-white p-5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Состав</p>

      <div className="space-y-3 flex-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Корпус</span>
          <span className="font-medium text-slate-900">85 000 ₸</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Дверей</span>
          <span className="font-medium text-slate-900">
            {selectedTemplate.bottomDoors + selectedTemplate.topDoors} шт
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Цвет</span>
          <span className="font-medium text-slate-900 flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border border-slate-200 inline-block"
              style={{ backgroundColor: selectedColor.hex }}
            />
            {selectedColor.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Ручки</span>
          <span className="font-medium text-slate-900">{selectedHandle.label}</span>
        </div>
        {selectedTemplate.hasIsland && (
          <div className="flex justify-between">
            <span className="text-slate-500">Остров</span>
            <span className="font-medium text-slate-900">50 000 ₸</span>
          </div>
        )}
        <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
          <span className="text-slate-900">Итого</span>
          <span className="text-slate-900">{totalPrice.toLocaleString("ru")} ₸</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <button className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          Оставить заявку
        </button>
        <button className="w-full py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
          Сохранить дизайн
        </button>
      </div>
    </aside>
  );
}

export default function ConfiguratorPage() {
  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Конфигуратор мебели</h1>
          <p className="text-sm text-slate-400">Вращайте модель мышью • Прокрутите для зума</p>
        </div>
        <div className="flex items-center gap-2 xl:hidden">
          <MobilePriceChip />
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel — desktop only */}
        <div className="hidden lg:flex">
          <ConfiguratorPanel />
        </div>

        {/* 3D viewport */}
        <main className="flex-1 bg-slate-50 min-h-0">
          <FurnitureScene />
        </main>

        {/* Right summary — wide desktop only */}
        <PriceSummary />
      </div>

      {/* Mobile bottom bar */}
      <MobileBottomBar />
    </div>
  );
}

function MobilePriceChip() {
  const { totalPrice } = useConfiguratorStore();
  return (
    <span className="text-base font-black text-slate-900">
      {totalPrice.toLocaleString("ru")} ₸
    </span>
  );
}

function MobileBottomBar() {
  const { totalPrice } = useConfiguratorStore();
  return (
    <div className="lg:hidden shrink-0 bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-xs text-slate-400">Итого</p>
        <p className="text-lg font-black text-slate-900">{totalPrice.toLocaleString("ru")} ₸</p>
      </div>
      <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
        Заказать
      </button>
    </div>
  );
}
