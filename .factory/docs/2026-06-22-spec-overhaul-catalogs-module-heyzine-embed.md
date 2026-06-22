# Spec: Cải tiến Module Catalogs sang dạng Thư viện SPA & Bỏ Heyzine

# I. Primer

## 1. TL;DR kiểu Feynman
Chúng ta sẽ chuyển trang hiển thị Catalog `/catalogs` thành giao diện **Thư viện số chạy trên một trang duy nhất (Single Page App - SPA)** giống như dự án `Ca-Mau-DST-Digital-Library`. Trang sẽ gồm: một Sidebar bên trái liệt kê danh mục catalog, và màn hình chính bên phải hiển thị trực tiếp sách lật lướt trang mượt mà (sử dụng ảnh trích xuất từ PDF gốc thông qua thư viện `react-pageflip`). Chúng ta sẽ loại bỏ hoàn toàn mã nhúng Heyzine Flipbook (iframe ngoài gây load cực kỳ chậm và nặng).

## 2. Elaboration & Self-Explanation
Hiện trạng trang `/catalogs` bị load chậm là do việc nhúng nhiều iframe Heyzine Flipbook cùng lúc. Mỗi iframe Heyzine tải hàng tá file JS, CSS và render 3D độc lập, dẫn đến đơ trình duyệt và tốn băng thông.

Giải pháp tối ưu:
- **Bỏ hoàn toàn Heyzine:** Không sử dụng link nhúng Heyzine. Quay lại dùng file PDF và tự động trích xuất các trang thành ảnh JPEG trên Convex Storage.
- **Khôi phục PDF extraction ở Admin:** Trong form Admin, trường file PDF sẽ là bắt buộc khi tạo mới. Hệ thống sẽ tự động dùng thư viện `pdfjs-dist` tại client để cắt từng trang PDF thành ảnh rồi tải lên Convex, lưu trữ vào mảng `pageImages`.
- **Giao diện Client dạng SPA (1 trang duy nhất):** Trang `/catalogs` sẽ chia làm 2 phần:
  - **Bên trái (Sidebar):** Danh sách các Catalog đang bật hiển thị. Khi click chọn catalog nào, catalog đó sẽ chuyển sang trạng thái active. Hệ thống tự động chọn catalog đầu tiên khi mở trang.
  - **Bên phải (Main Viewer):** Hiển thị sách lật `CatalogFlipbook` dùng chính các ảnh trích xuất từ `pageImages` của catalog được chọn. Có nút tải bản PDF gốc. Không chuyển hướng trang, không iframe Heyzine, load cực kỳ nhanh.
- **Admin One-Page CRUD:** Vẫn giữ nguyên trang CRUD tinh gọn 1 trang tại `/admin/catalogs` nhưng khôi phục trường PDF bắt buộc và bỏ trường nhập Heyzine URL.

## 3. Concrete Examples & Analogies
- **Ví dụ cụ thể:** Khi khách hàng truy cập `/catalogs`, họ sẽ thấy ngay cuốn Catalog đầu tiên được mở ra ở giữa màn hình để đọc ngay lập tức. Bên cạnh có một menu danh sách. Họ muốn xem catalog khác chỉ việc click vào tên catalog đó trong menu, trang sách lật ở giữa sẽ đổi nội dung tức thì không cần load lại toàn bộ trang.
- **Analogy:** Thay vì phát nhiều video Youtube cùng lúc trên một màn hình gây đơ máy, chúng ta thiết kế một danh sách phát (playlist) bên cạnh và một trình phát video duy nhất ở giữa. Click vào đâu thì phát video đó.

---

# II. Audit Summary (Tóm tắt kiểm tra)
- **Đường dẫn client:** Trang `/catalogs` sẽ là trang SPA duy nhất chứa Sidebar và Flipbook Viewer. Trang `/catalogs/[slug]` không cần thiết nữa và có thể chuyển hướng về trang `/catalogs` hoặc hiển thị catalog tương ứng.
- **Cấu hình database:** S schema Convex bảng `catalogs` cần khôi phục `pdfStorageId` là bắt buộc và bỏ trường `embedUrl`.
- **Thư viện PDF.js:** Trình trích xuất PDF sang ảnh ở client cần hoạt động ổn định và tích hợp mượt mà trong form.

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Triệu chứng:** Trang `/catalogs` load cực kỳ lâu, đơ trình duyệt.
- **Nguyên nhân chính:** Do render đồng thời nhiều iframe Heyzine Flipbook ngoài. Tải Heyzine CDN và logic 3D lặp lại quá nhiều lần.
- **Độ tin cậy:** High (Đã được xác minh).

---

# IV. Proposal (Đề xuất)
1. **Schema Convex:** Cập nhật `convex/schema.ts` khôi phục `pdfStorageId: v.id("_storage")` và bỏ `embedUrl`.
2. **API CRUD Convex:** Cập nhật `convex/catalogs.ts` mutation `create` và `update` tương ứng, loại bỏ tham số `embedUrl`.
3. **Cấu hình Module:** Cập nhật `lib/modules/configs/catalogs.config.ts` loại bỏ trường `embedUrl`.
4. **Admin One-Page CRUD:** Cập nhật `app/admin/catalogs/page.tsx` gộp lại luồng xử lý trích xuất PDF tự động (`processAndUploadPdf`) và loại bỏ input Heyzine URL.
5. **Giao diện Client SPA:** Thiết kế lại `app/(site)/catalogs/page.tsx` thành layout 2 phần: Sidebar chọn Catalog và Main Container hiển thị sách lật `CatalogFlipbook`.

---

# V. Files Impacted (Tệp bị ảnh hưởng)

### Sửa:
1. [convex/schema.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/convex/schema.ts)
   - Khôi phục `pdfStorageId` bắt buộc, bỏ `embedUrl`.
2. [convex/catalogs.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/convex/catalogs.ts)
   - Cập nhật mutation `create` và `update` để bỏ `embedUrl`.
3. [lib/modules/configs/catalogs.config.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/lib/modules/configs/catalogs.config.ts)
   - Cập nhật fields config của module.
4. [app/admin/catalogs/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/catalogs/page.tsx)
   - Tích hợp trích xuất PDF tự động vào form CRUD, loại bỏ input Heyzine URL.
5. [app/(site)/catalogs/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/%28site%29/catalogs/page.tsx)
   - Chuyển thành giao diện SPA Thư viện sách lật (Sidebar + Viewer).

---

# VI. Execution Preview (Xem trước thực thi)
1. Cập nhật schema Convex và mutation API.
2. Cấu hình lại module `catalogs.config.ts`.
3. Cập nhật trang quản lý admin `app/admin/catalogs/page.tsx`.
4. Viết lại trang client `app/(site)/catalogs/page.tsx`.
5. Review và biên dịch kiểm tra lỗi TypeScript.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Chạy `bunx tsc --noEmit` toàn bộ dự án để đảm bảo không lỗi kiểu dữ liệu.
- Kiểm tra giao diện admin và client sau khi thay đổi để đảm bảo hoạt động trơn tru.

---

# VIII. Todo
- [ ] Cập nhật schema Convex trong `convex/schema.ts`
- [ ] Cập nhật API CRUD trong `convex/catalogs.ts`
- [ ] Cập nhật cấu hình module `lib/modules/configs/catalogs.config.ts`
- [ ] Viết lại trang admin `app/admin/catalogs/page.tsx`
- [ ] Viết lại trang client `app/(site)/catalogs/page.tsx`
- [ ] Xác minh và biên dịch TypeScript toàn dự án
- [ ] Chạy âm báo "Done, Sir."

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Trang client `/catalogs` hoạt động dạng SPA: Sidebar chọn catalog bên trái, Flipbook lật trang bằng hình ảnh (react-pageflip) hiển thị mượt mà bên phải.
- Form admin CRUD One-Page yêu cầu file PDF bắt buộc khi tạo mới và tự động trích xuất các trang ảnh khi lưu.
- Link nhúng Heyzine Flipbook bị loại bỏ hoàn toàn khỏi schema, form nhập liệu và UI hiển thị.
- Biên dịch TypeScript thành công, không lỗi.
