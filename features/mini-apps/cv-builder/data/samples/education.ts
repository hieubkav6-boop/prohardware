import { CVData } from "../../types/cv";

export const GiaoVienCV: CVData = {
  personalInfo: {
    name: "Lê Thị Mai",
    title: "Giáo viên Tiểu học (Chủ nhiệm & Giảng dạy)",
    email: "lemai.pedagogy@gmail.com",
    phone: "(+84) 978 666 888",
    location: "Cầu Giấy, Hà Nội",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/giao_vien.png",
  },
  summary: "Giáo viên Tiểu học tận tâm, yêu trẻ với hơn 5 năm kinh nghiệm giảng dạy tại Trường Tiểu học thực nghiệm Đoàn Thị Điểm. Có phương pháp sư phạm tích cực, sáng tạo giúp học sinh hứng thú học tập và phát triển toàn diện. Giao tiếp cởi mở, phối hợp chặt chẽ với phụ huynh học sinh.",
  workExperience: [
    {
      id: "edu_tea_w1",
      company: "Trường Tiểu học Đoàn Thị Điểm",
      position: "Giáo viên Chủ nhiệm lớp 3",
      location: "Hà Nội",
      startDate: "2021-08",
      endDate: "Hiện tại",
      current: true,
      description: "• Giảng dạy các môn Toán, Tiếng Việt, Tự nhiên Xã hội theo chương trình giáo dục phổ thông mới (GDPT 2018) cho lớp chủ nhiệm 40 học sinh.\n• Thiết kế hơn 100 bài giảng điện tử sinh động sử dụng slide PowerPoint và các trò chơi tương tác (Kahoot, Quizizz), giúp tăng sự tập trung học tập của học sinh lên 30%.\n• Tổ chức thành công các hoạt động ngoại khóa trải nghiệm thực tế ngoài nhà trường và duy trì kênh thông tin liên lạc thường xuyên hàng tuần với phụ huynh qua sổ liên lạc điện tử.",
      techStack: ["Soạn giáo án điện tử", "Phương pháp GDPT 2018", "Tâm lý học tiểu học"],
    },
    {
      id: "edu_tea_w2",
      company: "Trường Tiểu học Dân lập Ban Mai",
      position: "Giáo viên Đứng lớp khối 2",
      location: "Hà Nội",
      startDate: "2019-08",
      endDate: "2021-06",
      current: false,
      description: "• Soạn thảo kế hoạch bài dạy chi tiết hàng tuần và trực tiếp giảng dạy theo phân phối chương trình của Bộ Giáo dục.\n• Đánh giá định kỳ năng lực và phẩm chất của học sinh theo thông tư hướng dẫn của ngành.\n• Tổ chức kèm cặp bồi dưỡng riêng cho các học sinh gặp khó khăn trong việc tiếp thu môn Toán và tập đọc.",
      techStack: ["Phương pháp sư phạm", "Soạn bài giảng PowerPoint", "Kèm cặp học sinh"],
    },
  ],
  projects: [],
  education: [
    {
      id: "edu_tea_e1",
      school: "Đại học Sư phạm Hà Nội",
      degree: "Cử nhân",
      fieldOfStudy: "Giáo dục Tiểu học",
      location: "Cầu Giấy, Hà Nội",
      startDate: "2015-09",
      endDate: "2019-06",
      current: false,
      grade: "Xếp loại: Giỏi",
      description: "Đạt giải nhì nghiệp vụ sư phạm cấp khoa năm 2018.",
    },
  ],
  skills: [
    {
      id: "edu_tea_s1",
      category: "Kỹ năng sư phạm",
      skills: ["Thiết kế bài giảng điện tử", "Tổ chức trò chơi lớp học", "Phương pháp dạy học tích cực", "Quản lý lớp học chủ nhiệm", "Xử lý tình huống sư phạm"],
    },
    {
      id: "edu_tea_s2",
      category: "Kỹ năng mềm",
      skills: ["Yêu thương kiên nhẫn với trẻ", "Giao tiếp với phụ huynh tốt", "Thuyết trình truyền cảm hứng", "Lập kế hoạch tuần"],
    },
  ],
  languages: [
    {
      id: "edu_tea_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
    {
      id: "edu_tea_l2",
      name: "Tiếng Anh",
      proficiency: "Giao tiếp cơ bản (B1)",
    },
  ],
  certifications: [
    {
      id: "edu_tea_c1",
      name: "Chứng chỉ Đào tạo Chuẩn nghề nghiệp Giáo viên Tiểu học hạng III",
      issuer: "Đại học Sư phạm Hà Nội",
      date: "2022-11",
    },
  ],
  customSections: [],
};

export const GiaSuCV: CVData = {
  personalInfo: {
    name: "Vũ Minh Quân",
    title: "Gia sư môn Toán & Vật lý (Lớp 9 - Lớp 12)",
    email: "minhquan.tutor@gmail.com",
    phone: "(+84) 932 111 000",
    location: "Quận 5, TP. Hồ Chí Minh",
    website: "",
    github: "",
    linkedin: "",
    avatar: "/avatars/giao_vien.png",
  },
  summary: "Gia sư tự do giàu kinh nghiệm với hơn 3 năm đồng hành cùng học sinh cấp 2 và cấp 3 ôn thi chuyển cấp và thi tốt nghiệp THPT Quốc gia môn Toán & Vật lý. Phương pháp giảng dạy cô đọng, dễ hiểu, bám sát cấu trúc đề thi và tập trung phát triển tư duy giải đề nhanh cho học sinh.",
  workExperience: [
    {
      id: "edu_tut_w1",
      company: "Trung tâm Gia sư Tâm Trí",
      position: "Gia sư Luyện thi Toán - Lý",
      location: "TP. Hồ Chí Minh",
      startDate: "2022-09",
      endDate: "Hiện tại",
      current: true,
      description: "• Trực tiếp dạy kèm nhóm nhỏ (3-5 học sinh) và 1-kèm-1 cho hơn 25 học sinh chuẩn bị thi vào lớp 10 chuyên và kỳ thi tốt nghiệp THPT Quốc gia.\n• Đánh giá năng lực học tập đầu vào của từng học sinh, biên soạn giáo án cá nhân hóa giúp 90% học sinh tăng từ 1.5 - 3.0 điểm số trung bình môn học sau 3 tháng theo học.\n• Hướng dẫn chi tiết các mẹo tính nhanh trắc nghiệm bằng máy tính cầm tay Casio, giúp học sinh tiết kiệm 40% thời gian làm bài thi trắc nghiệm.",
      techStack: ["Giải toán trắc nghiệm nhanh", "Biên soạn đề thi thử", "Casio Math Tricks"],
    },
  ],
  projects: [],
  education: [
    {
      id: "edu_tut_e1",
      school: "Đại học Sư phạm TP. Hồ Chí Minh",
      degree: "Sinh viên năm cuối",
      fieldOfStudy: "Sư phạm Toán học",
      location: "Quận 5, TP.HCM",
      startDate: "2022-09",
      endDate: "Hiện tại",
      current: true,
      grade: "GPA hiện tại: 3.4 / 4.0",
      description: "Đạt danh hiệu Sinh viên 5 tốt cấp trường năm học 2023 - 2024.",
    },
  ],
  skills: [
    {
      id: "edu_tut_s1",
      category: "Kỹ năng giảng dạy",
      skills: ["Tóm tắt kiến thức sơ đồ tư duy", "Giải đề thi tốt nghiệp THPT Quốc gia", "Sử dụng máy tính Casio giải toán", "Khơi gợi hứng thú tự học", "Kiên nhẫn giải đáp thắc mắc"],
    },
  ],
  languages: [
    {
      id: "edu_tut_l1",
      name: "Tiếng Việt",
      proficiency: "Bản xứ",
    },
  ],
  certifications: [
    {
      id: "edu_tut_c1",
      name: "Đạt 26.5 điểm khối A00 kỳ thi THPT Quốc gia năm 2022",
      issuer: "Bộ Giáo dục và Đào tạo",
      date: "2022-07",
    },
  ],
  customSections: [],
};
