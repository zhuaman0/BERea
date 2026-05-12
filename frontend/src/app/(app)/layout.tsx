import Link from "next/link";
import { BookOpen, BarChart3, Brain, LayoutDashboard, FlaskConical } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study", label: "Study", icon: FlaskConical },
  { href: "/materials", label: "Materials", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/personas", label: "Persona", icon: Brain },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-alt">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-sidebar shrink-0 bg-surface border-r border-gray-100 px-4 py-6 gap-2">
        <Link href="/dashboard" className="px-3 py-2 mb-4 text-xl font-bold text-brand-600">
          BERea
        </Link>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
