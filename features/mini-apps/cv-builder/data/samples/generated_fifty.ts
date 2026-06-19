import { CVData } from "../../types/cv";

function createSampleCV(
  title: string,
  summary: string,
  skills: { category: string; list: string[] }[],
  experience: { company: string; position: string; date: string; desc: string; tech: string[] }[],
  education: { school: string; degree: string; date: string }[],
  avatar: string = ""
): CVData {
  const isIT = title.toLowerCase().includes("engineer") || title.toLowerCase().includes("developer") || title.toLowerCase().includes("qa") || title.toLowerCase().includes("ai") || title.toLowerCase().includes("blockchain") || title.toLowerCase().includes("embedded") || title.toLowerCase().includes("cybersecurity") || title.toLowerCase().includes("dispatcher");
  const isDesign = title.toLowerCase().includes("designer") || title.toLowerCase().includes("artist") || title.toLowerCase().includes("editor") || title.toLowerCase().includes("writer") || title.toLowerCase().includes("creator") || title.toLowerCase().includes("makeup");

  return {
    personalInfo: {
      name: "Nguyễn Văn Nam",
      title,
      email: "nam.nguyen.fe@gmail.com",
      phone: "(+84) 912 345 678",
      location: "Quận 1, TP. Hồ Chí Minh",
      website: "https://namnguyen.dev",
      github: isIT ? "github.com/namnguyen-fe" : (isDesign ? "behance.net/namnguyen" : ""),
      linkedin: isIT || isDesign ? "linkedin.com/in/namnguyen-frontend" : "facebook.com/namnguyen.fb",
      avatar,
    },
    summary,
    workExperience: experience.map((exp, idx) => ({
      id: `exp-${idx}`,
      company: exp.company,
      position: exp.position,
      location: "TP. Hồ Chí Minh",
      startDate: exp.date.split(" - ")[0] || "",
      endDate: exp.date.split(" - ")[1] || "",
      current: exp.date.includes("Hiện tại"),
      description: exp.desc,
      techStack: exp.tech,
    })),
    projects: [
      {
        id: "proj-1",
        title: "Dự án phát triển hệ thống ngành " + title,
        role: title,
        description: "Xây dựng quy trình nghiệp vụ chuyên nghiệp, giúp tối ưu hóa hiệu suất và nâng cao trải nghiệm khách hàng.",
        link: isIT ? "github.com/namnguyen-fe/project" : (isDesign ? "behance.net/namnguyen/project" : ""),
        techStack: experience[0]?.tech || [],
      }
    ],
    education: education.map((edu, idx) => ({
      id: `edu-${idx}`,
      school: edu.school,
      degree: edu.degree,
      fieldOfStudy: title,
      location: "TP. Hồ Chí Minh",
      startDate: edu.date.split(" - ")[0] || "",
      endDate: edu.date.split(" - ")[1] || "",
      current: false,
    })),
    skills: skills.map((sk, idx) => ({
      id: `skill-${idx}`,
      category: sk.category,
      skills: sk.list,
    })),
    languages: [
      { id: "lang-1", name: "Tiếng Việt", proficiency: "Bản xứ" },
      { id: "lang-2", name: "Tiếng Anh", proficiency: "Giao tiếp trôi chảy" }
    ],
    certifications: [
      { id: "cert-1", name: "Chứng nhận Hành nghề chuyên sâu " + title, issuer: "Hiệp hội Ngành nghề Việt Nam", date: "2024" }
    ],
    customSections: [],
  };
}

// 1. Nha khoa (3 CVs)
export const BacSiNhaKhoaCV = createSampleCV(
  "Bác sĩ Nha khoa (Dentist)",
  "Bác sĩ Răng Hàm Mặt với 5 năm kinh nghiệm điều trị thẩm mỹ, cấy ghép Implant và nha khoa tổng quát. Cam kết đem lại trải nghiệm nhẹ nhàng, an toàn và nụ cười tự tin cho khách hàng.",
  [
    { category: "Nghiệp vụ Chuyên môn", list: ["Cấy ghép Implant", "Chỉnh nha niềng răng", "Phục hình răng sứ", "Nha khoa trẻ em"] },
    { category: "Công cụ & Thiết bị", list: ["Máy quét 3D Cone Beam CT", "Hệ thống CAD/CAM", "Laser nha khoa"] }
  ],
  [
    { company: "Nha khoa Quốc tế Hoàn Mỹ", position: "Bác sĩ Nha khoa chính", date: "2021 - Hiện tại", desc: "Thực hiện thành công hơn 1000 ca cấy ghép Implant và bọc răng sứ thẩm mỹ. Tư vấn liệu trình chăm sóc răng miệng toàn diện.", tech: ["Implant", "CAD/CAM", "ConeBeam"] }
  ],
  [{ school: "Đại học Y Dược TP.HCM", degree: "Bác sĩ Răng Hàm Mặt", date: "2014 - 2020" }],
  "/avatars/bac_si.png"
);

export const KyThuatVienPhucHinhRangCV = createSampleCV(
  "Kỹ thuật viên Phục hình răng",
  "Kỹ thuật viên Labo nha khoa chuyên sâu về phục hình răng sứ thẩm mỹ, thiết kế CAD/CAM răng giả với độ chính xác cao và sắc nét tự nhiên.",
  [
    { category: "Kỹ năng chuyên môn", list: ["Thiết kế CAD/CAM Labo", "Đắp sứ thẩm mỹ", "Đúc kim loại nha khoa", "Mài chỉnh khớp cắn"] }
  ],
  [
    { company: "Labo Nha khoa Á Âu", position: "Kỹ thuật viên CAD/CAM chính", date: "2022 - Hiện tại", desc: "Thiết kế phục hình sườn sứ Zirconia, Cercon. Đảm bảo độ khít sát khớp cắn tối đa dưới 50 micron.", tech: ["3Shape CAD", "Exocad", "Roland Milling Machine"] }
  ],
  [{ school: "Cao đẳng Y tế Trung ương", degree: "Cử nhân Kỹ thuật Phục hình răng", date: "2018 - 2021" }],
  "/avatars/ky_su.png"
);

export const PhuTaNhaKhoaCV = createSampleCV(
  "Phụ tá Nha khoa (Dental Assistant)",
  "Phụ tá nha khoa tận tâm, chu đáo, có kinh nghiệm hỗ trợ bác sĩ điều trị trong các ca phẫu thuật phức tạp và quản lý phòng vô trùng theo chuẩn Bộ Y tế.",
  [
    { category: "Nghiệp vụ phụ tá", list: ["Chuẩn bị vô trùng dụng cụ", "Trợ thủ ghế nha bốn tay", "Chụp phim X-quang răng", "Chăm sóc bệnh nhân sau điều trị"] }
  ],
  [
    { company: "Nha khoa Sài Gòn Smile", position: "Trợ thủ nha khoa", date: "2023 - Hiện tại", desc: "Hỗ trợ bác sĩ trong phòng cấy ghép vô trùng. Tiếp đón và hướng dẫn bệnh nhân thực hiện thủ tục.", tech: ["Autoclave", "X-ray", "Sterilization"] }
  ],
  [{ school: "Trung cấp Y Dược TPHCM", degree: "Chứng chỉ Điều dưỡng Nha khoa", date: "2021 - 2022" }],
  "/avatars/y_ta.png"
);

// 2. Y tế thẩm mỹ & Dược lâm sàng (3 CVs)
export const BacSiThamMyCV = createSampleCV(
  "Bác sĩ Da liễu Thẩm mỹ",
  "Bác sĩ chuyên khoa Da liễu với chuyên môn sâu về laser thẩm mỹ, trẻ hóa da, tiêm Botox/Filler điều trị và chăm sóc da công nghệ cao.",
  [{ category: "Nghiệp vụ", list: ["Laser CO2 Fractional", "Tiêm Filler/Botox", "Peel da hóa học", "Trị liệu Mesotherapy"] }],
  [{ company: "Viện thẩm mỹ Lavender", position: "Bác sĩ Da liễu chính", date: "2022 - Hiện tại", desc: "Trực tiếp thực hiện các liệu trình trẻ hóa da, điều trị sẹo rỗ và sắc tố da bằng laser cho hơn 500 khách hàng.", tech: ["Laser", "Botox", "Filler", "Thermage"] }],
  [{ school: "Đại học Y khoa Phạm Ngọc Thạch", degree: "Bác sĩ Chuyên khoa Da liễu", date: "2015 - 2021" }],
  "/avatars/bac_si.png"
);

export const DuocSiLamSangCV = createSampleCV(
  "Dược sĩ Lâm sàng",
  "Dược sĩ chuyên sâu về dược lâm sàng, tư vấn sử dụng thuốc an toàn hợp lý, giảm thiểu tương tác thuốc tại bệnh viện đa khoa.",
  [{ category: "Chuyên môn Dược", list: ["Dược lâm sàng", "Thông tin thuốc", "Cảnh giác dược", "Quản lý tồn kho thuốc"] }],
  [{ company: "Bệnh viện Đa khoa Tâm Anh", position: "Dược sĩ Lâm sàng", date: "2020 - Hiện tại", desc: "Duyệt đơn thuốc điều trị nội trú, tư vấn phối hợp thuốc tối ưu cho đội ngũ bác sĩ điều trị.", tech: ["Drug Interaction Software", "Hospital HIS System"] }],
  [{ school: "Đại học Y Dược Hà Nội", degree: "Dược sĩ Đại học", date: "2015 - 2020" }],
  "/avatars/duoc_si.png"
);

export const DieuDuongTruongCV = createSampleCV(
  "Điều dưỡng Trưởng khoa",
  "Điều dưỡng trưởng giàu kinh nghiệm quản lý nhân sự điều dưỡng, thiết lập quy trình chăm sóc bệnh nhân chuẩn và kiểm soát nhiễm khuẩn.",
  [{ category: "Quản lý & Chuyên môn", list: ["Quản lý ca trực", "Đào tạo điều dưỡng trẻ", "Kiểm soát nhiễm khuẩn", "Sơ cấp cứu nâng cao"] }],
  [{ company: "Bệnh viện Quốc tế Vinmec", position: "Điều dưỡng trưởng khoa Ngoại", date: "2019 - Hiện tại", desc: "Điều hành đội ngũ 25 điều dưỡng, quản lý trang thiết bị y tế khoa Ngoại, đảm bảo sự hài lòng của bệnh nhân nội trú.", tech: ["Nursing Care Plans", "Patient Monitoring"] }],
  [{ school: "Đại học Y Hà Nội", degree: "Cử nhân Điều dưỡng", date: "2010 - 2014" }],
  "/avatars/y_ta.png"
);

// 3. Công nghệ thông tin chuyên sâu (8 CVs)
export const AIEngineerCV = createSampleCV(
  "Kỹ sư Trí tuệ Nhân tạo (AI Engineer)",
  "Kỹ sư Machine Learning và Deep Learning đam mê nghiên cứu và triển khai các mô hình Computer Vision, NLP và Generative AI ứng dụng thực tế.",
  [{ category: "Trí tuệ nhân tạo", list: ["PyTorch", "TensorFlow", "OpenCV", "LLMs (OpenAI, HuggingFace)", "LangChain"] }],
  [{ company: "FPT Software AI Center", position: "AI Engineer", date: "2022 - Hiện tại", desc: "Xây dựng giải pháp nhận diện khuôn mặt và trích xuất dữ liệu thông tin hóa đơn tự động bằng AI.", tech: ["Python", "PyTorch", "FastAPI", "Docker", "AWS"] }],
  [{ school: "Đại học Bách Khoa TPHCM", degree: "Kỹ sư Khoa học Máy tính", date: "2018 - 2022" }],
  "/avatars/dev.png"
);

export const BlockchainDeveloperCV = createSampleCV(
  "Lập trình viên Blockchain",
  "Lập trình viên Blockchain chuyên nghiệp với kinh nghiệm viết Smart Contract bằng Solidity, xây dựng DApps và tích hợp Web3 trên Ethereum và BSC.",
  [{ category: "Blockchain Stack", list: ["Solidity", "Hardhat", "Ethers.js", "Web3.js", "Smart Contracts", "Rust"] }],
  [{ company: "Kyber Network", position: "Blockchain Developer", date: "2022 - Hiện tại", desc: "Phát triển và kiểm thử các hợp đồng thông minh cho sàn giao dịch phi tập trung. Tối ưu hóa phí Gas.", tech: ["Solidity", "Ethers.js", "Ethereum", "Node.js"] }],
  [{ school: "Đại học Công nghệ thông tin - ĐHQG TPHCM", degree: "Cử nhân Kỹ thuật phần mềm", date: "2018 - 2022" }],
  "/avatars/dev.png"
);

export const GameDeveloperCV = createSampleCV(
  "Lập trình viên Game (Unity)",
  "Lập trình viên phát triển game Unity 2D/3D dày dạn kinh nghiệm, tối ưu hóa game loop, đồ họa và tích hợp SDK quảng cáo/in-app purchase.",
  [{ category: "Game Dev", list: ["Unity Engine", "C# Programming", "Physics Engine", "Shader Graph", "Game Optimization"] }],
  [{ company: "VNG Corporation", position: "Unity Game Developer", date: "2021 - Hiện tại", desc: "Phát triển game mobile thể loại RPG đạt hơn 1 triệu lượt tải. Tối ưu hóa hiệu năng render trên các thiết bị cấu hình thấp.", tech: ["Unity", "C#", "Git", "Google Play SDK"] }],
  [{ school: "Đại học Bách Khoa Hà Nội", degree: "Cử nhân Công nghệ thông tin", date: "2017 - 2021" }],
  "/avatars/dev.png"
);

export const CybersecuritySpecialistCV = createSampleCV(
  "Chuyên gia Bảo mật thông tin (Cybersecurity)",
  "Chuyên gia bảo mật mạng và kiểm thử xâm nhập (Pentest) giàu kinh nghiệm dò quét lỗ hổng ứng dụng web và thiết lập tường lửa hệ thống doanh nghiệp.",
  [{ category: "An toàn thông tin", list: ["Penetration Testing", "OWASP Top 10", "Wireshark", "Metasploit", "Kali Linux", "Firewalls"] }],
  [{ company: "Tập đoàn công nghệ Viettel", position: "Security Analyst", date: "2021 - Hiện tại", desc: "Thực hiện pentest định kỳ hệ thống core banking, phát hiện và đề xuất khắc phục hơn 50 lỗ hổng nghiêm trọng.", tech: ["Kali Linux", "Python", "Nmap", "Burp Suite"] }],
  [{ school: "Học viện Công nghệ Bưu chính Viễn thông", degree: "Kỹ sư An toàn thông tin", date: "2017 - 2021" }],
  "/avatars/dev.png"
);

export const CloudArchitectCV = createSampleCV(
  "Kiến trúc sư giải pháp Cloud (AWS/Azure)",
  "Chuyên gia Cloud với 6 năm thiết kế hệ thống phân tán, có tính sẵn sàng cao, bảo mật và khả năng mở rộng tự động trên nền tảng AWS và GCP.",
  [{ category: "Cloud & DevOps", list: ["AWS Services", "Terraform (IaC)", "Kubernetes", "CI/CD Pipelines", "Docker"] }],
  [{ company: "VNG Cloud", position: "Cloud Solutions Architect", date: "2021 - Hiện tại", desc: "Thiết kế hạ tầng microservices trên EKS. Di chuyển thành công hệ thống dữ liệu cũ của doanh nghiệp lên Cloud AWS giúp tiết kiệm 30% chi phí vận hành.", tech: ["AWS", "Terraform", "Kubernetes", "EKS"] }],
  [{ school: "Đại học Khoa học Tự nhiên TPHCM", degree: "Cử nhân Công nghệ thông tin", date: "2014 - 2018" }],
  "/avatars/dev.png"
);

export const DataEngineerCV = createSampleCV(
  "Kỹ sư Dữ liệu (Data Engineer)",
  "Kỹ sư xây dựng và tối ưu hóa hệ thống ETL/ELT pipelines quy mô dữ liệu lớn (Big Data). Thành thạo Apache Spark, Airflow và kho dữ liệu đám mây.",
  [{ category: "Data Stack", list: ["Apache Spark", "Apache Airflow", "Hadoop", "SQL & NoSQL", "Kafka", "Data Warehousing"] }],
  [{ company: "Momo (M-Service)", position: "Data Engineer", date: "2022 - Hiện tại", desc: "Xây dựng các luồng dữ liệu thời gian thực (Real-time data pipelines) phục vụ phân tích hành vi người dùng bằng Apache Spark.", tech: ["Python", "Spark", "Airflow", "Kafka", "PostgreSQL"] }],
  [{ school: "Đại học Bách khoa Hà Nội", degree: "Kỹ sư Khoa học dữ liệu", date: "2018 - 2022" }],
  "/avatars/dev.png"
);

export const EmbeddedDeveloperCV = createSampleCV(
  "Lập trình viên Nhúng (Embedded C/C++)",
  "Lập trình viên nhúng chuyên sâu về lập trình vi điều khiển ARM, thiết kế driver ngoại vi, tối ưu hóa bộ nhớ và thiết kế RTOS.",
  [{ category: "Embedded Systems", list: ["C/C++", "ARM Cortex-M", "I2C/SPI/UART", "FreeRTOS", "Firmware Debugging"] }],
  [{ company: "FPT Advanasia", position: "Embedded Software Engineer", date: "2021 - Hiện tại", desc: "Phát triển firmware cho các thiết bị Smart Home IoT. Thiết kế giao tiếp kết nối Bluetooth Low Energy (BLE).", tech: ["C++", "FreeRTOS", "STM32", "BLE"] }],
  [{ school: "Đại học Bách Khoa TPHCM", degree: "Kỹ sư Điện tử Viễn thông", date: "2017 - 2021" }],
  "/avatars/ky_su.png"
);

export const AutomationQACV = createSampleCV(
  "Kỹ sư Kiểm thử Tự động (Automation QA)",
  "Kỹ sư QA chuyên viết test scripts tự động cho Web/Mobile API. Thành thạo Selenium, Playwright và tích hợp quy trình CI/CD.",
  [{ category: "Kiểm thử tự động", list: ["Selenium Webdriver", "Playwright", "Cypress", "Postman", "CI/CD Integration"] }],
  [{ company: "KMS Technology", position: "Automation Test Engineer", date: "2022 - Hiện tại", desc: "Xây dựng framework kiểm thử tự động từ đầu bằng Playwright & TypeScript, giảm 70% thời gian regression test.", tech: ["TypeScript", "Playwright", "GitLab CI", "Postman"] }],
  [{ school: "Đại học Sư phạm Kỹ thuật TPHCM", degree: "Cử nhân CNTT", date: "2018 - 2022" }],
  "/avatars/dev.png"
);

// 4. Marketing & Truyền thông (6 CVs)
export const BrandManagerCV = createSampleCV(
  "Quản lý Thương hiệu (Brand Manager)",
  "Chuyên gia định vị thương hiệu với 7 năm kinh nghiệm quản trị chiến dịch truyền thông đa kênh, nghiên cứu thị trường và nâng cao nhận diện thương hiệu tiêu dùng nhanh (FMCG).",
  [{ category: "Quản trị thương hiệu", list: ["Brand Positioning", "Market Research", "Budget Management", "KOLs Campaign", "Product Launch"] }],
  [{ company: "Unilever Việt Nam", position: "Assistant Brand Manager", date: "2020 - Hiện tại", desc: "Chịu trách nhiệm ra mắt dòng sản phẩm chăm sóc tóc mới, đạt 120% KPI doanh số trong 6 tháng đầu tiên.", tech: ["Excel", "PowerPoint", "Google Analytics"] }],
  [{ school: "Đại học Ngoại thương Hà Nội", degree: "Cử nhân Quản trị Kinh doanh", date: "2013 - 2017" }],
  "/avatars/business_woman.png"
);

export const SEOSpecialistCV = createSampleCV(
  "Chuyên viên SEO",
  "Chuyên viên SEO giàu kinh nghiệm đưa từ khóa khó lên Top Google, tối ưu Onpage/Offpage và xây dựng chiến lược nội dung gia tăng organic traffic.",
  [{ category: "SEO Tools & Skills", list: ["Google Search Console", "Ahrefs", "Screaming Frog", "Technical SEO", "Link Building"] }],
  [{ company: "VNG Digital Marketing Agency", position: "Senior SEO Specialist", date: "2022 - Hiện tại", desc: "Tăng trưởng 150% lượng truy cập tự nhiên (Organic Traffic) cho website thương mại điện tử lớn trong 9 tháng.", tech: ["Ahrefs", "Google Analytics", "WordPress", "SEMrush"] }],
  [{ school: "Đại học Kinh tế Quốc dân", degree: "Cử nhân Marketing", date: "2018 - 2022" }],
  "/avatars/van_phong.png"
);

export const PRSpecialistCV = createSampleCV(
  "Chuyên viên Quan hệ công chúng (PR)",
  "Chuyên gia PR với mạng lưới quan hệ báo chí rộng khắp, có kinh nghiệm quản lý khủng hoảng truyền thông và tổ chức họp báo thương hiệu.",
  [{ category: "PR & Truyền thông", list: ["Press Release Writing", "Crisis Management", "Media Relations", "Event Management"] }],
  [{ company: "Tập đoàn VinGroup", position: "PR Specialist", date: "2021 - Hiện tại", desc: "Xây dựng các bài thông cáo báo chí, tổ chức thành công hơn 10 sự kiện họp báo ra mắt sản phẩm xe điện mới.", tech: ["Media Relations", "Crisis Management", "Copywriting"] }],
  [{ school: "Học viện Báo chí và Tuyên truyền", degree: "Cử nhân Quan hệ công chúng", date: "2016 - 2020" }],
  "/avatars/business_woman.png"
);

export const SocialMediaManagerCV = createSampleCV(
  "Quản lý Mạng xã hội (Social Media)",
  "Chuyên viên truyền thông mạng xã hội, nhạy bén xu hướng (trends), xây dựng kế hoạch nội dung viral trên Facebook, TikTok, Instagram thu hút hàng triệu lượt xem.",
  [{ category: "Social Media Stack", list: ["TikTok SEO", "Facebook Creator Studio", "Canva Design", "Video Scripting", "Community Building"] }],
  [{ company: "Schannel Network", position: "Social Media Manager", date: "2022 - Hiện tại", desc: "Định hướng nội dung và quản lý kênh TikTok đạt mốc 500k followers sau 1 năm hoạt động.", tech: ["CapCut", "TikTok Analytics", "Canva", "Photoshop"] }],
  [{ school: "Đại học Văn Lang", degree: "Cử nhân Truyền thông đa phương tiện", date: "2018 - 2022" }],
  "/avatars/designer.png"
);

export const CopywriterCV = createSampleCV(
  "Creative Copywriter",
  "Người viết quảng cáo sáng tạo chuyên lên ý tưởng kịch bản TVC, bài viết bán hàng (landing page) và tagline tạo dấu ấn mạnh mẽ cho các chiến dịch quảng cáo.",
  [{ category: "Creative Copywriting", list: ["Storyboarding", "Ad Copywriting", "Content Strategy", "SEO Writing", "Creative Thinking"] }],
  [{ company: "Dentsu Redder Agency", position: "Copywriter", date: "2021 - Hiện tại", desc: "Sáng tạo nội dung kịch bản cho chiến dịch Tết đạt giải thưởng truyền thông quốc gia.", tech: ["MindMapping", "Google Docs", "Keynote"] }],
  [{ school: "Đại học KHXH&NV TPHCM", degree: "Cử nhân Văn học & Báo chí", date: "2017 - 2021" }],
  "/avatars/designer.png"
);

export const PharmaMarketerCV = createSampleCV(
  "Chuyên viên Marketing Dược phẩm",
  "Dược sĩ chuyển hướng marketing, am hiểu luật quảng cáo dược, phối hợp kênh ETC/OTC để thúc đẩy doanh số và phát triển sản phẩm thuốc mới.",
  [{ category: "Pharma Marketing", list: ["ETC/OTC Strategy", "Pharma Regulation", "KOLs Doctor Engagement", "Scientific Writing"] }],
  [{ company: "Dược Hậu Giang (DHG)", position: "Product Specialist", date: "2021 - Hiện tại", desc: "Xây dựng tài liệu khoa học giới thiệu thuốc mới cho khối bác sĩ bệnh viện. Tổ chức hội thảo dược khoa.", tech: ["Pharma Regulations", "Scientific Presentations"] }],
  [{ school: "Đại học Y Dược Cần Thơ", degree: "Dược sĩ Đại học", date: "2016 - 2021" }],
  "/avatars/duoc_si.png"
);

// 5. Spa & Thẩm mỹ & Dịch vụ (5 CVs)
export const SpaTherapistCV = createSampleCV(
  "Chuyên viên Kỹ thuật Spa/Massage",
  "Kỹ thuật viên Spa chuyên nghiệp với kiến thức sâu về chăm sóc da mặt, liệu trình mát-xa toàn thân trị liệu Đông y và chăm sóc khách hàng chu đáo.",
  [{ category: "Nghiệp vụ Spa", list: ["Massage Thụy Điển/Đá nóng", "Massage ấn huyệt Đông y", "Vận hành máy chăm sóc da laser/Hifu", "Tư vấn mỹ phẩm dưỡng da"] }],
  [{ company: "Sài Gòn Đẹp Clinic & Spa", position: "Kỹ thuật viên Spa chính", date: "2022 - Hiện tại", desc: "Trực tiếp thực hiện trị liệu chăm sóc da cho khách VIP. Đảm bảo phòng trị liệu vô trùng sạch sẽ.", tech: ["Skin Analyzers", "Hifu Machines", "Laser Equipment"] }],
  [{ school: "Trường Thẩm mỹ Quốc tế Á Âu", degree: "Chứng chỉ Kỹ thuật viên Spa chuyên nghiệp", date: "2021" }],
  "/avatars/marketing.png"
);

export const MakeupArtistCV = createSampleCV(
  "Chuyên gia Trang điểm (Makeup Artist)",
  "Chuyên gia trang điểm cô dâu, sự kiện và chụp hình lookbook thời trang. Am hiểu các phong cách trang điểm đa dạng từ cổ điển đến xu hướng Hàn Quốc.",
  [{ category: "Makeup Skills", list: ["Trang điểm cô dâu chuyên sâu", "Trang điểm chụp ảnh studio", "Tạo mẫu tóc sự kiện", "Tư vấn tone màu da"] }],
  [{ company: "Kim Wedding Studio", position: "Makeup Artist chính", date: "2021 - Hiện tại", desc: "Trực tiếp trang điểm cho hơn 300 cô dâu trong các mùa cưới, đạt tỷ lệ hài lòng và giới thiệu lại 98%.", tech: ["Cosmetic Tools", "Hair Styling Devices"] }],
  [{ school: "Học viện Trang điểm Juhee", degree: "Chứng chỉ Trang điểm chuyên nghiệp", date: "2020" }],
  "/avatars/designer.png"
);

export const BeautyConsultantCV = createSampleCV(
  "Chuyên viên Tư vấn Thẩm mỹ",
  "Chuyên viên tư vấn làm đẹp tại clinic thẩm mỹ, có kỹ năng giao tiếp thuyết phục cao, tư vấn liệu trình da liễu/phẫu thuật thẩm mỹ và chốt sales.",
  [{ category: "Kỹ năng tư vấn", list: ["Tư vấn liệu trình thẩm mỹ", "Giải quyết khiếu nại khách hàng", "Kỹ năng thuyết phục khách hàng", "Chăm sóc khách hàng sau phẫu"] }],
  [{ company: "Thẩm mỹ viện Kangnam", position: "Chuyên viên tư vấn thẩm mỹ", date: "2022 - Hiện tại", desc: "Tư vấn và chốt liệu trình phẫu thuật thẩm mỹ thành công, đạt doanh thu cá nhân hơn 500 triệu đồng/tháng.", tech: ["CRM Softwares", "Skin Analyzers"] }],
  [{ school: "Đại học Mở TPHCM", degree: "Cử nhân Quản trị Kinh doanh", date: "2018 - 2022" }],
  "/avatars/business_woman.png"
);

export const FitnessTrainerCV = createSampleCV(
  "Huấn luyện viên Thể hình (PT)",
  "Huấn luyện viên Gym chuyên nghiệp có bằng chứng nhận NASM, chuyên thiết lập thực đơn dinh dưỡng và giáo án tập luyện giảm mỡ/tăng cơ.",
  [{ category: "Kỹ năng HLV", list: ["Thiết lập giáo án tập luyện", "Thiết kế chế độ ăn Macro", "Sơ cấp cứu chấn thương thể thao", "Tư vấn thực phẩm bổ sung (Supplements)"] }],
  [{ company: "California Fitness & Yoga", position: "Personal Trainer (PT)", date: "2021 - Hiện tại", desc: "Hướng dẫn tập luyện 1-1 cho hơn 40 học viên, giúp 90% học viên đạt mục tiêu thể hình mong muốn sau 3 tháng.", tech: ["InBody Analysis", "Fitness Trackers"] }],
  [{ school: "Liên đoàn Thể hình Việt Nam", degree: "Chứng chỉ HLV Thể hình cấp quốc gia", date: "2020" }],
  "/avatars/ky_su.png"
);

export const ChefCV = createSampleCV(
  "Đầu bếp Trưởng (Head Chef)",
  "Bếp trưởng bếp Á/Âu với 8 năm đứng bếp tại khách sạn 4 sao. Có kinh nghiệm xây dựng thực đơn tối ưu chi phí nguyên liệu và quản lý vệ sinh ATTP.",
  [{ category: "Nghiệp vụ bếp", list: ["Quản lý bếp & nhân sự", "Thiết kế thực đơn tiệc", "Tính toán Costing món ăn", "Kiểm soát vệ sinh ATTP"] }],
  [{ company: "Khách sạn Liberty Central", position: "Bếp trưởng bếp Á", date: "2020 - Hiện tại", desc: "Điều hành đội ngũ bếp 15 người. Thiết kế thực đơn buffet tối mới, tăng 25% lượng khách hàng dùng bữa.", tech: ["Industrial Kitchen Tools", "Food Costing Calculators"] }],
  [{ school: "Trường Trung cấp Du lịch & Khách sạn Saigontourist", degree: "Cử nhân Kỹ thuật chế biến món ăn", date: "2012 - 2014" }],
  "/avatars/van_phong.png"
);

// 6. Thiết kế & Sáng tạo (4 CVs)
export const InteriorDesignerCV = createSampleCV(
  "Nhà thiết kế Nội thất (Interior Designer)",
  "Kiến trúc sư nội thất chuyên sâu về thiết kế căn hộ, văn phòng hiện đại. Thành thạo dựng phối cảnh 3D Max, SketchUp và chọn vật liệu thực tế.",
  [{ category: "Interior Stack", list: ["Autocad", "3ds Max (Vray/Corona)", "SketchUp", "Photoshop", "Vật liệu nội thất"] }],
  [{ company: "Công ty Thiết kế nội thất Sun House", position: "Interior Designer chính", date: "2021 - Hiện tại", desc: "Dựng phối cảnh 3D và giám sát thi công hoàn thiện nội thất cho hơn 30 căn hộ chung cư cao cấp.", tech: ["3ds Max", "Autocad", "SketchUp"] }],
  [{ school: "Đại học Kiến trúc TPHCM", degree: "Kử nhân Thiết kế Nội thất", date: "2016 - 2021" }],
  "/avatars/designer.png"
);

export const FashionDesignerCV = createSampleCV(
  "Nhà thiết kế Thời trang",
  "Nhà thiết kế thời trang sáng tạo, chuyên thiết kế rập, chọn chất liệu vải và phát triển các bộ sưu tập thời trang ứng dụng (Ready-to-wear).",
  [{ category: "Thời trang", list: ["Vẽ phác thảo thời trang", "Thiết kế rập tay & máy", "Chọn chất liệu vải", "Styling lookbook"] }],
  [{ company: "YODY Fashion", position: "Fashion Designer", date: "2022 - Hiện tại", desc: "Thiết kế dòng sản phẩm áo khoác đông mới, bán ra hơn 50.000 sản phẩm trong tuần đầu tiên ra mắt.", tech: ["Adobe Illustrator", "Garment CAD"] }],
  [{ school: "Đại học Mỹ thuật Công nghiệp Hà Nội", degree: "Cử nhân Thiết kế Thời trang", date: "2018 - 2022" }],
  "/avatars/designer.png"
);

export const VideoEditorCV = createSampleCV(
  "Biên tập viên Video (Video Editor)",
  "Video Editor chuyên nghiệp, thành thạo dựng phim quảng cáo, chỉnh màu Davinci Resolve và làm hiệu ứng motion graphics cho mạng xã hội.",
  [{ category: "Video Editing Stack", list: ["Adobe Premiere Pro", "After Effects", "Davinci Resolve", "Color Grading", "Sound Design"] }],
  [{ company: "Điền Quân Media & Entertainment", position: "Video Editor", date: "2022 - Hiện tại", desc: "Chịu trách nhiệm hậu kỳ chính cho các chương trình truyền hình thực tế đạt lượng rating cao.", tech: ["Premiere", "AfterEffects", "Davinci"] }],
  [{ school: "Đại học Sân khấu Điện ảnh TPHCM", degree: "Cử nhân Đạo diễn & Hậu kỳ", date: "2018 - 2022" }],
  "/avatars/designer.png"
);

export const Graphic3DDesignerCV = createSampleCV(
  "Nhà thiết kế Đồ họa 3D (3D Artist)",
  "Họa sĩ 3D chuyên dựng model nhân vật, vẽ texture và tạo chuyển động cho game/phim hoạt hình. Thành thạo Blender, ZBrush và Substance Painter.",
  [{ category: "3D Stack", list: ["Blender", "ZBrush", "Substance Painter", "Maya", "3D Character Modeling"] }],
  [{ company: "Glass Egg Digital Media", position: "3D Modeler", date: "2021 - Hiện tại", desc: "Dựng model phương tiện 3D cho các dự án game AAA quốc tế nổi tiếng.", tech: ["Blender", "ZBrush", "SubstancePainter"] }],
  [{ school: "Học viện Kỹ thuật Đồ họa Arena Multimedia", degree: "Chứng chỉ Mỹ thuật Đa phương tiện chuyên sâu", date: "2019 - 2021" }],
  "/avatars/designer.png"
);

// 7. Du lịch & Hàng không & Khách sạn (4 CVs)
export const HotelManagerCV = createSampleCV(
  "Quản lý Khách sạn (Hotel Manager)",
  "Quản lý khách sạn 4 sao với 10 năm kinh nghiệm điều hành dịch vụ lưu trú, quản lý chi phí vận hành và tối ưu hóa trải nghiệm khách lưu trú.",
  [{ category: "Hotel Management", list: ["Hotel Operations", "Guest Relations", "Staff Training", "OTA & Revenue Management"] }],
  [{ company: "Khách sạn Rex Sài Gòn", position: "General Manager", date: "2019 - Hiện tại", desc: "Đạt mục tiêu tăng 15% công suất buồng phòng trung bình năm bằng việc đa dạng hóa kênh đặt phòng trực tuyến.", tech: ["Smile PMS System", "Microsoft Office"] }],
  [{ school: "Đại học Kinh tế TPHCM", degree: "Cử nhân Quản trị Du lịch & Khách sạn", date: "2009 - 2013" }],
  "/avatars/van_phong.png"
);

export const FlightAttendantCV = createSampleCV(
  "Tiếp viên Hàng không (Flight Attendant)",
  "Tiếp viên hàng không chuyên nghiệp, có kỹ năng sơ cấp cứu nâng cao, xử lý tình huống khẩn cấp trên không và kỹ năng chăm sóc khách hàng xuất sắc.",
  [{ category: "Kỹ năng hàng không", list: ["An toàn bay (Safety Procedures)", "Sơ cấp cứu (First Aid)", "Dịch vụ khách hàng cao cấp", "Giao tiếp tiếng Anh trôi chảy (IELTS 7.0)"] }],
  [{ company: "Vietnam Airlines", position: "Tiếp viên hàng không hạng thương gia", date: "2021 - Hiện tại", desc: "Phục vụ đường bay quốc tế chặng châu Âu, châu Úc. Nhận chứng nhận tiếp viên xuất sắc của năm 2023.", tech: ["Aircraft Cabin Equipment", "First Aid Kit"] }],
  [{ school: "Học viện Hàng không Việt Nam", degree: "Chứng chỉ Nghiệp vụ Tiếp viên Hàng không", date: "2020" }],
  "/avatars/business_woman.png"
);

export const TourOperatorCV = createSampleCV(
  "Chuyên viên Điều hành Tour",
  "Chuyên viên thiết kế tour du lịch trong và ngoài nước, đàm phán hợp đồng nhà hàng/khách sạn/vận chuyển để tối ưu hóa giá tour.",
  [{ category: "Nghiệp vụ Tour", list: ["Thiết kế lịch trình tour", "Đàm phán dịch vụ B2B", "Quản lý hướng dẫn viên", "Tư vấn visa du lịch"] }],
  [{ company: "Saigontourist Travel", position: "Chuyên viên điều hành tour quốc tế", date: "2022 - Hiện tại", desc: "Thiết kế và vận hành thành công các tour du lịch châu Âu cho đoàn doanh nghiệp lớn từ 100 khách.", tech: ["Tour Management Software", "CRM Tools"] }],
  [{ school: "Đại học Khoa học Xã hội và Nhân văn Hà Nội", degree: "Cử nhân Lữ hành", date: "2018 - 2022" }],
  "/avatars/van_phong.png"
);

export const RestaurantManagerCV = createSampleCV(
  "Quản lý Nhà hàng",
  "Quản lý nhà hàng ẩm thực cao cấp, có kinh nghiệm quản lý chi phí nguyên vật liệu, nâng cao chất lượng dịch vụ phục vụ và đào tạo nhân sự F&B.",
  [{ category: "F&B Management", list: ["Food Cost Control", "Customer Service Training", "Staff Scheduling", "Inventory Management"] }],
  [{ company: "Golden Gate Group", position: "Quản lý nhà hàng Sumo BBQ", date: "2021 - Hiện tại", desc: "Tối ưu hóa quy trình phục vụ bếp/bàn, tăng 15% doanh thu nhà hàng hàng tháng nhờ đẩy mạnh up-sell.", tech: ["iPOS System", "Excel Inventory"] }],
  [{ school: "Cao đẳng Du lịch Sài Gòn", degree: "Cử nhân Quản trị Nhà hàng", date: "2017 - 2020" }],
  "/avatars/van_phong.png"
);

// 8. Tài chính & Luật & Nhân sự & Hành chính (7 CVs)
export const CorporateCounselCV = createSampleCV(
  "Chuyên viên Pháp chế Doanh nghiệp",
  "Luật sư nội bộ doanh nghiệp chuyên soạn thảo, rà soát hợp đồng kinh tế và tư vấn tuân thủ pháp luật lao động, thuế, đầu tư.",
  [{ category: "Kỹ năng Luật", list: ["Soạn thảo hợp đồng thương mại", "Tư vấn luật doanh nghiệp", "Giải quyết tranh chấp nội bộ", "Sở hữu trí tuệ"] }],
  [{ company: "Tập đoàn Masan", position: "Chuyên viên Pháp chế chính", date: "2020 - Hiện tại", desc: "Rà soát pháp lý cho hơn 500 hợp đồng thương mại và tài trợ hàng năm. Đại diện doanh nghiệp làm việc với cơ quan chức năng.", tech: ["Legal Databases", "Microsoft Office"] }],
  [{ school: "Đại học Luật TPHCM", degree: "Cử nhân Luật Thương mại", date: "2014 - 2018" }],
  "/avatars/luat_su.png"
);

export const AuditorCV = createSampleCV(
  "Chuyên viên Kiểm toán (Auditor)",
  "Kiểm toán viên cấp cao với 5 năm kinh nghiệm thực hiện kiểm toán báo cáo tài chính theo chuẩn mực VAS/IFRS tại các doanh nghiệp niêm yết.",
  [{ category: "Kiểm toán & Tài chính", list: ["VAS/IFRS Standards", "Audit Sampling", "Financial Statement Analysis", "Internal Controls Testing"] }],
  [{ company: "Ernst & Young (EY) Việt Nam", position: "Senior Auditor", date: "2021 - Hiện tại", desc: "Trưởng nhóm thực hiện kiểm toán báo cáo tài chính cho các tập đoàn bất động sản lớn tại Việt Nam.", tech: ["EY Audit Software", "Excel Advanced", "SAP ERP"] }],
  [{ school: "Đại học Kinh tế - Luật (UEL)", degree: "Cử nhân Kiểm toán", date: "2016 - 2020" }],
  "/avatars/van_phong.png"
);

export const StockBrokerCV = createSampleCV(
  "Chuyên viên Môi giới Chứng khoán",
  "Nhà tư vấn đầu tư chứng khoán nhạy bén, có kỹ năng phân tích kỹ thuật (TA) và phân tích cơ bản (FA) tốt, quản lý danh mục đầu tư hiệu quả.",
  [{ category: "Chứng khoán", list: ["Phân tích kỹ thuật (AmiBroker)", "Tư vấn danh mục đầu tư", "Phân tích báo cáo vĩ mô", "Chăm sóc khách hàng VIP"] }],
  [{ company: "Công ty Chứng khoán SSI", position: "Chuyên viên tư vấn đầu tư chứng khoán", date: "2021 - Hiện tại", desc: "Quản lý tổng tài sản ủy thác đầu tư (AUM) hơn 30 tỷ đồng của khách hàng cá nhân. Đạt tỷ suất lợi nhuận trung bình 25%/năm.", tech: ["Amibroker", "Fireant", "Bloomberg Terminal"] }],
  [{ school: "Đại học Ngân hàng TPHCM", degree: "Cử nhân Tài chính Quốc tế", date: "2017 - 2021" }],
  "/avatars/ngan_hang.png"
);

export const RiskAnalystCV = createSampleCV(
  "Chuyên viên Phân tích rủi ro (Risk Analyst)",
  "Chuyên gia quản trị rủi ro tín dụng tại ngân hàng thương mại cổ phần, xây dựng mô hình chấm điểm tín dụng khách hàng doanh nghiệp.",
  [{ category: "Quản trị rủi ro", list: ["Credit Scoring Models", "Financial Modeling", "Basel II/III Standards", "SQL Querying"] }],
  [{ company: "Ngân hàng Techcombank", position: "Chuyên viên phân tích rủi ro tín dụng", date: "2021 - Hiện tại", desc: "Thẩm định rủi ro tài chính cho các dự án cho vay quy mô lớn từ 100 tỷ đồng trở lên.", tech: ["SQL", "Python", "Excel VBA"] }],
  [{ school: "Đại học Ngoại thương TPHCM", degree: "Cử nhân Kinh tế đối ngoại", date: "2017 - 2021" }],
  "/avatars/ngan_hang.png"
);

export const TalentAcquisitionCV = createSampleCV(
  "Chuyên viên Tuyển dụng nhân sự (TA)",
  "Chuyên viên tuyển dụng chuyên nghiệp mảng Công nghệ (IT Recruiter), có kỹ năng săn đầu người (Headhunting) và xây dựng thương hiệu tuyển dụng.",
  [{ category: "Tuyển dụng & Nhân sự", list: ["IT Sourcing (LinkedIn, Github)", "Competency-Based Interviewing", "Employer Branding", "ATS Softwares"] }],
  [{ company: "Tập đoàn VNG", position: "Talent Acquisition Specialist", date: "2022 - Hiện tại", desc: "Tuyển dụng thành công hơn 100 lập trình viên senior/mid cho dự án mới trong vòng 1 năm. Giảm 20% chi phí tuyển dụng qua headhunter.", tech: ["Lattice ATS", "LinkedIn Recruiter", "Trello"] }],
  [{ school: "Đại học Hoa Sen", degree: "Cử nhân Quản trị Nhân lực", date: "2018 - 2022" }],
  "/avatars/business_woman.png"
);

export const LndSpecialistCV = createSampleCV(
  "Chuyên viên Đào tạo & Phát triển (L&D)",
  "Chuyên viên L&D phụ trách thiết lập khung năng lực doanh nghiệp, xây dựng giáo án đào tạo kỹ năng mềm và kỹ năng chuyên môn cho nhân viên.",
  [{ category: "L&D Skills", list: ["Training Needs Analysis (TNA)", "Instructional Design", "E-learning Management", "Public Speaking"] }],
  [{ company: "Tập đoàn Viettel", position: "L&D Specialist", date: "2021 - Hiện tại", desc: "Thiết kế và triển khai chương trình đào tạo hội nhập cho hơn 500 nhân viên mới hàng năm, đạt điểm đánh giá 4.8/5.", tech: ["Moodle LMS", "Articulate Storyline", "Canva"] }],
  [{ school: "Đại học Sư phạm Hà Nội", degree: "Cử nhân Quản lý Giáo dục", date: "2015 - 2019" }],
  "/avatars/giao_vien.png"
);

export const ExecutiveAssistantCV = createSampleCV(
  "Thư ký Giám đốc (Executive Assistant)",
  "Thư ký điều hành chuyên nghiệp, hỗ trợ đắc lực cho Ban giám đốc sắp xếp lịch trình, chuẩn bị tài liệu họp, biên dịch tài liệu cấp cao.",
  [{ category: "Nghiệp vụ thư ký", list: ["Quản lý lịch trình làm việc", "Tổ chức cuộc họp cấp cao", "Biên phiên dịch tiếng Anh", "Giao tiếp ngoại giao đối ngoại"] }],
  [{ company: "Tập đoàn Sungroup", position: "Thư ký Tổng Giám đốc", date: "2021 - Hiện tại", desc: "Quản lý toàn bộ lịch trình công tác trong và ngoài nước của TGĐ. Soạn thảo các văn bản hành chính cấp cao chuẩn xác.", tech: ["Outlook", "Google Calendar", "Word & Excel"] }],
  [{ school: "Đại học Hà Nội", degree: "Cử nhân Ngôn ngữ Anh", date: "2016 - 2020" }],
  "/avatars/van_phong.png"
);

// 9. Logistics & Kỹ thuật & Sản xuất (5 CVs)
export const SupplyChainManagerCV = createSampleCV(
  "Quản lý Chuỗi cung ứng (Supply Chain)",
  "Chuyên gia quản trị chuỗi cung ứng với 8 năm kinh nghiệm tối ưu hóa kho bãi, lập kế hoạch nhu cầu vật tư và quản lý nhà cung cấp quốc tế.",
  [{ category: "Chuỗi cung ứng", list: ["Demand Planning", "Warehouse Management (WMS)", "Supplier Negotiation", "Incoterrms 2020", "SAP MM Module"] }],
  [{ company: "Samsung Electronics Việt Nam", position: "Supply Chain Planner Lead", date: "2020 - Hiện tại", desc: "Tối ưu hóa tồn kho an toàn, giảm 15% chi phí lưu kho vận hành mà vẫn đảm bảo 99% nguyên vật liệu cho sản xuất.", tech: ["SAP ERP", "Excel VBA", "Tableau"] }],
  [{ school: "Đại học Giao thông Vận tải TPHCM", degree: "Cử nhân Logistics & Chuỗi cung ứng", date: "2012 - 2016" }],
  "/avatars/van_phong.png"
);

export const CustomsDeclarantCV = createSampleCV(
  "Chuyên viên Khai báo Hải quan",
  "Chuyên viên xuất nhập khẩu dày dạn kinh nghiệm thực hiện khai báo tờ khai hải quan trên hệ thống VNACCS/VCIS, thông quan hàng hóa nhanh chóng.",
  [{ category: "XNK & Hải quan", list: ["Hệ thống VNACCS/VCIS", "Xác định mã HS code", "Quy trình thông quan hàng hóa", "Xin giấy phép chuyên ngành"] }],
  [{ company: "DHL Express Việt Nam", position: "Customs Clearance Specialist", date: "2021 - Hiện tại", desc: "Thực hiện thông quan thành công trung bình 50 lô hàng xuất nhập khẩu phức tạp mỗi tuần.", tech: ["ECUS5 VNACCS", "Excel"] }],
  [{ school: "Đại học Tài chính - Marketing", degree: "Cử nhân Thương mại Quốc tế", date: "2017 - 2021" }],
  "/avatars/chung-tu.png"
);

export const CivilEngineerCV = createSampleCV(
  "Kỹ sư Xây dựng (Civil Engineer)",
  "Kỹ sư xây dựng công trình dân dụng chuyên nghiệp, có chứng chỉ hành nghề giám sát thi công, thiết kế kết cấu bê tông cốt thép.",
  [{ category: "Xây dựng", list: ["Giám sát thi công hiện trường", "Đọc bản vẽ Autocad", "Tính toán khối lượng bóc tách", "Thiết kế kết cấu SAP2000"] }],
  [{ company: "Tập đoàn xây dựng Coteccons", position: "Kỹ sư giám sát hiện trường", date: "2020 - Hiện tại", desc: "Giám sát thi công phần thô và hoàn thiện cho dự án tòa nhà chung cư cao tầng tại Quận 2, đảm bảo đúng tiến độ và an toàn.", tech: ["Autocad", "SAP2000", "Revit"] }],
  [{ school: "Đại học Xây dựng Hà Nội", degree: "Kỹ sư Xây dựng Dân dụng & Công nghiệp", date: "2015 - 2020" }],
  "/avatars/ky_su.png"
);

export const ConstructionProjectManagerCV = createSampleCV(
  "Quản lý Dự án Xây dựng",
  "Quản lý dự án xây dựng giàu kinh nghiệm, kiểm soát ngân sách thi công dự án, đấu thầu nhà thầu phụ và quản lý tiến độ thi công tổng thể.",
  [{ category: "Quản lý dự án xây dựng", list: ["Lập tiến độ MS Project", "Quản lý đấu thầu thầu phụ", "Kiểm soát ngân sách dự án", "Quản lý rủi ro công trình"] }],
  [{ company: "Tập đoàn Đất Xanh", position: "Quản lý dự án xây dựng", date: "2019 - Hiện tại", desc: "Điều hành dự án khu đô thị quy mô 10ha, kiểm soát ngân sách thi công 200 tỷ đồng, hoàn thành vượt tiến độ 1 tháng.", tech: ["MS Project", "Autocad", "Primavera P6"] }],
  [{ school: "Đại học Bách Khoa TPHCM", degree: "Kỹ sư Quản lý Xây dựng", date: "2012 - 2017" }],
  "/avatars/ky_su.png"
);

export const QAManagerCV = createSampleCV(
  "Quản lý Chất lượng Sản xuất (QA/QC)",
  "Quản lý QA/QC tại nhà máy sản xuất linh kiện điện tử, am hiểu sâu về các tiêu chuẩn chất lượng ISO 9001, 14001 và công cụ cải tiến Six Sigma.",
  [{ category: "Quản lý chất lượng", list: ["ISO 9001:2015 Standards", "Statistical Process Control (SPC)", "FMEA & Root Cause Analysis", "Lean Six Sigma (Green Belt)"] }],
  [{ company: "Intel Products Vietnam", position: "QA/QC Manager", date: "2019 - Hiện tại", desc: "Thiết lập hệ thống kiểm soát chất lượng đầu vào và đầu ra, giảm tỷ lệ sản phẩm lỗi (Defect Rate) từ 1.5% xuống 0.2%.", tech: ["Minitab", "SAP ERP", "Six Sigma Tools"] }],
  [{ school: "Đại học Sư phạm Kỹ thuật TPHCM", degree: "Kỹ sư Công nghệ Chế tạo máy", date: "2011 - 2015" }],
  "/avatars/van_phong.png"
);

// 10. Dịch vụ Khách hàng & Hàng không & Giáo dục (5 CVs)
export const CustomerServiceLeadCV = createSampleCV(
  "Trưởng nhóm Chăm sóc Khách hàng",
  "Trưởng nhóm CSKH tận tâm, chuyên xây dựng kịch bản cuộc gọi, tối ưu hóa các chỉ số CSAT, NPS và đào tạo đội ngũ nhân viên tổng đài.",
  [{ category: "Customer Service", list: ["Call Center Management", "CSAT/NPS Optimization", "Conflict Resolution", "KPIs Tracking"] }],
  [{ company: "Tập đoàn viễn thông Viettel", position: "Customer Service Team Lead", date: "2020 - Hiện tại", desc: "Quản lý và định hướng đội ngũ 15 nhân viên trực tổng đài. Tăng chỉ số hài lòng khách hàng CSAT lên 95%.", tech: ["Zendesk", "Avaya Telephony", "Excel"] }],
  [{ school: "Đại học Ngoại ngữ - ĐHQGHN", degree: "Cử nhân Sư phạm tiếng Anh", date: "2015 - 2019" }],
  "/avatars/business_woman.png"
);

export const EnglishTeacherCV = createSampleCV(
  "Giáo viên Tiếng Anh (IELTS)",
  "Giáo viên giảng dạy IELTS giàu năng lượng (IELTS 8.5), có kinh nghiệm soạn thảo giáo án cá nhân hóa giúp học viên nâng band điểm nhanh chóng.",
  [{ category: "Giảng dạy", list: ["Giảng dạy IELTS 4 kỹ năng", "Soạn thảo giáo trình cá nhân hóa", "Kỹ năng truyền cảm hứng học tập", "Sử dụng công cụ giảng dạy online"] }],
  [{ company: "Trung tâm Anh ngữ VUS", position: "Giáo viên IELTS chính", date: "2021 - Hiện tại", desc: "Trực tiếp giảng dạy các lớp IELTS cam kết đầu ra. Hỗ trợ hơn 100 học viên đạt mục tiêu IELTS 6.5+.", tech: ["Zoom Classroom", "Kahoot", "Quizlet"] }],
  [{ school: "Đại học Sư phạm TPHCM", degree: "Cử nhân Sư phạm Tiếng Anh", date: "2016 - 2020" }],
  "/avatars/giao_vien.png"
);

export const SpaManagerCV = createSampleCV(
  "Quản lý Viện thẩm mỹ / Spa (Spa Manager)",
  "Quản lý vận hành Spa thẩm mỹ, có kinh nghiệm tuyển dụng kỹ thuật viên, quản lý doanh số bán mỹ phẩm/liệu trình và làm thương hiệu Spa.",
  [{ category: "Spa Management", list: ["Spa Operations", "Inventory Control", "Staff Recruitment & Training", "Beauty Sales Strategy"] }],
  [{ company: "Shiseido Beauty Clinic", position: "Spa Branch Manager", date: "2021 - Hiện tại", desc: "Quản lý toàn diện chi nhánh Spa, đạt doanh số 1.2 tỷ đồng/tháng, dẫn đầu hệ thống chi nhánh về doanh thu và chất lượng dịch vụ.", tech: ["SalonHero PMS", "CRM Tools"] }],
  [{ school: "Đại học Tài chính - Marketing", degree: "Cử nhân Quản trị nhà hàng khách sạn", date: "2015 - 2019" }],
  "/avatars/business_woman.png"
);

export const FlightDispatcherCV = createSampleCV(
  "Chuyên viên Điều phái bay (Flight Dispatcher)",
  "Nhân viên điều phái bay có chứng chỉ hành nghề hàng không, lập kế hoạch đường bay tối ưu nhiên liệu, theo dõi thời tiết và giám sát hành trình bay.",
  [{ category: "Hàng không", list: ["Lập kế hoạch bay (Flight Planning)", "Phân tích thời tiết hàng không", "Tính toán tải trọng (Weight & Balance)", "Quy định an toàn ICAO"] }],
  [{ company: "Vietjet Air", position: "Flight Dispatcher", date: "2021 - Hiện tại", desc: "Chịu trách nhiệm lập kế hoạch bay cho hơn 20 chuyến bay nội địa và quốc tế mỗi ngày. Giám sát an toàn tuyệt đối.", tech: ["Jeppesen Flight Planning", "SITA Communicator"] }],
  [{ school: "Học viện Hàng không Việt Nam", degree: "Kỹ sư Quản lý hoạt động bay", date: "2016 - 2021" }],
  "/avatars/ky_su.png"
);

export const HSEOfficerCV = createSampleCV(
  "Kỹ sư An toàn Lao động (HSE Officer)",
  "Kỹ sư HSE tại các công trình công nghiệp lớn, chịu trách nhiệm thiết lập chính sách an toàn, đào tạo phòng chống cháy nổ và kiểm soát tai nạn lao động.",
  [{ category: "HSE Skills", list: ["Đánh giá rủi ro an toàn (JSA)", "Đào tạo PCCC & sơ cứu", "Tiêu chuẩn ISO 45001/14001", "Báo cáo tai nạn lao động"] }],
  [{ company: "Tập đoàn Hòa Phát", position: "Kỹ sư an toàn lao động chính", date: "2020 - Hiện tại", desc: "Giám sát an toàn lao động tại nhà máy luyện thép với hơn 2000 công nhân. Đạt thành tích 1 triệu giờ lao động an toàn không xảy ra tai nạn.", tech: ["HSE Incident Reporting", "Gas Detectors"] }],
  [{ school: "Đại học Công đoàn", degree: "Cử nhân Bảo hộ lao động", date: "2015 - 2019" }],
  "/avatars/ky_su.png"
);

export const FIFTY_GENERATED_SAMPLES = [
  // Nha khoa (3)
  { id: "gen_bacsi_nhakhoa", name: "Bác sĩ Nha khoa (Dentist)", category: "Y tế & Chăm sóc sức khỏe", data: BacSiNhaKhoaCV },
  { id: "gen_ktv_phuchinhrang", name: "Kỹ thuật viên Phục hình răng", category: "Y tế & Chăm sóc sức khỏe", data: KyThuatVienPhucHinhRangCV },
  { id: "gen_phuta_nhakhoa", name: "Phụ tá Nha khoa (Dental Assistant)", category: "Y tế & Chăm sóc sức khỏe", data: PhuTaNhaKhoaCV },

  // Y tế & Thẩm mỹ (3)
  { id: "gen_bacsi_thammy", name: "Bác sĩ Da liễu Thẩm mỹ", category: "Y tế & Chăm sóc sức khỏe", data: BacSiThamMyCV },
  { id: "gen_duocsi_lamsang", name: "Dược sĩ Lâm sàng", category: "Y tế & Chăm sóc sức khỏe", data: DuocSiLamSangCV },
  { id: "gen_dieuduong_truong", name: "Điều dưỡng Trưởng khoa", category: "Y tế & Chăm sóc sức khỏe", data: DieuDuongTruongCV },

  // IT (8)
  { id: "gen_ai_engineer", name: "Kỹ sư Trí tuệ Nhân tạo (AI)", category: "Công nghệ thông tin", data: AIEngineerCV },
  { id: "gen_blockchain_dev", name: "Lập trình viên Blockchain", category: "Công nghệ thông tin", data: BlockchainDeveloperCV },
  { id: "gen_game_dev", name: "Lập trình viên Game (Unity)", category: "Công nghệ thông tin", data: GameDeveloperCV },
  { id: "gen_cybersecurity", name: "Chuyên gia Bảo mật mạng", category: "Công nghệ thông tin", data: CybersecuritySpecialistCV },
  { id: "gen_cloud_architect", name: "Kiến trúc sư giải pháp Cloud", category: "Công nghệ thông tin", data: CloudArchitectCV },
  { id: "gen_data_engineer", name: "Kỹ sư Dữ liệu (Data)", category: "Công nghệ thông tin", data: DataEngineerCV },
  { id: "gen_embedded_dev", name: "Lập trình viên Nhúng", category: "Công nghệ thông tin", data: EmbeddedDeveloperCV },
  { id: "gen_automation_qa", name: "Kỹ sư Kiểm thử Tự động", category: "Công nghệ thông tin", data: AutomationQACV },

  // Marketing & Truyền thông (6)
  { id: "gen_brand_manager", name: "Quản lý Thương hiệu", category: "Marketing & Quảng cáo", data: BrandManagerCV },
  { id: "gen_seo_specialist", name: "Chuyên viên SEO", category: "Marketing & Quảng cáo", data: SEOSpecialistCV },
  { id: "gen_pr_specialist", name: "Chuyên viên Quan hệ công chúng", category: "Marketing & Quảng cáo", data: PRSpecialistCV },
  { id: "gen_social_media", name: "Quản lý Mạng xã hội", category: "Marketing & Quảng cáo", data: SocialMediaManagerCV },
  { id: "gen_copywriter", name: "Creative Copywriter", category: "Marketing & Quảng cáo", data: CopywriterCV },
  { id: "gen_pharma_marketing", name: "Chuyên viên Marketing Dược", category: "Marketing & Quảng cáo", data: PharmaMarketerCV },

  // Spa & Dịch vụ & Sức khỏe (5)
  { id: "gen_spa_therapist", name: "Kỹ thuật viên Spa/Massage", category: "Dịch vụ khách hàng", data: SpaTherapistCV },
  { id: "gen_makeup_artist", name: "Chuyên gia Trang điểm", category: "Thiết kế & Sáng tạo", data: MakeupArtistCV },
  { id: "gen_beauty_consultant", name: "Chuyên viên Tư vấn Thẩm mỹ", category: "Dịch vụ khách hàng", data: BeautyConsultantCV },
  { id: "gen_fitness_trainer", name: "Huấn luyện viên Thể hình (PT)", category: "Dịch vụ & Sức khỏe", data: FitnessTrainerCV },
  { id: "gen_chef", name: "Đầu bếp Trưởng (Head Chef)", category: "Dịch vụ & F&B", data: ChefCV },

  // Thiết kế (4)
  { id: "gen_interior_designer", name: "Nhà thiết kế Nội thất", category: "Thiết kế & Sáng tạo", data: InteriorDesignerCV },
  { id: "gen_fashion_designer", name: "Nhà thiết kế Thời trang", category: "Thiết kế & Sáng tạo", data: FashionDesignerCV },
  { id: "gen_video_editor", name: "Biên tập viên Video", category: "Thiết kế & Sáng tạo", data: VideoEditorCV },
  { id: "gen_graphic_3d", name: "Nhà thiết kế Đồ họa 3D", category: "Thiết kế & Sáng tạo", data: Graphic3DDesignerCV },

  // Du lịch & F&B (4)
  { id: "gen_hotel_manager", name: "Quản lý Khách sạn", category: "Du lịch & Khách sạn", data: HotelManagerCV },
  { id: "gen_flight_attendant", name: "Tiếp viên Hàng không", category: "Dịch vụ & Hàng không", data: FlightAttendantCV },
  { id: "gen_tour_operator", name: "Chuyên viên Điều hành Tour", category: "Du lịch & Dịch vụ", data: TourOperatorCV },
  { id: "gen_restaurant_manager", name: "Quản lý Nhà hàng", category: "Dịch vụ & Khách sạn", data: RestaurantManagerCV },

  // Tài chính & Luật (7)
  { id: "gen_corporate_counsel", name: "Pháp chế Doanh nghiệp", category: "Luật & Tư vấn pháp lý", data: CorporateCounselCV },
  { id: "gen_auditor", name: "Chuyên viên Kiểm toán (Auditor)", category: "Tài chính & Kế toán", data: AuditorCV },
  { id: "gen_stock_broker", name: "Môi giới Chứng khoán", category: "Tài chính & Dịch vụ", data: StockBrokerCV },
  { id: "gen_risk_analyst", name: "Phân tích rủi ro (Risk Analyst)", category: "Tài chính & Dịch vụ", data: RiskAnalystCV },
  { id: "gen_talent_acquisition", name: "Tuyển dụng nhân sự (TA)", category: "Hành chính & Nhân sự", data: TalentAcquisitionCV },
  { id: "gen_lnd_specialist", name: "Đào tạo & Phát triển (L&D)", category: "Hành chính & Nhân sự", data: LndSpecialistCV },
  { id: "gen_executive_assistant", name: "Thư ký Giám đốc", category: "Hành chính & Trợ lý", data: ExecutiveAssistantCV },

  // Logistics & Sản xuất (5)
  { id: "gen_supply_chain_mgr", name: "Quản lý Chuỗi cung ứng", category: "Xuất nhập khẩu & Logistics", data: SupplyChainManagerCV },
  { id: "gen_customs_declarant", name: "Chuyên viên Khai báo Hải quan", category: "Xuất nhập khẩu & Logistics", data: CustomsDeclarantCV },
  { id: "gen_civil_engineer", name: "Kỹ sư Xây dựng", category: "Kỹ thuật & Sản xuất", data: CivilEngineerCV },
  { id: "gen_const_proj_mgr", name: "Quản lý Dự án Xây dựng", category: "Kỹ thuật & Sản xuất", data: ConstructionProjectManagerCV },
  { id: "gen_qa_manager", name: "Quản lý Chất lượng (QA/QC)", category: "Kỹ thuật & Sản xuất", data: QAManagerCV },

  // Dịch vụ KH & Giáo dục (5)
  { id: "gen_customer_service", name: "Trưởng nhóm CSKH", category: "Dịch vụ khách hàng", data: CustomerServiceLeadCV },
  { id: "gen_english_teacher", name: "Giáo viên Tiếng Anh (IELTS)", category: "Giáo dục & Đào tạo", data: EnglishTeacherCV },
  { id: "gen_spa_manager", name: "Quản lý Spa/Viện thẩm mỹ", category: "Dịch vụ khách hàng", data: SpaManagerCV },
  { id: "gen_flight_dispatcher", name: "Chuyên viên Điều phái bay", category: "Dịch vụ & Hàng không", data: FlightDispatcherCV },
  { id: "gen_hse_officer", name: "Kỹ sư An toàn Lao động (HSE)", category: "Kỹ thuật & Sản xuất", data: HSEOfficerCV }
];
