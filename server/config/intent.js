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
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
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
  "Thừa Thiên Huế",
//   "Tiền Giang",
//   "Trà Vinh",
  "Tuyên Quang",
//   "Vĩnh Long",
//   "Vĩnh Phúc",
//   "Yên Bái",
//   "Phú Yên",
];

const DISTRICT = {
  "Hà Nội": ["Hoàn Kiếm", "Đống Đa", "Ba Đình", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Long Biên", "Nam Từ Liêm", "Bắc Từ Liêm", "Tây Hồ", "Cầu Giấy", "Hà Đông"],
  "TP HCM": ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè', 'Quận Bình Thạnh', 'Quận Bình Tân', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Thủ Đức', ],
  "Cần Thơ": ['Bình Thuỷ', 'Cái Răng', 'Cờ Đỏ', 'Ninh Kiều', 'Phong Điền', 'Thốt Nốt', 'Vĩnh Thạnh', 'Ô Môn'],
  "Đà Nẵng": ['Huyện Hoàng Sa', 'Huyện Hòa Vang', 'Quận Cẩm Lệ', 'Quận Hải Châu', 'Quận Liên Chiểu', 'Quận Ngũ Hành Sơn', 'Quận Sơn Trà', 'Quận Thanh Khê'],
  "Hải Phòng": ['An Hải', 'Cát Hải', 'Hồng Bàng', 'Kiến An', 'Lê Chân', 'Ngô Quyền', 'Thủy Nguyên', 'Tiên Lãng', 'Vĩnh Bảo', 'Đồ Sơn'],
  "An Giang": ['An Phú', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Núi Sập', 'Thốt Nốt', 'Tri Tôn', 'Tân Châu', 'Tịnh Biên'],
  "Bà Rịa - Vũng Tàu": ['Châu Đức', 'Côn Đảo', 'Long Điền', 'Tân Thành', 'Xuyên Mộc', 'Đất Đỏ'],
  "Bắc Giang": ['Hiệp Hòa', 'Lạng Giang', 'Lục Nam', 'Lục Ngạn', 'Sơn Động', 'Tân Yên', 'Việt Yên', 'Yên Dũng', 'Yên Thế'],
  "Bắc Kạn": ['Ba Bể', 'Bạch Thông', 'Chợ Mới', 'Chợ Đồn', 'Na Rì', 'Ngân Sơn', 'Pác Nặm'],
  "Bạc Liêu": ['Giá Rai', 'Hòa Bình', 'Hồng Dân', 'Phước Long', 'Vĩnh Lợi', 'Đông Hải'],
  "Bắc Ninh": ['Huyện Gia Bình', 'Huyện Lương Tài', 'Huyện Quế Võ', 'Huyện Thuận Thành', 'Huyện Tiên Du', 'Huyện Yên Phong', 'Thị Xã Từ Sơn'],
  "Bến Tre": ['Ba Tri', 'Bình Đại', 'Châu Thành', 'Chợ Lách', 'Giồng Trôm', 'Mỏ Cày Bắc', 'Mỏ Cày Nam', 'Thạnh Phú'],
  "Bình Định": ['An Lão', 'An Nhơn', 'Hoài Nhơn', 'Hoài Ân', 'Phù Cát', 'Phù Mỹ', 'Tuy Phước', 'Tây Sơn', 'Vân Canh', 'Vĩnh Thạnh'],
  "Bình Dương": ['Huyện Bàu Bàng', 'Huyện Bắc Tân Uyên', 'Huyện Dầu Tiếng', 'Huyện Phú Giáo', 'Thị Xã Bến Cát', 'Thị Xã Dĩ An', 'Thị Xã Thuận An', 'Thị Xã Tân Uyên'],
  "Bình Phước": ['Bình Long', 'Bù Gia Mập', 'Bù Đăng', 'Bù Đốp', 'Chơn Thành', 'Hớn Quản', 'Lộc Ninh', 'Phú Riềng', 'Phước Long', 'Đồng Phú', 'Đồng Xoài'],
  "Bình Thuận": ['Bắc Bình', 'Hàm Thuận Bắc', 'Hàm Thuận Nam', 'Hàm Tân', 'Phú Quý', 'Tuy Phong', 'Tánh Linh', 'Đức Linh'],
  "Cà Mau": ['Cái Nước', 'Ngọc Hiển', 'Năm Căn', 'Phú Tân', 'Thới Bình', 'Trần Văn Thời', 'U Minh', 'Đầm Dơi'],
  "Cao Bằng": ['Huyện Bảo Lâm', 'Huyện Bảo Lạc', 'Huyện Hà Quảng', 'Huyện Hòa An', 'Huyện Hạ Lang', 'Huyện Nguyên Bình', 'Huyện Quảng Hòa', 'Huyện Thạch An', 'Huyện Trùng Khánh'],
  "Đắk Lắk": ['Thành phố Buôn Ma Thuột', 'Buôn Đôn', 'Ea Kar', 'Ea Súp', 'Hòa Phú', 'Hòa Xuân', 'Krông Ana', 'Krông Bông', 'Krông Búk', 'Krông Năng', 'Krông Pắk', 'Lắk', 'các xã Hòa Khánh', 'huyện Krông Nô'],
  "Đắk Nông": ['Huyện Chư Jút', 'Huyện Krông Nô', 'Huyện Tuy Đức', 'Huyện Đắk Glong', 'Huyện Đắk Mil', 'Huyện Đắk Song', 'Thị xã Gia Nghĩa'],
  "Điện Biên": ['Huyện Mường Chà', 'Huyện Mường Nhé', 'Huyện Mường Ảng', 'Huyện Nậm Pồ', 'Huyện Tuần Giáo', 'Huyện Tủa Chùa', 'Huyện Điện Biên', 'Huyện Điện Biên Đông', 'Thị xã Mường Lay'],
  "Đồng Nai": ['Cẩm Mỹ', 'Định Quán', 'Long Thành', 'Nhơn Trạch', 'Thống Nhất', 'Trảng Bom', 'Tân Phú', 'Vĩnh Củu', 'Xuân lộc'],
  "Đồng Tháp": ['Huyện Cao Lãnh', 'Huyện Châu Thành', 'Huyện Hồng Ngự', 'Huyện Lai Vung', 'Huyện Lấp Vò', 'Huyện Tam Nông', 'Huyện Thanh Bình', 'Huyện Tháp Mười', 'Huyện Tân Hồng', 'Thành phố Cao Lãnh', 'Thành phố Sa Đéc', 'Thị xã Hồng Ngự'],
  "Gia Lai": ['An Khê', 'Ayun Pa', 'Chư Prông', 'Chư Păh', 'Chư Sê', 'KBang', 'Krông Pa', 'Kông Chro', 'Mang Yang'],
  "Hà Giang": ['Huyện Bắc Quang', 'Huyện Bắc Mê', 'Huyện Hoàng Su Phì', 'Huyện Mèo Vạc', 'Huyện Quang Bình', 'Huyện Quản Bạ', 'Huyện Vị Xuyên', 'Huyện Xín Mần', 'Huyện Yên Minh', 'Huyện Đồng Văn', 'Thành phố Hà Giang'],
  "Hà Nam": ['Bình Lục', 'Duy Tiên', 'Kim Bảng', 'Lý Nhân', 'Thanh Liêm'],

  "Thừa Thiên Huế": ['A Lưới', 'Nam Đông', 'Phong Điền', 'Phú Lộc', 'Phú Vang', 'Quảng Điền', 'Thành phố Huế', 'Thị xã Hương Thủy', 'Thị xã Hương Trà'],

  "Tuyên Quang": ['Chiêm Hóa', 'Hàm Yên', 'Lâm Bình', 'Na Hang', 'Sơn Dương', 'Yên Sơn'],
  
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