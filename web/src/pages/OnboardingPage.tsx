import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createProfile } from "../lib/state";
import { update } from "../lib/store";
import { Mascot } from "../components/Mascot";

const schema = z.object({
  displayName: z.string().trim().min(1, "Cho mình xin cái tên để còn gọi chứ").max(80),
  targetScore: z.coerce.number().int().min(400, "Tối thiểu 400").max(990, "Tối đa 990"),
  dailyMinutesTarget: z.coerce.number().int().min(30, "Tối thiểu 30 phút").max(480),
});
type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export function OnboardingPage() {
  const form = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", targetScore: 800, dailyMinutesTarget: 150 },
  });
  const { errors } = form.formState;
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <form
        noValidate
        onSubmit={form.handleSubmit((v) => update((s) => createProfile(s, v)))}
        className="card animate-in w-full max-w-md overflow-hidden"
      >
        <div className="relative bg-brand-700 px-8 pb-8 pt-9 text-white">
          <div className="flex items-end gap-3">
            <span className="rounded-full bg-white p-1"><Mascot mood="happy" size={64} /></span>
            <p className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-800">Hi, mình là Tám. Mình sẽ cà khịa bạn tới 800 điểm.</p>
          </div>
          <p className="mt-5 text-sm font-medium text-white/80">TOEIC 400 → 800 · 8 tuần</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Học TOEIC không cần nghiêm túc như đi họp phụ huynh.</h1>
          <p className="mt-2 text-sm text-white/90">Nhưng điểm số thì phải nghiêm túc. Tiến độ được lưu ngay trong trình duyệt này, Ngày 1 bắt đầu từ hôm nay.</p>
        </div>
        <div className="space-y-4 p-8">
          <label className="block text-sm font-medium text-slate-700">
            Gọi bạn là gì?
            <input className="field mt-1" autoComplete="name" {...form.register("displayName")} />
            {errors.displayName && <span className="text-xs text-rose-600">{errors.displayName.message}</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700">
              Điểm mục tiêu
              <input className="field mt-1" type="number" inputMode="numeric" {...form.register("targetScore")} />
              {errors.targetScore && <span className="text-xs text-rose-600">{errors.targetScore.message}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Phút học mỗi ngày
              <input className="field mt-1" type="number" inputMode="numeric" {...form.register("dailyMinutesTarget")} />
              {errors.dailyMinutesTarget && (
                <span className="text-xs text-rose-600">{errors.dailyMinutesTarget.message}</span>
              )}
            </label>
          </div>
          <button className="btn-primary w-full !py-3">Vào bootcamp thôi</button>
        </div>
      </form>
    </main>
  );
}
