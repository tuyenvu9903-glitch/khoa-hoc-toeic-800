// TOEIC Listening practice items (Parts 2-4). Original scripts written for this app;
// audio is produced at runtime with the browser's speech synthesis.

export type Speaker = "M" | "W" | "M2" | "W2";
export type ScriptSpeaker = Speaker;

/** Part 2: a spoken question or statement followed by three spoken responses. */
export type Part2Item = {
  id: string;
  skill: string;
  speakers: [Speaker, Speaker];
  prompt: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  explainVi: string;
};

export type ListeningQuestion = {
  skill: string;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explainVi: string;
};

/** Part 3: a conversation. Part 4: a talk by one speaker. Each has three printed questions. */
export type ListeningSet = {
  id: string;
  part: "3" | "4";
  /** "Questions 1-3 refer to the following …" */
  kind: string;
  lines: { speaker: Speaker; text: string }[];
  questions: [ListeningQuestion, ListeningQuestion, ListeningQuestion];
};

export const p2 = (
  id: string,
  skill: string,
  prompt: string,
  options: [string, string, string],
  answer: 0 | 1 | 2,
  explainVi: string,
  speakers: [Speaker, Speaker] = ["W", "M"],
): Part2Item => ({ id, skill: `L.P2.${skill}`, speakers, prompt, options, answer, explainVi });

export const part2Items: Part2Item[] = [
  p2("p2-01", "who", "Who's leading the training session tomorrow?", ["It starts at nine.", "Ms. Patel from Human Resources.", "In the main conference room."], 1,
    "Hỏi Who → cần một người. (A) trả lời When, (C) trả lời Where."),
  p2("p2-02", "who", "Who should I send the invoice to?", ["The accounting department handles that.", "About three hundred dollars.", "I sent it yesterday."], 0,
    "Trả lời bằng một bộ phận (accounting department) vẫn đúng cho câu Who. (C) lặp từ \"sent\" để gây nhiễu.", ["M", "W"]),
  p2("p2-03", "who", "Who's going to pick up the clients from the airport?", ["Their flight was delayed.", "At gate twelve.", "A pickup truck."], 0,
    "Câu trả lời gián tiếp: chuyến bay bị trễ nên chưa cần người đón. (C) lặp âm \"pick up\" là bẫy."),
  p2("p2-04", "what", "What time does the store open on Sundays?", ["Not until eleven.", "Yes, it's open.", "A new store manager."], 0,
    "Hỏi What time → giờ giấc. (B) trả lời Yes/No cho câu hỏi Wh- luôn sai.", ["M", "W"]),
  p2("p2-05", "what", "What did you think of the new logo design?", ["I think so too.", "It's a bit too colorful.", "By the design team."], 1,
    "Hỏi ý kiến → (B) đưa ra nhận xét. (C) lặp từ \"design\"."),
  p2("p2-06", "what", "What's the fastest way to get to the convention center?", ["Take the subway on Green Line.", "It was a great convention.", "Since last March."], 0,
    "Hỏi cách đi → phương tiện. (B) lặp từ \"convention\".", ["M", "W"]),
  p2("p2-07", "where", "Where can I find the extra printer paper?", ["In the supply cabinet.", "It's eight pages long.", "No, I didn't print it."], 0,
    "Hỏi Where → địa điểm. (B), (C) dùng từ gần âm print/paper để gây nhiễu."),
  p2("p2-08", "where", "Where are we holding the company picnic this year?", ["The committee hasn't decided yet.", "Every summer.", "Sandwiches and salad."], 0,
    "\"Chưa quyết định\" là kiểu trả lời gián tiếp rất hay gặp và thường là đáp án đúng.", ["M", "W"]),
  p2("p2-09", "where", "Where did you put the signed contracts?", ["On your desk, next to the phone.", "Yes, they signed it.", "A two-year contract."], 0,
    "Where → vị trí cụ thể. (B) trả lời Yes cho câu Wh-, (C) lặp \"contract\"."),
  p2("p2-10", "when", "When is the quarterly report due?", ["By the end of next week.", "Four times a year.", "To the board of directors."], 0,
    "When → thời hạn. (B) liên tưởng tới \"quarterly\" nhưng không trả lời câu hỏi.", ["M", "W"]),
  p2("p2-11", "when", "When will the new software be installed?", ["The technician is coming on Thursday.", "On every computer.", "It's very easy to use."], 0,
    "Trả lời bằng sự kiện có mốc thời gian (technician comes Thursday) là đúng."),
  p2("p2-12", "when", "When did Mr. Kim join the marketing team?", ["Right after he graduated.", "He's joining us for lunch.", "A marketing campaign."], 0,
    "Câu hỏi quá khứ → mốc quá khứ. (B) lặp \"join\" nhưng sai nghĩa.", ["M", "W"]),
  p2("p2-13", "why", "Why was the staff meeting canceled?", ["The manager is out sick today.", "In conference room B.", "Yes, it was canceled."], 0,
    "Why → lý do. Không cần có \"because\" vẫn có thể là đáp án đúng."),
  p2("p2-14", "why", "Why don't we order lunch from the new Thai restaurant?", ["That sounds like a good idea.", "Because it's new.", "Two orders of noodles."], 0,
    "\"Why don't we…?\" là lời đề nghị, không hỏi lý do → đáp lại bằng đồng ý/từ chối. (B) là bẫy \"because\".", ["M", "W"]),
  p2("p2-15", "why", "Why is the parking lot so full this morning?", ["There's a job fair in the building.", "Park on the second level.", "It's fully booked."], 0,
    "Lý do bãi xe đầy → có hội chợ việc làm. (C) dùng \"fully\" gần âm \"full\"."),
  p2("p2-16", "how", "How long will the renovation take?", ["About three weeks.", "It looks much better.", "Quite a long hallway."], 0,
    "How long → khoảng thời gian. (C) lặp \"long\".", ["M", "W"]),
  p2("p2-17", "how", "How did the presentation go?", ["The clients seemed impressed.", "At two o'clock.", "I'll go with you."], 0,
    "Hỏi kết quả → nhận xét về buổi thuyết trình. (C) lặp \"go\"."),
  p2("p2-18", "how", "How many copies of the brochure do you need?", ["Fifty should be enough.", "It's on page four.", "Yes, I need them."], 0,
    "How many → số lượng.", ["M", "W"]),
  p2("p2-19", "yesno", "Have you reviewed the budget proposal yet?", ["I'll do it this afternoon.", "A proposal for the new office.", "It's over budget."], 0,
    "Câu Yes/No có thể trả lời không cần Yes/No: \"chiều nay tôi sẽ làm\" = chưa."),
  p2("p2-20", "yesno", "Is there a pharmacy near the hotel?", ["There's one across the street.", "For three nights.", "I'm feeling better."], 0,
    "Trả lời bằng thông tin thay cho \"Yes\".", ["M", "W"]),
  p2("p2-21", "yesno", "Didn't you order more toner last week?", ["It hasn't arrived yet.", "The order number is on the receipt.", "A color printer."], 0,
    "Câu phủ định hỏi xác nhận: đã đặt nhưng hàng chưa tới. (B) lặp \"order\", (C) liên tưởng tới máy in (toner).", ["W", "M"]),
  p2("p2-22", "choice", "Would you like to meet on Monday or Tuesday?", ["Tuesday works better for me.", "Yes, I would.", "We met last month."], 0,
    "Câu hỏi lựa chọn (or) → chọn một phương án, không trả lời Yes/No.", ["M", "W"]),
  p2("p2-23", "choice", "Should we take a taxi or walk to the restaurant?", ["It's only five minutes away.", "Yes, we should.", "A table for four."], 0,
    "Trả lời gián tiếp: chỉ 5 phút → ý là đi bộ."),
  p2("p2-24", "choice", "Do you want the report printed or sent by e-mail?", ["E-mail is fine, thanks.", "I printed my ticket.", "It's a monthly report."], 0,
    "Chọn một trong hai phương án.", ["M", "W"]),
];

export const q = (
  skill: string,
  question: string,
  options: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explainVi: string,
): ListeningQuestion => ({ skill, question, options, answer, explainVi });

export const listeningSets: ListeningSet[] = [
  // ---------------- Part 3: conversations ----------------
  {
    id: "p3-01",
    part: "3",
    kind: "conversation",
    lines: [
      { speaker: "W", text: "Hi, I'm calling about the desk I ordered from your website last week. It was supposed to arrive on Monday, but it still hasn't come." },
      { speaker: "M", text: "I'm sorry about that. Could you give me your order number? I'll check the status for you." },
      { speaker: "W", text: "Sure, it's four seven two nine." },
      { speaker: "M", text: "Thank you. It looks like the delivery truck had a mechanical problem. Your desk will be delivered tomorrow morning, and I'll refund the shipping fee for the inconvenience." },
    ],
    questions: [
      q("L.P3.purpose", "Why is the woman calling?", ["To order some furniture", "To report a late delivery", "To change her address", "To ask about a discount"], 1,
        "Cô ấy nói chiếc bàn \"still hasn't come\" → giao hàng trễ."),
      q("L.P3.detail", "What caused the problem?", ["An incorrect address", "A shortage of stock", "A vehicle breakdown", "Bad weather"], 2,
        "\"the delivery truck had a mechanical problem\" được diễn đạt lại thành \"vehicle breakdown\"."),
      q("L.P3.next", "What does the man offer to do?", ["Send a replacement", "Upgrade the product", "Cancel the order", "Return a fee"], 3,
        "\"refund the shipping fee\" = trả lại phí → Return a fee."),
    ],
  },
  {
    id: "p3-02",
    part: "3",
    kind: "conversation",
    lines: [
      { speaker: "M", text: "Linda, have you booked the venue for the sales conference in April?" },
      { speaker: "W", text: "Not yet. The hotel we used last year is being renovated, so I'm looking at a few other places downtown." },
      { speaker: "M", text: "What about the Riverside Center? My team went there for a workshop, and the facilities were excellent." },
      { speaker: "W", text: "Good idea. I'll call them this afternoon to check if they have space for two hundred people." },
    ],
    questions: [
      q("L.P3.detail", "What event are the speakers discussing?", ["A product launch", "A sales conference", "A retirement party", "A job interview"], 1,
        "Người đàn ông hỏi ngay câu đầu về \"the sales conference in April\"."),
      q("L.P3.inference", "Why can't the speakers use last year's hotel?", ["It is too expensive.", "It is fully booked.", "It is under renovation.", "It is too far away."], 2,
        "\"is being renovated\" = đang sửa chữa."),
      q("L.P3.next", "What will the woman probably do this afternoon?", ["Contact a venue", "Visit a workshop", "Prepare a budget", "Send invitations"], 0,
        "\"I'll call them this afternoon\" → liên hệ địa điểm."),
    ],
  },
  {
    id: "p3-03",
    part: "3",
    kind: "conversation",
    lines: [
      { speaker: "W", text: "Excuse me, I'd like to return this jacket. I bought it on Saturday, but it's a little too small." },
      { speaker: "M", text: "No problem. Would you like a refund, or would you prefer to exchange it for a larger size?" },
      { speaker: "W", text: "I'd rather exchange it. Do you have it in a medium?" },
      { speaker: "M", text: "Let me check the stockroom. Actually, we only have medium in dark blue right now. Is that all right?" },
      { speaker: "W", text: "That's fine. Blue is actually my favorite color." },
    ],
    questions: [
      q("L.P3.detail", "What is the problem with the jacket?", ["It is damaged.", "It is the wrong size.", "It is the wrong color.", "It is too expensive."], 1,
        "\"it's a little too small\" → sai kích cỡ."),
      q("L.P3.detail", "What does the woman decide to do?", ["Get a refund", "Exchange the item", "Buy a second jacket", "Order online"], 1,
        "\"I'd rather exchange it\"."),
      q("L.P3.inference", "What does the woman imply when she says, \"Blue is actually my favorite color\"?", ["She wants a discount.", "She will accept the jacket.", "She already owns a blue jacket.", "She is disappointed."], 1,
        "Câu hỏi ý định người nói: cô ấy thích màu xanh → chấp nhận chiếc áo đó."),
    ],
  },
  {
    id: "p3-04",
    part: "3",
    kind: "conversation",
    lines: [
      { speaker: "M", text: "Hi, Sara. The projector in meeting room three isn't working again. I have a client presentation there in thirty minutes." },
      { speaker: "W", text: "Oh no. The IT department is short-staffed today, so they may not get to it in time." },
      { speaker: "M", text: "That's what I was afraid of. Is there another room available?" },
      { speaker: "W", text: "Room five is free until noon, and it has a large screen. I'll reserve it for you right now." },
    ],
    questions: [
      q("L.P3.purpose", "What problem does the man mention?", ["A room is double-booked.", "Some equipment is broken.", "A client is late.", "A file is missing."], 1,
        "\"The projector … isn't working\" → thiết bị hỏng (paraphrase: equipment)."),
      q("L.P3.paraphrase", "According to the woman, what is the situation in the IT department?", ["It has moved to a new floor.", "It is closed for the day.", "It does not have enough workers.", "It is installing new software."], 2,
        "\"short-staffed\" = thiếu nhân viên = does not have enough workers."),
      q("L.P3.next", "What will the woman do next?", ["Book a different room", "Call a technician", "Postpone a meeting", "Bring a laptop"], 0,
        "\"I'll reserve it for you right now\" → đặt phòng khác."),
    ],
  },
  {
    id: "p3-05",
    part: "3",
    kind: "conversation",
    lines: [
      { speaker: "W", text: "Good morning, Dr. Lee's office. How can I help you?" },
      { speaker: "M", text: "Hello, this is Tom Baker. I have an appointment at three o'clock this afternoon, but something urgent came up at work. Is it possible to come in later?" },
      { speaker: "W", text: "Let me see. The doctor is fully booked today, but we have an opening tomorrow at ten a.m." },
      { speaker: "M", text: "Tomorrow at ten works for me. Thank you so much." },
      { speaker: "W", text: "You're welcome. Please remember to bring your insurance card." },
    ],
    questions: [
      q("L.P3.purpose", "Why is the man calling?", ["To cancel a prescription", "To reschedule an appointment", "To ask for directions", "To pay a bill"], 1,
        "Anh ấy muốn đến muộn hơn → dời lịch hẹn."),
      q("L.P3.detail", "When will the man see the doctor?", ["Today at three", "Today at five", "Tomorrow at ten", "Tomorrow at three"], 2,
        "\"Tomorrow at ten works for me\"."),
      q("L.P3.detail", "What is the man reminded to bring?", ["A medical report", "A form of payment", "An insurance card", "A photo ID"], 2,
        "\"remember to bring your insurance card\"."),
    ],
  },
  {
    id: "p3-06",
    part: "3",
    kind: "conversation with three speakers",
    lines: [
      { speaker: "M", text: "Thanks for meeting with us. Jenna and I wanted to talk about hiring a summer intern for the design team." },
      { speaker: "W", text: "Sure. Do we have enough in the budget this year?" },
      { speaker: "W2", text: "We do. Last quarter's sales were higher than expected, so finance approved some extra funding." },
      { speaker: "W", text: "Great. Then let's post the position on the university job board this week." },
      { speaker: "M", text: "I'll write the job description today and send it to both of you for review." },
    ],
    questions: [
      q("L.P3.purpose", "What are the speakers mainly discussing?", ["Hiring an intern", "Redesigning a website", "Reducing costs", "Planning a trip"], 0,
        "Câu đầu: \"hiring a summer intern\"."),
      q("L.P3.detail", "Why is extra money available?", ["A project was canceled.", "Sales increased.", "A client paid early.", "Prices went down."], 1,
        "\"sales were higher than expected\" = doanh số tăng."),
      q("L.P3.next", "What will the man do today?", ["Visit a university", "Interview candidates", "Draft a job description", "Meet with finance"], 2,
        "\"I'll write the job description today\" → draft = soạn thảo."),
    ],
  },

  // ---------------- Part 4: talks ----------------
  {
    id: "p4-01",
    part: "4",
    kind: "announcement",
    lines: [
      { speaker: "W", text: "Attention, passengers on Flight two eighteen to Singapore. Due to heavy fog, all departures are delayed by approximately ninety minutes. We understand this is inconvenient. Passengers can collect a meal voucher at the service desk next to gate fourteen. Please keep checking the departure boards for updates, and we will make another announcement as soon as we have more information. Thank you for your patience." },
    ],
    questions: [
      q("L.P4.purpose", "Where is the announcement most likely being made?", ["At a train station", "At an airport", "On a bus", "At a hotel"], 1,
        "Flight, departures, gate → sân bay."),
      q("L.P4.detail", "What has caused the delay?", ["A technical problem", "A staff shortage", "Poor weather", "A late crew"], 2,
        "\"heavy fog\" = sương mù dày → thời tiết xấu."),
      q("L.P4.detail", "What can passengers get at the service desk?", ["A seat upgrade", "A meal voucher", "A refund", "A hotel room"], 1,
        "\"collect a meal voucher at the service desk\"."),
    ],
  },
  {
    id: "p4-02",
    part: "4",
    kind: "telephone message",
    lines: [
      { speaker: "M", text: "Hi, Ms. Garcia, this is Daniel from Brightline Printing. I'm calling about the brochures you ordered for your trade show. We've finished printing them, but we noticed that the phone number on the back page is missing one digit. Before we deliver them, could you call me back to confirm the correct number? If we reprint today, the brochures will still be ready by Friday. My number is five five five, two zero one nine. Thanks." },
    ],
    questions: [
      q("L.P4.purpose", "Why is the speaker calling?", ["To advertise a service", "To report an error", "To request payment", "To cancel an order"], 1,
        "Số điện thoại bị thiếu một chữ số → báo lỗi."),
      q("L.P4.detail", "What is the brochure for?", ["A trade show", "A new restaurant", "A training course", "A charity event"], 0,
        "\"brochures you ordered for your trade show\"."),
      q("L.P4.inference", "What does the speaker ask the listener to do?", ["Pick up the brochures", "Approve a new design", "Confirm some information", "Pay an extra fee"], 2,
        "\"call me back to confirm the correct number\" → xác nhận thông tin."),
    ],
  },
  {
    id: "p4-03",
    part: "4",
    kind: "talk",
    lines: [
      { speaker: "W", text: "Good morning, everyone, and welcome to your first day at Norton Electronics. I'm Karen, and I'll be guiding you through this orientation. This morning, we'll tour the factory floor so you can see how our products are assembled. After lunch in the cafeteria, you'll meet your team supervisors. Before we start, please put on the safety glasses on the table by the door. They are required in all production areas." },
    ],
    questions: [
      q("L.P4.purpose", "Who most likely are the listeners?", ["New employees", "Factory inspectors", "Potential customers", "Team supervisors"], 0,
        "\"your first day\" + \"orientation\" → nhân viên mới."),
      q("L.P4.detail", "What will the listeners do after lunch?", ["Watch a video", "Meet their supervisors", "Tour the factory", "Fill out forms"], 1,
        "\"After lunch … you'll meet your team supervisors\"."),
      q("L.P4.inference", "What are the listeners asked to do?", ["Sign in at the door", "Wear protective equipment", "Leave their bags", "Turn off their phones"], 1,
        "\"put on the safety glasses\" = đồ bảo hộ (protective equipment)."),
    ],
  },
  {
    id: "p4-04",
    part: "4",
    kind: "radio advertisement",
    lines: [
      { speaker: "M", text: "Are you tired of spending your weekends cleaning? Let Sparkle Home Services do the work for you! Our trained staff clean houses and apartments of every size, and we use only environmentally friendly products. This month only, new customers get twenty percent off their first cleaning. To book, visit our website or download our mobile app. Sparkle Home Services: more time for the things you love." },
    ],
    questions: [
      q("L.P4.purpose", "What is being advertised?", ["A furniture store", "A cleaning service", "A moving company", "A real estate agency"], 1,
        "\"Sparkle Home Services … clean houses and apartments\"."),
      q("L.P4.detail", "What does the speaker say about the products the company uses?", ["They are inexpensive.", "They are imported.", "They are safe for the environment.", "They are sold online."], 2,
        "\"environmentally friendly products\"."),
      q("L.P4.detail", "How can new customers receive a discount?", ["By booking this month", "By referring a friend", "By paying in cash", "By signing a contract"], 0,
        "\"This month only, new customers get twenty percent off\"."),
    ],
  },
  {
    id: "p4-05",
    part: "4",
    kind: "excerpt from a meeting",
    lines: [
      { speaker: "W", text: "Before we finish, I have an update about the office move. The new building on Elm Street won't be ready until the end of next month, because the electrical work is taking longer than planned. So we'll stay here for now. I know many of you have already started packing. Please don't put any more files in boxes until we confirm the new date. I'll send everyone an e-mail as soon as the contractor gives me a schedule." },
    ],
    questions: [
      q("L.P4.purpose", "What is the main topic of the talk?", ["A delay in an office relocation", "A change in work hours", "A new electrical system", "A company merger"], 0,
        "Cập nhật về \"the office move\" bị chậm."),
      q("L.P4.detail", "What is the reason for the delay?", ["A permit has not been issued.", "Some work is taking extra time.", "The budget was reduced.", "The contractor quit."], 1,
        "\"the electrical work is taking longer than planned\"."),
      q("L.P4.inference", "What does the speaker ask the listeners to do?", ["Stop packing for now", "Contact the contractor", "Visit the new building", "Label their boxes"], 0,
        "\"Please don't put any more files in boxes\" → tạm ngừng đóng gói."),
    ],
  },
];

export const part3Sets = listeningSets.filter((s) => s.part === "3");
export const part4Sets = listeningSets.filter((s) => s.part === "4");
