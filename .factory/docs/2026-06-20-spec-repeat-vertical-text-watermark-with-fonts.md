# Cấu hình lặp watermark chữ theo hàng dọc và tùy chọn Font chữ

Bản thiết kế này mô tả chi tiết việc triển khai tính năng lặp watermark chữ theo hàng dọc (vertical repeat), cho phép tùy chọn font chữ từ các font hệ thống sẵn có, và hỗ trợ thanh trượt (slider) kéo giãn khoảng cách (gap) giữa các dòng một cách trực quan trên giao diện quản trị settings.

# I. Primer

## 1. TL;DR kiểu Feynman
- Giống như việc đóng một con dấu lặp đi lặp lại trên một trang giấy, hiện tại chúng ta chỉ có thể đóng dấu theo một hàng ngang từ trái sang phải. 
- Yêu cầu mới là cho phép đóng dấu thành nhiều hàng từ trên xuống dưới (lặp hàng dọc) để phủ kín bức ảnh sản phẩm làm watermark bảo vệ bản quyền tốt hơn.
- Chúng ta cũng cho phép người dùng chọn kiểu chữ (font) khác nhau và kéo thanh trượt để chỉnh khoảng cách thưa hay khít giữa các hàng chữ này một cách trực quan, chỉnh đến đâu nhìn thấy thay đổi đến đó.

## 2. Elaboration & Self-Explanation
- Hiện tại, hệ thống watermark chữ chỉ hỗ trợ lặp hàng ngang (`product_watermark_text_repeat`) và hiển thị tại một vị trí trục Y cố định (`product_watermark_text_y`).
- Để hỗ trợ lặp hàng dọc, chúng ta sẽ thêm:
  - Checkbox bật lặp dọc: `product_watermark_text_vertical_repeat` (lưu trữ trong settings).
  - Chọn font chữ: `product_watermark_text_font` (lưu trữ dạng string, mapping với registry font sẵn có).
  - Khoảng cách dòng: `product_watermark_text_line_gap` (lưu trữ dạng string/number đại diện cho % khoảng cách chiều dọc).
- Khi render, nếu bật lặp dọc, chúng ta sẽ tính toán vị trí của từng dòng: `top = Y_chính + i * lineGap` (với `i` chạy từ `-10` đến `10` để bao phủ toàn bộ vùng ảnh). Dòng chính tại vị trí kéo thả (`Y_chính`) vẫn hoạt động bình thường, kéo dòng chính đi đâu thì cả lưới lặp dọc sẽ dịch chuyển theo đó.

## 3. Concrete Examples & Analogies
- Ví dụ: Người dùng thiết lập chữ watermark là "PRO HARDWARE", chọn font "Montserrat", cỡ chữ 12px, vị trí Y chính là 50% (chính giữa ảnh).
  - Nếu tắt lặp dọc: Chỉ có 1 hàng chữ nằm ở giữa ảnh tại `top: 50%`.
  - Nếu bật lặp dọc và chỉnh độ giãn dòng là 25%: Các dòng chữ khác sẽ tự động render ở `25%`, `75%`, `0%`, `100%`, phủ đều toàn bộ ảnh. Khi người dùng kéo dòng giữa lên `45%`, các dòng khác cũng di chuyển lên thành `20%`, `70%`, `95%`, v.v.

# II. Audit Summary (Tóm tắt kiểm tra)
- **Tệp watermark hiện tại**:
  - [ProductImageWatermarkOverlay.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/shared/ProductImageWatermarkOverlay.tsx): Đọc settings watermark chữ từ Convex và hiển thị watermark trên sản phẩm ngoài storefront.
  - [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/settings/_components/SettingsPageShell.tsx): Giao diện admin nâng cao, quản lý form state, cho phép kéo thả watermark hình và chữ trực quan, lưu cấu hình settings vào Convex qua mutation `api.settings.setMultiple`.
- **Hệ thống Font có sẵn**:
  - [registry.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/lib/fonts/registry.ts): Định nghĩa `FONT_REGISTRY` chứa 10 font tiếng Việt đã được tích hợp bằng Google Font (`next/font/google`).

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Nguyên nhân**: Hệ thống watermark hiện tại được thiết kế MVP (chỉ lặp ngang trên một dòng đơn lẻ, font chữ cố định là Be Vietnam Pro, không có cấu hình gap/font).
- **Giải pháp đối chứng**: Tích hợp thêm 3 trường settings mới vào schema lưu trữ settings của Convex, đồng bộ UI cấu hình admin settings (inputs, sliders, dynamic font-family) và component render overlay ở storefront.

# IV. Proposal (Đề xuất)
1. Bổ dung các trường cấu hình settings mới cho watermark chữ:
   - `product_watermark_text_vertical_repeat` (boolean, mặc định `false`)
   - `product_watermark_text_font` (string, mặc định `be-vietnam-pro`)
   - `product_watermark_text_line_gap` (string, mặc định `30`)
2. Cập nhật admin settings UI:
   - Thêm dropdown select Font chữ trong phần cấu hình watermark chữ.
   - Thêm checkbox "Lặp watermark chữ theo hàng dọc".
   - Thêm slider điều chỉnh "Độ giãn hàng dọc (line gap)" chạy từ 10% đến 80% (chỉ hiển thị khi bật lặp dọc).
   - Tích hợp `resolveFontVariable` để áp dụng font-family được chọn trực tiếp vào canvas preview.
3. Cập nhật component render storefront overlay để hiển thị đúng Font, lặp dọc và line-gap.

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa:** [ProductImageWatermarkOverlay.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/shared/ProductImageWatermarkOverlay.tsx)
  - Cập nhật hook `useProductWatermarkConfig` để query thêm 3 settings mới: `product_watermark_text_vertical_repeat`, `product_watermark_text_font`, `product_watermark_text_line_gap`.
  - Cập nhật hàm `ProductImageWatermarkOverlay` render lặp dọc (nếu bật) bằng cách render nhiều hàng dọc từ `i = -10` đến `10` cách nhau `lineGap` (%) dựa trên dòng gốc `text.y`.
  - Áp dụng fontFamily dạng dynamic CSS variable bằng `resolveFontVariable`.
- **Sửa:** [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/settings/_components/SettingsPageShell.tsx)
  - Thêm 3 key settings mới vào mảng `watermarkKeys` và gán defaults trong hàm `useEffect` sync form values.
  - Thêm UI control (Select Font, Checkbox lặp dọc, Slider line-gap) vào tab Watermark.
  - Cập nhật phần preview canvas góc phải hiển thị trực quan các dòng chữ lặp dọc và font-family tương ứng khi người dùng tương tác.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc và chỉnh sửa `ProductImageWatermarkOverlay.tsx` để tích hợp logic render lặp dọc và font family dynamic.
2. Đọc và chỉnh sửa `SettingsPageShell.tsx` để bổ sung cấu hình và cập nhật giao diện Preview trực quan.
3. Kiểm tra tĩnh code (types, imports) để đảm bảo không lỗi biên dịch.

# VII. Verification Plan (Kế hoạch kiểm chứng)
### Automated Tests
- Chạy kiểm tra TypeScript compile toàn dự án:
  `bunx tsc --noEmit`

### Manual Verification
- Người dùng truy cập `http://localhost:3000/admin/settings/advanced?tab=watermark`
- Bật watermark chữ, chọn font khác (ví dụ `Lora` hoặc `Montserrat`), kéo dòng chữ xem font đổi trực tiếp trên preview.
- Bật tùy chọn lặp hàng dọc, kéo thanh trượt line-gap xem các dòng chữ giãn ra/khít lại trên preview.
- Bấm lưu cài đặt, reload trang kiểm tra dữ liệu được lưu đúng.
- Xem sản phẩm ngoài storefront kiểm tra watermark chữ hiển thị đúng như thiết lập.

# VIII. Todo
- [ ] Import `FONT_REGISTRY` và `resolveFontVariable` vào `SettingsPageShell.tsx` và `ProductImageWatermarkOverlay.tsx`.
- [ ] Bổ sung các cấu hình settings mới vào defaults và mảng `watermarkKeys` trong `SettingsPageShell.tsx`.
- [ ] Sửa UI cấu hình watermark chữ (dòng 1814-1882) để thêm Select Font, Checkbox lặp dọc và Slider line-gap.
- [ ] Sửa UI Preview canvas (dòng 1937-1962) để hiển thị lặp dọc và font-family động.
- [ ] Sửa `ProductImageWatermarkOverlay.tsx` để đồng bộ render ở storefront.
- [ ] Chạy `bunx tsc --noEmit` kiểm tra typecheck.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Dropdown font chứa đầy đủ 10 font từ `FONT_REGISTRY`. Khi chọn font, font chữ hiển thị trên canvas preview đổi ngay lập tức.
- Checkbox lặp dọc khi bật sẽ hiển thị nhiều dòng chữ trên canvas preview. Khi tắt chỉ hiển thị 1 dòng chính.
- Slider độ giãn dòng (line gap) thay đổi từ 10% đến 80%. Khi kéo slider, khoảng cách các dòng chữ trên canvas preview đổi trực tiếp.
- Kéo thả dòng chữ trên preview canvas vẫn hoạt động mượt mà khi bật lặp dọc (kéo 1 dòng chính, tất cả các dòng lặp dọc khác dịch chuyển theo).
- Bấm nút "Lưu thay đổi" hoạt động thành công và lưu chính xác xuống DB Convex.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro**: Lỗi build nếu import sai hoặc thiếu font variable.
- **Hoàn tác**: Sử dụng `git checkout` để rollback code nếu gặp lỗi biên dịch nghiêm trọng.

# XI. Out of Scope (Ngoài phạm vi)
- Không tùy chỉnh xoay góc nghiêng cho watermark chữ (xoay chéo 45 độ) vì người dùng chỉ yêu cầu lặp hàng dọc và kéo độ giãn.
- Không thay đổi thiết kế watermark hình (logo).
