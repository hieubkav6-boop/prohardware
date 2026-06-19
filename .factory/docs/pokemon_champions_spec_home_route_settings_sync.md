# I. Primer

## 1. TL;DR kiểu Feynman
* **Mục tiêu:** Đồng bộ hóa cấu hình và chuẩn hóa giao diện (flat design MacBook) cho mini-app Pokémon Champions.
* **Hành động 1:** Gỡ bỏ 3 trường: Hero subtitle, Announcement và Order instructions khỏi UI tab "Settings liên hệ" trong trang quản trị Pokémon Champions. Ẩn hiển thị của chúng ở giao diện site thực và preview.
* **Hành động 2:** Tích hợp cấu hình "Kiểu route" vào tab "Home-component" trong trang quản trị Pokémon Champions để đồng bộ với trang cấu hình hệ thống (`/system/mini-apps`).
* **Hành động 3:** Nâng cấp UI preview của Home-component trong trang quản trị với thiết kế flat clean kiểu MacBook web, sử dụng `PreviewWrapper` và `BrowserFrame` hỗ trợ đổi thiết bị và Dark/Light mode.
* **Hành động 4:** Bỏ dùng màu Theme color riêng của app, sử dụng thống nhất hệ thống màu thương hiệu chung (dual/single color) lấy từ settings hệ thống của site.

## 2. Elaboration & Self-Explanation
* Hiện tại, trang cấu hình `/system/mini-apps` và tab "Home-component" ở trang quản trị `/admin/mini-apps/pokemon-champions` không đồng bộ về các trường cấu hình (tab quản trị thiếu trường "Kiểu route"). Ta sẽ đồng bộ 2 giao diện này để có chung logic và các trường cấu hình y hệt nhau.
* Đồng thời, tab Home-component ở trang quản trị sẽ được thiết kế lại đẹp mắt, flat design MacBook, sử dụng các hook và component dùng chung của hệ thống để hiển thị preview trực quan cả ở Light mode và Dark mode. Màu sắc hiển thị sẽ tự động bắt theo màu thương hiệu chung của website (lấy qua hook `useBrandColors`) thay vì cho phép admin tự cấu hình một màu theme color đơn lẻ làm lệch tông màu toàn site.
* Ba trường thông tin (Hero subtitle, Announcement, Order instructions) được xác định là không còn cần thiết, nên sẽ bị loại bỏ hoàn toàn khỏi giao diện cài đặt lẫn giao diện hiển thị cho người dùng cuối.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể:** Khi Admin thay đổi "Kiểu route" thành "Dùng chung layout site" hoặc "Site route riêng" ở tab Home-component của Pokémon Champions, cài đặt này sẽ được đồng bộ ngay lập tức và có tác dụng y hệt như khi chỉnh sửa ở `/system/mini-apps`. Khi xem preview của Home-component, Admin có thể nhấn nút chuyển đổi Dark/Light mode và Mobile/Tablet/Desktop để thấy giao diện Pokémon hiển thị tương ứng trên các môi trường.
* **Ví dụ đời thường:** Giống như một hãng xe ô tô loại bỏ các nút bấm chỉnh tay lỗi thời (Theme color riêng, Hero subtitle) để chuyển sang màn hình điều khiển trung tâm tự động đồng bộ theo chế độ lái chung của xe (Màu thương hiệu toàn trang, chế độ ngày/đêm tự động).

# II. Audit Summary (Tóm tắt kiểm tra)
* **Các file liên quan:**
  * [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx): File chứa giao diện quản trị Admin Pokémon Champions (gồm tab Settings liên hệ, Dữ liệu CRUD và Home-component).
  * [PokemonChampionsRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/PokemonChampionsRuntimeSection.tsx): File component hiển thị danh sách Pokémon Champions ngoài trang chủ (site public).
  * [page.tsx (system mini-apps)](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/system/mini-apps/page.tsx): File cấu hình Mini Apps ở phần System, cần đồng bộ logic lưu cấu hình `routeSurface` và `homeComponent`.
* **Trạng thái dữ liệu:**
  * Dữ liệu schema `pokemonChampionsSettings` hiện tại có các trường `heroSubtitle`, `announcement`, `orderInstructions` và `themeColor`.
  * Vì lí do tương thích dữ liệu cũ và tuân thủ quy tắc "Data Contract & Migration Discipline", ta sẽ không xóa cứng các trường này khỏi database schema của Convex mà chỉ làm chúng trở thành optional trong schema nếu cần thiết, hoặc giữ nguyên schema nhưng không expose/sử dụng chúng trên giao diện nữa (ghi đè bằng chuỗi rỗng hoặc giá trị mặc định khi update).

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Độ tin cậy nguyên nhân gốc:** High (Vì code hiện tại đang hiển thị trực tiếp 3 trường input này trên UI và sử dụng `themeColor` riêng lẻ không ăn theo hệ thống brand colors của website).
* **Giả thuyết đối chứng:** 
  * Nếu gỡ bỏ 3 trường input khỏi tab Settings liên hệ, và ẩn/xóa code render subtitle, announcement, order guide trên frontend thì 3 trường này sẽ biến mất hoàn toàn trên UI người dùng đúng theo yêu cầu.
  * Nếu tích hợp `routeSurface` (Kiểu route) vào form và dùng chung `PreviewWrapper` + `BrowserFrame` bọc quanh `PokemonHomePreview`, admin có thể cấu hình và xem trước giao diện y hệt như site thật.

# IV. Proposal (Đề xuất)
* **Cập nhật tab Settings liên hệ (Admin):**
  * Xóa bỏ 3 trường nhập liệu: "Hero subtitle", "Announcement" và "Order instructions" khỏi form trong component `SettingsPanel`.
* **Cập nhật Frontend site & Client view (trong Admin):**
  * Giao diện site chính (khi `editable` = false) và giao diện Preview:
    * Ẩn/xóa hoàn toàn phần render của Hero subtitle, Announcement banner.
    * Ẩn/xóa phần hướng dẫn đặt hàng (Guide box) trong modal đặt hàng (`OrderModal`).
* **Cập nhật tab Home-component (Admin):**
  * Bổ sung trường chọn "Kiểu route" (Dùng chung layout site / Site route riêng) vào form cấu hình giống như bên trang `/system/mini-apps`.
  * Nâng cấp UI form cấu hình bên trái: Thiết kế flat gọn gàng, sử dụng Switch hoặc select gọn gàng.
  * Nâng cấp UI preview bên phải (`PokemonHomePreview`): Sử dụng `PreviewWrapper` từ `_shared/components/PreviewWrapper` và `BrowserFrame` từ `_shared/components/BrowserFrame`. Sử dụng `useBrandColors` để lấy màu thương hiệu chính và phụ từ site để hiển thị. Hỗ trợ dark/light mode theo state của `usePreviewDark()`.
* **Cập nhật trang chủ site thực (`PokemonChampionsRuntimeSection.tsx`):**
  * Bỏ render subtitle.
  * Nhận thêm các props `secondary`, `mode`, `isDark` và sử dụng màu thương hiệu chung (`brandColor`, `secondary`, `mode`) để tô màu giao diện thay vì dùng themeColor cứng.
  * Sử dụng các class dynamic đổi màu theo `isDark` (Light mode dùng nền sáng xám nhẹ, card trắng viền slate, chữ sẫm; Dark mode dùng nền slate-950, card tối viền mờ, chữ trắng).

# V. Files Impacted (Tệp bị ảnh hưởng)
* `Sửa:` [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx)
  * Sửa tab Settings: Xóa 3 trường nhập liệu.
  * Sửa Client View & OrderModal: Xóa render subtitle, announcement banner và Guide box đặt hàng.
  * Sửa tab Home-component: Thêm cấu hình Kiểu route. Nâng cấp UI preview bọc trong `PreviewWrapper` & `BrowserFrame`, áp dụng màu từ `useBrandColors` và check `isDark`.
* `Sửa:` [PokemonChampionsRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/PokemonChampionsRuntimeSection.tsx)
  * Xóa render subtitle.
  * Sử dụng màu thương hiệu chung thay vì themeColor.
  * Hỗ trợ giao diện sáng/tối dựa trên prop `isDark`.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc kỹ file [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx) để xác định các vị trí cần sửa đổi.
2. Xóa 3 trường nhập liệu trong form Settings.
3. Sửa logic render của Client View và OrderModal.
4. Tích hợp `routeSurface` vào form Home-component và viết lại component `PokemonHomePreview` để dùng `PreviewWrapper`, `BrowserFrame` và `useBrandColors`.
5. Cập nhật [PokemonChampionsRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/PokemonChampionsRuntimeSection.tsx) để sử dụng màu brandColor/secondary của site và thích ứng với light/dark mode.
6. Commit thay đổi cùng spec lên git.

# VII. Verification Plan (Kế hoạch kiểm chứng)
* **Kiểm tra biên (Typecheck):**
  * Chạy `bunx tsc --noEmit` thủ công để đảm bảo không lỗi type compile.
* **Xác minh thủ công:**
  * Mở `http://localhost:3000/admin/mini-apps/pokemon-champions` -> tab "Settings liên hệ", kiểm tra xem 3 trường Hero subtitle, Announcement và Order instructions đã biến mất chưa.
  * Mở tab "Home-component", kiểm tra xem đã có trường "Kiểu route" chưa. Chỉnh sửa và bấm "Lưu & đồng bộ" xem có lưu thành công xuống DB và cập nhật sang trang `/system/mini-apps` không.
  * Xem preview của Home-component trong admin: thử chuyển đổi Dark/Light mode và thay đổi kích thước thiết bị (Mobile/Tablet/Desktop), kiểm tra màu sắc (đã ăn theo màu thương hiệu chung của site chưa) và chế độ sáng/tối có hiển thị đúng không.
  * Kiểm tra giao diện site thực tại `http://localhost:3000/pokemon-champions`: xem các banner subtitle và announcement đã biến mất chưa, nút đặt hàng mở ra có còn Guide box không.

# VIII. Todo
- [ ] Xóa 3 trường nhập liệu Hero subtitle, Announcement, Order instructions khỏi tab Settings trong [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx).
- [ ] Xóa code render Hero subtitle, Announcement banner, và Guide box đặt hàng khỏi Client View và OrderModal trong [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx).
- [ ] Thêm dropdown chọn "Kiểu route" vào tab Home-component trong [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx).
- [ ] Refactor `PokemonHomePreview` trong [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx): sử dụng `PreviewWrapper`, `BrowserFrame`, `useBrandColors` và hỗ trợ Dark/Light mode thực tế.
- [ ] Cập nhật component hiển thị ngoài site [PokemonChampionsRuntimeSection.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/components/site/home/sections/PokemonChampionsRuntimeSection.tsx): bỏ render subtitle, ăn theo màu thương hiệu chung và hỗ trợ light/dark mode.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* **Tiêu chí 1:** Tab Settings của Pokémon Champions Mini App không còn 3 trường Hero subtitle, Announcement, Order instructions.
* **Tiêu chí 2:** Tab Home-component của Pokémon Champions Mini App có đầy đủ các cài đặt tương tự `/system/mini-apps` (bật/tắt, style, số card, kiểu route) và được lưu/đồng bộ chính xác.
* **Tiêu chí 3:** Preview Home-component được bọc trong BrowserFrame & PreviewWrapper, hỗ trợ thiết bị và dark/light mode đầy đủ, màu sắc hiển thị ăn theo màu thương hiệu hệ thống.
* **Tiêu chí 4:** Site thực tế `/pokemon-champions` và homepage component không còn hiển thị subtitle hay announcement, màu sắc đồng bộ với site.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro:** Khi loại bỏ các trường trong settings, nếu DB chưa được migrate hoặc có giá trị cũ có thể gây lỗi undefined. Đã xử lý bằng cách dùng fallback toán tử `??` hoặc `||` trong code render.
* **Rollback:** Dùng `git checkout` để rollback các file đã chỉnh sửa về trạng thái gốc.

# XI. Out of Scope (Ngoài phạm vi)
* Việc cào dữ liệu Pokémon mới hoặc thay đổi logic nghiệp vụ đặt hàng (Order flow).
* Thay đổi các bảng dữ liệu Convex khác ngoài `pokemonChampionsSettings` và `miniApps`.
