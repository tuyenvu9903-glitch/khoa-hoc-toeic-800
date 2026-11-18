// Day-by-day lesson plan for the 8-week program: what to learn (short lesson notes)
// and which practice each mission links to.
import { packByDay } from "./dayPacks";
import type { VocabTopic } from "./vocabulary";

export type DayPlan = {
  day: number;
  week: number;
  title: string;
  /** Key points to learn today (the "học" part of the day). */
  lesson: string[];
  vocabTopic: VocabTopic;
  /** Part 5 skill code drilled in the grammar mission. */
  grammar: string;
  listeningPart: "2" | "3" | "4";
  readingPart: "5" | "7";
  /** Weekend checkpoint days take the mini test. */
  test?: boolean;
};

type Row = [title: string, lesson: string[], vocab: VocabTopic, grammar: string, listening: "2" | "3" | "4", reading: "5" | "7", test?: boolean];

const G = (s: string) => `R.P5.${s}`;

const rows: Row[] = [
  // ---- Week 1: Nền tảng — format, Part 2, Part 5 cơ bản
  ["Làm quen đề TOEIC", [
    "Đề Listening & Reading: 200 câu, 120 phút. Nghe 100 câu (Part 1–4, 45 phút), Đọc 100 câu (Part 5–7, 75 phút).",
    "Mục tiêu 800 ≈ Nghe 420 + Đọc 380: cần đúng khoảng 85/100 câu nghe và 78/100 câu đọc.",
    "Part 5 (30 câu): mỗi câu chỉ nên mất 20–30 giây. Đọc đáp án trước để biết câu hỏi về từ loại, thì hay từ vựng.",
  ], "workplace", G("wordform"), "2", "5"],
  ["Từ loại: danh – tính – trạng", [
    "Đuôi danh từ: -tion, -ment, -ness, -ity, -ance. Tính từ: -ive, -ful, -able, -al, -ous. Trạng từ: thường là tính từ + -ly.",
    "Vị trí: sau a/the/tính từ sở hữu → danh từ; trước danh từ hoặc sau to be → tính từ; bổ nghĩa động từ → trạng từ.",
    "Part 2: nghe kỹ TỪ ĐẦU câu hỏi (Who/What/Where…). Bỏ qua đáp án lặp lại từ trong câu hỏi, vì đó thường là bẫy.",
  ], "office", G("wordform"), "2", "5"],
  ["Thì hiện tại", [
    "Hiện tại đơn: thói quen, lịch trình (usually, every day). Hiện tại tiếp diễn: đang xảy ra (now, currently).",
    "Hiện tại hoàn thành: have/has + V3, đi với since, for, already, yet, recently.",
    "Part 2 câu Where/When: Where → địa điểm hoặc người giữ đồ; When → mốc thời gian. Đáp án Yes/No luôn sai với câu hỏi Wh-.",
  ], "schedule", G("tense"), "2", "5"],
  ["Hòa hợp chủ ngữ – động từ", [
    "Tìm chủ ngữ CHÍNH, bỏ qua cụm \"of + N\" ở giữa: The results of the survey ARE …",
    "Each/Every/Everyone, The number of + N → số ít. A number of + N → số nhiều. Danh từ không đếm được (equipment, information) → số ít.",
    "Part 2 câu Why: \"Why don't we…?\" là lời đề nghị, không hỏi lý do. Đáp án có \"Because\" thường là bẫy.",
  ], "meeting", G("sva"), "2", "5"],
  ["Giới từ thời gian & nơi chốn", [
    "in + tháng/năm, on + ngày/thứ, at + giờ. by = trước hạn chót; until = kéo dài tới.",
    "during + danh từ (during the meeting); while + mệnh đề. between A and B, among (nhiều hơn 2).",
    "Part 2 câu Yes/No: đáp án đúng thường KHÔNG có Yes/No mà trả lời gián tiếp (\"Tôi sẽ làm chiều nay\").",
  ], "travel", G("prep"), "2", "5"],
  ["Liên từ và giới từ dễ nhầm", [
    "Although/Because/If + MỆNH ĐỀ (S + V). Despite/Because of/In spite of + DANH TỪ hoặc V-ing.",
    "Trạng từ nối đứng sau dấu chấm phẩy: however (trái ý), therefore (kết quả), moreover (thêm ý).",
    "Part 2 câu lựa chọn (A or B): chọn một bên, cả hai, hoặc phương án thứ ba. Không trả lời Yes/No.",
  ], "restaurant", G("conj"), "2", "5"],
  ["Ôn tập tuần 1 + Mini test", [
    "Làm mini test, rồi xem lại từng câu sai trong phần giải thích.",
    "Ghi lại 3 dạng hay sai nhất. Tuần 2 sẽ luyện sâu các dạng này.",
    "Ôn lại các từ vựng đến hạn trong mục Từ vựng.",
  ], "workplace", G("wordform"), "2", "5", true],

  // ---- Week 2: Ngữ pháp nâng cao + Part 2/5
  ["V-ing và to V", [
    "+ to V: decide, plan, want, hope, agree, offer, need, be required to.",
    "+ V-ing: avoid, suggest, consider, finish, enjoy, recommend; sau giới từ luôn là V-ing.",
    "Bẫy hay gặp: look forward to / be committed to / be used to + V-ing (to là giới từ).",
  ], "customer_service", G("gerund"), "2", "5"],
  ["Câu bị động", [
    "Công thức: be + V3. Chủ ngữ là vật hoặc người được tác động → bị động (The order WAS SHIPPED).",
    "Dấu hiệu: có \"by + người làm\", hoặc sau chỗ trống không có tân ngữ.",
    "Bị động theo thì: is done / was done / has been done / will be done.",
  ], "delivery", G("passive"), "2", "5"],
  ["Thì quá khứ & tương lai", [
    "Quá khứ đơn: yesterday, last week, ago, in 2020. Không dùng hiện tại hoàn thành với mốc quá khứ cụ thể.",
    "Quá khứ tiếp diễn: hành động đang xảy ra thì có hành động khác xen vào (when + quá khứ đơn).",
    "Tương lai: next week, tomorrow, upcoming. By + mốc tương lai → will have V3.",
  ], "schedule", G("tense"), "2", "5"],
  ["Từ loại nâng cao", [
    "Phân biệt danh từ người và vật: applicant / application, employee / employment, supervisor / supervision.",
    "Tính từ đuôi -ed (cảm thấy) và -ing (gây ra): interested / interesting.",
    "Trạng từ đứng giữa trợ động từ và động từ chính: has RECENTLY opened, will SOON announce.",
  ], "shopping", G("wordform"), "2", "5"],
  ["Cụm giới từ cố định", [
    "in charge of, responsible for, according to, in addition to, prior to, due to, on behalf of.",
    "experience in, interest in, increase in, demand for, access to, reply to.",
    "Part 2: câu trả lời \"Tôi không biết / Hỏi anh A đi / Chưa quyết định\" thường là đáp án ĐÚNG.",
  ], "office", G("prep"), "2", "5"],
  ["Hòa hợp chủ – vị nâng cao", [
    "Either A or B / Neither A nor B / Not only A but also B → động từ chia theo B.",
    "Mệnh đề quan hệ: động từ chia theo danh từ đứng trước who/which/that.",
    "Danh từ tập hợp (staff, team, committee): TOEIC thường dùng số ít khi nói cả nhóm.",
  ], "hotel", G("sva"), "2", "5"],
  ["Ôn tập tuần 2 + Mini test", [
    "Làm mini test. Mục tiêu: Part 5 đúng từ 70% trở lên.",
    "Mở Dashboard xem \"Top điểm yếu\", luyện lại riêng dạng đó trong trang Đọc.",
    "Ôn từ vựng đến hạn.",
  ], "meeting", G("conj"), "2", "5", true],

  // ---- Week 3: Part 3 + Part 4
  ["Part 3: đọc câu hỏi trước", [
    "Trong lúc đọc hướng dẫn, đọc trước 3 câu hỏi và gạch keyword (who, why, what will…).",
    "Thứ tự đáp án thường theo thứ tự hội thoại: câu 1 ở đầu, câu 3 ở cuối.",
    "Câu \"What is the conversation mainly about?\" → nghe kỹ 2 câu đầu.",
  ], "customer_service", G("tense"), "3", "7"],
  ["Part 3: câu hỏi chi tiết & paraphrase", [
    "Đáp án đúng hiếm khi lặp nguyên từ trong bài. Nó diễn đạt lại: short-staffed = not enough workers.",
    "Đáp án lặp đúng từ đã nghe thường là bẫy.",
    "Luyện: sau mỗi câu, đọc transcript và tìm câu gốc tương ứng với đáp án.",
  ], "office", G("wordform"), "3", "7"],
  ["Part 3: hành động tiếp theo & ý định", [
    "\"What will the man do next?\" → nghe câu cuối: I'll…, Let me…, I'm going to…",
    "Câu hỏi ý định (\"What does the woman mean when she says…?\"): hiểu ngữ cảnh, không hiểu theo nghĩa đen.",
    "Hội thoại 3 người: chú ý tên được gọi để biết ai nói gì.",
  ], "meeting", G("gerund"), "3", "7"],
  ["Part 4: thông báo & tin nhắn thoại", [
    "Thông báo (announcement): ở đâu (sân bay, cửa hàng), có chuyện gì, người nghe cần làm gì.",
    "Tin nhắn thoại: ai gọi, vì sao gọi, yêu cầu người nghe làm gì (please call me back…).",
    "Câu đầu tiên của bài nói thường trả lời câu hỏi mục đích.",
  ], "travel", G("passive"), "4", "7"],
  ["Part 4: quảng cáo & bài phát biểu", [
    "Quảng cáo: sản phẩm gì, điểm đặc biệt, ưu đãi (discount, free…), cách liên hệ.",
    "Bài phát biểu, giới thiệu: người nghe là ai (new employees, conference attendees…).",
    "Câu hỏi suy luận \"Who most likely…\": dựa vào từ vựng ngành nghề trong bài.",
  ], "shopping", G("prep"), "4", "7"],
  ["Part 3 + 4 tổng hợp", [
    "Luyện xen kẽ hội thoại và bài nói, nghe ở tốc độ \"Như thi thật\".",
    "Không dừng lại ở câu khó: chọn đại một đáp án rồi đọc trước câu hỏi của bài kế tiếp.",
    "Nghe lại các bài sai và nhắc theo (shadowing) để quen tốc độ.",
  ], "delivery", G("sva"), "3", "7"],
  ["Ôn tập tuần 3 + Mini test", [
    "Làm mini test. Mục tiêu: Part 3/4 đúng từ 70% trở lên.",
    "Xem lại transcript các câu sai, gạch chân chỗ paraphrase.",
    "Ôn từ vựng đến hạn.",
  ], "hotel", G("tense"), "4", "7", true],

  // ---- Week 4: Part 6 + Part 7
  ["Part 7: skimming & scanning", [
    "Đọc câu hỏi trước, gạch keyword (tên riêng, số, ngày), rồi scan tìm vị trí trong bài.",
    "Câu \"What is the purpose of…\" → đọc tiêu đề và 2 câu đầu.",
    "Thời gian: khoảng 1 phút mỗi câu hỏi. Bài đơn ngắn nên xong trong 2–3 phút.",
  ], "office", G("conj"), "4", "7"],
  ["Part 7: e-mail & thư", [
    "Xác định người gửi, người nhận, mục đích (thông báo, yêu cầu, xin lỗi, xác nhận).",
    "Câu hỏi \"What is X asked to do?\" → tìm câu please…, could you…, we ask that…",
    "Chú ý tệp đính kèm (attached, enclosed) và hạn chót (by Friday).",
  ], "workplace", G("passive"), "3", "7"],
  ["Part 7: quảng cáo & thông báo", [
    "Quảng cáo: đối tượng, ưu đãi, điều kiện (only, before, for orders over…).",
    "Câu \"What is NOT mentioned…\": đối chiếu từng đáp án với bài, loại dần.",
    "Thông báo: cái gì thay đổi, từ khi nào, ai bị ảnh hưởng.",
  ], "shopping", G("wordform"), "4", "7"],
  ["Part 7: chuỗi tin nhắn", [
    "Câu hỏi ý định (\"At 9:16, what does X mean…\"): đọc 1–2 tin nhắn trước và sau thời điểm đó.",
    "Văn phong thân mật: Will do = Tôi sẽ làm; Sounds good = Đồng ý.",
    "Chú ý ai hỏi, ai trả lời, ai nhận làm việc gì.",
  ], "schedule", G("gerund"), "3", "7"],
  ["Part 7: bài báo", [
    "Bài báo: câu đầu nêu ai/cái gì/khi nào/ở đâu. Các đoạn sau là chi tiết và trích dẫn.",
    "Câu hỏi về trích dẫn (\"According to Ms. X…\") → tìm đoạn có tên người đó.",
    "Từ đồng nghĩa (\"The word 'X' is closest in meaning to\"): thay vào câu xem có hợp nghĩa không.",
  ], "restaurant", G("prep"), "4", "7"],
  ["Quản lý thời gian phần Đọc", [
    "Phân bổ 75 phút: Part 5 ~10 phút, Part 6 ~8 phút, Part 7 ~55 phút.",
    "Câu Part 5 quá 30 giây → đoán rồi đi tiếp, đánh dấu để quay lại.",
    "Tô hết đáp án trước khi hết giờ: TOEIC không trừ điểm câu sai.",
  ], "customer_service", G("sva"), "2", "5"],
  ["Ôn tập tuần 4 + Mini test", [
    "Làm mini test. Đánh giá Part 7: mất bao nhiêu phút mỗi bài?",
    "Xem lại câu sai: sai do không tìm được thông tin hay do bẫy paraphrase?",
    "Ôn từ vựng đến hạn.",
  ], "travel", G("conj"), "3", "7", true],
];

// Weeks 5–8 cycle through all skills with mixed practice, harder each week.
const LATER_WEEKS: { theme: string; points: [string, string, string] }[] = [
  { theme: "Paraphrase", points: [
    "Mỗi câu sai, tìm cặp diễn đạt lại giữa bài và đáp án, ghi vào sổ (ví dụ: reimburse = pay back).",
    "Paraphrase hay gặp: động từ ↔ danh từ (decide ↔ decision), từ chung ↔ từ cụ thể (vehicle ↔ truck).",
    "Luyện xen kẽ Nghe và Đọc để quen cách TOEIC đổi cách nói.",
  ] },
  { theme: "Diệt điểm yếu", points: [
    "Mở \"Top điểm yếu\" trên Dashboard, luyện riêng dạng có điểm thấp nhất.",
    "Ôn nhật ký lỗi: làm lại các câu từng sai cho tới khi đúng.",
    "Ghi lại vì sao sai: thiếu từ vựng, ngữ pháp, nghe sót hay đọc ẩu?",
  ] },
  { theme: "700 → 800: câu khó", points: [
    "Câu khó Part 5: từ vựng gần nghĩa (affect/effect, rise/raise), cấu trúc đặc biệt.",
    "Part 3/4 câu có bảng biểu: nhìn bảng trước, dự đoán thông tin cần nghe.",
    "Luyện dưới áp lực thời gian: tốc độ nghe \"Như thi thật\", không nghe lại.",
  ] },
  { theme: "Mô phỏng phòng thi", points: [
    "Làm bài theo đúng thời gian thi, ngồi liền mạch, không dừng giữa chừng.",
    "Sau mỗi bài: xem lại câu sai, không học thêm kiến thức mới.",
    "Ngủ đủ, ôn từ vựng nhẹ nhàng; ngày trước khi thi không luyện đề nặng.",
  ] },
];
const CYCLE: { grammar: string; listening: "2" | "3" | "4"; reading: "5" | "7"; vocab: VocabTopic; label: string }[] = [
  { grammar: G("wordform"), listening: "2", reading: "5", vocab: "workplace", label: "Part 2 + Part 5" },
  { grammar: G("tense"), listening: "3", reading: "7", vocab: "meeting", label: "Part 3 + Part 7" },
  { grammar: G("sva"), listening: "4", reading: "7", vocab: "travel", label: "Part 4 + Part 7" },
  { grammar: G("prep"), listening: "2", reading: "5", vocab: "hotel", label: "Part 2 + Part 5" },
  { grammar: G("passive"), listening: "3", reading: "7", vocab: "delivery", label: "Part 3 + Part 7" },
  { grammar: G("gerund"), listening: "4", reading: "5", vocab: "customer_service", label: "Part 4 + Part 5" },
];

for (const [wi, w] of LATER_WEEKS.entries()) {
  for (const c of CYCLE) {
    rows.push([`${w.theme}: ${c.label}`, w.points, c.vocab, c.grammar, c.listening, c.reading]);
  }
  rows.push([`Ôn tập tuần ${wi + 5} + Mini test`, [
    "Làm mini test và so sánh điểm với tuần trước.",
    "Xem lại toàn bộ câu sai trong tuần.",
    "Nếu có điều kiện, làm thêm một đề thi thử full (Study4, ETS) và nhập điểm vào app.",
  ], "schedule", G("conj"), "3", "7", true]);
}

export const dailyPlan: DayPlan[] = rows.map(([title, lesson, vocabTopic, grammar, listeningPart, readingPart, test], i) => ({
  day: i + 1,
  week: Math.floor(i / 7) + 1,
  title,
  lesson,
  vocabTopic,
  grammar,
  listeningPart,
  readingPart,
  test,
}));

export function planForDay(day: number): DayPlan {
  return dailyPlan[Math.min(Math.max(day, 1), dailyPlan.length) - 1]!;
}

/** Practice link for each mission kind on a given day. */
export function missionLink(kind: string, plan: DayPlan): string | null {
  const pack = packByDay.has(plan.day);
  switch (kind) {
    case "vocab":
      return "/vocab";
    case "grammar":
      return pack ? "/reading?today=p5" : `/reading?part=5&skill=${plan.grammar}`;
    case "listening":
      return pack ? "/listening?today=1" : `/listening?part=${plan.listeningPart}`;
    case "reading":
      return pack ? "/reading?today=p7" : plan.readingPart === "5" ? "/reading?part=5" : "/reading?part=7";
    case "mini_test":
      return "/mini-test";
    default:
      return null;
  }
}
