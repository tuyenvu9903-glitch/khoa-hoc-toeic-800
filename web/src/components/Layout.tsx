import { NavLink, Outlet } from "react-router-dom";
import { useAppState } from "../lib/store";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/vocab", label: "Từ vựng", end: false },
  { to: "/listening", label: "Nghe", end: false },
  { to: "/settings", label: "Dữ liệu", end: false },
];

export function Layout() {
  const { profile } = useAppState();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5" aria-label="Điều hướng chính">
          <NavLink to="/" className="mr-2 flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">
              T8
            </span>
            <span className="hidden sm:inline">TOEIC 800</span>
          </NavLink>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-100 text-brand-800" : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`
              }
            >
              {l.label}
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
