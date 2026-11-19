// The voice of the app: a bank of short lines per situation, tagged with how spicy they are.
//
// Adding a line: append `[spice, "text"]` (or `[spice, "text", mood]`) to its context.
//   spice 0 = neutral, used when the learner turns humour off
//   spice 1 = cà khịa nhẹ
//   spice 2 = cà khịa mạnh, nói lái (e.g. "hốt dọc" = học dốt, "mịt tù" = mù tịt, "ốm ai yêu" = yếu ai ôm)
//   spice 3 = cực mạnh: rude words only as nói lái or minced oaths ("đá mù", "đậu xanh rau má")
// Placeholders: {name}, {n}, {skill}, {day}, {level}, {title}, {badge}.
//
// Rules for writers: the owner wants hard roasting of the learner's answers and study habits. Swear only
// through nói lái or minced oaths, never a plain rude word. No jokes about looks, body, family, money,
// gender or where someone is from. Keep TOEIC knowledge out of here: explanations stay in the content files.

export type Mood = "happy" | "proud" | "cool" | "neutral" | "confused" | "sad" | "helpless" | "sleepy";

export type VoiceContext =
  | "login"
  | "login_morning"
  | "login_night"
  | "start"
  | "correct"
  | "correct_fast"
  | "correct_comeback"
  | "combo"
  | "wrong"
  | "wrong_streak"
  | "wrong_skill"
  | "grind"
  | "done"
  | "done_perfect"
  | "done_rough"
  | "day_done"
  | "comeback"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "streak_more"
  | "all_quests"
  | "level_up"
  | "badge"
  | "record"
  | "quest_done"
  | "weekly_done"
  | "first_day";

type Row = readonly [spice: 0 | 1 | 2 | 3, text: string, mood?: Mood];

/** Mood used when a line does not set its own. */
export const DEFAULT_MOOD: Record<VoiceContext, Mood> = {
  login: "happy",
  login_morning: "happy",
  login_night: "sleepy",
  start: "cool",
  correct: "happy",
  correct_fast: "cool",
  correct_comeback: "proud",
  combo: "cool",
  wrong: "confused",
  wrong_streak: "helpless",
  wrong_skill: "confused",
  grind: "sad",
  done: "proud",
  done_perfect: "cool",
  done_rough: "neutral",
  day_done: "proud",
  comeback: "sad",
  streak_3: "happy",
  streak_7: "proud",
  streak_30: "cool",
  streak_more: "proud",
  all_quests: "cool",
  level_up: "proud",
  badge: "proud",
  record: "cool",
  quest_done: "happy",
  weekly_done: "proud",
  first_day: "happy",
};

export const LINES: Record<VoiceContext, readonly Row[]> = {
  login: [
    [0, "Chào {name}, sẵn sàng học tiếp chưa?"],
    [0, "Chào mừng {name} quay lại. Bài hôm nay đã sẵn sàng."],
    [1, "Ơ, {name} còn nhớ đường vào app à? Tưởng lạc trôi luôn rồi."],
    [1, "Mở app rồi thì học đi, đừng mở cho có rồi tắt nha {name}."],
    [2, "Lại là {name}. Hôm qua sai bao nhiêu câu, hôm nay định sai tiếp à?"],
    [2, "Vào học đi chứ nằm đó lướt mãi thì yếu ai ôm, à nhầm, ốm ai yêu đâu."],
    [2, "TOEIC không tự lên điểm đâu, nó chỉ tự lên giá lệ phí thôi."],
    [3, "Đậu xanh rau má, cuối cùng cũng chịu mở app rồi."],
    [3, "Học hành kiểu này mà đòi 800, Tám nghe xong tiên đức luôn á. Nói lái nha."],
  ],
  login_morning: [
    [0, "Chào buổi sáng {name}. Học buổi sáng nhớ lâu hơn đấy."],
    [1, "Sáng sớm đã mở app, mặt trời mọc đằng tây à?"],
    [2, "Mắt nhắm mắt mở vẫn vào học, thôi được, Tám tạm công nhận."],
    [3, "Sáng ra chưa đánh răng đã học, ý chí ghê, mùi thì chưa biết."],
  ],
  login_night: [
    [0, "Chào buổi tối {name}. Học một chút rồi nghỉ sớm nhé."],
    [1, "Giờ này còn chưa ngủ, chắc ban ngày lướt hết quota rồi ha."],
    [2, "Cú đêm học bài à? Học thì học, đừng vừa học vừa ngủ gật nha."],
    [3, "Nửa đêm mới nhớ ra còn bài, đúng chuẩn nước đến chân mới nhảy."],
  ],
  first_day: [
    [0, "Ngày đầu tiên. Bắt đầu từ bước 1 là được."],
    [1, "Ngày đầu tiên, gà mờ chính hiệu, à không, gờ mà chính hiệu. Nói lái thôi."],
    [2, "Chào tân binh. Hôm nay còn gà, mai bớt gà, tháng sau hết gà. Hy vọng vậy."],
    [3, "Ngày 1 mà đã đòi 800? Ăn cơm còn phải ăn từng miếng nha."],
  ],
  start: [
    [0, "Bắt đầu thôi. Làm từng câu một, không cần vội."],
    [1, "Vào trận. Lần này đọc đề cho kỹ giùm Tám cái."],
    [2, "Cất điện thoại, mở não. À quên, nhớ kiểm tra não còn pin không."],
    [2, "Mười lăm phút thôi, ngắn hơn một tập phim mà cũng than à?"],
    [3, "Bắt đầu nè. Sai nhiều quá là bị gọi là hốt dọc đó nha. Tự lái đi."],
  ],
  correct: [
    [0, "Chính xác."],
    [0, "Đúng rồi. Tiếp tục nhé."],
    [1, "Đúng rồi á? Khoanh bừa mà trúng cũng là một loại tài năng."],
    [1, "Đúng. Hôm nay ăn gì mà khôn đột xuất vậy?"],
    [2, "Đúng rồi, nhưng đừng vội ảo tưởng sức mạnh nha."],
    [2, "Chuẩn. Não vừa chịu khởi động sau ba câu đầu."],
    [2, "Đúng câu này thì bớt gà được nửa giây. Cố lên."],
    [3, "Đúng luôn hả? Ai gõ đầu bạn mà tỉnh dữ vậy."],
    [3, "Trúng rồi. Hết đá cầu chưa? Lái lại thử xem."],
  ],
  correct_fast: [
    [0, "Đúng và nhanh. Tốt lắm."],
    [1, "Nhanh dữ, chắc sợ hết giờ bị Tám mắng."],
    [2, "Nhanh như người yêu cũ trả lời tin nhắn người mới."],
    [3, "Đúng mà còn nhanh, chắc đề này bạn gặp trong mơ rồi."],
  ],
  correct_comeback: [
    [0, "Đúng rồi, bạn đã lấy lại nhịp."],
    [1, "Ồ, cuối cùng cũng đúng. Tám tưởng phải đợi tới mùa sau."],
    [2, "Sai cả rổ rồi mới đúng một câu, thôi cũng mừng."],
    [3, "Từ thuộc cua lật kèo thành thắng. Lái chữ đầu là biết nãy giờ thế nào."],
    [2, "Đúng nhận sai cãi là không được, nhưng sai rồi sửa đúng thì Tám khen."],
  ],
  combo: [
    [0, "{n} câu đúng liên tiếp."],
    [1, "{n} câu đúng liền. Bật hack hay thật đó?"],
    [2, "Combo {n}! Tiếp đi, đừng để câu sau làm bể kèo."],
    [3, "Combo x{n}. Hôm nay đáp án sai không có cửa, kể cả bạn."],
  ],
  wrong: [
    [0, "Chưa đúng. Đọc giải thích bên dưới nhé."],
    [0, "Câu này chưa đúng. Xem lại đáp án và lý do."],
    [1, "Sai rồi. Đọc lại giải thích đi, đừng lướt."],
    [1, "Bẫy cũ người mới, à không, bẫy cũ người cũ luôn."],
    [2, "Sai kiểu này thì kiến thức hơi mịt tù rồi. Lái thử là hiểu."],
    [2, "Đáp án này đi vào lòng đất, kéo cả điểm của bạn theo."],
    [2, "Câu dễ vậy mà cũng sai, chắc dạo này chơi đá cầu nhiều. Lái lại đi."],
    [2, "Sai hoài vậy là yếu ai ôm, à nhầm, ốm ai yêu đó nha."],
    [3, "Đá mù, câu này mà cũng sai. Nói lái thôi chứ Tám không chửi."],
    [3, "Nhìn đáp án này mà Tám muốn đổ bình mực luôn. Lái chữ đi."],
    [3, "Sai kiểu này đúng là đối thần. Tự lái, Tám không nói thẳng."],
    [2, "Sai câu này thì trí thông minh hôm nay hơi giản zị rồi nha."],
    [3, "Đáp án này đúng kiểu tôm sông thủy tức sứa biển: nổi lềnh phềnh mà không có não."],
  ],
  wrong_streak: [
    [0, "Vài câu chưa đúng liên tiếp. Chậm lại và đọc kỹ giải thích nhé."],
    [1, "Sai liên tục rồi đó. Chậm lại, đọc kỹ đề giùm."],
    [2, "Chuỗi sai dài hơn chuỗi tin nhắn không được trả lời."],
    [2, "Tiếp tục thế này thì phòng thi gọi bạn là hốt dọc. Lái đi rồi biết."],
    [3, "Đậu xanh rau má, sai thêm câu nữa là Tám bỏ nhà đi bụi."],
    [3, "Sai liền mấy câu, Tám sắp tiên đức rồi đó. Lái lại nha."],
    [2, "Đầu óc bay cao quá rồi, không khí trên đó loãng hay sao mà sai liền mấy câu?"],
    [2, "Đoán bừa hoài là phong lan tầm gửi đó, sống nhờ may mắn chứ không nhờ kiến thức."],
  ],
  wrong_skill: [
    [0, "Bạn đang sai nhiều ở dạng {skill}. Xem lại mẹo bên dưới."],
    [1, "Lại {skill}. Dạng này với bạn đúng là oan gia."],
    [2, "{skill} đánh bạn mấy lần rồi mà chưa chừa à. Đọc mẹo đi."],
    [3, "Gặp {skill} là ngã, gặp lại vẫn ngã. Mẹo đây, đọc kỹ kẻo mịt tù tiếp."],
  ],
  grind: [
    [0, "Bạn đã làm nhiều câu. Nếu mệt, nghỉ vài phút rồi quay lại sẽ hiệu quả hơn."],
    [1, "Sai nhiều mà vẫn cày, lì đòn thật."],
    [2, "Não bốc khói rồi kìa. Nghỉ năm phút rồi quay lại sai tiếp, à nhầm, đúng tiếp."],
    [3, "Cày tới mức này mà điểm chưa lên, chắc não đang tải chậm. Nghỉ xíu đi."],
  ],
  done: [
    [0, "Hoàn thành bài. Tiến độ đã được lưu."],
    [1, "Xong bài. Bớt gà được một chút xíu xiu."],
    [2, "Xong rồi. Thưởng năm phút lướt TikTok, không phải năm tiếng nha."],
    [3, "Xong! Hôm nay chưa thuộc cua là may rồi đó. Lái lại xem."],
  ],
  done_perfect: [
    [0, "Đúng tất cả. Rất tốt."],
    [1, "Không sai câu nào. Đề dễ quá hay bạn giỏi thật?"],
    [2, "Full điểm. Thôi được rồi, hôm nay tạm cho làm trùm."],
    [3, "Một trăm phần trăm. Tám không cà khịa được nữa, tức ghê."],
  ],
  done_rough: [
    [0, "Xong bài. Các câu sai đã được lưu vào Sổ lỗi để ôn lại."],
    [1, "Xong bài nhưng hơi thảm. Câu sai nằm hết trong Sổ lỗi rồi."],
    [2, "Bài này bạn thuộc cua đậm. Lái lại rồi vào Sổ lỗi ôn đi."],
    [3, "Kết quả này mà đem đi thi là tạch nha. Ôn Sổ lỗi ngay giùm."],
    [2, "Bài này làm kiểu ăn nói xà lơ, đáp án chẳng theo logic nào. Ôn Sổ lỗi đi."],
  ],
  day_done: [
    [0, "Bạn đã hoàn thành bài học hôm nay."],
    [1, "Xong ngày {day}. Mai còn nữa, đừng tưởng thoát."],
    [2, "Hết bài hôm nay. Được phép flex, nhưng flex nhỏ thôi."],
    [3, "Xong ngày {day}. Mai mà bỏ học là Tám réo tên đó."],
  ],
  comeback: [
    [0, "Đã vài ngày bạn chưa học. Bắt đầu lại với một bước nhỏ nhé."],
    [1, "Mất tích mấy ngày, tưởng bạn đổi sang thi IELTS rồi."],
    [2, "Bỏ học mấy ngày, từ vựng bay hết rồi kìa. Quay lại cày đi."],
    [3, "Đi đâu mấy hôm? Bỏ bê vậy là ốm ai yêu đó. Học lại mau."],
  ],
  streak_3: [
    [0, "3 ngày học liên tiếp."],
    [1, "Ba ngày liên tiếp. Mới ba ngày thôi, đừng vội tự hào."],
    [2, "Ba ngày rồi. Coi chừng ngày thứ tư lại lười."],
  ],
  streak_7: [
    [0, "7 ngày học liên tiếp."],
    [1, "Bảy ngày không nghỉ. Thôi được, cũng ra gì đó."],
    [2, "Một tuần liền. Ai bắt cóc bạn rồi thay người chăm vậy?"],
  ],
  streak_30: [
    [0, "30 ngày học liên tiếp."],
    [1, "Ba mươi ngày. Kỷ luật kiểu này Tám hết chỗ cà khịa."],
    [2, "Ba mươi ngày liên tiếp. Chính thức là con nhà người ta."],
  ],
  streak_more: [
    [0, "Chuỗi {n} ngày học liên tiếp."],
    [1, "Chuỗi {n} ngày. Đứt chuỗi là Tám cười cho đó."],
    [2, "{n} ngày rồi. Bỏ một hôm thôi là về số không, đau lắm."],
    [3, "{n} ngày liên tiếp. Đứt chuỗi mà Tám biết là bị réo cả tuần."],
  ],
  all_quests: [
    [0, "Bạn đã hoàn thành tất cả nhiệm vụ hôm nay."],
    [1, "Hết nhiệm vụ rồi. Hôm nay chăm bất thường."],
    [2, "Clear sạch quest. Hôm nay cho làm nhân vật chính."],
    [3, "Full quest. Giờ được nằm lướt điện thoại mà không bị Tám chửi, à nhầm, nhắc."],
  ],
  level_up: [
    [0, "Lên cấp {level}: {title}."],
    [1, "Lên level {level}: {title}. Đừng vội phổng mũi."],
    [2, "Level {level}! Danh hiệu {title}, nghe kêu hơn thực lực một xíu."],
    [3, "Level {level}, {title}. Lên cấp rồi mà sai nữa là mất mặt lắm đó."],
  ],
  badge: [
    [0, "Mở khóa huy hiệu: {badge}."],
    [1, "Huy hiệu mới: {badge}. Đeo vào cho oai."],
    [2, "Nhặt được {badge}. Flex đi, nhưng đừng flex quá đà."],
  ],
  record: [
    [0, "Kỷ lục mới."],
    [1, "Kỷ lục mới. Bản thân hôm qua đang tức tưởi."],
    [2, "Phá kỷ lục rồi. Giờ phá tiếp đi, đừng ngủ quên trên chiến thắng."],
  ],
  quest_done: [
    [0, "Hoàn thành nhiệm vụ."],
    [1, "Xong một nhiệm vụ. XP về túi, đừng tiêu hoang."],
    [2, "Quest xong. Còn mấy cái nữa, đừng tưởng thế là đủ."],
  ],
  weekly_done: [
    [0, "Hoàn thành thử thách tuần."],
    [1, "Xong thử thách tuần. Cũng không đến nỗi."],
    [2, "Thử thách tuần bị xử gọn. Tuần sau Tám ra đề khó hơn cho chừa."],
  ],
};
