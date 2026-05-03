import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  BookOpen,
  FileText,
  History,
  LayoutDashboard,
  Settings2,
  Target,
} from "lucide-react";
import logo from "../assets/logo.png";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/dashboard/study", label: "Study", icon: BookOpen },
      { to: "/dashboard/pdfs", label: "PDFs", icon: FileText },
      { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/dashboard/onboarding", label: "Goals", icon: Target },
      { to: "/dashboard/aitutor", label: "AI Tutor", icon: Bot },
      { to: "/dashboard/mcqhistory", label: "Past Tests", icon: History },
      { to: "/dashboard/settings", label: "Settings", icon: Settings2 },
    ],
  },
];

export default function Sidebar() {
  const baseClass =
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200";

  const activeClass =
    "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)]";

  const inactiveClass =
    "text-slate-600 hover:bg-orange-50 hover:text-orange-700";

  return (
    <aside className="flex w-72 min-h-screen flex-col border-r border-orange-100/70 bg-white/90 px-5 py-6 text-slate-950 shadow-[12px_0_40px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="rounded-[1.75rem] border border-orange-100 bg-[linear-gradient(180deg,_rgba(255,247,237,0.95),_rgba(255,255,255,0.98))] p-4 shadow-[0_16px_40px_rgba(249,115,22,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
            <img src={logo} alt="StudyBuddy" className="h-8 w-8 rounded-xl object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">StudyBuddy</h2>
            <p className="text-xs text-slate-500">A focused study workspace</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Focus</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">92%</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Sessions</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">18</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Today</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">3h 42m</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              {group.label}
            </p>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                            isActive ? "bg-white/15 text-white" : "bg-orange-50 text-orange-600 group-hover:bg-white"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50/70 p-4">
          <p className="text-sm font-semibold text-slate-950">Keep the momentum going</p>
          <p className="mt-2 text-xs leading-6 text-slate-600">
            Jump back into your latest session or open a new study block from the sidebar.
          </p>
        </div>
        <div className="mt-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} StudyBuddy</div>
      </div>
    </aside>
  );
}
