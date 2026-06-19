import { CVData } from "../../types/cv";

export const BacSiCV: CVData = {
  personalInfo: {
    name: "Nguyễn Minh Triết",
    title: "Bác sĩ Đa khoa (Nội tổng quát)",
    email: "minhtriet.doctor@gmail.com",
    phone: "(+84) 903 111 222",
    location: "Đống Đa, Hà Nội",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/bac_si.png",
  },
  summary: "Bác sĩ đa khoa tâm huyết, có hơn 5 năm kinh nghiệm thực hành lâm sàng tại Bệnh viện Bạch Mai. Khả năng chẩn đoán chính xác bệnh lý nội khoa, xây dựng phác đồ điều trị cá nhân hóa và quản lý hồ sơ bệnh án khoa học. Tận tụy vì người bệnh, giao tiếp nhẹ nhàng, thấu hiểu tâm lý bệnh nhân.",
  workExperience: [
    {
      id: "med_dr_w1",
      company: "Bệnh viện Bạch Mai - Khoa Nội tổng quát",
      position: "Bác sĩ Chuyên khoa Nội tổng quát",
      location: "Hà Nội",
      startDate: "2022-09",
      endDate: "Hiện tại",
      current: true,
      description: "• Tiếp đón, khám lâm sàng và kê đơn điều trị cho trung bình 60 bệnh nhân mỗi ngày tại phòng khám ngoại trú.\n• Chẩn đoán và theo dõi điều trị nội trú cho bệnh nhân Tim mạch và Đái tháo đường, áp dụng phác đồ điều trị cập nhật giúp cải thiện sức khỏe 92% ca bệnh nặng.\n• Tham gia hội chẩn liên khoa để quyết định phương án cấp cứu, xử lý kịp thời các ca tai biến nội khoa nguy hiểm.",
      techStack: ["Chẩn đoán lâm sàng", "Đọc kết quả cận lâm sàng", "Hội chẩn y khoa"],
    },
    {
      id: "med_dr_w2",
      company: "Bệnh viện Đa khoa Hồng Ngọc",
      position: "Bác sĩ Nội trú Lâm sàng",
      location: "Hà Nội",
      startDate: "2020-03",
      endDate: "2022-08",
      current: false,
      description: "• Thăm khám bệnh nhân cấp cứu, thực hiện kỹ thuật sơ cứu ban đầu, rửa vết thương và nẹp chấn thương xương khớp nhẹ.\n• Hỗ trợ bác sĩ trưởng khoa trong các tiểu phẫu lâm sàng và theo dõi chăm sóc bệnh nhân sau phẫu thuật.\n• Ghi chép bệnh án chính xác, tuân thủ nghiêm ngặt quy trình chống nhiễm khuẩn bệnh viện.",
      techStack: ["Sơ cứu cấp cứu", "Ghi hồ sơ bệnh án", "Tiểu phẫu lâm sàng"],
    },
  ],
  projects: [],
  education: [
    {
      id: "med_dr_e1",
      school: "Đại học Y Hà Nội",
      degree: "Bác sĩ Y khoa",
      fieldOfStudy: "Y đa khoa",
      location: "Đống Đa, Hà Nội",
      startDate: "2014-09",
      endDate: "2020-02",
      current: false,
      grade: "Xếp loại: Khá",
      description: "Hoàn thành khóa học bác sĩ đa khoa hệ chính quy 6 năm và thực tập lâm sàng tại các bệnh viện lớn (Bạch Mai, Việt Đức, Phụ sản TW).",
    },
  ],
  skills: [
    {
      id: "med_dr_s1",
      category: "Năng lực chuyên môn",
      skills: ["Khám lâm sàng nội khoa", "Đọc điện tim (ECG) & X-quang", "Siêu âm tổng quát cơ bản", "Xử lý cấp cứu nội khoa", "Phẫu thuật tiểu phẫu"],
    },
    {
      id: "med_dr_s2",
      category: "Kỹ năng mềm",
      skills: ["Thấu hiểu tâm lý bệnh nhân", "Giao tiếp y khoa thuyết phục", "Làm việc nhóm liên khoa", "Chịu áp lực trực đêm tốt"],
    },
  ],
  languages: [
    {
      id: "med_dr_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "med_dr_l2",
      name: "Tiếng Anh",
      proficiency: "Tiếng Anh chuyên ngành Y khoa (IELTS 6.5)",
    },
  ],
  certifications: [
    {
      id: "med_dr_c1",
      name: "Chứng chỉ Hành nghề Khám bệnh, Chữa bệnh Đa khoa",
      issuer: "Bộ Y Tế Việt Nam",
      date: "2021-12",
    },
  ],
  customSections: [],
};

export const YTaCV: CVData = {
  personalInfo: {
    name: "Phạm Thị Hương",
    title: "Điều dưỡng viên (Y tá Ngoại khoa)",
    email: "phanthihuong.nurse@gmail.com",
    phone: "(+84) 989 333 444",
    location: "Hoàn Kiếm, Hà Nội",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/y_ta.png",
  },
  summary: "Điều dưỡng viên chuyên nghiệp với hơn 3 năm kinh nghiệm chăm sóc hậu phẫu tại Bệnh viện Việt Đức. Thành thạo kỹ thuật tiêm truyền, thay băng cắt chỉ, quản lý buồng bệnh và phối hợp hỗ trợ bác sĩ chuẩn bị phòng mổ cấp cứu. Tận tâm, chu đáo và chịu áp lực công việc tốt.",
  workExperience: [
    {
      id: "med_ns_w1",
      company: "Bệnh viện Hữu nghị Việt Đức - Khoa Ngoại chấn thương",
      position: "Điều dưỡng viên Khoa Ngoại chấn thương",
      location: "Hà Nội",
      startDate: "2023-02",
      endDate: "Hiện tại",
      current: true,
      description: "• Theo dõi dấu hiệu sinh tồn (mạch, huyết áp, nhiệt độ) và cập nhật bệnh án hàng ngày cho 20 bệnh nhân nội trú hậu phẫu.\n• Thực hiện chuẩn xác y lệnh bác sĩ: tiêm bắp/tĩnh mạch, truyền dịch, đặt sonde dạ dày, thay băng vết mổ vô khuẩn định kỳ.\n• Tư vấn tâm lý giúp người bệnh yên tâm trước mổ và trực tiếp hướng dẫn chế độ dinh dưỡng, vận động phục hồi sau mổ cho người nhà bệnh nhân.",
      techStack: ["Kỹ thuật tiêm truyền", "Thay băng vết mổ vô khuẩn", "Theo dõi sinh hiệu"],
    },
    {
      id: "med_ns_w2",
      company: "Phòng khám Đa khoa Quốc tế Thu Cúc",
      position: "Điều dưỡng viên phòng thủ thuật",
      location: "Hà Nội",
      startDate: "2021-04",
      endDate: "2023-01",
      current: false,
      description: "• Tiếp đón, phân loại bệnh nhân, hướng dẫn làm thủ tục chụp chiếu xét nghiệm cận lâm sàng.\n• Chuẩn bị dụng cụ y tế phòng thủ thuật và hỗ trợ bác sĩ sát khuẩn, khâu vết thương hở ngoài da.\n• Bàn giao vật tư y tế tiêu hao phòng khám và lưu trữ hồ sơ hồ bệnh án ngăn nắp.",
      techStack: ["Tiếp đón phân loại", "Vệ sinh vô trùng dụng cụ", "Khâu rửa vết thương"],
    },
  ],
  projects: [],
  education: [
    {
      id: "med_ns_e1",
      school: "Cao đẳng Y tế Hà Nội",
      degree: "Cử nhân Cao đẳng",
      fieldOfStudy: "Điều dưỡng đa khoa",
      location: "Hà Nội",
      startDate: "2018-09",
      endDate: "2021-03",
      current: false,
      grade: "Xếp loại: Khá",
      description: "",
    },
  ],
  skills: [
    {
      id: "med_ns_s1",
      category: "Kỹ năng chuyên môn",
      skills: ["Tiêm tĩnh mạch & truyền dịch", "Sát khuẩn vết mổ vô trùng", "Kỹ thuật đặt sonde & thông tiểu", "Sơ cứu chấn thương ban đầu", "Quản lý buồng bệnh"],
    },
    {
      id: "med_ns_s2",
      category: "Kỹ năng mềm",
      skills: ["Giao tiếp nhẹ nhàng nhân văn", "Quan sát tinh tế nhạy bén", "Bình tĩnh trước tình huống cấp cứu", "Chịu áp lực ca kíp đêm"],
    },
  ],
  languages: [
    {
      id: "med_ns_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
  ],
  certifications: [
    {
      id: "med_ns_c1",
      name: "Chứng chỉ Hành nghề Điều dưỡng",
      issuer: "Sở Y Tế Hà Nội",
      date: "2022-06",
    },
  ],
  customSections: [],
};

export const DuocSiCV: CVData = {
  personalInfo: {
    name: "Nguyễn Hoàng Long",
    title: "Dược sĩ Tư vấn / Quản lý Nhà thuốc",
    email: "hoanglong.pharmacist@gmail.com",
    phone: "(+84) 934 555 666",
    location: "Quận 10, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/duoc_si.png",
  },
  summary: "Dược sĩ tốt nghiệp Đại học Dược Hà Nội với 3 năm kinh nghiệm tư vấn sử dụng thuốc và quản lý dược phẩm tại chuỗi nhà thuốc lớn Pharmacity. Am hiểu sâu sắc các hoạt chất, chống chỉ định, tương tác thuốc và kỹ năng tư vấn khách hàng chu đáo.",
  workExperience: [
    {
      id: "med_ph_w1",
      company: "Chuỗi nhà thuốc Pharmacity",
      position: "Dược sĩ Trưởng cửa hàng",
      location: "TP. Hồ Chí Minh",
      startDate: "2023-01",
      endDate: "Hiện tại",
      current: true,
      description: "• Đứng quầy tư vấn sử dụng thuốc và ra toa bán lẻ thuốc theo đơn bác sĩ cho khoảng 150 lượt khách hàng mỗi ngày.\n• Quản lý xuất nhập tồn dược phẩm tại cửa hàng, kiểm soát chặt chẽ hạn dùng thuốc theo nguyên tắc FEFO, bảo quản vắc xin và thuốc đặc biệt theo chuẩn GPP.\n• Đào tạo kỹ năng tư vấn sử dụng thuốc an toàn hiệu quả và văn hóa dịch vụ khách hàng cho 3 dược sĩ mới nhận việc.",
      techStack: ["Tư vấn sử dụng thuốc", "Quản lý tồn kho dược phẩm", "Tiêu chuẩn GPP"],
    },
    {
      id: "med_ph_w2",
      company: "Hệ thống Nhà thuốc Long Châu",
      position: "Dược sĩ Tư vấn Bán lẻ",
      location: "TP. Hồ Chí Minh",
      startDate: "2021-08",
      endDate: "2022-12",
      current: false,
      description: "• Bán thuốc kê đơn và không kê đơn, tư vấn sử dụng thực phẩm chức năng bảo vệ sức khỏe và mỹ phẩm chăm sóc da.\n• Thực hiện quy trình vệ sinh tủ thuốc, phân loại thuốc theo nhóm điều trị chuẩn xác.\n• Giải đáp thắc mắc của khách hàng về tương tác và liều lượng sử dụng thuốc qua hotline.",
      techStack: ["Dược lâm sàng cơ bản", "Tương tác thuốc", "Chăm sóc khách hàng"],
    },
  ],
  projects: [],
  education: [
    {
      id: "med_ph_e1",
      school: "Đại học Dược Hà Nội",
      degree: "Cử nhân Dược học",
      fieldOfStudy: "Dược lâm sàng",
      location: "Hoàn Kiếm, Hà Nội",
      startDate: "2016-09",
      endDate: "2021-06",
      current: false,
      grade: "GPA: 3.25 / 4.0",
      description: "Khóa luận tốt nghiệp đạt điểm xuất sắc về đề tài khảo sát tương tác thuốc trên bệnh nhân lão khoa nội trú.",
    },
  ],
  skills: [
    {
      id: "med_ph_s1",
      category: "Năng lực chuyên môn",
      skills: ["Dược lý & Dược lâm sàng", "Tương tác & Tác dụng phụ của thuốc", "Quy trình GPP (Good Pharmacy Practice)", "Quản lý kho & Bảo quản dược phẩm", "Kỹ năng ra lẻ thuốc chuẩn"],
    },
    {
      id: "med_ph_s2",
      category: "Kỹ năng bán hàng",
      skills: ["Tư vấn thấu hiểu khách hàng", "Giao tiếp thuyết phục", "Xử lý từ chối khéo léo", "Sử dụng phần mềm bán hàng POS"],
    },
  ],
  languages: [
    {
      id: "med_ph_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "med_ph_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp khá (TOEIC 680)",
    },
  ],
  certifications: [
    {
      id: "med_ph_c1",
      name: "Chứng chỉ Hành nghề Dược",
      issuer: "Sở Y Tế TP.HCM",
      date: "2022-10",
    },
  ],
  customSections: [],
};
