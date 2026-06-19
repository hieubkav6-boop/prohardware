# Tối ưu hóa UI/UX cho Hero Slider 'builderCoffee' trong Dark Mode

Tài liệu này mô tả kế hoạch tối ưu hóa giao diện Hero Slider (layout `builderCoffee`) trong chế độ Dark Mode, giải quyết vấn đề các nút điều hướng bị chói và ảnh nền mờ hai bên không hòa hợp với nền tối.

# I. Primer

## 1. TL;DR kiểu Feynman
* **Vấn đề:** Khi chuyển sang chế độ tối (Dark Mode), slider ở trang chủ trông không được đẹp vì hai lý do chính: (1) hai nút bấm qua lại ở mép slider là ảnh bán nguyệt màu trắng rất chói, (2) phần ảnh mờ làm nền ở hai bên không tự nhiên hòa vào nền tối mà bị lộ viền sáng sắc cạnh.
* **Giải pháp:** 
  1. Bỏ ảnh nút bán nguyệt màu trắng hardcode từ link ngoài. Tự vẽ nút bán nguyệt bằng CSS mượt mà, tự động đổi màu theo chế độ sáng/tối (dùng màu của thương hiệu đã có trong hệ thống).
  2. Tăng độ mờ (blur) và phóng to ảnh nền hơn để không bị lộ mép ảnh. Thêm một lớp phủ chuyển màu tối dần ra hai bên (gradient mask) để phần mờ chìm dần vào nền tối một cách êm ái.
  3. Cải tiến các chấm chuyển trang (dots) bên dưới thành dạng "viên thuốc" co giãn động theo màu thương hiệu để tăng tính hiện đại.

## 2. Elaboration & Self-Explanation
Hiện tại, layout `builderCoffee` của Hero component đang sử dụng một thiết kế lai giữa các asset ảnh tĩnh từ bên thứ ba và code React. Khi chạy ở chế độ Dark Mode:
* Các nút điều hướng (navigation buttons) dùng ảnh nền bán nguyệt màu trắng cố định từ CDN, khiến chúng luôn có màu trắng chói lòa trên nền tối `bg-slate-950`. Ngoài ra, mũi tên SVG bên trong nút được hardcode màu đen (`text-black`), gây tương phản ngược và trông rất thô.
* Hiệu ứng ảnh nền mờ hai bên (để lấp đầy khoảng trống khi ảnh chính là ảnh dọc/vuông) sử dụng `scale-110` và `blur(30px)` kết hợp với overlay `bg-black/10`. Lớp phủ này quá mỏng trong dark mode, làm cho phần ảnh mờ vẫn bị sáng và lộ rõ ranh giới với nền tối xung quanh.
* Các chấm điều hướng (dots) bên dưới đang bị hardcode màu vàng đất `#8b7046` và xám `#cccccc`, không đồng bộ với hệ thống màu động (Brand Colors) của trang web.

Để giải quyết triệt để, chúng ta sẽ:
* **Tự vẽ nút điều hướng bằng CSS**: Sử dụng các class Tailwind để tạo hình bán nguyệt áp mép. Kết hợp biến màu động `sliderColors` để tự động đổi màu nền và màu icon tương ứng với Light/Dark Mode (ví dụ: ở Dark Mode nút sẽ có nền tối mờ `bg-slate-900/60` và icon sáng `text-slate-200`). Thêm hiệu ứng hover giãn nhẹ chiều rộng để tăng cảm giác tương tác vật lý.
* **Làm mịn ảnh mờ**: Tăng scale lên `scale-125` và blur lên `blur(45px)` để triệt tiêu các chi tiết sắc cạnh. Thêm một lớp gradient phủ hai bên mép `bg-gradient-to-r from-slate-900/90 via-transparent to-slate-900/90` (ở dark mode) để ảnh mờ chìm dần vào nền của container.
* **Động hóa chấm điều hướng**: Chuyển sang dùng biến màu từ `sliderColors` và thêm transition co giãn chiều rộng (`w-6` khi active, `w-2` khi inactive) tạo cảm giác mượt mà và sang trọng hơn.

## 3. Concrete Examples & Analogies
* **Ví dụ thực tế:** Hãy tưởng tượng bạn đang xem phim trong một rạp chiếu tối. Màn hình chiếu phim chính ở giữa rất rõ nét, còn hai bức tường bên cạnh được sơn màu đen xám và có ánh sáng hắt nhẹ mờ ảo từ màn hình chính sang. Nếu đột nhiên có hai bảng màu trắng tinh dán ở hai bên tường, mắt bạn sẽ bị phân tâm và cực kỳ khó chịu. Đó chính là cảm giác khi nút điều hướng màu trắng hiển thị trong dark mode.
* **Sự tương đồng:** Việc sử dụng gradient mask che hai bên ảnh mờ cũng giống như cách các rạp chiếu phim hay ứng dụng chuyên nghiệp (như Youtube Cinema Mode hay Apple TV) làm tối nhẹ và làm mờ các vùng rìa để người xem chỉ tập trung vào nội dung chính ở tâm màn hình.

# II. Audit Summary (Tóm tắt kiểm tra)
* **Layout hiện tại:** `builderCoffee` được kích hoạt cho Hero component hoạt động duy nhất trên trang chủ (kiểm tra qua Convex CLI).
* **File bị ảnh hưởng:** [HeroRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/HeroRuntimeSection.tsx).
* **Các thuộc tính màu sắc:** Đã có hệ thống adapt màu tự động theo dark mode thông qua hàm `adaptTokensForDarkMode` và `getSliderColors` tại [colors.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/hero/_lib/colors.ts). Tuy nhiên, layout `builderCoffee` hiện tại đang bỏ qua các biến màu này và sử dụng giá trị hardcode.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Nguyên nhân gốc:** 
  1. Ảnh nút bấm được load tĩnh từ một link CDN bên ngoài có màu nền trắng cố định, không thể thay đổi bằng CSS filter hay color token.
  2. Lớp phủ ảnh mờ chỉ có `bg-black/10` chung, không có sự chuyển tiếp mượt mà sang màu nền của container (`bg-slate-900`/`bg-slate-950`).
  3. Màu sắc dots và nút bấm trong layout `builderCoffee` bị hardcode tĩnh thay vì nối dây (wire) vào hệ thống token màu thương hiệu động.

# IV. Proposal (Đề xuất)
1. **Thiết kế lại nút điều hướng (CSS-based Custom Buttons):**
   * Xóa bỏ thuộc tính `style={{ backgroundImage: 'url(...)', ... }}` trên nút Next/Prev.
   * Vẽ nút bán nguyệt bằng CSS:
     * Nút Left: `rounded-r-full left-0 pl-1` kết hợp nền `bg-white/80 dark:bg-slate-900/60` và border `border border-l-0 border-slate-200 dark:border-slate-800`.
     * Nút Right: `rounded-l-full right-0 pr-1` kết hợp nền tương tự và border `border border-r-0`.
     * Hiệu ứng hover: Tăng nhẹ chiều rộng (ví dụ từ `w-[20px]` lên `w-[24px]` trên di động và từ `w-[32px]` lên `w-[40px]` trên máy tính) kết hợp `hover:bg-white dark:hover:bg-slate-800/80`.
     * Sử dụng biến màu SVG icon từ hệ màu `sliderColors.navButtonIconColor`.
2. **Cải tiến ảnh mờ nền (Premium Blur & Gradient Mask):**
   * Thay đổi hiệu ứng blur: tăng scale lên `scale-125` và blur lên `blur(45px)`.
   * Thêm lớp phủ gradient hai bên mép:
     * Sáng/Tối: `bg-gradient-to-r from-white via-transparent to-white dark:from-slate-900 dark:to-slate-900 opacity-90`.
     * Overlay trung tâm tối hơn ở dark mode: `dark:bg-black/30 bg-black/10` để ảnh chính nổi bật rõ ràng.
3. **Hiện đại hóa Dots Indicator:**
   * Thay vì dùng thanh dẹt cứng màu tĩnh `#8b7046`/`#cccccc`:
     * Active: Dùng màu `sliderColors.dotActive` và kích thước rộng hơn `w-6 h-1 rounded-full`.
     * Inactive: Dùng màu `sliderColors.dotInactive` và kích thước nhỏ hơn `w-2 h-1 rounded-full`.
     * Thêm hiệu ứng transition: `transition-all duration-300` cho cảm giác chuyển slide cực kỳ mượt mà.

# V. Files Impacted (Tệp bị ảnh hưởng)
* **Sửa:** [HeroRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/HeroRuntimeSection.tsx)
  * Thay đổi logic hiển thị của slider trong block `if (style === 'builderCoffee')`.
  * Thay đổi tham số scale, blur, overlay trong phần render ảnh mờ của `builderCoffee`.
  * Thay thế nút bấm Next/Prev từ ảnh CDN sang CSS Tailwind động.
  * Cập nhật màu sắc và animation cho dots indicator.

# VI. Execution Preview (Xem trước thực thi)
1. **Đọc và xác định ranh giới sửa đổi:** Xác định chính xác các dòng code cần thay đổi trong layout `builderCoffee` trong file `HeroRuntimeSection.tsx` (khoảng từ dòng 315 đến 390).
2. **Thay đổi phần render hình ảnh và blur:** Cập nhật style và các class CSS cho khối chứa ảnh mờ để áp dụng gradient mask.
3. **Thay thế code nút bấm Next/Prev:** Xóa thuộc tính `backgroundImage` hardcode và thay bằng các class Tailwind thiết kế bán nguyệt và hover effect.
4. **Cập nhật code Dots:** Nối dây màu sắc vào `sliderColors` và áp dụng hiệu ứng chuyển đổi kích thước của viên thuốc (pill indicator).
5. **Review tĩnh (Static Review):** Đảm bảo không có lỗi cú pháp, kiểm tra kiểu dữ liệu (Typescript) và tính tương thích của biến màu.

# VII. Verification Plan (Kế hoạch kiểm chứng)
Vì đây là thay đổi về mặt giao diện (UI/UX), chúng ta sẽ kiểm tra thủ công bằng cách quan sát giao diện ở cả Light Mode và Dark Mode sau khi sửa đổi:
1. **Kiểm tra Dark Mode:**
   * Nút điều hướng hai bên mép slider phải có màu tối mờ (`bg-slate-900/60` hoặc tương đương), hòa quyện vào nền đen xung quanh thay vì chói lòa.
   * Icon mũi tên trong nút phải có màu sáng dễ đọc.
   * Ảnh mờ hai bên phải chuyển tiếp mượt mà vào màu nền, không có viền sáng sắc cạnh.
   * Dots ở dưới phải đổi màu tương ứng và có hiệu ứng co giãn mượt mà khi đổi slide.
2. **Kiểm tra Light Mode:**
   * Nút điều hướng phải đổi thành màu sáng mờ, đảm bảo tương phản tốt trên nền sáng.
   * Dots đổi màu và hoạt động bình thường.
3. **Kiểm tra Responsive:**
   * Đảm bảo nút điều hướng tự động thu nhỏ kích thước trên màn hình di động mà không làm lệch layout hay đè lên nội dung quan trọng.

# VIII. Todo
- [x] Cập nhật phần hình ảnh mờ nền (Blur & Gradient Mask) trong layout `builderCoffee` của [HeroRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/HeroRuntimeSection.tsx).
- [x] Thay thế các nút điều hướng Next/Prev từ dùng ảnh CDN sang CSS Tailwind động sử dụng `sliderColors`.
- [x] Cập nhật thiết kế và màu sắc của Dots indicator sang dạng viên thuốc sử dụng màu của `sliderColors`.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* **Đạt:** 
  - Giao diện Hero slider trông hiện đại, tinh tế ở cả 2 chế độ sáng và tối.
  - Không còn hiện tượng nút bán nguyệt màu trắng xuất hiện ở chế độ Dark Mode.
  - Phần blur hai bên chuyển tiếp mượt mà vào màu nền tối của slider.
  - Slider hoạt động trơn tru, không có lỗi runtime hay lỗi layout.
* **Không đạt:** 
  - Nút bấm điều hướng vẫn giữ nguyên màu trắng chói ở Dark Mode.
  - Lộ viền ảnh mờ sắc cạnh hoặc màu nền mờ quá sáng so với background.
  - Lỗi type hoặc lỗi compile trang web.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro:** Thay đổi kích thước hoặc padding của nút điều hướng có thể làm lệch vị trí bấm hoặc che khuất ảnh chính trên các màn hình có tỉ lệ đặc biệt.
* **Hoàn tác:** Nếu xảy ra lỗi hoặc người dùng không ưng ý, có thể dễ dàng rollback file `HeroRuntimeSection.tsx` về phiên bản git gần nhất.

# XI. Out of Scope (Ngoài phạm vi)
* Thay đổi các style khác của Hero như `bento`, `fullscreen`, `parallax`, `split` (chỉ tập trung tối ưu layout `builderCoffee` như người dùng phản hồi).
* Thay đổi các component khác trên trang chủ ngoài Hero.
