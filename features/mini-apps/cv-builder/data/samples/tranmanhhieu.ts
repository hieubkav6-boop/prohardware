import { CVData } from "../../types/cv";

// Shared data helper to construct Trần Mạnh Hiếu's CVs easily
const basePersonalInfo = {
  name: "Trần Mạnh Hiếu",
  title: "Full-stack Web Developer",
  email: "hieubkav@gmail.com",
  phone: "0948.066.514",
  location: "Cần Thơ",
  website: "https://tranmanhhieu-portfolio.vercel.app/",
  github: "github.com/Hieubkav",
  linkedin: "linkedin.com/in/hieubkav",
  avatar: "/avatars/tran_manh_hieu.webp",
};

const commonSummary = "Lập trình viên Full-stack Web tốt nghiệp chuyên ngành Kỹ thuật phần mềm Đại học Cần Thơ (GPA 3.24). Có thế mạnh phát triển ứng dụng web từ đầu, viết code sạch, dễ bảo trì và luôn bàn giao đúng hạn. Có nhiều kinh nghiệm thực tế triển khai các nền tảng TMĐT, hệ thống quản trị nội bộ nâng cao, cổng thanh toán và tích hợp các giải pháp AI Vision/Realtime.";

const commonEducation = [
  {
    id: "tmh_edu_1",
    school: "Đại học Cần Thơ (CTU)",
    degree: "Kỹ sư",
    fieldOfStudy: "Kỹ thuật phần mềm (K45)",
    location: "Ninh Kiều, Cần Thơ",
    startDate: "2019-09",
    endDate: "2023-07",
    current: false,
    grade: "GPA: 3.24 / 4.00",
    description: "Đào tạo bài bản về kiến trúc phần mềm, cấu trúc dữ liệu, giải thuật, lập trình hướng đối tượng (OOP) và phát triển ứng dụng web.",
  }
];

const commonSkills = [
  {
    id: "tmh_sk_1",
    category: "Ngôn ngữ & Cơ sở dữ liệu",
    skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "PHP", "Python", "MySQL", "PostgreSQL", "Redis"],
  },
  {
    id: "tmh_sk_2",
    category: "Framework & Thư viện",
    skills: ["Laravel", "Next.js", "React", "Livewire", "Alpine.js", "Tailwind CSS", "Convex", "Filament"],
  },
  {
    id: "tmh_sk_3",
    category: "Công cụ & Công nghệ",
    skills: ["Git", "GitHub", "Supabase", "VS Code", "PhpStorm", "Docker", "REST API", "CI/CD"],
  }
];

const commonLanguages = [
  {
    id: "tmh_lang_1",
    name: "Tiếng Việt",
    proficiency: "Bản xứ",
  },
  {
    id: "tmh_lang_2",
    name: "Tiếng Anh",
    proficiency: "Giao tiếp Tốt & Đọc tài liệu chuyên ngành",
  }
];

const allProjects = [
  {
    id: "tmh_pj_1",
    title: "Glass Try On",
    role: "Full-stack Developer & AI Integration",
    description: "Ứng dụng thử kính ảo sử dụng Face Mesh. Cho phép upload kính 2D và mô phỏng đeo kính realtime qua camera, hỗ trợ thuật toán gợi ý mẫu kính phù hợp khuôn mặt.",
    link: "glass.vitrasau.info.vn/try_on/3",
    techStack: ["Face Mesh", "AI Vision", "WebRTC", "Canvas API", "JavaScript"],
  },
  {
    id: "tmh_pj_2",
    title: "thanshoes.vn",
    role: "Lead Developer",
    description: "Website TMĐT giày dép đồng bộ dữ liệu Sap API. Phát triển các tính năng quản lý tồn kho, nhập hàng Trung Quốc, xử lý và tính chi phí tự động từ Excel, thuật toán ghép cặp giày tối ưu.",
    link: "thanshoes.vn",
    techStack: ["TALL Stack", "Filament", "MySQL", "Excel Import", "Sapo API"],
  },
  {
    id: "tmh_pj_3",
    title: "Quét Thẻ Uy Tín Cần Thơ",
    role: "Backend & Security Lead",
    description: "Hệ thống quản lý dịch vụ tài chính, rút tiền và đáo hạn thẻ tín dụng trực tuyến. Xây dựng phân hệ quản lý thông tin khách hàng, bảng tính phí tự động và bảo mật giao dịch.",
    link: "dichvuthetindungcantho.com",
    techStack: ["Laravel", "MySQL", "Payment Gateway", "Security Systems"],
  },
  {
    id: "tmh_pj_4",
    title: "pkngocnhan.vn",
    role: "Full-stack Developer",
    description: "Cổng thông tin và quản lý phòng khám đa khoa Ngọc Nhân. Phát triển tính năng đặt lịch hẹn trực tuyến, quản lý hồ sơ bệnh án điện tử nội bộ và xuất báo cáo PDF.",
    link: "pkngocnhan.vn",
    techStack: ["TALL Stack", "Filament", "MySQL", "PDF Export"],
  },
  {
    id: "tmh_pj_5",
    title: "VuPhuc Platform (E-commerce)",
    role: "Full-stack Developer",
    description: "Nền tảng bán hàng trực tuyến tích hợp sâu với hệ thống quản lý MShopkeeper API. Hỗ trợ hiển thị video sản phẩm mượt mà bằng Video.js.",
    link: "vuphucbaking.com",
    techStack: ["Laravel", "MySQL", "Video.js", "MShopkeeper API"],
  },
  {
    id: "tmh_pj_6",
    title: "Vũ Phúc LMS",
    role: "LMS Developer",
    description: "Hệ thống quản lý đào tạo trực tuyến dành cho học viên làm bánh. Tích hợp streaming video bảo mật, làm bài kiểm tra trắc nghiệm và cấp chứng chỉ tự động.",
    link: "vba.vuphucbaking.com",
    techStack: ["Laravel", "Filament", "Video.js", "MySQL", "Quiz Engine"],
  },
  {
    id: "tmh_pj_7",
    title: "Nhà 24h Cafe",
    role: "Front-End Developer",
    description: "Trang landing page giới thiệu thương hiệu cà phê hiện đại. Thiết kế hiệu ứng cuộn mượt và micro-animations nâng cao trải nghiệm thương hiệu.",
    link: "nha24hcafe.vercel.app",
    techStack: ["Next.js", "shadcn/ui", "Framer Motion", "react-lenis"],
  },
  {
    id: "tmh_pj_8",
    title: "Bán Acc Thương Mại Điện Tử",
    role: "Full-stack Developer",
    description: "Cổng thương mại điện tử mua bán tài khoản số. Tích hợp giỏ hàng và đồng bộ hóa trạng thái tài khoản thời gian thực sử dụng Convex serverless database.",
    link: "dttaikhoanso.vercel.app",
    techStack: ["Next.js", "Convex", "React", "Tailwind CSS"],
  },
  {
    id: "tmh_pj_9",
    title: "Visual Novel Game",
    role: "Independent Game Developer",
    description: "Tự thiết kế và lập trình game tiểu thuyết tương tác chạy hoàn toàn trên trình duyệt web.",
    link: "hieubkav.github.io/visual-novel/",
    techStack: ["HTML5", "CSS3", "JavaScript", "GitHub Pages"],
  }
];

const commonExperience = [
  {
    id: "tmh_exp_1",
    company: "Freelance Web Developer & Contractor",
    position: "Full-stack Developer",
    location: "Cần Thơ / Từ xa",
    startDate: "2023-08",
    endDate: "Hiện tại",
    current: true,
    description: "• Phát triển thành công 8+ dự án website thương mại điện tử, cổng thanh toán, LMS và quản lý phòng khám thực tế.\n• Trực tiếp làm việc với khách hàng doanh nghiệp nhỏ để lấy yêu cầu, thiết kế cơ sở dữ liệu và triển khai lên môi trường VPS/Vercel/Cloud.\n• Tối ưu hệ thống đồng bộ API sapo/mshopkeeper giúp xử lý hàng ngàn giao dịch ổn định.\n• Xây dựng giải thuật tối ưu hóa chi phí nhập hàng tự động từ file excel, giúp doanh nghiệp tiết kiệm 15% chi phí vận hành.",
    techStack: ["Laravel", "Next.js", "React", "Convex", "MySQL", "Filament", "Tailwind CSS"],
  }
];

// CV 1: Full-stack Developer (Trần Mạnh Hiếu)
export const TMHFullstackCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Full-stack Web Developer",
  },
  summary: commonSummary,
  workExperience: commonExperience,
  projects: allProjects,
  education: commonEducation,
  skills: commonSkills,
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 2: Laravel Developer (Trần Mạnh Hiếu)
export const TMHLaravelCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Chuyên Viên Phát Triển PHP/Laravel & TALL Stack",
  },
  summary: "Lập trình viên PHP/Laravel với thế mạnh phát triển hệ thống quản trị, CMS và ứng dụng nghiệp vụ doanh nghiệp sử dụng TALL Stack (Tailwind CSS, Alpine.js, Laravel, Livewire) cùng Filament Admin. Kinh nghiệm thiết kế database tối ưu và tích hợp API nâng cao.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Laravel / Backend Developer",
      description: "• Tập trung phát triển backend cho các cổng thanh toán, web TMĐT và hệ quản trị clinic.\n• Xây dựng CMS/Admin Panel đa năng bằng Filament, giúp tăng tốc 40% tiến độ bàn giao chức năng admin.\n• Thiết kế và tinh chỉnh các câu lệnh SQL trên MySQL/PostgreSQL phục vụ phân tích dữ liệu kho bãi.",
    }
  ],
  projects: [
    allProjects[1], // thanshoes.vn
    allProjects[2], // Quét thẻ tín dụng
    allProjects[3], // pkngocnhan.vn
    allProjects[5], // Vũ Phúc LMS
  ],
  education: commonEducation,
  skills: [
    {
      id: "tmh_sk_lar_1",
      category: "Laravel Ecosystem",
      skills: ["Laravel Core", "Eloquent ORM", "Livewire", "Filament Admin", "Blade Templates", "REST APIs"],
    },
    ...commonSkills.filter(sk => sk.id !== "tmh_sk_2")
  ],
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 3: Next.js/React Developer (Trần Mạnh Hiếu)
export const TMHNextjsCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Lập trình viên Front-End (Next.js / React)",
  },
  summary: "Lập trình viên chuyên sâu phát triển giao diện người dùng (UI/UX) sử dụng Next.js, React và TypeScript. Đam mê xây dựng các giao diện động mượt mà, tối ưu SEO, chuẩn responsive và thân thiện trên các thiết bị di động.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Frontend Engineer (Next.js / React)",
      description: "• Phát triển các giao diện người dùng Web App tương tác cao sử dụng Next.js App Router và React.\n• Thiết kế các chuyển động tinh tế bằng Framer Motion kết hợp cuộn mượt bằng Lenis, nâng cao điểm SEO và trải nghiệm người dùng.\n• Tích hợp APIs và quản lý state đồng bộ thời gian thực một cách hiệu quả.",
    }
  ],
  projects: [
    allProjects[7], // Bán Acc Convex/Nextjs
    allProjects[6], // Nhà 24h Cafe Nextjs
    allProjects[0], // Glass Try On (Face Mesh)
  ],
  education: commonEducation,
  skills: [
    {
      id: "tmh_sk_next_1",
      category: "Frontend Stack",
      skills: ["React", "Next.js (App Router)", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Lenis Scroll"],
    },
    ...commonSkills.filter(sk => sk.id !== "tmh_sk_2")
  ],
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 4: AI Research Developer (Trần Mạnh Hiếu)
export const TMHAIResearchCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Software Engineer (AI Vision & Web Integration)",
  },
  summary: "Kỹ sư phần mềm có định hướng ứng dụng trí tuệ nhân tạo (AI Vision) vào môi trường web. Có kinh nghiệm triển khai mô hình học máy Face Mesh xử lý trực tiếp trên trình duyệt, kết hợp phân tích khuôn mặt ứng dụng cho ngành thương mại bán lẻ.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Web & AI Integration Engineer",
      description: "• Nghiên cứu và thử nghiệm tích hợp các mô hình AI trực tiếp trên giao diện Client-Side nhằm giảm tải chi phí xử lý Server.\n• Xây dựng ứng dụng thử kính ảo tối ưu hiệu năng render của HTML5 Canvas khi kết hợp với mô hình nhận diện điểm mốc khuôn mặt.\n• Viết các bài báo cáo kỹ thuật chia sẻ tiến độ và tài liệu cấu hình chi tiết cho các bạn trong nhóm.",
    }
  ],
  projects: [
    allProjects[0], // Glass Try On
    allProjects[8], // Visual Novel
  ],
  education: commonEducation,
  skills: [
    {
      id: "tmh_sk_ai_1",
      category: "Web & AI Technologies",
      skills: ["Face Mesh / MediaPipe", "AI Vision Integration", "HTML5 Canvas API", "WebRTC Video Streaming", "Python", "JavaScript"],
    },
    ...commonSkills.filter(sk => sk.id !== "tmh_sk_1")
  ],
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 5: Fresher Web Developer (Trần Mạnh Hiếu)
export const TMHFresherCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Lập trình viên Web mới tốt nghiệp (Fresher)",
  },
  summary: "Tốt nghiệp chuyên ngành Kỹ thuật phần mềm Đại học Cần Thơ loại Khá (GPA 3.24). Có nền tảng lý thuyết vững chắc về lập trình hướng đối tượng, kiến trúc web, hệ quản trị cơ sở dữ liệu và đã có kinh nghiệm tham gia nhiều dự án web thực tiễn trước khi tốt nghiệp.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Web Developer (Intern & Freelancer)",
      description: "• Học tập quy trình phát triển sản phẩm chuyên nghiệp, áp dụng Git quản lý phiên bản trong nhóm.\n• Tham gia hỗ trợ coding, tối ưu hóa giao diện và kiểm thử tính năng cho các sản phẩm web thực tế.\n• Cố gắng giải quyết các issue giao diện và logic được giao đúng thời hạn.",
    }
  ],
  projects: allProjects.slice(0, 5),
  education: commonEducation,
  skills: commonSkills,
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 6: TALL Stack Expert (Trần Mạnh Hiếu)
export const TMHTALLStackCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Chuyên Gia Lập Trình TALL Stack (Tailwind/Alpine/Laravel/Livewire)",
  },
  summary: "Kỹ sư phần mềm chuyên môn sâu về TALL Stack. Tận dụng tối đa sự kết hợp mạnh mẽ giữa Laravel Backend và Livewire/Alpine.js Frontend để xây dựng những ứng dụng web động nhanh gọn, bảo mật cao mà không cần viết quá nhiều Javascript phức tạp.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "TALL Stack Lead Developer",
      description: "• Thiết kế kiến trúc các website ERP thu nhỏ, cổng thông tin y tế, TMĐT sử dụng Livewire làm trung tâm tương tác.\n• Tối ưu thời gian phản hồi trang admin bằng cách sử dụng các bảng Filament kết hợp Livewire component tối ưu truy vấn Eloquent.\n• Cấu hình các cơ chế cache bằng Redis và phân tải tác vụ qua Queue Worker.",
    }
  ],
  projects: [
    allProjects[1], // thanshoes
    allProjects[3], // pkngocnhan
    allProjects[5], // Vũ Phúc LMS
  ],
  education: commonEducation,
  skills: [
    {
      id: "tmh_sk_tall_1",
      category: "TALL Stack",
      skills: ["Laravel Framework", "Livewire (Realtime UI)", "Alpine.js (Client State)", "Tailwind CSS (V3/V4)", "Filament Admin Helper"],
    },
    ...commonSkills.filter(sk => sk.id !== "tmh_sk_2")
  ],
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 7: Backend Engineer (Trần Mạnh Hiếu)
export const TMHBackendCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Kỹ sư Back-End (PHP / Laravel / Node.js)",
  },
  summary: "Kỹ sư phần mềm tập trung vào phát triển hệ thống phía Backend. Chuyên sâu thiết kế cơ sở dữ liệu quan hệ MySQL, tối ưu truy vấn, xây dựng kiến trúc API RESTful bảo mật và tích hợp cổng dịch vụ, xử lý hàng đợi, đồng bộ dữ liệu.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Backend Engineer",
      description: "• Thiết kế lược đồ database chi tiết cho 5+ ứng dụng web có cấu trúc phức tạp.\n• Xây dựng và tối ưu các phân hệ thanh toán trực tuyến, đối soát giao dịch và xuất báo cáo tự động.\n• Đồng bộ hóa dữ liệu tồn kho và đơn hàng với các API đối tác bên thứ ba một cách an toàn thông qua cron jobs và queue.",
    }
  ],
  projects: [
    allProjects[1], // thanshoes
    allProjects[2], // quét thẻ
    allProjects[5], // Vũ Phúc LMS
  ],
  education: commonEducation,
  skills: [
    {
      id: "tmh_sk_be_1",
      category: "Backend Technologies",
      skills: ["PHP & Laravel", "MySQL & PostgreSQL", "RESTful API", "Queue & Jobs", "Redis Caching", "Git & VPS Deployment"],
    },
    ...commonSkills.filter(sk => sk.id !== "tmh_sk_1" && sk.id !== "tmh_sk_2")
  ],
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 8: Frontend Developer (Trần Mạnh Hiếu)
export const TMHFrontendCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Lập trình viên Front-End (React / Next.js / TypeScript)",
  },
  summary: "Lập trình viên Frontend với niềm đam mê xây dựng giao diện đẹp mắt, tương tác cao và hiệu năng mượt mà. Kinh nghiệm lập trình sạch sẽ bằng TypeScript, sử dụng Tailwind CSS tạo layout responsive linh hoạt và tối ưu hóa CSS cho tốc độ tải trang nhanh nhất.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Front-End Developer",
      description: "• Phát triển giao diện người dùng tương thích đa nền tảng và chuẩn SEO.\n• Xây dựng các components tái sử dụng cao, áp dụng các thư viện UI hiện đại như shadcn/ui để tối ưu hóa thời gian phát triển giao diện.\n• Làm việc với APIs để đồng bộ dữ liệu nhanh chóng và ổn định.",
    }
  ],
  projects: [
    allProjects[6], // Nhà 24h Cafe
    allProjects[7], // Bán Acc TMĐT
    allProjects[0], // Glass Try On
  ],
  education: commonEducation,
  skills: [
    {
      id: "tmh_sk_fe_1",
      category: "Frontend Stack",
      skills: ["HTML5 / CSS3", "JavaScript / TypeScript", "React.js / Next.js", "Tailwind CSS / CSS Modules", "shadcn/ui / Radix UI", "Framer Motion"],
    },
    ...commonSkills.filter(sk => sk.id !== "tmh_sk_2")
  ],
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 9: Software Engineer (Trần Mạnh Hiếu)
export const TMHSoftwareEngineerCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Software Engineer",
  },
  summary: "Kỹ sư phần mềm tốt nghiệp Đại học Cần Thơ. Sở hữu tư duy hệ thống mạch lạc, kiến thức toán học và cấu trúc dữ liệu tốt. Đã tham gia phát triển đầy đủ vòng đời dự án phần mềm từ giai đoạn khảo sát yêu cầu khách hàng cho đến triển khai bảo trì.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Software Engineer",
      description: "• Thiết kế và mô hình hóa hệ thống cơ sở dữ liệu thực tế.\n• Viết code đáp ứng các tiêu chuẩn bảo mật, tối ưu hóa tốc độ tải dữ liệu và giảm thiểu tiêu thụ tài nguyên hệ thống.\n• Tài liệu hóa chi tiết kiến trúc API và luồng dữ liệu nghiệp vụ để phục vụ mở rộng trong tương lai.",
    }
  ],
  projects: allProjects.slice(0, 6),
  education: commonEducation,
  skills: commonSkills,
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};

// CV 10: Technical Lead / Senior Developer (Trần Mạnh Hiếu)
export const TMHLeadCV: CVData = {
  personalInfo: {
    ...basePersonalInfo,
    title: "Senior Full-stack Developer / Project Lead",
  },
  summary: "Lập trình viên Full-stack giàu kinh nghiệm thực tế. Tự hào về khả năng quản lý toàn bộ kỹ thuật của các dự án phần mềm tự do, từ thiết kế kiến trúc hệ thống, lựa chọn stack công nghệ tối ưu cho đến phân tích hiệu quả vận hành và tối ưu chi phí.",
  workExperience: [
    {
      ...commonExperience[0],
      position: "Technical Project Lead",
      description: "• Dẫn dắt mặt kỹ thuật cho nhóm phát triển 8+ website và nền tảng dịch vụ.\n• Quyết định kiến trúc hệ thống (Laravel vs Next.js + Convex) để phù hợp nhất với yêu cầu tốc độ phát triển và quy mô dự án.\n• Tối ưu hóa hạ tầng VPS, giảm 30% chi phí máy chủ nhờ cấu hình Docker và phân chia tài nguyên hợp lý.",
    }
  ],
  projects: allProjects,
  education: commonEducation,
  skills: commonSkills,
  languages: commonLanguages,
  certifications: [],
  customSections: [],
};
