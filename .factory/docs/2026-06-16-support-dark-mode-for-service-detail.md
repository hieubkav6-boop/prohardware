# I. Primer

## 1. TL;DR kiểu Feynman
* Trang chi tiết dịch vụ bị "lỏ" khi bật dark mode vì màu sắc nền và chữ của nó đang bị khóa cứng ở chế độ sáng (nền trắng, chữ đen).
* Chúng ta sẽ sửa hàm tạo màu (`getServiceDetailColors`) để nó biết được trang đang ở chế độ sáng hay tối, từ đó trả về màu nền tối và màu chữ sáng tương ứng khi ở dark mode (như cách trang chi tiết sản phẩm đã làm).
* Chúng ta cũng sẽ thêm thuộc tính `dark:prose-invert` vào phần hiển thị nội dung chi tiết dịch vụ (RichContent) để các đoạn văn, tiêu đề trong bài viết tự động đảo màu sang trắng sáng dễ đọc trên nền tối.

## 2. Elaboration & Self-Explanation
* Hiện tại, trang chi tiết dịch vụ đang được cấu trúc hóa màu sắc thông qua một bộ `tokens` màu sắc do hàm `getServiceDetailColors` sinh ra. Tuy nhiên, hàm này không hề nhận biết trạng thái dark mode của hệ thống.
* Khi người dùng bật dark mode, class `dark` được thêm vào thẻ `<html>` nhưng style inline của trang dịch vụ (`style={{ backgroundColor: tokens.pageBackground }}`) vẫn là màu trắng tinh (`#ffffff`), ghi đè toàn bộ CSS Tailwind.
* Bằng cách truyền trạng thái `isDark` lấy từ hook `useSiteSettings()` vào hàm sinh màu, ta sẽ trả về các mã màu tối (như xám đậm `#161617`, đen xám `#1c1c1e`) cho nền và màu sáng (như `#f5f5f7`) cho chữ. Đồng thời, các thành phần tương phản tự động (APCA contrast) sẽ tự động tính toán màu chữ nổi bật cho các badge và nút bấm trên nền mới.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể**: Trong light mode, `tokens.pageBackground` là `#ffffff` (trắng) và `tokens.bodyText` là `#0f172a` (đen). Khi bật dark mode, `isDark = true`, `tokens.pageBackground` sẽ chuyển thành `#161617` (tối) và `tokens.bodyText` sẽ chuyển thành `#f5f5f7` (sáng).
* **Analogy (Phép ẩn dụ)**: Giống như một chiếc kính đổi màu. Khi ra nắng (dark mode), mắt kính tự động tối đi để bảo vệ mắt. Hiện tại trang dịch vụ giống như mắt kính thường bị kẹt ở chế độ trong suốt, làm người dùng bị chói mắt khi xung quanh đã tối thui. Chúng ta đang lắp thêm cảm biến ánh sáng (`isDark`) cho chiếc kính này.

# II. Audit Summary (Tóm tắt kiểm tra)
* Trang chi tiết dịch vụ được render bởi `ServiceDetailPage` ở 2 file wrapper:
  * [ServiceDetailPage.tsx (Route category)](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/(site)/[categorySlug]/[recordSlug]/_components/ServiceDetailPage.tsx)
  * [ServiceDetailPage.tsx (Route slugs)](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/(site)/_components/details/ServiceDetailPage.tsx)
* Cả 2 file trên đều import styles từ [ServiceDetailStyles.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/services/detail/ServiceDetailStyles.tsx) và bộ màu từ [colors.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/services/detail/_lib/colors.ts).
* [colors.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/services/detail/_lib/colors.ts) hiện tại chỉ nhận `primary`, `secondary`, `mode` mà không nhận `isDark`. Do đó nó luôn trả về bộ màu light mode cứng nhắc.
* `ServiceDetailStyles.tsx` hiển thị nội dung qua `RichContent` nhưng thiếu class `dark:prose-invert`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Root Cause (Nguyên nhân gốc)**: Bộ sinh màu `getServiceDetailColors` bị hardcode các màu sáng cho các biến `neutralSurface`, `neutralBorder`, `neutralText`... và không hỗ trợ tham số `isDark` để sinh màu tối.
* **Counter-Hypothesis (Giả thuyết đối chứng)**: Nếu chỉ thêm class Tailwind `dark:bg-black` vào component mà không sửa `tokens` thì style inline sẽ ghi đè và làm hỏng giao diện. Sửa `tokens` là cách duy nhất đảm bảo tính nhất quán của hệ thống design system đang có.

# IV. Proposal (Đề xuất)
* **Bước 1**: Cập nhật hàm `getServiceDetailColors` trong [colors.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/services/detail/_lib/colors.ts) hỗ trợ tham số `isDark?: boolean` và sinh màu tối khi `isDark === true` theo chuẩn tương tự trang chi tiết sản phẩm.
* **Bước 2**: Cập nhật `ServiceDetailStyles.tsx` thêm class `dark:prose-invert` vào component `RichContent` để hiển thị nội dung HTML/Markdown bài viết chuẩn màu trong dark mode.
* **Bước 3**: Cập nhật 2 file wrapper `ServiceDetailPage.tsx` gọi hook `useSiteSettings()` để lấy `isDark` và truyền vào `getServiceDetailColors`.

# V. Files Impacted (Tệp bị ảnh hưởng)

### Sửa:
* [colors.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/services/detail/_lib/colors.ts): Sửa hàm `getServiceDetailColors` hỗ trợ `isDark`.
* [ServiceDetailStyles.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/services/detail/ServiceDetailStyles.tsx): Thêm class `dark:prose-invert` vào 3 style rendering.
* [ServiceDetailPage.tsx (category)](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/(site)/[categorySlug]/[recordSlug]/_components/ServiceDetailPage.tsx): Truyền `isDark` từ `useSiteSettings` vào bộ sinh màu.
* [ServiceDetailPage.tsx (details)](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/(site)/_components/details/ServiceDetailPage.tsx): Truyền `isDark` từ `useSiteSettings` vào bộ sinh màu.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc kĩ cấu trúc màu tối của chi tiết sản phẩm để lấy bộ màu chuẩn.
2. Sửa file `colors.ts`.
3. Sửa file `ServiceDetailStyles.tsx`.
4. Sửa 2 file wrapper `ServiceDetailPage.tsx` (cả route category và route slug).
5. Tự kiểm tra cú pháp (static review).

# VII. Verification Plan (Kế hoạch kiểm chứng)
* Vì không tự chạy lint hoặc build theo rule, ta sẽ review tĩnh thật kỹ các thay đổi type-safety và cú pháp import.
* Đảm bảo truyền đủ tham số và không bị thiếu import.

# VIII. Todo
* [ ] Sửa file `components/site/services/detail/_lib/colors.ts` hỗ trợ `isDark`
* [ ] Sửa file `components/site/services/detail/ServiceDetailStyles.tsx` thêm class `dark:prose-invert`
* [ ] Sửa file `app/(site)/[categorySlug]/[recordSlug]/_components/ServiceDetailPage.tsx` lấy `isDark` từ hook và truyền sang
* [ ] Sửa file `app/(site)/_components/details/ServiceDetailPage.tsx` lấy `isDark` từ hook và truyền sang

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* Trang chi tiết dịch vụ khi bật dark mode hiển thị nền tối (`#161617` / `#1c1c1e`), chữ màu sáng (`#f5f5f7`).
* Các đường viền border hiển thị màu tối phù hợp (`#27272a`), không bị lộ vạch trắng sáng.
* Nội dung chi tiết dịch vụ (RichContent) có chữ sáng màu, dễ đọc trên nền tối, không bị chữ đen khó nhìn.
* Không có lỗi TypeScript biên dịch.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro**: Lỗi logic tương phản màu APCA nếu cấu hình không đúng dẫn tới chữ bị tịt màu.
* **Hoàn tác**: Sử dụng `git checkout` để rollback nhanh chóng các file đã sửa đổi.

# XI. Out of Scope (Ngoài phạm vi)
* Sửa đổi các module khác như sản phẩm, bài viết (đã có sẵn dark mode tốt).
* Sửa đổi phần quản trị admin chi tiết dịch vụ.
