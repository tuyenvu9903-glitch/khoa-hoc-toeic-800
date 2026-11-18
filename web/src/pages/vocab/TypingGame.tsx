import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { vocabById } from "../../data/vocabulary";
import { CHICKEN_H, gradeForOutcome, H, pickShooterWords, ROUNDS, START_LIVES, W, type RoundOutcome } from "../../domain/shooter";
import {
  createTypingGame,
  LAND_Y,
  prefixTargets,
  shouldAutoFire,
  stepTyping,
  submitWord,
  type TypingGame as Game,
} from "../../domain/typing";
import { gradeVocab, localDateKey, markMissionDone, recordTypingScore } from "../../lib/state";
import { update, useAppState } from "../../lib/store";
import { unlockedWords } from "../../domain/progress";
import { drawBackdrop, drawBullet, drawChicken, drawDangerLine, drawFx, drawShip, makeStars, type Star } from "./canvasArt";
import { speak } from "./shared";

type Status = "ready" | "playing" | "paused" | "done";
type Hud = { done: number; total: number; lives: number; score: number; combo: number };
type Summary = {
  won: boolean;
  score: number;
  record: boolean;
  accuracy: number;
  maxCombo: number;
  scheduled: number;
  rows: { wordId: string; outcome: RoundOutcome }[];
};
type Feedback = { text: string; tone: "ok" | "warn" | "bad" } | null;

const OUTCOME_UI: Record<RoundOutcome, { icon: string; label: string; style: string }> = {
  perfect: { icon: "✓", label: "Gõ đúng", style: "bg-emerald-100 text-emerald-800" },
  ok: { icon: "~", label: "Đúng sau gợi ý", style: "bg-amber-100 text-amber-800" },
  missed: { icon: "✗", label: "Để gà đáp xuống", style: "bg-rose-100 text-rose-800" },
};

function draw(canvas: HTMLCanvasElement, g: Game | null, stars: Star[], typed: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const scale = canvas.width / W;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const time = g?.time ?? 0;
  drawBackdrop(ctx, time, stars);
  if (!g) return;

  drawDangerLine(ctx, LAND_Y + CHICKEN_H / 2);
  const lit = prefixTargets(g, typed);
  for (const e of g.enemies) {
    drawChicken(ctx, { ...e, sub: e.state === "wrong" ? e.answer : e.hint, highlight: lit.has(e.id) }, time);
  }
  for (const s of g.shots) drawBullet(ctx, s.x, s.y);
  drawShip(ctx, g.ship.x, time, false);
  drawFx(ctx, g.fx);
}

const hudOf = (g: Game): Hud => ({
  done: g.results.length,
  total: g.targets.length,
  lives: g.lives,
  score: g.score,
  combo: g.combo,
});
const sameHud = (a: Hud | null, b: Hud) =>
  a !== null && a.done === b.done && a.lives === b.lives && a.score === b.score && a.combo === b.combo;

/** "Gõ từ": type the English word for a falling chicken's Vietnamese meaning and the ship shoots it. */
export function TypingGame({ onExit }: { onExit: () => void }) {
  const state = useAppState();
  const [status, setStatus] = useState<Status>("ready");
  const [hud, setHud] = useState<Hud | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shake, setShake] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameRef = useRef<Game | null>(null);
  const typedRef = useRef("");
  const scheduledRef = useRef<Set<string>>(new Set());
  const gradedRef = useRef(0);
  const stars = useMemo(makeStars, []);
  typedRef.current = typed;

  const start = useCallback(() => {
    const picks = pickShooterWords(state.srs, unlockedWords(state.progress.day), new Date());
    scheduledRef.current = new Set(picks.filter((p) => p.scheduled).map((p) => p.word.id));
    const g = createTypingGame(picks.map((p) => p.word));
    gameRef.current = g;
    gradedRef.current = 0;
    setTyped("");
    setFeedback(null);
    setHud(hudOf(g));
    setSummary(null);
    setStatus("playing");
  }, [state.srs]);

  // Keep the cursor in the answer box while playing: on start/resume, after a wrong answer
  // (the box is re-created to replay the shake), and whenever a key is pressed elsewhere on the page.
  useEffect(() => {
    if (status === "playing") inputRef.current?.focus();
  }, [status, shake]);
  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input || document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") input.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [status]);

  // Crisp canvas on high-DPI screens; also paints the idle backdrop.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    draw(c, gameRef.current, stars, typedRef.current);
  }, [status, stars]);

  // Game loop.
  useEffect(() => {
    if (status !== "playing") return;
    let raf = 0;
    let last = performance.now();
    let shownHud: Hud | null = null;

    const finish = (g: Game) => {
      const now = new Date();
      const won = g.phase === "won";
      const hits = g.results.filter((r) => r.outcome !== "missed").length;
      const accuracy = g.submits === 0 ? 0 : Math.round((hits / g.submits) * 100);
      const rec = recordTypingScore(state, g.score);
      update((s) => {
        let n = recordTypingScore(s, g.score).state;
        if (won) n = markMissionDone(n, localDateKey(now), "vocab");
        return n;
      });
      setSummary({
        won,
        score: g.score,
        record: rec.record,
        accuracy,
        maxCombo: g.maxCombo,
        scheduled: g.results.filter((r) => scheduledRef.current.has(r.wordId)).length,
        rows: g.results,
      });
      setHud(hudOf(g));
      setStatus("done");
    };

    const tick = (now: number) => {
      const g = gameRef.current;
      const canvas = canvasRef.current;
      if (!g || !canvas) return;
      const dt = (now - last) / 1000;
      last = now;
      stepTyping(g, dt);

      while (gradedRef.current < g.results.length) {
        const r = g.results[gradedRef.current++]!;
        // Say the word out loud when it is shot or lands, so spelling and sound stick together.
        const word = vocabById.get(r.wordId);
        if (word) speak(word.word);
        if (scheduledRef.current.has(r.wordId)) {
          update((s) => gradeVocab(s, r.wordId, gradeForOutcome(r.outcome), new Date()));
        }
      }

      draw(canvas, g, stars, typedRef.current);
      const h = hudOf(g);
      if (!sameHud(shownHud, h)) {
        shownHud = h;
        setHud(h);
      }
      if (g.phase !== "playing") {
        finish(g);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onHidden = () => {
      if (document.hidden) setStatus("paused");
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onHidden);
    };
    // `state` is read once at the end of a game for the best-score check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stars]);

  const fire = (text: string) => {
    const g = gameRef.current;
    if (!g) return;
    const r = submitWord(g, text);
    if (r === "empty") return;
    if (r === "hit") {
      setTyped("");
      setFeedback(null);
    } else if (r === "close") {
      setFeedback({ text: "Gần đúng rồi, kiểm tra lại chính tả.", tone: "warn" });
    } else {
      setFeedback({ text: `Không có con gà nào mang từ "${text.trim()}".`, tone: "bad" });
      setTyped("");
      setShake((n) => n + 1);
    }
  };

  const onChange = (value: string) => {
    setTyped(value);
    if (feedback?.tone === "warn") setFeedback(null);
    const g = gameRef.current;
    if (g && status === "playing" && shouldAutoFire(g, value)) fire(value);
  };

  if (status === "done" && summary) {
    return (
      <div className="card p-6 sm:p-8">
        <p className="text-center text-5xl" aria-hidden>{summary.won ? "🏆" : "💥"}</p>
        <h2 className="mt-2 text-center text-2xl font-extrabold">{summary.won ? "Đã bắn hết đàn gà!" : "Hết mạng rồi!"}</h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          {summary.score} điểm{summary.record ? " · Kỷ lục mới! 🎉" : state.typingBest !== null ? ` · Kỷ lục ${state.typingBest}` : ""}
        </p>
        <dl className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-xl bg-slate-100 px-3 py-2"><dt className="text-slate-500">Gõ chính xác</dt><dd className="text-lg font-bold">{summary.accuracy}%</dd></div>
          <div className="rounded-xl bg-slate-100 px-3 py-2"><dt className="text-slate-500">Combo cao nhất</dt><dd className="text-lg font-bold">{summary.maxCombo}</dd></div>
          <div className="rounded-xl bg-slate-100 px-3 py-2"><dt className="text-slate-500">Từ đã xếp lịch ôn</dt><dd className="text-lg font-bold">{summary.scheduled}</dd></div>
        </dl>
        {summary.rows.length > 0 && (
          <ul className="mt-5 divide-y divide-slate-100 text-sm">
            {summary.rows.map((r) => {
              const w = vocabById.get(r.wordId)!;
              const ui = OUTCOME_UI[r.outcome];
              return (
                <li key={r.wordId} className="flex items-center gap-3 py-2">
                  <span className="w-32 shrink-0 font-semibold">{w.word}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-600">{w.meaningVi}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${ui.style}`} title={ui.label}>
                    {ui.icon} {ui.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={start} className="btn-primary">Chơi lại</button>
          <button onClick={onExit} className="btn-ghost">Xong</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        {state.typingBest !== null && <span>Kỷ lục {state.typingBest} điểm</span>}
      </div>

      {hud && (
        <div className="card mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3">
          <p className="text-sm text-slate-600">Gõ từ tiếng Anh có nghĩa trên con gà để bắn nó.</p>
          <dl className="flex items-center gap-4 text-sm">
            <div className="text-center"><dt className="text-xs text-slate-500">Từ</dt><dd className="font-bold">{hud.done}/{hud.total}</dd></div>
            <div className="text-center"><dt className="text-xs text-slate-500">Điểm</dt><dd className="font-bold">{hud.score}</dd></div>
            <div className="text-center"><dt className="text-xs text-slate-500">Combo</dt><dd className="font-bold">{hud.combo > 0 ? `🔥${hud.combo}` : "0"}</dd></div>
            <div className="text-center" aria-label={`${hud.lives} mạng`}>
              <dt className="text-xs text-slate-500">Mạng</dt>
              <dd className="font-bold">
                {"❤️".repeat(Math.max(0, hud.lives))}
                {"🤍".repeat(Math.max(0, START_LIVES - hud.lives))}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div
        className="relative select-none overflow-hidden rounded-2xl ring-1 ring-slate-900/20"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerDown={() => inputRef.current?.focus()}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Màn chơi Gõ từ" role="img" />

        {status === "ready" && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/60 p-4">
            <div className="max-w-md text-center text-white">
              <p className="text-5xl" aria-hidden>⌨️🚀</p>
              <h2 className="mt-2 text-2xl font-extrabold">Gõ từ bắn gà</h2>
              <ul className="mt-3 space-y-1 text-left text-sm text-white/85">
                <li>🐔 Gà rơi xuống mang <strong>nghĩa tiếng Việt</strong>.</li>
                <li>⌨️ <strong>Gõ từ tiếng Anh</strong> tương ứng, gõ đúng là tàu tự bắn (hoặc nhấn Enter).</li>
                <li>💡 Gà rơi quá nửa đường sẽ hiện chữ cái đầu, bắn lúc đó được ít điểm hơn.</li>
                <li>💔 Để gà chạm vạch đỏ mất 1 trong {START_LIVES} mạng. Esc để tạm dừng. {ROUNDS} từ mỗi ván.</li>
              </ul>
              <button onClick={start} className="btn-primary mt-5 !px-6 !py-3">Bắt đầu</button>
            </div>
          </div>
        )}

        {status === "paused" && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/65">
            <div className="text-center text-white">
              <p className="text-4xl" aria-hidden>⏸️</p>
              <h2 className="mt-1 text-xl font-bold">Tạm dừng</h2>
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => setStatus("playing")} className="btn-primary">Tiếp tục</button>
                <button onClick={onExit} className="btn-ghost">Thoát</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (status === "playing") fire(typed);
        }}
      >
        <input
          key={shake}
          ref={inputRef}
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setStatus((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s));
            }
          }}
          disabled={status !== "playing"}
          placeholder={status === "playing" ? "Gõ từ tiếng Anh rồi nhấn Enter…" : ""}
          aria-label="Gõ từ tiếng Anh"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`field !py-3 text-center !text-xl font-semibold tracking-wide ${shake > 0 ? "animate-shake" : ""}`}
        />
      </form>
      <p
        role="status"
        className={`mt-2 min-h-5 text-center text-sm ${feedback?.tone === "warn" ? "text-amber-700" : "text-rose-700"}`}
      >
        {feedback?.text}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Từ đến hạn hoặc từ mới sẽ được xếp lịch ôn theo kết quả: gõ đúng = Nhớ, đúng sau gợi ý = Khó, để gà đáp xuống = Chưa nhớ.
        Tắt bộ gõ tiếng Việt (Unikey) khi chơi.
      </p>
    </div>
  );
}
