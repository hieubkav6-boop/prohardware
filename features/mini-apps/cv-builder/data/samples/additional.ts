import { CVData } from "../../types/cv";

// 1. Content Writer / Copywriter
export const ContentWriterCV: CVData = {
  personalInfo: {
    name: "Phan Thùy Dương",
    title: "Chuyên viên Content Writer / Copywriter",
    email: "duong.phan.writer@gmail.com",
    phone: "(+84) 933 222 111",
    location: "Bình Thạnh, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/duongphan-writer",
    avatar: "/avatars/marketing.png",
  },
  summary: "Chuyên viên sáng tạo nội dung (Content Writer) với hơn 3 năm kinh nghiệm trong lĩnh vực truyền thông số. Có thế mạnh viết bài chuẩn SEO, xây dựng kịch bản video mạng xã hội và lên kế hoạch nội dung đa kênh (Facebook, Blog, TikTok) giúp tăng tỷ lệ tương tác tự nhiên lên 45%.",
  workExperience: [
    {
      id: "cw_exp_1",
      company: "Công ty Truyền thông và Giải trí Agency X",
      position: "Senior Content Creator",
      location: "TP. Hồ Chí Minh",
      startDate: "2023-02",
      endDate: "Hiện tại",
      current: true,
      description: "• Lên kế hoạch nội dung hàng tháng cho 5 nhãn hàng FMCG, đảm bảo đúng định hướng thương hiệu.\n• Biên tập nội dung bài viết chuẩn SEO, tăng thứ hạng 15+ từ khóa khóa học/dịch vụ lên Top 5 Google.\n• Viết kịch bản video ngắn cho kênh TikTok thương hiệu, mang lại video đạt mốc triệu view đầu tiên cho nhãn hàng.",
      techStack: ["WordPress", "SEO Tools", "Canva", "Google Analytics", "Facebook Business Suite"],
    }
  ],
  projects: [
    {
      id: "cw_pj_1",
      title: "Chiến dịch Tết Sum Vầy 2024",
      role: "Copywriter chính",
      description: "Xây dựng toàn bộ thông điệp truyền thông, bài PR, kịch bản video ngắn và các bài đăng social cho chiến dịch Tết đạt hơn 2 triệu lượt tiếp cận.",
      link: "",
      techStack: ["Copywriting", "Creative Thinking", "Social Media Plan"],
    }
  ],
  education: [
    {
      id: "cw_edu_1",
      school: "Đại học Khoa học Xã hội và Nhân văn - ĐHQG TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Báo chí & Truyền thông",
      location: "Quận 1, TP.HCM",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
      grade: "GPA: 3.4 / 4.0",
    }
  ],
  skills: [
    { id: "cw_sk_1", category: "Kỹ năng chuyên môn", skills: ["Copywriting", "SEO Optimization", "Content Strategy", "Kịch bản Video", "PR Writing"] },
    { id: "cw_sk_2", category: "Công cụ hỗ trợ", skills: ["SEMrush", "Google Docs", "Ahrefs", "CapCut", "WordPress"] }
  ],
  languages: [
    { id: "cw_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "cw_lang_2", name: "Tiếng Anh", proficiency: "Lưu loát (IELTS 7.0)" }
  ],
  certifications: [],
  customSections: [],
};

// 2. UI/UX Designer
export const UIUXDesignerCV: CVData = {
  personalInfo: {
    name: "Lê Minh Anh",
    title: "Chuyên viên thiết kế UI/UX Designer",
    email: "minhanh.design@gmail.com",
    phone: "(+84) 977 444 888",
    location: "Đống Đa, Hà Nội",
    website: "behance.net/minhanh-design",
    github: "",
    linkedin: "linkedin.com/in/minhanh-uiux",
    avatar: "/avatars/designer.png",
  },
  summary: "Thiết kế giao diện và trải nghiệm người dùng (UI/UX Designer) với 4 năm kinh nghiệm. Đam mê tạo ra các giao diện trực quan, lấy người dùng làm trung tâm, tối ưu hóa hành trình người dùng cho Web App và Mobile App. Thành thạo xây dựng Design System quy mô lớn.",
  workExperience: [
    {
      id: "ds_exp_1",
      company: "Tập đoàn Công nghệ TechVina",
      position: "UI/UX Designer",
      location: "Hà Nội",
      startDate: "2022-05",
      endDate: "Hiện tại",
      current: true,
      description: "• Thiết kế giao diện cho hệ thống E-learning học trực tuyến và ứng dụng di động đi kèm.\n• Nghiên cứu hành vi người dùng (User Research) và xây dựng chân dung khách hàng giúp tối ưu hóa luồng thanh toán, nâng tỷ lệ chuyển đổi đơn hàng thêm 12%.\n• Xây dựng và duy trì Design System đồng bộ, giảm thiểu 30% thời gian code giao diện của lập trình viên.",
      techStack: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Prototyping"],
    }
  ],
  projects: [
    {
      id: "ds_pj_1",
      title: "Ứng dụng FinTech EasyPay",
      role: "Lead UI/UX Designer",
      description: "Thiết kế lại toàn bộ giao diện ứng dụng ví điện tử với 50+ màn hình, đơn giản hóa quy trình chuyển tiền xuống dưới 3 bước.",
      link: "behance.net/project/easypay-fintech",
      techStack: ["Figma", "User Flow", "Design System", "Wireframing"],
    }
  ],
  education: [
    {
      id: "ds_edu_1",
      school: "Đại học Mỹ thuật Công nghiệp Hà Nội",
      degree: "Cử nhân",
      fieldOfStudy: "Thiết kế Đồ họa",
      location: "Hà Nội",
      startDate: "2017-09",
      endDate: "2021-06",
      current: false,
    }
  ],
  skills: [
    { id: "ds_sk_1", category: "UI/UX Design", skills: ["User Research", "Wireframing", "Prototyping", "Design System", "Information Architecture"] },
    { id: "ds_sk_2", category: "Công cụ thiết kế", skills: ["Figma", "Adobe Creative Suite", "Zeplin", "Miro"] }
  ],
  languages: [
    { id: "ds_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "ds_lang_2", name: "Tiếng Anh", proficiency: "Đọc hiểu tài liệu chuyên ngành tốt" }
  ],
  certifications: [],
  customSections: [],
};

// 3. Data Analyst
export const DataAnalystCV: CVData = {
  personalInfo: {
    name: "Phạm Hải Đăng",
    title: "Chuyên viên phân tích dữ liệu (Data Analyst)",
    email: "haidang.data@gmail.com",
    phone: "(+84) 909 333 444",
    location: "Quận 3, TP. Hồ Chí Minh",
    website: "",
    github: "github.com/haidang-data",
    linkedin: "linkedin.com/in/haidang-data-analyst",
    avatar: "/avatars/dev.png",
  },
  summary: "Chuyên viên phân tích dữ liệu (Data Analyst) hơn 3 năm kinh nghiệm trong lĩnh vực E-commerce và Bán lẻ. Thành thạo viết các truy vấn SQL phức tạp, xử lý dữ liệu lớn bằng Python và trực quan hóa dữ liệu qua dashboard Power BI giúp ban giám đốc đưa ra các quyết định vận hành chính xác.",
  workExperience: [
    {
      id: "da_exp_1",
      company: "Chuỗi siêu thị Retail Mart",
      position: "Data Analyst",
      location: "TP. Hồ Chí Minh",
      startDate: "2023-01",
      endDate: "Hiện tại",
      current: true,
      description: "• Xây dựng và tự động hóa các báo cáo doanh thu, tồn kho hàng ngày bằng SQL và Power BI.\n• Phân tích hành vi mua sắm chéo của khách hàng, đề xuất chương trình khuyến mãi giúp tăng giá trị đơn hàng trung bình thêm 8%.\n• Xử lý và làm sạch dữ liệu từ nhiều nguồn khác nhau phục vụ phân tích dự báo xu hướng mua sắm.",
      techStack: ["SQL", "Python", "Power BI", "Excel Advanced", "Google BigQuery"],
    }
  ],
  projects: [
    {
      id: "da_pj_1",
      title: "Hệ thống Phân tích Churn Rate",
      role: "Data Analyst độc lập",
      description: "Xây dựng mô hình phân tích và dự báo tỷ lệ khách hàng rời bỏ dịch vụ sử dụng Python (Pandas, Scikit-learn), giúp bộ phận CSKH có giải pháp giữ chân kịp thời.",
      link: "",
      techStack: ["Python", "Machine Learning", "Pandas", "Power BI"],
    }
  ],
  education: [
    {
      id: "da_edu_1",
      school: "Đại học Kinh tế TP.HCM (UEH)",
      degree: "Cử nhân",
      fieldOfStudy: "Hệ thống thông tin quản lý",
      location: "TP.HCM",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
      grade: "GPA: 3.35 / 4.0",
    }
  ],
  skills: [
    { id: "da_sk_1", category: "Kỹ năng phân tích", skills: ["SQL Queries", "Data Visualization", "Statistical Analysis", "Data Cleaning", "Data Modeling"] },
    { id: "da_sk_2", category: "Công cụ & Ngôn ngữ", skills: ["SQL Server", "Python (Pandas, NumPy)", "Power BI", "Tableau", "Excel"] }
  ],
  languages: [
    { id: "da_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "da_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp Tốt (TOEIC 850)" }
  ],
  certifications: [],
  customSections: [],
};

// 4. DevOps Engineer
export const DevOpsEngineerCV: CVData = {
  personalInfo: {
    name: "Trịnh Đình Nam",
    title: "Kỹ sư DevOps / Cloud Engineer",
    email: "nam.trinh.devops@gmail.com",
    phone: "(+84) 911 555 999",
    location: "Cầu Giấy, Hà Nội",
    website: "",
    github: "github.com/namtrinh-devops",
    linkedin: "linkedin.com/in/namtrinh-devops",
    avatar: "/avatars/dev.png",
  },
  summary: "Kỹ sư DevOps chuyên nghiệp với kinh nghiệm thiết kế, triển khai và tự động hóa hạ tầng đám mây (AWS). Thành thạo các công cụ CI/CD, Containerization (Docker, Kubernetes) và Infrastructure as Code (Terraform), hướng tới tối ưu hóa hiệu năng, bảo mật và khả năng mở rộng tự động.",
  workExperience: [
    {
      id: "de_exp_1",
      company: "Công ty Phần mềm Toàn Cầu GlobalSoft",
      position: "DevOps Engineer",
      location: "Hà Nội",
      startDate: "2022-08",
      endDate: "Hiện tại",
      current: true,
      description: "• Thiết kế hạ tầng microservices chạy trên nền tảng AWS EKS phục vụ 200k CCU.\n• Xây dựng đường ống CI/CD tự động bằng Jenkins và GitHub Actions giúp rút ngắn 60% thời gian triển khai sản phẩm.\n• Triển khai giám sát hệ thống thời gian thực với Prometheus & Grafana, giúp phát hiện và xử lý sự cố trước khi ảnh hưởng đến khách hàng.",
      techStack: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "Linux Shell"],
    }
  ],
  projects: [
    {
      id: "de_pj_1",
      title: "Hệ thống CI/CD Automation",
      role: "Kỹ sư chịu trách nhiệm chính",
      description: "Tự động hóa toàn bộ quá trình build, test và deploy cho dự án SaaS bằng Docker và GitHub Actions lên môi trường AWS ECS.",
      link: "",
      techStack: ["Docker", "GitHub Actions", "AWS ECS", "Terraform"],
    }
  ],
  education: [
    {
      id: "de_edu_1",
      school: "Đại học Bách Khoa Hà Nội",
      degree: "Kỹ sư",
      fieldOfStudy: "Công nghệ Thông tin",
      location: "Hà Nội",
      startDate: "2017-09",
      endDate: "2022-06",
      current: false,
    }
  ],
  skills: [
    { id: "de_sk_1", category: "DevOps & Cloud", skills: ["CI/CD Pipelines", "Containerization", "Orchestration", "Infrastructure as Code", "Cloud Architecture"] },
    { id: "de_sk_2", category: "Công cụ", skills: ["AWS", "Docker", "Kubernetes (K8s)", "Jenkins", "Terraform", "Prometheus & Grafana"] }
  ],
  languages: [
    { id: "de_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "de_lang_2", name: "Tiếng Anh", proficiency: "Lưu loát (TOEIC 800)" }
  ],
  certifications: [],
  customSections: [],
};

// 5. Mobile Developer
export const MobileDeveloperCV: CVData = {
  personalInfo: {
    name: "Hoàng Gia Bảo",
    title: "Lập trình viên Di Động (Flutter / React Native)",
    email: "giabao.mobile@gmail.com",
    phone: "(+84) 944 666 333",
    location: "Quận 10, TP. Hồ Chí Minh",
    website: "",
    github: "github.com/giabao-mobile",
    linkedin: "linkedin.com/in/giabao-mobile-dev",
    avatar: "/avatars/dev.png",
  },
  summary: "Lập trình viên ứng dụng di động hơn 3 năm kinh nghiệm phát triển ứng dụng đa nền tảng sử dụng Flutter và React Native. Có tư duy tối ưu UI mượt mà, xử lý lưu trữ offline hiệu quả và đưa thành công 5+ ứng dụng lên cửa hàng Google Play & App Store.",
  workExperience: [
    {
      id: "mb_exp_1",
      company: "App Studio Co., Ltd",
      position: "Mobile Application Developer",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-10",
      endDate: "Hiện tại",
      current: true,
      description: "• Phát triển ứng dụng đặt đồ ăn nhanh sử dụng Flutter, tích hợp bản đồ và hệ thống định vị thời gian thực.\n• Tối ưu hiệu suất vẽ giao diện (60fps) và giảm 40% dung lượng ứng dụng.\n• Thực hiện cấu hình, ký số và phát hành ứng dụng lên App Store và CH Play.",
      techStack: ["Flutter", "Dart", "Firebase", "Bloc Pattern", "REST API", "Git"],
    }
  ],
  projects: [
    {
      id: "mb_pj_1",
      title: "Ứng dụng Theo dõi Sức khỏe FitLife",
      role: "Lập trình viên Flutter chính",
      description: "Ứng dụng giúp người dùng đếm bước chân, lên kế hoạch ăn uống và kết nối với các thiết bị thông minh thông qua Bluetooth BLE.",
      link: "",
      techStack: ["Flutter", "Core Bluetooth", "Local SQLite", "Firebase Auth"],
    }
  ],
  education: [
    {
      id: "mb_edu_1",
      school: "Đại học FPT TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Kỹ thuật Phần mềm",
      location: "Quận 9, TP.HCM",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
    }
  ],
  skills: [
    { id: "mb_sk_1", category: "Mobile Development", skills: ["Flutter / Dart", "React Native", "State Management (Bloc, Redux)", "Offline Data Storage", "App Publishing"] },
    { id: "mb_sk_2", category: "Công cụ & Tích hợp", skills: ["App Store Connect", "Google Play Console", "Firebase", "SQLite / Realm", "Git"] }
  ],
  languages: [
    { id: "mb_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "mb_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp Tốt" }
  ],
  certifications: [],
  customSections: [],
};

// 6. Project Manager
export const ProjectManagerCV: CVData = {
  personalInfo: {
    name: "Đỗ Thùy Linh",
    title: "Quản lý Dự án Công nghệ (Project Manager)",
    email: "thuylinh.pm@gmail.com",
    phone: "(+84) 902 444 555",
    location: "Hai Bà Trưng, Hà Nội",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/thuylinh-pm",
    avatar: "/avatars/business_woman.png",
  },
  summary: "Quản lý Dự án Công nghệ (Project Manager) với hơn 5 năm kinh nghiệm quản trị các dự án phần mềm theo mô hình Agile/Scrum. Có kỹ năng xuất sắc trong việc quản lý tiến độ, tối ưu hóa nguồn lực phát triển và là cầu nối đắc lực giữa khách hàng và đội ngũ kỹ thuật.",
  workExperience: [
    {
      id: "pm_exp_1",
      company: "Công ty Cổ phần Giải pháp Số VinaTech",
      position: "IT Project Manager",
      location: "Hà Nội",
      startDate: "2021-11",
      endDate: "Hiện tại",
      current: true,
      description: "• Quản lý trực tiếp 3 dự án phát triển phần mềm ngân hàng số cùng lúc với tổng ngân sách hơn 3 tỷ VNĐ.\n• Điều phối công việc cho đội ngũ phát triển gồm 15 thành viên (Dev, QA, BA, Designer), đảm bảo bàn giao sản phẩm đúng cam kết (on-time delivery) đạt tỷ lệ 95%.\n• Áp dụng mô hình Scrum, tổ chức các cuộc họp hàng ngày (Daily Standup) và đánh giá cải tiến quy trình làm việc giúp nâng cao năng suất của nhóm thêm 20%.",
      techStack: ["Jira Software", "Confluence", "Trello", "MS Project", "Scrum Framework"],
    }
  ],
  projects: [
    {
      id: "pm_pj_1",
      title: "Dự án Nâng cấp Hệ thống Core Banking",
      role: "Project Manager",
      description: "Quản lý dự án nâng cấp hệ thống lõi ngân hàng, tích hợp các phương thức thanh toán QR code và chuyển tiền nhanh 24/7.",
      link: "",
      techStack: ["Risk Management", "Budget Control", "Agile/Scrum", "Jira"],
    }
  ],
  education: [
    {
      id: "pm_edu_1",
      school: "Đại học Quốc gia Hà Nội - Trường ĐH Công nghệ",
      degree: "Cử nhân",
      fieldOfStudy: "Hệ thống Thông tin",
      location: "Hà Nội",
      startDate: "2013-09",
      endDate: "2017-06",
      current: false,
    }
  ],
  skills: [
    { id: "pm_sk_1", category: "Quản lý Dự án", skills: ["Agile / Scrum Methodologies", "Risk Management", "Budgeting & Estimation", "Stakeholder Communication", "Resource Allocation"] },
    { id: "pm_sk_2", category: "Công cụ quản lý", skills: ["Jira / Confluence", "Trello", "Microsoft Project", "Asana", "Slack"] }
  ],
  languages: [
    { id: "pm_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "pm_lang_2", name: "Tiếng Anh", proficiency: "Lưu loát chuyên ngành (IELTS 7.5)" }
  ],
  certifications: [
    { id: "pm_cert_1", name: "Project Management Professional (PMP)", issuer: "PMI", date: "2023-05" },
    { id: "pm_cert_2", name: "Certified ScrumMaster (CSM)", issuer: "Scrum Alliance", date: "2022-03" }
  ],
  customSections: [],
};

// 7. Business Analyst
export const BusinessAnalystCV: CVData = {
  personalInfo: {
    name: "Nguyễn Thị Mai Chi",
    title: "Chuyên viên phân tích nghiệp vụ (Business Analyst)",
    email: "maichi.ba@gmail.com",
    phone: "(+84) 989 111 222",
    location: "Quận Bình Thạnh, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/maichi-ba",
    avatar: "/avatars/business_woman.png",
  },
  summary: "Chuyên viên Phân tích Nghiệp vụ (Business Analyst) hơn 4 năm kinh nghiệm. Chuyên sâu khảo sát yêu cầu khách hàng, phân tích quy trình kinh doanh và viết tài liệu kỹ thuật chi tiết (SRS, User Stories). Đóng vai trò truyền tải chính xác mong muốn kinh doanh thành giải pháp kỹ thuật.",
  workExperience: [
    {
      id: "ba_exp_1",
      company: "Công ty Phần mềm SmartDev",
      position: "Senior Business Analyst",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-04",
      endDate: "Hiện tại",
      current: true,
      description: "• Gặp gỡ trực tiếp khách hàng nước ngoài để khảo sát yêu cầu, làm rõ nghiệp vụ dự án quản lý bệnh viện.\n• Soạn thảo tài liệu đặc tả yêu cầu hệ thống (SRS), vẽ biểu đồ luồng dữ liệu (Dataflow) và sơ đồ quy trình nghiệp vụ (BPMN).\n• Phối hợp với đội ngũ phát triển và QA để kiểm thử nghiệm thu người dùng (UAT), đảm bảo chất lượng phần mềm đúng yêu cầu.",
      techStack: ["BPMN", "UML", "Jira", "Confluence", "Draw.io", "Wireframing Tools"],
    }
  ],
  projects: [
    {
      id: "ba_pj_1",
      title: "Hệ thống Quản trị Nhân sự HRM",
      role: "Business Analyst chính",
      description: "Phân tích quy trình quản lý nhân sự, chấm công và tính lương của một tổng công ty với 1000+ nhân viên để số hóa thành công phần mềm quản trị HRM.",
      link: "",
      techStack: ["Business Analysis", "SRS Documentation", "UML Diagrams", "Figma mockup"],
    }
  ],
  education: [
    {
      id: "ba_edu_1",
      school: "Đại học Ngoại thương Cơ sở II",
      degree: "Cử nhân",
      fieldOfStudy: "Thương mại Quốc tế",
      location: "TP.HCM",
      startDate: "2014-09",
      endDate: "2018-06",
      current: false,
    }
  ],
  skills: [
    { id: "ba_sk_1", category: "Phân tích nghiệp vụ", skills: ["Requirement Gathering", "SRS / PRD Writing", "BPMN / Flowcharting", "UML Use Cases", "UAT Testing"] },
    { id: "ba_sk_2", category: "Công cụ phân tích", skills: ["Draw.io / Lucidchart", "Jira / Confluence", "Balsamiq / Figma Mockups", "SQL Basic"] }
  ],
  languages: [
    { id: "ba_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "ba_lang_2", name: "Tiếng Anh", proficiency: "Trôi chảy (IELTS 7.0)" }
  ],
  certifications: [],
  customSections: [],
};

// 8. HR Specialist
export const HRSpecialistCV: CVData = {
  personalInfo: {
    name: "Vũ Phương Thảo",
    title: "Chuyên viên Tuyển dụng & Nhân sự (HR Specialist)",
    email: "phuongthao.hr@gmail.com",
    phone: "(+84) 977 123 456",
    location: "Cầu Giấy, Hà Nội",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/phuongthao-hr",
    avatar: "/avatars/van_phong.png",
  },
  summary: "Chuyên viên Tuyển dụng nhân sự (HR Specialist) với hơn 3 năm kinh nghiệm trong lĩnh vực tuyển dụng ngành Công nghệ thông tin (IT Recruitment). Có mạng lưới quan hệ ứng viên rộng lớn, kỹ năng phỏng vấn chuyên nghiệp và xây dựng chính sách văn hóa doanh nghiệp giữ chân nhân tài.",
  workExperience: [
    {
      id: "hr_exp_1",
      company: "Công ty Cổ phần Công nghệ Techcom Solutions",
      position: "HR & Recruiter Specialist",
      location: "Hà Nội",
      startDate: "2023-02",
      endDate: "Hiện tại",
      current: true,
      description: "• Đảm nhận toàn bộ quy trình tuyển dụng cho các vị trí lập trình viên (Frontend, Backend, Mobile) từ tìm kiếm hồ sơ đến phỏng vấn và gửi offer.\n• Đạt KPI tuyển dụng trung bình 10 nhân sự chất lượng cao mỗi tháng, rút ngắn thời gian tuyển dụng từ 35 ngày xuống còn 25 ngày.\n• Tổ chức các sự kiện nội bộ định kỳ (Team building, sinh nhật công ty) giúp tăng mức độ gắn kết của nhân viên lên 85%.",
      techStack: ["ATS Tools", "LinkedIn Recruiter", "Vietnamworks", "Facebook Groups", "Canva"],
    }
  ],
  projects: [
    {
      id: "hr_pj_1",
      title: "Ngày Hội Việc Làm IT Career Fair 2024",
      role: "Trưởng ban tổ chức phía công ty",
      description: "Tổ chức ngày hội tuyển dụng trực tiếp thu hút hơn 500 sinh viên ngành IT tham gia, thu về hơn 150 hồ sơ ứng viên tiềm năng.",
      link: "",
      techStack: ["Event Planning", "Public Speaking", "Employer Branding"],
    }
  ],
  education: [
    {
      id: "hr_edu_1",
      school: "Đại học Lao động - Xã hội",
      degree: "Cử nhân",
      fieldOfStudy: "Quản trị Nhân lực",
      location: "Hà Nội",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
    }
  ],
  skills: [
    { id: "hr_sk_1", category: "Nhân sự & Tuyển dụng", skills: ["IT Headhunting", "Interviewing & Selection", "Onboarding Process", "Employer Branding", "Employee Engagement"] },
    { id: "hr_sk_2", category: "Nền tảng & Công cụ", skills: ["LinkedIn Recruiter", "TopCV / VietnamWorks", "ATS Base.vn", "Canva"] }
  ],
  languages: [
    { id: "hr_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "hr_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp Tốt" }
  ],
  certifications: [],
  customSections: [],
};

// 9. Event Planner
export const EventPlannerCV: CVData = {
  personalInfo: {
    name: "Lâm Minh Triết",
    title: "Chuyên viên tổ chức sự kiện (Event Planner)",
    email: "minhtriet.events@gmail.com",
    phone: "(+84) 938 989 898",
    location: "Quận Phú Nhuận, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/trietlam-event",
    avatar: "/avatars/marketing.png",
  },
  summary: "Chuyên viên tổ chức sự kiện (Event Planner) sáng tạo và năng động với 4 năm kinh nghiệm. Có khả năng quản lý từ khâu lên ý tưởng thiết kế, lập ngân sách chi tiết đến quản lý vận hành trực tiếp sự kiện thực tế của các doanh nghiệp lớn.",
  workExperience: [
    {
      id: "ev_exp_1",
      company: "Công ty Sự kiện và Truyền thông RedEvent",
      position: "Senior Event Executive",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-03",
      endDate: "Hiện tại",
      current: true,
      description: "• Lên kế hoạch và thực hiện thành công hơn 30 sự kiện hội nghị khách hàng, gala dinner, lễ ra mắt sản phẩm cho các nhãn hàng công nghệ lớn.\n• Quản lý trực tiếp ngân sách sự kiện lên tới 1 tỷ VNĐ mỗi dự án, thương lượng với các nhà cung ứng thiết bị giúp tiết kiệm 10% chi phí.\n• Chỉ đạo toàn bộ đội ngũ kỹ thuật âm thanh, ánh sáng và thiết kế thi công sân khấu chạy thử kịch bản trực tiếp.",
      techStack: ["Microsoft Excel", "AutoCAD (Xem bản vẽ)", "Asana Project Management", "Canva", "Google Workspace"],
    }
  ],
  projects: [
    {
      id: "ev_pj_1",
      title: "Lễ Ra Mắt Xe Điện EV-Car 2024",
      role: "Tổng đạo diễn sự kiện",
      description: "Sự kiện ra mắt xe điện mới với sự tham dự của 400 khách mời danh dự và báo chí, đạt chỉ số hài lòng của khách hàng là 98%.",
      link: "",
      techStack: ["Event Concept", "Vendor Management", "Logistics Coordination"],
    }
  ],
  education: [
    {
      id: "ev_edu_1",
      school: "Đại học Văn Lang",
      degree: "Cử nhân",
      fieldOfStudy: "Quản trị Dịch vụ Du lịch & Lữ hành",
      location: "TP.HCM",
      startDate: "2016-09",
      endDate: "2020-06",
      current: false,
    }
  ],
  skills: [
    { id: "ev_sk_1", category: "Tổ chức sự kiện", skills: ["Event Concept & Theme", "Budget Control", "Vendor Negotiation", "On-site Supervision", "Logistics Planning"] },
    { id: "ev_sk_2", category: "Kỹ năng bổ trợ", skills: ["Time Management", "Crisis Management", "Public Speaking", "Asana / Excel"] }
  ],
  languages: [
    { id: "ev_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "ev_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp trôi chảy (IELTS 6.5)" }
  ],
  certifications: [],
  customSections: [],
};

// 10. Customer Service Representative
export const CustomerServiceCV: CVData = {
  personalInfo: {
    name: "Tạ Khánh Huyền",
    title: "Nhân viên Chăm sóc khách hàng (Customer Service)",
    email: "khanhhuyen.cs@gmail.com",
    phone: "(+84) 965 222 777",
    location: "Thanh Xuân, Hà Nội",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/khanhhuyen-cs",
    avatar: "/avatars/van_phong.png",
  },
  summary: "Nhân viên chăm sóc khách hàng (Customer Service Specialist) chuyên nghiệp với giọng nói truyền cảm và sự kiên nhẫn cao. Kinh nghiệm xử lý hàng ngàn cuộc gọi, tin nhắn khiếu nại của khách hàng qua tổng đài giúp duy trì chỉ số hài lòng khách hàng CSAT ở mức 96%.",
  workExperience: [
    {
      id: "cs_exp_1",
      company: "Trung tâm Dịch vụ Khách hàng Shopee Vietnam",
      position: "Customer Service Senior Agent",
      location: "Hà Nội",
      startDate: "2023-01",
      endDate: "Hiện tại",
      current: true,
      description: "• Tiếp nhận và xử lý các thắc mắc, khiếu nại của người dùng về đơn hàng, hoàn tiền qua hệ thống tổng đài và live chat trực tuyến.\n• Giải quyết các trường hợp tranh chấp phức tạp giữa người mua và người bán, đưa ra phương án xử lý công bằng.\n• Đạt danh hiệu nhân viên xuất sắc nhất tháng 3 lần liên tiếp nhờ chỉ số xử lý cuộc gọi nhanh và CSAT cao nhất nhóm.",
      techStack: ["CRM Salesforce", "Zendesk", "IP Phone System", "Slack", "Microsoft Excel"],
    }
  ],
  projects: [
    {
      id: "cs_pj_1",
      title: "Cải tiến Quy trình Giải quyết Khiếu nại",
      role: "Thành viên đề xuất cải tiến",
      description: "Xây dựng ngân hàng câu trả lời mẫu (template answers) cho nhóm, giúp rút ngắn thời gian phản hồi trung bình cho khách hàng giảm 20%.",
      link: "",
      techStack: ["Customer Experience", "Zendesk Templates", "Team Collaboration"],
    }
  ],
  education: [
    {
      id: "cs_edu_1",
      school: "Đại học Hà Nội",
      degree: "Cử nhân",
      fieldOfStudy: "Ngôn ngữ học",
      location: "Hà Nội",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
    }
  ],
  skills: [
    { id: "cs_sk_1", category: "Dịch vụ khách hàng", skills: ["Active Listening", "Problem Solving", "Conflict Resolution", "Empathy & Patience", "Call Center Operations"] },
    { id: "cs_sk_2", category: "Hệ thống CRM", skills: ["Zendesk", "Salesforce", "Base CRM", "Microsoft Office"] }
  ],
  languages: [
    { id: "cs_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "cs_lang_2", name: "Tiếng Anh", proficiency: "Tốt (TOEIC 750)" }
  ],
  certifications: [],
  customSections: [],
};

// 11. Content Creator
export const ContentCreatorCV: CVData = {
  personalInfo: {
    name: "Phùng Tiến Đạt",
    title: "Nhà sáng tạo nội dung số (Content Creator)",
    email: "tiendat.creator@gmail.com",
    phone: "(+84) 935 444 333",
    location: "Quận 1, TP. Hồ Chí Minh",
    website: "tiktok.com/@tiendat_creator",
    github: "",
    linkedin: "linkedin.com/in/tiendat-creator",
    avatar: "/avatars/marketing.png",
  },
  summary: "Nhà sáng tạo nội dung số (Digital Content Creator) năng động với thế mạnh quay dựng video ngắn (Tiktok, Shorts, Reels). Đã xây dựng kênh TikTok cá nhân đạt hơn 200,000 lượt theo dõi nhờ các nội dung trải nghiệm ẩm thực, đời sống và xu hướng thời thượng.",
  workExperience: [
    {
      id: "cc_exp_1",
      company: "Công ty Truyền thông Sáng tạo BuzzMedia",
      position: "Content Creator / Video Producer",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-06",
      endDate: "Hiện tại",
      current: true,
      description: "• Chịu trách nhiệm sản xuất nội dung video ngắn từ viết kịch bản, quay phim đến hậu kỳ cắt ghép dựng cho các thương hiệu ẩm thực.\n• Xây dựng định hướng hình ảnh mới, tăng số lượng người theo dõi trên kênh YouTube thương hiệu từ 10k lên 80k sub chỉ trong 6 tháng.\n• Nắm bắt nhanh nhạy các trào lưu (trending) âm nhạc và hình ảnh của giới trẻ để lồng ghép khéo léo vào video quảng cáo sản phẩm.",
      techStack: ["CapCut", "Adobe Premiere Pro", "After Effects", "Photoshop", "TikTok Analytics"],
    }
  ],
  projects: [
    {
      id: "cc_pj_1",
      title: "Xây Dựng Kênh TikTok FoodReview",
      role: "Người thực hiện độc lập",
      description: "Kênh TikTok chuyên review đồ ăn vặt và hướng dẫn nấu nướng với tổng lượt thích đạt trên 3.5 triệu lượt.",
      link: "tiktok.com/@tiendat_food",
      techStack: ["Video Editing", "Content Strategy", "Social Media Branding"],
    }
  ],
  education: [
    {
      id: "cc_edu_1",
      school: "Đại học Sân khấu - Điện ảnh TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Đạo diễn điện ảnh / truyền hình",
      location: "TP.HCM",
      startDate: "2017-09",
      endDate: "2021-06",
      current: false,
    }
  ],
  skills: [
    { id: "cc_sk_1", category: "Sáng tạo nội dung", skills: ["Script Writing", "Video Shooting", "Video Editing", "Trend Spotting", "Community Management"] },
    { id: "cc_sk_2", category: "Công cụ dựng phim", skills: ["Premiere Pro", "CapCut Mobile / PC", "Photoshop", "Lightroom"] }
  ],
  languages: [
    { id: "cc_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "cc_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp Trung cấp" }
  ],
  certifications: [],
  customSections: [],
};

// 12. Photographer / Videographer
export const PhotographerCV: CVData = {
  personalInfo: {
    name: "Đặng Thế Long",
    title: "Nhiếp ảnh gia & Dựng phim chuyên nghiệp",
    email: "thelong.photo@gmail.com",
    phone: "(+84) 909 888 777",
    location: "Quận 3, TP. Hồ Chí Minh",
    website: "flickr.com/photos/thelong-photo",
    github: "",
    linkedin: "",
    avatar: "/avatars/designer.png",
  },
  summary: "Nhiếp ảnh gia và nhà dựng phim chuyên nghiệp (Photographer & Videographer) với hơn 5 năm kinh nghiệm làm việc tự do và tại studio. Chuyên chụp ảnh sự kiện doanh nghiệp, chụp ảnh sản phẩm quảng cáo và quay phim dựng phóng sự cưới với gu nghệ thuật độc đáo.",
  workExperience: [
    {
      id: "ph_exp_1",
      company: "Studio Ảnh cưới & Sự kiện LoveMoment",
      position: "Trưởng nhóm Quay phim - Chụp ảnh",
      location: "TP. Hồ Chí Minh",
      startDate: "2021-05",
      endDate: "Hiện tại",
      current: true,
      description: "• Chỉ đạo các buổi chụp ảnh sản phẩm cho các thương hiệu thời trang local brand.\n• Thực hiện quay phim và làm hậu kỳ chỉnh sửa màu sắc (Color Grading) cho các video giới thiệu dự án nội thất doanh nghiệp.\n• Quản lý và bảo quản toàn bộ trang thiết bị máy ảnh, máy quay phim, hệ thống đèn chiếu sáng chuyên dụng tại studio.",
      techStack: ["Sony Alpha Cameras", "Adobe Lightroom", "Photoshop", "DaVinci Resolve", "Color Grading"],
    }
  ],
  projects: [
    {
      id: "ph_pj_1",
      title: "Triển Lãm Ảnh Đời Thường CanThoLife",
      role: "Tác giả triển lãm độc lập",
      description: "Dự án ảnh tài liệu lưu trữ nhịp sống bình dị của người dân miền Tây sông nước được chọn trưng bày tại triển lãm văn hóa địa phương.",
      link: "",
      techStack: ["Street Photography", "Lightroom Classic", "Visual Storytelling"],
    }
  ],
  education: [
    {
      id: "ph_edu_1",
      school: "Đại học Mỹ thuật TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Hội họa & Mỹ thuật Đa phương tiện",
      location: "TP.HCM",
      startDate: "2015-09",
      endDate: "2019-06",
      current: false,
    }
  ],
  skills: [
    { id: "ph_sk_1", category: "Nhiếp ảnh & Quay phim", skills: ["Studio Lighting", "Product Photography", "Color Grading", "Video Composition", "Editing & Retouching"] },
    { id: "ph_sk_2", category: "Công cụ phần mềm", skills: ["Adobe Photoshop", "Adobe Lightroom Classic", "DaVinci Resolve Studio", "Premiere Pro"] }
  ],
  languages: [
    { id: "ph_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "ph_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp Cơ bản" }
  ],
  certifications: [],
  customSections: [],
};

// 13. Chef / Đầu bếp
export const ChefCV: CVData = {
  personalInfo: {
    name: "Trương Công Định",
    title: "Bếp trưởng điều hành (Executive Chef)",
    email: "congdinh.chef@gmail.com",
    phone: "(+84) 912 888 999",
    location: "Ninh Kiều, Cần Thơ",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/van_phong.png",
  },
  summary: "Bếp trưởng điều hành với hơn 7 năm kinh nghiệm làm việc tại các khách sạn và nhà hàng ẩm thực Âu-Á cao cấp. Có khả năng xây dựng thực đơn phong phú, kiểm soát định lượng chi phí nguyên vật liệu tối ưu và quản lý vận hành bếp chuyên nghiệp đảm bảo vệ sinh an toàn thực phẩm tuyệt đối.",
  workExperience: [
    {
      id: "cf_exp_1",
      company: "Khách sạn 4 sao Riverside Hotel & Resort",
      position: "Bếp trưởng (Chef de Cuisine)",
      location: "Cần Thơ",
      startDate: "2021-08",
      endDate: "Hiện tại",
      current: true,
      description: "• Chịu trách nhiệm lên thực đơn tự chọn hàng ngày và thực đơn tiệc cưới phục vụ tối đa 500 khách mời.\n• Quản lý trực tiếp đội ngũ nhân viên bếp gồm 12 người (bếp chính, phụ bếp, rửa chén), đào tạo tay nghề nấu nướng.\n• Giám sát quy trình bảo quản nguyên thực phẩm tươi sống, kiểm tra chất lượng vệ sinh định kỳ đạt chuẩn HACCP.",
      techStack: ["HACCP Standards", "Menu Engineering", "Kitchen Management", "Cost Control"],
    }
  ],
  projects: [
    {
      id: "cf_pj_1",
      title: "Thực Đơn Ẩm Thực Miền Tây Hiện Đại",
      role: "Bếp trưởng sáng tạo thực đơn",
      description: "Sáng tạo thực đơn fusion kết hợp ẩm thực truyền thống Nam Bộ với kỹ thuật nấu nướng kiểu Pháp hiện đại, được đánh giá cao bởi thực khách nước ngoài.",
      link: "",
      techStack: ["Menu Design", "Food Styling", "Local Ingredients"],
    }
  ],
  education: [
    {
      id: "cf_edu_1",
      school: "Trường Cao đẳng nghề Du lịch Cần Thơ",
      degree: "Cao đẳng nghề",
      fieldOfStudy: "Kỹ thuật Chế biến Món ăn",
      location: "Cần Thơ",
      startDate: "2013-09",
      endDate: "2016-06",
      current: false,
    }
  ],
  skills: [
    { id: "cf_sk_1", category: "Nghiệp vụ bếp", skills: ["Kitchen Management", "Menu Creation", "Western & Asian Cuisine", "HACCP Food Safety", "Food Cost Control"] },
    { id: "cf_sk_2", category: "Kỹ năng quản lý", skills: ["Staff Training", "Inventory Control", "Supplier Negotiation", "Leadership"] }
  ],
  languages: [
    { id: "cf_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "cf_lang_2", name: "Tiếng Anh", proficiency: "Giao tiếp Cơ bản trong công việc" }
  ],
  certifications: [
    { id: "cf_cert_1", name: "Chứng chỉ Vệ sinh An toàn Thực phẩm Quốc gia", issuer: "Bộ Y Tế", date: "2023-01" }
  ],
  customSections: [],
};

// 14. Tour Guide / Hướng dẫn viên du lịch
export const TourGuideCV: CVData = {
  personalInfo: {
    name: "Nguyễn Văn Hùng",
    title: "Hướng dẫn viên du lịch Quốc tế (English Tour Guide)",
    email: "vanhung.guide@gmail.com",
    phone: "(+84) 988 555 444",
    location: "Quận 1, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/vanhung-tourguide",
    avatar: "/avatars/sale_bds.png",
  },
  summary: "Hướng dẫn viên du lịch quốc tế năng động với thẻ hướng dẫn viên du lịch quốc tế do Tổng cục Du lịch cấp. Có hơn 4 năm kinh nghiệm dẫn các tour khách đoàn nói tiếng Anh du lịch khám phá văn hóa miền Tây và các danh lam thắng cảnh Việt Nam.",
  workExperience: [
    {
      id: "tg_exp_1",
      company: "Công ty Lữ hành Saigontourist Group",
      position: "Hướng dẫn viên Du lịch Quốc tế",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-03",
      endDate: "Hiện tại",
      current: true,
      description: "• Dẫn các tour khách nước ngoài (Châu Âu, Mỹ, Úc) tham quan TP.HCM, địa đạo Củ Chi và đồng bằng sông Cửu Long.\n• Thuyết minh kiến thức lịch sử, văn hóa, phong tục tập quán địa phương cho khách du lịch bằng tiếng Anh trôi chảy.\n• Đảm bảo sự an toàn tuyệt đối, điều phối dịch vụ ăn uống, khách sạn và phương tiện vận chuyển đúng lịch trình.",
      techStack: ["First Aid", "Public Speaking", "Tour Scheduling", "Customer Relations"],
    }
  ],
  projects: [
    {
      id: "tg_pj_1",
      title: "Chương trình Mekong Ecotour 2023",
      role: "Hướng dẫn viên trưởng đoàn",
      description: "Dẫn dắt đoàn khách 30 người từ Đức khám phá du lịch sinh thái miệt vườn Cần Thơ, Bến Tre trong 3 ngày 2 đêm an toàn và đạt phản hồi xuất sắc.",
      link: "",
      techStack: ["Cross-cultural Communication", "First Aid", "Crisis Management"],
    }
  ],
  education: [
    {
      id: "tg_edu_1",
      school: "Đại học Văn hóa TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Quản trị Dịch vụ Du lịch & Hướng dẫn Du lịch",
      location: "TP.HCM",
      startDate: "2017-09",
      endDate: "2021-06",
      current: false,
    }
  ],
  skills: [
    { id: "tg_sk_1", category: "Nghiệp vụ du lịch", skills: ["Tour Guiding License", "Public Speaking", "Historical & Cultural Knowledge", "First Aid & CPR", "Group Management"] },
    { id: "tg_sk_2", category: "Kỹ năng mềm", skills: ["Conflict Resolution", "Interpersonal Skills", "Problem Solving", "Time Management"] }
  ],
  languages: [
    { id: "tg_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "tg_lang_2", name: "Tiếng Anh", proficiency: "Lưu loát chuyên nghiệp (IELTS 7.0)" }
  ],
  certifications: [
    { id: "tg_cert_1", name: "Thẻ Hướng dẫn viên Du lịch Quốc tế", issuer: "Sở Du lịch TP.HCM", date: "2021-10" }
  ],
  customSections: [],
};

// 15. English Teacher
export const EnglishTeacherCV: CVData = {
  personalInfo: {
    name: "Trần Thị Lan Anh",
    title: "Giáo viên Tiếng Anh (IELTS 8.0 / TESOL)",
    email: "lananh.english@gmail.com",
    phone: "(+84) 902 111 333",
    location: "Cầu Giấy, Hà Nội",
    website: "",
    github: "",
    linkedin: "linkedin.com/in/lananh-ielts",
    avatar: "/avatars/giao_vien.png",
  },
  summary: "Giáo viên giảng dạy tiếng Anh giàu nhiệt huyết với hơn 4 năm kinh nghiệm luyện thi IELTS và tiếng Anh giao tiếp tại các trung tâm Anh ngữ uy tín hàng đầu. Sở hữu chứng chỉ IELTS 8.0 và chứng chỉ giảng dạy quốc tế TESOL. Có phương pháp sư phạm tương tác cao giúp học viên tự tin.",
  workExperience: [
    {
      id: "et_exp_1",
      company: "Anh ngữ Quốc tế Apollo English",
      position: "Giáo viên Luyện thi IELTS",
      location: "Hà Nội",
      startDate: "2022-05",
      endDate: "Hiện tại",
      current: true,
      description: "• Trực tiếp đứng lớp giảng dạy các khóa học IELTS mục tiêu 6.5+ cho học sinh cấp 3 và người đi làm.\n• Thiết kế giáo án bài giảng sáng tạo, tập trung cải thiện kỹ năng Viết (Writing) và Nói (Speaking) là thế yếu của học sinh Việt Nam.\n• Tổ chức kiểm tra năng lực định kỳ, đánh giá chi tiết và tư vấn lộ trình học tập cá nhân hóa cho từng học viên giúp 90% lớp học đạt mục tiêu.",
      techStack: ["IELTS Curriculum", "Active Learning", "Classroom Management", "Google Classroom"],
    }
  ],
  projects: [
    {
      id: "et_pj_1",
      title: "Bộ Giáo Trình Luyện Nói IELTS Speaking Master",
      role: "Tác giả biên soạn độc lập",
      description: "Biên soạn tài liệu tổng hợp 50 chủ đề Speaking thường gặp kèm bài mẫu và từ vựng nâng cao, hỗ trợ 300+ lượt tải về từ học viên.",
      link: "",
      techStack: ["Content Development", "IELTS Speaking Methods", "Graphic Design Basic"],
    }
  ],
  education: [
    {
      id: "et_edu_1",
      school: "Đại học Ngoại ngữ - Đại học Quốc gia Hà Nội",
      degree: "Cử nhân",
      fieldOfStudy: "Sư phạm Tiếng Anh",
      location: "Hà Nội",
      startDate: "2016-09",
      endDate: "2020-06",
      current: false,
      grade: "GPA: 3.55 / 4.0 (Tốt nghiệp xuất sắc)",
    }
  ],
  skills: [
    { id: "et_sk_1", category: "Kỹ năng sư phạm", skills: ["Lesson Planning", "IELTS Test Prep", "Interactive Teaching", "Student Evaluation", "Classroom Management"] },
    { id: "et_sk_2", category: "Nghiệp vụ giảng dạy", skills: ["English Linguistics", "IELTS 8.0", "TESOL Methodologies", "Online Teaching (Zoom/Teams)"] }
  ],
  languages: [
    { id: "et_lang_1", name: "Tiếng Việt", proficiency: "Bản xứ" },
    { id: "et_lang_2", name: "Tiếng Anh", proficiency: "Cận bản xứ (IELTS 8.0 / Listening 8.5 / Speaking 8.5)" }
  ],
  certifications: [
    { id: "et_cert_1", name: "IELTS Certificate (Overall Band 8.0)", issuer: "British Council", date: "2023-08" },
    { id: "et_cert_2", name: "TESOL (Teaching English to Speakers of Other Languages)", issuer: "Madison School of Professional Development", date: "2021-03" }
  ],
  customSections: [],
};
