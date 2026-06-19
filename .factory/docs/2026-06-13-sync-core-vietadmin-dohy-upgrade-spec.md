# I. Primer

## 1. TL;DR kiểu Feynman
* Chúng ta cần nâng cấp toàn bộ mã nguồn của dự án hiện tại lên phiên bản mới nhất từ dự án gốc (core) mang tên `system_dohy`.
* Quá trình này được thực hiện bằng cách thêm dự án gốc làm một remote git tạm thời, sau đó trộn (merge) theo kiểu nén (squash merge) để lấy toàn bộ code mới, ghi đè hoàn toàn mã nguồn cũ.
* Sau khi trộn mã nguồn mới, chúng ta cần chạy các công cụ kiểm tra (TypeScript và Linter) để đảm bảo không có lỗi cú pháp hoặc kiểu dữ liệu mới trước khi ghi nhận (commit).
* Cuối cùng, chúng ta kiểm tra dữ liệu hiện có trong cơ sở dữ liệu Convex của dự án xem có khớp với cấu trúc dữ liệu (schema) mới hay không, và chạy các hàm vá (backfill) có sẵn để đưa dữ liệu cũ về chuẩn mới mà không làm mất mát thông tin.

## 2. Elaboration & Self-Explanation
Mã nguồn của hệ thống quản trị Viet Admin liên tục được cập nhật các tính năng và sửa lỗi ở một repo gốc (trong trường hợp này là `system_dohy`). Dự án hiện tại của chúng ta đang sử dụng một phiên bản cũ hơn.
Do đó, chúng ta cần thực hiện quá trình đồng bộ hóa (sync). Thay vì sửa đổi từng file bằng tay dễ dẫn đến sai sót và bỏ sót, chúng ta dùng Git để tự động lấy toàn bộ file mới từ repo gốc về. Git Squash Merge giúp gom toàn bộ lịch sử thay đổi của core thành một commit duy nhất trên dự án hiện tại, giúp giữ lịch sử commit của dự án gọn gàng.
Sau khi trộn code mới, schema của cơ sở dữ liệu Convex cũng sẽ thay đổi theo mã nguồn mới. Những dữ liệu hiện có trên môi trường database cũ (bright-chicken-833) có thể bị thiếu các cột (fields) mới do schema mới quy định. Vì vậy, ta cần quét cơ sở dữ liệu để tìm ra các trường bị thiếu (`missing`), trường được khuyến nghị (`recommended`), và các trường đã lỗi thời (`deprecated`). Cuối cùng, ta chạy các mutation có sẵn để điền giá trị mặc định cho dữ liệu cũ (backfill) để DB tương thích hoàn toàn với code mới mà không cần phải xóa dữ liệu cũ đi làm lại từ đầu.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể:** Trong schema mới của core, bảng `products` (sản phẩm) yêu cầu phải có thêm một trường là `inventoryStatus` (trạng thái kho hàng) nhận giá trị `'in_stock'` hoặc `'out_of_stock'`. Trong database hiện tại của chúng ta, các sản phẩm cũ chưa hề có trường này. Sau khi sync code mới, hệ thống sẽ báo lỗi hoặc hoạt động sai lệch khi truy vấn các sản phẩm cũ này. Ta sẽ chạy hàm `dataManager:scanDataContracts` để phát hiện ra tất cả sản phẩm cũ đang thiếu trường `inventoryStatus`. Tiếp đó, ta chạy một mutation backfill có sẵn trong code mới (ví dụ: `backfillProducts`) để tự động cập nhật trường `inventoryStatus: 'in_stock'` cho các sản phẩm cũ đó.
* **Hình ảnh ẩn dụ:** Hãy tưởng tượng bạn đang nâng cấp hệ điều hành cho một chiếc điện thoại thông minh từ phiên bản cũ lên phiên bản mới. Việc sync code giống như việc cài đặt hệ điều hành mới đè lên hệ điều hành cũ. Việc backfill DB giống như việc mở các ứng dụng cũ lên và cập nhật lại file cấu hình của chúng sao cho tương thích với hệ điều hành mới, đảm bảo các tin nhắn và danh bạ cũ không bị mất và vẫn đọc được bình thường trên hệ điều hành mới.

# II. Audit Summary (Tóm tắt kiểm tra)

* **Trạng thái Git hiện tại:** Sạch sẽ (`working tree clean`), nhánh hiện tại là `master`.
* **Thông tin môi trường Convex:** Đọc từ `.env.local` cho thấy deployment hiện tại là `dev:bright-chicken-833`.
* **Dự án Core cập nhật:** Nằm tại đường dẫn tuyệt đối `E:\NextJS\job\job_from_system_vietadmin\system_dohy` với nhánh chính là `master`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

* **Vấn đề cần giải quyết:** Sự lệch pha về mã nguồn (source code drift) và cấu trúc dữ liệu (database schema drift) giữa dự án hiện tại và phiên bản core Viet Admin mới nhất từ `system_dohy`.
* **Giải pháp:** Áp dụng quy trình nâng cấp 2 giai đoạn (Phase 1: Git Squash Merge + Type check/Lint; Phase 2: Convex Data Contract Scan + Backfill qua mutation có sẵn) để đồng bộ hoàn toàn cả code và dữ liệu thật.

# IV. Proposal (Đề xuất)

* **Phase 1: Đồng bộ mã nguồn**
  * Thêm remote `core-update` trỏ tới `E:\NextJS\job\job_from_system_vietadmin\system_dohy`.
  * Trộn nén (`git merge --squash core-update/master --allow-unrelated-histories`).
  * Giải quyết xung đột bằng cách ưu tiên hoàn toàn code mới (`git checkout --theirs .`).
  * Thực hiện kiểm tra TypeScript (`bunx tsc --noEmit`) và Lint (`bunx oxlint --type-aware --type-check --fix`). Sửa lỗi thủ công nếu các công cụ này không tự sửa hết.
  * Commit thay đổi, dọn dẹp remote tạm thời, và cài lại dependencies.
* **Phase 2: Đồng bộ cơ sở dữ liệu**
  * Đọc `.env.local` để xác nhận deployment target.
  * Quét hợp đồng dữ liệu qua `npx convex run dataManager:scanDataContracts`.
  * Thực hiện chạy các hàm backfill có sẵn trong codebase để xử lý các vấn đề về trường thiếu (`missing`), khuyến nghị (`recommended`).
  * Xác minh lại bằng cách quét lại data contract cho tới khi đạt `0 issues`.
  * Kiểm tra thủ công hoạt động của các trang/chức năng chính.

# V. Files Impacted (Tệp bị ảnh hưởng)

Do thực hiện Git Squash Merge nhận toàn bộ mã nguồn từ Core, **toàn bộ các tệp nguồn trong dự án** đều có khả năng bị sửa đổi hoặc thêm mới để đồng bộ với Core mới nhất.
* `Sửa/Thêm:` Toàn bộ các file trong thư mục `app/`, `components/`, `convex/`, `lib/`, `types/`, `package.json`, v.v. để nhận cấu trúc và tính năng mới của Core.

# VI. Execution Preview (Xem trước thực thi)

1. **Khởi chạy Git Sync**:
   * Thêm remote `git remote add core-update "E:\NextJS\job\job_from_system_vietadmin\system_dohy"`
   * Fetch: `git fetch core-update`
   * Merge: `git merge --squash core-update/master --allow-unrelated-histories`
   * Checkout their code: `git checkout --theirs .` và add `git add .`
2. **Sửa lỗi Compile & Lint**:
   * Chạy kiểm tra type check: `bunx tsc --noEmit`
   * Chạy lint tự động sửa: `bunx oxlint --type-aware --type-check --fix`
   * Tiến hành commit: `git commit -m "chore: sync and upgrade to latest Viet Admin core"`
3. **Cập nhật Dependencies**:
   * Chạy `bun install` để đồng bộ các gói npm.
4. **Data Contract Check**:
   * Chạy `npx convex run dataManager:scanDataContracts`
5. **Backfill dữ liệu**:
   * Sử dụng các mutation/action tương ứng đã có trong mã nguồn mới để vá dữ liệu.

# VII. Verification Plan (Kế hoạch kiểm chứng)

## 1. Typecheck & Lint
* Chạy `bunx tsc --noEmit` để đảm bảo 0 lỗi TypeScript compile.
* Chạy `bunx oxlint --type-aware --type-check` để đảm bảo 0 lỗi linter nghiêm trọng.

## 2. Startup Verification
* Chạy `bun run dev` và truy cập ứng dụng ở localhost để đảm bảo không lỗi runtime lúc tải trang.

## 3. Database Integrity
* Chạy lại `npx convex run dataManager:scanDataContracts` và nhận kết quả `0 issues / 0 warnings` liên quan đến cấu trúc dữ liệu mới.

# VIII. Todo
* [ ] Phase 1: Thêm remote tạm và fetch lịch sử từ core
* [ ] Phase 1: Thực hiện squash merge từ core-update/master
* [ ] Phase 1: Checkout --theirs để lấy toàn bộ code mới
* [ ] Phase 1: Kiểm tra type check và chạy oxlint sửa lỗi
* [ ] Phase 1: Thực hiện commit nâng cấp và xóa remote tạm
* [ ] Phase 1: Cài đặt lại các dependencies và chạy dev server thử nghiệm
* [ ] Phase 2: Xác nhận môi trường Convex qua file `.env.local`
* [ ] Phase 2: Chạy kiểm tra hợp đồng dữ liệu qua `scanDataContracts`
* [ ] Phase 2: Chạy các hàm backfill tương ứng để vá các trường dữ liệu bị lệch
* [ ] Phase 2: Quét lại hợp đồng dữ liệu đảm bảo đạt `0 issues`
* [ ] Phase 2: Kiểm tra các surface chức năng chính và báo cáo evidence

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

* Mã nguồn đồng bộ hoàn toàn với Core `system_dohy`, không có conflict chưa giải quyết.
* `bunx tsc --noEmit` chạy sạch, không lỗi type.
* `bunx oxlint --type-aware --type-check --fix` chạy sạch, không lỗi lint.
* Ứng dụng khởi động bình thường qua `bun run dev`.
* Chạy `dataManager:scanDataContracts` đạt `0 issues / 0 warnings`.
* Báo cáo evidence đầy đủ theo format yêu cầu.

# X. Risk / Rollback (Rủi ro / Hoàn tác)

* **Rủi ro:** Một số file config local bị ghi đè dẫn đến lỗi kết nối hoặc mất cấu hình đặc thù.
* **Hoàn tác:** Vì chúng ta bắt đầu từ một working tree sạch, nếu gặp lỗi không thể giải quyết trong quá trình merge hoặc sửa type, ta có thể khôi phục lại trạng thái ban đầu bằng lệnh:
  `git reset --hard HEAD` và dọn dẹp remote tạm thời.

# XI. Out of Scope (Ngoài phạm vi)

* Không sửa đổi code chức năng của Core (ngoại trừ sửa lỗi TypeScript / Lint phát sinh do môi trường hoặc do kiểu dữ liệu chưa đồng bộ).
* Không tự viết thêm script migration database mới mà không có sẵn trong mã nguồn.
