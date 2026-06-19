# I. Primer

## 1. TL;DR kiểu Feynman
* Chúng ta cần nâng cấp code của dự án hiện tại lên phiên bản mới nhất từ kho lưu trữ lõi (Core Repo tại `E:\NextJS\job\job_from_system_vietadmin\connix`).
* Việc này giống như việc "thay thế toàn bộ ruột" của căn nhà bằng các linh kiện mới hiện đại hơn, nhưng vẫn giữ nguyên nền móng và đồ đạc cũ (Cơ sở dữ liệu Convex).
* Sau khi thay code mới, chúng ta cần chạy một chương trình kiểm tra để xem dữ liệu cũ có tương thích với các định nghĩa dữ liệu (Data Contract) mới hay không.
* Nếu thiếu thông tin nào, chúng ta sẽ bổ sung thông tin đó bằng các công cụ có sẵn mà không được sửa code hay tạo cấu trúc dữ liệu mới.
* Cuối cùng, chúng ta chạy thử để đảm bảo mọi chức năng của trang quản trị (Viet Admin) hoạt động mượt mà.

## 2. Elaboration & Self-Explanation
* Hệ thống Viet Admin sử dụng một cơ sở mã nguồn chung (Core) và các cơ sở dữ liệu Convex độc lập cho từng dự án. Dự án hiện tại của chúng ta đang sử dụng phiên bản code cũ nhưng kết nối tới DB Convex riêng (`dev:bright-chicken-833`).
* **Phase 1 (Đồng bộ code):** Chúng ta sẽ tích hợp code mới từ repo Core bằng cách tạo một nhánh remote tạm thời, sau đó thực hiện squash merge. Squash merge giúp gom toàn bộ lịch sử thay đổi của Core thành một commit duy nhất trên nhánh hiện tại của chúng ta, giúp lịch sử git sạch sẽ. Chúng ta sẽ ghi đè toàn bộ code cũ bằng code của Core (`git checkout --theirs .`) để tránh conflict thủ công và đảm bảo tính đồng nhất tuyệt đối với Core.
* Sau khi merge, chúng ta phải chạy `bunx tsc --noEmit` và `bunx oxlint --type-aware --type-check --fix` để tự động sửa lỗi và kiểm tra kiểu dữ liệu tĩnh. Chỉ khi không còn bất kỳ lỗi nào mới được commit.
* **Phase 2 (Migrate/Backfill DB):** Sau khi nâng cấp mã nguồn, cấu trúc dữ liệu mong đợi có thể thay đổi (thêm trường mới, đổi kiểu trường...). Chúng ta sử dụng chức năng `dataManager:scanDataContracts` để quét sự sai lệch giữa code mới và dữ liệu hiện tại trong DB. Nếu có sự không khớp (missing/recommended/deprecated fields), chúng ta sẽ sử dụng các mutation/action backfill có sẵn trong mã nguồn để cập nhật dữ liệu. Chúng ta tuyệt đối không tự viết code migration mới hay thay đổi schema Convex.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể:** Giả sử code mới của hệ thống yêu cầu bảng `products` phải có thêm trường `status` (mặc định là `"active"`). Dữ liệu hiện tại trong DB cũ chưa có trường này. Sau khi chạy check contract, hệ thống báo bảng `products` bị `missing field: status`. Chúng ta sẽ gọi hàm `backfillProducts` (nếu có sẵn) để cập nhật trường `status: "active"` cho tất cả các sản phẩm cũ.
* **Hình ảnh ẩn dụ:** Quá trình này giống như nâng cấp hệ điều hành cho điện thoại. Phase 1 là tải và cài đặt bản cập nhật Android/iOS mới nhất (ghi đè hệ thống cũ). Phase 2 là chạy ứng dụng dọn dẹp và tối ưu hóa sau khi cập nhật để định dạng lại các danh bạ, tin nhắn cũ cho tương thích với giao diện mới của hệ điều hành mà không làm mất danh bạ của người dùng.

# II. Audit Summary (Tóm tắt kiểm tra)
* **Trạng thái Git hiện tại:** Sạch sẽ, đang ở nhánh `master`.
* **Thư mục Core nguồn:** `E:\NextJS\job\job_from_system_vietadmin\connix` (đã xác nhận tồn tại và có commit mới nhất `4a84536`).
* **Deployment hiện tại:** `dev:bright-chicken-833` (xác nhận trong `.env.local`).
* **Phiên bản Node/Bun:** Dự án cấu hình dùng `bun` làm trình quản lý gói.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Vấn đề:** Dự án hiện tại chạy code phiên bản cũ, thiếu các tính năng mới và các bản sửa lỗi từ Core.
* **Nguyên nhân:** Chưa được đồng bộ (sync) định kỳ từ repository Core.
* **Giả thuyết đối chứng:** Nếu thực hiện merge thủ công từng file hoặc cố gắng giải quyết conflict, có thể dẫn đến việc code bị chắp vá, không đồng bộ đầy đủ các cấu trúc thư mục mới, gây ra lỗi runtime nghiêm trọng do mất tính nhất quán với Core. Vì vậy, việc squash merge và ghi đè hoàn toàn bằng `--theirs` là giải pháp tối ưu nhất để đưa mã nguồn về trạng thái chuẩn của Core.

# IV. Proposal (Đề xuất)
* Thực hiện đồng bộ mã nguồn qua Git Squash Merge theo đúng quy trình 8 bước trong Phase 1.
* Thực hiện kiểm tra lỗi biên dịch (`tsc`) và linting (`oxlint`) cho đến khi hoàn toàn sạch lỗi.
* Quét và cập nhật dữ liệu thực tế bằng các script Convex có sẵn để khớp với Schema của Core mới.

# V. Files Impacted (Tệp bị ảnh hưởng)
* **Sửa/Thêm/Xóa:** Gần như toàn bộ file dự án sẽ bị ảnh hưởng do quá trình Squash Merge đồng bộ với Core (đặc biệt là các thư mục `app/`, `components/`, `convex/`, `lib/`, `types/`...). Mã nguồn cũ của dự án sẽ bị ghi đè hoàn toàn bằng mã nguồn mới từ Core.

# VI. Execution Preview (Xem trước thực thi)
* **Bước 1:** Thêm remote tạm thời `core-update` trỏ đến `E:\NextJS\job\job_from_system_vietadmin\connix`.
* **Bước 2:** Fetch lịch sử và chạy squash merge. Ghi đè toàn bộ thay đổi bằng code của remote Core.
* **Bước 3:** Chạy `tsc` và `oxlint` để kiểm tra lỗi, sửa các lỗi phát sinh (nếu có) trước khi commit.
* **Bước 4:** Commit code với thông điệp chuẩn và dọn dẹp remote tạm.
* **Bước 5:** Đọc thông tin DB từ `.env.local` và kiểm tra sự tương thích dữ liệu thông qua `scanDataContracts`.
* **Bước 6:** Chạy các hàm backfill/migration có sẵn trên DB.
* **Bước 7:** Verify lại bằng `scanDataContracts` và chạy thử ứng dụng để kiểm tra hoạt động.

# VII. Verification Plan (Kế hoạch kiểm chứng)
* **Kiểm tra tự động:**
  * `bunx tsc --noEmit` phải chạy thành công không có lỗi type.
  * `bunx oxlint --type-aware --type-check --fix` phải chạy thành công và trả về exit code 0.
* **Kiểm tra dữ liệu:**
  * Chạy `dataManager:scanDataContracts` trả về `0 issues / 0 warnings` hoặc giảm tối đa các cảnh báo liên quan đến cấu trúc dữ liệu mới.
* **Kiểm tra thủ công:**
  * Chạy `bun run dev` để đảm bảo app khởi chạy thành công trên localhost.

# VIII. Todo
* [ ] Thêm remote `core-update` trỏ tới `E:\NextJS\job\job_from_system_vietadmin\connix`.
* [ ] Fetch và thực hiện squash merge từ `core-update/main`.
* [ ] Giải quyết conflict bằng cách nhận hoàn toàn code mới: `git checkout --theirs .` và add vào stage.
* [ ] Chạy kiểm tra kiểu `bunx tsc --noEmit` và sửa lỗi (nếu có).
* [ ] Chạy linter `bunx oxlint --type-aware --type-check --fix` cho tới khi sạch lỗi.
* [ ] Commit thay đổi đồng bộ.
* [ ] Xóa remote tạm `core-update`.
* [ ] Chạy `bun install` cài lại dependencies.
* [ ] Xác nhận `CONVEX_DEPLOYMENT` là `dev:bright-chicken-833`.
* [ ] Quét dữ liệu bằng cách chạy check contract của Convex.
* [ ] Chạy các hàm backfill dữ liệu nếu có trường bị thiếu/khác biệt.
* [ ] Chạy lại quét contract để đảm bảo không còn lỗi.
* [ ] Khởi chạy thử app ở môi trường dev để xác nhận hoạt động bình thường.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* Mã nguồn được đồng bộ hoàn toàn với Core (không có file cũ bị sót hoặc xung đột chưa giải quyết).
* `tsc` và `oxlint` không báo lỗi.
* Ứng dụng chạy dev bình thường.
* Cơ sở dữ liệu Convex được quét sạch các vấn đề về schema hoặc có báo cáo đầy đủ về các điểm không tương thích nếu không có mutation backfill tự động.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro:** Một số cài đặt riêng của dự án này trong file `.env.local` hoặc các file cấu hình đặc thù có thể bị ghi đè.
* **Biện pháp giảm thiểu:** Do `.env.local` nằm trong `.gitignore` nên sẽ không bị ghi đè bởi git merge. Đối với các file cấu hình khác, git squash merge sẽ ghi đè nhưng chúng ta có lịch sử git để khôi phục hoặc xem lại nếu cần.
* **Hoàn tác:** Nếu merge lỗi hoặc gặp vấn đề nghiêm trọng, ta có thể dùng `git merge --abort` hoặc `git reset --hard HEAD` để quay về trạng thái ban đầu khi chưa merge (vì working directory ban đầu đang sạch).

# XI. Out of Scope (Ngoài phạm vi)
* Không tự ý viết thêm các tính năng mới ngoài Core.
* Không sửa đổi schema DB trực tiếp bằng cách sửa code trong `convex/schema.ts` thủ công (chỉ sync từ Core).
* Không can thiệp sửa đổi dữ liệu của các dự án khác hoặc môi trường production của dự án khác.

# XII. Open Questions (Câu hỏi mở)
* Không có câu hỏi nào chưa rõ. Mọi bước đã được mô tả chi tiết trong yêu cầu của người dùng.
