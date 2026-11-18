// Week 2 day packs. The correct option is written first (answer 0); sessions shuffle options.
import { p2 } from "../listening";
import { p5, rq } from "../reading";
import type { DayPack } from "./types";

export const week2: DayPack[] = [
  {
    day: 8,
    topic: "hr",
    theme: "Tuyển dụng & phỏng vấn",
    words: [
      ["job opening", "n", "vị trí đang tuyển", "a job that is available", "vacancy", "We have a job opening in the finance team."],
      ["job description", "n", "bản mô tả công việc", "a document listing the duties of a job", "", "Read the job description carefully before applying."],
      ["resume", "n", "sơ yếu lý lịch, CV", "a document describing your education and work history", "CV", "Please attach your resume to the e-mail."],
      ["cover letter", "n", "thư xin việc", "a letter sent with a resume to explain your interest", "", "Her cover letter explained why she wanted the job."],
      ["reference", "n", "người giới thiệu; thư giới thiệu", "a person who can describe your work, or their letter", "recommendation", "Please list two references from previous employers."],
      ["interview", "n", "buổi phỏng vấn", "a formal meeting to decide if someone is right for a job", "", "The interview will last about 45 minutes."],
      ["interviewer", "n", "người phỏng vấn", "a person who asks the questions in an interview", "", "The interviewer asked about my last project."],
      ["shortlist", "v", "lọt vào danh sách rút gọn", "to choose a small number of applicants for the final stage", "", "Five candidates were shortlisted for the position."],
      ["background", "n", "lý lịch, kinh nghiệm nền tảng", "a person's education, experience and history", "", "She has a strong background in accounting."],
      ["requirement", "n", "yêu cầu", "something that is needed or demanded", "", "A driver's license is a requirement for this job."],
      ["degree", "n", "bằng đại học", "a qualification from a university", "", "Applicants need a degree in engineering."],
      ["certificate", "n", "chứng chỉ", "an official document showing you completed a course", "", "He has a certificate in project management."],
      ["expertise", "n", "chuyên môn", "special skill or knowledge", "know-how", "We need someone with expertise in online marketing."],
      ["competent", "adj", "có năng lực", "having enough skill to do something well", "capable", "We are looking for a competent bookkeeper."],
      ["proficient", "adj", "thành thạo", "very good at something", "skilled", "Applicants must be proficient in English."],
      ["fluent", "adj", "lưu loát", "able to speak a language easily", "", "The guide is fluent in Japanese."],
      ["enthusiastic", "adj", "nhiệt tình", "showing great interest and excitement", "eager", "We want enthusiastic people to join our sales team."],
      ["apply for", "v", "nộp đơn xin", "to formally ask for a job or something", "", "I'm going to apply for the manager position."],
      ["application form", "n", "mẫu đơn ứng tuyển", "a form you complete to ask for a job", "", "Download the application form from our website."],
      ["hiring manager", "n", "quản lý tuyển dụng", "the manager who decides whom to employ", "", "The hiring manager will call you next week."],
      ["recruitment agency", "n", "công ty tuyển dụng", "a business that finds workers for companies", "staffing agency", "We used a recruitment agency to find engineers."],
      ["job fair", "n", "hội chợ việc làm", "an event where companies meet people looking for jobs", "career fair", "Over 50 companies attended the job fair."],
      ["internship", "n", "kỳ thực tập", "a period of work for a student to gain experience", "", "She did a three-month internship at a bank."],
      ["entry-level", "adj", "dành cho người mới bắt đầu", "suitable for people with little experience", "junior", "This is an entry-level position."],
      ["full-time", "adj", "toàn thời gian", "working the whole of a normal working week", "", "We offer full-time and part-time jobs."],
      ["part-time", "adj", "bán thời gian", "working only part of the day or week", "", "He has a part-time job at a café."],
      ["temporary", "adj", "tạm thời, thời vụ", "lasting for a limited time only", "short-term", "We hire temporary staff during the holidays."],
      ["probation period", "n", "thời gian thử việc", "a period when a new employee is tested", "trial period", "The probation period is two months."],
      ["starting salary", "n", "mức lương khởi điểm", "the pay you get when you begin a job", "", "The starting salary is $2,000 per month."],
      ["job offer", "n", "lời mời làm việc", "a formal offer of a job", "", "She accepted the job offer immediately."],
      ["decline", "v", "từ chối", "to say no politely", "turn down", "He declined the offer because of the long commute."],
      ["onboarding", "n", "quá trình tiếp nhận nhân viên mới", "the process of helping new staff start a job", "", "Onboarding takes about two weeks."],
      ["consider", "v", "cân nhắc", "to think carefully about something", "think about", "We will consider all applications received by Friday."],
    ],
    part2: [
      p2("w2d8-p2-1", "when", "When is the deadline to apply for the position?", ["This Friday at five.", "At the main office.", "Yes, I applied."], 0,
        "When → hạn chót. (C) Yes cho câu Wh- là sai."),
      p2("w2d8-p2-2", "who", "Who's interviewing the candidates today?", ["The hiring manager and I.", "Three candidates.", "In room 4B."], 0,
        "Who → người phỏng vấn.", ["M", "W"]),
      p2("w2d8-p2-3", "yesno", "Did Ms. Lin accept the job offer?", ["She's still considering it.", "Yes, I'll offer some.", "A full-time job."], 0,
        "Trả lời gián tiếp: vẫn đang cân nhắc. (B) lặp \"offer\"."),
      p2("w2d8-p2-4", "what", "What are the requirements for the job?", ["A degree and two years' experience.", "It's required by law.", "On the job board."], 0,
        "Hỏi yêu cầu → bằng cấp và kinh nghiệm. (B) lặp \"required\".", ["M", "W"]),
    ],
    part5: [
      p5("w2d8-p5-1", "gerund", "Ms. Sato is considering ------- the job offer from the bank.", ["accepting", "to accept", "accept", "accepted"], 0,
        "\"consider + V-ing\"."),
      p5("w2d8-p5-2", "gerund", "The company has decided ------- more part-time staff for the holidays.", ["to hire", "hiring", "hire", "hired"], 0,
        "\"decide + to V\"."),
      p5("w2d8-p5-3", "gerund", "Thank you for ------- for the position of sales assistant.", ["applying", "apply", "to apply", "applied"], 0,
        "Sau giới từ \"for\" → V-ing."),
      p5("w2d8-p5-4", "gerund", "Candidates are asked ------- two references with their resume.", ["to provide", "providing", "provide", "provided"], 0,
        "\"be asked + to V\"."),
    ],
    part7: {
      id: "w2d8-p7",
      kind: "job advertisement",
      title: "Job advertisement",
      passage: `JOB OPENING: Customer Support Assistant (entry-level)
Brightway Telecom — Da Nang office

We are looking for an enthusiastic team member to answer customer questions by phone and e-mail.

Requirements:
• Fluent in Vietnamese and proficient in English
• Basic computer skills
• A degree is not required

This is a full-time position with a two-month probation period. The starting salary depends on experience.

To apply, send your resume and a cover letter to jobs@brightway.example by March 15. Shortlisted candidates will be invited to an interview in the last week of March.`,
      questions: [
        rq("detail", "What is one requirement for the job?", ["Good English skills", "A university degree", "Sales experience", "A driver's license"], 0,
          "\"proficient in English\" = giỏi tiếng Anh. Bằng đại học không bắt buộc."),
        rq("detail", "What is stated about the salary?", ["It depends on experience.", "It is paid weekly.", "It increases after two months.", "It includes a bonus."], 0,
          "\"The starting salary depends on experience\"."),
        rq("inference", "What will happen in the last week of March?", ["Selected applicants will be interviewed.", "The office will open.", "Training will begin.", "Applications will close."], 0,
          "\"Shortlisted candidates will be invited to an interview in the last week of March\"."),
      ],
    },
  },

  {
    day: 9,
    topic: "delivery",
    theme: "Kho vận & giao hàng",
    words: [
      ["warehouse", "n", "nhà kho", "a large building for storing goods", "storehouse", "All orders are packed at our warehouse."],
      ["storage", "n", "sự lưu trữ, kho", "the keeping of things for future use", "", "We rent extra storage during the busy season."],
      ["pallet", "n", "tấm kê hàng (pallet)", "a flat wooden frame for moving goods", "", "Each pallet holds forty boxes."],
      ["forklift", "n", "xe nâng", "a small vehicle used to lift heavy goods", "", "Only trained staff may drive the forklift."],
      ["loading dock", "n", "bến bốc dỡ hàng", "the place where trucks are loaded and unloaded", "", "The truck is waiting at the loading dock."],
      ["load", "v", "chất hàng lên", "to put goods onto a vehicle", "", "The boxes were loaded onto the truck this morning."],
      ["unload", "v", "dỡ hàng xuống", "to take goods off a vehicle", "", "Please unload the shipment carefully."],
      ["package", "n", "gói hàng, kiện hàng", "a box or parcel sent by mail", "parcel", "Your package will arrive tomorrow."],
      ["packaging", "n", "bao bì", "the materials used to wrap a product", "", "We now use recycled packaging."],
      ["label", "n", "nhãn", "a piece of paper attached to something with information", "tag", "Check the address label before sending."],
      ["tracking number", "n", "mã vận đơn", "a number used to follow a delivery", "", "Enter your tracking number on our website."],
      ["track", "v", "theo dõi (đơn hàng)", "to follow the progress of something", "follow", "You can track your order online."],
      ["carrier", "n", "hãng vận chuyển", "a company that transports goods", "shipping company", "We use two carriers for overseas orders."],
      ["logistics", "n", "hậu cần, kho vận", "the planning and moving of goods", "", "She works in logistics for a large retailer."],
      ["distribution center", "n", "trung tâm phân phối", "a building from which goods are sent to stores", "", "The new distribution center serves the whole region."],
      ["stock", "n", "hàng tồn kho", "the goods a business has available", "inventory", "We are running low on stock."],
      ["out of stock", "adj", "hết hàng", "not available because all have been sold", "sold out", "That model is out of stock until May."],
      ["in stock", "adj", "còn hàng", "available to be sold now", "available", "The blue chairs are in stock."],
      ["shipping fee", "n", "phí vận chuyển", "the money charged for sending goods", "delivery charge", "Shipping fees are free for orders over $50."],
      ["express delivery", "n", "giao hàng nhanh", "a faster and more expensive delivery service", "", "Choose express delivery to receive it tomorrow."],
      ["deliver", "v", "giao (hàng)", "to take goods to a place or person", "", "We deliver to all areas of the city."],
      ["delivery", "n", "sự giao hàng", "the act of taking goods to someone", "", "Delivery takes three to five business days."],
      ["handle", "v", "xử lý, cầm nắm", "to deal with or touch something", "deal with", "Please handle these boxes with care."],
      ["damaged", "adj", "bị hư hại", "harmed or broken", "", "Two items arrived damaged."],
      ["missing", "adj", "bị thiếu, bị mất", "not in the expected place", "lost", "One box from the order is missing."],
      ["route", "n", "tuyến đường", "the way taken to get somewhere", "", "The driver took a faster route."],
      ["truck", "n", "xe tải", "a large vehicle for carrying goods", "lorry", "The truck can carry ten tons."],
      ["vehicle", "n", "phương tiện, xe", "a machine used for transporting people or goods", "", "Company vehicles must be returned by 6 P.M."],
      ["supplier", "n", "nhà cung cấp", "a company that provides goods", "vendor", "Our main supplier is in Thailand."],
      ["import", "v", "nhập khẩu", "to bring goods into a country to sell", "", "We import coffee beans from Brazil."],
      ["export", "v", "xuất khẩu", "to sell goods to another country", "", "The factory exports furniture to Europe."],
      ["proof of delivery", "n", "bằng chứng giao hàng", "a document or signature showing goods arrived", "", "The driver needs a signature as proof of delivery."],
      ["consignment", "n", "lô hàng gửi", "a set of goods sent together", "shipment", "The next consignment will leave on Monday."],
    ],
    part2: [
      p2("w2d9-p2-1", "where", "Where should the driver unload the pallets?", ["At loading dock two.", "About forty boxes.", "He drove last week."], 0,
        "Where → nơi dỡ hàng."),
      p2("w2d9-p2-2", "why", "Why hasn't my package arrived yet?", ["The carrier had a delay at customs.", "A large package.", "Yes, it's packed."], 0,
        "Why → lý do. (C) lặp âm \"pack\".", ["M", "W"]),
      p2("w2d9-p2-3", "yesno", "Is the blue model still in stock?", ["We just sold the last one.", "Stock prices are rising.", "It's a nice blue."], 0,
        "Trả lời gián tiếp = hết hàng. (B) lặp \"stock\" với nghĩa cổ phiếu."),
      p2("w2d9-p2-4", "how", "How can I track my order?", ["Use the number on your receipt.", "On the train track.", "Two days ago."], 0,
        "How → cách làm. (B) lặp \"track\" với nghĩa đường ray.", ["M", "W"]),
    ],
    part5: [
      p5("w2d9-p5-1", "passive", "All packages ------- before they leave the warehouse.", ["are weighed", "weigh", "are weighing", "have weighed"], 0,
        "Gói hàng \"được cân\" → bị động are weighed."),
      p5("w2d9-p5-2", "passive", "The damaged boxes ------- to the supplier yesterday.", ["were returned", "returned", "are returning", "return"], 0,
        "Hộp hàng \"được gửi trả\", có \"yesterday\" → were returned."),
      p5("w2d9-p5-3", "passive", "Your order will ------- by express delivery.", ["be shipped", "ship", "shipping", "have shipped"], 0,
        "will + be + V3 → bị động tương lai."),
      p5("w2d9-p5-4", "passive", "The new distribution center ------- by over 200 workers.", ["is staffed", "staffs", "is staffing", "staffed"], 0,
        "Trung tâm \"được vận hành bởi\" 200 nhân viên → bị động is staffed."),
    ],
    part7: {
      id: "w2d9-p7",
      kind: "e-mail",
      title: "E-mail",
      passage: `To: Order Department, Nova Office Supplies
From: Hana Le
Subject: Order #58312

Hello,

My order of twenty desk chairs was delivered to our office this morning. Unfortunately, three boxes were damaged, and one box is missing. The driver left before I could check the shipment, so I did not sign the proof of delivery.

The tracking number shows that the order left your distribution center as one consignment of six pallets, but only five pallets were unloaded here.

Could you send the missing chairs by express delivery and arrange for the damaged ones to be picked up? We need all twenty chairs before our new staff start on Monday.

Hana Le
Office Manager`,
      questions: [
        rq("detail", "What problem does Ms. Le report?", ["Part of an order is damaged or missing.", "The chairs are the wrong color.", "The invoice is incorrect.", "The delivery was very late."], 0,
          "3 thùng hỏng và 1 thùng thiếu → một phần đơn hàng hư hoặc mất."),
        rq("inference", "What is suggested about the shipment?", ["One pallet did not arrive.", "It was sent by the wrong carrier.", "It was signed for by the driver.", "It was delivered on Monday."], 0,
          "Gửi đi 6 pallet nhưng chỉ dỡ 5 → thiếu 1 pallet."),
        rq("detail", "Why does Ms. Le need the chairs quickly?", ["New employees will start soon.", "A sale ends on Monday.", "The office is moving.", "A client is visiting."], 0,
          "\"before our new staff start on Monday\"."),
      ],
    },
  },

  {
    day: 10,
    topic: "finance",
    theme: "Ngân hàng & thanh toán",
    words: [
      ["bank statement", "n", "sao kê ngân hàng", "a record of money paid in and out of an account", "", "Check your bank statement every month."],
      ["transaction", "n", "giao dịch", "an act of buying, selling or moving money", "", "Each transaction is recorded online."],
      ["wire transfer", "n", "chuyển khoản", "sending money electronically from one bank to another", "bank transfer", "Payment can be made by wire transfer."],
      ["checking account", "n", "tài khoản thanh toán", "a bank account for everyday payments", "current account", "My salary goes into my checking account."],
      ["savings account", "n", "tài khoản tiết kiệm", "a bank account that earns interest", "", "She opened a savings account for her children."],
      ["credit card", "n", "thẻ tín dụng", "a card used to buy now and pay later", "", "We accept all major credit cards."],
      ["cash", "n", "tiền mặt", "money in coins or notes", "", "The taxi driver only takes cash."],
      ["teller", "n", "giao dịch viên ngân hàng", "a bank employee who handles money at the counter", "cashier", "The teller counted the money twice."],
      ["currency", "n", "tiền tệ", "the money used in a country", "", "You can exchange currency at the airport."],
      ["exchange rate", "n", "tỷ giá", "the value of one currency compared with another", "", "The exchange rate changes every day."],
      ["fee", "n", "phí", "money paid for a service", "charge", "There is no fee for online transfers."],
      ["charge", "v", "tính phí", "to ask an amount of money for something", "bill", "The bank charges $2 for each withdrawal."],
      ["payment", "n", "khoản thanh toán", "money paid for something", "", "Payment is due within 30 days."],
      ["installment", "n", "khoản trả góp", "one of several payments made over time", "", "You can pay for the laptop in six installments."],
      ["mortgage", "n", "khoản vay thế chấp (mua nhà)", "a loan used to buy a house", "home loan", "They took out a mortgage to buy the apartment."],
      ["borrow", "v", "vay, mượn", "to take money that you will pay back", "", "The company borrowed money to expand."],
      ["lend", "v", "cho vay", "to give money that will be paid back", "loan", "Banks lend money to small businesses."],
      ["debt", "n", "khoản nợ", "money that you owe", "", "The company has paid off all its debts."],
      ["owe", "v", "nợ", "to need to pay money to someone", "", "We still owe the supplier $500."],
      ["credit", "n", "tín dụng; tiền ghi có", "money added to an account, or the ability to buy now and pay later", "", "A credit of $20 was added to your account."],
      ["financial", "adj", "thuộc tài chính", "related to money", "", "We hired a financial advisor."],
      ["fund", "n", "quỹ", "an amount of money saved for a purpose", "", "The company set up a fund for staff training."],
      ["invest", "v", "đầu tư", "to put money into something to make a profit", "", "We plan to invest in new machines."],
      ["investment", "n", "khoản đầu tư", "money put into something to gain more", "", "The new store was a good investment."],
      ["investor", "n", "nhà đầu tư", "a person who invests money", "", "Investors were pleased with the results."],
      ["asset", "n", "tài sản", "something valuable owned by a person or company", "", "The building is the company's largest asset."],
      ["afford", "v", "có đủ khả năng chi trả", "to have enough money for something", "", "We cannot afford a new office this year."],
      ["affordable", "adj", "giá phải chăng", "not too expensive", "reasonably priced", "The hotel offers affordable rooms."],
      ["outstanding", "adj", "chưa thanh toán; xuất sắc", "not yet paid; or excellent", "unpaid", "Please pay the outstanding balance by Friday."],
      ["online banking", "n", "ngân hàng trực tuyến", "managing a bank account over the internet", "", "Online banking is available 24 hours a day."],
      ["pay off", "v", "trả hết (nợ)", "to finish paying a debt", "repay", "He paid off his car loan last year."],
      ["deduct", "v", "khấu trừ", "to take an amount away from a total", "subtract", "Taxes are deducted from your salary."],
      ["financial advisor", "n", "cố vấn tài chính", "a person who gives advice about money", "", "Speak to a financial advisor before you invest."],
    ],
    part2: [
      p2("w2d10-p2-1", "how", "How would you like to pay?", ["By credit card, please.", "I paid last week.", "About twenty dollars."], 0,
        "Hỏi cách trả tiền → thẻ tín dụng. (B) lặp \"pay\"."),
      p2("w2d10-p2-2", "what", "What's the fee for a wire transfer?", ["It's free for business accounts.", "Wire the money tomorrow.", "Transfer at the next station."], 0,
        "Hỏi phí → miễn phí. (B), (C) lặp từ.", ["M", "W"]),
      p2("w2d10-p2-3", "when", "When was the last payment made?", ["On the first of this month.", "Make it by hand.", "To the bank."], 0,
        "When → ngày thanh toán."),
      p2("w2d10-p2-4", "yesno", "Do we still owe the supplier any money?", ["No, we paid off the balance.", "I own two cars.", "The supply room."], 0,
        "No + giải thích. (B) \"own\" gần âm \"owe\".", ["M", "W"]),
    ],
    part5: [
      p5("w2d10-p5-1", "tense", "The bank ------- a new mobile app last month.", ["launched", "launches", "has launched", "will launch"], 0,
        "\"last month\" → quá khứ đơn."),
      p5("w2d10-p5-2", "tense", "We ------- the loan by the end of next year.", ["will have paid off", "paid off", "have paid off", "pay off"], 0,
        "\"By the end of next year\" → tương lai hoàn thành."),
      p5("w2d10-p5-3", "tense", "Ms. Bui ------- as a financial advisor for over ten years.", ["has worked", "works", "is working", "worked"], 0,
        "\"for over ten years\" (vẫn đang làm) → hiện tại hoàn thành."),
      p5("w2d10-p5-4", "tense", "The exchange rate usually ------- several times a day.", ["changes", "changed", "is changed", "has changed"], 0,
        "\"usually\" → hiện tại đơn changes."),
    ],
    part7: {
      id: "w2d10-p7",
      kind: "notice",
      title: "Bank notice",
      passage: `CENTRAL CITY BANK — Changes to account fees

From July 1, the following changes will take effect for all checking accounts:

• Wire transfers made through online banking will be free. Transfers made with a teller will cost $3.
• The monthly account fee of $5 will be charged only if your balance falls below $500.
• Paper bank statements will cost $1 each. Electronic statements remain free.

Customers who have an outstanding credit card balance can now pay it in up to six installments with no extra charge.

If you have questions, please visit any branch or call 1-800-555-0123.`,
      questions: [
        rq("detail", "How can customers avoid a fee for wire transfers?", ["By using online banking", "By visiting a teller", "By opening a savings account", "By paying in cash"], 0,
          "Chuyển khoản qua online banking sẽ miễn phí."),
        rq("detail", "When will the monthly account fee be charged?", ["When the balance is under $500", "Every month for all customers", "Only for new accounts", "When a statement is printed"], 0,
          "\"only if your balance falls below $500\"."),
        rq("paraphrase", "What is new for credit card customers?", ["They can spread a payment over several months.", "They will receive a higher limit.", "They will get free paper statements.", "They can transfer money abroad."], 0,
          "\"pay it in up to six installments\" = trả góp tối đa 6 lần."),
      ],
    },
  },

  {
    day: 11,
    topic: "shopping",
    theme: "Mua sắm & cửa hàng",
    words: [
      ["customer", "n", "khách hàng", "a person who buys goods or services", "client", "The store was full of customers on Saturday."],
      ["cashier", "n", "thu ngân", "a person who takes payments in a shop", "", "Please pay the cashier at the front."],
      ["checkout", "n", "quầy tính tiền", "the place where you pay in a shop", "", "There was a long line at the checkout."],
      ["aisle", "n", "lối đi giữa các kệ", "a passage between shelves in a store", "", "Cleaning products are in aisle five."],
      ["shelf", "n", "kệ hàng", "a flat board for putting things on", "", "Please put the books back on the shelf."],
      ["display", "n", "khu trưng bày", "an arrangement of goods for people to see", "", "The window display shows our new summer clothes."],
      ["price tag", "n", "nhãn giá", "a label showing the price of something", "", "The price tag says $25."],
      ["on sale", "adj", "đang giảm giá", "available at a lower price than usual", "discounted", "All shoes are on sale this week."],
      ["bargain", "n", "món hời", "something bought for less than its usual price", "good deal", "This jacket was a real bargain."],
      ["item", "n", "món hàng", "a single thing in a list or group", "article", "You can return any item within 30 days."],
      ["quality", "n", "chất lượng", "how good something is", "", "We only sell products of high quality."],
      ["try on", "v", "mặc thử", "to put on clothes to see if they fit", "", "Can I try on this shirt?"],
      ["fitting room", "n", "phòng thử đồ", "a room in a shop where you try on clothes", "changing room", "The fitting rooms are next to the stairs."],
      ["sold out", "adj", "bán hết", "with no more items left to sell", "out of stock", "The concert tickets are sold out."],
      ["payment method", "n", "phương thức thanh toán", "the way you pay for something", "", "We accept several payment methods, including mobile wallets."],
      ["gift card", "n", "thẻ quà tặng", "a card with money on it to spend in a store", "voucher", "She bought a gift card for her colleague."],
      ["membership", "n", "tư cách thành viên", "the state of belonging to a group or club", "", "Membership gives you 10 percent off every purchase."],
      ["store credit", "n", "tiền tích lũy để mua hàng tại cửa hàng", "money you can spend only in a particular store", "", "Without a receipt, you can get store credit instead of a refund."],
      ["return policy", "n", "chính sách đổi trả", "the rules for bringing back goods", "", "Please read our return policy before you buy."],
      ["wholesale", "adj", "bán sỉ", "selling goods in large amounts to other businesses", "", "Wholesale prices are lower than retail prices."],
      ["shopper", "n", "người mua sắm", "a person who is shopping", "customer", "The mall attracts thousands of shoppers."],
      ["expensive", "adj", "đắt", "costing a lot of money", "costly", "This model is too expensive for our budget."],
      ["reasonable", "adj", "hợp lý (giá)", "fair and not too high", "fair", "The prices at this market are very reasonable."],
      ["inexpensive", "adj", "rẻ, không đắt", "not costing much money", "cheap", "We offer inexpensive gifts for all occasions."],
      ["catalog", "n", "danh mục sản phẩm", "a book or list of products for sale", "brochure", "Our new catalog is available online."],
      ["online store", "n", "cửa hàng trực tuyến", "a shop on the internet", "web shop", "Our online store is open 24 hours a day."],
      ["shopping cart", "n", "giỏ hàng, xe đẩy", "a basket on wheels, or a list of items you plan to buy online", "", "You have three items in your shopping cart."],
      ["department store", "n", "cửa hàng bách hóa", "a large store selling many kinds of goods", "", "The department store has seven floors."],
      ["mall", "n", "trung tâm mua sắm", "a large building with many shops", "shopping center", "The new mall opens next month."],
      ["promotion", "n", "chương trình khuyến mãi", "an activity to increase sales, such as a discount", "special offer", "The summer promotion ends on Sunday."],
      ["cost", "v", "có giá", "to have a particular price", "", "How much does this lamp cost?"],
      ["selection", "n", "sự lựa chọn đa dạng", "a range of things to choose from", "range", "The shop has a wide selection of teas."],
      ["in-store", "adj", "tại cửa hàng", "happening inside a physical shop", "", "This discount is for in-store purchases only."],
    ],
    part2: [
      p2("w2d11-p2-1", "where", "Where are the fitting rooms?", ["Next to the shoe department.", "It fits you well.", "Five dollars each."], 0,
        "Where → vị trí. (B) \"fits\" gần âm \"fitting\"."),
      p2("w2d11-p2-2", "yesno", "Is this jacket on sale?", ["Yes, it's 30 percent off.", "I'll sail tomorrow.", "Sales were good."], 0,
        "Yes + thông tin. (B) \"sail\" đồng âm \"sale\".", ["M", "W"]),
      p2("w2d11-p2-3", "how", "How much does the gift card cost?", ["You choose the amount.", "It's a nice card.", "Many gifts."], 0,
        "Trả lời gián tiếp: tự chọn số tiền."),
      p2("w2d11-p2-4", "what", "What's your return policy?", ["Thirty days with a receipt.", "I'll return at six.", "It's a new policy holder."], 0,
        "Hỏi chính sách đổi trả → điều kiện.", ["M", "W"]),
    ],
    part5: [
      p5("w2d11-p5-1", "wordform", "The store offers a wide ------- of organic products.", ["selection", "select", "selective", "selectively"], 0,
        "Sau \"a wide\" (mạo từ + tính từ) → danh từ selection."),
      p5("w2d11-p5-2", "wordform", "Our prices are ------- lower than those of other online stores.", ["considerably", "considerable", "consider", "consideration"], 0,
        "Bổ nghĩa cho tính từ so sánh \"lower\" → trạng từ considerably."),
      p5("w2d11-p5-3", "wordform", "Shoppers found the new checkout system very -------.", ["convenient", "convenience", "conveniently", "conveniences"], 0,
        "find + tân ngữ + TÍNH TỪ → convenient."),
      p5("w2d11-p5-4", "wordform", "------- to our membership program is free for all customers.", ["Admission", "Admit", "Admitted", "Admissible"], 0,
        "Đầu câu làm chủ ngữ → danh từ Admission."),
    ],
    part7: {
      id: "w2d11-p7",
      kind: "advertisement",
      title: "Advertisement",
      passage: `MAPLE DEPARTMENT STORE — Spring Promotion

From April 3 to April 9, all spring clothing is on sale at 20 percent off. Members save an extra 10 percent at the checkout.

Not a member yet? Membership is free! Sign up at any cashier or in our online store.

Shoppers who spend over $100 will receive a $10 gift card to use on their next visit.

Please note: sale items can be exchanged for a different size within 14 days, but they cannot be returned for a refund. See our full return policy at maple.example/returns.`,
      questions: [
        rq("detail", "How much can members save on spring clothing?", ["30 percent", "10 percent", "20 percent", "$10"], 0,
          "20% cho mọi người + thêm 10% cho thành viên = 30%."),
        rq("detail", "What do shoppers get if they spend over $100?", ["A gift card", "Free membership", "Free delivery", "A refund"], 0,
          "\"will receive a $10 gift card\"."),
        rq("detail", "What is true about sale items?", ["They can only be exchanged.", "They can be returned within 14 days.", "They cannot be tried on.", "They are sold only online."], 0,
          "Hàng giảm giá chỉ được đổi size, không hoàn tiền."),
      ],
    },
  },

  {
    day: 12,
    topic: "contracts",
    theme: "Hợp đồng & pháp lý",
    words: [
      ["sign", "v", "ký", "to write your name on a document", "", "Both managers signed the contract yesterday."],
      ["terms", "n", "điều khoản", "the conditions of an agreement", "conditions", "Please read the terms before you sign."],
      ["clause", "n", "điều khoản (một mục)", "a section of a legal document", "provision", "Clause 5 covers late payments."],
      ["legal", "adj", "thuộc pháp lý; hợp pháp", "related to the law, or allowed by law", "lawful", "Our legal team will review the agreement."],
      ["lawyer", "n", "luật sư", "a person whose job is to give legal advice", "attorney", "Ask a lawyer to check the contract."],
      ["contractor", "n", "nhà thầu", "a person or company paid to do a job", "", "The contractor will finish the roof next week."],
      ["client", "n", "khách hàng (dịch vụ)", "a person or company that pays for a service", "customer", "We signed a three-year contract with a new client."],
      ["vendor", "n", "nhà cung cấp, người bán", "a company that sells goods or services", "supplier", "We are comparing prices from three vendors."],
      ["expiration date", "n", "ngày hết hạn", "the date after which something is no longer valid", "", "The contract's expiration date is December 31."],
      ["amendment", "n", "sự sửa đổi, bổ sung", "a change made to a document", "revision", "An amendment was added to the agreement."],
      ["amend", "v", "sửa đổi", "to make changes to a document", "revise", "We need to amend the delivery dates."],
      ["breach", "n", "sự vi phạm", "the breaking of an agreement or rule", "violation", "Late delivery is a breach of the contract."],
      ["penalty", "n", "tiền phạt, hình phạt", "a punishment, often money, for breaking a rule", "fine", "There is a penalty for late payment."],
      ["liability", "n", "trách nhiệm pháp lý", "legal responsibility for something", "", "The company has no liability for lost items."],
      ["disclose", "v", "tiết lộ", "to make information known", "reveal", "Employees must not disclose client information."],
      ["consent", "n", "sự đồng ý", "permission for something to happen", "approval", "We need your written consent to share this data."],
      ["signatory", "n", "bên ký kết", "a person or company that signs an agreement", "", "All signatories received a copy."],
      ["enforce", "v", "thi hành, thực thi", "to make sure a rule is obeyed", "", "The new rules will be strictly enforced."],
      ["dispute", "n", "tranh chấp", "a disagreement, often formal", "disagreement", "The dispute was settled without going to court."],
      ["settle", "v", "giải quyết (tranh chấp); thanh toán", "to end a disagreement, or to pay a bill", "resolve", "The two companies settled the matter quickly."],
      ["mutual", "adj", "chung, của cả hai bên", "shared by two or more people", "joint", "The agreement is to our mutual benefit."],
      ["in accordance with", "prep", "phù hợp với, theo đúng", "following a rule or agreement", "according to", "Payments are made in accordance with the contract."],
      ["upon request", "adv", "theo yêu cầu", "when someone asks", "on request", "Copies are available upon request."],
      ["renewal", "n", "sự gia hạn", "the act of making an agreement continue", "extension", "The contract is up for renewal in May."],
      ["lease", "n", "hợp đồng thuê", "a contract for renting a building or equipment", "rental agreement", "We signed a five-year lease for the office."],
      ["tenant", "n", "người thuê (nhà, văn phòng)", "a person or company that rents property", "renter", "The tenants must pay rent on the first of each month."],
      ["landlord", "n", "chủ nhà, chủ cho thuê", "a person or company that rents property to others", "property owner", "The landlord agreed to repair the heating."],
      ["valid until", "prep", "có hiệu lực đến", "able to be used up to a certain date", "", "This quote is valid until June 30."],
      ["fine print", "n", "phần chữ nhỏ (điều kiện chi tiết)", "the detailed conditions of a contract, often in small letters", "", "Always read the fine print."],
      ["obligate", "v", "bắt buộc (về mặt pháp lý)", "to make someone legally or morally required to do something", "require", "The contract obligates us to deliver within 10 days."],
      ["guarantee", "n", "sự bảo đảm", "a promise that something will happen or work", "warranty", "The work comes with a one-year guarantee."],
      ["legally", "adv", "về mặt pháp lý", "according to the law", "", "The agreement is legally binding."],
      ["counterpart", "n", "người/bên tương ứng", "a person with the same job in another organization", "", "Our manager met her counterpart from the client company."],
    ],
    part2: [
      p2("w2d12-p2-1", "yesno", "Has the client signed the contract yet?", ["Their lawyer is still reviewing it.", "Yes, a road sign.", "It's a short contract."], 0,
        "Trả lời gián tiếp = chưa. (B) lặp \"sign\" với nghĩa biển báo."),
      p2("w2d12-p2-2", "when", "When does our office lease expire?", ["At the end of next year.", "The landlord's office.", "It's quite expensive."], 0,
        "When → thời điểm hết hạn.", ["M", "W"]),
      p2("w2d12-p2-3", "what", "What happens if the vendor delivers late?", ["They have to pay a penalty.", "A late lunch.", "It's on the list."], 0,
        "Hỏi hệ quả → bị phạt. (B) lặp \"late\"."),
      p2("w2d12-p2-4", "choice", "Should we amend the contract or write a new one?", ["A small amendment should be enough.", "Yes, we should.", "I wrote it down."], 0,
        "Chọn \"sửa đổi\" bằng cách diễn đạt khác.", ["M", "W"]),
    ],
    part5: [
      p5("w2d12-p5-1", "prep", "Payments must be made ------- accordance with the terms of the agreement.", ["in", "on", "at", "by"], 0,
        "Cụm cố định \"in accordance with\"."),
      p5("w2d12-p5-2", "prep", "The contract is valid ------- December 31.", ["until", "since", "during", "among"], 0,
        "Có hiệu lực kéo dài TỚI ngày 31/12 → until."),
      p5("w2d12-p5-3", "prep", "Copies of the lease are available ------- request.", ["upon", "for", "with", "under"], 0,
        "Cụm cố định \"upon request\" = theo yêu cầu."),
      p5("w2d12-p5-4", "prep", "The dispute ------- the two companies was settled last week.", ["between", "among", "across", "along"], 0,
        "Hai công ty → between."),
    ],
    part7: {
      id: "w2d12-p7",
      kind: "letter",
      title: "Letter",
      passage: `Dear Mr. Pham,

Thank you for choosing GreenTech Cleaning as your office cleaning contractor. Please find enclosed two copies of our service agreement.

Under the terms of the agreement, our team will clean your office every weekday evening. The agreement is valid until March 31 next year and will be renewed automatically unless either party gives 30 days' written notice.

Please note Clause 7: if a cleaning visit is missed, you will receive a credit equal to the cost of that visit.

Please sign both copies and return one to us by April 5. If you would like to amend any terms, our legal team will be happy to discuss them with you.

Sincerely,
Anna Vu
GreenTech Cleaning`,
      questions: [
        rq("detail", "Why did Ms. Vu write to Mr. Pham?", ["To send a contract to sign", "To ask for a payment", "To cancel a service", "To apologize for a missed visit"], 0,
          "Gửi kèm 2 bản hợp đồng dịch vụ để ký."),
        rq("detail", "What happens if neither party gives notice?", ["The agreement continues automatically.", "The agreement ends on March 31.", "A penalty is charged.", "The price increases."], 0,
          "\"will be renewed automatically unless either party gives … notice\"."),
        rq("paraphrase", "According to Clause 7, what will Mr. Pham get if a visit is missed?", ["Money back on his account", "An extra cleaning visit", "A free consultation", "A new contract"], 0,
          "\"a credit equal to the cost of that visit\" = khoản ghi có bằng tiền của buổi đó."),
      ],
    },
  },

  {
    day: 13,
    topic: "hotel",
    theme: "Khách sạn & lưu trú",
    words: [
      ["front desk", "n", "quầy lễ tân", "the desk at a hotel entrance where guests check in", "reception", "Please leave your key at the front desk."],
      ["receptionist", "n", "nhân viên lễ tân", "a person who welcomes guests and answers calls", "", "The receptionist booked a taxi for us."],
      ["room service", "n", "dịch vụ phòng", "a hotel service bringing food to your room", "", "Room service is available until midnight."],
      ["wake-up call", "n", "cuộc gọi báo thức", "a phone call from the hotel to wake you", "", "Could I have a wake-up call at 6 A.M.?"],
      ["single room", "n", "phòng đơn", "a room for one person", "", "I booked a single room for two nights."],
      ["double room", "n", "phòng đôi", "a room with one large bed for two people", "", "A double room costs $120 per night."],
      ["key card", "n", "thẻ từ mở phòng", "a plastic card used to open a hotel room", "", "My key card doesn't work."],
      ["lobby", "n", "sảnh", "the entrance hall of a hotel or building", "foyer", "Let's meet in the hotel lobby at nine."],
      ["elevator", "n", "thang máy", "a machine that carries people between floors", "lift", "The elevators are to the left of the front desk."],
      ["room rate", "n", "giá phòng", "the price of a hotel room for one night", "", "Room rates are higher on weekends."],
      ["per night", "adv", "mỗi đêm", "for each night", "", "The suite costs $300 per night."],
      ["cancellation policy", "n", "chính sách hủy phòng", "the rules about canceling a booking", "", "Our cancellation policy allows free cancellation up to 48 hours before arrival."],
      ["booking confirmation", "n", "xác nhận đặt phòng", "a message showing a booking has been made", "", "Please show your booking confirmation at check-in."],
      ["extra bed", "n", "giường phụ", "an additional bed put in a room", "rollaway bed", "An extra bed costs $20 per night."],
      ["laundry service", "n", "dịch vụ giặt ủi", "a service that washes clothes for guests", "", "Laundry service is free for suite guests."],
      ["fitness center", "n", "phòng tập thể dục", "a room with exercise machines", "gym", "The fitness center is open 24 hours."],
      ["swimming pool", "n", "hồ bơi", "a large pool for swimming", "pool", "The rooftop swimming pool has a great view."],
      ["business center", "n", "trung tâm dịch vụ văn phòng (khách sạn)", "a room with computers and printers for guests", "", "You can print your boarding pass in the business center."],
      ["luggage storage", "n", "dịch vụ giữ hành lý", "a place to keep bags safely", "baggage storage", "Free luggage storage is available after checkout."],
      ["porter", "n", "nhân viên khuân hành lý", "a person who carries bags in a hotel", "bellhop", "The porter took our bags to the room."],
      ["hospitality", "n", "ngành khách sạn; sự hiếu khách", "the business of hotels and restaurants, or friendly treatment of guests", "", "She has worked in hospitality for ten years."],
      ["lodging", "n", "chỗ ở tạm", "a place to stay", "accommodation", "The price includes lodging and meals."],
      ["resort", "n", "khu nghỉ dưỡng", "a place where people go for holidays", "", "The company retreat will be held at a beach resort."],
      ["accommodate", "v", "có sức chứa; đáp ứng", "to have enough space for, or to provide what is needed", "hold", "The ballroom can accommodate 400 guests."],
      ["late checkout", "n", "trả phòng muộn", "permission to leave your room later than usual", "", "We requested a late checkout at 2 P.M."],
      ["early check-in", "n", "nhận phòng sớm", "permission to enter your room earlier than usual", "", "Early check-in is subject to availability."],
      ["view", "n", "tầm nhìn, quang cảnh", "what you can see from a place", "", "All rooms have a view of the river."],
      ["maid", "n", "nhân viên dọn phòng", "a person who cleans hotel rooms", "housekeeper", "The maid will clean your room in the morning."],
      ["towel", "n", "khăn tắm", "a cloth for drying yourself", "", "Could you send up some extra towels?"],
      ["inconvenient", "adj", "bất tiện", "causing problems or difficulty", "", "We apologize if the noise was inconvenient."],
      ["valet parking", "n", "dịch vụ đỗ xe hộ", "a service where staff park your car", "", "Valet parking costs $15 a day."],
      ["guest room", "n", "phòng khách (lưu trú)", "a room in a hotel for guests to sleep in", "", "All guest rooms have free Wi-Fi."],
      ["front office", "n", "bộ phận tiền sảnh", "the hotel department that deals with guests", "", "The front office manager handles complaints."],
    ],
    part2: [
      p2("w2d13-p2-1", "what", "What time is checkout?", ["Eleven A.M., but you can request a late checkout.", "I'll check it out.", "Room 405."], 0,
        "Hỏi giờ trả phòng. (B) lặp \"check out\" với nghĩa xem thử."),
      p2("w2d13-p2-2", "yesno", "Could I have a wake-up call at six?", ["Certainly, what's your room number?", "I woke up early.", "Call me later."], 0,
        "Lời đề nghị → đồng ý và hỏi lại số phòng.", ["M", "W"]),
      p2("w2d13-p2-3", "where", "Where's the fitness center?", ["On the second floor, next to the pool.", "It fits perfectly.", "From six to ten."], 0,
        "Where → vị trí. (B) \"fits\" gần âm."),
      p2("w2d13-p2-4", "how", "How many guests can the ballroom accommodate?", ["Up to four hundred.", "A beautiful room.", "They checked in yesterday."], 0,
        "How many → con số.", ["M", "W"]),
    ],
    part5: [
      p5("w2d13-p5-1", "sva", "Each of our guest rooms ------- a view of the river.", ["has", "have", "are having", "were having"], 0,
        "\"Each of + N\" → số ít has."),
      p5("w2d13-p5-2", "sva", "The towels in the bathroom ------- changed every day.", ["are", "is", "was", "has been"], 0,
        "Chủ ngữ chính \"The towels\" (số nhiều) → are."),
      p5("w2d13-p5-3", "sva", "The hotel staff ------- trained to handle guest complaints politely.", ["is", "are being", "were being", "have"], 0,
        "\"staff\" khi nói cả nhóm, TOEIC thường dùng số ít → is."),
      p5("w2d13-p5-4", "sva", "Neither the pool nor the fitness center ------- open before 6 A.M.", ["is", "are", "were", "have been"], 0,
        "Neither A nor B → chia theo B (the fitness center, số ít) → is."),
    ],
    part7: {
      id: "w2d13-p7",
      kind: "e-mail",
      title: "Booking confirmation",
      passage: `Subject: Booking confirmation #H7721 — Riverside Hotel

Dear Ms. Tran,

Thank you for your reservation. Your booking details are:
• Double room with river view, 2 nights (May 14–16)
• Room rate: $140 per night, breakfast included
• Extra bed: requested

Check-in is from 2:00 P.M. Early check-in is subject to availability; please contact the front desk on the day of arrival. Checkout is at 11:00 A.M. Free luggage storage is available if your flight leaves later.

Our cancellation policy allows free cancellation until 48 hours before arrival.

We look forward to welcoming you.
Front Office, Riverside Hotel`,
      questions: [
        rq("detail", "What is included in the room rate?", ["Breakfast", "An extra bed", "Airport transfer", "Laundry service"], 0,
          "\"Room rate: $140 per night, breakfast included\"."),
        rq("inference", "What should Ms. Tran do if she wants to check in early?", ["Call the hotel on her arrival day", "Pay an extra fee in advance", "Book a second night", "Reply to this e-mail"], 0,
          "\"please contact the front desk on the day of arrival\"."),
        rq("detail", "Until when can Ms. Tran cancel without charge?", ["Two days before arrival", "The day of arrival", "One week before arrival", "Checkout time"], 0,
          "\"until 48 hours before arrival\" = 2 ngày trước."),
      ],
    },
  },

  {
    day: 14,
    topic: "tech",
    theme: "Máy tính & liên lạc",
    words: [
      ["laptop", "n", "máy tính xách tay", "a small portable computer", "notebook", "Each new employee receives a laptop."],
      ["software", "n", "phần mềm", "programs used by a computer", "", "The accounting software was updated last night."],
      ["hardware", "n", "phần cứng", "the physical parts of a computer", "", "The IT team handles all hardware problems."],
      ["network", "n", "mạng", "a system of connected computers", "", "The office network will be down for an hour."],
      ["password", "n", "mật khẩu", "a secret word used to access a computer", "", "Change your password every three months."],
      ["log in", "v", "đăng nhập", "to enter a computer system with your name and password", "sign in", "Log in with your employee number."],
      ["download", "v", "tải xuống", "to copy files from the internet to your computer", "", "You can download the form from our website."],
      ["upload", "v", "tải lên", "to send files from your computer to the internet", "", "Please upload your photos to the shared drive."],
      ["attachment", "n", "tệp đính kèm", "a file sent with an e-mail", "", "I couldn't open the attachment."],
      ["inbox", "n", "hộp thư đến", "the folder where new e-mails arrive", "", "My inbox is full of messages."],
      ["website", "n", "trang web", "a set of pages on the internet", "site", "Our website has a new design."],
      ["browser", "n", "trình duyệt", "a program for looking at websites", "", "Open the link in your browser."],
      ["database", "n", "cơ sở dữ liệu", "an organized collection of data on a computer", "", "Customer details are stored in a database."],
      ["data", "n", "dữ liệu", "facts or information, especially on a computer", "information", "We collect data on customer orders."],
      ["backup", "n", "bản sao lưu", "a copy of data kept in case the original is lost", "", "We make a backup of all files every night."],
      ["file", "n", "tệp tin; hồ sơ", "a document stored on a computer or in a folder", "", "Save the file before you close it."],
      ["printer", "n", "máy in", "a machine that prints documents", "", "The printer on the second floor is out of ink."],
      ["scanner", "n", "máy quét", "a machine that copies documents into a computer", "", "Use the scanner to save the receipts as PDF files."],
      ["monitor", "n", "màn hình máy tính", "a computer screen", "screen", "I use two monitors at work."],
      ["device", "n", "thiết bị", "a machine or tool made for a purpose", "", "Please turn off all electronic devices."],
      ["charger", "n", "bộ sạc", "a device that puts power into a battery", "", "I forgot my phone charger at home."],
      ["battery", "n", "pin", "a device that stores electric power", "", "The laptop battery lasts about eight hours."],
      ["wireless", "adj", "không dây", "using radio signals instead of wires", "", "The hotel offers free wireless internet."],
      ["connection", "n", "kết nối", "a link that lets devices communicate", "", "The internet connection is very slow today."],
      ["technical support", "n", "hỗ trợ kỹ thuật", "help with computer or machine problems", "IT support", "Call technical support if your computer crashes."],
      ["user", "n", "người dùng", "a person who uses a product or computer", "", "The software is easy for new users."],
      ["crash", "v", "bị treo, sập (máy tính)", "to stop working suddenly", "freeze", "My computer crashed and I lost my work."],
      ["restart", "v", "khởi động lại", "to turn a computer off and on again", "reboot", "Restart your computer to finish the update."],
      ["security", "n", "an ninh, bảo mật", "protection against danger or attack", "", "Online security is very important for banks."],
      ["access code", "n", "mã truy cập", "a number or code needed to enter a system or room", "", "Enter the access code to join the video call."],
      ["e-mail address", "n", "địa chỉ e-mail", "the name used to send e-mails to someone", "", "Please write your e-mail address on the form."],
      ["voicemail", "n", "hộp thư thoại", "a system that records phone messages", "", "Please leave a message on my voicemail."],
      ["text message", "n", "tin nhắn văn bản", "a short written message sent by phone", "SMS", "You will receive a text message with your code."],
    ],
    part2: [
      p2("w2d14-p2-1", "why", "Why can't I log in to the network?", ["The password was reset this morning.", "It's a long log.", "Yes, the network is new."], 0,
        "Why → lý do. (B) lặp \"log\"."),
      p2("w2d14-p2-2", "who", "Who should I call about a broken monitor?", ["Technical support, at extension 300.", "I'll monitor the sales.", "It broke yesterday."], 0,
        "Who → bộ phận cần gọi. (B) lặp \"monitor\" với nghĩa theo dõi.", ["M", "W"]),
      p2("w2d14-p2-3", "yesno", "Did you get my e-mail with the attachment?", ["I can't find it in my inbox.", "Attach it to the wall.", "My mail box is red."], 0,
        "Trả lời gián tiếp = chưa nhận được."),
      p2("w2d14-p2-4", "choice", "Should I send the file by e-mail or upload it?", ["Uploading is faster for large files.", "Yes, please send it.", "I filed it last week."], 0,
        "Chọn upload. (C) lặp \"file\".", ["M", "W"]),
    ],
    part5: [
      p5("w2d14-p5-1", "conj", "Please save your work regularly ------- the computer crashes.", ["in case", "unless", "although", "so that"], 0,
        "\"in case\" = phòng khi."),
      p5("w2d14-p5-2", "conj", "The software is powerful, ------- it is also easy to use.", ["and", "or", "so", "nor"], 0,
        "Bổ sung ý cùng chiều → and."),
      p5("w2d14-p5-3", "conj", "------- the network was down, staff could not access their e-mail.", ["Because", "Despite", "Although", "Therefore"], 0,
        "Nguyên nhân + mệnh đề → Because."),
      p5("w2d14-p5-4", "conj", "Restart your laptop ------- the update is complete.", ["once", "unless", "whereas", "so"], 0,
        "\"once\" = ngay khi (cập nhật xong)."),
    ],
    part7: {
      id: "w2d14-p7",
      kind: "memo",
      title: "Memo from IT",
      passage: `MEMO
From: IT Department
To: All staff
Subject: Network upgrade this Saturday

The office network will be upgraded on Saturday from 8 A.M. to 2 P.M. During this time, the database, shared files and printers will not be available.

Before you leave on Friday, please:
1. Save all files to the shared drive so that they are included in the backup.
2. Turn off your monitor, but leave your laptop connected and switched on.

When you log in on Monday, you will be asked to create a new password. If you have any problems, contact technical support at extension 300 or by text message.`,
      questions: [
        rq("detail", "What will NOT be available on Saturday morning?", ["Shared files", "Telephones", "The building", "Text messages"], 0,
          "\"the database, shared files and printers will not be available\"."),
        rq("detail", "What should staff do with their laptops on Friday?", ["Leave them on and connected", "Take them home", "Turn them off", "Bring them to IT"], 0,
          "\"leave your laptop connected and switched on\"."),
        rq("inference", "What will happen on Monday?", ["Staff will set new passwords.", "The network will be upgraded again.", "New laptops will arrive.", "IT staff will visit each desk."], 0,
          "\"you will be asked to create a new password\"."),
      ],
    },
  },
];
