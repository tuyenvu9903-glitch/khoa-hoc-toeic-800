import { useState } from "react";
import { Link } from "react-router-dom";
import { skillRows } from "../data/curriculum";
import { isDayComplete, PROGRAM_DAYS, unlockedWords } from "../domain/progress";
import { isDue, isMature } from "../domain/srs";
import { currentStreak } from "../domain/streak";
import { buildDashboard } from "../lib/dashboard";
import { addOfficialScore, localDateKey, scoreSourceLabel, type Profile } from "../lib/state";
import { update, useAppState } from "../lib/store";
import { useCopy } from "../voice/useVoice";

const PART_LABEL: Record<string, string> = {
  "1": "Part 1 · Tranh",
  "2": "Part 2 · Hỏi – đáp",
  "3": "Part 3 · Hội thoại",
  "4": "Part 4 · Bài nói",
  "5": "Part 5 · Điền câu",
  "6": "Part 6 · Điền đoạn",
  "7": "Part 7 · Đọc hiểu",
};
const partOf = new Map(skillRows.map((s) => [s.code, s.part]));

function OfficialScoreForm() {
  const [date, setDate] = useState(localDateKey());
  const [listening, setListening] = useState("");
  const [reading, setReading] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          update((s) => addOfficialScore(s, { date, listening: Number(listening), reading: Number(reading) }));
          setMsg({ ok: true, text: "Đã lưu điểm thi chính thức." });
          setListening("");
          setReading("");
        } catch (err) {
          setMsg({ ok: false, text: err instanceof Error ? err.message : "Không lưu được." });
        }
      }}
    >
      <label className="text-sm">
        <span className="text-slate-600">Ngày thi</span>
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="field mt-1" />
      </label>
      <label className="text-sm">
        <span className="text-slate-600">Nghe (5–495)</span>
        <input type="number" required min={5} max={495} step={5} inputMode="numeric" value={listening} onChange={(e) => setListening(e.target.value)} className="field mt-1" />
      </label>
      <label className="text-sm">
        <span className="text-slate-600">Đọc (5–495)</span>
        <input type="number" required min={5} max={495} step={5} inputMode="numeric" value={reading} onChange={(e) => setReading(e.target.value)} className="field mt-1" />
      </label>
      <button className="btn-primary">Lưu</button>
      {msg && (
        <p role="status" className={`text-sm sm:col-span-4 ${msg.ok ? "text-brand-700" : "text-rose-700"}`}>
          {msg.text}
        </p>
      )}
    </form>
  );
}

export function ProgressPage({ profile }: { profile: Profile }) {
  const t = useCopy();
  const state = useAppState();
  const now = new Date();
  const view = buildDashboard(state, profile, now);
  const day = state.progress.day;

  const scores = [...state.scores].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const official = scores.filter((s) => scoreSourceLabel(s.source).official);
  const estimates = scores.filter((s) => !scoreSourceLabel(s.source).official);

  const byPart = new Map<string, { attempts: number; correct: number }>();
  for (const [code, s] of Object.entries(state.skillStats)) {
    const part = partOf.get(code);
    if (!part) continue;
    const p = byPart.get(part) ?? { attempts: 0, correct: 0 };
    p.attempts += s.attempts;
    p.correct += s.correct;
    byPart.set(part, p);
  }

  const open = unlockedWords(day);
  const cards = open.map((w) => state.srs[w.id]).filter((c) => c !== undefined);
  const mature = cards.filter(isMature).length;
  const due = cards.filter((c) => isDue(c, now)).length;
  const daysDone = day - 1 + (isDayComplete(state.progress, state.srs) ? 1 : 0);
  const streak = currentStreak(state.missionDone, now);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Tiến độ</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Tổng quan">
        <div className="card p-4"><p className="text-xs text-slate-500">Ngày đã hoàn thành</p><p className="text-2xl font-extrabold">{daysDone}<span className="text-sm font-medium text-slate-400">/{PROGRAM_DAYS}</span></p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Chuỗi ngày học</p><p className="text-2xl font-extrabold">🔥 {streak}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Từ đã học</p><p className="text-2xl font-extrabold">{cards.length}<span className="text-sm font-medium text-slate-400">/{open.length} đã mở</span></p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Câu sai chưa ôn</p><p className="text-2xl font-extrabold">{view.openErrors}</p></div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold">Điểm TOEIC</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">🎓 Điểm thi chính thức</h3>
            {official.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">Chưa có gì, trống như ví cuối tháng. Nhập điểm nếu bạn đã thi TOEIC thật.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {official.map((s) => (
                  <li key={s.at + s.source} className="flex justify-between py-1.5">
                    <span>{new Date(s.at).toLocaleDateString("vi-VN")}</span>
                    <span>Nghe {s.listening} · Đọc {s.reading} · <strong>{s.total}</strong></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">📊 Điểm ước lượng từ bài làm trong app</h3>
            {estimates.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">Chưa có. Mini test đầu tiên ở Ngày 7, thi thử từ Ngày 29.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {estimates.slice(0, 8).map((s) => (
                  <li key={s.at + s.source} className="py-1.5">
                    <div className="flex justify-between">
                      <span>{new Date(s.at).toLocaleDateString("vi-VN")}</span>
                      <span>Nghe {s.listening} · Đọc {s.reading} · <strong>{s.total}</strong></span>
                    </div>
                    <p className="text-xs text-slate-500">{scoreSourceLabel(s.source).label}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Điểm ước lượng tính từ tỉ lệ câu đúng, không phải điểm chính thức của ETS. Mục tiêu: {profile.targetScore}.</p>
        <details className="mt-4 rounded-xl bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold">+ Nhập điểm thi TOEIC thật</summary>
          <OfficialScoreForm />
        </details>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold">Độ chính xác theo Part</h2>
        {byPart.size === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t("noAttempts")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {[...byPart.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([part, p]) => {
              const pct = Math.round((p.correct / Math.max(1, p.attempts)) * 100);
              return (
                <li key={part}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{PART_LABEL[part]}</span>
                    <span className="text-slate-600">{p.correct}/{p.attempts} câu · <strong>{pct}%</strong></span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-brand-600" : pct >= 60 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-bold">Từ vựng</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Đã học / đã mở</dt><dd className="font-semibold">{cards.length}/{open.length}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Thuộc lâu (ôn đúng nhiều lần)</dt><dd className="font-semibold">{mature}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Đến hạn ôn hôm nay</dt><dd className="font-semibold">{due}</dd></div>
          </dl>
          <Link to="/vocab" className="btn-ghost mt-4 !py-1.5">Mở Từ vựng</Link>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold">Dạng câu cần cải thiện</h2>
          {view.weaknesses.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Chưa đủ dữ liệu.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {view.weaknesses.slice(0, 6).map((w) => (
                <li key={w.skillCode} className="flex justify-between gap-2">
                  <span>{w.name}</span>
                  <span className="font-semibold text-slate-700">{Math.round(w.accuracy * 100)}%</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
