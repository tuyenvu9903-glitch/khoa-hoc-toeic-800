// Gamification: XP, levels, daily quests, weekly challenge and badges.
//
// Everything is derived from real state changes: the store calls `applyGamification(prev, next)`
// after each update, so XP only comes from answers, reviewed words and completed steps that
// actually happened. Reloading the page changes nothing (no transition), and one-off rewards are
// keyed (`m:<date>:<kind>`, `q:<date>:<id>`, `w:<week>:<id>`) so they are never paid twice.
import { currentStreak } from "../domain/streak";
import { localDateKey, type AppState } from "./state";

export type Game = AppState["game"];
type Daily = NonNullable<Game["daily"]>;
type Weekly = NonNullable<Game["weekly"]>;

// ---------- Levels ----------

/** Total XP needed to reach `level` (level 1 = 0, 2 = 100, 3 = 300, 4 = 600…). */
export const xpForLevel = (level: number) => 50 * level * (level - 1);

export function levelFromXp(xp: number): number {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}

const TITLES: [minLevel: number, title: string][] = [
  [1, "Gà mờ chính hiệu"],
  [2, "Gà con biết gáy"],
  [3, "Tân binh TOEIC"],
  [4, "Học viên có tâm"],
  [5, "Không còn là gà mờ"],
  [6, "Chiến binh từ vựng"],
  [8, "Thợ săn đáp án"],
  [10, "Cao thủ Part 5"],
  [12, "Trùm paraphrase"],
  [15, "TOEIC 800 vibes"],
  [20, "Huyền thoại phòng thi"],
];

export function levelTitle(level: number): string {
  return [...TITLES].reverse().find(([min]) => level >= min)![1];
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const from = xpForLevel(level);
  const to = xpForLevel(level + 1);
  return { level, title: levelTitle(level), into: xp - from, need: to - from, ratio: (xp - from) / (to - from) };
}

// ---------- Rewards ----------

export const XP = {
  correct: 3,
  wrong: 1,
  word: 1,
  /** Practice XP (answers + words) is capped per day so replaying the same set cannot farm it. */
  practiceCapPerDay: 250,
  step: 25,
  miniTest: 60,
  quest: 20,
  allQuests: 40,
  weekly: 150,
} as const;

// ---------- Daily quests ----------

export type QuestMetric = "answered" | "correct" | "listening" | "reading" | "words" | "steps";

export type Quest = { id: string; title: string; icon: string; metric: QuestMetric; target: number };

export const QUEST_POOL: Quest[] = [
  { id: "correct15", title: "Trả lời đúng 15 câu", icon: "🎯", metric: "correct", target: 15 },
  { id: "answer25", title: "Làm 25 câu bất kỳ", icon: "⚡", metric: "answered", target: 25 },
  { id: "listen10", title: "Nghe 10 câu", icon: "🎧", metric: "listening", target: 10 },
  { id: "read10", title: "Làm 10 câu Đọc hoặc Ngữ pháp", icon: "📖", metric: "reading", target: 10 },
  { id: "words20", title: "Học hoặc ôn 20 lượt từ", icon: "📚", metric: "words", target: 20 },
  { id: "steps3", title: "Xong 3 bước trong bài hôm nay", icon: "🧩", metric: "steps", target: 3 },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Three quests for the date, always the same for that date. */
export function questsForDate(date: string): Quest[] {
  return [...QUEST_POOL].sort((a, b) => hash(date + a.id) - hash(date + b.id)).slice(0, 3);
}

export function emptyDaily(date: string): Daily {
  return { date, answered: 0, correct: 0, listening: 0, reading: 0, words: 0, fixed: 0, practiceXp: 0 };
}

export function questValue(q: Quest, daily: Daily, state: AppState): number {
  if (q.metric === "steps") return state.missionDone[daily.date]?.length ?? 0;
  return daily[q.metric];
}

// ---------- Weekly challenge ----------

export type WeeklyChallenge = { id: string; title: string; icon: string; target: number; value: (w: Weekly, s: AppState) => number };

/** Monday of the week, as a local date key. */
export function weekKey(now: Date): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDateKey(d);
}

function activeDaysInWeek(week: string, s: AppState): number {
  const start = new Date(`${week}T12:00:00`);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    if ((s.missionDone[localDateKey(d)]?.length ?? 0) > 0) n++;
  }
  return n;
}

const WEEKLY: WeeklyChallenge[] = [
  { id: "active5", title: "Có mặt 5/7 ngày trong tuần", icon: "📅", target: 5, value: (w, s) => activeDaysInWeek(w.week, s) },
  { id: "correct120", title: "Trả lời đúng 120 câu trong tuần", icon: "🎯", target: 120, value: (w) => w.correct },
  { id: "words120", title: "Học hoặc ôn 120 lượt từ trong tuần", icon: "📚", target: 120, value: (w) => w.words },
];

export function weeklyFor(week: string): WeeklyChallenge {
  return WEEKLY[hash(week) % WEEKLY.length]!;
}

export const emptyWeekly = (week: string): Weekly => ({ week, answered: 0, correct: 0, words: 0 });

// ---------- Badges ----------

export type BadgeContext = { state: AppState; now: Date; streak: number; level: number; newSteps: string[]; allQuestsToday: boolean };

export type Badge = {
  id: string;
  name: string;
  icon: string;
  /** How to earn it (hidden for secret badges until unlocked). */
  how: string;
  /** Shown after unlocking. */
  flavor: string;
  secret?: boolean;
  xp: number;
  test: (c: BadgeContext) => boolean;
};

function sumSkills(s: AppState, pick: (code: string) => boolean, field: "attempts" | "correct"): number {
  return Object.entries(s.skillStats).reduce((n, [code, st]) => (pick(code) ? n + st[field] : n), 0);
}

export const BADGES: Badge[] = [
  {
    id: "first_blood", name: "Phát súng đầu tiên", icon: "🎯", xp: 10,
    how: "Trả lời đúng câu đầu tiên.", flavor: "Mọi huyền thoại đều bắt đầu từ một câu đúng.",
    test: ({ state }) => sumSkills(state, () => true, "correct") >= 1,
  },
  {
    id: "streak_3", name: "Có mùi chiến thần", icon: "🔥", xp: 30,
    how: "Học 3 ngày liên tiếp.", flavor: "3 ngày liền, thói quen đang thành hình.",
    test: ({ streak }) => streak >= 3,
  },
  {
    id: "streak_7", name: "Chiến thần 7 ngày", icon: "⚔️", xp: 80,
    how: "Học 7 ngày liên tiếp.", flavor: "Một tuần không nghỉ. Không phải dạng vừa đâu.",
    test: ({ streak }) => streak >= 7,
  },
  {
    id: "streak_30", name: "Con nhà người ta", icon: "👑", xp: 300,
    how: "Học 30 ngày liên tiếp.", flavor: "Phụ huynh hàng xóm bắt đầu nhắc tên bạn.",
    test: ({ streak }) => streak >= 30,
  },
  {
    id: "part5_killer", name: "Kẻ hủy diệt Part 5", icon: "💥", xp: 100,
    how: "Trả lời đúng 60 câu Part 5.", flavor: "Chỗ trống nào cũng bị bạn lấp gọn.",
    test: ({ state }) => sumSkills(state, (c) => c.startsWith("R.P5"), "correct") >= 60,
  },
  {
    id: "paraphrase_boss", name: "Trùm paraphrase", icon: "🔁", xp: 100,
    how: "Trả lời đúng 40 câu Part 3, 4 hoặc 7.", flavor: "Nói kiểu gì bạn cũng hiểu ý.",
    test: ({ state }) => sumSkills(state, (c) => /^(L\.P3|L\.P4|R\.P7)/.test(c), "correct") >= 40,
  },
  {
    id: "no_more_noob", name: "Không còn là gà mờ", icon: "🐣", xp: 50,
    how: "Đạt level 5.", flavor: "Chính thức tốt nghiệp lớp gà mờ.",
    test: ({ level }) => level >= 5,
  },
  {
    id: "error_hunter", name: "Thợ săn lỗi sai", icon: "🕵️", xp: 80,
    how: "Sửa xong 20 câu trong Sổ lỗi.", flavor: "Sai một lần, nhớ cả đời.",
    test: ({ state }) => state.errors.filter((e) => e.resolvedAt !== null).length >= 20,
  },
  {
    id: "vocab_300", name: "Kho từ di động", icon: "🧠", xp: 100,
    how: "Học 300 từ vựng.", flavor: "300 từ trong đầu, không cần mang từ điển.",
    test: ({ state }) => Object.keys(state.srs).length >= 300,
  },
  {
    id: "toeic_calling", name: "TOEIC 800 is calling", icon: "📞", xp: 200,
    how: "Đạt điểm 800+ (thi thử hoặc thi thật) hoặc lên level 15.", flavor: "Alo, 800 điểm nghe rõ trả lời.",
    test: ({ state, level }) => level >= 15 || state.scores.some((s) => s.total >= 800),
  },
  {
    id: "full_combo", name: "Full combo", icon: "🌟", xp: 30,
    how: "Hoàn thành cả 3 nhiệm vụ trong một ngày.", flavor: "Clear sạch quest, không chừa một cái.",
    test: ({ allQuestsToday }) => allQuestsToday,
  },
  // Secret badges: shown as "???" until unlocked.
  {
    id: "misheard", name: "Thánh nghe nhầm", icon: "👂", xp: 50, secret: true,
    how: "Bí mật. Gợi ý: liên quan đến đôi tai.", flavor: "Nghe nhầm 15 câu mà vẫn cày tiếp. Tai đang được nâng cấp.",
    test: ({ state }) => {
      const tries = sumSkills(state, (c) => c.startsWith("L."), "attempts");
      return tries >= 40 && tries - sumSkills(state, (c) => c.startsWith("L."), "correct") >= 15;
    },
  },
  {
    id: "goldfish", name: "Não cá vàng có tổ chức", icon: "🐟", xp: 50, secret: true,
    how: "Bí mật. Gợi ý: quên là chuyện bình thường.", flavor: "Quên 15 lần nhưng vẫn ôn đều. Cá vàng có kỷ luật.",
    test: ({ state }) => Object.values(state.srs).reduce((n, c) => n + c.lapses, 0) >= 15,
  },
  {
    id: "night_owl", name: "Cú đêm học bài", icon: "🦉", xp: 20, secret: true,
    how: "Bí mật. Gợi ý: trời đã tối lắm rồi.", flavor: "Hoàn thành một bước sau 23 giờ. Giờ thì đi ngủ đi.",
    test: ({ now, newSteps }) => newSteps.length > 0 && (now.getHours() >= 23 || now.getHours() < 4),
  },
  {
    id: "early_bird", name: "Dậy sớm hơn báo thức", icon: "🌅", xp: 20, secret: true,
    how: "Bí mật. Gợi ý: gà gáy chưa?", flavor: "Hoàn thành một bước trước 7 giờ sáng.",
    test: ({ now, newSteps }) => newSteps.length > 0 && now.getHours() >= 4 && now.getHours() < 7,
  },
];

// ---------- Events ----------

export type GameEvent =
  | { type: "xp"; amount: number; reason: string }
  | { type: "level"; level: number; title: string }
  | { type: "badge"; badge: Badge }
  | { type: "quest"; quest: Quest }
  | { type: "all_quests" }
  | { type: "weekly"; challenge: WeeklyChallenge };

// ---------- Apply ----------

const DAY_MS = 86_400_000;

/** Drop dated reward keys older than ~5 weeks; they can never be paid again anyway. */
function pruneAwarded(awarded: Record<string, number>, now: Date): Record<string, number> {
  const cutoff = localDateKey(new Date(now.getTime() - 35 * DAY_MS));
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(awarded)) {
    const date = k.split(":")[1];
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= cutoff) out[k] = v;
  }
  return out;
}

export function applyGamification(prev: AppState, next: AppState, now: Date = new Date()): { state: AppState; events: GameEvent[] } {
  if (!next.profile) return { state: next, events: [] };
  const today = localDateKey(now);
  const week = weekKey(now);
  const g = next.game;
  const daily: Daily = g.daily?.date === today ? { ...g.daily } : emptyDaily(today);
  const weekly: Weekly = g.weekly?.week === week ? { ...g.weekly } : emptyWeekly(week);
  const awarded = { ...g.awarded };
  const events: GameEvent[] = [];
  let xp = g.xp;

  // Answers
  let answered = 0;
  let correct = 0;
  for (const [code, st] of Object.entries(next.skillStats)) {
    const before = prev.skillStats[code];
    const dA = st.attempts - (before?.attempts ?? 0);
    const dC = st.correct - (before?.correct ?? 0);
    if (dA <= 0) continue;
    answered += dA;
    correct += Math.max(0, dC);
    if (code.startsWith("L.")) daily.listening += dA;
    if (code.startsWith("R.")) daily.reading += dA;
  }
  // Words learned or reviewed
  let words = 0;
  for (const [id, card] of Object.entries(next.srs)) {
    const before = prev.srs[id];
    if (!before || (card.lastReviewedAt !== null && card.lastReviewedAt !== before.lastReviewedAt)) words++;
  }
  // Mistakes fixed
  const prevOpen = new Set(prev.errors.filter((e) => e.resolvedAt === null).map((e) => e.id));
  daily.fixed += next.errors.filter((e) => e.resolvedAt !== null && prevOpen.has(e.id)).length;

  daily.answered += answered;
  daily.correct += correct;
  daily.words += words;
  weekly.answered += answered;
  weekly.correct += correct;
  weekly.words += words;

  const practice = correct * XP.correct + (answered - correct) * XP.wrong + words * XP.word;
  const practiceGain = Math.max(0, Math.min(practice, XP.practiceCapPerDay - daily.practiceXp));
  daily.practiceXp += practiceGain;
  xp += practiceGain;

  // Completed steps of today
  const before = new Set(prev.missionDone[today] ?? []);
  const newSteps = (next.missionDone[today] ?? []).filter((k) => !before.has(k));
  let stepXp = 0;
  for (const kind of newSteps) {
    const key = `m:${today}:${kind}`;
    if (awarded[key] !== undefined) continue;
    const amount = kind === "mini_test" ? XP.miniTest : XP.step;
    awarded[key] = amount;
    stepXp += amount;
  }
  if (stepXp > 0) {
    xp += stepXp;
    events.push({ type: "xp", amount: stepXp, reason: "Hoàn thành bước học" });
  }

  const draft: AppState = { ...next, game: { ...g, xp, awarded, daily, weekly } };

  // Daily quests
  const quests = questsForDate(today);
  for (const q of quests) {
    const key = `q:${today}:${q.id}`;
    if (awarded[key] === undefined && questValue(q, daily, draft) >= q.target) {
      awarded[key] = XP.quest;
      xp += XP.quest;
      events.push({ type: "quest", quest: q });
    }
  }
  const allKey = `qa:${today}`;
  const allQuestsToday = quests.every((q) => awarded[`q:${today}:${q.id}`] !== undefined);
  if (allQuestsToday && awarded[allKey] === undefined) {
    awarded[allKey] = XP.allQuests;
    xp += XP.allQuests;
    events.push({ type: "all_quests" });
  }

  // Weekly challenge
  const ch = weeklyFor(week);
  const wKey = `w:${week}:${ch.id}`;
  if (awarded[wKey] === undefined && ch.value(weekly, draft) >= ch.target) {
    awarded[wKey] = XP.weekly;
    xp += XP.weekly;
    events.push({ type: "weekly", challenge: ch });
  }

  // Badges (checked against the updated state; each unlocks once)
  const badges = { ...g.badges };
  const streak = currentStreak(next.missionDone, now);
  for (const b of BADGES) {
    if (badges[b.id]) continue;
    const ctx: BadgeContext = { state: draft, now, streak, level: levelFromXp(xp), newSteps, allQuestsToday };
    if (b.test(ctx)) {
      badges[b.id] = now.toISOString();
      xp += b.xp;
      events.push({ type: "badge", badge: b });
    }
  }

  const oldLevel = levelFromXp(g.xp);
  const newLevel = levelFromXp(xp);
  if (newLevel > oldLevel) events.push({ type: "level", level: newLevel, title: levelTitle(newLevel) });

  const game = { xp, awarded: pruneAwarded(awarded, now), badges, daily, weekly };
  const unchanged =
    xp === g.xp &&
    Object.keys(badges).length === Object.keys(g.badges).length &&
    JSON.stringify(daily) === JSON.stringify(g.daily) &&
    JSON.stringify(weekly) === JSON.stringify(g.weekly) &&
    Object.keys(game.awarded).length === Object.keys(g.awarded).length;
  return { state: unchanged ? next : { ...next, game }, events };
}

/** Today's quests with progress, for display. */
export function questBoard(state: AppState, now: Date = new Date()) {
  const today = localDateKey(now);
  const daily = state.game.daily?.date === today ? state.game.daily : emptyDaily(today);
  return questsForDate(today).map((q) => ({
    quest: q,
    value: Math.min(q.target, questValue(q, daily, state)),
    done: state.game.awarded[`q:${today}:${q.id}`] !== undefined,
  }));
}

export function weeklyBoard(state: AppState, now: Date = new Date()) {
  const week = weekKey(now);
  const weekly = state.game.weekly?.week === week ? state.game.weekly : emptyWeekly(week);
  const ch = weeklyFor(week);
  return { challenge: ch, value: Math.min(ch.target, ch.value(weekly, state)), done: state.game.awarded[`w:${week}:${ch.id}`] !== undefined };
}
