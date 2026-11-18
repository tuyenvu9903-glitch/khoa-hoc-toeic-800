// Core TOEIC vocabulary by topic. Static data bundled with the app.
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
  | "schedule";

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
};

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
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
