import { CVData } from "../../types/cv";

export const FrontendDevCV: CVData = {
  personalInfo: {
    name: "Nguyễn Văn Nam",
    title: "Lập trình viên Front-End (React/Next.js)",
    email: "nam.nguyen.fe@gmail.com",
    phone: "(+84) 912 345 678",
    location: "Quận 1, TP. Hồ Chí Minh",
    website: "https://namnguyen.dev",
    github: "github.com/namnguyen-fe",
    linkedin: "linkedin.com/in/namnguyen-frontend",
    avatar: "/avatars/dev.png",
  },
  summary: "Lập trình viên Front-End với 3 năm kinh nghiệm phát triển ứng dụng web hiện đại sử dụng React, Next.js và TypeScript. Có kinh nghiệm tối ưu hiệu suất tải trang (đạt điểm Lighthouse 90+), thiết kế giao diện responsive và phối hợp chặt chẽ với đội ngũ thiết kế UX/UI để đem lại trải nghiệm người dùng tốt nhất.",
  workExperience: [
    {
      id: "fe_w1",
      company: "Công ty Cổ phần Công nghệ ABC",
      position: "Front-End Developer",
      location: "TP. Hồ Chí Minh",
      startDate: "2023-01",
      endDate: "Hiện tại",
      current: true,
      description: "• Phát triển giao diện cho hệ thống quản lý bán hàng (SaaS) bằng Next.js và Tailwind CSS.\n• Tối ưu hóa kích thước bundle tải trang giảm 35% nhờ áp dụng Dynamic Imports và lazy loading.\n• Xây dựng bộ thư viện UI dùng chung cho 3 dự án nội bộ, giúp giảm 20% thời gian code giao diện của nhóm phát triển sản phẩm.\n• Hướng dẫn và hỗ trợ chuyên môn cho 2 bạn lập trình viên thực tập.",
      techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Git"],
    },
    {
      id: "fe_w2",
      company: "Giải pháp Phần mềm VinaSoft",
      position: "Junior Web Developer",
      location: "TP. Hồ Chí Minh",
      startDate: "2021-08",
      endDate: "2022-12",
      current: false,
      description: "• Tham gia thiết kế và lập trình giao diện các dự án Website giới thiệu sản phẩm và thương mại điện tử.\n• Đảm bảo tính tương thích của giao diện trên mọi thiết bị di động và trình duyệt (Chrome, Safari, Firefox).\n• Tích hợp API và xử lý dữ liệu phức tạp từ hệ thống Backend.",
      techStack: ["HTML5", "CSS3", "JavaScript", "React", "Sass", "Bootstrap"],
    },
  ],
  projects: [
    {
      id: "fe_p1",
      title: "Hệ thống Quản lý Kanban Doanh nghiệp",
      role: "Lập trình viên giao diện chính",
      description: "Ứng dụng quản lý công việc nhóm trực quan theo phương pháp Agile. Tích hợp tính năng kéo thả trực quan, cập nhật trạng thái thời gian thực qua WebSockets.",
      link: "github.com/namnguyen-fe/kanban-board",
      techStack: ["React", "TypeScript", "Tailwind CSS", "Socket.io"],
    },
    {
      id: "fe_p2",
      title: "Trang Web Cá nhân & Blog Công nghệ",
      role: "Nhà phát triển độc lập",
      description: "Xây dựng blog cá nhân chia sẻ kiến thức công nghệ, hỗ trợ SEO tối đa và điểm hiệu suất Lighthouse đạt 100/100.",
      link: "namnguyen.dev",
      techStack: ["Next.js", "MDX", "Tailwind CSS", "Vercel"],
    },
  ],
  education: [
    {
      id: "fe_e1",
      school: "Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Hệ thống Thông tin",
      location: "Thủ Đức, TP.HCM",
      startDate: "2017-09",
      endDate: "2021-06",
      current: false,
      grade: "GPA: 3.2 / 4.0",
      description: "Đạt giải ba cuộc thi học thuật phát triển ứng dụng di động cấp trường năm 2020.",
    },
  ],
  skills: [
    {
      id: "fe_s1",
      category: "Ngôn ngữ & Nền tảng",
      skills: ["HTML5", "CSS3", "JavaScript (ES6)", "TypeScript"],
    },
    {
      id: "fe_s2",
      category: "Thư viện & Frameworks",
      skills: ["React", "Next.js", "Redux Toolkit", "Tailwind CSS", "Bootstrap", "Sass"],
    },
    {
      id: "fe_s3",
      category: "Công cụ & Quy trình",
      skills: ["Git & GitHub", "Vercel", "Docker", "Figma", "Lighthouse", "Rest API"],
    },
  ],
  languages: [
    {
      id: "fe_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "fe_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp Tốt (TOEIC 780)",
    },
  ],
  certifications: [
    {
      id: "fe_c1",
      name: "Meta Front-End Developer Professional Certificate",
      issuer: "Coursera",
      date: "2022-11",
    },
  ],
  customSections: [],
};

export const BackendDevCV: CVData = {
  personalInfo: {
    name: "Trần Minh Đức",
    title: "Lập trình viên Back-End (Node.js/NestJS)",
    email: "duc.tran.be@gmail.com",
    phone: "(+84) 988 777 666",
    location: "Cầu Giấy, Hà Nội",
    website: "",
    github: "github.com/duc-backend",
    linkedin: "linkedin.com/in/duc-backend-engineer",
    avatar: "/avatars/dev.png",
  },
  summary: "Lập trình viên Back-End giàu kinh nghiệm phát triển các hệ thống API có tính chịu tải cao và kiến trúc microservices sử dụng Node.js, Express và NestJS. Có kiến thức vững chắc về cơ sở dữ liệu PostgreSQL, MongoDB, tối ưu hóa truy vấn SQL, và quản lý hàng đợi tin nhắn với RabbitMQ.",
  workExperience: [
    {
      id: "be_w1",
      company: "Công ty Giải pháp Phần mềm XYZ",
      position: "Back-End Developer",
      location: "Hà Nội",
      startDate: "2022-03",
      endDate: "Hiện tại",
      current: true,
      description: "• Thiết kế và phát triển RESTful APIs cho ứng dụng ví điện tử phục vụ hơn 50,000 người dùng hoạt động hàng ngày.\n• Tối ưu hóa hiệu năng cơ sở dữ liệu giúp giảm thời gian truy xuất thông tin người dùng từ 400ms xuống còn dưới 80ms.\n• Xây dựng hệ thống gửi thông báo tự động thông qua hàng đợi RabbitMQ, đảm bảo tỷ lệ gửi tin nhắn thành công đạt 99.9%.\n• Viết unit test nâng cao tỷ lệ bao phủ mã nguồn (Code Coverage) đạt trên 85%.",
      techStack: ["Node.js", "NestJS", "TypeScript", "PostgreSQL", "Redis", "RabbitMQ", "Jest"],
    },
    {
      id: "be_w2",
      company: "TechSmart Solutions",
      position: "Junior Back-End Engineer",
      location: "Hà Nội",
      startDate: "2020-07",
      endDate: "2022-02",
      current: false,
      description: "• Tham gia thiết kế cơ sở dữ liệu và viết API cho dự án phần mềm quản lý kho hàng.\n• Tích hợp dịch vụ thanh toán trực tuyến (Momo, VNPay) và đơn vị vận chuyển (Giao Hàng Nhanh).\n• Sửa lỗi bảo mật, cài đặt tường lửa cơ bản và phân quyền người dùng (RBAC).",
      techStack: ["Node.js", "Express", "MongoDB", "MySQL", "Docker", "Git"],
    },
  ],
  projects: [
    {
      id: "be_p1",
      title: "Hệ thống Thanh toán Thương mại Điện tử",
      role: "Lập trình viên Backend chính",
      description: "Cổng trung gian thanh toán bảo mật, hỗ trợ xử lý 200 giao dịch đồng thời mỗi giây. Mã hóa dữ liệu người dùng chuẩn SHA256.",
      link: "",
      techStack: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker"],
    },
  ],
  education: [
    {
      id: "be_e1",
      school: "Đại học Bách Khoa Hà Nội",
      degree: "Kỹ sư",
      fieldOfStudy: "Khoa học Máy tính",
      location: "Hai Bà Trưng, Hà Nội",
      startDate: "2016-09",
      endDate: "2021-02",
      current: false,
      grade: "GPA: 3.1 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "be_s1",
      category: "Công nghệ Back-End",
      skills: ["Node.js", "NestJS", "Express", "TypeScript", "Python"],
    },
    {
      id: "be_s2",
      category: "Cơ sở dữ liệu & Caching",
      skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"],
    },
    {
      id: "be_s3",
      category: "Hệ thống & DevOps",
      skills: ["Docker", "RabbitMQ", "AWS (S3, EC2)", "Linux", "Git", "RESTful API"],
    },
  ],
  languages: [
    {
      id: "be_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "be_l2",
      name: "Tiếng Anh",
      proficiency: "Đọc hiểu Tài liệu Kỹ thuật Tốt (IELTS 6.0)",
    },
  ],
  certifications: [
    {
      id: "be_c1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2023-08",
    },
  ],
  customSections: [],
};

export const LaravelDevCV: CVData = {
  personalInfo: {
    name: "Phạm Hoàng Hải",
    title: "PHP/Laravel Developer",
    email: "hai.pham.laravel@gmail.com",
    phone: "(+84) 909 123 456",
    location: "Quận Bình Thạnh, TP. Hồ Chí Minh",
    website: "",
    github: "github.com/hai-laravel",
    linkedin: "linkedin.com/in/hai-laravel-dev",
    avatar: "/avatars/dev.png",
  },
  summary: "Lập trình viên PHP/Laravel với 4 năm kinh nghiệm xây dựng các hệ thống quản trị nội bộ (CMS), thương mại điện tử (E-commerce) và cổng thanh toán trực tuyến. Sử dụng thành thạo hệ sinh thái Laravel (Nova, Horizon, Livewire) cùng kỹ năng viết code sạch, chuẩn PSR-12, tối ưu hóa cơ sở dữ liệu.",
  workExperience: [
    {
      id: "la_w1",
      company: "Công ty Cổ phần Thương mại Điện tử Vina",
      position: "Laravel Developer",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-05",
      endDate: "Hiện tại",
      current: true,
      description: "• Thiết kế và vận hành trang thương mại điện tử bán lẻ lớn, tích hợp cổng thanh toán VNPay, Momo, Stripe.\n• Quản lý và giám sát hàng đợi xử lý hóa đơn tự động bằng Laravel Horizon, giảm thiểu nghẽn hệ thống giờ cao điểm.\n• Nâng cấp hệ thống Laravel từ phiên bản 8 lên 11 thành công, tối ưu hóa các package phụ thuộc giúp giảm 15% lượng RAM máy chủ tiêu thụ.",
      techStack: ["PHP 8.2", "Laravel 11", "MySQL", "Redis", "Laravel Horizon", "Livewire"],
    },
    {
      id: "la_w2",
      company: "VinaTech Software",
      position: "PHP Developer",
      location: "TP. Hồ Chí Minh",
      startDate: "2020-03",
      endDate: "2022-04",
      current: false,
      description: "• Tham gia phát triển hệ thống quản trị nội bộ (CMS) cho các doanh nghiệp bất động sản.\n• Viết RESTful API phục vụ ứng dụng Mobile trên nền tảng Laravel.\n• Tối ưu hóa truy vấn SQL thông qua Eloquent ORM và quản lý migration.",
      techStack: ["PHP", "Laravel", "MySQL", "Bootstrap", "jQuery", "Git"],
    },
  ],
  projects: [
    {
      id: "la_p1",
      title: "Cổng Bán Vé Sự Kiện Trực Tuyến",
      role: "Nhà phát triển chính",
      description: "Website bán vé ca nhạc trực tuyến, giải quyết bài toán đặt chỗ đồng thời bằng cách sử dụng DB Transaction và Redis Lock để tránh đặt trùng ghế.",
      link: "github.com/hai-laravel/ticket-booking",
      techStack: ["Laravel", "MySQL", "Redis", "Bootstrap"],
    },
  ],
  education: [
    {
      id: "la_e1",
      school: "Đại học Sài Gòn",
      degree: "Cử nhân",
      fieldOfStudy: "Công nghệ Thông tin",
      location: "TP. Hồ Chí Minh",
      startDate: "2016-09",
      endDate: "2020-02",
      current: false,
      grade: "GPA: 2.9 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "la_s1",
      category: "Kỹ năng Lập trình",
      skills: ["PHP", "JavaScript", "SQL", "HTML5/CSS3"],
    },
    {
      id: "la_s2",
      category: "Hệ sinh thái Laravel",
      skills: ["Laravel Framework", "Eloquent ORM", "Livewire", "Laravel Horizon", "Blade", "Laravel Nova"],
    },
    {
      id: "la_s3",
      category: "Công cụ & Cơ sở dữ liệu",
      skills: ["MySQL", "Redis", "Git", "Docker", "Nginx", "Apache", "RESTful API"],
    },
  ],
  languages: [
    {
      id: "la_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "la_l2",
      name: "Tiếng Anh",
      proficiency: "Đọc hiểu Tài liệu Kỹ thuật Tốt",
    },
  ],
  certifications: [
    {
      id: "la_c1",
      name: "Laravel Certified Developer",
      issuer: "Laravel Certification LLC",
      date: "2023-02",
    },
  ],
  customSections: [],
};

export const TypescriptDevCV: CVData = {
  personalInfo: {
    name: "Vũ Tiến Anh",
    title: "Kỹ sư Phần mềm TypeScript",
    email: "tienanh.vu@techhub.asia",
    phone: "(+84) 933 444 555",
    location: "Quận 3, TP. Hồ Chí Minh",
    website: "",
    github: "github.com/tienanh-ts",
    linkedin: "linkedin.com/in/tienanh-typescript",
    avatar: "/avatars/dev.png",
  },
  summary: "Kỹ sư phần mềm chuyên sâu về TypeScript với tư duy hệ thống vững vàng. Có kinh nghiệm xây dựng ứng dụng Full-stack vững chãi sử dụng TypeScript trên cả Frontend (React/NextJS) và Backend (NodeJS/NestJS). Đam mê lập trình hàm (Functional Programming), tối ưu hóa kiểu dữ liệu tĩnh giúp loại bỏ 90% lỗi runtime.",
  workExperience: [
    {
      id: "ts_w1",
      company: "TechHub Asia",
      position: "Senior Software Engineer (Full-stack TypeScript)",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-10",
      endDate: "Hiện tại",
      current: true,
      description: "• Phát triển nền tảng quản trị rủi ro doanh nghiệp sử dụng kiến trúc Domain-Driven Design (DDD) hoàn toàn bằng TypeScript.\n• Thiết lập quy chuẩn kiểm duyệt kiểu dữ liệu chặt chẽ và CI/CD tự động phát hiện lỗi biên dịch trước khi triển khai.\n• Viết API xử lý dữ liệu tài chính phức tạp bằng NestJS, cam kết hiệu suất tải tối ưu.",
      techStack: ["TypeScript", "NestJS", "React", "PostgreSQL", "Monorepo", "Docker", "CI/CD"],
    },
    {
      id: "ts_w2",
      company: "Axon Active Vietnam",
      position: "Software Engineer",
      location: "TP. Hồ Chí Minh",
      startDate: "2020-05",
      endDate: "2022-09",
      current: false,
      description: "• Lập trình ứng dụng Web Single Page và các API hỗ trợ hệ thống định danh nội bộ.\n• Chuyển đổi mã nguồn JavaScript cũ sang TypeScript giúp giảm thiểu đáng kể lỗi kiểu dữ liệu ở môi trường sản phẩm.\n• Tham gia viết tài liệu API tự động sử dụng Swagger.",
      techStack: ["TypeScript", "Angular", "Express", "Node.js", "MongoDB", "Swagger"],
    },
  ],
  projects: [
    {
      id: "ts_p1",
      title: "Hệ thống Quản trị Monorepo quy mô lớn",
      role: "Kiến trúc sư phần mềm phụ trách cấu trúc monorepo",
      description: "Giải pháp quản trị nhiều dự án nhỏ bằng TypeScript trong một kho lưu trữ duy nhất sử dụng Nx, tối ưu hóa thời gian build thông qua cache cục bộ và đám mây.",
      link: "github.com/tienanh-ts/nx-typescript-monorepo",
      techStack: ["TypeScript", "Nx", "React", "NestJS", "GitHub Actions"],
    },
  ],
  education: [
    {
      id: "ts_e1",
      school: "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
      degree: "Cử nhân",
      fieldOfStudy: "Khoa học Máy tính",
      location: "Quận 5, TP.HCM",
      startDate: "2016-09",
      endDate: "2020-04",
      current: false,
      grade: "GPA: 3.4 / 4.0",
      description: "",
    },
  ],
  skills: [
    {
      id: "ts_s1",
      category: "Kỹ năng cốt lõi",
      skills: ["TypeScript (Deep Level)", "JavaScript", "HTML5/CSS3", "Design Patterns"],
    },
    {
      id: "ts_s2",
      category: "Công nghệ Frontend & Backend",
      skills: ["React", "Next.js", "Node.js", "NestJS", "ExpressJS", "Angular"],
    },
    {
      id: "ts_s3",
      category: "Cơ sở dữ liệu & Công cụ",
      skills: ["PostgreSQL", "MongoDB", "Nx Monorepo", "Docker", "Jest", "CI/CD GitHub Actions"],
    },
  ],
  languages: [
    {
      id: "ts_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "ts_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp trôi chảy (IELTS 7.0)",
    },
  ],
  certifications: [
    {
      id: "ts_c1",
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2023-05",
    },
  ],
  customSections: [],
};
