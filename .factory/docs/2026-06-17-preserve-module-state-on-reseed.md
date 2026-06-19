# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề**: Khi người dùng nhấn nút "seed lại" trên trang Quản lý Modules, hệ thống sẽ xóa sạch bảng `adminModules` rồi thêm lại tất cả. Điều này vô tình bật lại (kích hoạt) toàn bộ các module đã được người dùng tắt trước đó.
* **Giải pháp**: Trước khi xóa dữ liệu cũ để seed lại, chúng ta đọc và lưu lại trạng thái bật/tắt (`enabled`) của từng module hiện tại. Khi chèn lại các module mới vào database, chúng ta áp dụng lại trạng thái bật/tắt cũ. Nếu xuất hiện thêm module mới trong code, module mới đó mới sử dụng trạng thái mặc định.
* **Kết quả**: Module nào đang tắt thì vẫn tiếp tục tắt sau khi seed lại. Các module mới được phát triển sẽ xuất hiện bình thường.

## 2. Elaboration & Self-Explanation
Logic seed của `adminModules` được định nghĩa trong [adminModules.seeder.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts).
Khi tham số `force: true` được gửi từ UI khi bấm nút "seed lại", seeder sẽ chạy hàm `clear()` để xóa sạch bảng `adminModules`, sau đó lọc các module bị thiếu so với mảng tĩnh định nghĩa trong file seeder và insert lại. Vì bảng đã bị xóa sạch trước đó, tất cả các module đều bị coi là thiếu và được chèn mới từ đầu với trạng thái `enabled` mặc định (đa số là `true`), làm mất đi cấu hình bật/tắt thực tế của người dùng.

Để giải quyết, ta sẽ:
* Đọc trạng thái `enabled` của tất cả các module trước khi thực hiện hành động `clear()`.
* Tạo một Map lưu trữ cặp giá trị `{ [moduleKey]: enabled }`.
* Áp dụng map này để ghi đè trường `enabled` của danh sách module tĩnh trước khi chèn vào DB.
* Các module mới tinh chưa có trong map sẽ giữ nguyên cấu hình mặc định trong code.

## 3. Concrete Examples & Analogies
* **Ví dụ thực tế**: Bạn có 5 công tắc bóng đèn trong nhà. Bạn đã tắt công tắc số 2 và số 4. Khi thợ điện đến bảo trì (seed lại) để lắp thêm công tắc số 6 mới, thợ điện gỡ sạch 5 công tắc cũ và lắp lại 6 cái mới, đồng thời tự ý bật tất cả lên (reset trạng thái). Sau khi sửa xong, bóng đèn số 2 và số 4 vốn đang tắt lại bị bật sáng.
* **Giải pháp mới**: Thợ điện sẽ ghi chép lại: "Công tắc 2 và 4 đang tắt". Sau khi lắp mới cả 6 công tắc, thợ điện chỉnh công tắc 2 và 4 về trạng thái tắt như cũ, còn công tắc số 6 mới thì bật lên mặc định.

---

# II. Audit Summary (Tóm tắt kiểm tra)
* Đã định vị file seeder chịu trách nhiệm xử lý logic seed cho bảng `adminModules` là [adminModules.seeder.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts).
* Đã xác định cách thức hoạt động của tham số `force: true` trong hàm `seed()` gây ra việc xóa và ghi đè trạng thái `enabled`.
* Mức độ rủi ro: Thấp, chỉ thay đổi logic khôi phục dữ liệu khi chạy seed và không ảnh hưởng đến dữ liệu nghiệp vụ khác của module.

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Root Cause Confidence**: High.
* **Reason**: Hàm `clear()` của [AdminModulesSeeder](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts#L82-L85) xóa sạch mọi record trong bảng `adminModules` mà không lưu lại trạng thái bật/tắt hiện tại của chúng trước khi chèn các giá trị mặc định tĩnh từ code.

---

# IV. Proposal (Đề xuất)
* Sửa đổi phương thức `seed()` của [AdminModulesSeeder](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts#L16-L63):
  1. Đọc trạng thái `enabled` của các module hiện tại từ DB bằng query trước khi gọi `clear()`.
  2. Ghi nhận trạng thái này vào một Map.
  3. Ghi đè thuộc tính `enabled` của danh sách module tĩnh dựa trên Map trên.
  4. Tiếp tục thực hiện `clear()` và chèn dữ liệu như cũ.

---

# V. Files Impacted (Tệp bị ảnh hưởng)
* **Sửa**: [adminModules.seeder.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts)
  * Vai trò hiện tại: Định nghĩa và chèn dữ liệu mặc định cho các modules hệ thống.
  * Thay đổi: Lưu trạng thái `enabled` hiện tại trước khi clear và khôi phục lại trạng thái đó cho các module tương ứng khi ghi lại.

---

# VI. Execution Preview (Xem trước thực thi)
1. Tạo Spec và Implementation Plan.
2. Đọc file [adminModules.seeder.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts).
3. Cập nhật logic khôi phục trạng thái `enabled` trong hàm `seed()`.
4. Review tĩnh mã nguồn để đảm bảo không có lỗi TypeScript hay logic.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
* Vì quy tắc cấm tự chạy `npm run lint` hoặc `npm run build` và Verification runtime do tester/user phụ trách, kế hoạch kiểm chứng sẽ bao gồm:
  1. Yêu cầu user hoặc tester thực hiện chạy seed lại trên localhost:3000/system/modules để kiểm tra xem các module đang bị tắt có bị tự động bật lại hay không.
  2. Kiểm tra log Convex xem quá trình seed thành công, không có lỗi runtime.

---

# VIII. Todo
* [ ] Sửa file [adminModules.seeder.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts) bảo lưu trạng thái `enabled`.

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* Trạng thái bật/tắt (thuộc tính `enabled`) của các module hiện tại trong DB được giữ nguyên sau khi bấm nút "seed lại".
* Các module mới được định nghĩa thêm trong code seeder sẽ tự động được thêm vào DB với trạng thái mặc định của chúng.

---

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* Rủi ro thấp vì chỉ can thiệp vào tiến trình Seed. Nếu xảy ra lỗi ngoài ý muốn, chỉ cần phục hồi lại file [adminModules.seeder.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/seeders/adminModules.seeder.ts) về phiên bản trước thông qua git.

---

# XI. Out of Scope (Ngoài phạm vi)
* Thay đổi cấu trúc schema của `adminModules` hoặc logic của các seeder khác.
* Thay đổi giao diện hay logic bấm nút ở Front-end.
