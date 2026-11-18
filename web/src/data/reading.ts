// TOEIC Reading practice items (Parts 5 and 7). Original content written for this app.

export type Choice4 = [string, string, string, string];
export type AnswerIndex = 0 | 1 | 2 | 3;

/** Part 5: one sentence with a blank (written as "-------") and four options. */
export type Part5Item = {
  id: string;
  skill: string;
  sentence: string;
  options: Choice4;
  answer: AnswerIndex;
  explainVi: string;
};

export type ReadingQuestion = {
  skill: string;
  question: string;
  options: Choice4;
  answer: AnswerIndex;
  explainVi: string;
};

/** Part 7: one passage (e-mail, notice, ad, article…) with printed questions. */
export type Part7Set = {
  id: string;
  kind: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
};

export const PART5_SKILLS: { code: string; label: string }[] = [
  { code: "R.P5.wordform", label: "Từ loại" },
  { code: "R.P5.tense", label: "Thì động từ" },
  { code: "R.P5.sva", label: "Hòa hợp chủ – vị" },
  { code: "R.P5.prep", label: "Giới từ" },
  { code: "R.P5.conj", label: "Liên từ" },
  { code: "R.P5.gerund", label: "V-ing / to V" },
  { code: "R.P5.passive", label: "Câu bị động" },
];

export const p5 = (id: string, skill: string, sentence: string, options: Choice4, answer: AnswerIndex, explainVi: string): Part5Item => ({
  id,
  skill: `R.P5.${skill}`,
  sentence,
  options,
  answer,
  explainVi,
});

export const part5Items: Part5Item[] = [
  // ---- Word forms
  p5("p5-wf-01", "wordform", "The new software allows employees to complete their reports more -------.", ["efficient", "efficiently", "efficiency", "efficiencies"], 1,
    "Bổ nghĩa cho động từ \"complete\" (và đứng sau \"more\") → cần trạng từ efficiently."),
  p5("p5-wf-02", "wordform", "Ms. Tanaka gave a very ------- presentation on last quarter's sales results.", ["inform", "information", "informative", "informatively"], 2,
    "Đứng giữa \"very\" và danh từ \"presentation\" → cần tính từ informative."),
  p5("p5-wf-03", "wordform", "Please submit your ------- for the marketing position by May 15.", ["apply", "applied", "applicable", "application"], 3,
    "Sau tính từ sở hữu \"your\" cần danh từ → application (đơn ứng tuyển)."),
  p5("p5-wf-04", "wordform", "The hotel's staff responded ------- to the guest's complaint about the noise.", ["prompt", "promptly", "promptness", "prompting"], 1,
    "Bổ nghĩa cho động từ \"responded\" → trạng từ promptly."),
  p5("p5-wf-05", "wordform", "Due to its ------- location, the café attracts many office workers at lunchtime.", ["convenient", "convenience", "conveniently", "conveniences"], 0,
    "Sau \"its\" và trước danh từ \"location\" → tính từ convenient."),
  p5("p5-wf-06", "wordform", "The ------- of the new factory is expected to create 300 jobs.", ["construct", "constructive", "construction", "constructed"], 2,
    "Sau mạo từ \"The\" và trước \"of\" → danh từ construction."),

  // ---- Tenses
  p5("p5-te-01", "tense", "Mr. Lopez ------- for the company since it opened in 2015.", ["works", "has worked", "is working", "will work"], 1,
    "\"since + mốc thời gian\" → hiện tại hoàn thành has worked."),
  p5("p5-te-02", "tense", "The board ------- the proposal at its next meeting on Friday.", ["discussed", "has discussed", "will discuss", "was discussing"], 2,
    "\"at its next meeting on Friday\" là tương lai → will discuss."),
  p5("p5-te-03", "tense", "When the client called, the sales team ------- a training session.", ["attends", "was attending", "has attended", "will attend"], 1,
    "Một hành động đang diễn ra thì hành động khác xen vào (called, quá khứ) → quá khứ tiếp diễn."),
  p5("p5-te-04", "tense", "By the end of this year, the company ------- five new branches.", ["opens", "opened", "will have opened", "has opened"], 2,
    "\"By the end of + thời điểm tương lai\" → tương lai hoàn thành will have opened."),
  p5("p5-te-05", "tense", "Ms. Green usually ------- the train to work, but today she drove.", ["takes", "took", "is taking", "has taken"], 0,
    "\"usually\" → thói quen → hiện tại đơn takes."),
  p5("p5-te-06", "tense", "The shipment ------- yesterday afternoon, two days later than scheduled.", ["arrives", "has arrived", "arrived", "will arrive"], 2,
    "\"yesterday afternoon\" → quá khứ đơn arrived. Hiện tại hoàn thành không đi với mốc quá khứ cụ thể."),

  // ---- Subject-verb agreement
  p5("p5-sv-01", "sva", "Each of the participants ------- a certificate at the end of the workshop.", ["receive", "receives", "are receiving", "have received"], 1,
    "Chủ ngữ là \"Each\" (số ít) → động từ số ít receives."),
  p5("p5-sv-02", "sva", "The results of the customer survey ------- posted on the intranet.", ["has been", "was", "have been", "is"], 2,
    "Chủ ngữ chính là \"The results\" (số nhiều), không phải \"survey\" → have been."),
  p5("p5-sv-03", "sva", "Neither the manager nor the assistants ------- aware of the schedule change.", ["was", "is", "were", "has been"], 2,
    "\"Neither A nor B\": động từ chia theo B gần nhất (\"the assistants\", số nhiều) → were."),
  p5("p5-sv-04", "sva", "The number of online orders ------- increased sharply this month.", ["have", "has", "are", "were"], 1,
    "\"The number of + N\" đi với động từ số ít → has. (\"A number of\" mới đi với số nhiều.)"),
  p5("p5-sv-05", "sva", "Everyone in the accounting department ------- to attend the safety briefing.", ["need", "needs", "are needing", "have needed"], 1,
    "\"Everyone\" là số ít → needs."),
  p5("p5-sv-06", "sva", "The equipment in the laboratories ------- inspected every six months.", ["are", "were", "is", "have been"], 2,
    "\"equipment\" là danh từ không đếm được → động từ số ít is."),

  // ---- Prepositions
  p5("p5-pr-01", "prep", "The conference will take place ------- June 12 at the Grand Hotel.", ["in", "on", "at", "by"], 1,
    "Trước ngày cụ thể dùng \"on\"."),
  p5("p5-pr-02", "prep", "All reports must be submitted ------- 5 P.M. on Thursday.", ["by", "until", "since", "during"], 0,
    "\"by\" = trước/không muộn hơn hạn chót. \"until\" chỉ hành động kéo dài tới thời điểm đó."),
  p5("p5-pr-03", "prep", "The museum will be closed ------- the renovation period.", ["while", "during", "among", "between"], 1,
    "Trước cụm danh từ chỉ khoảng thời gian → \"during\". \"while\" là liên từ, cần mệnh đề."),
  p5("p5-pr-04", "prep", "The parking garage is located ------- the office building and the bank.", ["among", "between", "through", "across"], 1,
    "\"between A and B\"."),
  p5("p5-pr-05", "prep", "Ms. Ahmed has been ------- charge of the project since January.", ["on", "at", "in", "for"], 2,
    "Cụm cố định \"in charge of\" = phụ trách."),
  p5("p5-pr-06", "prep", "Applicants should have at least three years of experience ------- customer service.", ["in", "at", "of", "on"], 0,
    "\"experience in + lĩnh vực\"."),

  // ---- Conjunctions
  p5("p5-cj-01", "conj", "------- the weather was bad, the outdoor concert went ahead as planned.", ["Despite", "Although", "Because", "However"], 1,
    "Theo sau là mệnh đề (the weather was bad) và ý nhượng bộ → Although. \"Despite\" cần danh từ/V-ing."),
  p5("p5-cj-02", "conj", "Please call the front desk ------- you need extra towels.", ["if", "unless", "whether", "so"], 0,
    "Điều kiện: nếu cần thì gọi → if."),
  p5("p5-cj-03", "conj", "The store will extend its hours ------- demand continues to grow.", ["as long as", "even though", "so that", "in spite of"], 0,
    "\"as long as\" = miễn là, chừng nào mà. Phù hợp nghĩa điều kiện."),
  p5("p5-cj-04", "conj", "Mr. Chen will review the contract ------- send it to the legal team.", ["but", "and", "or", "yet"], 1,
    "Hai hành động nối tiếp nhau → and."),
  p5("p5-cj-05", "conj", "The flight was delayed; -------, we still arrived in time for the meeting.", ["therefore", "however", "moreover", "otherwise"], 1,
    "Ý trái ngược (bị trễ nhưng vẫn kịp) → however."),
  p5("p5-cj-06", "conj", "Employees may work from home ------- they have their manager's approval.", ["provided that", "so as to", "in order to", "rather than"], 0,
    "\"provided that\" = với điều kiện là, theo sau là mệnh đề."),

  // ---- Gerund / infinitive
  p5("p5-gi-01", "gerund", "The manager decided ------- the launch until the product had been tested.", ["postpone", "postponing", "to postpone", "postponed"], 2,
    "\"decide + to V\"."),
  p5("p5-gi-02", "gerund", "We look forward to ------- with you on future projects.", ["work", "working", "worked", "be working"], 1,
    "\"look forward to + V-ing\": \"to\" ở đây là giới từ."),
  p5("p5-gi-03", "gerund", "Ms. Park suggested ------- the meeting to a larger room.", ["move", "to move", "moving", "moved"], 2,
    "\"suggest + V-ing\"."),
  p5("p5-gi-04", "gerund", "The company plans ------- a new branch in Hanoi next year.", ["open", "opening", "to open", "opened"], 2,
    "\"plan + to V\"."),
  p5("p5-gi-05", "gerund", "Visitors should avoid ------- photos inside the gallery.", ["take", "to take", "taking", "taken"], 2,
    "\"avoid + V-ing\"."),
  p5("p5-gi-06", "gerund", "The team is responsible for ------- customer inquiries within 24 hours.", ["answer", "answering", "to answer", "answered"], 1,
    "Sau giới từ \"for\" → V-ing."),

  // ---- Passive voice
  p5("p5-pv-01", "passive", "The new parking policy ------- to all staff by e-mail last week.", ["announced", "was announced", "has announced", "announces"], 1,
    "Chính sách \"được thông báo\" → bị động; \"last week\" → quá khứ: was announced."),
  p5("p5-pv-02", "passive", "All visitors are required ------- a security badge at all times.", ["wear", "wearing", "to wear", "worn"], 2,
    "\"be required + to V\"."),
  p5("p5-pv-03", "passive", "The quarterly figures ------- by the finance team before the meeting.", ["will check", "will be checked", "are checking", "checked"], 1,
    "Số liệu \"được kiểm tra\" bởi đội tài chính → bị động tương lai will be checked."),
  p5("p5-pv-04", "passive", "The east entrance ------- since March because of construction work.", ["has closed", "has been closed", "is closing", "closes"], 1,
    "Lối vào \"bị đóng\" (không tự đóng) và \"since March\" → bị động hiện tại hoàn thành has been closed."),
  p5("p5-pv-05", "passive", "Your order ------- within three business days.", ["will ship", "will be shipped", "shipping", "has shipping"], 1,
    "Đơn hàng \"được giao\" → bị động will be shipped."),
  p5("p5-pv-06", "passive", "The award is given to employees who ------- for outstanding service.", ["recognize", "are recognized", "recognizing", "have recognized"], 1,
    "Nhân viên \"được ghi nhận\" → bị động are recognized."),
];

export const rq = (skill: string, question: string, options: Choice4, answer: AnswerIndex, explainVi: string): ReadingQuestion => ({
  skill: `R.P7.${skill}`,
  question,
  options,
  answer,
  explainVi,
});

export const part7Sets: Part7Set[] = [
  {
    id: "p7-01",
    kind: "e-mail",
    title: "E-mail",
    passage: `To: All staff
From: Rachel Moore, Facilities Manager
Subject: Elevator maintenance

Dear colleagues,

Please be aware that the two main elevators in our building will be out of service on Saturday, October 4, from 8:00 A.M. to 4:00 P.M. while technicians replace the control panels. The freight elevator at the back of the building will remain available, but it may only be used by staff who need to move equipment.

Employees who plan to work on Saturday are asked to use the stairs. If you have difficulty using the stairs, please contact my office by Thursday so that we can make other arrangements.

Thank you for your understanding.
Rachel Moore`,
    questions: [
      rq("detail", "What is the purpose of the e-mail?", ["To announce new office hours", "To inform staff about maintenance work", "To request help moving equipment", "To introduce a new manager"], 1,
        "Toàn bộ e-mail báo thang máy ngừng hoạt động để thay bảng điều khiển → thông báo bảo trì."),
      rq("detail", "Who may use the freight elevator on Saturday?", ["All visitors", "Technicians only", "Staff moving equipment", "Employees on the top floor"], 2,
        "\"it may only be used by staff who need to move equipment\"."),
      rq("inference", "Why would an employee contact Ms. Moore's office?", ["To volunteer for weekend work", "To report a broken elevator", "To request alternative arrangements", "To reserve a meeting room"], 2,
        "Ai khó đi cầu thang thì liên hệ để \"make other arrangements\" → sắp xếp phương án khác."),
    ],
  },
  {
    id: "p7-02",
    kind: "advertisement",
    title: "Advertisement",
    passage: `GREENLEAF CATERING
Fresh, healthy meals for your business events

Whether you are hosting a morning workshop or a company dinner for 300 guests, Greenleaf Catering has you covered. All of our dishes are prepared on the day of your event using ingredients from local farms.

• Breakfast and lunch packages starting at $12 per person
• Vegetarian and gluten-free options at no extra cost
• Free delivery within the city for orders over $200

Book before December 1 and receive a complimentary dessert platter.
Call 555-0182 or visit www.greenleafcatering.com to view our full menu.`,
    questions: [
      rq("detail", "What is indicated about Greenleaf Catering's food?", ["It is frozen for freshness.", "It is made with local ingredients.", "It is only vegetarian.", "It is imported from abroad."], 1,
        "\"using ingredients from local farms\"."),
      rq("paraphrase", "What do customers receive if they book before December 1?", ["Free delivery", "A discount on breakfast", "A free dessert selection", "A gluten-free menu"], 2,
        "\"complimentary dessert platter\": complimentary = miễn phí, nên đáp án là món tráng miệng miễn phí."),
      rq("detail", "According to the advertisement, when is delivery free?", ["For all business events", "For orders above a certain amount", "For events with 300 guests", "For breakfast packages only"], 1,
        "\"Free delivery … for orders over $200\" → đơn trên một mức tiền nhất định."),
    ],
  },
  {
    id: "p7-03",
    kind: "notice",
    title: "Notice",
    passage: `CITY PUBLIC LIBRARY — NOTICE TO MEMBERS

Starting March 1, the library will introduce a new self-checkout system. Members will be able to borrow books by scanning their library cards at machines near the main entrance. Staff will be available at the information desk to help members who are using the machines for the first time.

Please note that the loan period for new releases will change from three weeks to two weeks. The loan period for all other materials will remain the same.

Library cards issued before 2020 may not work with the new machines. Members with older cards can request a replacement card free of charge at the information desk.`,
    questions: [
      rq("detail", "What will change on March 1?", ["The library's opening hours", "The way members borrow books", "The location of the information desk", "The price of library cards"], 1,
        "Hệ thống tự mượn sách mới → cách mượn sách thay đổi."),
      rq("detail", "What is true about new releases?", ["They will be kept at the information desk.", "They will be available for a shorter period.", "They can no longer be borrowed.", "They must be reserved in advance."], 1,
        "Thời hạn mượn đổi từ 3 tuần xuống 2 tuần → ngắn hơn."),
      rq("inference", "Who most likely needs to visit the information desk?", ["Members with cards from before 2020", "Members who want to donate books", "Members who live outside the city", "Members who return books late"], 0,
        "Thẻ cấp trước 2020 có thể không dùng được với máy mới, nên phải đổi thẻ ở quầy thông tin."),
    ],
  },
  {
    id: "p7-04",
    kind: "text message chain",
    title: "Text message chain",
    passage: `Daniel Kim (9:12 A.M.)
Hi Priya, are you at the office yet? The client from Norwood Bank just called. They want to move our meeting from 2 P.M. to 11 A.M.

Priya Shah (9:15 A.M.)
I'm on the train now. I should be there by 10. Is the conference room free at 11?

Daniel Kim (9:16 A.M.)
Room B is booked, but Room D is open. I'll reserve it.

Priya Shah (9:18 A.M.)
Great. Could you also print ten copies of the proposal? I left the final version in the shared folder.

Daniel Kim (9:19 A.M.)
Will do.`,
    questions: [
      rq("detail", "Why did Mr. Kim contact Ms. Shah?", ["To report a problem with a proposal", "To tell her about a schedule change", "To ask her to meet a client at the bank", "To cancel a reservation"], 1,
        "Khách hàng muốn dời cuộc họp từ 2 giờ chiều sang 11 giờ sáng → đổi lịch."),
      rq("inference", "At 9:16 A.M., what does Mr. Kim mean when he writes, \"I'll reserve it\"?", ["He will book Room D.", "He will move the client's meeting again.", "He will buy a train ticket.", "He will cancel Room B."], 0,
        "\"it\" thay cho Room D vừa nhắc tới."),
      rq("detail", "What does Ms. Shah ask Mr. Kim to do?", ["Pick her up at the station", "Revise the proposal", "Make copies of a document", "Call the client back"], 2,
        "\"print ten copies of the proposal\" → in bản sao tài liệu."),
    ],
  },
  {
    id: "p7-05",
    kind: "article",
    title: "Article",
    passage: `RIVERTON (May 8) — Harbor Coffee, a local café chain, announced yesterday that it will open its fifth location in the Westgate Shopping Center this summer. The new café will be the company's largest, with seating for 120 customers and a separate meeting room that can be reserved by local businesses.

"Many of our regular customers work in the offices near Westgate," said owner Maria Santos. "They asked for a place where they can hold small meetings while enjoying good coffee."

Harbor Coffee opened its first café in 2016. The company plans to hire 25 new employees for the Westgate location and will hold a job fair at its downtown café on May 20.`,
    questions: [
      rq("detail", "What is the article mainly about?", ["A café chain's expansion", "A new shopping center", "A local job shortage", "A change in coffee prices"], 0,
        "Harbor Coffee mở chi nhánh thứ 5 → mở rộng chuỗi."),
      rq("detail", "What will be special about the new location?", ["It will be open 24 hours.", "It will have a room for meetings.", "It will serve food from local farms.", "It will be the company's first café."], 1,
        "\"a separate meeting room that can be reserved by local businesses\"."),
      rq("paraphrase", "According to Ms. Santos, why was the Westgate location chosen?", ["Rent there is low.", "Customers working nearby requested it.", "The downtown café is closing.", "The shopping center offered a discount."], 1,
        "Khách quen làm việc gần Westgate đã đề xuất → \"customers working nearby requested it\"."),
      rq("detail", "What will happen on May 20?", ["The new café will open.", "A recruitment event will be held.", "Ms. Santos will give a speech.", "The company will celebrate its anniversary."], 1,
        "\"will hold a job fair … on May 20\": job fair = sự kiện tuyển dụng."),
    ],
  },
];
