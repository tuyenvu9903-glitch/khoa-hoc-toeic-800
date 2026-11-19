import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { skillRows } from "../data/curriculum";
import { PART5_SKILLS } from "../data/reading";
import { explainWithOptionText, shuffle } from "../domain/learn";
import { questionById, type IndexedQuestion } from "../lib/questionIndex";
import { playScript } from "../lib/speech";
import { errorsDue, recordAnswer, type AppState } from "../lib/state";
import { update, useAppState } from "../lib/store";
import { CoachBubble } from "../components/Mascot";
import { EmptyState } from "../components/Voice";
import { skillTip } from "../voice/coach";
import { pickLine, type Line } from "../voice/engine";
import { useCopy, useHumor } from "../voice/useVoice";

type ErrorEntry = AppState["errors"][number];

const LETTERS = ["A", "B", "C", "D"] as const;
const PART_LABEL: Record<string, string> = {
  "1": "Part 1",
  "2": "Part 2 · Hỏi – đáp",
  "3": "Part 3 · Hội thoại",
  "4": "Part 4 · Bài nói",
  "5": "Part 5 · Điền câu",
  "6": "Part 6",
  "7": "Part 7 · Đọc hiểu",
};
const CLASS_LABEL: Record<string, string> = {
  vocabulary_gap: "Thiếu từ vựng",
  grammar_gap: "Ngữ pháp",
  listening_gap: "Nghe chưa ra",
  reading_gap: "Đọc hiểu",
  paraphrase_failure: "Không nhận ra cách diễn đạt khác",
  distractor_trap: "Mắc bẫy đáp án nhiễu",
  careless_mistake: "Bất cẩn",
  time_pressure: "Thiếu thời gian",
  misread: "Đọc nhầm",
};
const skillName = (code: string) =>
  PART5_SKILLS.find((s) => s.code === code)?.label ?? skillRows.find((s) => s.code === code)?.name ?? code;

type Status = "due" | "open" | "fixed";

function ErrorCard({ entry, q }: { entry: ErrorEntry; q: IndexedQuestion }) {
  // Retry with the options in a new order; the answer is matched by text.
  const order = useMemo(() => shuffle(q.options.map((_, i) => i)), [q]);
  const [picked, setPicked] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [reaction, setReaction] = useState<Line | null>(null);
  const humor = useHumor();
  const fixed = entry.resolvedAt !== null;
  const listening = q.part === "2" || q.part === "3" || q.part === "4";
  const reviewAt = entry.reviewAt ?? entry.createdAt;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setReaction(
      i === q.answer
        ? pickLine("correct_comeback", { humor })
        : pickLine((entry.retries ?? 0) >= 1 ? "wrong_skill" : "wrong", { humor, vars: { skill: skillName(q.skill) } }),
    );
    update((s) =>
      recordAnswer(s, {
        questionId: q.id,
        skillCode: q.skill,
        part: q.part,
        correct: i === q.answer,
        chosen: q.options[i],
        responseMs: 20_000,
        errorClass: entry.errorClass,
      }),
    );
  };

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-p-blue px-2.5 py-0.5 font-medium text-slate-700">{PART_LABEL[q.part]}</span>
        <span className="rounded-full bg-p-coral px-2.5 py-0.5 font-medium text-slate-700">{CLASS_LABEL[entry.errorClass] ?? entry.errorClass}</span>
        <span className="text-slate-500">Liên quan: {skillName(q.skill)}</span>
        <span className="ml-auto text-slate-400">Sai lúc {new Date(entry.createdAt).toLocaleDateString("vi-VN")}</span>
      </div>

      <p className="mt-3 font-medium text-slate-900">{q.question}</p>
      {listening && q.script && (
        <button type="button" className="btn-ghost mt-2 !px-3 !py-1 text-xs" onClick={() => playScript(q.script!)}>
          🔊 Nghe lại đoạn hội thoại
        </button>
      )}
      {q.part === "2" && (
        <button
          type="button"
          className="btn-ghost mt-2 !px-3 !py-1 text-xs"
          onClick={() => playScript([{ speaker: "W", text: q.question }, ...q.options.map((o, i) => ({ speaker: "M" as const, text: `${LETTERS[i]}. ${o}` }))])}
        >
          🔊 Nghe lại câu hỏi
        </button>
      )}

      {!retrying || picked !== null ? (
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-slate-500">Bạn đã chọn</dt><dd className="text-rose-700">{entry.chosen ?? "(không có dữ liệu, câu được lưu trước khi có tính năng này)"}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-slate-500">Đáp án đúng</dt><dd className="font-medium text-brand-800">{q.options[q.answer]}</dd></div>
        </dl>
      ) : null}

      {retrying && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {order.map((i, pos) => (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => pick(i)}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                picked === null
                  ? "border-slate-200 bg-white hover:border-brand-300"
                  : i === q.answer
                    ? "border-brand-500 bg-p-mint"
                    : i === picked
                      ? "border-rose-300 bg-p-coral"
                      : "border-slate-200 opacity-60"
              }`}
            >
              <span className="mr-2 font-semibold text-slate-400">({LETTERS[pos]})</span>
              {q.options[i]}
            </button>
          ))}
        </div>
      )}

      {(picked !== null || !retrying) && <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">💡 {explainWithOptionText(q.explainVi, q.options)}</p>}
      {picked !== null && (
        <p role="status" className={`mt-2 text-sm font-semibold ${picked === q.answer ? "text-brand-700" : "text-rose-700"}`}>
          {picked === q.answer ? "✓ Đúng rồi! Câu này đã được đánh dấu là đã sửa." : "✗ Chưa đúng. Câu này sẽ quay lại để ôn sau."}
        </p>
      )}
      {picked !== null && reaction && (
        <CoachBubble
          mood={reaction.mood}
          text={reaction.text}
          tip={picked !== q.answer ? skillTip(q.skill) : undefined}
          size={48}
          tone={picked === q.answer ? "mint" : "cream"}
          className="pop-in mt-3"
        />
      )}

      {(q.passage || (q.script && q.part !== "2")) && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-slate-600">{q.passage ? `Xem ${q.passage.title.toLowerCase()}` : "Xem lời thoại"}</summary>
          {q.passage ? (
            <div className="mt-2 whitespace-pre-line text-slate-700">{q.passage.text}</div>
          ) : (
            <div className="mt-2 space-y-1 text-slate-700">{q.script!.map((l, i) => <p key={i}>{l.text}</p>)}</div>
          )}
        </details>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {fixed ? `Đã sửa ${new Date(entry.resolvedAt!).toLocaleDateString("vi-VN")}` : `Ôn lại: ${Date.parse(reviewAt) <= Date.now() ? "hôm nay" : new Date(reviewAt).toLocaleDateString("vi-VN")}`}
          {entry.retries ? ` · đã làm lại sai ${entry.retries} lần` : ""}
        </span>
        {!fixed && !retrying && (
          <button type="button" className="btn-primary !py-1.5" onClick={() => setRetrying(true)}>
            Phục thù câu này
          </button>
        )}
      </div>
    </article>
  );
}

/** Error notebook: every mistake with its question, the chosen and correct answers, and a review schedule. */
export function ErrorsPage() {
  const state = useAppState();
  const t = useCopy();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>(params.get("due") ? "due" : "open");
  const [part, setPart] = useState("all");
  const [cls, setCls] = useState("all");

  const dueIds = new Set(errorsDue(state).map((e) => e.id));
  const openCount = state.errors.filter((e) => e.resolvedAt === null).length;
  const list = state.errors
    .filter((e) => (status === "due" ? dueIds.has(e.id) : status === "open" ? e.resolvedAt === null : e.resolvedAt !== null))
    .filter((e) => part === "all" || e.part === part)
    .filter((e) => cls === "all" || e.errorClass === cls)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const parts = [...new Set(state.errors.map((e) => e.part))].sort();
  const classes = [...new Set(state.errors.map((e) => e.errorClass))];
  const missing = list.filter((e) => !questionById.has(e.questionId)).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Sổ lỗi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Nơi lưu giữ những câu đã từng lừa bạn. Phục thù đúng thì câu được đánh dấu đã sửa; sai tiếp thì câu quay lại sau 1, 3 rồi 7 ngày.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <div className="card p-4"><p className="text-xs text-slate-500">Đến hạn ôn</p><p className="text-2xl font-extrabold">{dueIds.size}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Chưa sửa</p><p className="text-2xl font-extrabold">{openCount}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Đã sửa</p><p className="text-2xl font-extrabold">{state.errors.length - openCount}</p></div>
      </section>

      <section className="card flex flex-wrap items-end gap-3 p-4" aria-label="Bộ lọc">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Trạng thái">
          {([["due", "Đến hạn"], ["open", "Chưa sửa"], ["fixed", "Đã sửa"]] as [Status, string][]).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={status === k}
              onClick={() => setStatus(k)}
              className={`rounded-lg px-3 py-1.5 text-sm ${status === k ? "bg-white font-semibold text-brand-800 shadow-sm" : "text-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="text-sm">
          <span className="block text-xs text-slate-500">Part</span>
          <select value={part} onChange={(e) => setPart(e.target.value)} className="field !py-1.5">
            <option value="all">Tất cả</option>
            {parts.map((p) => <option key={p} value={p}>{PART_LABEL[p]}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-slate-500">Loại lỗi</span>
          <select value={cls} onChange={(e) => setCls(e.target.value)} className="field !py-1.5">
            <option value="all">Tất cả</option>
            {classes.map((c) => <option key={c} value={c}>{CLASS_LABEL[c] ?? c}</option>)}
          </select>
        </label>
      </section>

      {list.length === 0 ? (
        <EmptyState
          mood={state.errors.length === 0 ? "confused" : status === "due" ? "sleepy" : "confused"}
          text={state.errors.length === 0 ? t("noErrors") : status === "due" ? t("noErrorsDue") : t("noFilterMatch")}
        />
      ) : (
        <div className="space-y-4">
          {list.map((e) => {
            const q = questionById.get(e.questionId);
            return q ? <ErrorCard key={e.id} entry={e} q={q} /> : null;
          })}
          {missing > 0 && <p className="text-xs text-slate-500">{missing} câu không còn trong ngân hàng câu hỏi nên không hiển thị được.</p>}
        </div>
      )}
    </div>
  );
}
