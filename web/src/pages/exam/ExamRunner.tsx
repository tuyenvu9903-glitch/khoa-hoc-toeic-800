import { useEffect, useRef, useState } from "react";
import { answerWindowSeconds, type ExamGroup, type ExamPaper, type ExamQuestion, type ExamSection } from "../../domain/exam";
import { playAudioOrScript, voicesReady } from "../../lib/speech";

const LETTERS = ["A", "B", "C", "D"] as const;
const fmt = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

type Answers = Record<string, number>;

const PART_TITLE: Record<string, string> = {
  "1": "Part 1 · Photographs",
  "2": "Part 2 · Question–Response",
  "3": "Part 3 · Conversations",
  "4": "Part 4 · Talks",
  "5": "Part 5 · Incomplete Sentences",
  "6": "Part 6 · Text Completion",
  "7": "Part 7 · Reading Comprehension",
};

function Choice({
  letter,
  text,
  chosen,
  onPick,
}: {
  letter: string;
  text?: string;
  chosen: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={chosen}
      className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
        chosen ? "border-brand-600 bg-brand-50 font-medium" : "border-slate-200 bg-white hover:border-brand-300"
      }`}
    >
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${chosen ? "border-brand-600 bg-brand-700 text-white" : "border-slate-300 text-slate-500"}`}>
        {letter}
      </span>
      {text && <span className="pt-0.5">{text}</span>}
    </button>
  );
}

function QuestionBlock({
  q,
  answer,
  onAnswer,
  flagged,
  onFlag,
  showOptionText,
}: {
  q: ExamQuestion;
  answer: number | undefined;
  onAnswer: (i: number) => void;
  flagged?: boolean;
  onFlag?: () => void;
  showOptionText: boolean;
}) {
  return (
    <div id={`q-${q.number}`} className="scroll-mt-24">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-slate-900">
          {q.number}. {q.question ?? "Mark your answer on your answer sheet."}
        </p>
        {onFlag && (
          <button type="button" onClick={onFlag} className={`shrink-0 rounded px-2 py-0.5 text-xs ${flagged ? "bg-amber-100 text-amber-800" : "text-slate-400 hover:bg-slate-100"}`}>
            {flagged ? "🚩 Đã đánh dấu" : "🏳 Đánh dấu"}
          </button>
        )}
      </div>
      <div className={`mt-2 grid gap-2 ${showOptionText ? "sm:grid-cols-2" : "grid-cols-3 sm:grid-cols-4"}`}>
        {q.options.map((o, i) => (
          <Choice key={i} letter={LETTERS[i]!} text={showOptionText ? o : undefined} chosen={answer === i} onPick={() => onAnswer(i)} />
        ))}
      </div>
    </div>
  );
}

function AnswerSheet({
  section,
  answers,
  flags,
  current,
  onJump,
}: {
  section: ExamSection;
  answers: Answers;
  flags: Set<string>;
  current: number;
  onJump?: (groupIndex: number) => void;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phiếu trả lời</p>
      <div className="mt-3 grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
        {section.groups.flatMap((g, gi) =>
          g.questions.map((q) => {
            const done = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                type="button"
                disabled={!onJump}
                onClick={() => onJump?.(gi)}
                title={done ? `Câu ${q.number}: ${LETTERS[answers[q.id]!]}` : `Câu ${q.number}: chưa trả lời`}
                className={`relative h-8 rounded text-xs font-semibold transition disabled:cursor-default ${
                  done ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500"
                } ${gi === current ? "ring-2 ring-brand-400 ring-offset-1" : ""}`}
              >
                {q.number}
                {flags.has(q.id) && <span className="absolute -right-1 -top-1 text-[10px]" aria-label="đã đánh dấu">🚩</span>}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

function ListeningGroupView({ group, answers, onAnswer }: { group: ExamGroup; answers: Answers; onAnswer: (id: string, i: number) => void }) {
  const printed = group.part === "3" || group.part === "4";
  return (
    <div className="space-y-5">
      {group.questions.map((q) => (
        <QuestionBlock key={q.id} q={q} answer={answers[q.id]} onAnswer={(i) => onAnswer(q.id, i)} showOptionText={printed} />
      ))}
    </div>
  );
}

/** Listening runs by itself: each group plays once, then a short answer window, then the next one. */
function ListeningSection({ section, answers, onAnswer, onDone }: { section: ExamSection; answers: Answers; onAnswer: (id: string, i: number) => void; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<"audio" | "answer">("audio");
  const [left, setLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const group = section.groups[index]!;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setStage("audio");
    let stop = () => {};
    let cancelled = false;
    void voicesReady().then(() => {
      if (cancelled) return;
      stop = playAudioOrScript(group.audioSrc, group.script ?? [], {
        rate: 1,
        onEnd: () => {
          setLeft(answerWindowSeconds(group));
          setStage("answer");
        },
      });
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [group]);

  useEffect(() => {
    if (stage !== "answer") return;
    if (left <= 0) {
      if (index + 1 >= section.groups.length) doneRef.current();
      else setIndex(index + 1);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, left, index, section.groups.length]);

  const first = group.questions[0]!.number;
  const last = group.questions.at(-1)!.number;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Listening · {PART_TITLE[group.part]} · Câu {first}
            {last !== first ? `–${last}` : ""}
          </p>
          <p className={`rounded-full px-3 py-1 text-xs font-semibold ${stage === "audio" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"}`} aria-live="polite">
            {stage === "audio" ? "🔊 Đang phát…" : `⏳ Trả lời: ${left}s`}
          </p>
        </div>
        <p className="mt-1 text-xs text-slate-400">Chế độ thi: mỗi đoạn chỉ phát một lần, không tạm dừng, không nghe lại. Đã làm {fmt(elapsed)}.</p>
        <div className="mt-5">
          <ListeningGroupView group={group} answers={answers} onAnswer={onAnswer} />
        </div>
      </div>
      <AnswerSheet section={section} answers={answers} flags={new Set()} current={index} />
    </div>
  );
}

/** Reading: free navigation with a countdown; time out submits the section. */
function ReadingSection({ section, answers, onAnswer, onDone }: { section: ExamSection; answers: Answers; onAnswer: (id: string, i: number) => void; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(section.minutes * 60);
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const group = section.groups[index]!;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 0) doneRef.current();
  }, [left]);

  const all = section.groups.flatMap((g) => g.questions);
  const unanswered = all.filter((q) => answers[q.id] === undefined).length;
  const toggleFlag = (id: string) =>
    setFlags((f) => {
      const n = new Set(f);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-4">
        <div className="card flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reading · {PART_TITLE[group.part]}</p>
          <p className={`font-mono text-lg font-bold ${left < 300 ? "text-rose-600" : "text-slate-800"}`} aria-live="off">⏱ {fmt(left)}</p>
        </div>
        <div className={group.passages ? "grid gap-4 xl:grid-cols-2" : ""}>
          {group.passages && (
            <div className="space-y-4">
              {group.passages.map((p, i) => (
                <article key={i} className="card max-h-[70vh] overflow-y-auto p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{p.title}</p>
                  <div className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">{p.text}</div>
                </article>
              ))}
            </div>
          )}
          <div className="card space-y-5 p-5">
            {group.questions.map((q) => (
              <QuestionBlock
                key={q.id}
                q={q}
                answer={answers[q.id]}
                onAnswer={(i) => onAnswer(q.id, i)}
                flagged={flags.has(q.id)}
                onFlag={() => toggleFlag(q.id)}
                showOptionText
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className="btn-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Trước</button>
          <span className="text-sm text-slate-500">Nhóm {index + 1}/{section.groups.length}</span>
          {index + 1 < section.groups.length ? (
            <button type="button" className="btn-primary" onClick={() => setIndex(index + 1)}>Tiếp →</button>
          ) : (
            <button type="button" className="btn-primary" onClick={() => setConfirming(true)}>Nộp bài</button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <AnswerSheet section={section} answers={answers} flags={flags} current={index} onJump={setIndex} />
        <button type="button" className="btn-ghost w-full" onClick={() => setConfirming(true)}>Nộp bài</button>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
          <div className="card max-w-sm p-6 text-center">
            <h2 id="submit-title" className="text-lg font-bold">Nộp phần Đọc?</h2>
            <p className="mt-2 text-sm text-slate-600">
              {unanswered > 0 ? `Còn ${unanswered} câu chưa trả lời. TOEIC không trừ điểm câu sai, nên hãy chọn một đáp án cho mọi câu.` : "Bạn đã trả lời tất cả các câu."}
              {flags.size > 0 ? ` Có ${flags.size} câu đang đánh dấu.` : ""}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>Làm tiếp</button>
              <button type="button" className="btn-primary" onClick={() => doneRef.current()}>Nộp bài</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Runs a paper section by section; explanations only come after submission (see ExamReview). */
export function ExamRunner({ paper, onFinish, onQuit }: { paper: ExamPaper; onFinish: (answers: Answers) => void; onQuit: () => void }) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const section = paper.sections[sectionIndex]!;
  const count = section.groups.reduce((n, g) => n + g.questions.length, 0);

  const answer = (id: string, i: number) => setAnswers((a) => ({ ...a, [id]: i }));
  // Sections end from timers and audio callbacks, so read the latest answers through a ref.
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const endSection = () => {
    if (sectionIndex + 1 >= paper.sections.length) onFinish(answersRef.current);
    else {
      setSectionIndex(sectionIndex + 1);
      setStarted(false);
    }
  };

  if (!started) {
    return (
      <div className="card mx-auto max-w-xl p-6 text-center">
        <p className="text-4xl" aria-hidden>{section.kind === "listening" ? "🎧" : "📖"}</p>
        <h2 className="mt-2 text-xl font-bold">{section.kind === "listening" ? "Phần Nghe (Listening)" : "Phần Đọc (Reading)"}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {count} câu ·{" "}
          {section.kind === "listening"
            ? "khoảng " + section.minutes + " phút. Bài nghe tự chạy, mỗi đoạn chỉ phát một lần, không tạm dừng."
            : section.minutes + " phút. Hết giờ bài tự nộp. Có thể chuyển qua lại giữa các câu và đánh dấu câu cần xem lại."}
        </p>
        <p className="mt-2 text-xs text-slate-500">Giải thích chỉ hiện sau khi nộp bài.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" className="btn-ghost" onClick={onQuit}>Thoát</button>
          <button type="button" className="btn-primary" onClick={() => setStarted(true)}>Bắt đầu</button>
        </div>
      </div>
    );
  }

  return section.kind === "listening" ? (
    <ListeningSection key={sectionIndex} section={section} answers={answers} onAnswer={answer} onDone={endSection} />
  ) : (
    <ReadingSection key={sectionIndex} section={section} answers={answers} onAnswer={answer} onDone={endSection} />
  );
}
