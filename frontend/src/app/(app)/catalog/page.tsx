export default function CatalogPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Каталог мебели</h1>
        <p className="text-slate-500 mt-1">Выберите мебель для вашего интерьера</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["Все", "Кухня", "Гостиная", "Спальня", "Прихожая", "Офис"].map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-colors duration-150 first:bg-slate-900 first:text-white first:border-slate-900"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="aspect-square bg-slate-50 flex items-center justify-center text-4xl">
              🪑
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">Кухня</p>
              <h3 className="font-semibold text-slate-900 mb-1">Кухонный гарнитур</h3>
              <p className="text-sm text-slate-500 mb-3">Модульная система, любые размеры</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">от 250 000 ₸</span>
                <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Подробнее →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
