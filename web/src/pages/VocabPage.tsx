import { useEffect, useMemo, useState } from "react";
import { CoachBubble } from "../components/Mascot";
import { useCopy } from "../voice/useVoice";
import { useSearchParams } from "react-router-dom";
import { Stat } from "../components/ui";
import { TOPIC_LABEL, VOCAB_GROUPS, vocabulary, type VocabTopic, type VocabWord } from "../data/vocabulary";
import { isDue, isMature } from "../domain/srs";
import { packByDay } from "../data/dayPacks";
import { DAY_TEST_PASS, dayTestPassed, unlockedWords, VOCAB_TEST, wordsForDay } from "../domain/progress";
import { vocabCounts } from "../domain/vocabSession";
import { useAppState } from "../lib/store";
import { DayTestSession } from "./vocab/DayTestSession";
import { LearnSession } from "./vocab/LearnSession";
import { TypingGame } from "./vocab/TypingGame";
import { ShooterGame } from "./vocab/ShooterGame";

const LEARN_BATCH = 8;

type Mode =
  | { kind: "test"; day: number }
  | { kind: "learn"; ids: string[] }
  | { kind: "typing" }
  | { kind: "shooter" }
  | null;

function statusOf(word: VocabWord, state: ReturnType<typeof useAppState>, now: Date) {
  const c = state.srs[word.id];
  if (!c) return { label: "Chưa học", style: "bg-slate-100 text-slate-500" };
  if (isDue(c, now)) return { label: "Đến hạn", style: "bg-amber-100 text-amber-800" };
  if (isMature(c)) return { label: "Thuộc lâu", style: "bg-emerald-100 text-emerald-800" };
  return { label: "Đang học", style: "bg-brand-100 text-brand-700" };
}

function ModeCard(props: {
  icon: string;
  tone: string;
  title: string;
  desc: string;
  action: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="card flex flex-col p-5 transition hover:-translate-y-0.5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow-sm ${props.tone}`} aria-hidden>
        {props.icon}
      </span>
      <h3 className="mt-3 text-lg font-bold">{props.title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{props.desc}</p>
      <button disabled={props.disabled} onClick={props.onClick} className="btn-primary mt-4">
        {props.action}
      </button>
    </div>
  );
}

/** Replaces the flashcards: one test per day reached; a pass is what makes the day's vocabulary count. */
function DayTestCard({ onStart }: { onStart: (day: number) => void }) {
  const state = useAppState();
  const days = Array.from({ length: state.progress.day }, (_, i) => state.progress.day - i);
  return (
    <div className="card flex flex-col p-5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-p-blue text-2xl shadow-sm" aria-hidden>📝</span>
      <h3 className="mt-3 text-lg font-bold">Bài test theo ngày</h3>
      <p className="mt-1 text-sm text-slate-500">
        Kiểm tra toàn bộ từ của từng ngày. Đúng từ {DAY_TEST_PASS}% trở lên mới tính là xong phần từ vựng của ngày đó.
      </p>
      <ul className="mt-3 max-h-56 flex-1 space-y-2 overflow-y-auto pr-1">
        {days.map((d) => {
          const words = wordsForDay(d);
          const learned = words.filter((w) => state.srs[w.id]).length;
          const best = state.dayTests[String(d)];
          const passed = (state.progress.done[String(d)] ?? []).includes(VOCAB_TEST);
          const legacy = !passed && best === undefined && dayTestPassed(state.progress, d);
          const chip = passed
            ? { text: `Đạt ${best ?? ""}${best !== undefined ? "%" : ""}`.trim(), style: "bg-emerald-100 text-emerald-800" }
            : best !== undefined
              ? { text: `Chưa đạt · ${best}%`, style: "bg-rose-100 text-rose-800" }
              : legacy
                ? { text: "Chưa làm", style: "bg-slate-100 text-slate-500" }
                : { text: "Chưa làm", style: "bg-amber-100 text-amber-800" };
          return (
            <li key={d} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <span className="font-semibold">Ngày {d}</span>
              <span className="text-xs text-slate-500">{learned}/{words.length} từ</span>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${chip.style}`}>{chip.text}</span>
              <button
                type="button"
                onClick={() => onStart(d)}
                disabled={words.length === 0}
                className={passed ? "btn-ghost !px-3 !py-1 text-xs" : "btn-primary !px-3 !py-1 text-xs"}
              >
                {passed ? "Làm lại" : "Làm bài"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function VocabPage() {
  const state = useAppState();
  const [mode, setMode] = useState<Mode>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<VocabTopic | "all">("all");
  const now = new Date();
  const day = state.progress.day;
  // Only words of days already reached are open; earlier days' leftovers come first.
  const open = useMemo(() => unlockedWords(day), [day]);
  const today = wordsForDay(day);
  const learnedToday = today.filter((w) => state.srs[w.id]).length;
  const pack = packByDay.get(day);
  const counts = vocabCounts(state.srs, open, now, Infinity);
  const learnIds = useMemo(
    () => open.filter((w) => !state.srs[w.id]).slice(0, LEARN_BATCH).map((w) => w.id),
    [state.srs, open],
  );

  const q = query.trim().toLowerCase();
  const list = open.filter(
    (w) =>
      (topic === "all" || w.topic === topic) &&
      (q === "" || w.word.toLowerCase().includes(q) || w.meaningVi.toLowerCase().includes(q)),
  );
  const [params, setParams] = useSearchParams();
  // /vocab?start=learn (from the daily journey): go straight into today's new words, then today's test.
  useEffect(() => {
    if (params.get("start") !== "learn") return;
    if (learnIds.length > 0) setMode({ kind: "learn", ids: learnIds });
    else if (!dayTestPassed(state.progress, day)) setMode({ kind: "test", day });
    setParams({}, { replace: true });
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const exit = () => setMode(null);
  const t = useCopy();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Luyện từ vựng</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ngày {day}{pack ? ` · ${pack.theme}` : ""}: đã học <strong className="text-slate-800">{learnedToday}/{today.length}</strong> từ mới của hôm nay.
        Từ của các ngày sau sẽ mở khi bạn tới ngày đó.
      </p>
      {mode === null && (
        <CoachBubble
          mood={counts.due > 0 ? "confused" : "happy"}
          text={counts.due > 0 ? t("dueWords", { n: counts.due }) : t("noDueWords", { n: counts.learned })}
          size={48}
          className="mt-4"
        />
      )}

      {mode?.kind === "test" && <div className="mt-5"><DayTestSession key={mode.day} day={mode.day} onExit={exit} /></div>}
      {mode?.kind === "learn" && <div className="mt-5"><LearnSession ids={mode.ids} onExit={exit} /></div>}
      {mode?.kind === "typing" && <div className="mt-5"><TypingGame onExit={exit} /></div>}
      {mode?.kind === "shooter" && <div className="mt-5"><ShooterGame onExit={exit} /></div>}

      {mode === null && (
        <>
          <section className="card mt-5 p-6">
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Đến hạn ôn" value={counts.due} icon="⏰" tone="bg-p-cream" />
              <Stat label="Từ mới hôm nay" value={counts.newAvailable} icon="✨" tone="bg-p-purple" />
              <Stat label="Đã học" value={counts.learned} hint={`/${counts.total}`} icon="📚" tone="bg-brand-100" />
              <Stat label="Thuộc lâu" value={counts.mature} icon="🏅" tone="bg-p-mint" />
            </dl>
          </section>

          <details className="card mt-5 p-5">
            <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold">🎯 Mục tiêu 2.000 từ cho 750–800 điểm</span>
              <span className="text-sm text-slate-500">
                Đã học {counts.learned} · Có trong app {vocabulary.length}/2.000 ▾
              </span>
            </summary>
            <ul className="mt-4 space-y-3 text-sm">
              {VOCAB_GROUPS.map((g) => {
                const words = vocabulary.filter((w) => g.topics.includes(w.topic));
                const learned = words.filter((w) => state.srs[w.id]).length;
                return (
                  <li key={g.name}>
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-slate-800">{g.name}</span>
                      <span className="text-slate-500">
                        <strong className="text-slate-800">{learned}</strong> đã học · {words.length}/{g.target} từ
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                      <div className="h-full bg-brand-200" style={{ width: `${Math.min(100, (words.length / g.target) * 100)}%` }}>
                        <div className="h-full bg-brand-600" style={{ width: `${words.length ? (learned / words.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Thanh đậm: số từ đã học. Thanh nhạt: số từ đã có trong app. Kho từ đang được bổ sung dần cho đủ mục tiêu từng nhóm.
            </p>
          </details>

          <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Chế độ luyện">
            <ModeCard
              icon="🧠"
              tone="bg-p-purple"
              title="Học từ mới"
              desc="Trắc nghiệm hai chiều rồi gõ lại từ, như chế độ Learn của Quizlet. Mỗi lượt tối đa 8 từ."
              action={learnIds.length > 0 ? `Học ${learnIds.length} từ mới` : "Hết từ mới hôm nay"}
              disabled={learnIds.length === 0}
              onClick={() => setMode({ kind: "learn", ids: learnIds })}
            />
            <DayTestCard onStart={(d) => setMode({ kind: "test", day: d })} />
            <ModeCard
              icon="⌨️"
              tone="bg-p-cream"
              title="Gõ phím diệt gà"
              desc={`Gà rơi từ trời xuống, trên lưng là nghĩa tiếng Việt. Gõ đúng từ tiếng Anh là tàu bắn rụng, gõ sai thì gà cười vào mặt.${state.typingBest !== null ? ` Kỷ lục ${state.typingBest} điểm.` : ""}`}
              action="Gõ cho gà sợ"
              onClick={() => setMode({ kind: "typing" })}
            />
            <ModeCard
              icon="🐔"
              tone="bg-p-coral"
              title="Gà bay, não chạy"
              desc={`Lái tàu bắn đúng con gà mang nghĩa chuẩn trước khi cả đàn hạ cánh. Né trứng, trứng gà không phải đồ ăn sáng đâu!${state.shooterBest !== null ? ` Kỷ lục ${state.shooterBest} điểm.` : ""}`}
              action="Lên nòng"
              onClick={() => setMode({ kind: "shooter" })}
            />
          </section>
          <p className="mt-3 text-xs text-slate-500">
            Mỗi ngày có một nhóm từ mới theo chủ đề của ngày (khoảng 36 từ khi kho đủ 2.000 từ). Học hết từ của hôm nay rồi làm bài test của ngày: đúng từ {DAY_TEST_PASS}% trở lên thì nhiệm vụ "Từ vựng" mới được tính. Từ đã học được xếp lịch ôn lại tự động.
          </p>

          <section className="mt-6">
            <div className="flex flex-wrap gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm từ hoặc nghĩa…"
                aria-label="Tìm từ"
                className="field min-w-0 flex-1"
              />
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as VocabTopic | "all")}
                aria-label="Chủ đề"
                className="field !w-auto"
              >
                <option value="all">Tất cả chủ đề</option>
                {Object.entries(TOPIC_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <ul className="card mt-3 divide-y divide-slate-100 overflow-hidden">
              {list.map((w) => {
                const st = statusOf(w, state, now);
                return (
                  <li key={w.id} className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-brand-50/60">
                    <span className="w-36 shrink-0 font-semibold">{w.word} <span className="text-xs font-normal text-slate-400">{w.pos}</span></span>
                    <span className="min-w-0 flex-1 truncate text-slate-600">{w.meaningVi}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.style}`}>{st.label}</span>
                  </li>
                );
              })}
              {list.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">Không tìm thấy từ nào.</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
