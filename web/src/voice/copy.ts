// UI microcopy: empty states, loading, buttons. Each key has a plain version (humour off) and
// playful variants. Technical errors, data loss and backups are NOT here on purpose: those
// messages stay plain and precise in the pages that show them.
import type { HumorLevel, Vars } from "./engine";
import { fill } from "./engine";

type Entry = { plain: string; fun: string[] };

export const COPY = {
  empty: { plain: "Chưa có dữ liệu.", fun: ["Trống trơn như ví cuối tháng.", "Chưa có gì ở đây hết trơn."] },
  loading: { plain: "Đang tải…", fun: ["Đợi xíu, não đang khởi động…", "Đang load, đừng đi đâu nha…"] },
  notFound: { plain: "Không tìm thấy kết quả.", fun: ["Ủa, tìm mãi không thấy luôn.", "Lục tung cả app mà không thấy."] },
  taskPending: { plain: "Chưa hoàn thành bài học.", fun: ["Task còn đó, đừng giả vờ không thấy.", "Bài hôm nay vẫn đang ngồi chờ bạn."] },
  noScore: {
    plain: "Chưa có điểm. Điểm ước lượng sẽ xuất hiện sau Mini test cuối tuần đầu tiên (Ngày 7).",
    fun: ["Chưa có điểm, trống trơn như ví cuối tháng. Mini test Ngày 7 sẽ cho bạn con số đầu tiên."],
  },
  noDueWords: {
    plain: "Không có từ nào đến hạn ôn. Đã học {n} từ.",
    fun: ["Hết từ cần ôn rồi, não được nghỉ giải lao. Đã học {n} từ.", "Từ vựng hôm nay đã ngoan ngoãn hết. Đã học {n} từ."],
  },
  dueWords: { plain: "{n} từ đến hạn ôn hôm nay.", fun: ["{n} từ đang chờ được bạn ghé thăm.", "{n} từ sắp bị quên, cứu chúng nó đi."] },
  noWeakness: {
    plain: "Chưa đủ dữ liệu. Sau vài bài luyện, các dạng bạn hay sai sẽ hiện ở đây.",
    fun: ["Chưa soi được điểm yếu nào. Làm vài bài đi rồi mình mách cho."],
  },
  noErrors: {
    plain: "Chưa có câu sai nào. Khi làm bài Nghe, Đọc hoặc kiểm tra, câu sai sẽ tự lưu vào đây.",
    fun: ["Sổ lỗi trắng tinh. Hoặc bạn quá giỏi, hoặc bạn chưa làm bài nào."],
  },
  noErrorsDue: { plain: "Không có câu nào đến hạn ôn.", fun: ["Không có câu sai nào đến hạn. Sổ lỗi đang ngủ trưa."] },
  noFilterMatch: { plain: "Không có câu nào khớp bộ lọc.", fun: ["Ủa, tìm mãi không thấy luôn. Thử bộ lọc khác nhé."] },
  noAttempts: {
    plain: "Chưa có bài làm nào. Hoàn thành bài Nghe hoặc Đọc đầu tiên để xem.",
    fun: ["Trống trơn như ví cuối tháng. Làm bài Nghe hoặc Đọc đầu tiên đi rồi có số liệu."],
  },
  startToday: { plain: "Bắt đầu học hôm nay", fun: ["Vào việc thôi", "Bắt đầu chiến thôi"] },
  continue: { plain: "Tiếp tục", fun: ["Học tiếp nè", "Chiến tiếp"] },
  next: { plain: "Câu tiếp →", fun: ["Câu tiếp →", "Next câu →"] },
  finish: { plain: "Xong", fun: ["Xong, nghỉ xíu", "Chốt đơn"] },
  retry: { plain: "Làm lại", fun: ["Làm lại", "Phục thù"] },
  doIt: { plain: "Làm", fun: ["Vào làm", "Xử lý"] },
} satisfies Record<string, Entry>;

export type CopyKey = keyof typeof COPY;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Text for a key; stable within a day so labels do not flicker on re-render. */
export function copy(key: CopyKey, humor: HumorLevel, vars?: Vars, now: Date = new Date()): string {
  const e: Entry = COPY[key];
  if (humor === "off" || e.fun.length === 0) return fill(e.plain, vars);
  const pool = humor === "chill" ? e.fun.slice(0, 1) : e.fun;
  return fill(pool[hash(now.toDateString() + key) % pool.length]!, vars);
}
