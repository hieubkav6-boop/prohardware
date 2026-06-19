import { CVData } from "../../types/cv";

export const KySuCoKhiCV: CVData = {
  personalInfo: {
    name: "Hoàng Văn Tú",
    title: "Kỹ sư Thiết kế Cơ khí (SolidWorks/AutoCAD)",
    email: "hoangtu.mechanical@gmail.com",
    phone: "(+84) 968 111 333",
    location: "Quận Liên Chiểu, Đà Nẵng",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/ky_su.png",
  },
  summary: "Kỹ sư Cơ khí tận tâm với 4 năm kinh nghiệm thiết kế chế tạo máy và tối ưu hóa hệ thống sản xuất. Sử dụng thành thạo AutoCAD, SolidWorks thiết kế bản vẽ 2D/3D chi tiết máy, phân tích mô phỏng lực ứng suất (FEA) và giám sát gia công cơ khí chính xác (CNC).",
  workExperience: [
    {
      id: "eng_mech_w1",
      company: "Công ty Chế tạo Máy & Tự động hóa VinaMachine",
      position: "Kỹ sư Thiết kế Cơ khí",
      location: "Đà Nẵng",
      startDate: "2022-05",
      endDate: "Hiện tại",
      current: true,
      description: "• Thiết kế bản vẽ 3D cho các hệ thống băng tải và dây chuyền đóng chai tự động, bàn giao thành công cho 5 doanh nghiệp đối tác ngành thực phẩm.\n• Phối hợp với xưởng gia công cơ khí giám sát quá trình cắt laser, hàn, tiện phay CNC bản mẫu chi tiết máy đạt dung sai kỹ thuật dưới 0.05mm.\n• Tối ưu hóa cấu trúc khung dầm máy giúp giảm 12% khối lượng thép tiêu hao nhưng vẫn đảm bảo độ bền chịu tải tĩnh và tải động theo chuẩn phân tích ứng suất FEA.",
      techStack: ["SolidWorks", "AutoCAD 2D/3D", "Phân tích FEA", "Gia công CNC"],
    },
    {
      id: "eng_mech_w2",
      company: "Nhà máy Cơ khí Chính xác Hòa Phát",
      position: "Kỹ sư Giám sát Sản xuất",
      location: "Đà Nẵng",
      startDate: "2020-08",
      endDate: "2022-04",
      current: false,
      description: "• Quản lý vận hành và bảo trì định kỳ cho tổ hợp máy đột dập, máy phay giường CNC trong nhà xưởng.\n• Xử lý sự cố kỹ thuật đột xuất phát sinh trong ca làm việc, giảm thời gian chết của dây chuyền sản xuất xuống 20%.\n• Kiểm tra chất lượng sản phẩm đầu ra (QA/QC) đảm bảo tuân thủ nghiêm ngặt bản vẽ thiết kế.",
      techStack: ["Bảo trì máy", "Quản lý sản xuất", "Đo kiểm QA/QC"],
    },
  ],
  projects: [],
  education: [
    {
      id: "eng_mech_e1",
      school: "Đại học Bách khoa - Đại học Đà Nẵng",
      degree: "Kỹ sư",
      fieldOfStudy: "Kỹ thuật Chế tạo máy",
      location: "Đà Nẵng",
      startDate: "2015-09",
      endDate: "2020-06",
      current: false,
      grade: "GPA: 3.1 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "eng_mech_s1",
      category: "Kỹ năng phần mềm & Thiết kế",
      skills: ["SolidWorks 3D Modeling", "AutoCAD 2D Draft", "ANSYS Workbench (FEA)", "Mastercam lập trình CNC"],
    },
    {
      id: "eng_mech_s2",
      category: "Kiến thức kỹ thuật",
      skills: ["Dung sai lắp ghép", "Vật liệu học cơ khí", "Công nghệ hàn cắt sắt thép", "Đọc hiểu bản vẽ lắp ráp phức tạp"],
    },
  ],
  languages: [
    {
      id: "eng_mech_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "eng_mech_l2",
      name: "Tiếng Anh",
      proficiency: "Đọc hiểu bản vẽ tiếng Anh tốt (TOEIC 600)",
    },
  ],
  certifications: [
    {
      id: "eng_mech_c1",
      name: "Certified SolidWorks Professional (CSWP)",
      issuer: "Dassault Systèmes",
      date: "2023-03",
    },
  ],
  customSections: [],
};

export const KySuCoDienCV: CVData = {
  personalInfo: {
    name: "Đỗ Minh Vương",
    title: "Kỹ sư Cơ điện (M&E Project Engineer)",
    email: "minhvuong.me@gmail.com",
    phone: "(+84) 905 444 333",
    location: "Quận Bình Tân, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/ky_su.png",
  },
  summary: "Kỹ sư Cơ điện (M&E) với 3 năm kinh nghiệm thiết kế, thi công và giám sát hệ thống điện nhẹ, điện động lực, điều hòa thông gió (HVAC) cho các dự án tòa nhà chung cư và nhà xưởng công nghiệp. Am hiểu tiêu chuẩn kỹ thuật xây dựng và quy trình an toàn lao động.",
  workExperience: [
    {
      id: "eng_me_w1",
      company: "Công ty Cổ phần Dịch vụ và Kỹ thuật Cơ điện REE",
      position: "Kỹ sư Giám sát Thi công M&E",
      location: "TP. Hồ Chí Minh",
      startDate: "2023-03",
      endDate: "Hiện tại",
      current: true,
      description: "• Giám sát trực tiếp quá trình thi công đi dây cáp, lắp đặt tủ điện tổng MSB, và kết nối hệ thống điều hòa không khí trung tâm Chiller cho tòa nhà 25 tầng.\n• Kiểm tra bản vẽ shop drawing hệ thống điện nước cơ điện, giải trình phương án kỹ thuật và tiến hành nghiệm thu công trình với Tư vấn giám sát & Chủ đầu tư.\n• Đảm bảo tiến độ thi công nhanh hơn 10 ngày so với kế hoạch ban đầu, duy trì nội quy an toàn lao động công trường nghiêm ngặt, đạt thành tích 0 tai nạn.",
      techStack: ["Giám sát thi công", "Đọc Shop Drawing M&E", "Hệ thống HVAC", "Lắp tủ điện tổng"],
    },
    {
      id: "eng_me_w2",
      company: "Nhà thầu Cơ điện VinaMEP",
      position: "Kỹ sư Thiết kế Hệ thống Điện",
      location: "TP. Hồ Chí Minh",
      startDate: "2021-04",
      endDate: "2023-02",
      current: false,
      description: "• Thiết kế sơ đồ nguyên lý hệ thống điện nhẹ (CCTV, mạng Lan, báo cháy tự động) và hệ thống cấp thoát nước cho nhà xưởng may công nghiệp.\n• Lập bảng bóc tách khối lượng vật tư thiết bị (BOQ) cơ điện phục vụ hồ sơ báo giá đấu thầu.\n• Phối hợp với kỹ sư xây dựng xử lý các xung đột không gian đi ống thông gió và thang máng cáp.",
      techStack: ["Thiết kế sơ đồ nguyên lý", "Bóc khối lượng BOQ", "AutoCAD MEP"],
    },
  ],
  projects: [],
  education: [
    {
      id: "eng_me_e1",
      school: "Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh",
      degree: "Kỹ sư",
      fieldOfStudy: "Công nghệ Kỹ thuật Điện - Điện tử",
      location: "Thủ Đức, TP.HCM",
      startDate: "2016-09",
      endDate: "2021-02",
      current: false,
      grade: "GPA: 3.05 / 4.0",
      description: "Được đào tạo bài bản về máy điện, kỹ thuật chiếu sáng, hệ thống cung cấp điện tòa nhà và PLC điều khiển tự động.",
    },
  ],
  skills: [
    {
      id: "eng_me_s1",
      category: "Kỹ năng thiết kế & Phần mềm",
      skills: ["AutoCAD MEP", "Revit MEP cơ bản", "Bóc tách vật tư BOQ", "Dialux thiết kế chiếu sáng"],
    },
    {
      id: "eng_me_s2",
      category: "Hệ thống Cơ điện M&E",
      skills: ["Hệ thống Điện động lực & Điện nhẹ", "Hệ thống Điều hòa không khí (HVAC)", "Hệ thống PCCC & chống sét", "Tiêu chuẩn kỹ thuật TCVN / IEC"],
    },
  ],
  languages: [
    {
      id: "eng_me_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "eng_me_l2",
      name: "Tiếng Anh",
      proficiency: "Đọc hiểu catalogue thiết bị cơ điện tốt (TOEIC 650)",
    },
  ],
  certifications: [
    {
      id: "eng_me_c1",
      name: "Chứng chỉ Hành nghề Giám sát thi công xây dựng công trình cơ điện",
      issuer: "Sở Xây Dựng TP.HCM",
      date: "2022-12",
    },
  ],
  customSections: [],
};
