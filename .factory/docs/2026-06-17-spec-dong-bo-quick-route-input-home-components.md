# Kế hoạch đồng bộ ô nhập link cho Hero Banners, CTA, Pricing, và Popup bằng QuickRouteInput

## I. Primer

### 1. TL;DR kiểu Feynman
- **Vấn đề**: Các form nhập của Hero Banners, CTA, Pricing, và Popup đang sử dụng các ô nhập text thuần (Input) cho trường link, khiến người dùng phải gõ tay hoặc copy-paste URL rất thủ công.
- **Giải pháp**: Thay thế các ô Input link này bằng component dùng chung `QuickRouteInput` đã được tích hợp sẵn bộ chọn gợi ý link `QuickRoutePickerModal` (với icon mắt xích viền mỏng bo góc mềm mại).
- **Lợi ích**: Đồng bộ UI/UX 100% với trang Menus và Footer, mang lại trải nghiệm chuyên nghiệp, nhanh chóng và hạn chế sai lệch liên kết.

### 2. Elaboration & Self-Explanation
Component `QuickRouteInput` (được định nghĩa tại `app/admin/home-components/_shared/components/QuickRouteInput.tsx`) là một wrapper thông minh bao gồm một ô `Input` và một nút bấm icon `Link2` kế bên để kích hoạt `QuickRoutePickerModal`. Component này đã được thiết kế sẵn và hoạt động rất tốt ở các trang quản lý quy trình, sản phẩm và dịch vụ.

Bằng việc đưa `QuickRouteInput` vào các form cấu hình của Hero, CTA, Pricing, và Popup, chúng ta nâng cấp toàn bộ các trường nhập link của hệ thống Home Components về một chuẩn duy nhất, giúp người dùng dễ dàng chọn link bài viết, danh mục hay sản phẩm thực tế từ cơ sở dữ liệu chỉ với vài cú click chuột.

### 3. Concrete Examples & Analogies
- **Ví dụ cụ thể**:
  - *Trước đây*: Khi cấu hình nút bấm chính của Hero section, người dùng phải mở tab mới, copy URL `/contact` hoặc `/posts/tin-tuc-moi`, rồi quay lại dán vào ô link.
  - *Sau khi sửa*: Người dùng chỉ cần click vào biểu tượng mắt xích nhỏ bên phải ô link, chọn loại "Bài viết" -> "Tin tức mới" từ modal gợi ý để hệ thống tự điền URL chuẩn.
- **Analogy**: Giống như việc trước đây khách hàng phải tự viết tay địa chỉ nhận hàng, nay hệ thống tích hợp bộ chọn Tỉnh/Thành phố thông minh giúp họ click chọn nhanh chóng và chính xác.

---

## II. Audit Summary (Tóm tắt kiểm tra)
Các tệp và vị trí trường nhập link cần được sửa đổi:
1. [HeroForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/hero/_components/HeroForm.tsx):
   - Trường link nút chính: `heroContent.primaryButtonLink` (dòng 320-324).
   - Trường link nút phụ: `heroContent.secondaryButtonLink` (dòng 329-333).
2. [CTAForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/cta/_components/CTAForm.tsx):
   - Trường link nút chính: `config.buttonLink` (dòng 65).
   - Trường link nút phụ: `config.secondaryButtonLink` (dòng 69).
3. [page.tsx (Pricing Edit)](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/pricing/[id]/edit/page.tsx):
   - Trường link nút đăng ký: `plan.buttonLink` (dòng 736-737).
4. [page.tsx (Pricing Create)](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/create/pricing/page.tsx):
   - Trường link nút đăng ký: `plan.buttonLink` (dòng 458-460).
5. [PopupForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/popup/_components/PopupForm.tsx):
   - Trường link nút phụ: `config.secondaryButtonLink` (dòng 280).
   - Trường link nút chính: `config.primaryButtonLink` (dòng 294).

---

## III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Root Cause**: Các form cấu hình Home Components được xây dựng vào nhiều thời điểm khác nhau. Một số form cũ vẫn sử dụng `<Input>` text cơ bản của Tailwind/Shadcn, trong khi component dùng chung `QuickRouteInput` mới được tạo ra gần đây chưa được phủ rộng rãi.
- **Giả thuyết đối chứng**: Việc giữ nguyên input text có thể giúp tránh thay đổi code, tuy nhiên nó làm phân mảnh trải nghiệm UI/UX của quản trị viên (có chỗ thì chọn được gợi ý, có chỗ lại phải copy tay), giảm tính premium của sản phẩm. Việc refactor sang `QuickRouteInput` là giải pháp sạch sẽ nhất.

---

## IV. Proposal (Đề xuất)
Import `QuickRouteInput` từ component dùng chung tương ứng và thay thế các ô `<Input>` link bằng `<QuickRouteInput>`. Do prop callback của `QuickRouteInput` là `onChangeValue` (nhận trực tiếp string giá trị link mới) thay vì `onChange` của event input, ta sẽ điều chỉnh handler cho phù hợp:

1. **HeroForm.tsx**:
   - Thay `<Input value={heroContent.primaryButtonLink} onChange={(e) => ...} />` bằng `<QuickRouteInput value={heroContent.primaryButtonLink} onChangeValue={(v) => setHeroContent({ ...heroContent, primaryButtonLink: v })} />`.
   - Làm tương tự cho `secondaryButtonLink`.
2. **CTAForm.tsx**:
   - Thay các `<Input>` link bằng `<QuickRouteInput>` tương ứng với callback `onChangeValue`.
3. **Pricing Form (Edit & Create page.tsx)**:
   - Thay thế ô nhập link của gói đăng ký bằng `<QuickRouteInput>`.
4. **PopupForm.tsx**:
   - Thay thế link nút chính và nút phụ bằng `<QuickRouteInput>`.

---

## V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa**: [HeroForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/hero/_components/HeroForm.tsx)
- **Sửa**: [CTAForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/cta/_components/CTAForm.tsx)
- **Sửa**: [page.tsx (Pricing Edit)](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/pricing/[id]/edit/page.tsx)
- **Sửa**: [page.tsx (Pricing Create)](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/create/pricing/page.tsx)
- **Sửa**: [PopupForm.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/admin/home-components/popup/_components/PopupForm.tsx)

---

## VI. Execution Preview (Xem trước thực thi)
1. Tiến hành thay đổi code lần lượt cho 5 file bằng công cụ `replace_file_content` hoặc `multi_replace_file_content`.
2. Chạy kiểm tra tĩnh TypeScript compiler (`tsc --noEmit`).
3. Commit code và spec lên git repository.

---

## VII. Verification Plan (Kế hoạch kiểm chứng)
- **Kiểm chứng tĩnh (Static Verification)**:
  - Chạy `bunx tsc --noEmit` để đảm bảo dự án build thành công không lỗi syntax/type.
- **Kiểm chứng thủ công (Manual Verification)**:
  - Mở trang tạo/chỉnh sửa Hero, CTA, Pricing, và Popup trong admin UI.
  - Kiểm tra xem các ô nhập link của các khối này có hiển thị nút icon Link2 kế bên không.
  - Bấm vào nút icon Link2 xem modal gợi ý có hiển thị đầy đủ và khi click chọn link, URL tương ứng có tự động được điền vào ô link hay không.

---

## VIII. Todo
- [x] Refactor `HeroForm.tsx` sử dụng `QuickRouteInput`.
- [x] Refactor `CTAForm.tsx` sử dụng `QuickRouteInput`.
- [x] Refactor Pricing `edit/page.tsx` và `create/pricing/page.tsx` sử dụng `QuickRouteInput`.
- [x] Refactor `PopupForm.tsx` sử dụng `QuickRouteInput`.
- [x] Kiểm tra tĩnh dự án và sửa lỗi type (nếu có).
- [x] Báo hoàn thành bằng âm báo PowerShell.

---

## IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Tất cả các trường nhập link của các Home Components trên đều sử dụng chung 1 component `QuickRouteInput`.
- Nút bấm và popup hiển thị đồng bộ giống hệt như trang Menus và Footer.
- Dự án build thành công, không gặp lỗi.
