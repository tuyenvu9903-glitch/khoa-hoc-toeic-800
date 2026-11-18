import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PART5_SKILLS, part5Items, part7Sets, type Part5Item, type Part7Set } from "../data/reading";
import { packByDay } from "../data/dayPacks";
import { shuffle, shuffleOptions } from "../domain/learn";
import { firstGrammarDay, part7BankUnlocked, unlockedGrammar } from "../domain/progress";
import { localDateKey, markMissionDone, recordAnswer } from "../lib/state";
import { update, useAppState } from "../lib/store";

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
  items: raw,
  onDone,
  onExit,
  header,
}: {
  items: Part5Item[];
  onDone: (r: SessionResult) => void;
  onExit?: () => void;
  header?: string;
}) {
  const items = useMemo(() => raw.map((i) => shuffleOptions(i)), [raw]);
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
        chosen: item.options[i],
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
  sets: raw,
  onDone,
  onExit,
  header,
}: {
  sets: Part7Set[];
  onDone: (r: SessionResult) => void;
  onExit?: () => void;
  header?: string;
}) {
  const sets = useMemo(() => raw.map((st) => ({ ...st, questions: st.questions.map((qq) => shuffleOptions(qq)) })), [raw]);
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
            chosen: picks[i] != null ? qq.options[picks[i]!] : undefined,
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

type Kind = "p5" | "p7";
type Mode = { kind: "p5"; items: Part5Item[] } | { kind: "p7"; sets: Part7Set[] } | null;

function pickPart5(skills: Set<string>, only: string | null): Part5Item[] {
  const pool = part5Items.filter((i) => (only ? i.skill === only : skills.has(i.skill)));
  return shuffle(pool.length > 0 ? pool : part5Items.filter((i) => skills.has(i.skill))).slice(0, PART5_COUNT);
}

export function ReadingPage() {
  const state = useAppState();
  const day = state.progress.day;
  const pack = packByDay.get(day);
  const skills = useMemo(() => unlockedGrammar(day), [day]);
  const bank7Open = part7BankUnlocked(day);
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(null);
  const [result, setResult] = useState<(SessionResult & { kind: Kind }) | null>(null);

  // Deep links from the daily plan: /reading?today=p5|p7, /reading?part=5&skill=…, /reading?part=7
  useEffect(() => {
    const today = params.get("today");
    const part = params.get("part");
    const skill = params.get("skill");
    if (today === "p5" && pack) setMode({ kind: "p5", items: pack.part5 });
    else if (today === "p7" && pack) setMode({ kind: "p7", sets: [pack.part7] });
    else if (part === "5") setMode({ kind: "p5", items: pickPart5(skills, skill && skills.has(skill) ? skill : null) });
    else if (part === "7" && bank7Open) setMode({ kind: "p7", sets: shuffle(part7Sets).slice(0, PART7_SETS) });
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exit = () => {
    setMode(null);
    setParams({}, { replace: true });
  };
  const finish = (kind: Kind) => (r: SessionResult) => {
    update((s) => markMissionDone(s, localDateKey(new Date()), kind === "p5" ? "grammar" : "reading"));
    setResult({ ...r, kind });
    exit();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Luyện đọc &amp; ngữ pháp</h1>
      <p className="mt-1 text-sm text-slate-500">Câu ngữ pháp và bài đọc mỗi ngày dùng từ vựng của ngày đó. Câu sai được ghi vào nhật ký lỗi.</p>

      {mode?.kind === "p5" && <div className="mx-auto mt-5 max-w-3xl"><Part5Session items={mode.items} onDone={finish("p5")} onExit={exit} /></div>}
      {mode?.kind === "p7" && <div className="mt-5"><Part7Session sets={mode.sets} onDone={finish("p7")} onExit={exit} /></div>}

      {mode === null && (
        <div className="mx-auto max-w-3xl">
          {result && (
            <div role="status" className="card mt-5 p-5 text-center">
              <p className="text-3xl font-extrabold">{result.correct}/{result.total}</p>
              <p className="mt-1 text-sm text-slate-600">
                câu đúng ({Math.round((result.correct / result.total) * 100)}%). Nhiệm vụ "{result.kind === "p5" ? "Ngữ pháp" : "Đọc"}" của Ngày {day} đã được đánh dấu.
              </p>
            </div>
          )}

          {pack && (
            <section className="card mt-5 border-brand-200 bg-brand-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Bài hôm nay · Ngày {day} · {pack.theme}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <h2 className="font-bold">✏️ Ngữ pháp (Part 5)</h2>
                  <p className="mt-1 text-sm text-slate-600">{pack.part5.length} câu điền từ, dùng từ vựng của hôm nay.</p>
                  <button onClick={() => { setResult(null); setMode({ kind: "p5", items: pack.part5 }); }} className="btn-primary mt-3 !py-1.5">
                    Làm bài
                  </button>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <h2 className="font-bold">📖 Đọc hiểu (Part 7)</h2>
                  <p className="mt-1 text-sm text-slate-600">{pack.part7.title}, {pack.part7.questions.length} câu hỏi.</p>
                  <button onClick={() => { setResult(null); setMode({ kind: "p7", sets: [pack.part7] }); }} className="btn-primary mt-3 !py-1.5">
                    Làm bài
                  </button>
                </div>
              </div>
            </section>
          )}

          <h2 className="mt-6 text-sm font-semibold text-slate-500">Luyện thêm (các phần đã học tới)</h2>
          <section className="card mt-3 p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-p-blue text-xl" aria-hidden>✏️</span>
              <div>
                <h2 className="font-bold">Part 5 · Ngữ pháp theo dạng</h2>
                <p className="mt-1 text-sm text-slate-600">{PART5_COUNT} câu mỗi lượt. Dạng chưa học tới sẽ mở theo lộ trình.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setMode({ kind: "p5", items: pickPart5(skills, null) })} className="btn-primary !py-1.5">
                Trộn các dạng đã học
              </button>
              {PART5_SKILLS.map((sk) => {
                const open = skills.has(sk.code);
                return (
                  <button
                    key={sk.code}
                    disabled={!open}
                    title={open ? undefined : `Mở từ Ngày ${firstGrammarDay(sk.code) ?? "?"}`}
                    onClick={() => setMode({ kind: "p5", items: pickPart5(skills, sk.code) })}
                    className="btn-ghost !py-1.5"
                  >
                    {open ? "" : "🔒 "}
                    {sk.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`card mt-4 p-5 ${bank7Open ? "" : "opacity-60"}`}>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-p-cream text-xl" aria-hidden>{bank7Open ? "📖" : "🔒"}</span>
              <div className="flex-1">
                <h2 className="font-bold">Part 7 · Đọc hiểu tổng hợp</h2>
                <p className="mt-1 text-sm text-slate-600">E-mail, quảng cáo, thông báo, tin nhắn, bài báo. {PART7_SETS} bài mỗi lượt.</p>
              </div>
            </div>
            <button
              disabled={!bank7Open}
              onClick={() => setMode({ kind: "p7", sets: shuffle(part7Sets).slice(0, PART7_SETS) })}
              className="btn-primary mt-4"
            >
              {bank7Open ? "Bắt đầu" : "Mở từ tuần 3"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
