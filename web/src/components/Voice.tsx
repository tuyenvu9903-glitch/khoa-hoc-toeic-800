import type { ReactNode } from "react";
import { doneContext } from "../voice/coach";
import type { Vars } from "../voice/engine";
import type { VoiceContext } from "../voice/lines";
import type { CoachLine } from "../voice/useVoice";
import { useLine } from "../voice/useVoice";
import { CoachBubble } from "./Mascot";

/** The mascot's reaction to the answer just given. The factual feedback stays next to it. */
export function CoachReaction({ line, className = "mt-4" }: { line: CoachLine | null; className?: string }) {
  if (!line) return null;
  const good = line.context.startsWith("correct") || line.context === "combo";
  return <CoachBubble key={line.seq} mood={line.mood} text={line.text} voice={line.text} autoSpeak tip={line.tip} size={52} tone={good ? "mint" : "cream"} className={`pop-in ${className}`} />;
}

/** "Let's go" line shown when a session starts. */
export function StartLine({ className = "mt-4" }: { className?: string }) {
  const line = useLine("start");
  return <CoachBubble mood={line.mood} text={line.text} voice={line.text} size={44} className={className} />;
}

/** End-of-session card: score, the mascot's verdict and any follow-up actions. */
export function SessionResult({
  correct,
  total,
  note,
  children,
  className = "mt-5",
}: {
  correct: number;
  total: number;
  note?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const line = useLine(doneContext(correct, total));
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className={`card pop-in p-5 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-extrabold">{correct}/{total}</p>
          <p className="text-xs text-slate-500">câu đúng · {pct}%</p>
        </div>
        <CoachBubble mood={line.mood} text={line.text} voice={line.text} autoSpeak size={64} className="min-w-[14rem] flex-1" />
      </div>
      {note && <p className="mt-3 text-sm text-slate-600">{note}</p>}
      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** A single mascot line for a fixed situation (end screens, game results). */
export function VerdictLine({ context, vars, className = "" }: { context: VoiceContext; vars?: Vars; className?: string }) {
  const line = useLine(context, vars);
  return <CoachBubble mood={line.mood} text={line.text} voice={line.text} autoSpeak size={60} className={className} />;
}

/** Playful empty state with the mascot. */
export function EmptyState({ text, mood = "confused", children }: { text: ReactNode; mood?: "confused" | "sleepy" | "happy" | "cool"; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-6 text-center">
      <CoachBubble mood={mood} text={text} size={56} className="text-left" />
      {children}
    </div>
  );
}
