import { NavLink, Outlet } from "react-router-dom";
import { useAppState } from "../lib/store";

const LINKS = [
  { to: "/", label: "Dashboard", icon: "🏠", end: true },
  { to: "/plan", label: "Lộ trình", icon: "🗓️", end: false },
  { to: "/vocab", label: "Từ vựng", icon: "📚", end: false },
  { to: "/listening", label: "Nghe", icon: "🎧", end: false },
  { to: "/reading", label: "Đọc", icon: "📖", end: false },
  { to: "/settings", label: "Dữ liệu", icon: "💾", end: false },
];

export function Layout() {
  const { profile } = useAppState();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:gap-2" aria-label="Điều hướng chính">
          <NavLink to="/" className="mr-2 flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">
              T8
            </span>
            <span className="hidden sm:inline">TOEIC 800</span>
          </NavLink>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              title={l.label}
              aria-label={l.label}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span aria-hidden>{l.icon}</span>
              <span className="hidden md:inline">{l.label}</span>
            </NavLink>
          ))}
          {profile && (
            <span className="ml-auto hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700" aria-hidden>
                {profile.displayName.slice(0, 1).toUpperCase()}
              </span>
              {profile.displayName}
            </span>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 animate-in">
        <Outlet />
      </main>
    </div>
  );
}
