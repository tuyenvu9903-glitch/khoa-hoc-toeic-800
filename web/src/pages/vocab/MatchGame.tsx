import { useEffect, useMemo, useRef, useState } from "react";
import { vocabulary } from "../../data/vocabulary";
import { buildMatchTiles, finalSeconds, pickMatchWords, resolvePick, type Tile } from "../../domain/match";
import { recordMatchTime } from "../../lib/state";
import { update, useAppState } from "../../lib/store";

/** Quizlet "Match": pair each English word with its Vietnamese meaning as fast as you can. */
export function MatchGame({ onExit }: { onExit: () => void }) {
  const state = useAppState();
  const [round, setRound] = useState(0);
  const best = useRef(state.matchBest);
  best.current = state.matchBest;

  const words = useMemo(
    () => pickMatchWords(state.srs, vocabulary),
    // Fresh set only when a new round starts, not on every progress update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  const tiles = useMemo(() => buildMatchTiles(words), [words]);

  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [mismatches, setMismatches] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ seconds: number; record: boolean } | null>(null);

  useEffect(() => {
    if (startedAt === null || result) return;
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(t);
  }, [startedAt, result]);

  const reset = () => {
    setRound((r) => r + 1);
    setSelected(null);
    setMatched(new Set());
    setWrong([]);
    setMismatches(0);
    setStartedAt(null);
    setElapsed(0);
    setResult(null);
  };

  const onPick = (tile: Tile) => {
    if (result || wrong.length > 0 || matched.has(tile.pairId)) return;
    const start = startedAt ?? Date.now();
    if (startedAt === null) setStartedAt(start);
    const action = resolvePick(selected, tile);
    if (action === "select") setSelected(tile);
    else if (action === "deselect") setSelected(null);
    else if (action === "match") {
      const next = new Set(matched).add(tile.pairId);
      setMatched(next);
      setSelected(null);
      if (next.size === words.length) {
        const seconds = finalSeconds(Date.now() - start, mismatches);
        const record = best.current === null || seconds < best.current;
        update((s) => recordMatchTime(s, seconds).state);
        setResult({ seconds, record });
      }
    } else {
      setMismatches((m) => m + 1);
      setWrong([selected!.key, tile.key]);
      setSelected(null);
      setTimeout(() => setWrong([]), 450);
    }
  };

  const shown = result ? result.seconds : finalSeconds(elapsed, mismatches);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <button onClick={onExit} className="hover:text-slate-800">← Thoát</button>
        <span>
          ⏱ {shown.toFixed(1)}s{mismatches > 0 && <span className="text-rose-600"> · +{(mismatches * 0.5).toFixed(1)}s phạt</span>}
          {state.matchBest !== null && <span> · Kỷ lục {state.matchBest.toFixed(1)}s</span>}
        </span>
      </div>

      {result ? (
        <div className="card p-8 text-center">
          <p className="text-4xl">{result.record ? "🏆" : "🎉"}</p>
          <h2 className="mt-2 text-xl font-bold">{result.seconds.toFixed(1)} giây</h2>
          <p className="mt-1 text-sm text-slate-600">
            {result.record ? "Kỷ lục mới!" : `Kỷ lục của bạn: ${state.matchBest?.toFixed(1)}s`} · Ghép sai {mismatches} lần
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={reset} className="btn-primary">Chơi lại</button>
            <button onClick={onExit} className="btn-ghost">Xong</button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">Ghép mỗi từ tiếng Anh với nghĩa tiếng Việt. Ghép sai bị phạt 0,5 giây.</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((t) => {
              const gone = matched.has(t.pairId);
              const isSel = selected?.key === t.key;
              const isWrong = wrong.includes(t.key);
              return (
                <li key={t.key}>
                  <button
                    onClick={() => onPick(t)}
                    disabled={gone}
                    aria-pressed={isSel}
                    className={`flex h-24 w-full items-center justify-center rounded-2xl border px-2 text-center text-sm font-medium transition-all duration-300 ${
                      gone
                        ? "pointer-events-none scale-90 opacity-0"
                        : isWrong
                          ? "animate-shake border-rose-400 bg-rose-50 text-rose-700"
                          : isSel
                            ? "border-brand-500 bg-brand-50 shadow-lg shadow-brand-600/15 ring-4 ring-brand-100"
                            : "border-white/80 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                    } ${t.kind === "word" ? "text-base font-bold" : ""}`}
                  >
                    {t.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
