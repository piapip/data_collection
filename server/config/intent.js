const INTENT = [
  {
    name: "Cấp lại mật khẩu",
    slot: ["digital_bank"],
  },
  {
    name: "Chương trình ưu đãi",
    slot: ["card_type"],
  },
  {
    name: "Điều kiện vay vốn",
    slot: ["loan_purpose", "loan_type"],
  },
  {
    name: "Điểm đặt ATM",
    slot: ["city", "district"],
  },
  {
    name: "Điểm giao dịch",
    slot: ["city", "district"],
  },
  {
    name: "Hồ sơ phát hành thẻ",
    slot: ["card_type", "card_usage"],
  },
  {
    name: "Hồ sơ vay vốn",
    slot: ["loan_purpose", "loan_type"],
  },
  {
    name: "Hủy chi tiêu thẻ",
    slot: ["name", "cmnd", "four_last_digits"],
  },
  {
    name: "Hướng dẫn mở thẻ",
    slot: ["card_activation_type"],
  },
  {
    name: "Khái niệm sản phẩm",
    slot: ["card_type", "card_usage"],
  },
  {
    name: "Kích hoạt thẻ tự động",
    slot: ["name", "cmnd", "four_last_digits"],
  },
  {
    name: "Khóa thẻ khẩn cấp",
    slot: ["name", "cmnd", "four_last_digits"],
  },
  {
    name: "Kích hoạt chi tiêu thẻ",
    slot: ["name", "cmnd", "four_last_digits"],
  },
  {
    name: "Phí chuyển tiền",
    slot: ["digital_bank"],
  },
  {
    name: "Phương thức hủy dịch vụ Ngân hàng điện tử",
    slot: ["digital_bank"],
  },
  {
    name: "Tính năng dịch vụ NHĐT",
    slot: ["digital_bank"],
  },
  {
    name: "Tra cứu số dư",
    slot: ["name", "cmnd", "four_last_digits"],
  },
  {
    name: "Thay đổi hạn mức chi tiêu thẻ",
    slot: ["name", "cmnd", "four_last_digits"],
  },
];

const SLOT_LABEL = [
  {
    name: "Mục đích cho vay",
    tag: "LOAN_PURPOSE",
  },
  {
    name: "Hình thức cho vay",
    tag: "LOAN_TYPE",
  },
  {
    name: "Nhóm thẻ",
    tag: "CARD_TYPE",
  },
  {
    name: "Hình thức thẻ",
    tag: "CARD_USAGE",
  },
  {
    name: "Ngân hàng điện tử",
    tag: "DIGITAL_BANK",
  },
  {
    name: "Tính chất mở",
    tag: "CARD_ACTIVATION_TYPE",
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
    name: "CMND",
    tag: "CMND",
  },
  {
    name: "4 số cuối tài khoản",
    tag: "FOUR_LAST_DIGITS",
  },
]

const LOAN_PURPOSE = [
  {
    name: "Vay mua xe",
    tag: "vay_mua_xe",
    hint: "mua xe, mua ô tô, mua xe ô tô",
  },
  {
    name: "Vay mua bất động sản",
    tag: "vay_mua_bds",
    hint: "mua nhà, mua văn hộ, mua chung cư, mua nhà đất, mua bất động sản",
  },
  {
    name: "Vay kinh doanh",
    tag: "vay_kinh_doanh",
    hint: "kinh doanh, làm ăn",
  },
  {
    name: "Vay tiêu dùng",
    tag: "vay_tieu_dung",
    hint: "tiêu dùng",
  },
];

const LOAN_TYPE = [
  {
    name: "Vay thế chấp",
    tag: "vay_the_chap",
    hint: "thế chấp, có tài sản đảm bảo",
  },
  {
    name: "Vay tín chấp",
    tag: "vay_tin_chap",
    hint: "tín chấp, không tài sản đảm bảo",
  },
  {
    name: "Vay cầm cố giấy tờ có giá",
    tag: "vay_cam_co_GTCG",
    hint: "cầm cố giấy tờ có giá, có giấy tờ có giá",
  },
];

const CARD_TYPE = [
  {
    name: "Quốc tế",
    tag: "quoc_te",
    hint: "quốc tế, nước ngoài",
  },
  {
    name: "Nội địa",
    tag: "noi_dia",
    hint: "nội địa, trong nước",
  },
  {
    name: "Mastercard",
    tag: "master",
    hint: "master card, master, master quốc tế, quốc tế mastercard",
  },
  {
    name: "Visa",
    tag: "visa",
    hint: "visa, visa card, visa quốc tế, quốc tế visa, visa card quốc tế",
  },
  {
    name: "Amex",
    tag: "amex",
    hint: "amex, american express, amex quốc tế",
  },
  {
    name: "JCB",
    tag: "jcb",
    hint: "jcb, quốc tế jcb, jcb quốc tế",
  },
  {
    name: "UnionPay",
    tag: "unionpay",
    hint: "unionpay, quốc tế union pay, union pay quốc tế",
  },
];

const CARD_USAGE = [
  {
    name: "Ghi nợ",
    tag: "ghi_no",
    hint: "ghi nợ, debit",
  },
  {
    name: "Tín dụng",
    tag: "tin_dung",
    hint: "tín dụng, credit",
  },
];

const DIGITAL_BANK = [
  {
    name: "SMS Banking",
    tag: "SMS Banking",
    hint: "sms banking, sms",
  },
  {
    name: "Internet Banking",
    tag: "Internet Banking",
    hint: "ibanking, internet banking, eb, ib",
  },
  {
    name: "Mobile Banking",
    tag: "Mobile Banking",
    hint: "mobile banking, MB",
  },
  {
    name: "Phone Banking",
    tag: "Phone Banking",
    hint: "phone banking",
  },
  {
    name: "VCBPAY",
    tag: "VCBPAY",
    hint: "VCBPay, VCB Pay",
  },
];

const CARD_ACTIVATION_TYPE = [
  {
    name: "Mở mới",
    tag: "mo_moi",
    hint: "mở mới, lần đầu, mở thẻ mới, làm thẻ mới, phát hành mới",
  },
  {
    name: "Cấp lại",
    tag: "cap_lai",
    hint: "cấp lại, làm lại, phát lại, mở lại, phát hành lại",
  },
];

const CITY = [
  "Hà Nội",
  "TP HCM",
  "Cần Thơ",
  "Đà Nẵng",
  "Hải Phòng",
//   "An Giang",
//   "Bà Rịa - Vũng Tàu",
//   "Bắc Giang",
//   "Bắc Kạn",
//   "Bạc Liêu",
//   "Bắc Ninh",
//   "Bến Tre",
//   "Bình Định",
//   "Bình Dương",
//   "Bình Phước",
//   "Bình Thuận",
//   "Cà Mau",
//   "Cao Bằng",
//   "Đắk Lắk",
//   "Đắk Nông",
//   "Điện Biên",
//   "Đồng Nai",
//   "Đồng Tháp",
//   "Gia Lai",
//   "Hà Giang",
//   "Hà Nam",
//   "Hà Tĩnh",
//   "Hải Dương",
//   "Hậu Giang",
//   "Hòa Bình",
//   "Hưng Yên",
//   "Khánh Hòa",
//   "Kiên Giang",
//   "Kon Tum",
//   "Lai Châu",
//   "Lâm Đồng",
//   "Lạng Sơn",
//   "Lào Cai",
//   "Long An",
//   "Nam Định",
//   "Nghệ An",
//   "Ninh Bình",
//   "Ninh Thuận",
//   "Phú Thọ",
//   "Quảng Bình",
//   "Quảng Nam",
//   "Quảng Ngãi",
//   "Quảng Ninh",
//   "Quảng Trị",
//   "Sóc Trăng",
//   "Sơn La",
//   "Tây Ninh",
//   "Thái Bình",
//   "Thái Nguyên",
//   "Thanh Hóa",
//   "Thừa Thiên Huế",
//   "Tiền Giang",
//   "Trà Vinh",
//   "Tuyên Quang",
//   "Vĩnh Long",
//   "Vĩnh Phúc",
//   "Yên Bái",
//   "Phú Yên",
];

const DISTRICT = {
  "Hà Nội": ['A', 'B', 'C'],
  "TP HCM": ['D', 'E', 'F'],
  "Cần Thơ": ['G', 'H', 'I'],
  "Đà Nẵng": ['K', 'L', 'M'],
  "Hải Phòng": ['N', 'O', 'P'],
}

module.exports = {
  INTENT,
  SLOT_LABEL,
  LOAN_PURPOSE,
  LOAN_TYPE,
  CARD_TYPE,
  CARD_USAGE,
  DIGITAL_BANK,
  CARD_ACTIVATION_TYPE,
  CITY,
  DISTRICT,
}