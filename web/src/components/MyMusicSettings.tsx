import { useRef, useState } from "react";
import { addMyMusic, MAX_FILE_BYTES, removeMyMusic, useMyMusic } from "../lib/myMusic";
import { update, useAppState } from "../lib/store";

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

/** "Nhạc của bạn": add MP3s from this device for the vocab games, list and remove them. */
export function MyMusicSettings() {
  const { prefs } = useAppState();
  const list = useMyMusic();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const add = async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const { added, skipped } = await addMyMusic(files);
      if (added > 0 && prefs.musicStyle !== "mine") update((s) => ({ ...s, prefs: { ...s.prefs, music: true, musicStyle: "mine" } }));
      const parts = [added > 0 ? `Đã thêm ${added} bài.` : "Chưa thêm được bài nào."];
      if (skipped.length) parts.push(`Bỏ qua ${skipped.length} file không phải nhạc hoặc lớn hơn ${mb(MAX_FILE_BYTES)}: ${skipped.join(", ")}.`);
      setMsg({ ok: added > 0, text: parts.join(" ") });
    } catch (e) {
      setMsg({ ok: false, text: `Không lưu được nhạc: ${(e as Error).message} Có thể bộ nhớ trình duyệt đã đầy.` });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const total = list.reduce((n, t) => n + t.size, 0);
  return (
    <div className="ml-7 space-y-2 rounded-xl border border-slate-200 p-4 text-sm">
      <p className="font-semibold">📁 Nhạc của bạn</p>
      <p className="text-slate-600">
        Chọn file nhạc (MP3, M4A…) đã tải về máy để phát khi chơi game từ vựng. Nhạc chỉ được lưu trong trình duyệt
        này, không gửi lên mạng. Đổi máy, đổi trình duyệt hoặc xóa dữ liệu trang thì cần thêm lại.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? "Đang lưu…" : "＋ Thêm nhạc từ máy"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*,.mp3,.m4a,.aac,.ogg,.opus,.wav,.flac"
          multiple
          hidden
          onChange={(e) => void add([...(e.target.files ?? [])])}
        />
        {list.length > 0 && <span className="text-slate-500">{list.length} bài · {mb(total)}</span>}
      </div>
      {msg && <p className={msg.ok ? "text-emerald-700" : "text-rose-700"} role="status">{msg.text}</p>}
      {list.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {list.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1 truncate" title={t.name}>🎵 {t.name}</span>
              <span className="shrink-0 text-xs text-slate-500">{mb(t.size)}</span>
              <button
                type="button"
                className="shrink-0 rounded px-2 py-0.5 text-rose-700 hover:bg-rose-50"
                onClick={() => void removeMyMusic(t.id)}
                aria-label={`Xóa ${t.name}`}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
