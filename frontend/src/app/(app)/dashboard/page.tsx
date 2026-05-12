import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back 👋</h1>
        <p className="text-text-secondary mt-1">Here&apos;s your study overview.</p>
      </div>

      {/* Streak + quick stats — wired to API in feature build */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Current streak", value: "—" },
          { label: "Sessions this week", value: "—" },
          { label: "Avg focus score", value: "—" },
          { label: "Best method", value: "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface rounded-card shadow-card border border-gray-100 p-4">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
