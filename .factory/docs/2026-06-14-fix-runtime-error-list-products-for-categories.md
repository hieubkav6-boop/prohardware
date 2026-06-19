# I. Primer

## 1. TL;DR kiểu Feynman
* Lỗi xảy ra do trong cấu hình của component (trong Database hoặc Snapshot) có lưu một ID không thuộc bảng danh mục sản phẩm (`productCategories`), cụ thể là ID của bảng nhật ký gửi email (`emailDispatchLogs`).
* Khi trang admin hoặc trang chủ tải lên, mã nguồn client lấy ID lỗi này để gửi yêu cầu lấy danh sách sản phẩm qua hàm query Convex `listProductsForCategories`.
* Convex kiểm tra dữ liệu đầu vào rất nghiêm ngặt (Validator). Khi thấy ID truyền lên không đúng kiểu `productCategories`, Convex quăng lỗi `ArgumentValidationError` và làm ứng dụng bị lỗi runtime (crash).
* **Giải pháp:** Trước khi gọi query Convex, ta sẽ đối chiếu danh sách ID danh mục đang hiển thị với danh sách danh mục hợp lệ thực tế lấy về từ hệ thống. Chỉ giữ lại những ID thực sự tồn tại trong bảng danh mục để gửi lên server. ID rác sẽ bị bỏ qua ở client, giúp trang chạy bình thường và cho phép admin cập nhật/sửa lại dữ liệu sạch.

## 2. Elaboration & Self-Explanation
Hệ thống sử dụng Convex làm backend cơ sở dữ liệu. Để đảm bảo an toàn kiểu dữ liệu, các hàm API của Convex được khai báo các bộ kiểm tra tham số (`v.id("tableName")`).
Hàm `api.products.listProductsForCategories` yêu cầu tham số `categoryIds` phải là một mảng các ID thuộc bảng `productCategories`.
Tuy nhiên, vì lý do dữ liệu lịch sử bị sai lệch (data corruption/legacy debt) hoặc do sự cố ghi đè cấu hình, một ID có giá trị `"kx712phxk5bqw65pg4v7sjq5j587c2jt"` thuộc bảng `emailDispatchLogs` đã lọt vào danh sách `categoryId` của component `CategoryProducts` trong Database/Snapshot.
Khi Client component render, nó gọi Convex query với ID lỗi này. Bộ kiểm tra kiểu của Convex phát hiện sự không khớp này ngay lập tức ở tầng mạng và từ chối xử lý, ném ra lỗi `ArgumentValidationError`. Lỗi này không thể bắt bằng logic nội bộ của hàm (handler) vì validation chạy trước handler.
Do đó, hướng giải quyết duy nhất là thực hiện phòng vệ ở client-side (Client-side Defensive Filtering): chúng ta có danh sách danh mục hợp lệ thông qua `categoriesData` (ở Admin) và `categories` (ở Storefront). Chúng ta chỉ cần lọc mảng ID danh mục đầu vào sao cho tất cả các ID đó phải tồn tại trong danh sách danh mục hợp lệ trước khi thực hiện gọi `useQuery`.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể:** 
  Giả sử danh sách danh mục hợp lệ trong hệ thống chỉ có `["cat_shoes", "cat_clothes"]`. Cấu hình component bị lưu lỗi thành `["cat_shoes", "email_log_123"]`.
  Trước đây, Client gửi yêu cầu: `"Lấy sản phẩm cho các danh mục: cat_shoes và email_log_123"`. Server thấy `"email_log_123"` không phải là danh mục nên báo lỗi sập hệ thống.
  Sau khi sửa, Client tự lọc: `"email_log_123"` không nằm trong danh sách danh mục hợp lệ nên bị loại bỏ. Client chỉ gửi yêu cầu: `"Lấy sản phẩm cho danh mục: cat_shoes"`. Server xử lý thành công, UI hiển thị bình thường. Trên trang Edit, ô chọn danh mục thứ hai sẽ trống và người dùng có thể chọn lại danh mục đúng rồi ấn lưu để cập nhật lại DB.
* **Hình ảnh đời thường:**
  Tương tự như việc bạn gửi một danh sách mã số thẻ thư viện để mượn sách. Trong danh sách đó vô tình có lẫn một chiếc chìa khóa nhà. Nhân viên thư viện kiểm tra đầu vào cực kỳ nghiêm ngặt, thấy chìa khóa nhà không phải là thẻ thư viện nên từ chối phục vụ cả lượt mượn của bạn. Cách giải quyết là trước khi đưa danh sách cho nhân viên thư viện, bạn tự nhặt chiếc chìa khóa nhà ra và cất đi.

# II. Audit Summary (Tóm tắt kiểm tra)

* **Triệu chứng:** Lỗi `ArgumentValidationError: Found ID "kx712phxk5bqw65pg4v7sjq5j587c2jt" from table emailDispatchLogs, which does not match the table name in validator v.id("productCategories")` khi gọi `api.products.listProductsForCategories` từ Client.
* **Phạm vi ảnh hưởng:** Trang quản trị khi chỉnh sửa component `CategoryProducts` trong snapshot hoặc trực tiếp, và component hiển thị danh sách sản phẩm theo danh mục (`ProductGridSection`) ngoài storefront.
* **Mốc thay đổi:** Lỗi xuất hiện khi chỉnh sửa hoặc xem các snapshot/component có chứa dữ liệu cũ bị cấu hình sai.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

* **Độ tin cậy nguyên nhân gốc:** High (99%)
* **Lý do:** Lỗi rõ ràng do kiểu ID truyền lên API Convex bị sai. API Convex yêu cầu kiểu ID cụ thể của bảng `productCategories` thông qua `v.id("productCategories")`, trong khi client truyền lên một ID thuộc bảng `emailDispatchLogs`.
* **Giả thuyết đối chứng:** Nếu chúng ta lọc sạch tất cả các ID không thuộc bảng `productCategories` ở phía client trước khi truyền vào query, query Convex sẽ chỉ nhận được các ID danh mục hợp lệ và hoạt động bình thường, không ném lỗi validation.

# IV. Proposal (Đề xuất)

* Áp dụng cơ chế lọc phòng vệ (Defensive Filtering) tại 3 tệp tin gọi query `listProductsForCategories`.
* Sử dụng danh sách danh mục hợp lệ đã tải về từ DB để đối chiếu và loại bỏ các ID không tồn tại trong danh sách đó.

# V. Files Impacted (Tệp bị ảnh hưởng)

* **Sửa:** [page.tsx (Edit)](file:///E:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/category-products/[id]/edit/page.tsx)
  * Lọc `categoryIdsForQuery` bằng cách đối chiếu với `categoriesData` (chỉ giữ lại các ID thực sự tồn tại trong `categoriesData`).
* **Sửa:** [page.tsx (Create)](file:///E:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/create/category-products/page.tsx)
  * Áp dụng logic lọc tương tự cho trang tạo mới component.
* **Sửa:** [ProductGridSection.tsx](file:///E:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/ProductGridSection.tsx)
  * Lọc `categoryTabIds` trước khi truyền vào query ngoài storefront bằng cách đối chiếu với danh sách `categories` tải từ hệ thống.

# VI. Execution Preview (Xem trước thực thi)

1. Đọc và chỉnh sửa `app/admin/home-components/category-products/[id]/edit/page.tsx`.
2. Đọc và chỉnh sửa `app/admin/home-components/create/category-products/page.tsx`.
3. Đọc và chỉnh sửa `components/site/ProductGridSection.tsx`.
4. Review tĩnh mã nguồn để đảm bảo không bị lỗi cú pháp hay kiểu dữ liệu.

# VII. Verification Plan (Kế hoạch kiểm chứng)

### Automated Tests
* Hệ thống Git Hook / Harness Engine sẽ tự động chạy lint và kiểm tra kiểu (tsc) khi thực hiện commit. Do đó không cần chạy test thủ công nhưng cần đảm bảo code viết chuẩn kiểu (Typescript compliance).

### Manual Verification
* Sau khi chỉnh sửa, trang chỉnh sửa Snapshot Component hoặc Category Products Component sẽ tải bình thường mà không bị crash lỗi ArgumentValidationError nữa.
* Ngoài Storefront, component hiển thị lưới sản phẩm sẽ tải sản phẩm bình thường mà không gây crash trang chủ.

# VIII. Todo

- [x] Sửa logic lọc ID danh mục tại `app/admin/home-components/category-products/[id]/edit/page.tsx`
- [x] Sửa logic lọc ID danh mục tại `app/admin/home-components/create/category-products/page.tsx`
- [x] Sửa logic lọc ID danh mục tại `components/site/ProductGridSection.tsx`

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

* Không còn lỗi `ArgumentValidationError` từ Convex đối với query `listProductsForCategories` khi truy cập trang chỉnh sửa component hoặc trang chủ.
* Các category ID không hợp lệ bị loại bỏ khỏi tham số truyền vào query một cách âm thầm ở client.

# X. Risk / Rollback (Rủi ro / Hoàn tác)

* **Rủi ro:** Nếu danh sách danh mục chưa được tải xong (`categoriesData` hoặc `categories` là `undefined` hoặc `null`), logic lọc có thể tạm thời loại bỏ tất cả ID hợp lệ và truyền mảng rỗng `[]` (dẫn tới query trả về mảng rỗng).
* **Giải pháp giảm thiểu:** Kiểm tra kỹ trạng thái đang tải (loading state) của query danh mục. Nếu chưa tải xong danh sách danh mục, trả về mảng rỗng `[]` và query sản phẩm sẽ tạm thời ở trạng thái `'skip'` hoặc trả về mảng rỗng, sau khi danh mục tải xong thì sẽ tự động trigger query sản phẩm chính xác nhờ cơ chế phản ứng (reactive) của React hooks.

# XI. Out of Scope (Ngoài phạm vi)

* Không thực hiện sửa dữ liệu trực tiếp trong Database vì ID lỗi có thể tồn tại ở nhiều bản ghi snapshot lịch sử khác nhau; giải pháp client-side tự phục hồi (self-healing) là triệt để và bền vững hơn đối với các lỗi dữ liệu kiểu này.
