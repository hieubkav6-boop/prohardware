# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề:** Khách hàng muốn có giao diện tối (Dark Mode) sang trọng, mang hơi hướng thiết kế của Apple (Apple Premium Style) cho các danh sách nội dung (Bài viết, Sản phẩm, v.v.). Cụ thể là viền của các thẻ (cards) khi ở Dark Mode sẽ mang sắc thái của màu thương hiệu (Brand Color) và khi rê chuột qua (Hover) thì viền sẽ sáng lên kèm quầng sáng (Glow) màu thương hiệu lan tỏa dịu nhẹ.
* **Cách giải quyết:**
  1. Thêm một tùy chọn bật/tắt (Switch/Toggle) có tên **"Premium Dark Mode"** cho từng danh sách trong bảng cấu hình quản trị `/system/experiences` (tab Cấu hình nhanh danh sách).
  2. Lưu cấu hình này vào Convex settings (`posts_list_ui`, `products_list_ui`, v.v.) dưới trường dữ liệu `darkModePremiumBorder`.
  3. Cập nhật các hook cấu hình ở frontend để truyền trạng thái bật/tắt này xuống.
  4. Cập nhật component hiển thị thẻ (`StorefrontCard` và `ProductCardComponents`) để khi ở Dark Mode và tính năng được bật: viền card lúc bình thường có màu brand color mỏng (~15% opacity), và khi hover sẽ đổi sang màu brand color rực hơn kèm quầng sáng glow brand color (~17% opacity), đồng thời tăng thời gian transition mượt mà hơn (500ms ease).

## 2. Elaboration & Self-Explanation
* **Vì sao cần làm tính năng này?** Giao diện Dark Mode mặc định thường dùng viền màu xám tối (`#27272a`) và khi hover thì sáng nhẹ lên. Việc đưa màu thương hiệu (Brand Color) với độ mờ tinh tế (~15% opacity) làm viền mặc định ở Dark Mode giúp các thẻ hiển thị tách bạch nhưng hòa quyện vào màu sắc chủ đạo của thương hiệu. Khi hover, hiệu ứng Glow (bóng đổ lan tỏa màu brand color) tạo chiều sâu không gian (z-axis) đúng tinh thần thiết kế Apple.
* **Làm sao để không bị "AI styling"?** Tránh việc viết các inline CSS hay Tailwind class chắp vá, làm mất tính đồng nhất của hệ thống. Chúng ta tận dụng trực tiếp cơ chế CSS Custom Properties (biến CSS) sẵn có của các component card (ví dụ `--card-hover-border`, `--card-hover-shadow`), chỉ thay đổi giá trị của chúng và điều chỉnh transition mượt mà hơn qua style object có kiểm soát.

## 3. Concrete Examples & Analogies
* **Ví dụ thực tế:** Giả sử Brand Color chủ đạo của trang web là màu xanh ngọc (Cyan `#14B8A6`).
  * **Khi chưa hover:** Viền của thẻ card thay vì màu xám tối sẽ là viền màu xanh ngọc cực kỳ mỏng và trong suốt (`rgba(20, 184, 166, 0.15)` hay `#14b8a625`).
  * **Khi hover:** Viền card sáng rõ lên màu xanh ngọc đậm `#14B8A6`, đồng thời phía sau card xuất hiện bóng đổ mờ ảo màu xanh ngọc tỏa ra (`box-shadow: 0 0 20px rgba(20, 184, 166, 0.17)` hay `#14b8a62b`). Card nổi nhẹ lên trên mặt phẳng (`translate-y`). Hiệu ứng chuyển động kéo dài 500ms cực kỳ êm ái thay vì giật nhanh 300ms thông thường.
* **Hình ảnh tương đồng:** Giống như những chiếc đèn LED ẩn dưới gầm xe hoặc sau màn hình TV (Ambilight), nó không chiếu thẳng vào mắt người dùng mà tạo ra một vệt sáng hắt ngược mềm mại lên bề mặt xung quanh, làm nổi bật vật thể chính một cách sang trọng.

# II. Audit Summary (Tóm tắt kiểm tra)

* **Hiện trạng cấu hình hệ thống:**
  * File quản trị: [page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/system/experiences/page.tsx) lưu các cấu hình UI của danh sách thông qua mutation `api.settings.setMultiple`. Cấu hình được tải qua query `api.settings.getByKey`.
  * File hooks: [useSiteConfig.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/lib/experiences/useSiteConfig.ts) parse dữ liệu từ Convex để trả về các cấu hình cho frontend.
  * Thẻ hiển thị chung: [StorefrontCard.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/shared/StorefrontCard.tsx) dùng cho các list bài viết, dự án, khóa học, dịch vụ, tài nguyên.
  * Thẻ hiển thị sản phẩm: [ProductCardComponents.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/products/ProductCardComponents.tsx) tự render card grid/list cho sản phẩm.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

* **Root Cause Confidence:** High
* **Lý do:** Nhu cầu bổ sung tính năng hover và viền theo brand color cho Dark Mode (kiểu Apple Premium) nhưng hiện tại hệ thống chưa có trường dữ liệu cấu hình toggle và style xử lý tương ứng ở frontend. Cần bổ sung từ DB layer, API/Hook layer cho tới UI layer.

# IV. Proposal (Đề xuất)

1. **DB/Settings Layer:**
   * Thêm trường `darkModePremiumBorder` (boolean) vào các cấu hình JSON của: `posts_list_ui`, `resources_list_ui`, `courses_list_ui`, `services_list_ui`, `projects_list_ui`, `products_list_ui`.
2. **Admin UI Layer:**
   * Trong [app/system/experiences/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/system/experiences/page.tsx):
     * Khai báo state cục bộ: `localDarkModePremiumBorders` kiểu `Record<string, boolean>`.
     * Tải giá trị mặc định từ Convex DB lúc init.
     * Thêm một cột mới có tiêu đề **"Premium Dark Mode"** vào bảng danh sách cấu hình.
     * Cột này render một Toggle (hoặc Switch/Checkbox) để bật/tắt tính năng này cho từng danh sách.
     * Cập nhật logic so sánh thay đổi `hasChanges` và hàm lưu `handleSaveAll`.
3. **Frontend API Layer:**
   * Trong [lib/experiences/useSiteConfig.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/lib/experiences/useSiteConfig.ts):
     * Cập nhật các type định nghĩa của danh sách để có trường `darkModePremiumBorder: boolean`.
     * Cập nhật 6 hook: `usePostsListConfig`, `useProductsListConfig`, `useServicesListConfig`, `useProjectsListConfig`, `useCoursesListConfig`, `useResourcesListConfig` để parse trường này (mặc định trả về `false` nếu chưa có cấu hình).
4. **Frontend UI Card Layer:**
   * Trong [components/shared/StorefrontCard.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/shared/StorefrontCard.tsx):
     * Bổ sung prop `darkModePremiumBorder?: boolean`.
     * Khi `isDark` và `darkModePremiumBorder` đều đúng, thay thế style viền mặc định bằng viền brand color mờ (`${brandColor}25`), tăng opacity shadow glow khi hover lên (`${brandColor}2b`), và áp dụng transition mượt mà hơn (500ms, cubic-bezier).
   * Trong [app/(site)/_components/products/ProductCardComponents.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/products/ProductCardComponents.tsx):
     * Import hook `useProductsListConfig` để đọc cấu hình sản phẩm trực tiếp.
     * Áp dụng logic style viền và glow tương tự cho `ProductGrid` và `ProductList` khi ở Dark Mode.
5. **Frontend Pages Wiring Layer:**
   * Truyền prop `darkModePremiumBorder={listConfig.darkModePremiumBorder}` vào `StorefrontCard` ở các trang:
     * `app/(site)/[categorySlug]/_components/PostsPage.tsx`
     * `app/(site)/[categorySlug]/_components/ServicesPage.tsx`
     * `app/(site)/_components/courses/CoursesPage.tsx`
     * `app/(site)/_components/posts/PostsPage.tsx`
     * `app/(site)/_components/resources/ResourcesPage.tsx`
     * `app/(site)/_components/services/ServicesPage.tsx`
     * `app/(site)/projects/page.tsx`

# V. Files Impacted (Tệp bị ảnh hưởng)

### UI Quản trị & Schema
* **Sửa:** [app/system/experiences/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/system/experiences/page.tsx)
  * Thêm UI switch/toggle cho Premium Dark Mode, cập nhật state và logic save/hasChanges.

### Frontend API/Hooks
* **Sửa:** [lib/experiences/useSiteConfig.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/lib/experiences/useSiteConfig.ts)
  * Bổ sung trường `darkModePremiumBorder` vào kiểu dữ liệu trả về và logic giải mã cấu hình của các danh sách.

### Frontend Card Components
* **Sửa:** [components/shared/StorefrontCard.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/shared/StorefrontCard.tsx)
  * Áp dụng hiệu ứng viền và hover brand color mờ ảo cho card chung (posts, services, projects, courses, resources).
* **Sửa:** [app/(site)/_components/products/ProductCardComponents.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/products/ProductCardComponents.tsx)
  * Áp dụng hiệu ứng viền và hover brand color mờ ảo cho card sản phẩm.

### Frontend List Pages Wiring
* **Sửa:** [app/(site)/[categorySlug]/_components/PostsPage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/%5BcategorySlug%5D/_components/PostsPage.tsx)
* **Sửa:** [app/(site)/[categorySlug]/_components/ServicesPage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/%5BcategorySlug%5D/_components/ServicesPage.tsx)
* **Sửa:** [app/(site)/_components/courses/CoursesPage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/courses/CoursesPage.tsx)
* **Sửa:** [app/(site)/_components/posts/PostsPage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/posts/PostsPage.tsx)
* **Sửa:** [app/(site)/_components/resources/ResourcesPage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/resources/ResourcesPage.tsx)
* **Sửa:** [app/(site)/_components/services/ServicesPage.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/services/ServicesPage.tsx)
* **Sửa:** [app/(site)/projects/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/projects/page.tsx)
  * Truyền prop `darkModePremiumBorder` vào `StorefrontCard`.

# VI. Execution Preview (Xem trước thực thi)

1. Đọc và chỉnh sửa [lib/experiences/useSiteConfig.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/lib/experiences/useSiteConfig.ts) để thêm định nghĩa trường.
2. Đọc và chỉnh sửa [app/system/experiences/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/system/experiences/page.tsx) để hoàn thiện UI quản trị.
3. Chỉnh sửa [components/shared/StorefrontCard.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/shared/StorefrontCard.tsx) và [app/(site)/_components/products/ProductCardComponents.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/products/ProductCardComponents.tsx) để thêm hiệu ứng visual cao cấp.
4. Nối dây (Wiring) biến cấu hình ở các file frontend list pages.
5. Review tĩnh toàn bộ mã nguồn thay đổi để đảm bảo không lỗi cú pháp hoặc TypeScript.

# VII. Verification Plan (Kế hoạch kiểm chứng)

### Automated Tests
* Chạy biên dịch TypeScript để kiểm tra tính toàn vẹn của mã nguồn:
  `bunx tsc --noEmit`

### Manual Verification
* Truy cập `/system/experiences` (tab Cấu hình nhanh danh sách), kiểm tra xem cột "Premium Dark Mode" hiển thị rõ ràng và có thể bật tắt.
* Bấm lưu cấu hình, kiểm tra thông báo toast thành công và trạng thái lưu được lưu giữ khi tải lại trang.
* Truy cập các trang frontend (ví dụ `/posts`, `/products`, `/projects`), chuyển sang Dark Mode:
  * Khi bật Premium Dark Mode:
    * Thẻ card hiển thị viền mang sắc thái nhẹ của brand color.
    * Khi hover, viền sáng lên màu brand color rõ rệt, có quầng sáng glow brand color phản chiếu dịu nhẹ phía sau.
  * Khi tắt Premium Dark Mode:
    * Card hiển thị viền xám mặc định và hover bình thường.

# VIII. Todo

- [ ] Cập nhật tệp [lib/experiences/useSiteConfig.ts](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/lib/experiences/useSiteConfig.ts) để bổ sung thuộc tính `darkModePremiumBorder` cho 6 hooks danh sách.
- [ ] Cập nhật giao diện quản trị [app/system/experiences/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/system/experiences/page.tsx) để hiển thị cột cấu hình "Premium Dark Mode" và lưu trạng thái vào Convex.
- [ ] Cập nhật component chung [components/shared/StorefrontCard.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/shared/StorefrontCard.tsx) để áp dụng hiệu ứng viền/hover brand color mượt mà khi ở Dark Mode.
- [ ] Cập nhật component sản phẩm [app/(site)/_components/products/ProductCardComponents.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/%28site%29/_components/products/ProductCardComponents.tsx) để áp dụng hiệu ứng tương ứng.
- [ ] Cập nhật 7 tệp trang danh sách frontend để truyền thuộc tính cấu hình xuống `StorefrontCard`.
- [ ] Xác minh và chạy kiểm tra TypeScript để đảm bảo không có lỗi biên dịch.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

1. Giao diện quản trị tab "Cấu hình nhanh danh sách" xuất hiện cột mới tên là **"Premium Dark Mode"** dạng Switch/Toggle cho tất cả 6 loại danh sách.
2. Bật tắt toggle và lưu lại thành công, dữ liệu được đồng bộ chính xác với Convex database.
3. Ở chế độ tối (Dark Mode), nếu bật cấu hình này, viền thẻ card hiển thị nhẹ màu thương hiệu (opacity ~15%), hover sáng rõ màu thương hiệu kèm glow dịu mắt (opacity ~17%) chuyển động mượt mà 500ms.
4. Ở chế độ sáng (Light Mode) hoặc khi tắt tính năng, giao diện hoạt động bình thường như cũ, không có bất kỳ thay đổi visual nào.
5. Không có lỗi biên dịch TypeScript toàn dự án.

# X. Risk / Rollback (Rủi ro / Hoàn tác)

* **Rủi ro:** Một số màu thương hiệu quá sáng hoặc quá tối có thể làm viền trông không rõ ở Dark Mode. Tuy nhiên, việc sử dụng opacity `${brandColor}25` (15%) và hover `${brandColor}` đảm bảo khả năng tương phản tối ưu trên nền tối.
* **Hoàn tác:** Nếu gặp lỗi hoặc khách hàng không thích, chỉ cần khôi phục lại các file qua `git checkout`. Các trường dữ liệu thừa trong JSON Convex settings sẽ không ảnh hưởng gì đến các tính năng khác của hệ thống.

# XI. Out of Scope (Ngoài phạm vi)

* Giao diện trang chi tiết (Detail page) hoặc các trang landing page tĩnh khác nằm ngoài phạm vi yêu cầu của danh sách. Tác vụ chỉ tập trung vào cấu hình nhanh danh sách công cộng.
