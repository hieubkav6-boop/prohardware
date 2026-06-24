# I. Primer

## 1. TL;DR kiểu Feynman
- Khi bấm nút "Sửa" một giá trị thuộc tính (như Penfolds), ta cần mở một hộp thoại (Dialog) chứa trình soạn thảo văn bản mô tả (LexicalEditor).
- Lỗi xảy ra do trạng thái mô tả (`editDescription`) bị cập nhật trễ một nhịp (qua `useEffect` sau khi Dialog đã hiển thị) khiến LexicalEditor khởi tạo bằng dữ liệu cũ (hoặc rỗng) của giá trị thuộc tính vừa đóng trước đó.
- Sau khi `useEffect` cập nhật đúng mô tả mới của Penfolds, LexicalEditor từ chối cập nhật lại nội dung do cơ chế tối ưu hóa so khớp khóa (`resetKey` không thay đổi sau nhịp mount đầu tiên).
- Giải pháp: Cập nhật đồng bộ các trường thông tin (tên, slug, mô tả) của thuộc tính ngay khi nhấn nút "Sửa" (`handleStartEdit`) thay vì đợi qua `useEffect`, đảm bảo Dialog và LexicalEditor nhận ngay dữ liệu chuẩn ở nhịp render đầu tiên.

## 2. Elaboration & Self-Explanation
Trình soạn thảo văn bản mô tả `LexicalEditor` là một component tương đối nặng và quản lý state riêng. Để hiển thị nội dung ban đầu từ cơ sở dữ liệu, component này sử dụng plugin `InitialContentPlugin` lắng nghe thuộc tính `initialContent` và `resetKey` ở nhịp mount đầu tiên.
Ở code hiện tại, khi click nút "Sửa", state `editingTerm` được set. Dialog ngay lập tức mount `LexicalEditor` khi `editingTerm !== null`. Tuy nhiên, state lưu trữ nội dung soạn thảo `editDescription` chỉ thực sự được điền qua một hook `useEffect` phụ thuộc vào `editingTerm`:
```tsx
  useEffect(() => {
    if (editingTerm) {
      setEditName(editingTerm.name);
      setEditSlug(editingTerm.slug);
      setEditDescription(editingTerm.description ?? '');
    }
  }, [editingTerm]);
```
Do `useEffect` chạy sau khi quá trình render kết thúc, ở nhịp render đầu tiên của Dialog, `editDescription` vẫn mang giá trị cũ (rỗng hoặc giá trị của term được mở trước đó). `LexicalEditor` mount với `initialContent` stale này. Khi `useEffect` chạy xong và cập nhật `editDescription` thành mô tả mới, `InitialContentPlugin` bỏ qua việc cập nhật vì `resetKey` không thay đổi so với nhịp render đầu tiên.
Để khắc phục, chúng ta chuyển đổi luồng cập nhật state từ không đồng bộ (qua `useEffect`) sang đồng bộ (qua hàm handler `handleStartEdit` được gọi trực tiếp bởi sự kiện click của nút "Sửa").

## 3. Concrete Examples & Analogies
- **Ví dụ cụ thể**:
  1. Người dùng click "Sửa" Penfolds (mô tả: *"Thương hiệu rượu vang nổi tiếng từ Úc."*).
  2. Dialog hiển thị, `LexicalEditor` mount với mô tả từ state cũ (ví dụ: *"oke nha"* của term trước đó).
  3. Parent component cập nhật mô tả của Penfolds lên state sau đó 10ms, nhưng `LexicalEditor` đã chốt hiển thị *"oke nha"* và không đổi nữa.
- **Hình ảnh ẩn dụ**: Giống như việc gửi một phong bì thư trống/cũ đến một người, sau đó chạy đuổi theo hét lên nội dung bức thư mới. Người nhận đã bóc phong bì cũ và cất vào tủ, họ sẽ không nghe hoặc không cập nhật lại nội dung bạn hét nữa. Cách đúng là bỏ bức thư mới vào phong bì trước khi gửi đi.

# II. Audit Summary (Tóm tắt kiểm tra)
- Tập tin `app/admin/attribute-groups/[id]/edit/page.tsx` chứa trình quản lý giá trị thuộc tính `AttributeTermsManager`.
- Dialog sửa thuộc tính phụ thuộc vào state `editingTerm`, `editName`, `editSlug`, và `editDescription`.
- Dialog được ẩn/hiển dựa trên điều kiện `{editingTerm && ...}` dẫn đến việc mount/unmount component liên tục.
- `LexicalEditor` sử dụng `resetKey` để định danh việc khởi tạo lại dữ liệu nội dung, nhưng do state đồng bộ chậm nhịp render đầu tiên nên `resetKey` và `initialContent` bị lệch pha.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Độ tin cậy nguyên nhân gốc**: High (Cao).
- **Lý do**:
  - `editDescription` được cập nhật trong `useEffect` lắng nghe `editingTerm`.
  - Khi click sửa, Dialog hiển thị ngay lập tức (do `editingTerm` không còn là `null`). Lúc này `editDescription` vẫn lưu giá trị của phiên làm việc trước đó.
  - `LexicalEditor` khởi tạo với `initialContent` cũ. Khi render kết thúc, `useEffect` cập nhật `editDescription` mới, kích hoạt render lần 2 nhưng `resetKey` của `LexicalEditor` (đặt là `${editingTerm._id}:description`) không đổi giữa lần 1 và lần 2, khiến trình soạn thảo bỏ qua cập nhật.
- **Giả thuyết đối chứng**: Nếu ta cập nhật đồng bộ toàn bộ state lúc click nút "Sửa", `LexicalEditor` sẽ nhận được `initialContent` chính xác ngay nhịp render đầu tiên khi mount, do đó sẽ hiển thị đúng thông tin ngay lập tức.

# IV. Proposal (Đề xuất)
- Xóa bỏ `useEffect` tự động đồng bộ hóa state theo `editingTerm` ở file page.tsx.
- Xây dựng hàm `handleStartEdit(term: any)` để cập nhật đồng bộ `editingTerm`, `editName`, `editSlug`, và `editDescription` cùng một lúc.
- Chuyển `onEdit={setEditingTerm}` sang `onEdit={handleStartEdit}` trong phần gọi `SortableTermRow`.
- Xây dựng hàm `handleCloseEdit()` để reset toàn bộ state chỉnh sửa về trạng thái mặc định/rỗng khi đóng Dialog hoặc sau khi lưu thành công.
- Thay thế các lệnh gọi `setEditingTerm(null)` bằng `handleCloseEdit()`.

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa**: [app/admin/attribute-groups/[id]/edit/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_thienkim/app/admin/attribute-groups/[id]/edit/page.tsx)
  - Quản lý trạng thái chỉnh sửa thuộc tính của nhóm thuộc tính.
  - Sửa logic khởi động chỉnh sửa và đóng chỉnh sửa đồng bộ hóa state để loại bỏ độ trễ render.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc kỹ file code để xác định chính xác các điểm cần thay thế.
2. Áp dụng thay đổi cấu trúc quản lý state trong `AttributeTermsManager`.
3. Kiểm tra tính tương thích và định dạng của code.
4. Chạy build/lint tự động qua cơ chế git hooks khi commit hoặc kiểm tra tĩnh bằng mắt.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- **Kiểm chứng thủ công**:
  1. Mở trang sửa nhóm thuộc tính, bấm "Sửa" vào một thuộc tính có mô tả (ví dụ: Penfolds). Xem mô tả hiển thị đúng không.
  2. Bấm "Hủy" hoặc click ra ngoài để đóng Dialog.
  3. Bấm "Sửa" một thuộc tính khác có mô tả khác (hoặc không có mô tả). Xem mô tả mới hiển thị chuẩn không, có bị dính mô tả cũ không.
  4. Thực hiện chỉnh sửa mô tả, nhấn "Lưu thay đổi", kiểm tra thông tin lưu thành công và Dialog đóng, mở lại hiển thị đúng nội dung mới.

# VIII. Todo
- [x] Định nghĩa hàm `handleStartEdit` cập nhật đồng bộ các states: `editingTerm`, `editName`, `editSlug`, và `editDescription`.
- [x] Định nghĩa hàm `handleCloseEdit` để dọn dẹp các states khi đóng Dialog.
- [x] Xóa bỏ `useEffect` đồng bộ state cũ.
- [x] Thay thế prop `onEdit={setEditingTerm}` bằng `onEdit={handleStartEdit}` ở `SortableTermRow`.
- [x] Cập nhật sự kiện đóng Dialog (`onOpenChange` và nút "Hủy") để gọi `handleCloseEdit`.
- [x] Cập nhật kết quả lưu thành công trong `handleSaveEdit` để gọi `handleCloseEdit()`.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Hộp thoại chỉnh sửa giá trị thuộc tính luôn hiển thị chính xác 100% tên, slug và mô tả Lexical tương ứng của giá trị thuộc tính được chọn.
- Không còn hiện tượng lúc mở lên hiển thị mô tả này, lúc mở lên hiển thị mô tả khác của giá trị trước đó.
- Chức năng lưu thay đổi và hủy bỏ hoạt động trơn tru, dọn dẹp state sạch sẽ sau khi đóng.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro**: Không có rủi ro lớn vì đây là thay đổi hoàn toàn cục bộ trong phần quản lý state giao diện của một trang admin.
- **Hoàn tác**: Sử dụng `git checkout` để hoàn tác file `page.tsx` về trạng thái ban đầu nếu có bất kỳ lỗi không mong muốn nào xảy ra.

# XI. Out of Scope (Ngoài phạm vi)
- Không chỉnh sửa logic lưu dữ liệu ở phía backend Convex.
- Không thay đổi hành vi giao diện hoặc giao diện hiển thị của component `LexicalEditor`.
