# Spec: Cải tiến Module Catalogs & Nhúng Heyzine Flipbook

# I. Primer

## 1. TL;DR kiểu Feynman
Chúng ta sẽ nâng cấp trang hiển thị tài liệu giới thiệu sản phẩm (Catalog) từ dạng ô ảnh tĩnh sang dạng sách lật sinh động nhúng trực tiếp. Thay vì bắt máy tính của người quản trị phải vất vả cắt nhỏ file PDF ra thành từng trang ảnh rất nặng và dễ lỗi, chúng ta cho phép dán trực tiếp link nhúng của dịch vụ làm sách lật chuyên nghiệp **Heyzine Flipbooks**. Trang `/catalogs` sẽ hiển thị trực quan các sách lật xếp dọc nối tiếp nhau, người dùng có thể lật trang trực tiếp và bấm nút tải PDF nếu muốn.

## 2. Elaboration & Self-Explanation
Hệ thống Catalog hiện tại đang sử dụng luồng: Tải file PDF lên -> Dùng thư viện `pdfjs-dist` tại client để render từng trang PDF thành canvas -> Chuyển canvas sang Blob ảnh JPEG -> Tải từng ảnh này lên Convex Storage -> Dùng `react-pageflip` để hiển thị hiệu ứng lật trang ở client.
Cơ chế này có các nhược điểm nghiêm trọng:
- Quá trình chuyển đổi PDF sang ảnh ở client ngốn cực nhiều CPU và RAM của máy quản trị, dễ gây crash trình duyệt khi file PDF có chất lượng cao (nặng hàng chục MB).
- Lỗi CORS hoặc lỗi kết nối khi tải worker của PDF.js từ CDN unpkg làm đứng trang admin, khiến admin không thể lưu được catalog ("không CRUD được gì cả").
- Hiệu ứng lật trang `react-pageflip` tự dựng thiếu mượt mà, không hỗ trợ zoom tốt, không có âm thanh lật trang hay tìm kiếm nội dung như các dịch vụ sách lật chuyên nghiệp.

Giải pháp:
- Cho phép admin nhúng trực tiếp link Heyzine Flipbook (trường `embedUrl` mới).
- Chuyển trường upload PDF thành tùy chọn bổ sung (chỉ dùng để khách hàng tải file gốc về nếu cần).
- Sửa lại các nút bấm admin bị mờ/mất màu nền (do sử dụng màu `brand-600` chưa được định nghĩa trong Tailwind v4) sang màu xanh dương đậm chuẩn hệ thống (`variant="accent"`).
- Sắp xếp lại layout trang `/catalogs` ở client thành dạng dọc hiển thị trực tiếp các iframe nhúng, tạo trải nghiệm premium giống hệt thiết kế mẫu.

## 3. Concrete Examples & Analogies
- **Ví dụ cụ thể:** Khi tạo catalog mới "Thiết Bị Vệ Sinh AAA 2024", admin chỉ cần dán link nhúng Heyzine `https://heyzine.com/flip-book/e3752e0430.html` và upload file PDF đính kèm (nếu muốn). Hệ thống sẽ bỏ qua bước cắt ảnh phức tạp và hiển thị iframe sách lật trên trang chính lập tức.
- **Analogy:** Thay vì tự tải video MP4 thô lên host của mình rồi tự code trình phát video (rất nặng và tốn băng thông), chúng ta nhúng trực tiếp video từ Youtube bằng mã nhúng Iframe.

---

# II. Audit Summary (Tóm tắt kiểm tra)
- **Cấu hình route:** `/admin/catalogs` (quản trị) và `/catalogs` (client).
- **Phân tích CSS:** File `app/globals.css` dùng Tailwind v4 nhưng không định nghĩa các class liên quan đến `--color-brand-*` hay `brand-600`. Do đó các nút dùng `bg-brand-600` ở admin bị transparent.
- **Cơ sở dữ liệu:** Schema bảng `catalogs` bắt buộc trường `pdfStorageId` (`v.id("_storage")`), cần đổi thành `v.optional(v.id("_storage"))`.

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Triệu chứng:** Admin không CRUD được catalog, nút thêm bị mờ nhạt.
- **Nguyên nhân chính:** 
  1. Nút thêm dùng class `bg-brand-600` không tồn tại màu trong Tailwind config v4, làm `twMerge` loại bỏ màu nền mặc định `bg-slate-900` của Button khiến nút bị trong suốt trên nền trắng.
  2. Luồng submit bắt buộc phải render PDF thành công. Nếu PDF.js worker lỗi load CDN, mutation `create` sẽ không bao giờ được gọi do thiếu `pdfStorageId`.
- **Độ tin cậy:** High (Đã xác minh qua code nguồn).

---

# IV. Proposal (Đề xuất)
- Chỉnh sửa schema Convex bảng `catalogs` để `pdfStorageId` là optional và thêm `embedUrl: v.optional(v.string())`.
- Cập nhật mutation `create` và `update` trong Convex tương ứng.
- Đổi styling nút bấm trong admin từ `bg-brand-600` sang `variant="accent"` của hệ thống admin.
- Cập nhật `CatalogForm` để cho phép tạo mới với link nhúng Heyzine mà không cần file PDF, hoặc hỗ trợ cả hai song song.
- Thiết kế lại trang `/catalogs` ở client thành layout dạng dọc hiển thị iframe nhúng Heyzine Flipbook cực kỳ premium và hỗ trợ tải PDF gốc.

---

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa:**
  - `convex/schema.ts`: Cập nhật cấu trúc bảng `catalogs`.
  - `convex/catalogs.ts`: Sửa mutation API.
  - `app/admin/catalogs/page.tsx`: Cập nhật nút bấm admin.
  - `app/admin/catalogs/components/CatalogForm.tsx`: Sửa form thêm/sửa catalog, hỗ trợ link nhúng Heyzine.
  - `app/(site)/catalogs/page.tsx`: Cập nhật layout dọc nhúng iframe.

---

# VI. Execution Preview (Xem trước thực thi)
1. Cập nhật `convex/schema.ts` and `convex/catalogs.ts`.
2. Sửa file `app/admin/catalogs/page.tsx` and `CatalogForm.tsx`.
3. Sửa file `app/(site)/catalogs/page.tsx`.
4. Chạy `bunx tsc --noEmit` để kiểm tra kiểu dữ liệu.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Chạy `bunx tsc --noEmit` toàn bộ dự án để đảm bảo không lỗi kiểu dữ liệu.
- Kiểm tra giao diện admin và client sau khi thay đổi để đảm bảo hoạt động trơn tru.

---

# VIII. Todo
- [ ] Cập nhật schema Convex trong `convex/schema.ts`
- [ ] Cập nhật API CRUD trong `convex/catalogs.ts`
- [ ] Chỉnh sửa giao diện quản trị trong `app/admin/catalogs/page.tsx`
- [ ] Chỉnh sửa form quản trị trong `app/admin/catalogs/components/CatalogForm.tsx`
- [ ] Cải tiến giao diện phía người dùng trong `app/(site)/catalogs/page.tsx`
- [ ] Xác minh và biên dịch TypeScript toàn dự án

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Admin hiển thị nút "+ Thêm Catalog" rõ ràng với màu xanh dương đậm chuẩn hệ thống admin, click được bình thường.
- Admin tạo mới hoặc chỉnh sửa catalog thành công mà không bắt buộc upload PDF (nếu đã nhập link nhúng Heyzine).
- Trang `/catalogs` ở client hiển thị danh sách các catalog theo chiều dọc, mỗi item nhúng trực tiếp sách lật Heyzine bằng iframe responsive, có nút tải PDF hoạt động đúng nếu có file PDF đính kèm.
- Không có lỗi build hay lỗi TypeScript.
