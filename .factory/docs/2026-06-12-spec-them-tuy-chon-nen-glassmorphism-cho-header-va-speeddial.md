# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề:** Khách hàng muốn dropdown của thanh điều hướng (Header Menu) và khung liên hệ nhanh (Speed Dial) khi mở ra có hiệu ứng nền mờ trong suốt (Glassmorphism) như trên macOS, tự động chuyển đổi đẹp mắt theo chế độ Sáng (Light) và Tối (Dark), thay vì màu nền đục mặc định.
* **Giải pháp:** 
  1. Thêm cấu hình `enableGlassmorphism` vào cơ sở dữ liệu và giao diện cấu hình của cả Header Menu và Speed Dial.
  2. Tại nơi hiển thị (cả site thực tế và màn hình xem trước - preview), nếu tuỳ chọn này được bật, ta sẽ áp dụng các thuộc tính CSS như `backdrop-filter: blur(20px)`, kết hợp màu nền bán trong suốt `rgba` và đường viền tinh tế tương ứng với chế độ màu Light/Dark đang dùng.
* **Cách hoạt động:** Khi người dùng di chuột vào menu hoặc mở Speed Dial, CSS sẽ lấy ảnh nền phía dưới làm mờ đi 20px và trộn thêm lớp màu trắng nhẹ 75% (Light mode) hoặc màu tối 65% (Dark mode), tạo cảm giác lớp kính mờ sang trọng chồng lên trang web.

## 2. Elaboration & Self-Explanation
Hiện nay các thành phần dropdown menu và panel Speed Dial đang sử dụng các biến màu tĩnh (`tokens.dropdownBg`, `tokens.neutralSurface`) không có độ trong suốt. Khi đè lên các banner ảnh phức tạp hoặc các khối nội dung lớn, việc thiếu độ trong suốt làm giao diện có phần tách biệt thô cứng.
Bằng cách đưa Glassmorphism vào thiết kế:
* Ở chế độ Light Mode: chúng ta tạo một nền trắng sữa `rgba(255, 255, 255, 0.75)` phối hợp với border siêu mảnh `rgba(0, 0, 0, 0.06)` và box shadow rất mềm. Hiệu ứng `backdrop-filter: blur(20px)` tạo chiều sâu cho menu.
* Ở chế độ Dark Mode: chúng ta đổi sang nền xám tối `rgba(15, 23, 42, 0.65)` phối hợp với border trắng đục `rgba(255, 255, 255, 0.08)` và bóng đổ sâu hơn kèm viền highlight phía trong bằng `inset shadow` màu trắng 5%.

Để đảm bảo tính nhất quán (Parity) giữa giao diện trang quản lý (Admin), màn hình xem trước (Preview) và trang hiển thị thực tế (Site), chúng ta cần đồng bộ hoá schema của cả 2 module:
* **Header Menu:** Trường `enableGlassmorphism` trong `HeaderConfig` (trang Site) và `HeaderMenuConfig` (trang Admin & Preview).
* **Speed Dial:** Trường `enableGlassmorphism` trong `SpeedDialConfig` (lưu vào database qua Convex).

## 3. Concrete Examples & Analogies
* **Ví dụ thực tế trong Code:**
  Bình thường, phần Mega Menu render với style:
  ```typescript
  style={{ backgroundColor: tokens.dropdownBg, borderColor: tokens.dropdownBorder }}
  ```
  Khi bật Glassmorphism, style sẽ chuyển đổi thành:
  ```typescript
  style={{
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    boxShadow: isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 10px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  }}
  ```
* **Phép ẩn dụ đời thường:** Hãy tưởng tượng menu bình thường như một tấm bìa các-tông dày đục màu đặt đè lên cuốn sách. Khi bật Glassmorphism, tấm bìa được thay thế bằng một tấm kính mờ (frosted glass) sang trọng. Bạn vẫn thấy bóng dáng của các chữ và màu sắc của trang sách bên dưới nhưng không bị rối mắt nhờ độ mờ mịn màng của kính.

# II. Audit Summary (Tóm tắt kiểm tra)
* **Header Menu:**
  * File cấu hình lưu trữ trong Convex (`experiences` table, document settings).
  * Trang quản trị `app/system/experiences/menu/page.tsx` lưu cấu hình và render UI Preview.
  * Preview component `components/experiences/previews/HeaderMenuPreview.tsx` render mô phỏng.
  * Component thực tế `components/site/Header.tsx` render trên site thật.
* **Speed Dial:**
  * Cấu hình lưu trữ trong Convex (`homeComponents` table, type `SpeedDial`).
  * Trang quản trị `app/admin/home-components/speed-dial/[id]/edit/page.tsx` và `create/speed-dial/page.tsx`.
  * Form chỉnh sửa `app/admin/home-components/speed-dial/_components/SpeedDialForm.tsx`.
  * Preview component `app/admin/home-components/speed-dial/_components/SpeedDialPreview.tsx`.
  * Component render chung `app/admin/home-components/speed-dial/_components/SpeedDialSectionShared.tsx`.
  * Component trên site thật `components/site/SpeedDialSection.tsx`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Nguyên nhân gốc:** Hiện tại hệ thống thiết lập menu và speed-dial chưa hỗ trợ thuộc tính cấu hình `enableGlassmorphism`. Màu nền của các menu popup/dropdown và speed-dial panel đang được gán trực tiếp bằng màu nền đục (`surface`, `dropdownBg`, `neutralSurface`) dẫn tới giao diện thô ráp khi đè lên các background ảnh hoặc màu sắc khác nhau, không có tuỳ chọn mờ trong suốt kiểu macOS.

# IV. Proposal (Đề xuất)
1. **Mở rộng Types & Schema:**
   * Thêm `enableGlassmorphism?: boolean` vào type `HeaderMenuConfig` và `HeaderConfig`.
   * Thêm `enableGlassmorphism?: boolean` vào type `SpeedDialConfig`.
2. **Cập nhật Giao diện Quản trị (Admin UI):**
   * Trong `app/system/experiences/menu/page.tsx`, thêm nút bật/tắt (ToggleRow) "Nền mờ Glassmorphism (macOS style)".
   * Trong `app/admin/home-components/speed-dial/_components/SpeedDialForm.tsx`, thêm tuỳ chọn "Nền mờ (Glassmorphism)" trong phần "Cấu hình hiển thị".
3. **Cập nhật Logic Render Preview và Site thực tế:**
   * Trong `HeaderMenuPreview.tsx` and `Header.tsx`, áp dụng inline style mờ trong suốt cho dropdown và mega-menu khi `enableGlassmorphism` được bật.
   * Trong `SpeedDialSectionShared.tsx`, áp dụng lớp kính mờ macOS cho panel "Liên hệ với chúng tôi" (`renderMinimal` popup) và các cấu trúc popup của Speed Dial khi `enableGlassmorphism` được bật.

# V. Files Impacted (Tệp bị ảnh hưởng)
### UI / Config System
* **Sửa:** [components/experiences/previews/HeaderMenuPreview.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/experiences/previews/HeaderMenuPreview.tsx) — Thêm type `enableGlassmorphism` và áp dụng CSS Glassmorphism vào các dropdown/popup.
* **Sửa:** [components/site/Header.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/Header.tsx) — Thêm type `enableGlassmorphism` vào `HeaderConfig` và áp dụng CSS Glassmorphism vào các dropdown/popup ngoài Site.
* **Sửa:** [app/system/experiences/menu/page.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/system/experiences/menu/page.tsx) — Thêm switch cấu hình Glassmorphism cho menu, mặc định tắt.
* **Sửa:** [app/admin/home-components/speed-dial/_types/index.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/speed-dial/_types/index.ts) — Thêm trường `enableGlassmorphism` vào interface `SpeedDialConfig`.
* **Sửa:** [app/admin/home-components/speed-dial/_lib/constants.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/speed-dial/_lib/constants.ts) — Thêm `enableGlassmorphism: false` vào `DEFAULT_SPEED_DIAL_CONFIG`.
* **Sửa:** [app/admin/home-components/speed-dial/_components/SpeedDialForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/speed-dial/_components/SpeedDialForm.tsx) — Thêm props và UI toggle cho `enableGlassmorphism`.
* **Sửa:** [app/admin/home-components/speed-dial/_components/SpeedDialPreview.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/speed-dial/_components/SpeedDialPreview.tsx) — Nhận và truyền tiếp `enableGlassmorphism`.
* **Sửa:** [app/admin/home-components/speed-dial/_components/SpeedDialSectionShared.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/speed-dial/_components/SpeedDialSectionShared.tsx) — Áp dụng CSS Glassmorphism cho popup card của Speed Dial dựa trên `enableGlassmorphism` và trạng thái `isDark`.
* **Sửa:** [components/site/SpeedDialSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/SpeedDialSection.tsx) — Đọc cấu hình `enableGlassmorphism` từ database và truyền xuống `SpeedDialSectionShared`.
* **Sửa:** [app/admin/home-components/speed-dial/[id]/edit/page.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/speed-dial/[id]/edit/page.tsx) — Đồng bộ hoá state `enableGlassmorphism` và lưu/tải cấu hình.
* **Sửa:** [app/admin/home-components/create/speed-dial/page.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/create/speed-dial/page.tsx) — Đồng bộ hoá state `enableGlassmorphism` khi khởi tạo mới Speed Dial.

# VI. Execution Preview (Xem trước thực thi)
1. Cập nhật các types định nghĩa cấu hình cho Header và Speed Dial.
2. Sửa file UI Admin `experiences/menu/page.tsx` và `SpeedDialForm.tsx` để bổ sung Switch Control.
3. Sửa `SpeedDialSectionShared.tsx` để xử lý logic CSS Glassmorphism cho Speed Dial.
4. Sửa `HeaderMenuPreview.tsx` và `Header.tsx` để xử lý logic CSS Glassmorphism cho menu dropdown.
5. Cập nhật các trang Edit/Create của Speed Dial để lưu trữ trường cấu hình mới.

# VIII. Todo
* [ ] Cập nhật `HeaderMenuConfig` type và default config trong `experiences/menu/page.tsx`, `HeaderMenuPreview.tsx` và `Header.tsx`.
* [ ] Cập nhật UI chỉnh sửa Header Menu trong `experiences/menu/page.tsx` với switch Glassmorphism.
* [ ] Cập nhật CSS hiển thị dropdown menu của Header trong `HeaderMenuPreview.tsx` và `Header.tsx` khi bật Glassmorphism.
* [ ] Cập nhật `SpeedDialConfig` type và default config trong `speed-dial/_types/index.ts`, `speed-dial/_lib/constants.ts`.
* [ ] Cập nhật UI chỉnh sửa Speed Dial trong `SpeedDialForm.tsx` với switch Glassmorphism.
* [ ] Cập nhật CSS hiển thị popup panel của Speed Dial trong `SpeedDialSectionShared.tsx` khi bật Glassmorphism.
* [ ] Cập nhật `SpeedDialPreview.tsx` và `SpeedDialSection.tsx` để pass biến `enableGlassmorphism`.
* [ ] Cập nhật các file Edit/Create Page của Speed Dial để quản lý state và lưu trữ `enableGlassmorphism`.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* **Giao diện cấu hình:** 
  * Tại `http://localhost:3000/system/experiences/menu`, xuất hiện switch "Bật nền Glassmorphism (macOS style)" và có thể lưu/tải thành công.
  * Tại `http://localhost:3000/admin/home-components/speed-dial/.../edit`, xuất hiện switch "Nền mờ (Glassmorphism)" trong phần Cấu hình hiển thị và có thể lưu/tải thành công.
* **Hiển thị thực tế:**
  * Khi bật Glassmorphism cho Header Menu: các dropdown (mega menu, flyout, user menu) có nền mờ trong suốt `rgba(255,255,255,0.75)` (Light mode) và `rgba(15,23,42,0.65)` (Dark mode), backdrop-filter blur 20px, viền mờ cực mảnh, shadow mịn.
  * Khi bật Glassmorphism cho Speed Dial: popup card có nền mờ trong suốt tương ứng và backdrop-filter blur 20px.
  * Khi tắt: cả hai quay về dùng nền đặc màu chuẩn của website như cũ.
* **Hiệu suất & Tương thích:**
  * Hiệu ứng CSS chạy trơn tru, không gây giật lag trên cả Desktop và Mobile.
  * Cả giao diện Preview và Site thực tế hoạt động đồng bộ.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro:** Một số trình duyệt cũ hoặc không hỗ trợ WebKit có thể không hiển thị backdrop-filter.
* **Giải pháp:** Sử dụng fallback background màu đục nếu trình duyệt không hỗ trợ backdrop-filter (đây là hành vi mặc định của CSS `backdrop-filter`).
* **Hoàn tác:** Khôi phục các file đã chỉnh sửa bằng Git.

# XI. Out of Scope (Ngoài phạm vi)
* Thiết kế lại các hiệu ứng hoạt ảnh phức tạp khác của Speed Dial và Header Menu.
* Thay đổi thiết kế của chatbot widget tích hợp hay các block component khác ngoài Header Menu và Speed Dial.
