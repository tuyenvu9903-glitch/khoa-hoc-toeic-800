// "Smart teasing": choose what to say after an answer from how the learner is actually doing.
import { skillRows } from "../data/curriculum";
import { PART5_SKILLS } from "../data/reading";
import type { VoiceContext } from "./lines";
import type { Vars } from "./engine";

export type CoachMemory = {
  answered: number;
  correct: number;
  rightRun: number;
  wrongRun: number;
  /** Consecutive misses per skill code. */
  skillMiss: Record<string, number>;
};

export const newCoachMemory = (): CoachMemory => ({ answered: 0, correct: 0, rightRun: 0, wrongRun: 0, skillMiss: {} });

export type CoachInput = { correct: boolean; skillCode: string; responseMs?: number };
export type CoachReaction = { context: VoiceContext; vars: Vars; tip?: string };

/** A fast answer: quick enough for the real test pace. */
const FAST_MS = 8_000;

const p5Label = new Map(PART5_SKILLS.map((s) => [s.code, s.label]));
const skillName = new Map(skillRows.map((s) => [s.code, s.name]));

export function skillLabel(code: string): string {
  // Vocabulary items are tracked as "w:<word>".
  if (code.startsWith("w:")) return `từ "${code.slice(2)}"`;
  return p5Label.get(code) ?? skillName.get(code) ?? code;
}

/** Short, factual study tips per skill family (most specific prefix wins). */
const TIPS: [prefix: string, tip: string][] = [
  ["R.P5.wordform", "Nhìn vị trí chỗ trống: sau mạo từ/tính từ cần danh từ, trước danh từ cần tính từ, bổ nghĩa cho động từ hoặc cả câu cần trạng từ."],
  ["R.P5.tense", "Tìm dấu hiệu thời gian trước khi chọn thì: since/for (hoàn thành), by the time, next week, yesterday…"],
  ["R.P5.sva", "Xác định chủ ngữ chính, bỏ qua cụm chen giữa (of…, with…, along with…) rồi mới chia động từ."],
  ["R.P5.prep", "Giới từ thời gian: in + tháng/năm, on + thứ/ngày, at + giờ. Nhiều giới từ đi theo cụm cố định, hãy học cả cụm."],
  ["R.P5.conj", "Liên từ (although, because) đi với mệnh đề có động từ; giới từ (despite, because of) đi với cụm danh từ."],
  ["R.P5.gerund", "Học theo nhóm: avoid/consider/finish + V-ing; plan/decide/agree + to V."],
  ["R.P5.passive", "Chủ ngữ chịu tác động hoặc sau chỗ trống không có tân ngữ thì thường cần bị động (be + V3)."],
  ["R.P5", "Đọc cả câu, xác định chỗ trống cần loại từ gì hay cần nghĩa gì trước khi nhìn đáp án."],
  ["R.P7", "Gạch từ khóa trong câu hỏi, dò đoạn chứa ý đó. Đáp án đúng thường diễn đạt lại (paraphrase), không lặp nguyên văn."],
  ["R.P6", "Đọc câu trước và sau chỗ trống để giữ mạch ý và thì của đoạn văn."],
  ["L.P2.yesno", "Câu Yes/No không nhất thiết trả lời bằng Yes/No; câu trả lời gián tiếp hợp lý vẫn đúng."],
  ["L.P2", "Bắt chắc từ để hỏi ở đầu câu (Who/When/Where…). Đáp án lặp lại từ giống câu hỏi thường là bẫy."],
  ["L.P3", "Đọc trước câu hỏi, nghe ý chính và người nói. Đáp án đúng thường là paraphrase của lời thoại."],
  ["L.P4", "Câu đầu bài nói thường chứa mục đích; nghe kỹ con số, thời gian và yêu cầu ở cuối."],
  ["L.P1", "Tập trung vào hành động và vị trí của người/vật trong ảnh; loại đáp án mô tả thứ không thấy."],
];

export function skillTip(code: string): string | undefined {
  return TIPS.find(([p]) => code.startsWith(p))?.[1];
}

export function coachReact(mem: CoachMemory, a: CoachInput): { memory: CoachMemory; reaction: CoachReaction } {
  const answered = mem.answered + 1;
  const correct = mem.correct + (a.correct ? 1 : 0);
  if (a.correct) {
    const rightRun = mem.rightRun + 1;
    const memory = { answered, correct, rightRun, wrongRun: 0, skillMiss: { ...mem.skillMiss, [a.skillCode]: 0 } };
    let context: VoiceContext = "correct";
    if (mem.wrongRun >= 2) context = "correct_comeback";
    else if (rightRun === 5 || rightRun === 10 || (rightRun > 10 && rightRun % 10 === 0)) context = "combo";
    else if (a.responseMs !== undefined && a.responseMs < FAST_MS && rightRun >= 3) context = "correct_fast";
    return { memory, reaction: { context, vars: { n: rightRun } } };
  }
  const wrongRun = mem.wrongRun + 1;
  const miss = (mem.skillMiss[a.skillCode] ?? 0) + 1;
  const memory = { answered, correct, rightRun: 0, wrongRun, skillMiss: { ...mem.skillMiss, [a.skillCode]: miss } };
  let context: VoiceContext = "wrong";
  let tip: string | undefined;
  if (miss >= 2) {
    context = "wrong_skill";
    tip = skillTip(a.skillCode);
  } else if (wrongRun >= 3) context = "wrong_streak";
  else if (answered >= 10 && correct / answered < 0.5) context = "grind";
  return { memory, reaction: { context, vars: { skill: skillLabel(a.skillCode), n: wrongRun }, tip } };
}

/** What to say at the end of a session, from its accuracy. */
export function doneContext(correct: number, total: number): VoiceContext {
  if (total > 0 && correct === total) return "done_perfect";
  if (total >= 3 && correct / total < 0.5) return "done_rough";
  return "done";
}
