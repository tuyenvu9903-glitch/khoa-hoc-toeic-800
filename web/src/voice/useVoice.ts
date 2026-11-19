import { useCallback, useRef, useState } from "react";
import { useAppState } from "../lib/store";
import { coachReact, doneContext, newCoachMemory, type CoachInput } from "./coach";
import { copy, type CopyKey } from "./copy";
import { pickLine, type HumorLevel, type Line, type Vars } from "./engine";
import type { VoiceContext } from "./lines";

export function useHumor(): HumorLevel {
  return useAppState().prefs.humor;
}

/** Microcopy helper bound to the learner's humour setting. */
export function useCopy() {
  const humor = useHumor();
  return useCallback((key: CopyKey, vars?: Vars) => copy(key, humor, vars), [humor]);
}

/** One line for this mount: it does not change on re-render, only when `context` changes. */
export function useLine(context: VoiceContext, vars?: Vars): Line {
  const humor = useHumor();
  const [state, setState] = useState(() => ({ key: `${context}|${humor}`, line: pickLine(context, { humor, vars }) }));
  const key = `${context}|${humor}`;
  if (state.key !== key) {
    const next = { key, line: pickLine(context, { humor, vars }) };
    setState(next);
    return next.line;
  }
  return state.line;
}

export type CoachLine = Line & { tip?: string; seq: number };

/** Reacts to each answer of a practice session, based on how the learner is doing. */
export function useCoach() {
  const humor = useHumor();
  const memory = useRef(newCoachMemory());
  const seq = useRef(0);
  const [line, setLine] = useState<CoachLine | null>(null);

  const react = useCallback(
    (a: CoachInput) => {
      const { memory: m, reaction } = coachReact(memory.current, a);
      memory.current = m;
      seq.current += 1;
      setLine({ ...pickLine(reaction.context, { humor, vars: reaction.vars }), tip: reaction.tip, seq: seq.current });
    },
    [humor],
  );
  const clear = useCallback(() => setLine(null), []);
  const reset = useCallback(() => {
    memory.current = newCoachMemory();
    setLine(null);
  }, []);
  const doneLine = useCallback(
    (correct: number, total: number) => pickLine(doneContext(correct, total), { humor }),
    [humor],
  );
  return { line, react, clear, reset, doneLine, stats: memory };
}
