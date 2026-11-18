// The guided daily session: the day's steps in order, with real completion state.
import { missionLink, planForDay } from "../data/dailyPlan";
import { packByDay } from "../data/dayPacks";
import { PART5_SKILLS } from "../data/reading";
import { isKindDone, requiredKinds, wordsForDay, type MissionKindTracked } from "../domain/progress";
import { isDue } from "../domain/srs";
import type { AppState } from "./state";

export type JourneyStep = {
  kind: MissionKindTracked;
  n: number;
  title: string;
  icon: string;
  /** Pastel chip class for the category. */
  tone: string;
  /** Rough time for the step, used for "time left" (about 2 hours a day in total). */
  minutes: number;
  to: string;
  done: boolean;
  detail: string;
};

const META: Record<MissionKindTracked, { title: string; icon: string; tone: string; minutes: number }> = {
  vocab: { title: "Từ vựng", icon: "📚", tone: "bg-p-purple", minutes: 30 },
  grammar: { title: "Ngữ pháp", icon: "✏️", tone: "bg-p-blue", minutes: 20 },
  listening: { title: "Nghe", icon: "🎧", tone: "bg-p-mint", minutes: 30 },
  reading: { title: "Đọc hiểu", icon: "📖", tone: "bg-p-cream", minutes: 25 },
  mini_test: { title: "Kiểm tra cuối tuần", icon: "⏱️", tone: "bg-p-coral", minutes: 20 },
};

export function buildJourney(state: AppState, day = state.progress.day): JourneyStep[] {
  const plan = planForDay(day);
  const pack = packByDay.get(day);
  const words = wordsForDay(day);
  const learned = words.filter((w) => state.srs[w.id]).length;
  const due = Object.values(state.srs).filter((c) => isDue(c, new Date())).length;
  const skill = PART5_SKILLS.find((s) => s.code === plan.grammar)?.label ?? "Ngữ pháp";

  const detail: Record<MissionKindTracked, string> = {
    vocab: `${learned}/${words.length} từ mới${due > 0 ? ` · ${due} từ cần ôn` : ""}`,
    grammar: pack ? `${pack.part5.length} câu Part 5 · ${skill}` : `Part 5 · ${skill}`,
    listening: pack
      ? `${pack.part2.length} câu Part 2${pack.talk ? ` + 1 ${pack.talk.part === "3" ? "hội thoại" : "bài nói"}` : ""}`
      : `Part ${plan.listeningPart}`,
    reading: pack ? `${pack.part7.title} · ${pack.part7.questions.length} câu hỏi` : `Part ${plan.readingPart}`,
    mini_test: "Làm theo giao diện thi thật",
  };

  return requiredKinds(plan).map((kind, i) => ({
    kind,
    n: i + 1,
    ...META[kind],
    to: kind === "vocab" ? "/vocab?start=learn" : (missionLink(kind, plan) ?? "/"),
    done: isKindDone(state.progress, state.srs, day, kind),
    detail: detail[kind],
  }));
}

export function nextStep(steps: JourneyStep[]): JourneyStep | null {
  return steps.find((s) => !s.done) ?? null;
}

export function minutesLeft(steps: JourneyStep[]): number {
  return steps.filter((s) => !s.done).reduce((n, s) => n + s.minutes, 0);
}
