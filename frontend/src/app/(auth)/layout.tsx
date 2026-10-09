import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ───────────────────────────────────────── */}
      <div className="hidden lg:flex w-[44%] shrink-0 bg-stone-900 flex-col justify-between p-12">

        {/* Logo */}
        <Link href="/furniture" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-stone-900 text-[12px] font-semibold">
            M
          </div>
          <span className="text-[12px] font-light tracking-[0.22em] uppercase text-white">
            Мебель Studio
          </span>
        </Link>

        {/* Editorial headline */}
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-6">
            Казахстан · Производство
          </p>
          <h2 className="text-5xl font-extralight text-white leading-tight tracking-tight">
            Мебель<br />
            <span className="text-stone-500">вашей</span><br />
            мечты
          </h2>
          <p className="mt-6 text-stone-400 text-[13px] font-light leading-relaxed max-w-xs">
            3D конфигуратор, AI визуализация и производство под заказ — всё в одном месте.
          </p>
        </div>

        {/* Bottom trust signals */}
        <div className="flex flex-col gap-2">
          {["Бесплатный замер", "Рассрочка 0%", "Гарантия 3 года"].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-1 h-1 bg-stone-600" />
              <span className="text-[11px] text-stone-500 tracking-wide">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">

        {/* Mobile logo only */}
        <Link href="/furniture" className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 bg-stone-900 flex items-center justify-center text-white text-[11px] font-semibold">
            M
          </div>
          <span className="text-[12px] font-light tracking-[0.2em] uppercase text-stone-900">
            Мебель Studio
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

    </div>
  );
}
