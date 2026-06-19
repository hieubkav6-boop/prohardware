# I. Primer

## 1. TL;DR kiểu Feynman
- **Đồng bộ hóa code:** Ta sẽ lấy toàn bộ code mới nhất từ dự án Core (đường dẫn `E:\NextJS\study\admin-ui-aistudio\system-vietadmin-nextjs`) đè lên dự án hiện tại bằng Git Squash Merge (`checkout --theirs`).
- **Giữ nguyên DB cũ:** Giữ kết nối database cũ (`CONVEX_DEPLOYMENT` từ `.env.local`), không xóa DB hiện tại.
- **Kiểm tra kiểu dữ liệu & Lint:** Chạy `tsc` để kiểm tra lỗi type và `oxlint` để tự động sửa lỗi code trước khi commit.
- **Cập nhật dữ liệu (Migration):** Quét các bảng trong database cũ bằng `dataManager:scanDataContracts` để phát hiện sự khác biệt về schema (thiếu field, thừa field).
- **Backfill:** Dùng các hàm mutation/action có sẵn trong codebase mới để điền giá trị mặc định cho các field bị thiếu của dữ liệu cũ, đưa database về trạng thái chuẩn mà không làm hỏng dữ liệu hiện tại.

## 2. Elaboration & Self-Explanation
- **Tại sao cần làm vậy?** Khi dự án Core được phát triển thêm các tính năng mới, cấu trúc code và cấu trúc database (schema) của nó sẽ thay đổi. Dự án của chúng ta (`system_dohy`) đang dùng code cũ. Để hưởng các tính năng mới, ta cần lấy code mới về. Nhưng database của chúng ta đã có dữ liệu thực tế, ta không thể xóa đi tạo lại. Vì vậy ta cần quy trình hai bước:
  1. Đưa toàn bộ code mới về (Phase 1).
  2. Dùng code mới để quét dữ liệu cũ, phát hiện những chỗ thiếu trường dữ liệu và tự động bổ sung dữ liệu mặc định (Phase 2 - Backfill).
- **Quy trình Git Squash Merge:**
  - Ta thêm remote tạm thời trỏ đến thư mục Core trên đĩa cứng.
  - Thực hiện merge với flag `--squash` để gom tất cả thay đổi từ Core thành một cục duy nhất trên branch hiện tại của ta.
  - Sử dụng lệnh `git checkout --theirs .` để chỉ định rằng nếu có bất kỳ xung đột nào giữa Core và dự án cũ, ta luôn ưu tiên nhận toàn bộ code từ Core. Điều này giúp loại bỏ việc giải quyết conflict thủ công cực kỳ rủi ro.
- **Quy trình Backfill:**
  - Code mới có thể yêu cầu một số trường dữ liệu mới (ví dụ trường `priority` trong bảng task hoặc trường `slogan` trong settings).
  - Ta chạy chức năng scan để biết bảng nào đang thiếu trường gì.
  - Ta chạy các hàm backfill có sẵn để tự động điền các trường này cho tất cả bản ghi cũ.

## 3. Concrete Examples & Analogies
- **Ví dụ cụ thể:** Giả sử phiên bản Core mới thêm tính năng phân loại sản phẩm có trường `status` (active/inactive) và trường này là bắt buộc trong code mới. Trong database cũ của chúng ta, các sản phẩm đã được tạo từ trước không hề có trường `status` này. Khi code mới chạy, nó sẽ bị lỗi vì đọc phải giá trị `undefined` hoặc DB schema validate thất bại. Quá trình Backfill sẽ quét tất cả sản phẩm cũ và tự động thêm `status: "active"` cho chúng.
- **Hình ảnh ẩn dụ:** Hãy tưởng tượng bạn có một nhà máy sản xuất xe hơi (code cũ) và một bãi xe đã sản xuất xong (database cũ). Bây giờ nhà thiết kế nâng cấp bản vẽ thiết kế xe hơi lên phiên bản mới (code mới) yêu cầu mọi xe hơi đều phải có túi khí an toàn. Việc nâng cấp nhà máy giống như Phase 1 (đồng bộ code mới). Việc lắp thêm túi khí cho tất cả các xe cũ đang nằm ở bãi xe để chúng đạt chuẩn an toàn mới chính là Phase 2 (Backfill data).

# II. Audit Summary (Tóm tắt kiểm tra)
- **Trạng thái Git hiện tại:** Sạch sẽ (`working tree clean`), đang ở nhánh `master`.
- **Môi trường DB hiện tại:** `CONVEX_DEPLOYMENT=dev:tidy-fox-725` (phát hiện trong tệp [env.local](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/.env.local)).
- **Địa chỉ Core:** `E:\NextJS\study\admin-ui-aistudio\system-vietadmin-nextjs`

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Vấn đề:** Sự lệch pha về tính năng và schema giữa bản Core đang phát triển liên tục và dự án nhánh phụ (`system_dohy`).
- **Nguyên nhân gốc:** Dự án `system_dohy` chưa được đồng bộ code mới nhất từ Core, dẫn đến việc thiếu các thành phần UI mới và các ràng buộc dữ liệu (data contract) mới trong database.
- **Giả thuyết đối chứng:** 
  - Nếu thực hiện copy file thủ công: Sẽ rất dễ bỏ sót các file cấu hình quan trọng (`package.json`, `tsconfig.json`, `convex/schema.ts`) hoặc tạo ra các lỗi biên dịch chồng chéo.
  - Giải pháp Git Squash Merge + checkout `--theirs` là an toàn nhất vì nó đảm bảo tính nhất quán 100% của source code với Core mới nhất, đồng thời giữ nguyên lịch sử git cục bộ của dự án nhánh.

# IV. Proposal (Đề xuất)
- **Thực hiện Phase 1 (Sync Code Mới):**
  1. Thêm git remote tạm thời: `git remote add core-update "E:\NextJS\study\admin-ui-aistudio\system-vietadmin-nextjs"`.
  2. Lấy dữ liệu: `git fetch core-update`.
  3. Squash merge: `git merge --squash core-update/main --allow-unrelated-histories` (sẽ dùng nhánh `main` hoặc kiểm tra xem Core dùng nhánh nào).
  4. Ghi đè: `git checkout --theirs .` để nhận toàn bộ code Core.
  5. Xử lý xóa các file rác hoặc nháp (nếu có) phát sinh để đảm bảo workspace sạch.
  6. Chạy typecheck và lint tự động sửa lỗi: `bunx tsc --noEmit` và `bunx oxlint --type-aware --type-check --fix`.
  7. Commit chốt: `chore: sync and upgrade to latest Viet Admin core`.
  8. Cài đặt lại dependencies: `bun install`.
  9. Chạy thử `bun run dev` để kiểm tra runtime.
- **Thực hiện Phase 2 (Migrate/Backfill Convex DB):**
  1. Xác nhận deployment và URL.
  2. Chạy `dataManager:scanDataContracts` hoặc hàm scan tương đương để tìm sự lệch pha dữ liệu.
  3. Sử dụng các hàm backfill có sẵn trong codebase để điền dữ liệu cho các trường thiếu hụt (`missing` / `recommended`).
  4. Thực hiện xóa các trường lỗi thời (`deprecated`) sau khi đã xác nhận canonical data hoạt động đúng.
  5. Chạy lại `scanDataContracts` để xác nhận 0 issue / 0 warning.

# V. Files Impacted (Tệp bị ảnh hưởng)
- Vì đây là tiến trình merge toàn bộ code từ Core, hầu như toàn bộ các file nguồn trong dự án sẽ bị ảnh hưởng.
- **Sửa:** Toàn bộ các file code trong `app/`, `components/`, `convex/`, `lib/`, `types/` và các file cấu hình như `package.json`, `tsconfig.json` sẽ được cập nhật lên phiên bản mới nhất từ Core.

# VI. Execution Preview (Xem trước thực thi)
1. Thêm remote và fetch từ Core.
2. Thực hiện `merge --squash` và giải quyết xung đột bằng cách nhận toàn bộ file Core.
3. Kiểm tra kiểu (`tsc`) và lint (`oxlint`), sửa các lỗi kiểu dữ liệu phát sinh nếu có.
4. Chạy `bun install`.
5. Chạy `bun run dev` để đảm bảo hệ thống khởi chạy bình thường.
6. Xác nhận biến môi trường Convex.
7. Chạy scan data contracts và tiến hành migrate/backfill dữ liệu.
8. Xác minh kết quả cuối cùng.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- **Type check:** Lệnh `bunx tsc --noEmit` phải chạy thành công không có lỗi kiểu dữ liệu.
- **Lint check:** Lệnh `bunx oxlint --type-aware --type-check` phải chạy thành công với mã thoát (exit code) là 0.
- **Runtime check:** Dự án phải khởi động được bằng `bun run dev` và truy cập được localhost mà không crash.
- **Data check:** Scan data contracts cho kết quả 0 issues / 0 warnings.

# VIII. Todo
- [ ] Thêm remote Core tạm thời và fetch lịch sử.
- [ ] Thực hiện squash merge và checkout `--theirs`.
- [ ] Chạy kiểm tra kiểu dữ liệu (`tsc`) và tự động fix lint (`oxlint`).
- [ ] Commit thay đổi code mới.
- [ ] Cài đặt dependencies mới.
- [ ] Kiểm tra khởi động ứng dụng (`bun run dev`).
- [ ] Quét data contract hiện tại.
- [ ] Thực hiện backfill dữ liệu thiếu thông qua Convex functions.
- [ ] Quét lại data contract để đảm bảo sạch lỗi.
- [ ] Kiểm tra các surface chức năng chính (Products, Home Components, Settings).

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Code mới đồng bộ hoàn chỉnh từ Core, không còn code cũ bị xung đột.
- `bunx tsc --noEmit` chạy không lỗi.
- `bunx oxlint --type-aware --type-check` chạy không lỗi.
- Database Convex sau khi backfill không còn cảnh báo lệch schema hoặc thiếu trường (0 issues).
- Mọi chức năng chính (Products list, Settings, Home Components) hoạt động chính xác.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro:** Một số cấu trúc schema mới của Core có thể không tương thích ngược với dữ liệu cũ nếu không được backfill đúng cách.
- **Hoàn tác:** Trước khi thực hiện merge, ta có git commit hiện tại là sạch. Nếu xảy ra lỗi nghiêm trọng không thể khắc phục trong quá trình merge hoặc type check, ta có thể hoàn tác dễ dàng bằng lệnh `git reset --hard HEAD` để quay lại trạng thái ban đầu.

# XI. Out of Scope (Ngoài phạm vi)
- Không chỉnh sửa code Core hoặc thêm tính năng mới ngoài những gì Core đã có.
- Không thay đổi hoặc sửa đổi dữ liệu nằm ngoài các bảng được yêu cầu bởi schema mới.
