import { useMemo, useState } from "react";
import { Stat } from "../components/ui";
import { TOPIC_LABEL, vocabulary, type VocabTopic, type VocabWord } from "../data/vocabulary";
import { isDue, isMature } from "../domain/srs";
import { buildVocabSession, nextNewWords, vocabCounts } from "../domain/vocabSession";
import { useAppState } from "../lib/store";
import { FlashSession } from "./vocab/FlashSession";
import { LearnSession } from "./vocab/LearnSession";
import { TypingGame } from "./vocab/TypingGame";
import { ShooterGame } from "./vocab/ShooterGame";

const LEARN_BATCH = 8;

type Mode =
  | { kind: "flash"; ids: string[] }
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

export function VocabPage() {
  const state = useAppState();
  const [mode, setMode] = useState<Mode>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<VocabTopic | "all">("all");
  const now = new Date();
  const counts = vocabCounts(state.srs, vocabulary, now);
  const flashIds = useMemo(() => buildVocabSession(state.srs, vocabulary, new Date()), [state.srs]);
  const learnIds = useMemo(
    () =>
      nextNewWords(state.srs, vocabulary)
        .slice(0, Math.min(LEARN_BATCH, counts.newAvailable))
        .map((w) => w.id),
    [state.srs, counts.newAvailable],
  );

  const q = query.trim().toLowerCase();
  const list = vocabulary.filter(
    (w) =>
      (topic === "all" || w.topic === topic) &&
      (q === "" || w.word.toLowerCase().includes(q) || w.meaningVi.toLowerCase().includes(q)),
  );
  const exit = () => setMode(null);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Luyện từ vựng</h1>
      <p className="mt-1 text-sm text-slate-500">127 từ TOEIC theo chủ đề, ôn lại đúng lúc theo lịch lặp lại ngắt quãng.</p>

      {mode?.kind === "flash" && <div className="mt-5"><FlashSession initial={mode.ids} onExit={exit} /></div>}
      {mode?.kind === "learn" && <div className="mt-5"><LearnSession ids={mode.ids} onExit={exit} /></div>}
      {mode?.kind === "typing" && <div className="mt-5"><TypingGame onExit={exit} /></div>}
      {mode?.kind === "shooter" && <div className="mt-5"><ShooterGame onExit={exit} /></div>}

      {mode === null && (
        <>
          <section className="card mt-5 p-6">
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Đến hạn ôn" value={counts.due} icon="⏰" tone="bg-amber-100" />
              <Stat label="Từ mới hôm nay" value={counts.newAvailable} icon="✨" tone="bg-violet-100" />
              <Stat label="Đã học" value={counts.learned} hint={`/${counts.total}`} icon="📚" tone="bg-brand-100" />
              <Stat label="Thuộc lâu" value={counts.mature} icon="🏅" tone="bg-emerald-100" />
            </dl>
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Chế độ luyện">
            <ModeCard
              icon="🧠"
              tone="bg-violet-100"
              title="Học từ mới"
              desc="Trắc nghiệm hai chiều rồi gõ lại từ, như chế độ Learn của Quizlet. Mỗi lượt tối đa 8 từ."
              action={learnIds.length > 0 ? `Học ${learnIds.length} từ mới` : "Hết từ mới hôm nay"}
              disabled={learnIds.length === 0}
              onClick={() => setMode({ kind: "learn", ids: learnIds })}
            />
            <ModeCard
              icon="🃏"
              tone="bg-sky-100"
              title="Thẻ ghi nhớ"
              desc="Lật thẻ, tự chấm 4 mức. Từ đến hạn được ôn trước theo lịch lặp lại ngắt quãng."
              action={flashIds.length > 0 ? `Ôn ${flashIds.length} thẻ` : "Hôm nay đã xong"}
              disabled={flashIds.length === 0}
              onClick={() => setMode({ kind: "flash", ids: flashIds })}
            />
            <ModeCard
              icon="⌨️"
              tone="bg-amber-100"
              title="Gõ từ bắn gà"
              desc={`Gà rơi xuống mang nghĩa tiếng Việt, gõ đúng từ tiếng Anh là tàu bay bắn.${state.typingBest !== null ? ` Kỷ lục ${state.typingBest} điểm.` : ""}`}
              action="Chơi"
              onClick={() => setMode({ kind: "typing" })}
            />
            <ModeCard
              icon="🐔"
              tone="bg-rose-100"
              title="Bắn gà"
              desc={`Điều khiển tàu bay, bắn con gà mang nghĩa đúng trước khi đàn gà đáp xuống. Né trứng!${state.shooterBest !== null ? ` Kỷ lục ${state.shooterBest} điểm.` : ""}`}
              action="Bắn gà"
              onClick={() => setMode({ kind: "shooter" })}
            />
          </section>
          <p className="mt-3 text-xs text-slate-500">
            Tối đa 15 từ mới mỗi ngày. Học xong một từ ở chế độ Học hoặc Thẻ ghi nhớ sẽ được xếp lịch ôn lại, và nhiệm vụ "Từ vựng" trên Dashboard tự được đánh dấu.
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
