import { NavLink, Outlet } from "react-router-dom";
import { useAppState } from "../lib/store";

/** The six main destinations (sidebar on desktop, bottom bar on phones). */
const MAIN = [
  { to: "/", label: "Trang chủ", short: "Trang chủ", icon: "🏠", end: true },
  { to: "/vocab", label: "Từ vựng", short: "Từ vựng", icon: "📚", end: false },
  { to: "/listening", label: "Nghe", short: "Nghe", icon: "🎧", end: false },
  { to: "/reading", label: "Đọc & Ngữ pháp", short: "Đọc", icon: "📖", end: false },
  { to: "/progress", label: "Tiến độ", short: "Tiến độ", icon: "📈", end: false },
  { to: "/exam", label: "Thi thử", short: "Thi thử", icon: "📝", end: false },
];

/** Contextual links, kept out of the main navigation. */
const MORE = [
  { to: "/today", label: "Bài học hôm nay", icon: "✅" },
  { to: "/plan", label: "Lộ trình 56 ngày", icon: "🗓️" },
  { to: "/settings", label: "Dữ liệu & sao lưu", icon: "💾" },
];

const sideLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? "bg-p-mint text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export function Layout() {
  const { profile } = useAppState();
  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 lg:flex">
        <NavLink to="/" className="mb-6 flex items-center gap-2.5 px-3 font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-sm font-extrabold text-white">T8</span>
          TOEIC 800
        </NavLink>
        <nav aria-label="Điều hướng chính" className="space-y-1">
          {MAIN.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={sideLink}>
              <span aria-hidden className="text-lg">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="my-4 border-t border-slate-200" />
        <nav aria-label="Liên kết khác" className="space-y-1">
          {MORE.map((l) => (
            <NavLink key={l.to} to={l.to} className={sideLink}>
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        {profile && (
          <div className="mt-auto flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-p-mint text-xs font-bold text-brand-800" aria-hidden>
              {profile.displayName.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate">{profile.displayName}</span>
          </div>
        )}
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile / tablet top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
          <NavLink to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-xs font-extrabold text-white">T8</span>
            TOEIC 800
          </NavLink>
          <nav aria-label="Liên kết khác" className="ml-auto flex gap-1">
            {MORE.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                title={l.label}
                aria-label={l.label}
                className={({ isActive }) => `grid h-10 w-10 place-items-center rounded-lg text-lg ${isActive ? "bg-p-mint" : "hover:bg-slate-100"}`}
              >
                <span aria-hidden>{l.icon}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 animate-in lg:px-8 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        <nav
          aria-label="Điều hướng chính"
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {MAIN.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${isActive ? "text-brand-800" : "text-slate-500"}`
              }
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden className={`grid h-7 w-10 place-items-center rounded-full text-base ${isActive ? "bg-p-mint" : ""}`}>{l.icon}</span>
                  {l.short}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
