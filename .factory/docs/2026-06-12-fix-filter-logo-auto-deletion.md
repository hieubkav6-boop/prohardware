# Implementation Plan - Sửa Lỗi Tự Động Xóa Nhầm Logo Của Bộ Lọc (Filters)

## I. Primer

### 1. TL;DR kiểu Feynman
Khi ta tải một bức ảnh lên trang web, hệ thống sẽ lưu tạm bức ảnh đó ở dạng "nháp" (draft). Nếu sau một khoảng thời gian (ở đây là 6 tiếng) mà hệ thống không thấy bất kỳ ghi chú nào xác nhận bức ảnh đó đang được sử dụng chính thức ở đâu (gọi là "file references"), hệ thống sẽ tự động dọn dẹp và xóa bức ảnh đó đi để tránh lãng phí dung lượng. 
Lỗi xảy ra vì khi ta tạo hoặc sửa bộ lọc (filters), hệ thống chỉ lưu đường dẫn ảnh vào bộ lọc đó mà quên viết giấy xác nhận sử dụng chính thức cho bức ảnh. Do đó, sau 6 tiếng, hệ thống dọn dẹp nhầm tưởng bức ảnh này không ai dùng và xóa mất. 
Để sửa, chúng ta cần bổ sung thêm bước ký xác nhận sử dụng ảnh (gọi hàm `syncOwnerFilesAndCleanup`) khi tạo, cập nhật hoặc sao chép bộ lọc, và hủy xác nhận (gọi hàm `removeOwnerFilesAndCleanup`) khi xóa bộ lọc.

### 2. Elaboration & Self-Explanation
Hệ thống sử dụng Convex Storage để lưu trữ các tệp tải lên. Quy trình tải tệp chuẩn gồm hai bước:
- **Bước 1:** Frontend upload file và ghi nhận một bản ghi tạm trong `fileDraftUploads` có trạng thái là `"draft"`.
- **Bước 2:** Khi thực hiện lưu đối tượng sở hữu (ở đây là filter hoặc filterValue), Backend Mutation phải gọi hàm đồng bộ tham chiếu file. Hàm này sẽ tạo bản ghi trong bảng `fileReferences` liên kết đối tượng với tệp, đồng thời chuyển trạng thái tệp trong `fileDraftUploads` thành `"committed"`.

Hiện tại, các mutation của `courseFilters.ts` và `resourceFilters.ts` (bao gồm `create`, `update`, `createValue`, `updateValue`, `copyCourseFiltersToResources`, và `copyResourceFiltersToCourses`) hoàn toàn không thực hiện Bước 2. Điều này khiến các ảnh logo tải lên giữ nguyên trạng thái `"draft"`.
Khi cron job `cleanup-expired-draft-file-uploads` chạy định kỳ mỗi giờ, nó sẽ quét các file draft đã quá hạn 6 giờ. Do không có bản ghi tham chiếu nào trong bảng `fileReferences` trỏ đến các file này, hàm `hasFileReferences` trả về `false`, và cron job lập tức xóa các file logo này khỏi storage.

### 3. Concrete Examples & Analogies
Hãy tưởng tượng Convex Storage là một kho lưu trữ hành lý ký gửi tạm thời.
- Khi một khách hàng (logo) đến, họ được cấp một thẻ tạm ("draft"). Nếu sau 6 giờ mà không có ai đến nhận dạng hành lý này thuộc phòng nào (không ghi nhận trong `fileReferences`), quản lý kho (cron job dọn dẹp) sẽ đem hủy hành lý đó.
- Đối với các module khác như `courses` hay `resources`, khi nhận khách vào phòng, tiếp tân luôn khai báo với kho rằng hành lý này thuộc phòng số X (gọi `syncOwnerFilesAndCleanup`).
- Riêng đối với `courseFilters` và `resourceFilters`, tiếp tân chỉ cho khách vào phòng nhưng quên không khai báo với kho. Sau 6 giờ, quản lý kho đi kiểm tra thấy hành lý vẫn ghi thẻ tạm và không có phòng nào đăng ký, nên đã đem đi tiêu hủy, mặc dù khách vẫn đang ở trong phòng.

---

## II. Audit Summary (Tóm tắt kiểm tra)
Chúng tôi đã kiểm tra hệ thống và xác nhận các điểm sau:
1. File `convex/crons.ts` chạy một job hourly gọi `internal.fileLifecycle.cleanupExpiredDraftUploads`.
2. File `convex/fileLifecycle.ts` tự động xóa các file draft hết hạn mà không có liên kết tham chiếu trong bảng `fileReferences`.
3. Cả hai file backend `convex/courseFilters.ts` và `convex/resourceFilters.ts` đều thiếu lệnh gọi `syncOwnerFilesAndCleanup` hoặc `removeOwnerFilesAndCleanup` trong tất cả các thao tác ghi dữ liệu (tạo mới, cập nhật, sao chép, và xóa) đối với bộ lọc (`courseFilters`/`resourceFilters`) và giá trị bộ lọc (`courseFilterValues`/`resourceFilterValues`).

---

## III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Độ tin cậy nguyên nhân gốc:** High (Cao)
- **Lý do:** Logic code của hai file filters hoàn toàn thiếu phần wiring với `fileService`. Khi so sánh với các module hoạt động bình thường khác như `courses.ts` hay `resources.ts`, tất cả đều sử dụng `syncOwnerFilesAndCleanup` để bảo vệ file khỏi bị xóa bởi cron job dọn dẹp.

---

## IV. Proposal (Đề xuất)
Tích hợp đồng bộ hóa và dọn dẹp tệp tin bằng cách import và gọi các helper từ `convex/lib/fileService.ts` vào `convex/courseFilters.ts` và `convex/resourceFilters.ts`.

### 1. Đồng bộ hóa khi Tạo mới (Create) / Sao chép (Copy)
Khi tạo mới filter hoặc filterValue, nếu có truyền `iconStorageId`, ta sẽ gọi:
```typescript
await syncOwnerFilesAndCleanup(
  ctx,
  { ownerField: "iconStorageId", ownerId: newId, ownerTable: "TableName", purpose: "filter-icon" },
  [iconStorageId]
);
```

### 2. Đồng bộ hóa khi Cập nhật (Update)
Khi cập nhật, ta cần lấy dữ liệu cũ trước để có `previousStorageIds`, sau đó patch và gọi:
```typescript
const previousStorageIds = [oldRecord.iconStorageId];
// patch...
await syncOwnerFilesAndCleanup(
  ctx,
  { ownerField: "iconStorageId", ownerId: id, ownerTable: "TableName", purpose: "filter-icon" },
  [updates.iconStorageId !== undefined ? updates.iconStorageId : oldRecord.iconStorageId],
  { previousStorageIds }
);
```

### 3. Dọn dẹp khi Xóa (Remove)
Khi xóa một filter hoặc filterValue, ta gọi `removeOwnerFilesAndCleanup` để xóa tham chiếu và giải phóng file khỏi storage:
```typescript
await removeOwnerFilesAndCleanup(
  ctx,
  { ownerId: id, ownerTable: "TableName" },
  { previousStorageIds: [oldRecord.iconStorageId] }
);
```
*(Lưu ý: Đối với việc xóa filter cha mà có cascade delete các filter values con, ta cũng phải lặp qua các filter values con để xóa tham chiếu file logo của chúng).*

---

## V. Files Impacted (Tệp bị ảnh hưởng)

### 1. `Sửa:` [courseFilters.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/convex/courseFilters.ts)
*Vai trò hiện tại:* Chứa các API mutations và queries cho bộ lọc khóa học.
*Thay đổi:* 
- Import `syncOwnerFilesAndCleanup` và `removeOwnerFilesAndCleanup` từ `./lib/fileService`.
- Cập nhật mutation `create` để sync file cho filter mới tạo (và cả filter partner được tạo nếu có `copyToPartner`).
- Cập nhật mutation `update` để sync file cho filter cập nhật (so sánh với `iconStorageId` cũ).
- Cập nhật mutation `remove` để dọn dẹp file logo của filter bị xóa và toàn bộ các filter values con bị cascade delete.
- Cập nhật mutation `createValue` để sync file cho value mới tạo (và cả value partner được tạo nếu có `copyToPartner`).
- Cập nhật mutation `updateValue` để sync file cho value cập nhật.
- Cập nhật mutation `removeValue` để dọn dẹp file logo của value bị xóa.

### 2. `Sửa:` [resourceFilters.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/convex/resourceFilters.ts)
*Vai trò hiện tại:* Chứa các API mutations và queries cho bộ lọc tài nguyên.
*Thay đổi:*
- Import các helper tương tự.
- Cập nhật các mutation `create`, `update`, `remove`, `createValue`, `updateValue`, `removeValue` tương tự như `courseFilters.ts`.
- Cập nhật mutation `copyCourseFiltersToResources` để sync file cho các filter và filter values được nhân bản sang tài nguyên.
- Cập nhật mutation `copyResourceFiltersToCourses` để sync file cho các filter và filter values được nhân bản sang khóa học.

---

## VI. Execution Preview (Xem trước thực thi)
1. Thêm import helper fileService vào `courseFilters.ts` và `resourceFilters.ts`.
2. Sửa mutation `create` và `update` trong cả 2 file để gọi `syncOwnerFilesAndCleanup`.
3. Sửa mutation `remove` trong cả 2 file để lấy thông tin các tệp logo hiện có của filter và các values con, sau đó gọi `removeOwnerFilesAndCleanup`.
4. Sửa mutation `createValue`, `updateValue`, `removeValue` trong cả 2 file tương ứng.
5. Sửa mutations sao chép (`copyCourseFiltersToResources`, `copyResourceFiltersToCourses`) trong `resourceFilters.ts`.
6. Thực hiện test review tĩnh (dry-run review) để đảm bảo không lỗi cú pháp hoặc kiểu dữ liệu (TypeScript).

---

## VII. Verification Plan (Kế hoạch kiểm chứng)

### Kiểm chứng tự động:
- Kiểm tra tính đúng đắn về kiểu dữ liệu (TypeScript) bằng cách chạy:
  `bunx tsc --noEmit`

### Kiểm chứng thủ công:
1. Tạo một filter mới và tải lên logo.
2. Kiểm tra trong Convex Dashboard (hoặc bảng `fileReferences` và `fileDraftUploads`) xem bản ghi reference đã được tạo và file đã chuyển trạng thái thành `"committed"` hay chưa.
3. Cập nhật logo của filter đó và kiểm tra xem file logo cũ có bị xóa khỏi storage và file logo mới có được committed hay chưa.
4. Xóa filter và kiểm tra xem file logo có bị xóa hoàn toàn khỏi storage hay chưa.

---

## VIII. Todo
- [ ] Cập nhật `convex/courseFilters.ts`
  - [ ] Thêm imports từ `./lib/fileService`
  - [ ] Sửa mutation `create`
  - [ ] Sửa mutation `update`
  - [ ] Sửa mutation `remove`
  - [ ] Sửa mutation `createValue`
  - [ ] Sửa mutation `updateValue`
  - [ ] Sửa mutation `removeValue`
- [ ] Cập nhật `convex/resourceFilters.ts`
  - [ ] Thêm imports từ `./lib/fileService`
  - [ ] Sửa mutation `create`
  - [ ] Sửa mutation `update`
  - [ ] Sửa mutation `remove`
  - [ ] Sửa mutation `createValue`
  - [ ] Sửa mutation `updateValue`
  - [ ] Sửa mutation `removeValue`
  - [ ] Sửa mutation `copyCourseFiltersToResources`
  - [ ] Sửa mutation `copyResourceFiltersToCourses`
- [ ] Chạy type check để xác minh tính chính xác

---

## IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Tất cả các thao tác thêm/sửa logo bộ lọc và giá trị bộ lọc đều tạo ra bản ghi liên kết hợp lệ trong `fileReferences`.
- Bất kỳ logo nào cũ bị thay thế hoặc bộ lọc bị xóa đều kích hoạt việc dọn dẹp file tương ứng trong Convex Storage.
- Không phát sinh lỗi biên dịch TypeScript.

---

## X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro:** Một số file cũ trước đây không được sync có thể bị xóa nếu ta cập nhật filter đó mà không truyền logo mới, tuy nhiên điều này là đúng vì file đó vốn dĩ đã bị coi là mồ côi (hoặc thực tế đã bị cron job xóa từ trước rồi).
- **Rollback:** `git checkout convex/courseFilters.ts convex/resourceFilters.ts` để khôi phục trạng thái ban đầu.
