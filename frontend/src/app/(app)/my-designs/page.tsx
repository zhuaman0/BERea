import Link from "next/link";

export default function MyDesignsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Мои дизайны</h1>
          <p className="text-slate-500 mt-1">Сохранённые конфигурации мебели</p>
        </div>
        <Link
          href="/configurator"
          className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          + Новый дизайн
        </Link>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🛋️</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет сохранённых дизайнов</h3>
        <p className="text-slate-500 max-w-xs mb-6">
          Создайте свою первую конфигурацию мебели в конфигураторе
        </p>
        <Link
          href="/configurator"
          className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          Открыть конфигуратор
        </Link>
      </div>
    </div>
  );
}
