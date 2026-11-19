import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  part2Items,
  part3Sets,
  part4Sets,
  type ListeningSet,
  type Part2Item,
  type ScriptSpeaker,
} from "../data/listening";
import { packByDay } from "../data/dayPacks";
import { shuffle, shuffleOptions } from "../domain/learn";
import { firstListeningDay, listeningUnlocked } from "../domain/progress";
import { localDateKey, markMissionDone, recordAnswer } from "../lib/state";
import { CoachReaction, SessionResult, StartLine } from "../components/Voice";
import { useCoach } from "../voice/useVoice";
import { canSpeech, playScript, voicesReady, type ScriptLine } from "../lib/speech";
import { update, useAppState } from "../lib/store";

const PART2_COUNT = 10;
const SETS_PER_SESSION = 3;
const LETTERS = ["A", "B", "C", "D"] as const;
const SPEEDS = [
  { rate: 0.8, label: "Chậm" },
  { rate: 0.95, label: "Vừa" },
  { rate: 1.05, label: "Như thi thật" },
];
const SPEAKER_LABEL: Record<ScriptSpeaker, string> = { M: "Man", W: "Woman", M2: "Man 2", W2: "Woman 2" };

type Mode = { kind: "p2"; items: Part2Item[] } | { kind: "sets"; part: "3" | "4"; sets: ListeningSet[] } | null;
type Result = { correct: number; total: number };

function usePlayer(rate: number) {
  const stopRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const play = (lines: ScriptLine[]) => {
    stopRef.current();
    setPlaying(true);
    void voicesReady().then(() => {
      stopRef.current = playScript(lines, {
        rate,
        onLine: setLine,
        onEnd: () => {
          setPlaying(false);
          setLine(-1);
        },
      });
    });
  };
  const stop = () => {
    stopRef.current();
    setPlaying(false);
    setLine(-1);
  };
  useEffect(() => () => stopRef.current(), []);
  return { play, stop, playing, line };
}

function PlayerBar({ playing, onPlay, onStop }: { playing: boolean; onPlay: () => void; onStop: () => void }) {
  return (
    <div className="flex items-center gap-3">
      {playing ? (
        <button onClick={onStop} className="btn-ghost">⏹ Dừng</button>
      ) : (
        <button onClick={onPlay} className="btn-ghost">🔁 Nghe lại</button>
      )}
      {playing && <span className="text-sm text-slate-500" aria-live="polite">Đang phát…</span>}
    </div>
  );
}

function Explain({ text }: { text: string }) {
  return <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">💡 {text}</p>;
}

export function Part2Session({ items: raw, rate, onDone, onExit }: { items: Part2Item[]; rate: number; onDone: (r: Result) => void; onExit: () => void }) {
  const items = useMemo(() => raw.map((i) => shuffleOptions(i)), [raw]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const startedAt = useRef(Date.now());
  const player = usePlayer(rate);
  const coach = useCoach();
  const item = items[index]!;

  const script = (it: Part2Item): ScriptLine[] => [
    { speaker: it.speakers[0], text: it.prompt },
    ...it.options.map((o, i) => ({ speaker: it.speakers[1], text: `${LETTERS[i]}. ${o}` })),
  ];

  useEffect(() => {
    startedAt.current = Date.now();
    player.play(script(item));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const choose = (i: number) => {
    if (picked !== null) return;
    player.stop();
    setPicked(i);
    const ok = i === item.answer;
    if (ok) setCorrect((c) => c + 1);
    coach.react({ correct: ok, skillCode: item.skill, responseMs: Date.now() - startedAt.current });
    update((s) =>
      recordAnswer(s, { questionId: item.id, skillCode: item.skill, part: "2", correct: ok, responseMs: Date.now() - startedAt.current, chosen: item.options[i] }),
    );
  };

  const next = () => {
    if (index + 1 >= items.length) {
      player.stop();
      onDone({ correct, total: items.length });
      return;
    }
    setPicked(null);
    setIndex(index + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const i = ["a", "b", "c"].indexOf(k);
      if (picked === null && i >= 0) choose(i);
      else if (picked !== null && (k === "enter" || k === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        <span>Câu {index + 1}/{items.length}</span>
      </div>
      <div className="card p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Part 2 · Hỏi – đáp</p>
        <p className="mt-2 text-slate-700">Nghe câu hỏi và 3 câu trả lời, chọn câu trả lời phù hợp nhất. Đề thi thật không in chữ.</p>
        <div className="mt-4"><PlayerBar playing={player.playing} onPlay={() => player.play(script(item))} onStop={player.stop} /></div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {item.options.map((_, i) => {
            const state =
              picked === null ? "" : i === item.answer ? "border-emerald-500 bg-emerald-50" : i === picked ? "border-rose-400 bg-rose-50" : "opacity-60";
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={picked !== null}
                className={`rounded-xl border border-slate-200 bg-white py-4 text-2xl font-bold transition hover:border-brand-400 ${state}`}
              >
                {LETTERS[i]}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-5">
            <p className={`font-semibold ${picked === item.answer ? "text-emerald-700" : "text-rose-700"}`}>
              {picked === item.answer ? "✓ Chính xác" : `✗ Đáp án đúng là ${LETTERS[item.answer]}`}
            </p>
            <CoachReaction line={coach.line} className="mt-3" />
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-slate-900">{item.prompt}</p>
              {item.options.map((o, i) => (
                <p key={i} className={i === item.answer ? "font-medium text-emerald-800" : "text-slate-600"}>
                  ({LETTERS[i]}) {o}
                </p>
              ))}
            </div>
            <Explain text={item.explainVi} />
            <button onClick={next} className="btn-primary mt-5">{index + 1 >= items.length ? "Xem kết quả" : "Câu tiếp →"}</button>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-500">Phím tắt: A / B / C để chọn, Enter để sang câu tiếp.</p>
    </div>
  );
}

export function SetSession({ part, sets: raw, rate, onDone, onExit }: { part: "3" | "4"; sets: ListeningSet[]; rate: number; onDone: (r: Result) => void; onExit: () => void }) {
  const sets = useMemo(
    () => raw.map((st) => ({ ...st, questions: st.questions.map((qq) => shuffleOptions(qq)) as ListeningSet["questions"] })),
    [raw],
  );
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const startedAt = useRef(Date.now());
  const player = usePlayer(rate);
  const coach = useCoach();
  const set = sets[index]!;
  const first = index * 3 + 1;

  const script = (s: ListeningSet): ScriptLine[] => [
    { speaker: "M2", text: `Questions ${first} through ${first + 2} refer to the following ${s.kind}.` },
    ...s.lines,
  ];

  useEffect(() => {
    startedAt.current = Date.now();
    player.play(script(set));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const submit = () => {
    player.stop();
    setSubmitted(true);
    const ms = Date.now() - startedAt.current;
    let n = 0;
    update((s) => {
      let st = s;
      set.questions.forEach((qq, i) => {
        st = recordAnswer(st, {
          questionId: `${set.id}-q${i + 1}`,
          skillCode: qq.skill,
          part,
          correct: picks[i] === qq.answer,
          chosen: picks[i] != null ? qq.options[picks[i]!] : undefined,
          responseMs: ms / 3,
          errorClass: qq.skill.endsWith("paraphrase") ? "paraphrase_failure" : "listening_gap",
        });
      });
      return st;
    });
    set.questions.forEach((qq, i) => {
      if (picks[i] === qq.answer) n += 1;
      coach.react({ correct: picks[i] === qq.answer, skillCode: qq.skill, responseMs: ms / 3 });
    });
    setCorrect((c) => c + n);
  };

  const next = () => {
    if (index + 1 >= sets.length) {
      player.stop();
      onDone({ correct, total: sets.length * 3 });
      return;
    }
    setPicks([null, null, null]);
    setSubmitted(false);
    setIndex(index + 1);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        <span>{part === "3" ? "Hội thoại" : "Bài nói"} {index + 1}/{sets.length}</span>
      </div>
      <div className="card p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Part {part} · {part === "3" ? "Hội thoại" : "Bài nói ngắn"} · {set.kind}
        </p>
        <div className="mt-4"><PlayerBar playing={player.playing} onPlay={() => player.play(script(set))} onStop={player.stop} /></div>

        <ol className="mt-5 space-y-5">
          {set.questions.map((qq, qi) => (
            <li key={qi}>
              <p className="font-semibold text-slate-900">{first + qi}. {qq.question}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {qq.options.map((o, oi) => {
                  const chosen = picks[qi] === oi;
                  const style = submitted
                    ? oi === qq.answer
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : chosen
                        ? "border-rose-400 bg-rose-50 text-rose-800"
                        : "opacity-60"
                    : chosen
                      ? "border-brand-500 bg-brand-50"
                      : "hover:border-brand-300";
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setPicks((p) => p.map((v, i) => (i === qi ? oi : v)))}
                      className={`rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm transition ${style}`}
                    >
                      <span className="mr-2 font-semibold text-slate-400">({LETTERS[oi]})</span>
                      {o}
                    </button>
                  );
                })}
              </div>
              {submitted && <Explain text={qq.explainVi} />}
            </li>
          ))}
        </ol>

        {!submitted ? (
          <button onClick={submit} disabled={picks.some((p) => p === null)} className="btn-primary mt-6">
            Chốt đáp án
          </button>
        ) : (
          <>
            <CoachReaction line={coach.line} className="mt-6" />
            <details className="mt-6 rounded-xl border border-slate-200 p-4" open>
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Lời thoại (transcript)</summary>
              <div className="mt-3 space-y-2 text-sm">
                {set.lines.map((l, i) => (
                  <p key={i} className={player.line === i + 1 ? "rounded bg-brand-50" : ""}>
                    {set.lines.length > 1 && <span className="mr-1 font-semibold text-slate-500">{SPEAKER_LABEL[l.speaker]}:</span>}
                    {l.text}
                  </p>
                ))}
              </div>
            </details>
            <button onClick={next} className="btn-primary mt-5">{index + 1 >= sets.length ? "Xem kết quả" : "Bài tiếp →"}</button>
          </>
        )}
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  tone,
  title,
  desc,
  action,
  onClick,
  lockedUntil,
}: {
  icon: string;
  tone: string;
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
  lockedUntil?: number | null;
}) {
  const locked = lockedUntil !== undefined && lockedUntil !== null;
  return (
    <div className={`card flex flex-col p-5 ${locked ? "opacity-60" : ""}`}>
      <span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${tone}`} aria-hidden>{locked ? "🔒" : icon}</span>
      <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-slate-600">{desc}</p>
      <button onClick={onClick} disabled={locked} className="btn-primary mt-4 self-start">
        {locked ? `Mở từ Ngày ${lockedUntil}` : action}
      </button>
    </div>
  );
}

/** Today's listening: the day pack's Part 2 items, then its conversation or talk if it has one. */
function TodaySession({ day, rate, onDone, onExit }: { day: number; rate: number; onDone: (r: Result) => void; onExit: () => void }) {
  const pack = packByDay.get(day)!;
  const [stage, setStage] = useState<"p2" | "talk">("p2");
  const [first, setFirst] = useState<Result | null>(null);
  const talk = useMemo(() => (pack.talk ? [pack.talk] : []), [pack]);
  if (stage === "p2") {
    return (
      <Part2Session
        items={pack.part2}
        rate={rate}
        onExit={onExit}
        onDone={(r) => {
          if (talk.length === 0) onDone(r);
          else {
            setFirst(r);
            setStage("talk");
          }
        }}
      />
    );
  }
  return (
    <SetSession
      part={pack.talk!.part}
      sets={talk}
      rate={rate}
      onExit={onExit}
      onDone={(r) => onDone({ correct: r.correct + (first?.correct ?? 0), total: r.total + (first?.total ?? 0) })}
    />
  );
}

export function ListeningPage() {
  const state = useAppState();
  const day = state.progress.day;
  const pack = packByDay.get(day);
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<Mode | { kind: "today" }>(null);
  const open = (part: "2" | "3" | "4") => listeningUnlocked(day, part);
  // Deep links from the daily plan: /listening?today=1 or /listening?part=2|3|4 (only parts already reached).
  useEffect(() => {
    const part = params.get("part");
    if (params.get("today") && pack) setMode({ kind: "today" });
    else if (part === "2" && open("2")) setMode({ kind: "p2", items: shuffle(part2Items).slice(0, PART2_COUNT) });
    else if (part === "3" && open("3")) setMode({ kind: "sets", part: "3", sets: shuffle(part3Sets).slice(0, SETS_PER_SESSION) });
    else if (part === "4" && open("4")) setMode({ kind: "sets", part: "4", sets: shuffle(part4Sets).slice(0, SETS_PER_SESSION) });
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [rate, setRate] = useState(0.95);
  const [result, setResult] = useState<Result | null>(null);
  const counts = useMemo(() => ({ p2: part2Items.length, p3: part3Sets.length, p4: part4Sets.length }), []);

  const leave = () => {
    setMode(null);
    setParams({}, { replace: true });
  };
  const finish = (r: Result) => {
    leave();
    setResult(r);
    update((s) => markMissionDone(s, localDateKey(new Date()), "listening"));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Luyện nghe</h1>
      <p className="mt-1 text-sm text-slate-500">Bài nghe mỗi ngày dùng lại từ vựng của ngày đó. Nghe sai cũng không sao, câu sai tự vào Sổ lỗi để phục thù sau.</p>

      {!canSpeech && (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Trình duyệt này không hỗ trợ đọc văn bản thành giọng nói. Hãy dùng Chrome, Edge hoặc Safari bản mới.
        </p>
      )}

      {mode !== null && <StartLine />}
      {mode?.kind === "today" && (
        <div className="mt-5"><TodaySession day={day} rate={rate} onDone={finish} onExit={leave} /></div>
      )}
      {mode?.kind === "p2" && (
        <div className="mt-5"><Part2Session items={mode.items} rate={rate} onDone={finish} onExit={leave} /></div>
      )}
      {mode?.kind === "sets" && (
        <div className="mt-5"><SetSession part={mode.part} sets={mode.sets} rate={rate} onDone={finish} onExit={leave} /></div>
      )}

      {mode === null && (
        <>
          {result && (
            <SessionResult correct={result.correct} total={result.total} note={`Nhiệm vụ "Nghe" của Ngày ${day} đã được đánh dấu. Câu sai đã vào Sổ lỗi.`} />
          )}

          {pack && (
            <section className="card mt-5 border-brand-200 bg-brand-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Bài nghe hôm nay · Ngày {day}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{pack.theme}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {pack.part2.length} câu Part 2{pack.talk ? ` + 1 ${pack.talk.part === "3" ? "hội thoại Part 3" : "bài nói Part 4"}` : ""}, dùng từ vựng của hôm nay.
              </p>
              <button
                onClick={() => {
                  setResult(null);
                  setMode({ kind: "today" });
                }}
                className="btn-primary mt-4"
              >
                Vào nghe bài hôm nay
              </button>
            </section>
          )}

          <div className="card mt-5 flex flex-wrap items-center gap-3 p-4">
            <span className="text-sm font-medium text-slate-700">Tốc độ đọc:</span>
            {SPEEDS.map((sp) => (
              <button
                key={sp.rate}
                onClick={() => setRate(sp.rate)}
                className={`rounded-lg px-3 py-1.5 text-sm ${rate === sp.rate ? "bg-brand-100 font-semibold text-brand-800" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold text-slate-500">Luyện thêm (các phần đã học tới)</h2>
          <section className="mt-3 grid gap-4 sm:grid-cols-3" aria-label="Chọn phần luyện">
            <ModeCard
              icon="💬"
              tone="bg-p-blue"
              title="Part 2 · Hỏi – đáp"
              desc={`Nghe một câu hỏi và 3 câu trả lời, không có chữ. ${PART2_COUNT} câu mỗi lượt (ngân hàng ${counts.p2} câu).`}
              action="Bắt đầu"
              lockedUntil={open("2") ? null : firstListeningDay("2")}
              onClick={() => {
                setResult(null);
                setMode({ kind: "p2", items: shuffle(part2Items).slice(0, PART2_COUNT) });
              }}
            />
            <ModeCard
              icon="👥"
              tone="bg-p-mint"
              title="Part 3 · Hội thoại"
              desc={`Hội thoại 2–3 người, mỗi đoạn 3 câu hỏi in sẵn. ${SETS_PER_SESSION} đoạn mỗi lượt (có ${counts.p3} đoạn).`}
              action="Bắt đầu"
              lockedUntil={open("3") ? null : firstListeningDay("3")}
              onClick={() => {
                setResult(null);
                setMode({ kind: "sets", part: "3", sets: shuffle(part3Sets).slice(0, SETS_PER_SESSION) });
              }}
            />
            <ModeCard
              icon="📢"
              tone="bg-p-cream"
              title="Part 4 · Bài nói"
              desc={`Thông báo, tin nhắn, quảng cáo… mỗi bài 3 câu hỏi. ${SETS_PER_SESSION} bài mỗi lượt (có ${counts.p4} bài).`}
              action="Bắt đầu"
              lockedUntil={open("4") ? null : firstListeningDay("4")}
              onClick={() => {
                setResult(null);
                setMode({ kind: "sets", part: "4", sets: shuffle(part4Sets).slice(0, SETS_PER_SESSION) });
              }}
            />
          </section>
          <p className="mt-3 text-xs text-slate-500">
            Giọng đọc lấy từ trình duyệt nên khác nhau giữa các máy. Edge trên Windows có nhiều giọng tự nhiên nhất.
          </p>
        </>
      )}
    </div>
  );
}
