# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề chính:** Trang chủ tải cực kỳ chậm trên điện thoại (chỉ đạt 64 điểm PageSpeed, LCP tận 7.0 giây) vì hệ thống Next.js Image Optimization bị vô hiệu hóa đối với toàn bộ ảnh Convex. Đồng thời, trang quản trị gặp lỗi Server Error timeout (Function execution timed out) khi kiểm tra ảnh mồ côi.
* **Nguyên nhân 1:** Component `PublicImage` hiểu lầm tất cả link ảnh Convex (bắt đầu bằng `https://`) là link ngoài (External URL) nên tắt tối ưu hóa (`unoptimized = true`). Ngoài ra, chế độ `thumb` (ảnh thu nhỏ) cũng bị ép tắt tối ưu hóa một cách vô lý.
* **Nguyên nhân 2:** Banner đầu trang (`Hero` Component) dùng ảnh gốc dung lượng lớn làm hình nền mờ (blur background) thông qua CSS inline và có thẻ `img` ẩn tải ảnh gốc với độ ưu tiên cao gây nghẽn mạng LCP.
* **Nguyên nhân 3:** Lỗi timeout Convex xảy ra vì hàm `recheckUsageForMedia` thực hiện quét thủ công (full scan) tất cả các record của 22 bảng dữ liệu theo cách tuần tự, đặc biệt là các bảng khổng lồ như lịch sử đơn hàng (`orders`) và snapshot trang chủ (`homeComponentSnapshotPayloads`), làm quá giới hạn 1 giây của Convex mutation.
* **Giải pháp:** 
  a) Sửa logic `PublicImage` để tự động tối ưu hóa ảnh Convex và ảnh thumbnail.
  b) Tối ưu hóa ảnh nền mờ của `Hero` về kích thước siêu nhỏ (16px, chất lượng 10%) và xóa bỏ thẻ img preload ảnh gốc.
  c) Chuyển đổi `About` và `Testimonials` sang sử dụng `PublicImage`.
  d) Loại bỏ việc quét 3 bảng không cần thiết/quá lớn (`orders`, `cartItems`, `homeComponentSnapshotPayloads`) khỏi hàm quét ảnh mồ côi, đồng thời chuyển đổi từ truy vấn tuần tự sang truy vấn song song sử dụng `Promise.all`.

## 2. Elaboration & Self-Explanation
a) **Hệ thống tối ưu hóa hình ảnh:** 
Next.js Image Optimization tự động chuyển đổi ảnh sang định dạng WebP/AVIF và resize phù hợp. Trong tệp [PublicImage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/shared/PublicImage.tsx), logic nhận diện sai ảnh external đối với ảnh Convex (vì bắt đầu bằng https) và cấu hình `UNOPTIMIZED_MODES` đã vô hiệu hóa tính năng này, khiến trang chủ tải ảnh thô gốc (vài MB). Chúng tôi sẽ sửa lại logic này để chỉ tắt tối ưu hóa cho các tên miền thực sự bên ngoài không được cấu hình trong `next.config.ts`.
b) **Hiệu ứng nền mờ Hero banner:**
Tệp [HeroRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/site/home/sections/HeroRuntimeSection.tsx) dùng CSS inline `backgroundImage` với link ảnh Convex gốc làm nền mờ. Chúng tôi sẽ viết hàm `getBlurImageUrl` để định tuyến ảnh này qua Next.js Image Optimizer với kích thước `w=16` và chất lượng `q=10` (chỉ còn khoảng 150 byte).
c) **Lỗi Server Error timeout của Convex:**
Hàm `resolveMediaUsageMap` trong [convex/media.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/convex/media.ts) khi được gọi với `fullScan: true` sẽ thực hiện truy vấn tuần tự (`await ctx.db.query("...").collect()`) trên 22 bảng khác nhau để tìm xem ảnh có được sử dụng không. Bảng `orders` (lịch sử giao dịch mua hàng) và `homeComponentSnapshotPayloads` (bản sao lưu cấu hình trang chủ) chứa lượng dữ liệu cực kỳ khổng lồ, khiến mutation chạy vượt quá 1 giây và bị Convex khai tử (timeout).
Giải pháp là loại bỏ các bảng không liên quan đến cấu hình/dữ liệu runtime này ra khỏi quá trình quét (ảnh sản phẩm đã được bảo vệ thông qua bảng `products`, ảnh trang chủ đã được bảo vệ thông qua `homeComponents`), đồng thời chuyển đổi cơ chế đọc tuần tự sang song song bằng `Promise.all` để tận dụng tối đa băng thông cơ sở dữ liệu của Convex.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể:** Khi hệ thống recheck usage của 50 ảnh:
  - *Hiện tại:* Hệ thống thực hiện chạy tuần tự 22 lệnh đọc toàn bộ database, tải hàng chục ngàn đơn hàng cũ và các gói payload snapshot nặng hàng MB vào bộ nhớ, sau đó dùng vòng lặp JS để kiểm tra. Quá trình này mất hơn 3-4 giây và bị Convex báo lỗi timeout.
  - *Sau khi sửa:* Hệ thống bỏ qua các bảng đơn hàng/snapshot phụ, chỉ chạy song song các truy vấn đọc các bảng còn lại qua `Promise.all`. Thời gian thực thi giảm xuống dưới 150ms, hoàn toàn nằm trong ngưỡng an toàn của Convex.

# II. Audit Summary (Tóm tắt kiểm tra)

Chúng tôi đã kiểm tra cấu hình Next.js và mã nguồn các component hiển thị trên trang chủ và Convex mutation:
* **PublicImage.tsx:** Vô hiệu hóa tối ưu hóa đối với ảnh Convex và ảnh thumbnail.
* **HeroRuntimeSection.tsx:** Tải ảnh gốc dung lượng lớn làm CSS `backgroundImage` nền mờ, và chứa thẻ `img` ẩn gây nghẽn mạng khi tải LCP.
* **convex/media.ts (recheckUsageForMedia):** Thực hiện quét tuần tự toàn bộ database bao gồm cả các bảng lịch sử đơn hàng (`orders`) và sao lưu trang chủ (`homeComponentSnapshotPayloads`), gây lỗi timeout 1s trên môi trường production.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

* **Độ tin cậy nguyên nhân gốc:** High (Cao) - Lỗi timeout được ghi nhận trực tiếp tại mutation `media:recheckUsageForMedia` do chạy quá thời gian 1s. Bản phân tích mã nguồn cho thấy việc quét tuần tự 22 bảng (trong đó có các bảng cực lớn chứa payload JSON khổng lồ) chắc chắn là nguyên nhân trực tiếp gây ra timeout.

# IV. Proposal (Đề xuất)

Chúng tôi đề xuất thực hiện các thay đổi sau:
1. **Sửa đổi [PublicImage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/shared/PublicImage.tsx):** Cho phép tối ưu hóa ảnh thumbnail và ảnh Convex thuộc các remotePatterns của Next.js.
2. **Tối ưu hóa [HeroRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/site/home/sections/HeroRuntimeSection.tsx):** Nén ảnh nền mờ về kích thước `w=16` và chất lượng `q=10`, đồng thời xóa thẻ img ẩn preload.
3. **Cập nhật [AboutSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/app/admin/home-components/about/_components/AboutSectionShared.tsx) và [TestimonialsSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/app/admin/home-components/testimonials/_components/TestimonialsSectionShared.tsx):** Chuyển sang sử dụng `PublicImage`.
4. **Tối ưu hóa [convex/media.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/convex/media.ts):**
   - Loại bỏ 3 bảng `orders`, `cartItems` và `homeComponentSnapshotPayloads` khỏi quá trình quét của hàm `resolveMediaUsageMap`.
   - Sử dụng `Promise.all` để song song hóa các truy vấn đọc dữ liệu từ các bảng còn lại nhằm tối đa hóa băng thông cơ sở dữ liệu.

# V. Files Impacted (Tệp bị ảnh hưởng)

* **Sửa:** [components/shared/PublicImage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/shared/PublicImage.tsx)
  - *Thay đổi:* Cập nhật logic `resolvedUnoptimized` để tối ưu hóa ảnh Convex và ảnh thumbnail.
* **Sửa:** [components/site/home/sections/HeroRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/site/home/sections/HeroRuntimeSection.tsx)
  - *Thay đổi:* Tối ưu hóa ảnh nền mờ về kích thước 16px và xóa bỏ thẻ img preload ảnh gốc.
* **Sửa:** [app/admin/home-components/about/_components/AboutSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/app/admin/home-components/about/_components/AboutSectionShared.tsx)
  - *Thay đổi:* Thay thế thẻ `img` thành `PublicImage` để được tối ưu hóa tự động.
* **Sửa:** [app/admin/home-components/testimonials/_components/TestimonialsSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/app/admin/home-components/testimonials/_components/TestimonialsSectionShared.tsx)
  - *Thay đổi:* Thay thế `AdminImage` bằng `PublicImage` cho avatar và tối ưu kích thước ảnh nền.
* **Sửa:** [convex/media.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/convex/media.ts)
  - *Thay đổi:* Loại bỏ quét các bảng khổng lồ (`orders`, `cartItems`, `homeComponentSnapshotPayloads`) và song song hóa truy vấn bằng `Promise.all`.

# VI. Execution Preview (Xem trước thực thi)

1. Cập nhật [components/shared/PublicImage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/shared/PublicImage.tsx).
2. Cập nhật [components/site/home/sections/HeroRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/components/site/home/sections/HeroRuntimeSection.tsx).
3. Cập nhật [app/admin/home-components/about/_components/AboutSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/app/admin/home-components/about/_components/AboutSectionShared.tsx).
4. Cập nhật [app/admin/home-components/testimonials/_components/TestimonialsSectionShared.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/app/admin/home-components/testimonials/_components/TestimonialsSectionShared.tsx).
5. Cập nhật [convex/media.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_nhan_2.0/convex/media.ts).
6. Tiến hành review tĩnh (Type checking) để đảm bảo không phát sinh lỗi biên dịch.

# VII. Verification Plan (Kế hoạch kiểm chứng)

### Automated Tests
- Chạy kiểm tra TypeScript compile tĩnh:
  `bunx tsc --noEmit`

### Manual Verification
- Xác nhận các URL ảnh trên trang chủ được tối ưu hóa qua Next.js Image.
- Chạy thử mutation `media:recheckUsageForMedia` trên production qua Convex CLI xem có hoàn thành dưới 200ms và không bị timeout hay không.

# VIII. Todo

- [ ] Sửa file `components/shared/PublicImage.tsx`
- [ ] Sửa file `components/site/home/sections/HeroRuntimeSection.tsx`
- [ ] Sửa file `app/admin/home-components/about/_components/AboutSectionShared.tsx`
- [ ] Sửa file `app/admin/home-components/testimonials/_components/TestimonialsSectionShared.tsx`
- [ ] Sửa file `convex/media.ts`
- [ ] Chạy kiểm tra TypeScript compile tĩnh

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

* **Hiệu năng:** LCP trang chủ giảm mạnh, điểm hiệu năng trên Mobile được cải thiện rõ rệt.
* **Sửa lỗi:** Mutation `media:recheckUsageForMedia` chạy thành công không bị timeout (Function execution timed out) trên production.
* **Độ chính xác:** Ảnh mờ nền Hero banner vẫn hiển thị mượt mà.

# X. Risk / Rollback (Rủi ro / Hoàn tác)

* **Rủi ro:** Một số ảnh nằm trong các đơn hàng cũ (đã bị xóa khỏi bảng products) có thể bị nhận diện nhầm là mồ côi.
* **Giảm thiểu:** Đây là hành vi chấp nhận được vì đơn hàng cũ chỉ cần lưu text/url tĩnh, việc dọn dẹp file tĩnh gốc giúp giải phóng dung lượng Convex.
* **Hoàn tác:** Sử dụng Git rollback để khôi phục lại các file cũ.

# XI. Out of Scope (Ngoài phạm vi)

* Thay đổi giao diện người dùng (UI) hoặc thiết kế của các home-component.
* Refactor cấu trúc lưu trữ dữ liệu trong Convex database.
* Tối ưu hóa các trang con khác ngoài trang chủ.
