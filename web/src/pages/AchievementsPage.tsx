import { CoachBubble } from "../components/Mascot";
import { LevelCard, QuestCard } from "../components/GameCards";
import { BADGES, levelTitle, XP, xpForLevel } from "../lib/gamify";
import { useAppState } from "../lib/store";
import { useHumor } from "../voice/useVoice";

const LEVEL_MILESTONES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];

export function AchievementsPage() {
  const state = useAppState();
  const humor = useHumor();
  const unlocked = BADGES.filter((b) => state.game.badges[b.id]);
  const total = BADGES.length;

  const intro =
    humor === "off"
      ? `Bạn đã mở khóa ${unlocked.length}/${total} huy hiệu.`
      : unlocked.length === 0
        ? "Tủ huy hiệu còn trống trơn như ví cuối tháng. Học một bài là có cái đầu tiên liền."
        : unlocked.length === total
          ? "Full tủ huy hiệu. Bạn chính thức là con nhà người ta."
          : `${unlocked.length}/${total} huy hiệu. Mấy cái có dấu ??? là bí mật, tự khám phá nha.`;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Thành tích</h1>
        <p className="mt-1 text-sm text-slate-500">XP chỉ được cộng khi bạn thật sự làm bài, ôn từ hoặc xong nhiệm vụ.</p>
      </header>

      <CoachBubble mood={unlocked.length === 0 ? "confused" : "proud"} text={intro} />

      <div className="grid gap-5 md:grid-cols-2">
        <LevelCard state={state} />
        <QuestCard state={state} />
      </div>

      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className="text-lg font-bold">Huy hiệu</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const at = state.game.badges[b.id];
            const hidden = b.secret && !at;
            return (
              <li key={b.id} className={`card flex gap-3 p-4 ${at ? "" : "opacity-70"}`}>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${at ? "bg-p-cream" : "bg-slate-100 grayscale"}`} aria-hidden>
                  {hidden ? "❔" : b.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{hidden ? "???" : b.name}</p>
                  <p className="text-xs text-slate-500">{at ? b.flavor : b.how}</p>
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    {at ? `Mở khóa ${new Date(at).toLocaleDateString("vi-VN")}` : `+${b.xp} XP`}
                    {b.secret && <span className="ml-2 rounded-full bg-p-purple px-2 py-0.5 text-[11px] text-purple-800">Bí mật</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-5" aria-labelledby="xp-rules">
        <h2 id="xp-rules" className="font-bold">Cách kiếm XP</h2>
        <ul className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
          <li>Trả lời đúng: +{XP.correct} XP · sai: +{XP.wrong} XP (vẫn có công)</li>
          <li>Học hoặc ôn một từ: +{XP.word} XP</li>
          <li>Xong một bước của bài hôm nay: +{XP.step} XP</li>
          <li>Mini test cuối tuần: +{XP.miniTest} XP</li>
          <li>Mỗi nhiệm vụ ngày: +{XP.quest} XP, xong cả 3: +{XP.allQuests} XP</li>
          <li>Thử thách tuần: +{XP.weekly} XP</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">XP luyện tập (trả lời + ôn từ) tối đa {XP.practiceCapPerDay}/ngày, nên làm lại một bài nhiều lần không “cày” được XP.</p>
        <h3 className="mt-4 text-sm font-semibold">Danh hiệu theo level</h3>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {LEVEL_MILESTONES.map((l) => (
            <li key={l} className={`rounded-full px-3 py-1 ${state.game.xp >= xpForLevel(l) ? "bg-p-mint text-brand-800" : "bg-slate-100 text-slate-500"}`}>
              Lv {l} · {levelTitle(l)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
