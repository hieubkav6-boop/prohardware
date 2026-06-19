# I. Primer

## 1. TL;DR kiểu Feynman
* CV Builder là một công cụ giúp người dùng tự thiết kế và xuất bản sơ yếu lý lịch (CV) chuyên nghiệp trực tiếp trên trình duyệt.
* Thay vì chạy độc lập, ta sẽ tích hợp CV Builder vào hệ thống **Vietadmin** để biến nó thành **Mini App thứ hai** (bên cạnh Kanban).
* Dữ liệu CV của người dùng được lưu trữ tạm thời tại trình duyệt của họ (`localStorage`), giúp giảm tải cho server và không cần cấu hình cơ sở dữ liệu (Database) phức tạp.
* Việc in ấn và xuất file PDF được xử lý hoàn toàn ở máy khách (Client-side) thông qua hai thư viện hỗ trợ chụp màn hình (`html2canvas-pro`) và tạo văn bản PDF (`jspdf`).

## 2. Elaboration & Self-Explanation
* Khi tích hợp vào Vietadmin, hệ thống Mini App đã có sẵn một cơ chế quản lý và hiển thị thống nhất:
  * Mỗi ứng dụng nhỏ (Mini App) được định nghĩa trong một danh mục đăng ký trung tâm (`lib/mini-apps/registry.ts`).
  * Khi quản trị viên mở trang quản lý ứng dụng, hệ thống sẽ gọi một hàm đặc biệt (`ensureDefaults`) để tự động lưu thông tin Mini App mới vào cơ sở dữ liệu Convex.
  * Bộ giải mã hiển thị (`MiniAppHost.tsx`) sẽ kiểm tra loại ứng dụng (`appType`). Nếu loại là `'cv-builder'`, nó sẽ kích hoạt giao diện chỉnh sửa CV của chúng ta.
* Để hỗ trợ hiển thị CV ở cả hai chế độ (quản trị admin và trang công khai public), ta sẽ tạo thêm một trang công khai tại địa chỉ `/cv-builder` tương tự như ứng dụng Kanban hiện tại.

## 3. Concrete Examples & Analogies
* Hãy tưởng tượng hệ thống Vietadmin giống như một chiếc điện thoại thông minh (Smartphone). Hệ thống Mini Apps là các ứng dụng (Apps) được cài đặt trên đó.
* Trước đây, chúng ta chỉ có ứng dụng **Kanban** (quản lý công việc). Bây giờ, chúng ta mang ứng dụng **CV Builder** (thiết kế CV) từ một thư mục khác cài đặt vào điện thoại này.
* Thay vì thiết lập một tủ hồ sơ lớn trên mạng (Cloud Database) để lưu trữ mọi CV, ứng dụng này hoạt động giống như một cuốn sổ ghi chép cá nhân (localStorage) được cất trong ngăn kéo của riêng người dùng. Khi họ cần, họ có thể nhấn nút "In" (Export PDF) để máy in tại chỗ tự động in ra bản giấy hoặc lưu thành file tài liệu.

---

# II. Audit Summary (Tóm tắt kiểm tra)
* **Hiện trạng hệ thống Mini Apps**:
  * Các Mini App được định nghĩa tĩnh trong [registry.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/lib/mini-apps/registry.ts).
  * Backend Convex tự động đồng bộ qua mutation `ensureDefaults` trong [convex/miniApps.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/miniApps.ts).
  * Admin rendering được bọc trong [AdminMiniAppHost.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/AdminMiniAppHost.tsx) và định tuyến qua [MiniAppHost.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/MiniAppHost.tsx).
* **Đánh giá mã nguồn CV Builder gốc (`E:\stondy\CV-builder`)**:
  * Giao diện chính nằm ở `src/app/page.tsx` (nặng ~104KB, chứa toàn bộ UI soạn thảo, các tab chỉnh sửa thông tin cá nhân, kinh nghiệm, học vấn, kỹ năng...).
  * Các template hiển thị CV nằm ở `src/components/CVTemplates.tsx` (~95KB) và bộ chuyển đổi template nằm ở `src/components/CVPreview.tsx` (~13KB).
  * Thư viện sử dụng: `html2canvas-pro` (để chụp ảnh vùng hiển thị CV) và `jspdf` (để đóng gói ảnh thành file PDF A4).
  * Dự án Vietadmin hiện tại **chưa cài đặt** `html2canvas-pro` và `jspdf`. Cần cài bổ sung để tính năng tải PDF không bị lỗi.

---

# III. Root Cause & Counter-Hypothesis (Hiện trạng & Giải pháp tích hợp)
* **Câu hỏi**: Có nên lưu dữ liệu CV lên cơ sở dữ liệu Convex DB hay không?
  * *Giải pháp 1 (Lưu Convex)*: Tạo bảng `cvData` trong schema Convex, liên kết với `userId`. Người dùng đăng nhập có thể đồng bộ CV qua lại.
    * *Đánh giá*: Phức tạp, tốn tài nguyên DB băng thông rộng, phá vỡ cấu trúc độc lập của CV-builder gốc (đang hoàn toàn xử lý client-side offline).
  * *Giải pháp 2 (Lưu LocalStorage - Khuyên dùng)*: Giữ nguyên cơ chế lưu trữ offline bằng `localStorage` như CV-builder gốc. Điều này tuân thủ tuyệt đối triết lý **KISS** (Giữ mọi thứ đơn giản) và **YAGNI** (Chưa cần thiết thì không vẽ thêm).
    * *Đóng góp*: Dễ tích hợp, độ tin cậy cao, có thể nâng cấp đồng bộ cloud sau này nếu người dùng yêu cầu thực sự.

---

# IV. Proposal (Đề xuất)
1. **Cài đặt các gói phụ trợ**: Thêm `html2canvas-pro` và `jspdf` vào dependency của Vietadmin.
2. **Khai báo Mini App mới**:
   * Thêm definition cho `cv-builder` vào danh sách `MINI_APP_DEFINITIONS` trong `lib/mini-apps/registry.ts`.
3. **Sao chép và cấu trúc lại mã nguồn CV Builder**:
   * Tạo thư mục `features/mini-apps/cv-builder`.
   * Di chuyển và refactor các file từ dự án CV-builder sang thư mục này, bao gồm:
     * `types/cv.ts` -> Lưu trữ kiểu dữ liệu CV.
     * `data/sample.ts` và `data/samples/...` -> Dữ liệu mẫu CV các ngành nghề.
     * `lib/toast.tsx` -> Wrapper thông báo (giữ nguyên để tránh lỗi import).
     * `components/CVTemplates.tsx` & `components/CVPreview.tsx` -> Các mẫu CV và trình hiển thị.
     * `CVBuilderMiniApp.tsx` (chuyển đổi từ `src/app/page.tsx` gốc) -> Giao diện chỉnh sửa CV.
4. **Liên kết với Mini App Host**:
   * Sửa `features/mini-apps/MiniAppHost.tsx` để render `CVBuilderMiniApp` khi `appType === 'cv-builder'`.
5. **Cung cấp Router công khai**:
   * Tạo trang `app/cv-builder/page.tsx` để người dùng có thể truy cập CV Builder từ đường dẫn gốc `/cv-builder` (nếu cấu hình `routeMode` là `root`).

---

# V. Files Impacted (Tệp bị ảnh hưởng)

### Nhóm Cấu hình & Host chính
* `lib/mini-apps/registry.ts` [Sửa]:
  * Thêm cấu hình đăng ký cho `cv-builder` vào `MINI_APP_DEFINITIONS`.
  * Đăng ký nhãn hiển thị trong `MINI_APP_TYPE_LABELS`.
* `features/mini-apps/MiniAppHost.tsx` [Sửa]:
  * Import `CVBuilderMiniApp` và thêm nhánh kiểm tra `appType === 'cv-builder'`.

### Nhóm Thêm mới (CV Builder Module)
* `features/mini-apps/cv-builder/types/cv.ts` [Thêm mới]: Định nghĩa kiểu dữ liệu.
* `features/mini-apps/cv-builder/data/sample.ts` [Thêm mới]: Cài đặt ban đầu mặc định.
* `features/mini-apps/cv-builder/data/samples/` [Thêm mới]: Thư mục chứa 11 mẫu dữ liệu các ngành nghề.
* `features/mini-apps/cv-builder/lib/toast.tsx` [Thêm mới]: Hỗ trợ thông báo Toast tương thích.
* `features/mini-apps/cv-builder/components/CVTemplates.tsx` [Thêm mới]: Định nghĩa 10 giao diện CV.
* `features/mini-apps/cv-builder/components/CVPreview.tsx` [Thêm mới]: Trình xử lý hiển thị và in ấn/tải PDF.
* `features/mini-apps/cv-builder/CVBuilderMiniApp.tsx` [Thêm mới]: UI trang soạn thảo CV chính.

### Nhóm Router Public
* `app/cv-builder/page.tsx` [Thêm mới]: Route root cho phép truy cập công khai từ `/cv-builder`.

---

# VI. Execution Preview (Xem trước thực thi)
1. Chạy lệnh cài đặt thư viện phụ thuộc: `bun add html2canvas-pro jspdf`.
2. Tạo thư mục cấu trúc cho CV-Builder trong `features/mini-apps/cv-builder`.
3. Sao chép và hiệu chỉnh các file mã nguồn (chuyển đổi absolute imports sang relative hoặc alias phù hợp).
4. Cập nhật `registry.ts` và `MiniAppHost.tsx`.
5. Tạo file route public `app/cv-builder/page.tsx`.
6. Khởi chạy dev server để hệ thống tự động chạy mutation Convex `ensureDefaults` đồng bộ app vào DB.
7. Kiểm tra hiển thị và tính năng.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)

### Kiểm tra tự động / Tĩnh
* Chạy `bunx tsc --noEmit` để đảm bảo không có lỗi TypeScript (đặc biệt là các kiểu dữ liệu của React 19 và các import mới).

### Kiểm tra thủ công
1. Mở trang System Modules: `http://localhost:3000/system/mini-apps`
   * Xác nhận app `CV Builder Mini App` hiển thị trong danh sách.
   * Thử thay đổi trạng thái bật/tắt hoặc route mode và lưu lại để kiểm tra đồng bộ Convex.
2. Mở trang Admin Workspace: `http://localhost:3000/admin/mini-apps`
   * Xác nhận thẻ card CV Builder xuất hiện.
   * Nhấn "Mở Admin" để truy cập `/admin/mini-apps/cv-builder`.
3. Kiểm tra chức năng CV Builder:
   * Thử đổi mẫu CV ngành nghề (Tech, Marketing, Sales...) -> Kiểm tra xem dữ liệu có thay đổi và toast thông báo thành công.
   * Thử chỉnh sửa thông tin cá nhân, thêm bớt kinh nghiệm làm việc.
   * Nhấn nút "Tải PDF" -> Xác nhận file PDF được tạo và tải xuống thành công, định dạng hiển thị chính xác.
4. Kiểm tra trang công khai:
   * Mở `http://localhost:3000/cv-builder`.
   * Xác nhận ứng dụng hiển thị bình thường ở chế độ standalone công khai.

---

# VIII. Todo
* [ ] Chạy lệnh cài đặt `html2canvas-pro` và `jspdf` qua `run_command`.
* [ ] Tạo thư mục `features/mini-apps/cv-builder` và các thư mục con `components`, `data`, `data/samples`, `lib`, `types`.
* [ ] Sao chép các tệp tin từ `E:\stondy\CV-builder\src` sang các vị trí tương ứng.
* [ ] Cập nhật file `lib/mini-apps/registry.ts`.
* [ ] Cập nhật file `features/mini-apps/MiniAppHost.tsx`.
* [ ] Tạo file `app/cv-builder/page.tsx`.
* [ ] Chạy thử nghiệm và sửa lỗi type hoặc lỗi biên dịch (nếu có).

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* [x] CV Builder chạy trơn tru bên trong khung quản trị Admin của Vietadmin mà không gây lỗi vỡ layout.
* [x] Việc đổi template và chỉnh sửa dữ liệu được lưu tức thì vào `localStorage` của trình duyệt.
* [x] Tính năng "Tải PDF" hoạt động tốt, tải xuống đúng file PDF chất lượng cao.
* [x] Truy cập được thông qua cả route admin (`/admin/mini-apps/cv-builder`) và route public (`/cv-builder`).
* [x] Không làm ảnh hưởng hay gây lỗi đến Mini App Kanban hiện tại.

---

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro**: Lỗi TypeScript do phiên bản React 19 trong dự án Vietadmin khắt khe hơn dự án CV-builder cũ, hoặc xung đột CSS Tailwind.
* **Hoàn tác**: Sử dụng Git để khôi phục nhanh:
  * `git checkout -- lib/mini-apps/registry.ts features/mini-apps/MiniAppHost.tsx`
  * Xóa thư mục `features/mini-apps/cv-builder` và `app/cv-builder`.

---

# XI. Out of Scope (Ngoài phạm vi)
* Lưu trữ dữ liệu CV trực tiếp trên Convex DB (Cloud).
* Tính năng chia sẻ CV trực tuyến qua link tĩnh (chỉ hỗ trợ xuất file PDF).
