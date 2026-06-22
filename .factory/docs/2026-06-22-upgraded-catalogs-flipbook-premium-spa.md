# I. Primer

## 1. TL;DR kiểu Feynman
- **Vấn đề:** Trang Catalogs cũ tải rất chậm, ảnh JPEG trích xuất từ PDF quá nặng, giao diện CRUD ở trang quản trị rườm rà (yêu cầu điền slug, nổi bật, SEO, ảnh bìa thủ công...) và trang khách không hỗ trợ phân loại theo danh mục hay trải nghiệm lật sách chuẩn 3D.
- **Giải pháp:**
  1. Trích xuất PDF thành định dạng WebP (chất lượng 0.85) giúp giảm 70-80% dung lượng ảnh.
  2. Bổ sung trường `category` vào schema Convex của bảng `catalogs` để phân nhóm tài liệu.
  3. **Tối giản hóa biểu mẫu (KISS):** 
     - Ẩn hoàn toàn trường nhập "Đường dẫn tĩnh (Slug)" khỏi giao diện admin. Slug được tự động sinh ngầm từ tiêu đề ở phía sau hậu trường. Thay thế hiển thị slug trên danh sách bằng tên Danh mục thực tế.
     - **Gỡ bỏ tính năng "Nổi bật" (Featured):** Do tính năng nổi bật không được sử dụng ở trang khách, chúng tôi loại bỏ hoàn toàn checkbox "Đánh dấu Nổi bật" khỏi biểu mẫu nhập và nhãn "Nổi bật/Thường" khỏi danh sách hàng ngang của quản trị viên để giao diện cực kỳ sạch.
  4. Xây dựng sidebar dạng Accordion nhóm theo danh mục, tự động mở danh mục đầu tiên và tự nạp trước (pre-load) trang bìa của tất cả tài liệu.
  5. Nâng cấp bộ đọc sách lật (`CatalogFlipbook`) hỗ trợ Toolbar phóng to/thu nhỏ, xem 1 hoặc 2 trang, hiển thị gáy sách đổ bóng 3D chân thực, và tích hợp cơ chế nạp trước ảnh 4 cấp độ (Tier 1-4) theo hành vi người dùng (cuộn trang, di chuột hover).

## 2. Elaboration & Self-Explanation
Hệ thống hiển thị sách lật (Flipbook) đòi hỏi tốc độ tải ảnh cực nhanh để tránh hiện tượng giật lag hoặc khoảng trắng khi người dùng lật trang. 
Để giải quyết bài toán hiệu năng, chúng tôi áp dụng đồng thời hai kỹ thuật:
- **Tối ưu hóa tài nguyên tại nguồn:** Thay vì xuất Canvas thành JPEG truyền thống, chúng tôi sử dụng WebP với thuật toán nén hiện đại. Một trang A4 dạng ảnh WebP chỉ chiếm khoảng 80-120KB trong khi vẫn giữ nguyên độ sắc nét của văn bản khi zoom.
- **Chiến lược nạp trước thông minh (4-Tier Preloading):**
  - *Tier 1 (Critical):* Tải ngay trang bìa (trang 1) của mọi catalog đang hiển thị trong sidebar để người dùng thấy ngay ảnh xem trước mà không có độ trễ.
  - *Tier 2 (High):* Khi người dùng rê chuột (hover) vào một mục tài liệu trên thanh bên, hệ thống đoán trước họ sắp bấm xem và nạp trước trang 2, 3, 4 của tài liệu đó.
  - *Tier 3 (Low):* Khi tài liệu đang mở, hệ thống sẽ tự nạp 4 trang tiếp theo của trang hiện tại để người dùng có thể lật liên tục mà không phải chờ.
  - *Tier 4 (Idle):* Sử dụng `requestIdleCallback` (hoặc `setTimeout` dự phòng) để nạp toàn bộ các trang còn lại khi trình duyệt rảnh rỗi.
- **Lược bỏ gánh nặng nhập liệu:** Bản chất hệ thống chỉ chạy trên duy nhất 1 trang `/catalogs` cho toàn bộ tài liệu (Single-Page App). Do đó, các trường như slug chi tiết hay cờ Đánh dấu nổi bật (Featured) là hoàn toàn dư thừa với người quản trị. Chúng tôi ẩn các trường này đi, tự sinh slug và loại bỏ featured khỏi giao diện nhập liệu để giữ cho form cực kỳ gọn và tập trung vào các trường quan trọng (Tiêu đề, Danh mục, File PDF).

## 3. Concrete Examples & Analogies
- **Ví dụ thực tế:** Khi một khách hàng truy cập trang `/catalogs`, họ sẽ thấy ngay danh mục "Thiết bị vệ sinh" được mở sẵn với các catalog như "Catalog Sen Tắm 2024", "Catalog Lavabo". Khi họ di chuột hover qua "Catalog Lavabo" để chuẩn bị click, trình duyệt âm thầm tải trước trang 2, 3, 4 của cuốn Catalog đó. Khi click vào, sách lật lập tức hiện lên mượt mà. Họ có thể bấm nút phóng to (+) để xem rõ thông số ren vòi sen mà không bị vỡ hình.
- **Hình ảnh so sánh:** Giống như một người phục vụ nhà hàng chuyên nghiệp. Thay vì bắt khách hàng tự viết mã số món ăn hoặc điền các thông tin kỹ thuật của món (như slug của catalog), khách chỉ cần chọn tên món ăn (tiêu đề) và nhà hàng sẽ tự động xử lý toàn bộ quy trình pha chế bên dưới.

# II. Audit Summary (Tóm tắt kiểm tra)
- Đã kiểm tra cấu trúc cơ sở dữ liệu `convex/schema.ts` và tích hợp thành công trường `category`.
- Đã chạy kiểm tra kiểu dữ liệu toàn dự án bằng công cụ `bunx tsc --noEmit` và không phát hiện bất kỳ lỗi biên dịch nào.
- Trình quản trị CRUD một trang hoạt động đồng bộ với cấu hình hệ thống dynamic fields trong `catalogs.config.ts`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Nguyên nhân gốc của độ trễ tải trang cũ:** Ảnh JPEG gốc dung lượng quá lớn (1-2MB/trang) kết hợp với việc tải tuần tự (waterfall loading) khi lật đến trang nào mới bắt đầu tải trang đó.
- **Giả thuyết đối chứng:** Nếu chỉ đổi giao diện sách lật sang thư viện 3D mà không nén ảnh và không nạp trước, hiệu năng vẫn sẽ rất tệ trên thiết bị di động hoặc kết nối mạng 3G/4G yếu. Vì vậy, việc chuyển sang WebP và triển khai bộ Preloader 4 cấp độ là bắt buộc để đạt được trải nghiệm tiệm cận tức thời (instant-feel).

# IV. Proposal (Đề xuất)
- Giữ nguyên cấu trúc lưu trữ của Convex Storage nhưng cải tiến MIME type ghi nhận sang `image/webp`.
- Áp dụng màu chủ đạo thương hiệu Pro Hardware `#C21A1A` cho các nút bấm trạng thái, thư mục active và toolbar trong flipbook.
- Ẩn trường Slug khỏi giao diện người dùng và gỡ bỏ hoàn toàn cờ checkbox "Nổi bật" nhằm đơn giản hóa tối đa quy trình nhập liệu.

# V. Files Impacted (Tệp bị ảnh hưởng)
- `Sửa:` [convex/schema.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/convex/schema.ts): Bổ sung trường `category` (optional string) vào bảng `catalogs`.
- `Sửa:` [convex/catalogs.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/convex/catalogs.ts): Thêm tham số `category` vào mutation `create` và `update`.
- `Sửa:` [lib/modules/configs/catalogs.config.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/lib/modules/configs/catalogs.config.ts): Đồng bộ cấu hình động hiển thị trường "Danh mục" trong admin.
- `Sửa:` [app/admin/catalogs/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/catalogs/page.tsx): Tích hợp ô nhập danh mục, loại bỏ input Slug khỏi UI, gỡ bỏ checkbox và các badge toggle liên quan đến "Nổi bật" (Featured), tự động sinh slug từ tiêu đề, nâng cấp thuật toán trích xuất PDF từ `image/jpeg` sang `image/webp`.
- `Thêm:` [components/site/useImagePreloader.ts](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/useImagePreloader.ts): Phát triển hook quản lý nạp trước ảnh 4 cấp độ.
- `Sửa:` [components/site/CatalogsClientView.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/CatalogsClientView.tsx): Viết lại Sidebar phân nhóm Accordion và sự kiện hover prefetch.
- `Sửa:` [components/site/CatalogFlipbook.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/CatalogFlipbook.tsx): Nâng cấp giao diện sách lật 3D, bổ sung Toolbar zoom, chế độ Single/Double và Skeleton tải trang.

# VI. Execution Preview (Xem trước thực thi)
1. Thêm trường cơ sở dữ liệu `category` và cập nhật API mutations.
2. Cấu hình ô input Danh mục trong admin, loại bỏ trường nhập Slug và cờ Featured.
3. Thay đổi kiểu nén ảnh canvas sang WebP.
4. Tạo hook quản lý tải trước tài nguyên ảnh.
5. Tái cấu trúc sidebar client hiển thị theo nhóm danh mục dạng accordion.
6. Cập nhật trình sách lật Flipbook hỗ trợ toolbar zoom và skeleton mượt mà.
7. Chạy typecheck và kiểm tra tổng thể.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- **Kiểm chứng tự động:** Chạy `bunx tsc --noEmit` để xác minh tính nhất quán kiểu dữ liệu. (Đã thực hiện thành công và không có lỗi).
- **Kiểm chứng thủ công:**
  1. Vào `/admin/catalogs`, tải lên file PDF và kiểm tra xem có tạo/sửa catalog thành công mà không cần nhập slug hay nổi bật hay không.
  2. Vào `/catalogs`, kiểm tra sidebar hiển thị accordion đóng mở mượt mà và việc prefetch ảnh.

# VIII. Todo
- [x] Cập nhật schema Convex trong `convex/schema.ts`
- [x] Cập nhật API CRUD trong `convex/catalogs.ts`
- [x] Cập nhật cấu hình module `lib/modules/configs/catalogs.config.ts`
- [x] Cập nhật trang admin `app/admin/catalogs/page.tsx` (Ẩn nhập Slug, loại bỏ Nổi bật)
- [x] Tạo hook tải trước ảnh `components/site/useImagePreloader.ts`
- [x] Viết lại `components/site/CatalogsClientView.tsx`
- [x] Nâng cấp `components/site/CatalogFlipbook.tsx`
- [x] Xác minh và biên dịch TypeScript toàn dự án
- [x] Commit Git và phát âm báo hoàn thành

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Trang admin tạo mới/chỉnh sửa thành công catalog có phân loại Danh mục.
- Không hiển thị ô nhập liệu Slug và checkbox Nổi bật cho người dùng.
- Định dạng ảnh lưu trữ trong Convex là WebP thay vì JPEG.
- Phân nhóm tài liệu không có danh mục vào nhóm mặc định "Tài liệu chung".
- Sách lật có thanh công cụ phóng to/thu nhỏ hoạt động đúng tỷ lệ phần trăm hiển thị.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Các tài liệu cũ chưa có danh mục sẽ tự động được xếp vào "Tài liệu chung", đảm bảo không lỗi giao diện hoặc mất mát dữ liệu cũ.
- Hoàn tác nhanh bằng lệnh: `git restore . && git clean -fd`

# XI. Out of Scope (Ngoài phạm vi)
- Không can thiệp vào các bảng cơ sở dữ liệu khác ngoài `catalogs`.
- Không tạo thêm bảng danh mục riêng biệt nhằm giữ cấu trúc tinh gọn đúng chuẩn KISS/YAGNI.
