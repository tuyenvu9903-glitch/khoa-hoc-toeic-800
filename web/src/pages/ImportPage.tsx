import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { replaceState, useAppState } from "../lib/store";
import type { AppState } from "../lib/state";
import { decodeState } from "../lib/transfer";
import { levelFromXp } from "../lib/gamify";

function summary(s: AppState) {
  return {
    name: s.profile?.displayName ?? "(chưa có tên)",
    day: s.progress.day,
    words: Object.keys(s.srs).length,
    xp: s.game.xp,
    level: levelFromXp(s.game.xp),
  };
}

/** Opened from a "Chuyển sang máy khác" link: shows what is inside and replaces this device's progress on confirm. */
export function ImportPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const here = useAppState();
  const [incoming, setIncoming] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("d");
    if (!code) return setError("Link không có dữ liệu. Hãy sao chép lại cả link từ máy kia.");
    decodeState(code)
      .then(setIncoming)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không đọc được dữ liệu trong link."));
  }, [params]);

  const done = () => navigate("/", { replace: true });
  const accept = () => {
    if (!incoming) return;
    replaceState(incoming);
    done();
  };

  const them = incoming ? summary(incoming) : null;
  const me = here.profile ? summary(here) : null;
  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="card p-6">
        <h1 className="text-xl font-extrabold">📲 Nhận tiến độ từ máy khác</h1>
        {error && (
          <>
            <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            <button onClick={done} className="btn-ghost mt-4">Về trang chủ</button>
          </>
        )}
        {!error && !them && <p className="mt-3 text-sm text-slate-500">Đang đọc dữ liệu…</p>}
        {them && (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-brand-50 px-3 py-2"><dt className="text-slate-500">Người học</dt><dd className="font-bold">{them.name}</dd></div>
              <div className="rounded-xl bg-brand-50 px-3 py-2"><dt className="text-slate-500">Đang ở</dt><dd className="font-bold">Ngày {them.day}</dd></div>
              <div className="rounded-xl bg-brand-50 px-3 py-2"><dt className="text-slate-500">Từ đã học</dt><dd className="font-bold">{them.words}</dd></div>
              <div className="rounded-xl bg-brand-50 px-3 py-2"><dt className="text-slate-500">Cấp độ</dt><dd className="font-bold">Lv {them.level} · {them.xp} XP</dd></div>
            </dl>
            {me ? (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Máy này đang có tiến độ của <strong>{me.name}</strong> (ngày {me.day}, {me.words} từ, {me.xp} XP). Nhận dữ liệu mới sẽ
                <strong> thay thế hoàn toàn</strong> tiến độ đó và không hoàn tác được. Nếu cần, hãy tải file sao lưu ở máy này trước.
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Máy này chưa có tiến độ nào. Nhận dữ liệu để học tiếp từ chỗ đã dừng.</p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={accept} className="btn-primary">Dùng tiến độ này trên máy này</button>
              <button onClick={done} className="btn-ghost">Hủy</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
