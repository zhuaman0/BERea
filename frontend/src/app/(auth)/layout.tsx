import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-16">

      {/* Logo mark above the card */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200 group-hover:bg-blue-900 transition-colors">
          B
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">BERea</span>
      </Link>

      <div className="w-full max-w-sm">
        {children}
      </div>

      {/* Subtle bottom credit */}
      <p className="mt-10 text-xs text-slate-400">
        © {new Date().getFullYear()} BERea. Built for students.
      </p>
    </div>
  );
}
