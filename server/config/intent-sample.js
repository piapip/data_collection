// THIS IS AN ARRAY!!!
const INTENT = [
  {
    // #0
    name: "Test",
    slot: ["three_word_slot"],
  },
  {
    // #1
    name: "Test 2",
    slot: ["country", "city", "district"],
  },
  {
    // #2
    name: "Test 3",
    slot: ["name", "phone_number"],
  },
];

// THIS IS AN ARRAY!!!
const SLOT_LABEL = [
  {
    name: "Slot 3 từ",
    tag: "THREE_WORD_SLOT",
  },
  {
    name: "Quốc gia",
    tag: "COUNTRY",
  },
  {
    name: "Quận",
    tag: "DISTRICT",
  },
  {
    name: "Tỉnh thành",
    tag: "CITY",
  },
  {
    name: "Họ và tên",
    tag: "NAME",
  },
  {
    name: "Số điện thoại",
    tag: "PHONE_NUMBER",
  },
];

// MIND YOUR TIER!!!
const SLOT_DEPENDENCY = [
  {
    high: "COUNTRY",
    low: "CITY",
    tier: 1,
  },
  {
    high: "CITY",
    low: "DISTRICT",
    tier: 2,
  },
];

// THIS IS AN ARRAY!!!
const THREE_WORD_SLOT = ["Slot 1", "Slot 2", "Slot 3", "Slot 4"];

// THIS IS AN ARRAY!!!
const COUNTRY = ["Việt Nam", "Nhật Bản"];

// THIS IS AN OBJECT!!!
const CITY = {
  "Việt Nam": ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"],
  "Nhật Bản": ["Osaka", "Tokyo", "Kyoto"],
};

// THIS IS AN OBJECT!!!
const DISTRICT = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ"],
  "Hồ Chí Minh": ["Quận 1", "Quận 2", "Quận 3", "Quận 4"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà"],
  "Hải Phòng": ["Hồng Bàng", "Lê Chân", "Ngô Quyền", "Kiến An"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn"],
  Osaka: ["Osaka 1", "Osaka 2"],
  Tokyo: ["Tokyo 1", "Tokyo 2", "Tokyo 3"],
  Kyoto: ["Kyoto 1", "Kyoto 2"],
};

// THIS IS AN ARRAY!!!
const GENERIC_INTENT = [
  "Chào hỏi",
  "Bot làm được gì?",
  "Khen",
  "Chê",
  "Tạm biệt",
  "Câu hỏi thông thường khác",
];

module.exports = {
  INTENT,
  SLOT_LABEL,
  SLOT_DEPENDENCY,
  THREE_WORD_SLOT,
  COUNTRY,
  CITY,
  DISTRICT,
  GENERIC_INTENT,
};
