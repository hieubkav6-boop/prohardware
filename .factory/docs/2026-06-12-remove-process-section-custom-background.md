# Spec: Loại bỏ màu nền tùy chỉnh (custom background) của component Quy trình làm việc (ProcessSection)

# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề**: Component "Quy trình làm việc" (Process) đang tự vẽ một màu nền xám nhạt (`neutralBackground`/`neutralSurface`) làm nó bị lệch tông và tạo ra một dải màu riêng so với nền chung của trang ở cả Light Mode và Dark Mode.
* **Cách sửa**: Đổi màu nền ngoài cùng (wrapper background) của tất cả các kiểu layout (circular, horizontal, stepper, cards, accordion, minimal, compactMinimal, grid, alternating) thành `transparent`. Như vậy, component sẽ hiển thị mượt mà trên màu nền hệ thống (body/layout lớn).
* **Kết quả**: Component Quy trình làm việc sẽ không còn dải nền xám riêng biệt nữa, mà hòa nhập hoàn toàn vào màu nền sáng/tối của trang web.

## 2. Elaboration & Self-Explanation
Hiện nay, component Quy trình làm việc dùng biến màu `tokens.neutralBackground` hoặc `tokens.neutralSurface` để làm màu nền cho wrapper lớn nhất của từng kiểu hiển thị (layout). Khi render component này trên trang chủ, nó sẽ tạo ra một dải màu ngang màn hình có màu khác với màu nền của body (ví dụ màu trắng `#ffffff` ở Light Mode của trang, trong khi component lại tô màu xám nhạt `#f8fafc`).
Để loại bỏ nền riêng này, ta sẽ đặt thuộc tính `backgroundColor` của wrapper ngoài cùng thành `transparent` thay vì dùng token màu. Việc đổi này không làm ảnh hưởng đến các khối nội dung bên trong như card, vòng tròn trung tâm hay các nút bấm (những phần này vẫn giữ nguyên màu nền `surfaceCol`/`neutralSurface` để có độ tương phản tốt với nền trang).

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể**:
  * Trước khi sửa: Component Process ở layout Stepper có style inline `backgroundColor: '#f8fafc'`. Khi đặt trên nền trang màu trắng (`#ffffff`), ta sẽ thấy một dải xám nhạt.
  * Sau khi sửa: Component Process có style inline `backgroundColor: 'transparent'`. Nó sẽ hiển thị trực tiếp trên nền trắng của trang.
* **Hình ảnh tương tự**: Giống như việc đặt một nhãn dán trong suốt lên một cuốn sổ thay vì dùng một nhãn dán có viền xám đục. Nhãn dán trong suốt sẽ hiển thị trực tiếp màu giấy của cuốn sổ bên dưới.

# II. Audit Summary (Tóm tắt kiểm tra)
* Đã kiểm tra file `app/admin/home-components/process/_components/ProcessSectionShared.tsx` và xác định được các dòng áp dụng `style={{ backgroundColor: tokens.neutralBackground }}` hoặc `tokens.neutralSurface` cho wrapper ngoài cùng.
* Xác nhận layout `circular` vốn dĩ không gán background cho wrapper ngoài cùng nên đã kế thừa nền trang, tuy nhiên các layout khác như `horizontal`, `stepper`, `cards`, `accordion`, `minimal`, `compactMinimal`, `grid`, `alternating` vẫn đang bị áp background. Do đó việc loại bỏ nền cần áp dụng đồng bộ cho tất cả các layout của component Process này.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Nguyên nhân**: Các hàm render layout (`renderHorizontal`, `RenderStepper`, `renderCards`, `renderAccordion`, `renderMinimal`, `renderCompactMinimal`, `renderGrid`, `renderAlternating`) trong `ProcessSectionShared.tsx` chỉ định rõ `backgroundColor: tokens.neutralBackground` hoặc `tokens.neutralSurface` làm màu nền cho thẻ wrapper ngoài cùng.
* **Độ tin cậy nguyên nhân gốc**: High (100% vì đã xác định rõ dòng code inline style).
* **Giả thuyết đối chứng**: Nếu chỉ sửa cho layout `circular` thì các layout khác khi chuyển đổi trong preview admin hoặc cấu hình runtime vẫn sẽ bị dải nền riêng này. Do đó, việc loại bỏ nền phải áp dụng rộng rãi cho toàn bộ component Quy trình làm việc.

# IV. Proposal (Đề xuất)
* Thay thế thuộc tính `backgroundColor` của wrapper ngoài cùng trong tất cả các hàm render layout của component `ProcessSectionShared.tsx` thành `'transparent'`.
* Giữ nguyên các thuộc tính background của các phần tử con bên trong (như các card, nút bấm, vòng tròn giữa) để đảm bảo tính thẩm mỹ và độ tương phản của nội dung.

# V. Files Impacted (Tệp bị ảnh hưởng)
* **Sửa**: [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx)
  * Mô tả vai trò: Là component dùng chung để hiển thị toàn bộ các layout của Quy trình làm việc cho cả phía Site thực tế lẫn trang Preview Admin.
  * Thay đổi: Đổi `backgroundColor` của các thẻ wrapper ngoài cùng sang `'transparent'`.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc và chỉnh sửa [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
2. Tìm các vị trí render layout và thay thế:
   * `renderHorizontal` (dòng 178)
   * `RenderStepper` (dòng 276)
   * `renderCards` (dòng 423)
   * `renderAccordion` (dòng 570)
   * `renderMinimal` (dòng 765)
   * `renderCompactMinimal` (dòng 869)
   * `renderGrid` (dòng 945)
   * `renderAlternating` (dòng 1057)
3. Chạy kiểm tra TypeScript tĩnh để đảm bảo không lỗi cú pháp.

# VII. Verification Plan (Kế hoạch kiểm chứng)
* **Automated Tests**:
  * Chạy biên dịch TypeScript tĩnh: `bunx tsc --noEmit` để xác minh tính đúng đắn về kiểu dữ liệu.
* **Manual Verification**:
  * Kiểm tra hiển thị trong Preview của Admin và trên trang chủ ở cả Light Mode và Dark Mode để đảm bảo không còn dải nền xám riêng biệt.

# VIII. Todo
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderHorizontal` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `RenderStepper` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderCards` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderAccordion` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderMinimal` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderCompactMinimal` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderGrid` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).
- [ ] Cập nhật `backgroundColor` thành `'transparent'` ở `renderAlternating` trong [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* Component Quy trình làm việc không có bất kỳ màu nền đè riêng biệt nào ở bên ngoài cùng.
* Màu chữ và màu viền hoạt động chính xác dựa trên theme hệ thống (light/dark) do adapter thích ứng màu hoạt động tự động.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* Rủi ro thấp: Chỉ thay đổi màu nền ngoài cùng của component Quy trình làm việc.
* Hoàn tác: Sử dụng `git checkout` để khôi phục file [ProcessSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/admin/home-components/process/_components/ProcessSectionShared.tsx).

# XI. Out of Scope (Ngoài phạm vi)
* Không thay đổi logic, màu sắc hay vị trí của các component con bên trong (như các card, nút bước, vòng tròn ở giữa) trừ việc đổi màu nền wrapper ngoài cùng thành trong suốt.
* Không can thiệp vào CSS toàn cục của trang.
