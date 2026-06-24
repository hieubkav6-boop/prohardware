# Sửa lỗi lưu cài đặt 'Bật khung viền sản phẩm' (enable_product_frames)

Cấu hình "Bật khung viền sản phẩm" không được lưu lại khi người dùng nhấn "Lưu cài đặt" ở trang Cài đặt nâng cao của Admin, dẫn đến việc reload trang (F5) thì trạng thái checkbox luôn trở về trạng thái cũ.

# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề:** Khi bạn tắt công tắc "Bật khung viền sản phẩm" trong trang quản trị nâng cao rồi bấm Lưu, nút lưu báo thành công nhưng thực chất hệ thống đã bỏ quên không gửi trạng thái của công tắc này lên máy chủ. Kết quả là khi tải lại trang, công tắc tự động bật lên như cũ.
* **Nguyên nhân:** Hàm xử lý lưu cài đặt (`handleSave`) duyệt qua danh sách các trường cấu hình được định nghĩa trước để lưu. Tuy nhiên, trường "Bật khung viền sản phẩm" (`enable_product_frames`) lại không nằm trong danh sách định nghĩa chung, và cũng không được thêm vào danh sách xử lý thủ công (như các ảnh khung viền hay watermark).
* **Giải pháp:** Bổ sung thủ công key `enable_product_frames` vào danh sách các cài đặt cần lưu (`settingsToSave`) trong hàm `handleSave` để trạng thái của nó được gửi lên máy chủ cùng với các cấu hình khác.

## 2. Elaboration & Self-Explanation
Trang cấu hình hệ thống sử dụng một danh sách động các trường từ schema (`fieldsData`) để tự động map và lưu trữ. Những cài đặt không thuộc schema chuẩn này (ví dụ các cấu hình nâng cao dạng custom tabs như ảnh placeholder sản phẩm, watermark, danh sách ảnh khung viền...) cần được thêm vào một cách thủ công (hardcode) ngay trước khi gọi API lưu (`setMultiple`).
Do tính năng "Khung viền sản phẩm" mới được refactor từ việc lưu trong module sản phẩm sang lưu trong settings chung, key `enable_product_frames` bị sót, không xuất hiện ở danh sách động lẫn danh sách thêm thủ công. Ta chỉ cần cắm thêm key này vào code lưu thủ công là xong.

## 3. Concrete Examples & Analogies
* **Ví dụ thực tế:** Khi nhấn "Lưu cài đặt", hệ thống giống như một người đóng gói đồ đạc vào thùng gửi đi. Người đó mở danh sách kiểm kê đồ đạc (`fieldsData`) ra để xếp đồ. Do nhãn `enable_product_frames` (công tắc bật/tắt khung) không nằm trên danh sách kiểm kê đó, người đóng gói đã bỏ quên nó ở ngoài. Các ảnh khung viền (`product_frame_overlay_square_url`...) thì có trong danh sách bổ sung thủ công nên vẫn được đóng gói bình thường.
* **Giải pháp:** Ta ghi thêm một dòng ghi chú vào cuốn sổ tay của người đóng gói: *"Nhớ xếp cả trạng thái của công tắc Bật khung viền sản phẩm vào thùng nữa nhé"*.

# II. Audit Summary (Tóm tắt kiểm tra)
* **Tệp cấu hình:** `lib/modules/configs/settings.config.ts` không chứa định nghĩa cho `enable_product_frames` trong `runtimeConfig.fields`. Do đó, `fieldsData` (lấy từ query `listModuleFields` của module `settings`) không chứa key này.
* **Giao diện:** `app/admin/settings/_components/SettingsPageShell.tsx` có render checkbox cho `enable_product_frames` và liên kết với state của form (`form.enable_product_frames`).
* **Hàm lưu cài đặt:** `handleSave` trong `SettingsPageShell.tsx` chỉ gom các key trong `fieldsData` và các danh sách hardcode: `contact` keys, `product_image_placeholder`, `frameKeys` (chứa 5 ảnh overlay), `watermarkKeys`, `header_config`, `email-config`, `PRODUCT_CONTACT_SALE_LINK_TYPE_KEY`.
* **Kết quả:** Key `enable_product_frames` hoàn toàn bị bỏ qua trong payload gửi lên API `setMultiple`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Root Cause (Nguyên nhân gốc):** `enable_product_frames` thiếu trong logic thu thập dữ liệu cấu hình trước khi gọi mutation `setMultiple` ở hàm `handleSave` tại tệp [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx).
* **Counter-Hypothesis (Giả thuyết đối chứng):** Liệu backend API có chặn việc lưu key này? 
  * *Kiểm chứng:* Mutation `setMultiple` nhận đối số `value` dạng `v.any()` và thực hiện `patch`/`insert` trực tiếp vào bảng `settings` bằng key gửi lên, không qua whitelist filter ở backend. Do đó, giả thuyết backend chặn bị loại trừ. Hoàn toàn do frontend không gửi lên.

# IV. Proposal (Đề xuất)
Sửa hàm `handleSave` trong tệp [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx) để bổ sung key `enable_product_frames` vào danh sách `settingsToSave` dưới dạng giá trị boolean thực sự.

```typescript
      if (!settingsToSave.some((item) => item.key === 'enable_product_frames')) {
        settingsToSave.push({
          group: 'advanced',
          key: 'enable_product_frames',
          value: form.enable_product_frames === true || form.enable_product_frames === 'true',
        });
      }
```

# V. Files Impacted (Tệp bị ảnh hưởng)
* **Sửa:** [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx)
  * Vai trò hiện tại: Component chính hiển thị và xử lý lưu toàn bộ cài đặt hệ thống cho Admin.
  * Thay đổi: Bổ sung logic gom key `enable_product_frames` khi chuẩn bị payload lưu cài đặt.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc lại vùng dòng 850 - 875 trong [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx).
2. Dùng công cụ `replace_file_content` chèn thêm logic push `enable_product_frames` vào ngay sau đoạn push `frameKeys` và trước `watermarkKeys`.
3. Kiểm tra tĩnh để đảm bảo không có lỗi cú pháp hoặc gõ sai tên biến.

# VII. Verification Plan (Kế hoạch kiểm chứng)
### Manual Verification (Kiểm chứng thủ công)
* **Bước 1:** Truy cập trang `/admin/settings/advanced` -> Tab **Khung viền sản phẩm**.
* **Bước 2:** Bật checkbox "Bật khung viền sản phẩm", bấm nút **Lưu cài đặt**.
* **Bước 3:** Tải lại trang (F5). Xác nhận checkbox vẫn ở trạng thái **Bật**.
* **Bước 4:** Tắt checkbox "Bật khung viền sản phẩm", bấm nút **Lưu cài đặt**.
* **Bước 5:** Tải lại trang (F5). Xác nhận checkbox đã ở trạng thái **Tắt**.
* **Bước 6:** Ra ngoài storefront, xác nhận khung viền sản phẩm ẩn/hiện tương ứng với trạng thái đã cấu hình.

# VIII. Todo
* [ ] Sửa [SettingsPageShell.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/settings/_components/SettingsPageShell.tsx) để lưu key `enable_product_frames` dạng boolean.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* Checkbox "Bật khung viền sản phẩm" lưu thành công trạng thái tắt/bật sau khi F5 trang.
* Giá trị lưu xuống database là kiểu boolean (`true` / `false`), khớp với mong đợi của hooks `useProductFrameConfig`.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro:** Rất thấp, thay đổi chỉ ảnh hưởng đến việc lưu một key đơn lẻ trong cài đặt.
* **Rollback:** Revert thay đổi trong file `SettingsPageShell.tsx` về commit gần nhất.

# XI. Out of Scope (Ngoài phạm vi)
* Các cấu hình về vị trí, căn lề, tỷ lệ ảnh, hoặc upload ảnh của watermark/khung viền.
* Sửa đổi cấu hình của module khác ngoài settings.
