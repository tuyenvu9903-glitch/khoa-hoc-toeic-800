import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PART5_SKILLS, part5Items, part7Sets, type Part5Item, type Part7Set } from "../data/reading";
import { shuffle } from "../domain/learn";
import { localDateKey, markMissionDone, recordAnswer } from "../lib/state";
import { update } from "../lib/store";

const LETTERS = ["A", "B", "C", "D"] as const;
const PART5_COUNT = 10;
const PART7_SETS = 2;

export type SessionResult = { correct: number; total: number };

function Explain({ text }: { text: string }) {
  return <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">💡 {text}</p>;
}

function optionStyle(submitted: boolean, isAnswer: boolean, chosen: boolean): string {
  if (submitted) {
    if (isAnswer) return "border-emerald-500 bg-emerald-50 text-emerald-900";
    if (chosen) return "border-rose-400 bg-rose-50 text-rose-800";
    return "opacity-60";
  }
  return chosen ? "border-brand-500 bg-brand-50" : "hover:border-brand-300";
}

/** Part 5: one sentence at a time with instant feedback. */
export function Part5Session({
  items,
  onDone,
  onExit,
  header,
}: {
  items: Part5Item[];
  onDone: (r: SessionResult) => void;
  onExit?: () => void;
  header?: string;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const startedAt = useRef(Date.now());
  const item = items[index]!;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === item.answer;
    if (ok) setCorrect((c) => c + 1);
    update((s) =>
      recordAnswer(s, {
        questionId: item.id,
        skillCode: item.skill,
        part: "5",
        correct: ok,
        responseMs: Date.now() - startedAt.current,
        errorClass: "grammar_gap",
      }),
    );
  };
  const next = () => {
    if (index + 1 >= items.length) {
      onDone({ correct, total: items.length });
      return;
    }
    setPicked(null);
    setIndex(index + 1);
    startedAt.current = Date.now();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      const i = ["a", "b", "c", "d"].indexOf(k);
      if (picked === null && i >= 0) choose(i);
      else if (picked !== null && (k === "enter" || k === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const [before, after] = item.sentence.split("-------");
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        {onExit ? <button onClick={onExit} className="hover:text-slate-800">← Thoát</button> : <span>{header}</span>}
        <span>Câu {index + 1}/{items.length}</span>
      </div>
      <div className="card p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Part 5 · Điền vào câu · {PART5_SKILLS.find((s) => s.code === item.skill)?.label}
        </p>
        <p className="mt-3 text-lg leading-relaxed text-slate-900">
          {before}
          <span className="mx-1 inline-block min-w-16 border-b-2 border-slate-400 text-center font-semibold text-brand-700">
            {picked !== null ? item.options[item.answer] : " "}
          </span>
          {after}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {item.options.map((o, i) => (
            <button
              key={i}
              disabled={picked !== null}
              onClick={() => choose(i)}
              className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition ${optionStyle(picked !== null, i === item.answer, picked === i)}`}
            >
              <span className="mr-2 font-semibold text-slate-400">({LETTERS[i]})</span>
              {o}
            </button>
          ))}
        </div>
        {picked !== null && (
          <div className="mt-5">
            <p className={`font-semibold ${picked === item.answer ? "text-emerald-700" : "text-rose-700"}`}>
              {picked === item.answer ? "✓ Chính xác" : `✗ Đáp án đúng là (${LETTERS[item.answer]}) ${item.options[item.answer]}`}
            </p>
            <Explain text={item.explainVi} />
            <button onClick={next} className="btn-primary mt-5">{index + 1 >= items.length ? "Xong" : "Câu tiếp →"}</button>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-500">Phím tắt: A–D để chọn, Enter để sang câu tiếp.</p>
    </div>
  );
}

/** Part 7: a passage with its questions, answered together then checked. */
export function Part7Session({
  sets,
  onDone,
  onExit,
  header,
}: {
  sets: Part7Set[];
  onDone: (r: SessionResult) => void;
  onExit?: () => void;
  header?: string;
}) {
  const [index, setIndex] = useState(0);
  const set = sets[index]!;
  const [picks, setPicks] = useState<(number | null)[]>(() => set.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const startedAt = useRef(Date.now());

  const submit = () => {
    setSubmitted(true);
    const ms = (Date.now() - startedAt.current) / set.questions.length;
    update((s) =>
      set.questions.reduce(
        (st, qq, i) =>
          recordAnswer(st, {
            questionId: `${set.id}-q${i + 1}`,
            skillCode: qq.skill,
            part: "7",
            correct: picks[i] === qq.answer,
            responseMs: ms,
            errorClass: qq.skill.endsWith("paraphrase") ? "paraphrase_failure" : "reading_gap",
          }),
        s,
      ),
    );
    setCorrect((c) => c + set.questions.filter((qq, i) => picks[i] === qq.answer).length);
  };
  const next = () => {
    if (index + 1 >= sets.length) {
      onDone({ correct, total: sets.reduce((n, s) => n + s.questions.length, 0) });
      return;
    }
    const nextSet = sets[index + 1]!;
    setPicks(nextSet.questions.map(() => null));
    setSubmitted(false);
    setIndex(index + 1);
    startedAt.current = Date.now();
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        {onExit ? <button onClick={onExit} className="hover:text-slate-800">← Thoát</button> : <span>{header}</span>}
        <span>Bài đọc {index + 1}/{sets.length}</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Part 7 · {set.title}</p>
          <div className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">{set.passage}</div>
        </article>
        <div className="card p-6">
          <ol className="space-y-5">
            {set.questions.map((qq, qi) => (
              <li key={qi}>
                <p className="font-semibold text-slate-900">{qi + 1}. {qq.question}</p>
                <div className="mt-2 grid gap-2">
                  {qq.options.map((o, oi) => (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setPicks((p) => p.map((v, i) => (i === qi ? oi : v)))}
                      className={`rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm transition ${optionStyle(submitted, oi === qq.answer, picks[qi] === oi)}`}
                    >
                      <span className="mr-2 font-semibold text-slate-400">({LETTERS[oi]})</span>
                      {o}
                    </button>
                  ))}
                </div>
                {submitted && <Explain text={qq.explainVi} />}
              </li>
            ))}
          </ol>
          {!submitted ? (
            <button onClick={submit} disabled={picks.some((p) => p === null)} className="btn-primary mt-6">Nộp đáp án</button>
          ) : (
            <button onClick={next} className="btn-primary mt-6">{index + 1 >= sets.length ? "Xong" : "Bài tiếp →"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

type Mode = { kind: "p5"; items: Part5Item[] } | { kind: "p7"; sets: Part7Set[] } | null;

function pickPart5(skill: string | null): Part5Item[] {
  const pool = skill ? part5Items.filter((i) => i.skill === skill) : part5Items;
  return shuffle(pool.length > 0 ? pool : part5Items).slice(0, PART5_COUNT);
}

export function ReadingPage() {
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(null);
  const [result, setResult] = useState<(SessionResult & { kind: "p5" | "p7" }) | null>(null);

  // Deep links from the daily plan: /reading?part=5&skill=R.P5.tense or /reading?part=7
  useEffect(() => {
    const part = params.get("part");
    if (part === "5") setMode({ kind: "p5", items: pickPart5(params.get("skill")) });
    else if (part === "7") setMode({ kind: "p7", sets: shuffle(part7Sets).slice(0, PART7_SETS) });
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exit = () => {
    setMode(null);
    setParams({}, { replace: true });
  };
  const finish = (kind: "p5" | "p7") => (r: SessionResult) => {
    update((s) => markMissionDone(s, localDateKey(new Date()), kind === "p5" ? "grammar" : "reading"));
    setResult({ ...r, kind });
    exit();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Luyện đọc &amp; ngữ pháp</h1>
      <p className="mt-1 text-sm text-slate-500">Part 5 luyện ngữ pháp theo từng dạng, Part 7 luyện đọc hiểu. Câu sai được ghi vào nhật ký lỗi.</p>

      {mode?.kind === "p5" && <div className="mx-auto mt-5 max-w-3xl"><Part5Session items={mode.items} onDone={finish("p5")} onExit={exit} /></div>}
      {mode?.kind === "p7" && <div className="mt-5"><Part7Session sets={mode.sets} onDone={finish("p7")} onExit={exit} /></div>}

      {mode === null && (
        <div className="mx-auto max-w-3xl">
          {result && (
            <div role="status" className="card mt-5 p-5 text-center">
              <p className="text-3xl font-extrabold">{result.correct}/{result.total}</p>
              <p className="mt-1 text-sm text-slate-600">
                câu đúng ({Math.round((result.correct / result.total) * 100)}%). Nhiệm vụ "{result.kind === "p5" ? "Ngữ pháp" : "Đọc"}" hôm nay đã được đánh dấu.
              </p>
            </div>
          )}

          <section className="card mt-5 p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-xl" aria-hidden>✏️</span>
              <div>
                <h2 className="font-bold">Part 5 · Ngữ pháp (điền vào câu)</h2>
                <p className="mt-1 text-sm text-slate-600">{PART5_COUNT} câu mỗi lượt, có giải thích ngay. Chọn một dạng để luyện riêng ({part5Items.length} câu trong ngân hàng).</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setMode({ kind: "p5", items: pickPart5(null) })} className="btn-primary !py-1.5">Trộn tất cả</button>
              {PART5_SKILLS.map((s) => (
                <button key={s.code} onClick={() => setMode({ kind: "p5", items: pickPart5(s.code) })} className="btn-ghost !py-1.5">
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card mt-4 p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl" aria-hidden>📖</span>
              <div className="flex-1">
                <h2 className="font-bold">Part 7 · Đọc hiểu</h2>
                <p className="mt-1 text-sm text-slate-600">E-mail, quảng cáo, thông báo, tin nhắn, bài báo. {PART7_SETS} bài mỗi lượt ({part7Sets.length} bài trong ngân hàng).</p>
              </div>
            </div>
            <button onClick={() => setMode({ kind: "p7", sets: shuffle(part7Sets).slice(0, PART7_SETS) })} className="btn-primary mt-4">Bắt đầu</button>
          </section>
          <p className="mt-3 text-xs text-slate-500">Part 6 (điền vào đoạn văn) sẽ được bổ sung sau.</p>
        </div>
      )}
    </div>
  );
}
