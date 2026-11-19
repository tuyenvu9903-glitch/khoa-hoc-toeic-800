import { useRef, useState } from "react";
import { emptyState, parseState, restartProgram } from "../lib/state";
import { exportJson, replaceState, update, useAppState } from "../lib/store";
import { CoachBubble } from "../components/Mascot";
import { HUMOR_OPTIONS, pickLine, type HumorLevel } from "../voice/engine";

export function SettingsPage() {
  const state = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toeic800-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke later: revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setMessage({ ok: true, text: "Đã tải file sao lưu." });
  };

  const importFile = async (file: File) => {
    try {
      const next = parseState(JSON.parse(await file.text()));
      if (!window.confirm("Nhập file này sẽ thay thế toàn bộ tiến độ hiện tại. Tiếp tục?")) return;
      replaceState(next);
      setMessage({ ok: true, text: "Đã khôi phục tiến độ từ file." });
    } catch (e) {
      setMessage({ ok: false, text: `File không hợp lệ: ${e instanceof Error ? e.message : "không đọc được"}` });
    }
  };

  const card = "card p-6";
  const setHumor = (humor: HumorLevel) => {
    update((s) => ({ ...s, prefs: { ...s.prefs, humor } }));
    setPreview(pickLine("correct", { humor }).text);
  };
  const [preview, setPreview] = useState<string | null>(null);
  const btn = "btn-ghost";
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Cài đặt & dữ liệu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tiến độ chỉ nằm trong trình duyệt này. Xóa dữ liệu trình duyệt hoặc đổi máy sẽ mất, nên hãy tải file sao lưu thường xuyên.
      </p>

      {message && (
        <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
          {message.text}
        </p>
      )}

      <section className={`${card} mt-6 space-y-4`} aria-labelledby="voice-title">
        <div>
          <h2 id="voice-title" className="font-semibold">Mức độ “lầy” của Tám</h2>
          <p className="text-sm text-slate-500">Chỉ áp dụng cho lời thoại, thông báo và thành tích. Kiến thức và giải thích luôn nghiêm túc.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Mức độ hài hước">
          {HUMOR_OPTIONS.map((o) => (
            <button
              key={o.value}
              role="radio"
              aria-checked={state.prefs.humor === o.value}
              onClick={() => setHumor(o.value)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                state.prefs.humor === o.value ? "border-brand-500 bg-p-mint" : "border-slate-200 bg-white hover:border-brand-300"
              }`}
            >
              <span className="block text-sm font-semibold">{o.label}</span>
              <span className="block text-xs text-slate-500">{o.hint}</span>
            </button>
          ))}
        </div>
        {preview && <CoachBubble mood="happy" text={`Ví dụ khi trả lời đúng: “${preview}”`} size={44} />}
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="check"
            checked={state.prefs.celebrations}
            onChange={(e) => {
              const celebrations = e.target.checked;
              update((s) => ({ ...s, prefs: { ...s.prefs, celebrations } }));
            }}
          />
          Hiệu ứng ăn mừng khi lên level hoặc mở khóa huy hiệu (tắt thì chỉ hiện thông báo nhỏ)
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="check"
            checked={state.prefs.mascotVoice}
            onChange={(e) => {
              const mascotVoice = e.target.checked;
              update((s) => ({ ...s, prefs: { ...s.prefs, mascotVoice } }));
            }}
          />
          Tám tự đọc lời nhận xét sau mỗi câu trả lời (giọng thu sẵn; vẫn có nút 🔊 để nghe lại)
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="check"
            checked={state.prefs.music}
            onChange={(e) => {
              const music = e.target.checked;
              update((s) => ({ ...s, prefs: { ...s.prefs, music } }));
            }}
          />
          Nhạc nền piano không lời trong game từ vựng (tự đổi bài ngẫu nhiên, nhỏ lại khi đọc từ)
        </label>
      </section>

      <section className={`${card} mt-4 space-y-3`}>
        <h2 className="font-semibold">Sao lưu / khôi phục</h2>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={download}>Tải file sao lưu</button>
          <button className={btn} onClick={() => fileRef.current?.click()}>Nhập từ file…</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void importFile(f);
            }}
          />
        </div>
      </section>

      <section className={`${card} mt-4 space-y-3`}>
        <h2 className="font-semibold">Lộ trình</h2>
        <button
          className={btn}
          disabled={!state.profile}
          onClick={() => {
            if (window.confirm("Đặt ngày 1 là hôm nay? Điểm và câu sai vẫn được giữ.")) {
              update((s) => restartProgram(s));
              setMessage({ ok: true, text: "Đã bắt đầu lại 8 tuần từ hôm nay." });
            }
          }}
        >
          Bắt đầu lại 8 tuần từ hôm nay
        </button>
        <div>
          <button
            className="btn-ghost !border-rose-300 !text-rose-700 hover:!bg-rose-50"
            onClick={() => {
              if (window.confirm("Xóa TOÀN BỘ tiến độ? Không thể hoàn tác (hãy tải file sao lưu trước).")) {
                replaceState(emptyState());
              }
            }}
          >
            Xóa toàn bộ dữ liệu
          </button>
        </div>
      </section>
    </div>
  );
}
