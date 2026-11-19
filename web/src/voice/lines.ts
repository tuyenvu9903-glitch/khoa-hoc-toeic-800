// The voice of the app: a bank of short lines per situation, tagged with how spicy they are.
//
// Adding a line: append `[spice, "text"]` (or `[spice, "text", mood]`) to its context.
//   spice 0 = neutral, used when the learner turns humour off
//   spice 1 = friendly, a little playful
//   spice 2 = Gen Z, light teasing
//   spice 3 = full "lầy", still kind
// Placeholders: {name}, {n}, {skill}, {day}, {level}, {title}, {badge}.
//
// Rules for writers: tease the situation, never the person. No jokes about looks, intelligence,
// family or money troubles. Keep TOEIC knowledge out of here: explanations stay in the content files.

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
    [1, "Welcome back, {name}! TOEIC 800 đang đợi bạn xử lý."],
    [1, "Hello {name}, hôm nay mình cày nhẹ mà chắc nhé."],
    [2, "Ủa, nay chăm chỉ dữ ta?"],
    [2, "Lại gặp nhau rồi. IELTS không học, TOEIC cũng đừng bỏ nha."],
    [2, "{name} đã online. Đáp án sai bắt đầu run rồi đấy."],
    [3, "Vừa mở app là thấy mùi 800 điểm rồi đó {name}."],
    [3, "Lướt TikTok đủ chưa? Giờ lướt qua vài câu Part 5 nha."],
  ],
  login_morning: [
    [0, "Chào buổi sáng {name}. Học buổi sáng nhớ lâu hơn đấy."],
    [1, "Sáng sớm đã học, {name} đúng là có kế hoạch."],
    [2, "Cà phê chưa? Chưa thì làm câu Part 2 cho tỉnh."],
    [3, "Sáng ra đã mở app học, chắc hôm nay trời sập."],
  ],
  login_night: [
    [0, "Chào buổi tối {name}. Học một chút rồi nghỉ sớm nhé."],
    [1, "Học đêm cũng được, nhưng nhớ đi ngủ đúng giờ nha."],
    [2, "Giờ này còn học, chắc deadline dí hay crush nói thích người giỏi tiếng Anh?"],
    [3, "Cú đêm mode: ON. Học xong là đi ngủ, đừng lướt tiếp nha."],
  ],
  first_day: [
    [0, "Ngày đầu tiên. Bắt đầu từ bước 1 là được."],
    [1, "Ngày 1 của hành trình 800. Mọi cao thủ đều từng ở đây."],
    [2, "Ngày đầu đi học, chưa ai biết bạn sẽ thành trùm đâu. Trừ mình."],
    [3, "Chào tân binh! Hôm nay bớt gà, mai bớt gà hơn nữa."],
  ],
  start: [
    [0, "Bắt đầu thôi. Làm từng câu một, không cần vội."],
    [1, "Vào việc thôi, đừng để tiếng Anh nó bắt nạt."],
    [1, "Hôm nay xử đẹp mấy câu TOEIC nào."],
    [2, "15 phút thôi. Đừng viện lý do bận đi ngủ."],
    [2, "Tắt thông báo, mở não, vào trận."],
    [3, "Đề bài đã sẵn, đáp án sai đang đi trốn. Đi săn thôi."],
  ],
  correct: [
    [0, "Chính xác."],
    [0, "Đúng rồi. Tiếp tục nhé."],
    [1, "Chuẩn! ETS cũng phải gật gù."],
    [1, "Đúng rồi! Câu này không làm khó được bạn."],
    [2, "Ơ kìa, não hoạt động rồi!"],
    [2, "Slay! Câu này dễ như ăn bánh."],
    [2, "Đúng rồi! Hôm nay không phải ngày của đáp án sai."],
    [3, "Đúng luôn. Ai cho bạn giỏi vậy?"],
    [3, "Chuẩn không cần chỉnh. Đề bài đang xem lại bản thân."],
  ],
  correct_fast: [
    [0, "Đúng và nhanh. Tốt lắm."],
    [1, "Nhanh mà vẫn chuẩn, đúng tốc độ phòng thi."],
    [2, "Tốc độ này là ăn điểm Part 5 ngon lành đó."],
    [3, "Phản xạ nhanh hơn cả crush seen tin nhắn."],
  ],
  correct_comeback: [
    [0, "Đúng rồi, bạn đã lấy lại nhịp."],
    [1, "Gỡ lại rồi! Sai trước đúng sau mới là học thật."],
    [2, "Comeback đỉnh! Mấy câu sai lúc nãy coi như học phí."],
    [3, "Từ đáy xã hội lên đỉnh cao chỉ mất một câu. Respect."],
  ],
  combo: [
    [0, "{n} câu đúng liên tiếp."],
    [1, "Combo {n} câu đúng liên tiếp. Giữ phong độ nhé!"],
    [2, "{n} câu đúng liên tiếp. Có mùi cao thủ rồi đấy."],
    [3, "Combo x{n}! Đáp án sai đang xin rút lui."],
  ],
  wrong: [
    [0, "Chưa đúng. Đọc giải thích bên dưới nhé."],
    [0, "Câu này chưa đúng. Xem lại đáp án và lý do."],
    [1, "Sai một câu, tỉnh táo thêm một chút."],
    [1, "Bẫy này hơi hiểm. Nhưng lần sau đừng mắc nhé."],
    [2, "Ơ, đáp án này hơi đi vào lòng đất."],
    [2, "Não vừa lag nhẹ. Đọc giải thích rồi làm tiếp nào."],
    [3, "Câu này lừa bạn một vố. Ghi thù vào Sổ lỗi đi."],
    [3, "Sai rồi, nhưng sai bây giờ còn hơn sai trong phòng thi."],
  ],
  wrong_streak: [
    [0, "Vài câu chưa đúng liên tiếp. Chậm lại và đọc kỹ giải thích nhé."],
    [1, "Bình tĩnh, chúng ta đang học chứ không phải đi thi Olympic."],
    [2, "Đề bài không ghét bạn đâu. Chắc chắn đấy."],
    [2, "Hít thở sâu. Đọc chậm lại một nhịp là khác liền."],
    [3, "Chuỗi sai này hơi dài, nhưng chuỗi đúng sắp tới sẽ dài hơn."],
  ],
  wrong_skill: [
    [0, "Bạn đang sai nhiều ở dạng {skill}. Xem lại mẹo bên dưới."],
    [1, "Dạng {skill} đang làm khó bạn. Nhìn mẹo này rồi thử lại nhé."],
    [2, "Có vẻ {skill} đang có thù với bạn. Gỡ thù bằng mẹo dưới đây."],
    [3, "{skill} gài bạn mấy lần rồi đó. Đến lúc phản đòn."],
  ],
  grind: [
    [0, "Bạn đã làm nhiều câu. Nếu mệt, nghỉ vài phút rồi quay lại sẽ hiệu quả hơn."],
    [1, "Cày lâu rồi đó. Uống miếng nước rồi làm tiếp nhé."],
    [2, "Sai nhiều nhưng không bỏ cuộc, vậy là đang lên level thật đấy."],
    [3, "Não đang quá tải nhẹ. Nghỉ 5 phút, không ai trừ điểm đâu."],
  ],
  done: [
    [0, "Hoàn thành bài. Tiến độ đã được lưu."],
    [1, "Thêm một bước gần TOEIC 800."],
    [2, "Done! Một ngày bớt gà hơn hôm qua."],
    [2, "Nhiệm vụ hoàn thành. Có thể tự thưởng 5 phút lướt TikTok."],
    [3, "Thêm một bước gần TOEIC 800. Không phải gần người yêu nhé."],
  ],
  done_perfect: [
    [0, "Đúng tất cả. Rất tốt."],
    [1, "Không sai câu nào. Bài này quá dễ với bạn rồi."],
    [2, "Full điểm! Xin phép gọi bạn là trùm."],
    [3, "100% đúng. Đề bài đang xin số liên lạc của bạn."],
  ],
  done_rough: [
    [0, "Xong bài. Các câu sai đã được lưu vào Sổ lỗi để ôn lại."],
    [1, "Bài này hơi khó nhằn. Câu sai đã vào Sổ lỗi, ôn lại là nhớ."],
    [2, "Hơi trầy trật xíu, nhưng xong là xong. Sổ lỗi sẽ lo phần còn lại."],
    [3, "Trận này thua vài hiệp, nhưng trận chung kết còn ở phía trước."],
  ],
  day_done: [
    [0, "Bạn đã hoàn thành bài học hôm nay."],
    [1, "Xong ngày {day}! Mai gặp lại nhé."],
    [2, "Xong hết rồi. Hôm nay bạn được phép flex nhẹ."],
    [3, "Task hôm nay sạch bong. Ngày mai đến lượt task mới chịu trận."],
  ],
  comeback: [
    [0, "Đã vài ngày bạn chưa học. Bắt đầu lại với một bước nhỏ nhé."],
    [1, "Quay lại thôi, kiến thức đang nhớ bạn."],
    [2, "Mất tích hơi lâu rồi đấy. TOEIC không tự tăng điểm đâu."],
    [2, "Bạn và TOEIC đang trong giai đoạn yêu xa à?"],
    [3, "Biến mất mấy ngày làm từ vựng tưởng bị ghost. Quay lại học thôi."],
  ],
  streak_3: [
    [0, "3 ngày học liên tiếp."],
    [1, "3 ngày liên tiếp! Thói quen đang hình thành."],
    [2, "3 ngày liên tiếp. Có mùi chiến thần rồi đấy."],
  ],
  streak_7: [
    [0, "7 ngày học liên tiếp."],
    [1, "Tròn 1 tuần không nghỉ. Giỏi đấy!"],
    [2, "7 ngày rồi! Không phải dạng vừa đâu."],
  ],
  streak_30: [
    [0, "30 ngày học liên tiếp."],
    [1, "30 ngày chăm chỉ. Một tháng kỷ luật thật sự."],
    [2, "30 ngày chăm chỉ. Xin phép gọi bạn là con nhà người ta."],
  ],
  streak_more: [
    [0, "Chuỗi {n} ngày học liên tiếp."],
    [1, "Chuỗi {n} ngày, giữ lửa tiếp nhé."],
    [2, "Streak {n} ngày. Đừng để nó đứt, tiếc lắm đó."],
    [3, "{n} ngày liên tiếp. Ngọn lửa này mà tắt là mình khóc đó."],
  ],
  all_quests: [
    [0, "Bạn đã hoàn thành tất cả nhiệm vụ hôm nay."],
    [1, "Full nhiệm vụ hôm nay! Thưởng thêm XP cho bạn."],
    [2, "Clear sạch quest. Hôm nay bạn là main character."],
    [3, "All quests cleared. Bạn chính thức được phép nằm lướt điện thoại không áy náy."],
  ],
  level_up: [
    [0, "Lên cấp {level}: {title}."],
    [1, "Lên level {level}! Danh hiệu mới: {title}."],
    [2, "Level {level} unlocked. Từ giờ gọi bạn là {title}."],
    [3, "Level {level}! {title} đã xuất hiện, cả server chú ý."],
  ],
  badge: [
    [0, "Mở khóa huy hiệu: {badge}."],
    [1, "Huy hiệu mới: {badge}!"],
    [2, "Vừa nhặt được huy hiệu {badge}. Flex đi chờ chi."],
  ],
  record: [
    [0, "Kỷ lục mới."],
    [1, "Kỷ lục mới! Phá kỷ lục của chính mình mới là đỉnh."],
    [2, "New record! Bản thân hôm qua đang ngồi khóc."],
  ],
  quest_done: [
    [0, "Hoàn thành nhiệm vụ."],
    [1, "Xong một nhiệm vụ, nhận XP nhé."],
    [2, "Quest done. XP về túi."],
  ],
  weekly_done: [
    [0, "Hoàn thành thử thách tuần."],
    [1, "Thử thách tuần: xong! Một tuần rất đáng tự hào."],
    [2, "Thử thách tuần đã bị bạn xử gọn. Tuần sau khó hơn đó nha."],
  ],
};
