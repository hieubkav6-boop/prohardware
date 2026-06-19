# I. Primer
## 1. TL;DR kiểu Feynman
- **Mục tiêu:** Làm cho dự án hiện tại chạy code mới nhất giống hệt dự án "dohy" (Core) nhưng vẫn dùng cơ sở dữ liệu (Convex DB) cũ của dự án hiện tại, đồng thời dọn dẹp và chuẩn hóa dữ liệu cũ cho khớp với cấu trúc code mới.
- **Cách làm:** 
  1. Kéo toàn bộ code từ thư mục "dohy" đè lên code hiện tại qua Git.
  2. Dọn sạch lỗi cú pháp (Lint) và lỗi kiểu dữ liệu (TypeScript).
  3. Chạy lệnh quét dữ liệu để tìm những chỗ lệch cấu trúc giữa DB cũ và Code mới.
  4. Chạy các hàm sửa dữ liệu tự động có sẵn để cập nhật dữ liệu cũ lên chuẩn mới.

## 2. Elaboration & Self-Explanation
Chúng ta đang nâng cấp dự án hiện tại lên ngang với dự án Core mẫu mới nhất (dohy). Bằng cách dùng Git Squash Merge với remote tạm thời trỏ đến thư mục dohy, ta có thể nhập toàn bộ thay đổi và giải quyết tất cả conflict bằng cách ghi đè hoàn toàn bằng file từ Core (`checkout --theirs`). Sau đó ta chạy kiểm tra tĩnh bằng `tsc` và `oxlint` để đảm bảo code sạch lỗi trước khi thực hiện commit.
Đối với Convex DB, chúng ta sẽ đọc cấu hình kết nối từ `.env.local` (đã xác nhận là `dev:bright-chicken-833`), quét sự không khớp giữa dữ liệu hiện tại và schema của code mới bằng hàm quét data contract, và chạy các hàm backfill có sẵn trong code để tự động cập nhật dữ liệu.

## 3. Concrete Examples & Analogies
- *Ví dụ:* Nếu bảng `settings` yêu cầu có thêm trường `theme` (mặc định là `"light"`), nhưng dữ liệu cũ chưa có trường này. Ta sẽ gọi một mutation backfill để cập nhật trường `theme` cho tất cả bản ghi settings cũ thành `"light"`.
- *Ví dụ so sánh:* Giống như ta mang một thiết bị điện tử mới về lắp vào hệ thống điện cũ trong nhà. Đầu tiên ta cắm thiết bị mới vào (Phase 1), sau đó ta chỉnh lại các đầu nối dây điện và công tắc cho khớp thông số (Phase 2) để không xảy ra chập cháy.

# II. Audit Summary (Tóm tắt kiểm tra)
- Workspace hiện tại: `e:\NextJS\study\admin-ui-aistudio\system-vietadmin-nextjs`
  - Nhánh: `master`, trạng thái: sạch (clean).
- Core repo: `E:\NextJS\job\job_from_system_vietadmin\system_dohy`
  - Nhánh: `master`, trạng thái: sạch (clean).
- Convex DB URL: `https://bright-chicken-833.convex.cloud`
- Convex Deployment: `dev:bright-chicken-833`

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- *Hiện trạng:* Code dự án hiện tại cũ hơn dohy. Dữ liệu DB hiện tại chưa khớp với schema mới của dohy.
- *Giải pháp:* Thực hiện đồng bộ hóa code theo quy trình squash merge, sau đó chạy quét và sửa dữ liệu Convex DB thông qua các mutation backfill có sẵn.

# IV. Proposal (Đề xuất)
- Tiến hành Phase 1: Thêm remote tạm thời `core-update`, fetch, squash merge, giải quyết conflict qua `git checkout --theirs .`, typecheck, lint --fix, commit chốt và cài đặt dependencies.
- Tiến hành Phase 2: Xác nhận deployment, chạy `dataManager:scanDataContracts`, chạy các hàm backfill tương ứng, verify lại, và xuất báo cáo evidence.

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Toàn bộ codebase:** Sẽ cập nhật theo dohy core.
- **Convex DB:** Các bảng dữ liệu sẽ được cập nhật các trường còn thiếu hoặc loại bỏ các trường thừa.

# VI. Execution Preview (Xem trước thực thi)
1. Chạy lệnh Git để remote add, fetch và merge squash từ dohy core.
2. Checkout `--theirs` cho tất cả các file bị xung đột.
3. Chạy typecheck và lint tự động cho đến khi sạch lỗi.
4. Tạo commit Phase 1.
5. Cài dependencies mới bằng `bun install`.
6. Khởi động local server kiểm tra nhanh.
7. Thực hiện quy trình Phase 2 cho Convex DB qua Convex CLI hoặc dashboard/function call.
8. Quét lại để xác nhận 0 lỗi dữ liệu.
9. Chạy âm báo hoàn thành.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Typecheck: `bunx tsc --noEmit` phải exit 0.
- Lint: `bunx oxlint --type-aware --type-check --fix` phải exit 0.
- Data Contract Scan: Quét không còn lỗi.

# VIII. Todo
- [ ] Phase 1: Thêm remote core-update và fetch lịch sử.
- [ ] Phase 1: Thực hiện squash merge từ core-update/master.
- [ ] Phase 1: Giải quyết conflict ưu tiên code mới (checkout --theirs).
- [ ] Phase 1: Kiểm tra type check & sửa lỗi.
- [ ] Phase 1: Chạy oxlint sửa cú pháp tự động.
- [ ] Phase 1: Commit chốt và gỡ remote.
- [ ] Phase 1: Chạy bun install và test dev server.
- [ ] Phase 2: Xác nhận deployment và quét Data Contract.
- [ ] Phase 2: Thực hiện backfill dữ liệu tương ứng.
- [ ] Phase 2: Quét lại Data Contract để xác nhận 0 issues.
- [ ] Phase 2: Chạy âm báo hoàn thành và báo cáo evidence.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Mã nguồn được nâng cấp hoàn toàn đồng bộ với dohy.
- Dự án compile thành công mà không có lỗi TypeScript hay Lint.
- Dữ liệu Convex DB của môi trường hiện tại vượt qua Data Contract check.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Nhánh `master` cục bộ có thể khôi phục lại trạng thái ban đầu bằng `git reset --hard origin/master`.

# XI. Out of Scope (Ngoài phạm vi)
- Không refactor code ngoài quy trình nâng cấp.
- Không sửa schema thủ công mà không quét dữ liệu.

# XII. Open Questions (Câu hỏi mở)
- Nhánh mặc định của dohy core được xác nhận là `master` qua lệnh kiểm tra trạng thái trước đó.
