import { useRef, useState } from "react";
import { emptyState, parseState, restartProgram } from "../lib/state";
import { exportJson, replaceState, update, useAppState } from "../lib/store";

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
  const btn = "btn-ghost";
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Dữ liệu & sao lưu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tiến độ chỉ nằm trong trình duyệt này. Xóa dữ liệu trình duyệt hoặc đổi máy sẽ mất, nên hãy tải file sao lưu thường xuyên.
      </p>

      {message && (
        <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
          {message.text}
        </p>
      )}

      <section className={`${card} mt-6 space-y-3`}>
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
