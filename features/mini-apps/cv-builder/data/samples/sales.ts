import { CVData } from "../../types/cv";

export const SaleBdsCV: CVData = {
  personalInfo: {
    name: "Trần Thu Thảo",
    title: "Chuyên viên Tư vấn Bất động sản Cấp cao",
    email: "thuthao.cenland@gmail.com",
    phone: "(+84) 945 999 888",
    location: "Quận 2, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/thuthao-bds",
    avatar: "/avatars/sale_bds.png",
  },
  summary: "Chuyên viên tư vấn bất động sản với hơn 4 năm kinh nghiệm trong phân khúc căn hộ cao cấp và biệt thự nghỉ dưỡng. Đạt doanh số bán ròng hơn 80 tỷ VNĐ trong năm 2024. Có kỹ năng phân tích thị trường nhạy bén, đàm phán thương lượng xuất sắc và xây dựng mối quan hệ lâu dài với khách hàng VIP.",
  workExperience: [
    {
      id: "sale_bds_w1",
      company: "Công ty Cổ phần Địa ốc Đất Xanh",
      position: "Chuyên viên Kinh doanh Cấp cao",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-06",
      endDate: "Hiện tại",
      current: true,
      description: "• Tư vấn và phân phối thành công 35 căn hộ thuộc phân khúc cao cấp, đạt 120% chỉ tiêu doanh số năm của phòng kinh doanh.\n• Phát triển và chăm sóc dữ liệu hơn 500 khách hàng tiềm năng, nâng cao tỷ lệ khách hàng trung thành quay lại giao dịch lên 25%.\n• Soạn thảo hợp đồng đặt cọc, hợp đồng mua bán, trực tiếp tư vấn pháp lý và giải pháp vay vốn ngân hàng tối ưu cho khách hàng.",
      techStack: ["Kỹ năng đàm phán", "Tư vấn pháp lý BĐS", "Marketing Online", "CRM"],
    },
    {
      id: "sale_bds_w2",
      company: "Công ty Cổ phần Tập đoàn Thế Kỷ (CenLand)",
      position: "Nhân viên Tư vấn Bất động sản",
      location: "TP. Hồ Chí Minh",
      startDate: "2020-02",
      endDate: "2022-05",
      current: false,
      description: "• Thực hiện cuộc gọi tư vấn (telesales) giới thiệu các dự án căn hộ trung cấp và đất nền khu vực vùng ven.\n• Hướng dẫn khách hàng tham quan thực tế dự án và nhà mẫu, giải đáp chi tiết các thắc mắc về giá bán và tiến độ thanh toán.\n• Đạt danh hiệu 'Chiến binh bán hàng xuất sắc' của tháng 10/2021.",
      techStack: ["Telesales", "Chăm sóc khách hàng", "Kỹ năng thuyết trình"],
    },
  ],
  projects: [
    {
      id: "sale_bds_p1",
      title: "Chiến dịch phân phối dự án Vinhomes Grand Park",
      role: "Trưởng nhóm kinh doanh dự án",
      description: "Lên kế hoạch chạy quảng cáo tìm kiếm khách hàng, tổ chức các buổi hội thảo tư vấn dự án trực tiếp cho khách hàng. Đạt mục tiêu bán sạch rổ hàng 15 căn hộ của nhóm trong vòng 2 tháng.",
      link: "",
      techStack: ["Google Ads", "Facebook Ads", "Tư vấn nhóm"],
    },
  ],
  education: [
    {
      id: "sale_bds_e1",
      school: "Đại học Kinh tế TP. Hồ Chí Minh",
      degree: "Cử nhân",
      fieldOfStudy: "Quản trị Kinh doanh",
      location: "TP. Hồ Chí Minh",
      startDate: "2015-09",
      endDate: "2019-06",
      current: false,
      grade: "GPA: 3.0 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "sale_bds_s1",
      category: "Kỹ năng chuyên môn",
      skills: ["Đàm phán thương lượng", "Phân tích dự án", "Đánh giá pháp lý BĐS", "Thẩm định giá", "Giải pháp tài chính cá nhân"],
    },
    {
      id: "sale_bds_s2",
      category: "Công cụ hỗ trợ",
      skills: ["Quản lý CRM", "Google Ads", "Facebook Ads", "Email Marketing"],
    },
  ],
  languages: [
    {
      id: "sale_bds_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "sale_bds_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp Tốt (IELTS 6.5)",
    },
  ],
  certifications: [
    {
      id: "sale_bds_c1",
      name: "Chứng chỉ Hành nghề Môi giới Bất động sản",
      issuer: "Sở Xây Dựng TP.HCM",
      date: "2021-03",
    },
  ],
  customSections: [],
};

export const SaleTbytCV: CVData = {
  personalInfo: {
    name: "Lê Anh Tuấn",
    title: "Nhân viên Kinh doanh Thiết bị Y tế",
    email: "anhtuan.med@gmail.com",
    phone: "(+84) 977 123 999",
    location: "Thanh Xuân, Hà Nội",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/business_woman.png",
  },
  summary: "Nhân viên kinh doanh thiết bị y tế với 3 năm kinh nghiệm phân phối các dòng máy siêu âm, máy đo điện tim và vật tư tiêu hao phòng mổ cho các bệnh viện, phòng khám khu vực miền Bắc. Am hiểu sâu sắc quy trình đấu thầu y tế công/tư và dịch vụ hậu mãi chăm sóc khách hàng.",
  workExperience: [
    {
      id: "sale_med_w1",
      company: "Công ty TNHH Thiết bị Y tế Hoàng Minh",
      position: "Nhân viên Phát triển Thị trường",
      location: "Hà Nội",
      startDate: "2023-03",
      endDate: "Hiện tại",
      current: true,
      description: "• Tiếp cận và phân phối thiết bị y tế công nghệ cao cho hơn 40 phòng khám tư nhân và bệnh viện đa khoa tuyến tỉnh.\n• Tư vấn các thông số kỹ thuật y khoa của sản phẩm, tham gia chuẩn bị hồ sơ thầu trang thiết bị y tế và trực tiếp đàm phán hợp đồng.\n• Hỗ trợ kỹ sư tổ chức bàn giao, lắp đặt, chạy thử thiết bị và hướng dẫn sử dụng trực tiếp cho các bác sĩ và kỹ thuật viên y tế.",
      techStack: ["Thông số thiết bị y khoa", "Lập hồ sơ thầu", "Tư vấn khách hàng B2B"],
    },
    {
      id: "sale_med_w2",
      company: "Dược phẩm & Trang thiết bị Y tế Việt Pháp",
      position: "Nhân viên Sales Kênh Phòng khám",
      location: "Hà Nội",
      startDate: "2021-05",
      endDate: "2023-02",
      current: false,
      description: "• Tìm kiếm thông tin các phòng khám mới mở, tiếp cận giới thiệu các sản phẩm máy đo huyết áp, máy điện tim, vật tư phòng Lab.\n• Đảm bảo doanh số hàng tháng đạt chỉ tiêu phòng ban đề ra từ 95% - 110%.\n• Theo dõi và thu hồi công nợ từ các phòng khám, đại lý phân phối nhỏ lẻ.",
      techStack: ["Kinh doanh B2B", "Quản lý công nợ", "Chăm sóc bác sĩ"],
    },
  ],
  projects: [],
  education: [
    {
      id: "sale_med_e1",
      school: "Đại học Y Hà Nội",
      degree: "Cử nhân",
      fieldOfStudy: "Kỹ thuật Thiết bị Y tế",
      location: "Đống Đa, Hà Nội",
      startDate: "2016-09",
      endDate: "2020-07",
      current: false,
      grade: "GPA: 2.8 / 4.0",
      description: "Nắm vững nguyên lý hoạt động của các hệ thống thiết bị y tế trong phòng mổ, chẩn đoán hình ảnh và phòng cấp cứu.",
    },
  ],
  skills: [
    {
      id: "sale_med_s1",
      category: "Kỹ năng chuyên ngành",
      skills: ["Nguyên lý thiết bị y khoa", "Luật đấu thầu y tế", "Tư vấn kỹ thuật B2B", "Giải quyết khiếu nại kỹ thuật"],
    },
    {
      id: "sale_med_s2",
      category: "Kỹ năng mềm",
      skills: ["Giao tiếp thuyết phục", "Thuyết trình kỹ thuật", "Làm việc độc lập", "Đàm phán thương mại"],
    },
  ],
  languages: [
    {
      id: "sale_med_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "sale_med_l2",
      name: "Tiếng Anh",
      proficiency: "Đọc hiểu tài liệu kỹ thuật y tế tốt (TOEIC 720)",
    },
  ],
  certifications: [
    {
      id: "sale_med_c1",
      name: "Chứng chỉ Tập huấn Đấu thầu Trang thiết bị Y tế",
      issuer: "Bộ Y Tế Việt Nam",
      date: "2022-10",
    },
  ],
  customSections: [],
};

export const SaleOtoCV: CVData = {
  personalInfo: {
    name: "Phạm Quốc Khánh",
    title: "Chuyên viên Tư vấn Bán hàng Ô tô",
    email: "quockhanh.sales@toyota-mydinh.com.vn",
    phone: "(+84) 932 888 777",
    location: "Nam Từ Liêm, Hà Nội",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/sale_oto.png",
  },
  summary: "Chuyên viên tư vấn bán hàng ô tô chuyên nghiệp, năng động với 3 năm kinh nghiệm tại đại lý ủy quyền chính hãng của Toyota. Kỹ năng giao tiếp linh hoạt, thuyết phục khách hàng lái thử và chốt hợp đồng nhanh chóng. Có hiểu biết sâu sắc về các gói tài chính trả góp và thủ tục đăng ký lăn bánh xe.",
  workExperience: [
    {
      id: "sale_oto_w1",
      company: "Toyota Mỹ Đình",
      position: "Chuyên viên Tư vấn Sản phẩm",
      location: "Hà Nội",
      startDate: "2022-11",
      endDate: "Hiện tại",
      current: true,
      description: "• Bán thành công hơn 120 xe ô tô các dòng Vios, Camry, Fortuner trong năm 2024, đứng Top 3 nhân viên có doanh số cao nhất chi nhánh.\n• Tổ chức thành công 12 sự kiện lái thử xe cuối tuần (Test Drive) thu hút hơn 200 lượt khách tham gia trực tiếp và tạo ra hơn 30 đơn hàng mới.\n• Tư vấn gói phụ kiện chính hãng phù hợp, bảo hiểm ô tô vật chất, và kết nối nhanh chóng thủ tục vay vốn trả góp ngân hàng lãi suất ưu đãi cho khách hàng.",
      techStack: ["Kỹ năng chốt sale", "Kiến thức động cơ & khung gầm", "Phân tích gói vay tài chính"],
    },
    {
      id: "sale_oto_w2",
      company: "Hyundai Hà Đông",
      position: "Nhân viên Bán hàng",
      location: "Hà Nội",
      startDate: "2021-02",
      endDate: "2022-10",
      current: false,
      description: "• Đón tiếp khách hàng tham quan showroom, giới thiệu chi tiết các mẫu xe và chính sách khuyến mãi hiện hành.\n• Hướng dẫn và đi cùng khách hàng trong các buổi lái thử xe thực tế, giải thích cặn kẽ về tính năng an toàn chủ động và thụ động trên xe.\n• Chăm sóc khách hàng sau khi nhận bàn giao xe, hỗ trợ đăng ký đăng kiểm và làm thủ tục bảo hiểm bảo dưỡng định kỳ.",
      techStack: ["Chăm sóc khách hàng", "Kỹ năng đàm phán", "Kỹ thuật xe hơi"],
    },
  ],
  projects: [],
  education: [
    {
      id: "sale_oto_e1",
      school: "Đại học Công nghệ Giao thông Vận tải",
      degree: "Cử nhân",
      fieldOfStudy: "Công nghệ Kỹ thuật Ô tô",
      location: "Thanh Xuân, Hà Nội",
      startDate: "2016-09",
      endDate: "2020-07",
      current: false,
      grade: "GPA: 2.85 / 4.0",
      description: "Nắm vững kết cấu ô tô, lý thuyết động cơ đốt trong và hệ thống điện điện tử trên ô tô hiện đại.",
    },
  ],
  skills: [
    {
      id: "sale_oto_s1",
      category: "Kỹ năng nghề nghiệp",
      skills: ["Tư vấn tính năng xe ô tô", "Đàm phán giá & chốt hợp đồng", "Phân tích gói vay trả góp ngân hàng", "Thủ tục đăng ký đăng kiểm lăn bánh"],
    },
    {
      id: "sale_oto_s2",
      category: "Kỹ năng mềm",
      skills: ["Giao tiếp tự tin", "Lắng nghe thấu hiểu nhu cầu", "Làm việc độc lập & nhóm", "Giải quyết khiếu nại dịch vụ"],
    },
  ],
  languages: [
    {
      id: "sale_oto_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "sale_oto_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp cơ bản",
    },
  ],
  certifications: [
    {
      id: "sale_oto_c1",
      name: "Chứng nhận Chuyên viên Tư vấn Bán hàng Chuẩn Toyota (Toyota Sales Certification)",
      issuer: "Toyota Việt Nam",
      date: "2023-04",
    },
  ],
  customSections: [],
};
