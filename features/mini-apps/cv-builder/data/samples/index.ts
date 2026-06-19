import { FrontendDevCV, BackendDevCV, LaravelDevCV, TypescriptDevCV } from "./tech";
import { FIFTY_GENERATED_SAMPLES } from "./generated_fifty";
import { SaleBdsCV, SaleTbytCV, SaleOtoCV } from "./sales";
import { DigitalMarketingCV, AdsRunnerCV } from "./marketing";
import { BacSiCV, YTaCV, DuocSiCV } from "./medical";
import { KeToanCV, TaiChinhCV, NganHangCV } from "./finance";
import { KySuCoKhiCV, KySuCoDienCV } from "./engineering";
import { GiaoVienCV, GiaSuCV } from "./education";
import { DesignerCV, MoiTruongCV, VanPhongCV, ChungTuCV, BaoHiemCV, LuatSuCV } from "./services";

// Import Trần Mạnh Hiếu's 10 CVs
import {
  TMHFullstackCV,
  TMHLaravelCV,
  TMHNextjsCV,
  TMHAIResearchCV,
  TMHFresherCV,
  TMHTALLStackCV,
  TMHBackendCV,
  TMHFrontendCV,
  TMHSoftwareEngineerCV,
  TMHLeadCV
} from "./tranmanhhieu";

// Import 15 additional CVs
import {
  ContentWriterCV,
  UIUXDesignerCV,
  DataAnalystCV,
  DevOpsEngineerCV,
  MobileDeveloperCV,
  ProjectManagerCV,
  BusinessAnalystCV,
  HRSpecialistCV,
  EventPlannerCV,
  CustomerServiceCV,
  ContentCreatorCV,
  PhotographerCV,
  ChefCV,
  TourGuideCV,
  EnglishTeacherCV
} from "./additional";

import { CVData } from "../../types/cv";

export interface CVSampleDescriptor {
  id: string;
  name: string;
  category: string;
  data: CVData;
}

export const SAMPLE_TEMPLATES: CVSampleDescriptor[] = [
  // 1. Tech templates
  { id: "frontend", name: "Front-End Developer", category: "Công nghệ thông tin", data: FrontendDevCV },
  { id: "backend", name: "Back-End Developer", category: "Công nghệ thông tin", data: BackendDevCV },
  { id: "laravel", name: "Dev Laravel", category: "Công nghệ thông tin", data: LaravelDevCV },
  { id: "typescript", name: "Dev TypeScript", category: "Công nghệ thông tin", data: TypescriptDevCV },
  
  // 2. Sales templates
  { id: "bds", name: "Nhân viên Sale Bất động sản", category: "Kinh doanh & Bán hàng", data: SaleBdsCV },
  { id: "tbyt", name: "Nhân viên Sale Thiết bị y tế", category: "Kinh doanh & Bán hàng", data: SaleTbytCV },
  { id: "oto", name: "Nhân viên Sale Ô tô", category: "Kinh doanh & Bán hàng", data: SaleOtoCV },
  
  // 3. Marketing templates
  { id: "digital_mkt", name: "Nhân viên Digital Marketing", category: "Marketing & Quảng cáo", data: DigitalMarketingCV },
  { id: "ads_runner", name: "Nhân viên Chạy quảng cáo", category: "Marketing & Quảng cáo", data: AdsRunnerCV },
  
  // 4. Medical templates
  { id: "bac_si", name: "Bác sĩ", category: "Y tế & Chăm sóc sức khỏe", data: BacSiCV },
  { id: "y_ta", name: "Y tá", category: "Y tế & Chăm sóc sức khỏe", data: YTaCV },
  { id: "duoc_si", name: "Dược sĩ", category: "Y tế & Chăm sóc sức khỏe", data: DuocSiCV },
  
  // 5. Finance & Accounting
  { id: "ke_toan", name: "Nhân viên Kế toán", category: "Tài chính & Kế toán", data: KeToanCV },
  { id: "tai_chinh", name: "Nhân viên Tài chính", category: "Tài chính & Kế toán", data: TaiChinhCV },
  { id: "ngan_hang", name: "Nhân viên Ngân hàng", category: "Tài chính & Kế toán", data: NganHangCV },
  
  // 6. Engineering
  { id: "co_khi", name: "Kỹ sư Cơ khí", category: "Kỹ thuật & Sản xuất", data: KySuCoKhiCV },
  { id: "co_dien", name: "Kỹ sư Cơ điện", category: "Kỹ thuật & Sản xuất", data: KySuCoDienCV },
  
  // 7. Education
  { id: "giao_vien", name: "Giáo viên", category: "Giáo dục & Đào tạo", data: GiaoVienCV },
  { id: "gia_su", name: "Gia sư", category: "Giáo dục & Đào tạo", data: GiaSuCV },
  
  // 8. Design & Services & Administration & Logistics & Legal
  { id: "designer", name: "Designer", category: "Thiết kế & Sáng tạo", data: DesignerCV },
  { id: "moi_truong", name: "Nhân viên Môi trường", category: "Dịch vụ công cộng", data: MoiTruongCV },
  { id: "van_phong", name: "Nhân viên Văn phòng", category: "Hành chính & Trợ lý", data: VanPhongCV },
  { id: "chung_tu", name: "Nhân viên Chứng từ", category: "Xuất nhập khẩu & Logistics", data: ChungTuCV },
  { id: "bao_hiem", name: "Nhân viên Bảo hiểm", category: "Tài chính & Dịch vụ", data: BaoHiemCV },
  { id: "luat_si", name: "Luật sư", category: "Luật & Tư vấn pháp lý", data: LuatSuCV },

  // --- 10 Trần Mạnh Hiếu CVs (Trần Mạnh Hiếu Portfolio Data) ---
  { id: "tmh_fullstack", name: "Trần Mạnh Hiếu — Full-stack Developer", category: "Trần Mạnh Hiếu", data: TMHFullstackCV },
  { id: "tmh_laravel", name: "Trần Mạnh Hiếu — Laravel & TALL Specialist", category: "Trần Mạnh Hiếu", data: TMHLaravelCV },
  { id: "tmh_nextjs", name: "Trần Mạnh Hiếu — Next.js & React Developer", category: "Trần Mạnh Hiếu", data: TMHNextjsCV },
  { id: "tmh_ai", name: "Trần Mạnh Hiếu — AI Vision & Web Engineer", category: "Trần Mạnh Hiếu", data: TMHAIResearchCV },
  { id: "tmh_fresher", name: "Trần Mạnh Hiếu — Fresher Web Developer", category: "Trần Mạnh Hiếu", data: TMHFresherCV },
  { id: "tmh_tall", name: "Trần Mạnh Hiếu — TALL Stack Expert", category: "Trần Mạnh Hiếu", data: TMHTALLStackCV },
  { id: "tmh_backend", name: "Trần Mạnh Hiếu — Backend Engineer", category: "Trần Mạnh Hiếu", data: TMHBackendCV },
  { id: "tmh_frontend", name: "Trần Mạnh Hiếu — Frontend Developer", category: "Trần Mạnh Hiếu", data: TMHFrontendCV },
  { id: "tmh_se", name: "Trần Mạnh Hiếu — Software Engineer", category: "Trần Mạnh Hiếu", data: TMHSoftwareEngineerCV },
  { id: "tmh_lead", name: "Trần Mạnh Hiếu — Technical Project Lead", category: "Trần Mạnh Hiếu", data: TMHLeadCV },

  // --- 15 Additional Careers ---
  { id: "content_writer", name: "Content Writer / Copywriter", category: "Marketing & Quảng cáo", data: ContentWriterCV },
  { id: "ui_ux_designer", name: "UI/UX Designer", category: "Thiết kế & Sáng tạo", data: UIUXDesignerCV },
  { id: "data_analyst", name: "Chuyên viên Phân tích Dữ liệu (Data Analyst)", category: "Công nghệ thông tin", data: DataAnalystCV },
  { id: "devops_engineer", name: "Kỹ sư DevOps", category: "Công nghệ thông tin", data: DevOpsEngineerCV },
  { id: "mobile_developer", name: "Lập trình viên Di Động (Mobile Dev)", category: "Công nghệ thông tin", data: MobileDeveloperCV },
  { id: "project_manager", name: "Quản lý Dự án (Project Manager)", category: "Quản lý & Điều phối", data: ProjectManagerCV },
  { id: "business_analyst", name: "Chuyên viên Phân tích Nghiệp vụ (BA)", category: "Công nghệ thông tin", data: BusinessAnalystCV },
  { id: "hr_specialist", name: "Chuyên viên Nhân sự & Tuyển dụng (HR)", category: "Nhân sự & Tuyển dụng", data: HRSpecialistCV },
  { id: "event_planner", name: "Chuyên viên Tổ chức Sự kiện (Event Planner)", category: "Dịch vụ & Sự kiện", data: EventPlannerCV },
  { id: "customer_service", name: "Chăm sóc Khách hàng (Customer Service)", category: "Hành chính & Trợ lý", data: CustomerServiceCV },
  { id: "content_creator", name: "Nhà sáng tạo nội dung số (Content Creator)", category: "Truyền thông & Sáng tạo", data: ContentCreatorCV },
  { id: "photographer", name: "Nhiếp ảnh gia & Dựng phim", category: "Thiết kế & Sáng tạo", data: PhotographerCV },
  { id: "chef", name: "Bếp trưởng điều hành (Chef)", category: "Nhà hàng & Khách sạn", data: ChefCV },
  { id: "tour_guide", name: "Hướng dẫn viên Du lịch Quốc tế", category: "Du lịch & Dịch vụ", data: TourGuideCV },
  { id: "english_teacher", name: "Giáo viên Tiếng Anh", category: "Giáo dục & Đào tạo", data: EnglishTeacherCV },
  ...FIFTY_GENERATED_SAMPLES
];
