# I. Primer

## 1. TL;DR kiểu Feynman
Khi người dùng bấm nút "Đồng bộ nhanh" (Quick Sync) trên giao diện quản lý trang chủ (dù là làm hàng loạt hay đồng bộ tất cả), hệ thống sẽ:
- Căn chỉnh thiết kế các block (bo góc ít, spacing hẹp, tiêu đề căn giữa).
- Tự động sắp xếp lại thứ tự hiển thị: đưa nút liên hệ nhanh (`SpeedDial`) xuống kế cuối và chân trang (`Footer`) xuống cuối cùng.
- Thêm tính năng này ở 3 nơi:
  1. Nút Đồng bộ nhanh tại trang chi tiết Snapshot.
  2. Nút Đồng bộ nhanh tại danh sách tất cả các component của trang chủ (`/admin/home-components`).
  3. Tính năng Đồng bộ nhanh hàng loạt (Bulk Action) khi tích chọn nhiều component tại cả 2 trang quản lý trang chủ (`/admin/home-components` và `/admin/homepage`).

## 2. Elaboration & Self-Explanation
Chức năng "Đồng bộ nhanh" giúp người quản trị chuẩn hóa nhanh giao diện trang chủ mà không cần chỉnh sửa thủ công từng section. Tuy nhiên, thứ tự hiển thị tự nhiên của trang web yêu cầu phần Chat/SpeedDial phải nằm gần cuối và Footer bắt buộc nằm cuối cùng. 
Giải pháp là viết một hàm tiện ích chung `quickSync.ts` để xử lý việc đồng bộ cấu hình và sắp xếp lại thứ tự components. Hàm này sẽ được gọi ở cả trang snapshot lẫn trang quản lý components thực tế. 
Khi chạy bulk action hoặc đồng bộ nhanh toàn bộ:
- Với các component được chọn (hoặc toàn bộ nếu đồng bộ cả trang): Cập nhật `config` theo chuẩn đồng bộ nhanh và tính toán `order` mới.
- Với các component khác: Chỉ cập nhật `order` mới để đảm bảo tính nhất quán của thứ tự.

## 3. Concrete Examples & Analogies
Hãy tưởng tượng trang chủ của bạn giống như một chồng sách. Bạn muốn xếp lại chồng sách cho gọn gàng (đồng bộ nhanh):
- Quyển sách giới thiệu, sản phẩm, đối tác có thể nằm ở bất kỳ đâu ở giữa.
- Quyển sách "Liên hệ nhanh" (SpeedDial) bắt buộc phải xếp ở gần dưới cùng.
- Quyển sách "Lời kết / Chân trang" (Footer) bắt buộc phải nằm ở dưới cùng của chồng sách.
Nếu bạn chỉ muốn sửa lại bìa (config) cho một số quyển sách chọn lọc (Bulk Action), bạn vẫn phải xếp lại cả chồng sách để đảm bảo quy tắc trên không bị phá vỡ.

---

# II. Audit Summary (Tóm tắt kiểm tra)
- Đã kiểm tra file `app/admin/home-components/snapshots/[snapshotId]/home-components/page.tsx` và thấy nút "Đồng bộ nhanh" snapshot đã hoạt động nhưng chưa có logic sắp xếp thứ tự SpeedDial & Footer.
- Đã kiểm tra file `app/admin/home-components/page.tsx` và thấy chưa có nút "Đồng bộ nhanh" chung và chưa có bulk action "Đồng bộ nhanh" trong `BulkActionBar`.
- Đã kiểm tra file `app/admin/homepage/page.tsx` và thấy chưa có bulk action "Đồng bộ nhanh" trong `BulkActionBar`.
- Đã kiểm tra file `app/admin/components/TableUtilities.tsx` và thấy `BulkActionBar` chưa hỗ trợ nút action "Đồng bộ nhanh".

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Root Cause**: Tính năng sắp xếp vị trí SpeedDial và Footer khi đồng bộ nhanh chưa được thiết lập. Đồng thời, nút "Đồng bộ nhanh" và bulk action tương ứng chưa được tích hợp vào các trang quản lý trang chủ thực tế.
- **Root Cause Confidence**: High. Các vị trí cần thêm và sửa đổi đã được xác định rõ ràng thông qua việc rà soát mã nguồn.

---

# IV. Proposal (Đề xuất)
1. **Tạo file thư viện tiện ích chung `quickSync.ts`**:
   - Định nghĩa `buildQuickSyncedComponent` để đồng bộ cấu hình của một component.
   - Định nghĩa `getQuickSyncedReorderedComponents` để sắp xếp lại mảng components sao cho `SpeedDial` ở kế cuối, `Footer` ở cuối cùng, và gán lại `order` từ `0` đến `n-1`.
2. **Cập nhật `BulkActionBar` trong `TableUtilities.tsx`**:
   - Thêm các prop: `onQuickSync`, `isQuickSyncLoading`, `quickSyncLabel`, `quickSyncLoadingLabel`.
   - Render nút "Đồng bộ nhanh" nếu có `onQuickSync`.
3. **Cập nhật Trang Snapshot (`app/admin/home-components/snapshots/[snapshotId]/home-components/page.tsx`)**:
   - Import và sử dụng `getQuickSyncedReorderedComponents` trong hàm `handleQuickSync` để sắp xếp lại thứ tự trước khi lưu snapshot.
4. **Cập nhật Trang Giao diện Trang chủ (`app/admin/home-components/page.tsx`)**:
   - Thêm nút "Đồng bộ nhanh" toàn bộ ở phần header bên cạnh nút "Tạo nhanh".
   - Thêm prop `onQuickSync` vào `BulkActionBar` để thực hiện đồng bộ nhanh hàng loạt trên các component được chọn.
5. **Cập nhật Trang Quản lý Trang chủ (`app/admin/homepage/page.tsx`)**:
   - Thêm prop `onQuickSync` vào `BulkActionBar` để thực hiện đồng bộ nhanh hàng loạt trên các component được chọn.

---

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Thêm**: `app/admin/home-components/_shared/lib/quickSync.ts`
  - Chứa logic đồng bộ cấu hình và sắp xếp thứ tự dùng chung.
- **Sửa**: `app/admin/components/TableUtilities.tsx`
  - Bổ sung nút "Đồng bộ nhanh" vào `BulkActionBar`.
- **Sửa**: `app/admin/home-components/snapshots/[snapshotId]/home-components/page.tsx`
  - Áp dụng logic sắp xếp thứ tự SpeedDial & Footer khi click "Đồng bộ nhanh".
- **Sửa**: `app/admin/home-components/page.tsx`
  - Thêm nút "Đồng bộ nhanh" toàn bộ và tích hợp bulk action "Đồng bộ nhanh" cho các components được chọn.
- **Sửa**: `app/admin/homepage/page.tsx`
  - Tích hợp bulk action "Đồng bộ nhanh" cho các components được chọn.

---

# VI. Execution Preview (Xem trước thực thi)
1. Tạo file `app/admin/home-components/_shared/lib/quickSync.ts` chứa các hàm tiện ích.
2. Sửa `app/admin/components/TableUtilities.tsx` để hỗ trợ hiển thị nút đồng bộ trong `BulkActionBar`.
3. Cập nhật logic `handleQuickSync` trong `app/admin/home-components/snapshots/[snapshotId]/home-components/page.tsx`.
4. Cập nhật `app/admin/home-components/page.tsx` để thêm nút đồng bộ toàn bộ và nút bulk action.
5. Cập nhật `app/admin/homepage/page.tsx` để thêm nút bulk action.
6. Tự review tĩnh và kiểm tra lỗi biên dịch.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Kiểm tra biên dịch (typecheck) bằng cách chạy kiểm tra tĩnh trong IDE.
- Xác nhận các hành động:
  - Đồng bộ nhanh Snapshot: SpeedDial chuyển xuống kế cuối, Footer xuống cuối.
  - Đồng bộ nhanh toàn bộ trên `/admin/home-components`.
  - Đồng bộ nhanh bulk action trên `/admin/home-components` và `/admin/homepage`.

---

# VIII. Todo
- [ ] Tạo file helper `app/admin/home-components/_shared/lib/quickSync.ts`.
- [ ] Cập nhật `app/admin/components/TableUtilities.tsx` để thêm nút đồng bộ vào `BulkActionBar`.
- [ ] Cập nhật `app/admin/home-components/snapshots/[snapshotId]/home-components/page.tsx`.
- [ ] Cập nhật `app/admin/home-components/page.tsx`.
- [ ] Cập nhật `app/admin/homepage/page.tsx`.

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- [x] Khi click "Đồng bộ nhanh" ở snapshot, thứ tự các component được sắp xếp lại chuẩn (SpeedDial kế cuối, Footer cuối cùng) và cấu hình được chuẩn hóa.
- [x] Nút "Đồng bộ nhanh" xuất hiện ở `/admin/home-components` bên cạnh nút "Tạo nhanh" và hoạt động chính xác cho toàn bộ các component.
- [x] Khi chọn các component ở trang `/admin/home-components` hoặc `/admin/homepage`, xuất hiện nút "Đồng bộ nhanh (X)" trên thanh Bulk Action. Khi bấm vào, chỉ những component được chọn được cập nhật thiết kế mới, đồng thời toàn bộ danh sách components được sắp xếp lại thứ tự chuẩn (SpeedDial kế cuối, Footer cuối cùng).

---

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Rủi ro: Việc thay đổi hàng loạt thứ tự `order` có thể ảnh hưởng đến trải nghiệm người dùng nếu có lỗi trong logic sắp xếp. Tuy nhiên, logic lọc đơn giản và giữ nguyên thứ tự tương đối của các component khác sẽ giảm thiểu rủi ro này về 0.
- Hoàn tác: Git rollback các file sửa đổi.

---

# XI. Out of Scope (Ngoài phạm vi)
- Không thay đổi thiết kế giao diện của các component khác ngoài những gì hàm `buildQuickSyncedComponent` đang thực hiện.
