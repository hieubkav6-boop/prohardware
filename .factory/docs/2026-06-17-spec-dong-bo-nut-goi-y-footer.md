# Kế hoạch đồng bộ nút gợi ý link ở Footer với Menus bằng QuickRoutePickerModal

## I. Primer

### 1. TL;DR kiểu Feynman
- **Vấn đề**: Trang quản lý Footer hiện tại đang tự viết một bộ chọn link (Picker) riêng rất dài dòng, giao diện cũ kỹ và không đồng bộ với bộ chọn link hiện đại, chuẩn chỉ ở trang quản lý Menus.
- **Giải pháp**: Xóa bỏ toàn bộ code tự vẽ picker cũ ở Footer, thay thế bằng component dùng chung `QuickRoutePickerModal` đã có sẵn trong hệ thống.
- **Lợi ích**: UI/UX đồng bộ 100%, code gọn hơn gần 300 dòng, không còn chạy các query DB dư thừa ở client.

### 2. Elaboration & Self-Explanation
Hiện tại, trang `/admin/home-components/create/footer` (thông qua component `FooterForm.tsx`) tự quản lý trạng thái mở picker, các bước chọn (bước 1: loại trang, bước 2: danh mục/module, bước 3: chi tiết sản phẩm/bài viết) và tự fetch danh sách bài viết/sản phẩm bằng các API Convex trực tiếp tại component này. Việc này dẫn đến việc nhân bản code (code duplication), giao diện không nhất quán với bộ chọn link ở trang `/admin/menus`, và làm tăng tải truy vấn cơ sở dữ liệu không cần thiết ở client.

Bằng việc thay thế logic cũ bằng component `QuickRoutePickerModal` (được định nghĩa tại `app/admin/components/QuickRoutePickerModal.tsx`), ta tận dụng được component dùng chung đã được tối ưu hóa, hỗ trợ phân loại rõ ràng, giao diện responsive, mượt mà và đồng bộ. Các query danh sách bài viết/sản phẩm/dịch vụ chi tiết sẽ chỉ được chạy khi modal được mở và chuyển sang bước tương ứng, giúp giảm tải DB bandwidth đáng kể.

### 3. Concrete Examples & Analogies
- **Ví dụ cụ thể**:
  - *Trước đây*: Khi bấm nút "Gợi ý" ở Footer, một dialog tự chế có 3 bước hiện ra, giao diện không bo góc mượt, không có thanh tìm kiếm thông minh và làm component `FooterForm` phải load trước toàn bộ post/product/service categories từ Convex.
  - *Sau khi sửa*: Khi bấm "Gợi ý", `QuickRoutePickerModal` xuất hiện với giao diện đồng bộ như bên trang Menus, hỗ trợ tìm kiếm trực tiếp và phân tầng chọn gọn gàng.
- **Analogy**: Giống như việc mỗi phòng ban trong công ty tự thiết kế một mẫu hóa đơn thanh toán riêng (mẫu cũ, xấu, dễ sai sót), nay chúng ta chuyển sang dùng chung một mẫu hóa đơn chuẩn của phòng tài chính đã thiết kế chuyên nghiệp và bảo mật.

---

## II. Audit Summary (Tóm tắt kiểm tra)
- **Tệp kiểm tra**:
  - [FooterForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/footer/_components/FooterForm.tsx): Chứa dialog tự chế và logic picker cũ.
  - [QuickRoutePickerModal.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/components/QuickRoutePickerModal.tsx): Component dùng chung chuẩn đã hoạt động tốt ở trang Menus.
- **Dữ liệu**: Lọc tĩnh `STATIC_QUICK_ROUTE_OPTIONS` được tạo ra từ `CORE_ROUTE_OPTIONS` và `MODULE_SITE_ROUTE_CATALOG` để làm dữ liệu gợi ý 2/4 cột ban đầu mà không cần gọi Convex query dư thừa ở client.

---

## III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Root Cause**: Tính năng gợi ý link được phát triển riêng lẻ ở giai đoạn đầu của dự án cho từng component. Sau đó, trang Menus được cải tiến và gom nhóm logic thành `QuickRoutePickerModal` nhưng trang Footer chưa được cập nhật để sử dụng component dùng chung này.
- **Giả thuyết đối chứng**: Nếu chỉ chỉnh sửa CSS của Dialog cũ ở Footer cho giống trang Menus thì sao? Việc này vẫn giữ lại gần 300 dòng code dư thừa và tiếp tục duy trì kỹ thuật không tối ưu (load dư query Convex ở client khi render component cha). Do đó, refactor thay thế bằng `QuickRoutePickerModal` là giải pháp tối ưu nhất.

---

## IV. Proposal (Đề xuất)
1. **Import `QuickRoutePickerModal`** từ `@/app/admin/components/QuickRoutePickerModal` vào `FooterForm.tsx`.
2. **Xóa bỏ các state và query cũ**:
   - Xóa `pickerStep`, `selectedType`, `selectedModule`.
   - Xóa các lazy queries: `detailPosts`, `detailProducts`, `detailServices` và các variables `quickRouteOptions`, `filteredQuickRoutes`, `filteredPickerRoutes`, `isDetailLoading`.
   - Xóa `quickRouteSearch`, `setQuickRouteSearch`.
   - Xóa queries `enabledModules`, `productCategories`, `postCategories`, `serviceCategories`, `routeModeSetting`, `routeMode` (vì modal dùng chung đã tự gọi các query này khi mở).
3. **Giữ lại và tinh chỉnh**:
   - `isQuickPickerOpen`, `setIsQuickPickerOpen`.
   - `pickerTarget`, `setPickerTarget`.
   - Cập nhật `handleOpenQuickPicker` và `handleCloseQuickPicker` cho gọn.
   - Cập nhật `handleSelectQuickRoute` để map data trả về từ callback `onSelect(option)`.
4. **Xây dựng `STATIC_QUICK_ROUTE_OPTIONS`**:
   - Tạo biến tĩnh này từ `CORE_ROUTE_OPTIONS` và `MODULE_SITE_ROUTE_CATALOG` có sẵn để truyền vào hàm `buildSuggestedColumns` phục vụ cho nút "Gợi ý 2 cột" / "Gợi ý 4 cột" mà không cần query DB.
5. **Thay thế Dialog render**:
   - Xóa thẻ `<Dialog open={isQuickPickerOpen} ...>` cũ ở cuối file.
   - Thêm `<QuickRoutePickerModal open={isQuickPickerOpen} onOpenChange={setIsQuickPickerOpen} onSelect={handleSelectQuickRoute} title={pickerTarget?.type === 'column' ? 'Thêm link gợi ý cho cột' : 'Chọn link gợi ý'} />`.

---

## V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa**: [FooterForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/footer/_components/FooterForm.tsx)
  - Thay thế Dialog picker cũ bằng `QuickRoutePickerModal`.
  - Loại bỏ các states, queries và helpers không còn sử dụng.
  - Cập nhật hàm gợi ý cột tĩnh và hàm handle callback select.

---

## VI. Execution Preview (Xem trước thực thi)
1. Đọc và lưu lại phần code xử lý `handleSelectQuickRoute` của `FooterForm.tsx`.
2. Tiến hành thay đổi code ở `FooterForm.tsx` bằng công cụ `replace_file_content`.
3. Kiểm tra tĩnh (static checking) xem code có lỗi syntax hay import sai không.

---

## VII. Verification Plan (Kế hoạch kiểm chứng)
- **Kiểm chứng tĩnh (Static Verification)**:
  - Kiểm tra xem component build thành công và không bị lỗi typescript compile.
- **Kiểm chứng thủ công (Manual Verification)**:
  - Mở trang tạo footer hoặc edit footer.
  - Bấm vào nút "Gợi ý 2 cột" hoặc "Gợi ý 4 cột" xem có hoạt động bình thường không.
  - Bấm vào nút "Gợi ý link" ở cột hoặc link cụ thể -> Kiểm tra xem `QuickRoutePickerModal` mới có mở lên không, giao diện giống bên trang Menus không.
  - Chọn một trang/link bất kỳ -> Kiểm tra xem giá trị label và url có được điền đúng vào form không.

---

## VIII. Todo
- [x] Thực hiện import `QuickRoutePickerModal` và loại bỏ code picker cũ trong `FooterForm.tsx`.
- [x] Khởi chạy lệnh verify tĩnh.
- [x] Chạy lệnh báo hoàn thành task bằng giọng nói.

---

## IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Trình chọn link gợi ý ở trang footer hoạt động hoàn toàn giống trang menus (cùng giao diện, cùng tính năng tìm kiếm và phân loại).
- Không còn code thừa liên quan đến picker cũ trong `FooterForm.tsx`.
- Các tính năng "Gợi ý 2 cột", "Gợi ý 4 cột" vẫn chạy bình thường dựa trên dữ liệu tĩnh.

---

## X. Risk / Rollback (Rủi ro / Hoàn tác)
- **Rủi ro**: Lỗi import do sai alias hoặc thiếu component.
- **Hoàn tác**: Sử dụng `git checkout` để hoàn tác file `FooterForm.tsx` về trạng thái ban đầu nếu phát hiện lỗi nghiêm trọng.

---

## XI. Out of Scope (Ngoài phạm vi)
- Không can thiệp vào các component gợi ý AI khác ở trang `home-components` vì chúng hoạt động theo pattern khác (AI Demo JSON Import).
- Không chỉnh sửa database schema hay Convex functions.
