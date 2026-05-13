import { Users, Activity, Target } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  sub?:    string;
  color:   string;
}

interface AdminUser {
  id:           number;
  name:         string;
  email:        string;
  initials:     string;
  role:         string;
  roleColor:    string;
  streak:       number;
  focusScore:   number;
  status:       "Active" | "Inactive";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS: StatCardProps[] = [
  {
    icon:  <Users size={20} strokeWidth={2} />,
    label: "Total Users",
    value: "1,245",
    sub:   "+18 this week",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon:  <Activity size={20} strokeWidth={2} />,
    label: "Active Today",
    value: "892",
    sub:   "71.6% of total",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon:  <Target size={20} strokeWidth={2} />,
    label: "Avg. Focus Score",
    value: "78",
    sub:   "out of 100",
    color: "bg-violet-50 text-violet-600",
  },
];

const USERS: AdminUser[] = [
  {
    id: 1, name: "Alex Johnson",   email: "alex@example.com",   initials: "AJ",
    role: "University Student",  roleColor: "bg-blue-100 text-blue-700",
    streak: 12, focusScore: 84, status: "Active",
  },
  {
    id: 2, name: "Sarah Chen",     email: "sarah@example.com",   initials: "SC",
    role: "Working Professional", roleColor: "bg-violet-100 text-violet-700",
    streak: 31, focusScore: 91, status: "Active",
  },
  {
    id: 3, name: "Marcus Williams", email: "marcus@example.com", initials: "MW",
    role: "High School Student", roleColor: "bg-amber-100 text-amber-700",
    streak: 5,  focusScore: 67, status: "Active",
  },
  {
    id: 4, name: "Priya Patel",    email: "priya@example.com",   initials: "PP",
    role: "Lifelong Learner",    roleColor: "bg-teal-100 text-teal-700",
    streak: 0,  focusScore: 54, status: "Inactive",
  },
  {
    id: 5, name: "James O'Brien",  email: "james@example.com",   initials: "JO",
    role: "Teacher / Educator",  roleColor: "bg-rose-100 text-rose-700",
    streak: 8,  focusScore: 76, status: "Active",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-3xl font-bold text-slate-900 leading-tight mt-0.5">{value}</span>
        {sub && <span className="text-xs text-slate-400 mt-1">{sub}</span>}
      </div>
    </div>
  );
}

function FocusBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-6 text-right shrink-0">{score}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-8">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Platform snapshot as of today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* User table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Recent Users</h2>
          <span className="text-xs text-slate-400 font-medium">Showing 5 of 1,245</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Streak</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-40">Focus Score</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {USERS.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">

                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-600">{u.initials}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 truncate">{u.name}</span>
                        <span className="text-xs text-slate-400 truncate">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${u.roleColor}`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Streak */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700">
                      {u.streak > 0 ? `${u.streak} days` : "—"}
                    </span>
                  </td>

                  {/* Focus score */}
                  <td className="px-6 py-4 w-40">
                    <FocusBar score={u.focusScore} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <span className={u.status === "Active" ? "text-emerald-700" : "text-slate-400"}>
                        {u.status}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
