import { Link } from "react-router-dom";
import { planForDay } from "../data/dailyPlan";
import { packByDay } from "../data/dayPacks";
import { PROGRAM_DAYS } from "../domain/progress";
import { buildJourney, minutesLeft, nextStep } from "../lib/journey";
import { useAppState } from "../lib/store";
import { CoachBubble } from "../components/Mascot";
import { StudyAheadButton } from "../components/StudyAhead";
import { useCopy, useLine } from "../voice/useVoice";

/** The guided session for the current day: steps in order, one-click resume, clear completion. */
export function TodayPage() {
  const state = useAppState();
  const day = state.progress.day;
  const plan = planForDay(day);
  const pack = packByDay.get(day);
  const steps = buildJourney(state);
  const next = nextStep(steps);
  const doneCount = steps.filter((s) => s.done).length;
  // Required steps all done (optional ones like "Ôn câu sai" may remain): the next day can open now.
  const requiredDone = steps.every((s) => s.done || s.optional);
  const t = useCopy();
  const line = useLine(next ? "start" : "day_done", { day });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="text-sm font-medium text-brand-700">Tuần {plan.week} · Ngày {day}/{PROGRAM_DAYS}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{pack?.theme ?? plan.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{plan.title}</p>
      </header>

      <CoachBubble mood={line.mood} voice={line.text} text={next && doneCount === 0 ? `${line.text} ${t("taskPending")}` : line.text} />

      <section className="card p-5" aria-label="Tiến độ hôm nay">
        <div className="flex items-center gap-2" aria-hidden>
          {steps.map((s, i) => (
            <div key={s.kind} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  s.done ? "bg-brand-700 text-white" : s === next ? "bg-p-mint text-brand-800 ring-2 ring-brand-500" : "bg-slate-100 text-slate-400"
                }`}
              >
                {s.done ? "✓" : s.n}
              </span>
              {i < steps.length - 1 && <span className={`h-0.5 flex-1 rounded ${s.done ? "bg-brand-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Đã xong <strong className="text-slate-900">{doneCount}/{steps.length}</strong> bước
          {next ? ` · còn khoảng ${minutesLeft(steps)} phút` : ""}
        </p>
        {next ? (
          <>
            <Link to={next.to} className="btn-primary mt-4 w-full !py-3 text-base sm:w-auto">
              ▶ {doneCount === 0 ? t("startToday") : t("continue")}: Bước {next.n} · {next.title}
            </Link>
            {requiredDone && <StudyAheadButton day={day} className="mt-2 w-full sm:ml-2 sm:w-auto" />}
          </>
        ) : (
          <div role="status" className="mt-4 rounded-xl bg-p-mint p-4 text-sm text-brand-800">
            <strong>Xong Ngày {day}!</strong>{" "}
            {day < PROGRAM_DAYS ? `Ngày ${day + 1} tự mở vào ngày mai, hoặc học vượt luôn nếu còn sức.` : "Bạn đã đi hết lộ trình 56 ngày."} Còn dư năng lượng thì ôn từ,
            làm nốt nhiệm vụ ngày hoặc bắn vài con gà từ vựng.
            <div className="mt-3 flex flex-wrap gap-2">
              <StudyAheadButton day={day} />
              <Link to="/vocab" className="btn-ghost !py-1.5">Ôn từ vựng</Link>
              <Link to="/progress" className="btn-ghost !py-1.5">Xem tiến độ</Link>
            </div>
          </div>
        )}
      </section>

      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.kind} className={`card flex flex-wrap items-center gap-3 p-4 ${s === next ? "ring-2 ring-brand-300" : ""}`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${s.tone}`} aria-hidden>
              {s.done ? "✅" : s.icon}
            </span>
            <div className="min-w-[10rem] flex-1">
              <p className="font-semibold text-slate-900">
                Bước {s.n} · {s.title}
                {s.optional && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Tùy chọn</span>}
                {s.done && <span className="ml-2 text-xs font-medium text-brand-700">Đã xong</span>}
              </p>
              <p className="text-sm text-slate-500">{s.detail} · ~{s.minutes} phút</p>
            </div>
            <Link to={s.to} className={s.done ? "btn-ghost !py-2" : "btn-primary !py-2"}>
              {s.done ? t("retry") : t("doIt")}
            </Link>
          </li>
        ))}
      </ol>

      <details className="card p-5">
        <summary className="cursor-pointer font-semibold">📘 3 ý chính cần nhớ hôm nay</summary>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {plan.lesson.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-p-mint text-xs font-bold text-brand-800">{i + 1}</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </details>

      <p className="text-xs text-slate-500">
        Bận thì cứ dừng giữa chừng: bước nào xong đã được lưu, lần sau bấm tiếp là học tiếp. Xem cả lộ trình ở <Link to="/plan" className="underline">Lộ trình 56 ngày</Link>.
      </p>
    </div>
  );
}
