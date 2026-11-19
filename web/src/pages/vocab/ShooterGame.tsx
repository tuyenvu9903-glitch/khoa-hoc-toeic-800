import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { vocabById, vocabulary } from "../../data/vocabulary";
import type { Direction } from "../../domain/learn";
import {
  CHICKEN_H,
  createGame,
  gradeForOutcome,
  H,
  INVADE_Y,
  NO_INPUT,
  pickShooterWords,
  ROUNDS,
  START_LIVES,
  step,
  W,
  type Game,
  type Input,
  type RoundOutcome,
} from "../../domain/shooter";
import { gradeVocab, localDateKey, markMissionDone, recordShooterScore } from "../../lib/state";
import { update, useAppState } from "../../lib/store";
import { VerdictLine } from "../../components/Voice";
import { unlockedWords } from "../../domain/progress";
import { isTypingTarget, SpeakButton } from "./shared";
import { drawBackdrop, drawBullet, drawChicken, drawDangerLine, drawFx, drawShip, EMOJI, makeStars, type Star } from "./canvasArt";

type Status = "ready" | "playing" | "paused" | "done";
type Hud = {
  round: number;
  rounds: number;
  lives: number;
  score: number;
  combo: number;
  prompt: string;
  dir: Direction;
  labels: string[];
};
type Summary = {
  won: boolean;
  score: number;
  record: boolean;
  accuracy: number;
  maxCombo: number;
  scheduled: number;
  rows: { wordId: string; outcome: RoundOutcome }[];
};

function draw(canvas: HTMLCanvasElement, g: Game | null, stars: Star[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const scale = canvas.width / W;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const time = g?.time ?? 0;
  drawBackdrop(ctx, time, stars);
  if (!g) return;

  drawDangerLine(ctx, INVADE_Y + CHICKEN_H / 2);
  for (const c of g.round.chickens) drawChicken(ctx, c, time);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `22px ${EMOJI}`;
  for (const e of g.eggs) ctx.fillText("🥚", e.x, e.y);

  for (const b of g.bullets) drawBullet(ctx, b.x, b.y);
  drawShip(ctx, g.ship.x, time, g.ship.invuln > 0);
  drawFx(ctx, g.fx);
}

function hudOf(g: Game): Hud {
  return {
    round: g.roundIndex + 1,
    rounds: g.targets.length,
    lives: g.lives,
    score: g.score,
    combo: g.combo,
    prompt: g.round.prompt,
    dir: g.round.dir,
    labels: [...g.round.chickens].sort((a, b) => a.id - b.id).map((c) => c.label),
  };
}

const sameHud = (a: Hud | null, b: Hud) =>
  a !== null &&
  a.round === b.round &&
  a.lives === b.lives &&
  a.score === b.score &&
  a.combo === b.combo &&
  a.prompt === b.prompt &&
  a.labels.join("|") === b.labels.join("|");

const OUTCOME_UI: Record<RoundOutcome, { icon: string; label: string; style: string }> = {
  perfect: { icon: "✓", label: "Trúng ngay", style: "bg-emerald-100 text-emerald-800" },
  ok: { icon: "~", label: "Trúng sau khi bắn nhầm", style: "bg-amber-100 text-amber-800" },
  missed: { icon: "✗", label: "Để gà đáp xuống", style: "bg-rose-100 text-rose-800" },
};

/** "Bắn gà": shoot the chicken carrying the right translation before the flock lands. */
export function ShooterGame({ onExit }: { onExit: () => void }) {
  const state = useAppState();
  const [status, setStatus] = useState<Status>("ready");
  const [hud, setHud] = useState<Hud | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const inputRef = useRef<Input>({ ...NO_INPUT });
  const scheduledRef = useRef<Set<string>>(new Set());
  const gradedRef = useRef(0);
  const stars = useMemo(makeStars, []);

  const start = useCallback(() => {
    const picks = pickShooterWords(state.srs, unlockedWords(state.progress.day), new Date());
    scheduledRef.current = new Set(picks.filter((p) => p.scheduled).map((p) => p.word.id));
    const g = createGame(
      picks.map((p) => p.word),
      vocabulary,
    );
    gameRef.current = g;
    gradedRef.current = 0;
    inputRef.current = { ...NO_INPUT };
    setHud(hudOf(g));
    setSummary(null);
    setStatus("playing");
  }, [state.srs]);

  // Crisp canvas on high-DPI screens; also paints the idle backdrop.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    draw(c, gameRef.current, stars);
  }, [status, stars]);

  // Game loop.
  useEffect(() => {
    if (status !== "playing") return;
    let raf = 0;
    let last = performance.now();
    let shownHud: Hud | null = null;

    const finish = (g: Game) => {
      const now = new Date();
      const accuracy = g.shots === 0 ? 0 : Math.round((g.hits / g.shots) * 100);
      const won = g.phase === "won";
      const rec = recordShooterScore(state, g.score);
      update((s) => {
        let n = recordShooterScore(s, g.score).state;
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
      step(g, dt, inputRef.current);
      inputRef.current.fire = false;

      while (gradedRef.current < g.results.length) {
        const r = g.results[gradedRef.current++]!;
        if (scheduledRef.current.has(r.wordId)) {
          update((s) => gradeVocab(s, r.wordId, gradeForOutcome(r.outcome), new Date()));
        }
      }

      draw(canvas, g, stars);
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

  // Keyboard.
  useEffect(() => {
    if (status !== "playing" && status !== "paused") return;
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "escape" || k === "p") {
        e.preventDefault();
        setStatus((s) => (s === "playing" ? "paused" : "playing"));
        return;
      }
      if (status !== "playing") return;
      if (k === "arrowleft" || k === "a") inputRef.current.move = -1;
      else if (k === "arrowright" || k === "d") inputRef.current.move = 1;
      else if (k === " " || k === "arrowup" || k === "enter") {
        e.preventDefault();
        inputRef.current.fire = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const m = inputRef.current.move;
      if ((m === -1 && (k === "arrowleft" || k === "a")) || (m === 1 && (k === "arrowright" || k === "d"))) {
        inputRef.current.move = 0;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [status]);

  const pointerX = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * W;
  };
  const holdMove = (dir: -1 | 1) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      inputRef.current.move = dir;
    },
    onPointerUp: () => {
      inputRef.current.move = 0;
    },
    onPointerLeave: () => {
      inputRef.current.move = 0;
    },
    onPointerCancel: () => {
      inputRef.current.move = 0;
    },
  });

  if (status === "done" && summary) {
    return (
      <div className="card p-6 sm:p-8">
        <VerdictLine context={summary.record ? "record" : summary.won ? "done" : "done_rough"} className="mx-auto max-w-md" />
        <h2 className="mt-4 text-center text-2xl font-extrabold">{summary.won ? "Đàn gà đã bị xử đẹp!" : "Hết mạng rồi! Gà thắng ván này."}</h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          {summary.score} điểm{summary.record ? " · Kỷ lục mới! 🎉" : state.shooterBest !== null ? ` · Kỷ lục ${state.shooterBest}` : ""}
        </p>
        <dl className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-xl bg-brand-50 px-3 py-2"><dt className="text-slate-500">Độ chính xác</dt><dd className="text-lg font-bold">{summary.accuracy}%</dd></div>
          <div className="rounded-xl bg-amber-50 px-3 py-2"><dt className="text-slate-500">Combo cao nhất</dt><dd className="text-lg font-bold">{summary.maxCombo}</dd></div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2"><dt className="text-slate-500">Từ đã xếp lịch ôn</dt><dd className="text-lg font-bold">{summary.scheduled}</dd></div>
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
          <button onClick={start} className="btn-primary">Phục thù ván nữa</button>
          <button onClick={onExit} className="btn-ghost">Xong</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        {state.shooterBest !== null && <span>Kỷ lục {state.shooterBest} điểm</span>}
      </div>

      {hud && (
        <div className="card mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">
              {hud.dir === "en2vi" ? "Bắn con gà mang nghĩa tiếng Việt của" : "Bắn con gà mang từ tiếng Anh có nghĩa"}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900" data-testid="prompt">
                {hud.prompt}
              </span>
              {hud.dir === "en2vi" && <SpeakButton text={hud.prompt} label="Nghe phát âm" autoPlay />}
            </p>
          </div>
          <dl className="flex items-center gap-4 text-sm">
            <div className="text-center"><dt className="text-xs text-slate-500">Vòng</dt><dd className="font-bold">{hud.round}/{hud.rounds}</dd></div>
            <div className="text-center"><dt className="text-xs text-slate-500">Điểm</dt><dd className="font-bold" data-testid="score">{hud.score}</dd></div>
            <div className="text-center"><dt className="text-xs text-slate-500">Combo</dt><dd className="font-bold">{hud.combo > 0 ? `🔥${hud.combo}` : "0"}</dd></div>
            <div className="text-center" aria-label={`${hud.lives} mạng`}>
              <dt className="text-xs text-slate-500">Mạng</dt>
              <dd className="font-bold" data-testid="lives">
                {"❤️".repeat(Math.max(0, hud.lives))}
                {"🤍".repeat(Math.max(0, START_LIVES - hud.lives))}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div
        className="relative touch-none select-none overflow-hidden rounded-2xl ring-1 ring-brand-900/30"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerMove={(e) => {
          if (status === "playing") inputRef.current.pointerX = pointerX(e);
        }}
        onPointerDown={(e) => {
          if (status !== "playing") return;
          inputRef.current.pointerX = pointerX(e);
          inputRef.current.fire = true;
        }}
        onPointerLeave={() => {
          inputRef.current.pointerX = null;
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== "mouse") inputRef.current.pointerX = null;
        }}
        data-testid="stage"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Màn chơi Bắn gà" role="img" />

        {status === "ready" && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="max-w-md text-center text-white">
              <p className="text-5xl" aria-hidden>🐔🚀</p>
              <h2 className="mt-2 text-2xl font-extrabold">Bắn gà từ vựng</h2>
              <ul className="mt-3 space-y-1 text-left text-sm text-white/85">
                <li>🎯 Bắn con gà mang <strong>nghĩa đúng</strong> của từ trên đầu màn hình.</li>
                <li>🖱️ Rê chuột hoặc kéo ngón tay để di chuyển, <strong>click / chạm</strong> để bắn. Bàn phím: ← → và Space.</li>
                <li>💔 Bắn nhầm, trúng trứng hoặc để gà đáp xuống đều mất 1 trong {START_LIVES} mạng.</li>
                <li>⏸️ Esc hoặc P để tạm dừng. {ROUNDS} từ mỗi ván, càng về sau gà càng nhanh.</li>
              </ul>
              <button onClick={start} className="btn-primary mt-5 !px-6 !py-3">Bắt đầu bắn</button>
            </div>
          </div>
        )}

        {status === "paused" && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/65 backdrop-blur-sm">
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

      {hud && (
        <ol className="sr-only" aria-label="Các con gà trong vòng này, từ trái sang phải">
          {hud.labels.map((l, i) => (
            <li key={`${hud.round}-${i}`}>Gà {i + 1}: {l}</li>
          ))}
        </ol>
      )}

      <div className="mt-3 hidden grid-cols-[1fr_2fr_1fr] gap-3 [@media(pointer:coarse)]:grid">
        <button className="btn-ghost !py-4 text-lg" aria-label="Sang trái" {...holdMove(-1)}>◀</button>
        <button
          className="btn-primary !py-4 text-lg"
          onPointerDown={(e) => {
            e.preventDefault();
            inputRef.current.fire = true;
          }}
        >
          BẮN 🔥
        </button>
        <button className="btn-ghost !py-4 text-lg" aria-label="Sang phải" {...holdMove(1)}>▶</button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Từ đến hạn hoặc từ mới sẽ được xếp lịch ôn theo kết quả: trúng ngay = Nhớ, trúng sau khi bắn nhầm = Khó, để gà đáp xuống = Chưa nhớ.
      </p>
    </div>
  );
}
