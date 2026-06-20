# Spec (Đặc tả): Thiết kế grid-cols động cho Footer dựa trên số lượng cột thực tế

# I. Primer

## 1. TL;DR kiểu Feynman
Khi người dùng tạo footer cho website, họ có thể thêm từ 1 đến 4 cột thông tin (như "Về chúng tôi", "Hỗ trợ", "Liên kết"...).
- **Hiện tại:** Layout của footer luôn giả định có đủ 4 cột, nên nó chia sẵn màn hình làm 4 phần bằng nhau. Nếu người dùng chỉ nhập 1, 2 hoặc 3 cột, các cột này sẽ bị co nhỏ lại và dồn về bên trái, để lại một khoảng trống lớn không đẹp mắt ở bên phải.
- **Giải pháp:** Chúng ta sẽ đếm xem thực tế có bao nhiêu cột được tạo (gọi là `N`). Sau đó, thay vì chia cố định thành 4 phần, chúng ta sẽ chia màn hình thành `N` phần (hoặc `N + 1` phần cho layout đặc biệt). Nhờ vậy, các cột sẽ tự động giãn rộng ra, lấp đầy không gian trống và trông rất cân đối, vừa vặn.

## 2. Elaboration & Self-Explanation
Trong các tệp render footer (`FooterPreview.tsx`, `DynamicFooter.tsx`, và `ComponentRenderer.tsx`), hệ thống hỗ trợ 6 kiểu thiết kế khác nhau (Classic, Modern, Corporate, Minimal, Centered, Stacked).
Trong đó, phần lớn các kiểu thiết kế này sử dụng một lưới CSS Grid (`grid-cols-4` hoặc `md:grid-cols-4`) để xếp các cột menu.
Khi số lượng cột menu thực tế nhỏ hơn 4, lưới 4 cột vẫn được tạo ra. CSS Grid sẽ để trống các ô lưới ở phía bên phải.
Bằng cách thay đổi cấu hình lưới một cách động:
- Tính số cột thực tế `N = Math.min(columns.length, 4)`.
- Sinh các class CSS Grid tương ứng:
  - Nếu `N = 1`: chia lưới thành 1 cột (`grid-cols-1`).
  - Nếu `N = 2`: chia lưới thành 2 cột (`grid-cols-2`).
  - Nếu `N = 3`: chia lưới thành 3 cột (`md:grid-cols-3` hoặc `grid-cols-2 md:grid-cols-3`).
  - Nếu `N = 4`: chia lưới thành 4 cột (`md:grid-cols-4` hoặc `grid-cols-2 md:grid-cols-4`).
Điều này đảm bảo rằng các cột thông tin sẽ tự động co giãn để lấp đầy toàn bộ chiều rộng được phân bổ (`col-span`), tránh việc phân bố không đều và tăng trải nghiệm thị giác của người dùng.

## 3. Concrete Examples & Analogies
- **Ví dụ thực tế:** Nếu bạn có 2 cột thông tin là "Thông tin liên hệ" và "Chính sách bảo mật". 
  - Trước đây: Mỗi cột chỉ chiếm 25% chiều rộng của khu vực chứa link (1/4), 50% còn lại ở bên phải là khoảng trống màu đỏ (hoặc màu nền).
  - Sau khi sửa: Mỗi cột sẽ tự động chiếm 50% chiều rộng khu vực chứa link, chữ dàn trải đều, dễ đọc hơn và không tạo cảm giác giao diện bị trống trải, thiếu nội dung.
- **Hình ảnh so sánh:** Giống như một chiếc bàn ăn có 4 chiếc ghế cố định xếp một bên. Khi chỉ có 2 người ngồi, họ phải ngồi dồn vào 2 ghế đầu tiên, để lại 2 ghế trống. Thay vào đó, ta đổi sang một chiếc bàn tùy biến kích thước vừa đủ cho 2 người, giúp mọi người ngồi thoải mái và không gian xung quanh ấm cúng hơn.

# II. Audit Summary (Tóm tắt kiểm tra)
Chúng tôi đã kiểm tra mã nguồn và phát hiện footer được render ở 3 nơi riêng biệt:
1. **Admin Preview:** [FooterPreview.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/home-components/footer/_components/FooterPreview.tsx) - hiển thị kết quả trực quan khi admin chỉnh sửa footer.
2. **Site Runtime:** [DynamicFooter.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/DynamicFooter.tsx) - footer hiển thị chính thức trên website thật.
3. **Component Builder / Renderer:** [ComponentRenderer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/ComponentRenderer.tsx) - footer render trong các trang khác hoặc chế độ xem trước của page builder.

Cả 3 file đều đang sử dụng cấu trúc lưới cố định `grid-cols-4` (hoặc `md:grid-cols-5` ở layout `centered`) cho các cột liên kết thông tin.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Nguyên nhân gốc:** Class Tailwind CSS cho số lượng cột lưới được khai báo tĩnh dạng `grid-cols-2 md:grid-cols-4` (hoặc tương tự) cho phần nội dung các cột liên kết mà không phụ thuộc vào độ dài thực tế của mảng `columns`.
- **Giả thuyết đối chứng:** Nếu ta thay thế class tĩnh bằng class động được sinh ra dựa trên `columns.length` (giới hạn tối đa là 4), lưới grid sẽ thay đổi tương ứng. Khi đó các phần tử con sẽ tự động phân bổ lại không gian và giãn ra theo chiều ngang của lưới, giải quyết triệt để vấn đề trống layout.

# IV. Proposal (Đề xuất)
Định nghĩa hàm/logic xác định grid class động cho mỗi layout.
1. Với các style `classic`, `modern`, `corporate`, `minimal`, `stacked`:
   - Xác định `N = Math.min(columns.length, 4)`. Nếu không có cột nào, mặc định `N = 1`.
   - Sinh class `gridColsClass` động:
     - `N === 1`: `grid-cols-1 md:grid-cols-1`
     - `N === 2`: `grid-cols-2 md:grid-cols-2`
     - `N === 3`: `grid-cols-2 md:grid-cols-3`
     - `N === 4`: `grid-cols-2 md:grid-cols-4`
2. Với style `centered` ( Magazine Style):
   - Grid bao gồm 1 cột cho Brand Logo và `N` cột cho Link. Tổng cộng có `N + 1` cột.
   - Sinh class `gridColsClass` động:
     - `N === 1`: `grid-cols-1 md:grid-cols-2`
     - `N === 2`: `grid-cols-1 md:grid-cols-3`
     - `N === 3`: `grid-cols-1 md:grid-cols-4`
     - `N === 4`: `grid-cols-1 md:grid-cols-5`

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa:** [FooterPreview.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/home-components/footer/_components/FooterPreview.tsx)
  - Mô tả vai trò: Hợp phần hiển thị xem trước footer ở trang quản trị.
  - Thay đổi: Áp dụng logic sinh class grid động cho cả 6 styles.
- **Sửa:** [DynamicFooter.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/DynamicFooter.tsx)
  - Mô tả vai trò: Render footer trên trang web chính thức.
  - Thay đổi: Áp dụng logic sinh class grid động cho cả 6 styles.
- **Sửa:** [ComponentRenderer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/ComponentRenderer.tsx)
  - Mô tả vai trò: Render footer trong trình dựng trang (page builder).
  - Thay đổi: Áp dụng logic sinh class grid động cho cả 6 styles trong component `FooterSection`.

# VI. Execution Preview (Xem trước thực thi)
1. Tạo kế hoạch kiểm chứng và spec.
2. Sửa lần lượt 3 tệp, thay thế grid classes tĩnh bằng class tính toán động dựa vào độ dài thực tế của danh sách cột.
3. Thực hiện review tĩnh cấu trúc mã nguồn đã chỉnh sửa.
4. Chạy Oxlint / Typecheck qua Git Hooks để đảm bảo chất lượng code sạch.

# VII. Verification Plan (Kế hoạch kiểm chứng)
Vì quy tắc cấm tự ý chạy lint/unit test trực tiếp, chúng ta sẽ thực hiện review tĩnh kỹ lưỡng:
- Đọc lại code thay đổi để đảm bảo không sai cú pháp JSX/TSX.
- Kiểm tra các import và kiểu dữ liệu của biến `columns` trong cả 3 component.
- Chạy lệnh typecheck `bunx tsc --noEmit` thủ công để đảm bảo dự án không bị lỗi TypeScript.

# VIII. Todo
- [ ] Cập nhật [FooterPreview.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/home-components/footer/_components/FooterPreview.tsx)
- [ ] Cập nhật [DynamicFooter.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/DynamicFooter.tsx)
- [ ] Cập nhật [ComponentRenderer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/ComponentRenderer.tsx)
- [ ] Kiểm tra lỗi TypeScript toàn dự án.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Khi số lượng cột menu là 1, 2, hoặc 3, giao diện footer (cả preview admin, site runtime và component builder) sẽ hiển thị đúng số cột tương ứng trong lưới grid mà không để lại khoảng trống cột thừa ở bên phải.
- Mọi layout co giãn mượt mà và full chiều rộng.
- Không có lỗi compile hay TypeScript.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro:** Thiết kế grid-cols động có thể ảnh hưởng tới các class Tailwind CSS chưa được nạp (purged). Do Tailwind biên dịch tĩnh, các class động sinh ra bằng phép nối chuỗi như `grid-cols-${N}` có thể không hoạt động nếu các class đó chưa bao giờ xuất hiện ở dạng tĩnh trong codebase.
- **Biện pháp giảm thiểu:** Không sử dụng phép nối chuỗi trực tiếp kiểu `grid-cols-${N}`. Thay vào đó, khai báo rõ ràng các chuỗi class hoàn chỉnh như `'grid-cols-1 md:grid-cols-1'`, `'grid-cols-2 md:grid-cols-2'`, v.v. Điều này giúp Tailwind CSS dễ dàng phát hiện và đóng gói các class cần thiết vào bản build.
- **Rollback:** Dùng Git rollback lại các file đã chỉnh sửa nếu có bất kỳ lỗi hiển thị nào xảy ra.

# XI. Out of Scope (Ngoài phạm vi)
- Không chỉnh sửa database schema của footer.
- Không bổ sung thêm các tính năng tuỳ chỉnh khác cho footer ngoài phạm vi yêu cầu của người dùng.
