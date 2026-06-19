import { CVData } from "../../types/cv";

export const KeToanCV: CVData = {
  personalInfo: {
    name: "Phạm Minh Hằng",
    title: "Kế toán Tổng hợp",
    email: "minhhang.accounting@gmail.com",
    phone: "(+84) 912 888 555",
    location: "Thanh Xuân, Hà Nội",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/ke_toan.png",
  },
  summary: "Kế toán tổng hợp với 4 năm kinh nghiệm kiểm soát tài chính, kê khai thuế và lập báo cáo tài chính cho các doanh nghiệp vừa và nhỏ. Thành thạo phần mềm kế toán MISA, Excel nâng cao, nắm vững luật thuế hiện hành và các chuẩn mực kế toán Việt Nam (VAS). Cẩn thận, trung thực, tỉ mỉ trong từng số liệu.",
  workExperience: [
    {
      id: "fin_acc_w1",
      company: "Công ty Cổ phần Thương mại dịch vụ Đông Á",
      position: "Kế toán Tổng hợp",
      location: "Hà Nội",
      startDate: "2022-04",
      endDate: "Hiện tại",
      current: true,
      description: "• Thực hiện kê khai thuế GTGT, TNCN, TNDN và báo cáo tình hình sử dụng hóa đơn hàng tháng/quý theo đúng quy định pháp luật.\n• Lập báo cáo tài chính năm, báo cáo kết quả hoạt động kinh doanh định kỳ và thuyết minh báo cáo tài chính trình Ban Giám đốc.\n• Đối chiếu công nợ khách hàng, nhà cung cấp, kiểm soát chặt chẽ dòng tiền thu chi hàng ngày và phê duyệt chứng từ thanh toán hợp lệ.",
      techStack: ["Phần mềm MISA", "Excel nâng cao", "Chuẩn mực VAS", "Kê khai thuế"],
    },
    {
      id: "fin_acc_w2",
      company: "Công ty TNHH Tư vấn Doanh nghiệp VietTax",
      position: "Nhân viên Kế toán Thuế",
      location: "Hà Nội",
      startDate: "2020-03",
      endDate: "2022-03",
      current: false,
      description: "• Tiếp nhận, kiểm tra tính hợp lệ hợp pháp của hóa đơn, chứng từ đầu vào, đầu ra của hơn 15 doanh nghiệp đối tác.\n• Nhập liệu sổ sách kế toán, hạch toán các nghiệp vụ kinh tế phát sinh trên phần mềm FAST.\n• Giải trình số liệu kế toán với cơ quan thuế khi có quyết định quyết toán thuế năm.",
      techStack: ["Phần mềm FAST", "Nhập liệu hạch toán", "Quyết toán thuế"],
    },
  ],
  projects: [],
  education: [
    {
      id: "fin_acc_e1",
      school: "Đại học Học viện Tài chính",
      degree: "Cử nhân",
      fieldOfStudy: "Kế toán doanh nghiệp",
      location: "Bắc Từ Liêm, Hà Nội",
      startDate: "2016-09",
      endDate: "2020-02",
      current: false,
      grade: "GPA: 3.3 / 4.0",
      description: "Được nhận học bổng khuyến khích học tập của trường năm học 2018 - 2019.",
    },
  ],
  skills: [
    {
      id: "fin_acc_s1",
      category: "Kỹ năng chuyên môn",
      skills: ["Hạch toán kế toán", "Lập báo cáo tài chính", "Báo cáo thuế GTGT, TNCN, TNDN", "Sử dụng MISA & FAST thành thạo", "Excel hàm tài chính chuyên sâu (Pivot Table, VLOOKUP)"],
    },
    {
      id: "fin_acc_s2",
      category: "Kỹ năng mềm",
      skills: ["Cẩn thận tỉ mỉ tuyệt đối", "Trung thực đạo đức nghề nghiệp", "Quản lý thời gian", "Làm việc độc lập"],
    },
  ],
  languages: [
    {
      id: "fin_acc_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "fin_acc_l2",
      name: "Tiếng Anh",
      proficiency: "Đọc hiểu tài liệu kế toán/tài chính tốt",
    },
  ],
  certifications: [
    {
      id: "fin_acc_c1",
      name: "Chứng chỉ Kế toán trưởng",
      issuer: "Học viện Tài chính",
      date: "2023-06",
    },
  ],
  customSections: [],
};

export const TaiChinhCV: CVData = {
  personalInfo: {
    name: "Lê Hoàng Nam",
    title: "Chuyên viên Phân tích Tài chính (Financial Analyst)",
    email: "hoangnam.finance@gmail.com",
    phone: "(+84) 904 555 777",
    location: "Quận 1, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/hoangnam-finance",
    avatar: "/avatars/business_woman.png",
  },
  summary: "Chuyên viên phân tích tài chính với 3 năm kinh nghiệm trong lĩnh vực đánh giá hiệu quả đầu tư dự án và lập kế hoạch ngân sách doanh nghiệp. Có năng lực xây dựng mô hình tài chính (Financial Modeling), phân tích báo cáo tài chính và thẩm định dòng tiền dự án đầu tư.",
  workExperience: [
    {
      id: "fin_fa_w1",
      company: "Tập đoàn Đầu tư Vingroup",
      position: "Chuyên viên Phân tích Tài chính - Ban Đầu tư",
      location: "TP. Hồ Chí Minh",
      startDate: "2023-05",
      endDate: "Hiện tại",
      current: true,
      description: "• Xây dựng mô hình tài chính đánh giá hiệu quả kinh doanh và khả năng hoàn vốn cho 3 dự án đầu tư bất động sản thương mại mới quy mô nghìn tỷ.\n• Lập dự báo dòng tiền hàng tuần/hàng tháng, theo dõi chi tiết độ lệch giữa ngân sách dự kiến và chi phí thực tế phát sinh của các công ty con.\n• Chuẩn bị slide phân tích số liệu tài chính, trình bày và bảo vệ phương án đầu tư trước Ban Đầu tư Tập đoàn.",
      techStack: ["Financial Modeling", "Phân tích dòng tiền NPV/IRR", "Thuyết trình báo cáo"],
    },
    {
      id: "fin_fa_w2",
      company: "Công ty Chứng khoán SSI",
      position: "Nhân viên Phân tích Đầu tư",
      location: "TP. Hồ Chí Minh",
      startDate: "2021-03",
      endDate: "2023-04",
      current: false,
      description: "• Thực hiện báo cáo phân tích doanh nghiệp và ngành Bất động sản/Thép định kỳ, đưa ra khuyến nghị đầu tư cho khách hàng tổ chức.\n• Thu thập dữ liệu vĩ mô, phân tích báo cáo tài chính của các công ty niêm yết trên sàn HSX.\n• Định giá cổ phiếu bằng phương pháp chiết khấu dòng tiền (DCF) và so sánh P/E, P/B.",
      techStack: ["Định giá doanh nghiệp", "Phân tích báo cáo tài chính", "Báo cáo ngành"],
    },
  ],
  projects: [],
  education: [
    {
      id: "fin_fa_e1",
      school: "Đại học Ngoại thương",
      degree: "Cử nhân",
      fieldOfStudy: "Tài chính Quốc tế",
      location: "Quận Bình Thạnh, TP.HCM",
      startDate: "2017-09",
      endDate: "2021-02",
      current: false,
      grade: "GPA: 3.45 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "fin_fa_s1",
      category: "Kỹ năng chuyên môn",
      skills: ["Xây dựng mô hình tài chính (Excel)", "Thẩm định dự án đầu tư (NPV, IRR)", "Phân tích báo cáo tài chính doanh nghiệp", "Định giá doanh nghiệp (DCF, Multiples)", "Quản trị ngân sách"],
    },
    {
      id: "fin_fa_s2",
      category: "Phần mềm chuyên môn",
      skills: ["Excel nâng cao", "Bloomberg Terminal", "PowerPoint thuyết trình", "Python phân tích dữ liệu cơ bản"],
    },
  ],
  languages: [
    {
      id: "fin_fa_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "fin_fa_l2",
      name: "Tiếng Anh",
      proficiency: "Sử dụng lưu loát trong công việc (IELTS 7.5)",
    },
  ],
  certifications: [
    {
      id: "fin_fa_c1",
      name: "CFA Program Candidate - Đã đỗ Level 2",
      issuer: "CFA Institute",
      date: "2023-12",
    },
  ],
  customSections: [],
};

export const NganHangCV: CVData = {
  personalInfo: {
    name: "Nguyễn Thùy Linh",
    title: "Chuyên viên Quan hệ Khách hàng Cá nhân",
    email: "thuylinh.vcb@gmail.com",
    phone: "(+84) 936 999 111",
    location: "Quận 3, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/ngan_hang.png",
  },
  summary: "Chuyên viên quan hệ khách hàng cá nhân năng động, có 3 năm kinh nghiệm tại Vietcombank. Thế mạnh tìm kiếm khách hàng, tư vấn mở rộng tín dụng tiêu dùng, vay mua nhà, mua ô tô và huy động vốn gửi tiết kiệm. Đạt thành tích xuất sắc hoàn thành vượt 110% chỉ tiêu KPI tín dụng năm 2024.",
  workExperience: [
    {
      id: "fin_bank_w1",
      company: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
      position: "Chuyên viên Quan hệ Khách hàng Cá nhân (RM)",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-09",
      endDate: "Hiện tại",
      current: true,
      description: "• Tiếp tiếp cận, thẩm định hồ sơ vay vốn thế chấp/tín chấp cá nhân và thực hiện quy trình giải ngân an toàn với tổng dư nợ cho vay đạt hơn 45 tỷ VNĐ/năm.\n• Tư vấn mở thẻ tín dụng, đăng ký dịch vụ ngân hàng số (Digibank), bảo hiểm liên kết (Bancassurance) đạt doanh số top 10 phòng giao dịch.\n• Theo dõi sát sao lịch trả nợ gốc và lãi vay của khách hàng, kiểm soát nợ xấu phát sinh (NPL) dưới mức 0.5% tổng dư nợ quản lý.",
      techStack: ["Thẩm định tín dụng", "Tư vấn tài chính", "Bancassurance", "Xử lý nợ xấu"],
    },
    {
      id: "fin_bank_w2",
      company: "Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)",
      position: "Nhân viên Phát triển Khách hàng Cá nhân",
      location: "TP. Hồ Chí Minh",
      startDate: "2021-03",
      endDate: "2022-08",
      current: false,
      description: "• Tìm kiếm khách hàng qua danh sách data lạnh, gọi điện tư vấn các gói vay mua nhà dự án Vinhomes.\n• Hướng dẫn khách hàng chuẩn bị hồ sơ chứng minh thu nhập, tài sản bảo đảm theo quy định của ngân hàng.\n• Hoàn thành chỉ tiêu huy động vốn tiền gửi tiết kiệm đạt hơn 20 tỷ VNĐ trong năm 2021.",
      techStack: ["Telesales", "Thủ tục hồ sơ vay", "Huy động vốn"],
    },
  ],
  projects: [],
  education: [
    {
      id: "fin_bank_e1",
      school: "Đại học Ngân hàng TP. Hồ Chí Minh",
      degree: "Cử nhân",
      fieldOfStudy: "Tài chính - Ngân hàng",
      location: "Thủ Đức, TP.HCM",
      startDate: "2017-09",
      endDate: "2021-02",
      current: false,
      grade: "GPA: 3.1 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "fin_bank_s1",
      category: "Kỹ năng ngân hàng",
      skills: ["Thẩm định tài sản bảo đảm", "Đánh giá uy tín tín dụng (CIC)", "Tư vấn bảo hiểm Bancassurance", "Xử lý nợ & Thu hồi nợ xấu", "Tư vấn mở thẻ tín dụng"],
    },
    {
      id: "fin_bank_s2",
      category: "Kỹ năng mềm",
      skills: ["Giao tiếp & Đàm phán trực tiếp", "Giải quyết vấn đề khéo léo", "Chịu áp lực chỉ tiêu KPI", "Chăm sóc khách hàng"],
    },
  ],
  languages: [
    {
      id: "fin_bank_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "fin_bank_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp thương mại tốt (IELTS 6.5)",
    },
  ],
  certifications: [
    {
      id: "fin_bank_c1",
      name: "Chứng chỉ Đào tạo Chuyên nghiệp Tín dụng Cá nhân",
      issuer: "Học viện Ngân hàng Techcombank",
      date: "2021-05",
    },
  ],
  customSections: [],
};
