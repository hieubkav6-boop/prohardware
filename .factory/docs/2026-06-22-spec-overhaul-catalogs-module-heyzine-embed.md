# Spec: Cải tiến Module Catalogs sang One-Page CRUD & Tối giản hóa

# I. Primer

## 1. TL;DR kiểu Feynman
Thay vì chia nhỏ trang quản lý Catalog thành nhiều trang rườm rà (danh sách, trang tạo mới, trang chỉnh sửa), chúng ta sẽ gộp tất cả lại vào **một trang duy nhất (One-Page CRUD)** giống như trang quản lý Menu. Giao diện quản trị sẽ cực kỳ tinh gọn: bên trái là danh sách kéo thả sắp xếp thứ tự và các nút bật/tắt nhanh, bên phải là form thêm/sửa gọn nhẹ. Các trường thừa thãi như Thumbnail (không hiển thị) và SEO Meta (tự động hóa) sẽ bị loại bỏ hoàn toàn để admin không phải nhập thủ công phiền phức.

## 2. Elaboration & Self-Explanation
Catalog bản chất là một danh sách tài liệu sách lật lặp lại trên duy nhất một trang `/catalogs`. Việc thiết kế hệ thống CRUD phân trang phức tạp là không cần thiết.
Chúng ta sẽ thực hiện tinh giản hóa:
- **Loại bỏ các trường dư thừa:** Bỏ hoàn toàn ảnh đại diện (Thumbnail) và SEO Meta trong form nhập liệu. SEO Meta sẽ được tự động tạo dựa trên tiêu đề của Catalog (Ví dụ: `metaTitle = title + " | AAA Pro Hardware"`, `metaDescription = description`).
- **Gộp giao diện CRUD về 1 trang:** Trang `/admin/catalogs` sẽ chia làm 2 cột:
  - Cột trái: Danh sách các Catalog, kéo thả Dnd để sắp xếp thứ tự nhanh, có công tắc/nút check bật tắt Hiện/Ẩn và Nổi bật nhanh không cần tải lại trang.
  - Cột phải: Form động. Mặc định là Form thêm mới, khi click nút "Sửa" ở danh sách bên trái, form sẽ chuyển thành "Chỉnh sửa" với dữ liệu tương ứng.
- **Xóa bỏ các file con thừa:** Xóa các thư mục con `/admin/catalogs/[id]/edit` và `/admin/catalogs/create` để vệ sinh workspace.
- **Cập nhật config module:** Sửa file cấu hình module `/system/modules/catalogs` để ẩn các trường đã bị loại bỏ.

## 3. Concrete Examples & Analogies
- **Ví dụ cụ thể:** Admin muốn tạo một Catalog mới. Họ chỉ cần nhập Tiêu đề và dán link Heyzine vào form ở cột bên phải rồi bấm "Tạo mới". Catalog lập tức xuất hiện ở danh sách bên trái. Họ có thể kéo nó lên trên đầu để hiển thị trước, hoặc click công tắc để tạm ẩn đi ngay lập tức.
- **Analogy:** Thay vì đi làm thủ tục hành chính ở nhiều phòng ban (mở nhiều trang), chúng ta đến cơ chế "một cửa" (One-Page CRUD) nơi mọi việc từ điền tờ khai, nộp hồ sơ, duyệt và nhận kết quả đều diễn ra tại một bàn duy nhất.

---

# II. Audit Summary (Tóm tắt kiểm tra)
- **Cấu hình Menu Admin:** Sidebar liên kết đến `/admin/catalogs`.
- **Cấu hình Module:** `@/lib/modules/configs/catalogs.config.ts` chứa cấu hình các trường runtimeConfig.
- **Các file thừa cần xóa:**
  - `app/admin/catalogs/create/page.tsx`
  - `app/admin/catalogs/[id]/edit/page.tsx`
  - `app/admin/catalogs/components/CatalogForm.tsx` (gộp code form vào trang chính)

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Triệu chứng:** Giao diện CRUD cũ quá cồng kềnh, nhiều trường dữ liệu thừa (thumbnail không hiển thị ở client, SEO bắt nhập thủ công tốn thời gian), phân tán qua nhiều route gây khó quản lý và không mượt mà.
- **Độ tin cậy:** High (Dựa trực tiếp trên phản hồi thực tế của người dùng).

---

# IV. Proposal (Đề xuất)
1. **Tinh giản config module:** Sửa `lib/modules/configs/catalogs.config.ts` để loại bỏ `thumbnail`, `metaTitle`, `metaDescription` khỏi cấu hình.
2. **Xây dựng One-Page CRUD:** Viết lại toàn bộ `app/admin/catalogs/page.tsx` theo thiết kế 2 cột:
   - Bên trái: Danh sách sắp xếp Dnd.
   - Bên phải: Card form Thêm/Sửa inline.
3. **Xóa tệp dư thừa:** Xóa bỏ hoàn toàn các file trang `create`, `edit` riêng lẻ.
4. **Tự động hóa SEO:** Cập nhật API client `/catalogs/[slug]/page.tsx` để tự sinh metaTitle và metaDescription từ title và description của Catalog thay vì đọc từ db.

---

# V. Files Impacted (Tệp bị ảnh hưởng)

### Sửa:
1. [lib/modules/configs/catalogs.config.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/lib/modules/configs/catalogs.config.ts)
   - Tối giản hóa runtimeConfig, loại bỏ trường thumbnail và SEO.
2. [app/admin/catalogs/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/catalogs/page.tsx)
   - Viết lại thành trang quản trị One-Page CRUD 2 cột (Danh sách + Form inline).
3. [app/(site)/catalogs/[slug]/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/%28site%29/catalogs/%5Bslug%5D/page.tsx)
   - Cập nhật hàm `generateMetadata` để tự động sinh SEO dựa trên dữ liệu Catalog.

### Xóa:
1. [app/admin/catalogs/create/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/catalogs/create/page.tsx)
2. [app/admin/catalogs/[id]/edit/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/catalogs/%5Bid%5D/edit/page.tsx)
3. [app/admin/catalogs/components/CatalogForm.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/catalogs/components/CatalogForm.tsx)

---

# VI. Execution Preview (Xem trước thực thi)
1. Cập nhật file cấu hình module `catalogs.config.ts`.
2. Viết lại trang `app/admin/catalogs/page.tsx` với giao diện One-Page CRUD.
3. Xóa các file thừa trong thư mục `/admin/catalogs`.
4. Cập nhật tự động hóa SEO trong `app/(site)/catalogs/[slug]/page.tsx`.
5. Chạy test typecheck để đảm bảo không lỗi biên dịch.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Chạy `bunx tsc --noEmit` toàn bộ dự án để đảm bảo không lỗi kiểu dữ liệu.
- Kiểm tra giao diện admin và client sau khi thay đổi để đảm bảo hoạt động trơn tru.

---

# VIII. Todo
- [ ] Cập nhật file cấu hình `lib/modules/configs/catalogs.config.ts`
- [ ] Viết lại trang `app/admin/catalogs/page.tsx` với giao diện One-Page CRUD
- [ ] Xóa các tệp dư thừa: `create/page.tsx`, `[id]/edit/page.tsx`, `components/CatalogForm.tsx`
- [ ] Cập nhật tự động hóa SEO trong `app/(site)/catalogs/[slug]/page.tsx`
- [ ] Xác minh và biên dịch TypeScript toàn dự án
- [ ] Chạy âm báo "Done, Sir."

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Trang `/admin/catalogs` hoạt động trên duy nhất 1 trang (One-Page CRUD), hiển thị danh sách kéo thả bên trái và form thêm/sửa bên phải.
- Form chỉnh sửa và danh sách không còn các trường `thumbnail`, `metaTitle`, `metaDescription`.
- Các nút bật/tắt (Ẩn/Hiện, Nổi bật) hoạt động trực tiếp ngay tại danh sách mà không cần chuyển trang.
- SEO của trang chi tiết catalog vẫn được tự động điền đầy đủ dựa trên tiêu đề và mô tả.
- Không có lỗi build hay lỗi TypeScript.
