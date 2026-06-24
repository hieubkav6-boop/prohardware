# SPECIFICATION: Sửa lỗi hiển thị và FOUC (Flash of Unstyled Content) của Logo Header

## I. Primer

### 1. TL;DR kiểu Feynman
* **Vấn đề**: Khi tải trang lần đầu (Server-Side Rendering - SSR), logo bị vỡ hình khoảng 0.5 giây và hiển thị dòng chữ alt "Thiên Kim Wine" xếp dọc. Sau 0.5 giây (khi Client Hydration xong), logo mới hiển thị bình thường.
* **Nguyên nhân**: 
  1. Next.js cache layout (trong 30 phút). Khi admin cập nhật logo mới trong settings, server-side cache vẫn render ra URL logo cũ đã bị xóa khỏi Convex storage dẫn đến ảnh vỡ. Sau 0.5s, client-side query chạy trực tiếp tới Convex lấy được URL logo mới đúng và render đè lên.
  2. Logo không được cấu hình `priority` để preload, cộng với việc CSS wrapper của logo có chiều cao tự động (`height: auto`). Khi trình duyệt đang tải ảnh mới, nó không biết kích thước ảnh và hiển thị alt text dài kèm biểu tượng vỡ.
* **Giải pháp**:
  1. Thêm Server Action revalidate layout (`/` với type `'layout'`) và kích hoạt revalidate ngay khi admin lưu cài đặt thành công.
  2. Bổ sung thuộc tính `priority={true}` vào các thẻ `<Image>` của logo trong Header để Next.js tự động sinh thẻ `<link rel="preload">` tải trước ảnh logo với độ ưu tiên cao nhất.

### 2. Elaboration & Self-Explanation
Next.js sử dụng cơ chế Server Component và cache dữ liệu tĩnh hoặc ISR cho layout. File `app/(site)/layout.tsx` được cấu hình revalidate sau 30 phút (`export const revalidate = 1800;`). Khi quản trị viên cập nhật cài đặt trang web (như đổi logo mới) trong Admin Settings, thay đổi được ghi vào database Convex thành công. 

Tuy nhiên, do Next.js không nhận được lệnh revalidate layout, server-side render vẫn sử dụng HTML cache chứa URL logo cũ. URL này đã bị Convex storage dọn dẹp (cleanup) hoặc thay thế nên trả về lỗi 404 (ảnh vỡ). Trình duyệt của khách truy cập khi nhận HTML từ server sẽ hiển thị ảnh vỡ này đầu tiên. Sau khi React hoàn tất việc khởi tạo trên trình duyệt (Hydration) và thực hiện query Convex trực tiếp (sau khoảng 0.5s), client lấy được URL logo mới chính xác và React cập nhật DOM để hiển thị logo đúng.

Đồng thời, thẻ `<img>` của logo ở Header không được cấu hình độ ưu tiên tải trước (`priority`). Khi trình duyệt chuyển sang URL logo đúng, nó mất thêm một khoảng thời gian ngắn để fetch ảnh từ CDN. Vì ảnh chưa load xong và CSS của logo wrapper có `height: auto`, trình duyệt hiển thị alt text "Thiên Kim Wine" bị vỡ dòng xếp dọc.

### 3. Concrete Examples & Analogies
* **Ví dụ thực tế**: Khi bạn đổi biển hiệu của một cửa hàng rượu. 
  - Biển hiệu cũ đã bị tháo dỡ và vứt đi (URL cũ bị xóa).
  - Bản đồ Google Maps (Next.js server cache) vẫn chỉ đường tới biển hiệu cũ khiến khách tới nơi chỉ thấy khung sắt trống rỗng và chữ alt (ảnh vỡ).
  - Khi khách hỏi trực tiếp nhân viên cửa hàng (client-side query), họ mới chỉ ra biển hiệu mới màu cam đất (logo mới hiển thị).
  - Ta cần cập nhật ngay bản đồ Google Maps (on-demand revalidate) ngay khi đổi biển hiệu và chuẩn bị sẵn biển hiệu mới ở cửa ra vào (preload/priority) để khách không bao giờ thấy khung sắt trống.

---

## II. Audit Summary (Tóm tắt kiểm tra)
* **Convex Database**: Cài đặt `site_logo` đang trỏ tới URL `https://incredible-hamster-348.convex.cloud/api/storage/b985af79-7897-464b-b467-6ecba3ba429e` (được map với storageId `kg28y41x04envj3a313r5cceg9897bm7` trong table `images`). File này hoàn toàn tồn tại và đúng là logo Thiên Kim Wine mới màu cam đất.
* **Layout Cache**: `app/(site)/layout.tsx` sử dụng cache 30 phút. Khi save settings trong `SettingsPageShell.tsx`, hệ thống chỉ revalidate các đường dẫn SEO (robots.txt, sitemap) mà không hề revalidate layout trang web.
* **Image Preload**: Component `<Header>` render logo bằng `<Image>` của Next.js nhưng thiếu thuộc tính `priority`, đồng thời style wrapper dùng `height: auto` gây ra chớp layout/alt text khi ảnh đang load.

---

## III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Root Cause (Nguyên nhân gốc - Độ tin cậy: High)**:
  1. Thiếu cơ chế on-demand revalidation cho Layout (`/` dạng layout) khi lưu settings dẫn đến mismatch dữ liệu (server trả về URL cũ bị lỗi, client cập nhật URL mới đúng sau 0.5s).
  2. Thiếu thuộc tính `priority` của Next.js Image cho logo ở Header khiến ảnh không được preload và xuất hiện chớp alt text/layout shift khi load.
* **Counter-Hypothesis (Giả thuyết đối chứng)**:
  - *Giả thuyết*: Có thể do Next.js Image config chặn domain Convex?
  - *Bác bỏ*: `next.config.ts` đã whitelist `*.convex.cloud` and `*.convex.site`. Sau 0.5s client-side vẫn hiển thị logo bình thường, chứng minh cấu hình domain hoàn toàn đúng.

---

## V. Files Impacted (Tệp bị ảnh hưởng)

### 1. [seo-revalidate.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/actions/seo-revalidate.ts)
* `Sửa`: Bổ sung export function `revalidateSiteLayout` để thực hiện revalidate layout root `/`.

### 2. [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx)
* `Sửa`: Import và kích hoạt `revalidateSiteLayout()` khi lưu cài đặt thành công.

### 3. [Header.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/components/site/Header.tsx)
* `Sửa`: Thêm prop `priority={true}` cho các component `<Image>` hiển thị logo.

---

## VI. Execution Preview (Xem trước thực thi)
1. Cập nhật file [seo-revalidate.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/actions/seo-revalidate.ts) để export thêm hàm `revalidateSiteLayout`.
2. Cập nhật file [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx) để gọi revalidate layout khi lưu settings thành công.
3. Cập nhật file [Header.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/components/site/Header.tsx) thêm `priority={true}` vào các thẻ logo.
4. Chạy build/static check để kiểm tra cú pháp và kiểu dữ liệu (tĩnh).

---

## VII. Verification Plan (Kế hoạch kiểm chứng)
* **Kiểm tra biên dịch**: Chạy `bunx tsc --noEmit` để đảm bảo không bị lỗi TypeScript.
* **Kiểm chứng chức năng (Tester/User thực hiện trên web)**:
  1. F5 tải lại trang: Không còn xuất hiện tình trạng hiển thị chữ "Thiên Kim Wine" bị vỡ dòng và biểu tượng ảnh vỡ nữa, logo hiển thị ngay lập tức (do được preload).
  2. Vào Admin Settings -> Thay đổi một cài đặt (ví dụ: tagline hoặc logo) -> Click Lưu -> F5 ở trang ngoài -> Thông tin mới hiển thị ngay lập tức từ server render, không cần đợi 30 phút.

---

## VIII. Todo
- [ ] Thêm `revalidateSiteLayout` vào `app/actions/seo-revalidate.ts`
- [ ] Import và gọi `revalidateSiteLayout()` trong `SettingsPageShell.tsx`
- [ ] Cập nhật `priority={true}` cho các thẻ `<Image>` logo trong `Header.tsx`

---

## IX. Acceptance Criteria (Tiêu chí chấp nhận)
* [ ] Logo Header không bị chớp lỗi vỡ hình (FOUC) khi tải trang lần đầu.
* [ ] Khi lưu cài đặt ở admin, cache layout trang site được giải phóng ngay lập tức trên server.
* [ ] Code biên dịch qua TypeScript sạch sẽ, không có lỗi runtime/build time mới.

---

## X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro**: Revalidate layout trên môi trường chịu tải lớn có thể làm tăng nhẹ số lượng request tới DB/Convex của server trong tích tắc. Tuy nhiên với quy mô web này, số lượng admin lưu settings là rất ít nên rủi ro là bằng không.
* **Hoàn tác**: Hoàn tác các file đã sửa đổi qua git checkout (`git checkout -- <file_path>`).

---

## XI. Out of Scope (Ngoài phạm vi)
* Sửa đổi các hình ảnh khác ngoài logo Header (như logo đối tác, logo footer).
* Tối ưu hóa hiệu năng/loading của toàn bộ các ảnh trên trang web.
