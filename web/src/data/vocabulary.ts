// Core TOEIC vocabulary by topic. Static data bundled with the app.
// Words come from two places: the original topic rows below and the day packs (data/dayPacks),
// which tie each day's words to that day's listening and reading.
import { dayPacks } from "./dayPacks";

export type VocabTopic =
  | "workplace"
  | "office"
  | "meeting"
  | "travel"
  | "hotel"
  | "restaurant"
  | "shopping"
  | "customer_service"
  | "delivery"
  | "schedule"
  | "contracts"
  | "marketing"
  | "finance"
  | "hr"
  | "product"
  | "events"
  | "tech"
  | "general";

export type VocabWord = {
  id: string;
  word: string;
  pos: string;
  meaningVi: string;
  meaningEn: string;
  /** Common TOEIC paraphrase (same meaning, different wording). */
  paraphrase: string | null;
  topic: VocabTopic;
  example: string;
};

export const TOPIC_LABEL: Record<VocabTopic, string> = {
  workplace: "Nơi làm việc",
  office: "Văn phòng",
  meeting: "Họp hành",
  travel: "Du lịch",
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  shopping: "Mua sắm",
  customer_service: "Chăm sóc khách hàng",
  delivery: "Giao hàng",
  schedule: "Lịch trình & thời gian",
  contracts: "Hợp đồng",
  marketing: "Tiếp thị",
  finance: "Tài chính & ngân hàng",
  hr: "Nhân sự & đào tạo",
  product: "Sản phẩm & chất lượng",
  events: "Sự kiện",
  tech: "Công nghệ & liên lạc",
  general: "Từ vựng chung",
};

export const TOPIC_ICON: Record<VocabTopic, string> = {
  workplace: "🧑‍💼",
  office: "🗂️",
  meeting: "🗣️",
  travel: "✈️",
  hotel: "🏨",
  restaurant: "🍽️",
  shopping: "🛍️",
  customer_service: "☎️",
  delivery: "📦",
  schedule: "📅",
  contracts: "📜",
  marketing: "📣",
  finance: "💰",
  hr: "🤝",
  product: "🏭",
  events: "🎪",
  tech: "💻",
  general: "🔤",
};

/** The 11 study groups from the 2,000-word plan, with how many words each should reach. */
export const VOCAB_GROUPS: { name: string; target: number; topics: VocabTopic[] }[] = [
  { name: "Office & Business", target: 250, topics: ["workplace", "office", "meeting"] },
  { name: "Finance & Accounting", target: 200, topics: ["finance"] },
  { name: "Marketing & Sales", target: 200, topics: ["marketing"] },
  { name: "Recruitment & HR", target: 200, topics: ["hr"] },
  { name: "Travel & Transportation", target: 200, topics: ["travel"] },
  { name: "Restaurant & Hospitality", target: 150, topics: ["restaurant", "hotel", "events"] },
  { name: "Manufacturing & Production", target: 200, topics: ["product", "delivery"] },
  { name: "Shopping & Retail", target: 150, topics: ["shopping", "customer_service"] },
  { name: "Technology & Communication", target: 150, topics: ["tech"] },
  { name: "Contracts & Legal", target: 100, topics: ["contracts"] },
  { name: "General vocabulary", target: 200, topics: ["schedule", "general"] },
];

// [topic, word, pos, Vietnamese, English definition, paraphrase ("" if none), example]
type Row = [VocabTopic, string, string, string, string, string, string];

const rows: Row[] = [
  // workplace
  ["workplace", "colleague", "n", "đồng nghiệp", "a person you work with", "coworker", "My colleague will cover my shift tomorrow."],
  ["workplace", "supervisor", "n", "người giám sát, quản lý trực tiếp", "a person who manages a team's work", "manager", "Please ask your supervisor to approve the form."],
  ["workplace", "candidate", "n", "ứng viên", "a person applying for a job", "applicant", "The strongest candidate has ten years of experience."],
  ["workplace", "recruit", "v", "tuyển dụng", "to find and hire new employees", "hire", "The firm plans to recruit twenty engineers this year."],
  ["workplace", "resign", "v", "từ chức, xin nghỉ việc", "to formally leave a job", "quit", "She resigned to start her own company."],
  ["workplace", "promote", "v", "thăng chức; quảng bá", "to move someone to a higher position", "advance", "He was promoted to regional director."],
  ["workplace", "qualification", "n", "trình độ, bằng cấp", "a skill or certificate needed for a job", "", "Applicants must have the necessary qualifications."],
  ["workplace", "salary", "n", "tiền lương (theo tháng/năm)", "fixed pay received regularly from an employer", "pay", "The salary increases after the first year."],
  ["workplace", "benefit", "n", "phúc lợi, lợi ích", "an extra advantage given with a job", "perk", "Health insurance is one of the main benefits."],
  ["workplace", "assign", "v", "giao (việc), chỉ định", "to give someone a task or duty", "allocate", "I was assigned to the Hanoi project."],
  ["workplace", "submit", "v", "nộp, đệ trình", "to hand in something for approval", "hand in", "Submit your expense report by Friday."],
  ["workplace", "department", "n", "phòng ban", "a section of a company with a specific function", "", "She works in the marketing department."],
  ["workplace", "experienced", "adj", "có kinh nghiệm", "having skill from doing something for a long time", "skilled", "We are looking for an experienced accountant."],
  // office
  ["office", "equipment", "n", "thiết bị", "tools and machines used for a job", "", "All office equipment must be checked monthly."],
  ["office", "supplies", "n", "đồ dùng, vật tư văn phòng", "items such as paper and pens used in an office", "", "We are running low on printer supplies."],
  ["office", "attach", "v", "đính kèm", "to add a file to an email or document", "enclose", "Please attach your résumé to the email."],
  ["office", "reimburse", "v", "hoàn tiền (chi phí đã trả)", "to pay back money someone has spent", "pay back", "The company will reimburse your travel costs."],
  ["office", "invoice", "n", "hóa đơn (yêu cầu thanh toán)", "a document asking for payment", "bill", "The invoice is due within thirty days."],
  ["office", "install", "v", "cài đặt, lắp đặt", "to put equipment or software in place", "set up", "Technicians will install the new software today."],
  ["office", "upgrade", "v", "nâng cấp", "to improve something to a better version", "", "The IT team will upgrade all computers this weekend."],
  ["office", "renovate", "v", "cải tạo, tân trang", "to repair and improve a building", "refurbish", "The lobby will be renovated next month."],
  ["office", "relocate", "v", "chuyển địa điểm", "to move to a different place", "move", "The head office will relocate to Da Nang."],
  ["office", "maintenance", "n", "bảo trì", "work done to keep something in good condition", "upkeep", "The elevator is closed for maintenance."],
  ["office", "vacancy", "n", "vị trí còn trống; phòng trống", "an empty job position or room", "opening", "There is a vacancy in the sales team."],
  ["office", "confidential", "adj", "bảo mật, tuyệt mật", "meant to be kept secret", "private", "Client files are strictly confidential."],
  ["office", "permit", "n", "giấy phép", "an official document allowing something", "license", "You need a permit to park in this lot."],
  // meeting
  ["meeting", "agenda", "n", "chương trình họp", "a list of topics to discuss at a meeting", "", "The agenda was sent to all participants."],
  ["meeting", "attend", "v", "tham dự", "to be present at an event", "be present at", "Over 200 people attended the conference."],
  ["meeting", "participate", "v", "tham gia", "to take part in an activity", "take part in", "All staff are encouraged to participate."],
  ["meeting", "propose", "v", "đề xuất", "to suggest a plan or idea", "suggest", "She proposed a new marketing strategy."],
  ["meeting", "approve", "v", "phê duyệt, chấp thuận", "to officially agree to something", "authorize", "The board approved the annual budget."],
  ["meeting", "postpone", "v", "hoãn lại", "to move an event to a later time", "delay", "The meeting was postponed until Monday."],
  ["meeting", "reschedule", "v", "đổi lịch", "to change the time of an event", "", "Can we reschedule our appointment to Thursday?"],
  ["meeting", "conclude", "v", "kết thúc; kết luận", "to bring something to an end", "finish", "The session will conclude at 5 p.m."],
  ["meeting", "minutes", "n", "biên bản họp", "an official written record of a meeting", "", "Who will take the minutes today?"],
  ["meeting", "proposal", "n", "đề xuất, bản kế hoạch", "a formal plan or suggestion", "", "The committee reviewed the proposal."],
  ["meeting", "revise", "v", "sửa đổi, chỉnh sửa", "to change something to improve it", "amend", "Please revise the schedule before the meeting."],
  ["meeting", "present", "v", "trình bày", "to show or explain something to a group", "", "He will present the quarterly results."],
  ["meeting", "unanimous", "adj", "nhất trí hoàn toàn", "agreed by everyone", "", "The vote was unanimous."],
  // travel
  ["travel", "itinerary", "n", "lịch trình chuyến đi", "a detailed plan of a journey", "travel plan", "The itinerary includes two days in Osaka."],
  ["travel", "destination", "n", "điểm đến", "the place someone is traveling to", "", "Bali is a popular tourist destination."],
  ["travel", "depart", "v", "khởi hành", "to leave a place", "leave", "The train departs from platform 3."],
  ["travel", "luggage", "n", "hành lý", "bags and suitcases for a trip", "baggage", "Passengers may carry one piece of luggage."],
  ["travel", "reservation", "n", "việc đặt chỗ", "an arrangement to keep a seat or room for you", "booking", "I made a reservation for two nights."],
  ["travel", "fare", "n", "giá vé", "the money paid for a trip on public transport", "ticket price", "Bus fares will rise next month."],
  ["travel", "passenger", "n", "hành khách", "a person traveling in a vehicle who is not the driver", "", "Passengers must show a boarding pass."],
  ["travel", "terminal", "n", "nhà ga, cảng", "a building where journeys begin or end", "", "Meet me at Terminal 2."],
  ["travel", "customs", "n", "hải quan", "the place where goods are checked at a border", "", "You must declare food items at customs."],
  ["travel", "commute", "v", "đi lại hằng ngày (đi làm)", "to travel regularly between home and work", "", "I commute to work by subway."],
  ["travel", "board", "v", "lên (tàu, xe, máy bay)", "to get on a plane, train, or ship", "get on", "Flight 220 is now boarding."],
  ["travel", "delay", "n", "sự chậm trễ", "a period of time when something is late", "", "Bad weather caused a two-hour delay."],
  ["travel", "valid", "adj", "có hiệu lực, hợp lệ", "officially acceptable or usable", "", "Your passport must be valid for six months."],
  // hotel
  ["hotel", "accommodation", "n", "chỗ ở", "a place to stay, such as a hotel room", "lodging", "Accommodation is included in the tour price."],
  ["hotel", "complimentary", "adj", "miễn phí (được tặng kèm)", "given free as a courtesy", "free of charge", "Complimentary breakfast is served daily."],
  ["hotel", "amenities", "n", "tiện nghi", "useful or pleasant features of a place", "facilities", "The hotel offers amenities such as a pool and gym."],
  ["hotel", "occupancy", "n", "tỷ lệ/mức sử dụng phòng", "the number of rooms in use at a given time", "", "Hotel occupancy is highest in July."],
  ["hotel", "concierge", "n", "nhân viên hỗ trợ khách (khách sạn)", "a hotel employee who helps guests with requests", "", "Ask the concierge to book a taxi."],
  ["hotel", "facility", "n", "cơ sở vật chất, tiện ích", "a building or service provided for a purpose", "", "The fitness facility opens at 6 a.m."],
  ["hotel", "available", "adj", "còn trống, có sẵn", "able to be used or obtained", "vacant", "Are any rooms available this weekend?"],
  ["hotel", "deposit", "n", "tiền đặt cọc", "a first payment to secure a booking", "", "A deposit of 20 percent is required."],
  ["hotel", "housekeeping", "n", "bộ phận dọn phòng", "the staff who clean hotel rooms", "", "Please contact housekeeping for extra towels."],
  ["hotel", "suite", "n", "phòng suite (phòng liên hoàn)", "a set of connected rooms in a hotel", "", "They upgraded us to a suite."],
  ["hotel", "check out", "v", "trả phòng", "to leave a hotel after paying", "", "Guests must check out before 11 a.m."],
  ["hotel", "guest", "n", "khách (nghỉ, mời)", "a person staying at a hotel or invited", "", "Each guest receives a welcome gift."],
  ["hotel", "stay", "n", "kỳ lưu trú", "a period of time spent in a place", "", "We hope you enjoyed your stay."],
  // restaurant
  ["restaurant", "appetizer", "n", "món khai vị", "a small dish served before the main course", "starter", "The shrimp appetizer is very popular."],
  ["restaurant", "entrée", "n", "món chính", "the main dish of a meal", "main course", "Each entrée comes with a side salad."],
  ["restaurant", "cater", "v", "cung cấp đồ ăn (cho tiệc, sự kiện)", "to provide food for an event", "", "We cater weddings and corporate events."],
  ["restaurant", "reserve", "v", "đặt trước", "to arrange for a table or room to be kept for you", "book", "I'd like to reserve a table for six."],
  ["restaurant", "beverage", "n", "đồ uống", "a drink", "drink", "Beverages are included in the set menu."],
  ["restaurant", "cuisine", "n", "ẩm thực", "a style of cooking", "", "The restaurant serves authentic Thai cuisine."],
  ["restaurant", "ingredient", "n", "nguyên liệu", "a food used to make a dish", "", "Only fresh ingredients are used."],
  ["restaurant", "gratuity", "n", "tiền boa", "an extra payment given to staff for good service", "tip", "A 10 percent gratuity is added to large groups."],
  ["restaurant", "patron", "n", "khách quen, khách hàng", "a regular customer of a business", "customer", "Patrons are asked to turn off mobile phones."],
  ["restaurant", "takeout", "n", "đồ ăn mang đi", "food bought at a restaurant to eat elsewhere", "", "We offer takeout until 9 p.m."],
  ["restaurant", "recommend", "v", "giới thiệu, đề nghị", "to suggest that something is good", "suggest", "What would you recommend for dessert?"],
  ["restaurant", "specialty", "n", "món đặc sản, thế mạnh", "something a place is especially known for", "", "Grilled fish is the chef's specialty."],
  // shopping
  ["shopping", "refund", "n", "tiền hoàn lại", "money returned when you return a product", "", "You can get a full refund within 14 days."],
  ["shopping", "receipt", "n", "biên lai, hóa đơn mua hàng", "a paper showing that you paid", "", "Please keep your receipt as proof of purchase."],
  ["shopping", "discount", "n", "giảm giá", "a reduction in price", "price reduction", "Members receive a 15 percent discount."],
  ["shopping", "purchase", "v", "mua", "to buy something", "buy", "Customers who purchase two items get one free."],
  ["shopping", "merchandise", "n", "hàng hóa", "goods that are bought and sold", "goods", "All merchandise is on sale this weekend."],
  ["shopping", "warranty", "n", "bảo hành", "a promise to repair or replace a faulty product", "guarantee", "The laptop comes with a two-year warranty."],
  ["shopping", "exchange", "v", "đổi (hàng)", "to give back an item and get another", "", "You may exchange the shirt for a different size."],
  ["shopping", "expire", "v", "hết hạn", "to stop being valid", "", "This coupon expires on December 31."],
  ["shopping", "retail", "adj", "bán lẻ", "relating to selling goods directly to customers", "", "She manages a retail store."],
  ["shopping", "inventory", "n", "hàng tồn kho, kiểm kê", "the goods a business has in stock", "stock", "We take inventory at the end of each month."],
  ["shopping", "clearance", "n", "hàng xả kho, bán thanh lý", "a sale to get rid of old stock", "", "Winter coats are on clearance."],
  ["shopping", "coupon", "n", "phiếu giảm giá", "a ticket that gives you a discount", "voucher", "Present this coupon at the checkout."],
  ["shopping", "browse", "v", "xem lướt, tham khảo", "to look at items without a plan to buy", "", "Feel free to browse our latest collection."],
  // customer service
  ["customer_service", "complaint", "n", "lời phàn nàn, khiếu nại", "a statement that something is wrong", "", "We received several complaints about the delay."],
  ["customer_service", "apologize", "v", "xin lỗi", "to say sorry", "", "We apologize for the inconvenience."],
  ["customer_service", "inconvenience", "n", "sự bất tiện", "a problem that causes trouble or difficulty", "", "We regret any inconvenience this may cause."],
  ["customer_service", "assistance", "n", "sự hỗ trợ", "help", "help", "Please call us if you need assistance."],
  ["customer_service", "inquiry", "n", "câu hỏi, yêu cầu thông tin", "a question asking for information", "question", "We will respond to your inquiry within a day."],
  ["customer_service", "resolve", "v", "giải quyết", "to find a solution to a problem", "solve", "The issue was resolved quickly."],
  ["customer_service", "compensate", "v", "bồi thường", "to pay someone for a loss or damage", "", "The airline will compensate passengers for the delay."],
  ["customer_service", "feedback", "n", "phản hồi, góp ý", "comments about how well something works", "", "We value your feedback."],
  ["customer_service", "satisfaction", "n", "sự hài lòng", "the feeling of being pleased with something", "", "Customer satisfaction is our top priority."],
  ["customer_service", "representative", "n", "nhân viên đại diện", "a person who speaks or acts for a company", "", "A representative will call you back shortly."],
  ["customer_service", "troubleshoot", "v", "khắc phục sự cố", "to find and fix the cause of a problem", "", "The technician will troubleshoot the network."],
  ["customer_service", "prompt", "adj", "nhanh chóng, đúng giờ", "done quickly or without delay", "quick", "Thank you for your prompt reply."],
  // delivery
  ["delivery", "shipment", "n", "lô hàng, chuyến hàng", "a quantity of goods sent together", "delivery", "Your shipment will arrive on Tuesday."],
  ["delivery", "courier", "n", "người/dịch vụ chuyển phát", "a person or company that delivers packages", "", "We use a courier for urgent documents."],
  ["delivery", "parcel", "n", "bưu kiện", "a package sent by post", "package", "A parcel was left at the front desk."],
  ["delivery", "recipient", "n", "người nhận", "a person who receives something", "", "The recipient must sign for the package."],
  ["delivery", "dispatch", "v", "gửi đi, điều phái", "to send something to a place", "send", "Orders are dispatched within 24 hours."],
  ["delivery", "fragile", "adj", "dễ vỡ", "easily broken or damaged", "", "Handle fragile items with care."],
  ["delivery", "freight", "n", "hàng hóa vận chuyển, cước vận tải", "goods carried by ship, truck, or plane", "cargo", "Air freight is faster but more expensive."],
  ["delivery", "bulk", "n", "số lượng lớn", "a large quantity", "", "Discounts apply to bulk orders."],
  ["delivery", "estimated", "adj", "ước tính, dự kiến", "calculated roughly", "", "The estimated delivery time is three days."],
  ["delivery", "approximately", "adv", "khoảng, xấp xỉ", "close to a number or amount", "about", "The trip takes approximately two hours."],
  ["delivery", "in transit", "adj", "đang vận chuyển", "being carried from one place to another", "", "Your order is currently in transit."],
  ["delivery", "backorder", "n", "đơn hàng chờ (hết hàng, sẽ giao sau)", "an order for an item not yet in stock", "", "The item is on backorder until May."],
  // schedule
  ["schedule", "appointment", "n", "cuộc hẹn", "an arrangement to meet at a set time", "", "I have a dental appointment at 3 p.m."],
  ["schedule", "deadline", "n", "hạn chót", "the latest time something must be finished", "", "The deadline for applications is June 1."],
  ["schedule", "timetable", "n", "thời gian biểu, lịch tàu xe", "a list of times when things happen", "schedule", "Check the bus timetable online."],
  ["schedule", "tentative", "adj", "dự kiến, chưa chắc chắn", "not final; subject to change", "provisional", "The tentative date for the launch is May 10."],
  ["schedule", "consecutive", "adj", "liên tiếp", "following one after another without a break", "in a row", "Sales rose for three consecutive months."],
  ["schedule", "frequently", "adv", "thường xuyên", "many times; often", "often", "Trains run frequently during rush hour."],
  ["schedule", "currently", "adv", "hiện tại", "at the present time", "at present", "The office is currently closed."],
  ["schedule", "immediately", "adv", "ngay lập tức", "without any delay", "right away", "Please contact us immediately."],
  ["schedule", "shortly", "adv", "ngay sau đây, sắp tới", "in a short time from now", "soon", "The flight will be boarding shortly."],
  ["schedule", "prior to", "prep", "trước khi", "before a particular time or event", "before", "Arrive 30 minutes prior to departure."],
  ["schedule", "subsequent", "adj", "tiếp theo, sau đó", "coming after something else", "following", "Subsequent meetings will be held online."],
  ["schedule", "duration", "n", "khoảng thời gian kéo dài", "the length of time something lasts", "", "The duration of the workshop is two hours."],
  ["schedule", "extend", "v", "gia hạn, kéo dài", "to make something last longer", "prolong", "The deadline has been extended by one week."],
  // contracts
  ["contracts", "agreement", "n", "thỏa thuận, hợp đồng", "a formal arrangement accepted by two or more parties", "contract", "Both companies signed the agreement on Monday."],
  ["contracts", "abide by", "v", "tuân thủ, làm theo", "to accept and follow a rule or decision", "comply with", "All vendors must abide by our safety rules."],
  ["contracts", "provision", "n", "điều khoản", "a condition written in a contract or law", "clause", "A provision in the lease allows early termination."],
  ["contracts", "terminate", "v", "chấm dứt", "to bring something to an end", "end", "Either party may terminate the contract with 30 days' notice."],
  ["contracts", "renew", "v", "gia hạn, làm mới", "to make an agreement valid for a further period", "extend", "We renewed our office lease for two more years."],
  ["contracts", "obligation", "n", "nghĩa vụ", "something you must do because of a law or agreement", "duty", "The supplier has an obligation to deliver on time."],
  ["contracts", "party", "n", "bên (trong hợp đồng)", "a person or group involved in an agreement", "", "The contract must be signed by both parties."],
  ["contracts", "negotiate", "v", "đàm phán, thương lượng", "to discuss something to reach an agreement", "bargain", "The manager negotiated a lower price with the vendor."],
  ["contracts", "binding", "adj", "có tính ràng buộc", "that must be obeyed by law", "", "The agreement becomes binding once it is signed."],
  ["contracts", "draft", "n", "bản nháp", "an early version of a document", "", "Please review the first draft of the contract."],

  // marketing
  ["marketing", "campaign", "n", "chiến dịch", "a planned series of activities to reach a goal", "", "The new advertising campaign starts next month."],
  ["marketing", "consumer", "n", "người tiêu dùng", "a person who buys goods or services", "customer", "Consumers are spending more on online shopping."],
  ["marketing", "launch", "v", "ra mắt (sản phẩm)", "to introduce a new product to the public", "release", "The company will launch its new phone in May."],
  ["marketing", "brand", "n", "thương hiệu", "a name that identifies a company's products", "", "Our brand is well known among young customers."],
  ["marketing", "target", "v", "nhắm tới (đối tượng)", "to aim something at a particular group", "aim at", "The ads target university students."],
  ["marketing", "revenue", "n", "doanh thu", "money a company earns from its business", "income", "Annual revenue rose by 12 percent."],
  ["marketing", "strategy", "n", "chiến lược", "a plan to achieve a goal", "plan", "We need a new strategy to attract customers."],
  ["marketing", "competitor", "n", "đối thủ cạnh tranh", "a company selling similar products", "rival", "Our prices are lower than our competitors' prices."],
  ["marketing", "survey", "n", "khảo sát", "a set of questions asked to many people", "questionnaire", "Customers who complete the survey get a coupon."],
  ["marketing", "loyalty", "n", "sự trung thành (của khách)", "the habit of continuing to buy from the same company", "", "The store's loyalty program offers points on every purchase."],

  // finance
  ["finance", "budget", "n", "ngân sách", "a plan for how much money can be spent", "", "The project stayed within budget."],
  ["finance", "expense", "n", "chi phí, khoản chi", "money spent on something", "cost", "Travel expenses will be paid by the company."],
  ["finance", "account", "n", "tài khoản", "an arrangement to keep money at a bank", "", "You can open an account online in ten minutes."],
  ["finance", "balance", "n", "số dư", "the amount of money in an account", "", "Please check your balance before making a transfer."],
  ["finance", "withdraw", "v", "rút (tiền)", "to take money out of an account", "take out", "Customers can withdraw cash at any branch."],
  ["finance", "loan", "n", "khoản vay", "money that is borrowed and must be paid back", "", "The bank approved a loan for the new factory."],
  ["finance", "interest rate", "n", "lãi suất", "the percentage charged or paid for borrowing money", "", "Interest rates are expected to fall this year."],
  ["finance", "audit", "n", "kiểm toán", "an official check of financial records", "inspection", "The annual audit will take place in January."],
  ["finance", "profit", "n", "lợi nhuận", "money gained after costs are paid", "earnings", "The store made a large profit during the holidays."],
  ["finance", "overdue", "adj", "quá hạn", "not paid or done by the expected time", "late", "This invoice is two weeks overdue."],

  // hr
  ["hr", "applicant", "n", "người nộp đơn", "a person who formally asks for a job", "candidate", "Each applicant will be interviewed by two managers."],
  ["hr", "hire", "v", "thuê, tuyển", "to employ someone", "recruit", "We hired three new sales representatives."],
  ["hr", "orientation", "n", "buổi định hướng (nhân viên mới)", "a session that introduces new staff to a company", "", "New employees attend orientation on their first day."],
  ["hr", "trainee", "n", "thực tập sinh, người được đào tạo", "a person being trained for a job", "", "Each trainee is assigned a mentor."],
  ["hr", "payroll", "n", "bảng lương", "the list of employees and the money paid to them", "", "Payroll is processed on the 25th of each month."],
  ["hr", "bonus", "n", "tiền thưởng", "extra money paid for good work", "", "Staff received a year-end bonus."],
  ["hr", "incentive", "n", "khuyến khích, ưu đãi", "something that encourages people to do more", "motivation", "The company offers incentives for meeting sales targets."],
  ["hr", "evaluate", "v", "đánh giá", "to judge the quality or value of something", "assess", "Managers evaluate staff performance twice a year."],
  ["hr", "eligible", "adj", "đủ điều kiện", "allowed to do or receive something", "qualified", "Full-time employees are eligible for health insurance."],
  ["hr", "workforce", "n", "lực lượng lao động", "all the people who work for a company", "staff", "Half of our workforce works remotely."],

  // product
  ["product", "prototype", "n", "mẫu thử", "a first model used for testing a design", "", "Engineers are testing the prototype this week."],
  ["product", "defective", "adj", "bị lỗi", "not working correctly because of a fault", "faulty", "Defective items can be returned within 30 days."],
  ["product", "inspect", "v", "kiểm tra kỹ", "to look at something carefully to check it", "examine", "Every product is inspected before shipping."],
  ["product", "specification", "n", "thông số kỹ thuật", "a detailed description of how something must be made", "", "The parts do not meet our specifications."],
  ["product", "durable", "adj", "bền", "able to last a long time", "long-lasting", "These durable bags are made from recycled plastic."],
  ["product", "manufacture", "v", "sản xuất", "to make goods in large quantities", "produce", "The factory manufactures car parts."],
  ["product", "component", "n", "linh kiện, bộ phận", "one of the parts of a machine or system", "part", "We order components from three suppliers."],
  ["product", "assemble", "v", "lắp ráp", "to put the parts of something together", "put together", "The desk is easy to assemble."],
  ["product", "comply with", "v", "tuân theo (quy định)", "to act according to a rule or standard", "abide by", "All products comply with safety standards."],
  ["product", "modify", "v", "điều chỉnh, sửa đổi", "to change something slightly", "adjust", "The design was modified after customer feedback."],

  // events
  ["events", "venue", "n", "địa điểm tổ chức", "the place where an event happens", "location", "The venue can hold up to 500 guests."],
  ["events", "attendee", "n", "người tham dự", "a person who goes to an event", "participant", "Attendees will receive a name badge at the entrance."],
  ["events", "register", "v", "đăng ký", "to put your name on an official list", "sign up", "Please register for the seminar by Friday."],
  ["events", "sponsor", "n", "nhà tài trợ", "a company that pays for an event in return for advertising", "", "The festival has several local sponsors."],
  ["events", "exhibition", "n", "triển lãm", "a public show of objects or products", "exhibit", "The exhibition runs until the end of March."],
  ["events", "banquet", "n", "tiệc chiêu đãi", "a large formal dinner", "formal dinner", "The awards banquet will be held at the Plaza Hotel."],
  ["events", "refreshments", "n", "đồ ăn nhẹ, nước uống", "small amounts of food and drink", "snacks", "Refreshments will be served during the break."],
  ["events", "keynote speech", "n", "bài phát biểu chính", "the main speech at a conference", "", "The CEO will give the keynote speech."],
  ["events", "trade show", "n", "hội chợ thương mại", "an event where companies show their products", "trade fair", "We met many new clients at the trade show."],
  ["events", "organizer", "n", "ban tổ chức, người tổ chức", "a person or group that plans an event", "planner", "Contact the organizer if you need special seating."],
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

for (const pack of dayPacks) {
  for (const [word, pos, meaningVi, meaningEn, paraphrase, example] of pack.words) {
    rows.push([pack.topic, word, pos, meaningVi, meaningEn, paraphrase, example]);
  }
}

export const vocabulary: VocabWord[] = rows.map(([topic, word, pos, meaningVi, meaningEn, paraphrase, example]) => ({
  id: slug(word),
  word,
  pos,
  meaningVi,
  meaningEn,
  paraphrase: paraphrase === "" ? null : paraphrase,
  topic,
  example,
}));

export const vocabById = new Map(vocabulary.map((w) => [w.id, w]));
