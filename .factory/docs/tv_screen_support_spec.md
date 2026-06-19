# I. Primer

## 1. TL;DR kiểu Feynman
Chúng ta sẽ thêm đúng **1 điểm mốc duy nhất** là `tv` dành cho màn hình lớn từ 1920px trở lên (gấp 1.5 lần màn hình máy tính thông thường). 
Scope chính là tập trung vào việc **scale kích thước và sắp xếp bố cục** nhất quán:
* Tất cả các khu vực nội dung (container) trên trang web sẽ mở rộng từ giới hạn cũ 1280px lên một kích thước thống nhất là **1600px** khi hiển thị trên TV.
* Các font chữ, khoảng cách (padding/margin) và kích thước các phần tử (như các ô sản phẩm, card dịch vụ, vòng tròn quy trình) sẽ tự động phóng to đồng đều để bố cục cân đối, đẹp mắt, không bị trống trải.
* Phần chạy chữ đối tác được tối ưu cơ chế dịch chuyển để chạy hết toàn màn hình TV siêu rộng một cách liên tục và mượt mà, không bị hụt hay đứt quãng giữa chừng.

## 2. Elaboration & Self-Explanation
Yêu cầu cốt lõi là làm thế nào để trang web DOHY Media hiển thị đẹp mắt, nhất quán về mặt bố cục trên màn hình TV lớn (>= 1920px). Khi màn hình quá rộng:
* **Sự không nhất quán về chiều rộng**: Nếu có component co cụm ở 1280px, component khác lại tràn ra 100% sẽ gây mất cân đối nghiêm trọng. Chúng tôi đề xuất áp dụng một chiều rộng nội dung thống nhất `tv:max-w-[1600px]` cho tất cả các container của home-components và preview experiences.
* **Vấn đề chạy chữ bị đứt quãng**: Các dải chạy chữ (marquee) giới thiệu đối tác nếu không được tính toán độ dài sẽ bị trống ở phần cuối khi màn hình TV quá rộng. Chúng tôi sẽ tối ưu chiều dài dải chạy chữ và CSS animation để dải chữ lấp đầy và chạy liên tục 100% chiều rộng TV.
* **Scale đồng bộ**: Tăng kích thước font chữ (body text, heading) và spacing (padding dọc, khoảng cách gap của các cột grid) theo một tỷ lệ nhất quán để toàn bộ trang web trông giống như được thiết kế riêng cho TV chứ không phải là phiên bản desktop phóng to cưỡng bức.

## 3. Concrete Examples & Analogies
* **Ví dụ cụ thể**: 
  * Trên desktop, lưới sản phẩm 6 cột có chiều rộng tổng cộng 1280px (mỗi card sản phẩm rộng khoảng 200px). Trên màn hình `tv`, container mở rộng ra 1600px, các card sản phẩm sẽ tự động scale-up chiều rộng lên khoảng 250px và gap giữa chúng tăng lên `tv:gap-8` để vừa vặn hoàn hảo với không gian mới mà không làm thay đổi cấu trúc 6 cột.
  * Phần chạy chữ đối tác trên desktop chỉ cần dài 1500px là lặp lại mượt mà, nhưng trên TV 1920px, dải chữ chạy sẽ được cấu hình nhân đôi nội dung và điều chỉnh keyframe `transform: translateX(-50%)` để đảm bảo chu kỳ chạy chữ không bao giờ bị lộ khoảng trống trắng ở mép màn hình.
* **Phép so sánh (Analogy)**: Việc này giống như chúng ta nâng cấp kích cỡ ảnh in từ khổ nhỏ lên khổ lớn treo tường. Chúng ta cần phóng to tất cả các chi tiết (nhân vật, khung cảnh, khoảng trắng xung quanh) theo đúng một tỷ lệ đồng nhất để bức ảnh giữ nguyên sự hài hòa ban đầu, đồng thời đảm bảo dải ruy băng trang trí chạy ngang bên dưới bức ảnh phải đủ dài để ôm trọn chiều rộng khung tranh mới.

---

# II. Audit Summary (Tóm tắt kiểm tra)
1. **Breakpoint**: Chưa có breakpoint `tv` (1920px). Lớn nhất hiện tại chỉ là `2xl` (1536px).
2. **Chiều Rộng Không Nhất Quán**: Các component đang dùng rải rác các class `max-w-7xl` (1280px), `max-w-6xl` (1152px), hoặc `container` mặc định. Trên màn hình TV, sự sai lệch này sẽ bị phóng đại lên và nhìn rất mất cân đối.
3. **Hiệu ứng Chạy Chữ (Marquee)**: Component chạy chữ đối tác (`ClientsRuntimeSection`) sử dụng CSS animation dịch chuyển ngang. Nếu độ dài chuỗi text/logo chạy ngắn hơn chiều rộng TV (1920px), dải chữ sẽ bị đứt đoạn, để lại khoảng trống màu đen ở rìa phải trước khi vòng lặp mới bắt đầu.
4. **Grid & Spacing Cố Định**: Các grid 6 cột (Sản phẩm) hay 3 cột (Dịch vụ) và spacing `py-12`/`gap-6` quá nhỏ so với tỷ lệ màn hình TV rộng lớn.

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Nguyên nhân gốc**: Hệ thống chưa có cấu hình kích thước và tỷ lệ scale dành riêng cho màn hình TV từ 1920px trở lên. CSS chỉ xử lý tối đa cho màn hình 1536px, khiến toàn bộ bố cục bị co cụm hoặc giãn nở không đồng bộ khi xem trên TV.
* **Giả thuyết đối chứng**: 
  * *Giả thuyết 1: Cho phép nội dung tự do giãn rộng 100% chiều rộng màn hình (Full Width).* -> Sai, vì các cột thông tin sẽ bị kéo quá xa nhau, gây loãng và phá vỡ thiết kế gốc của DOHY Media.
  * *Giả thuyết 2 (Được chọn): Thiết lập giới hạn chiều rộng nhất quán `tv:max-w-[1600px]` cho toàn bộ nội dung chính, kết hợp scale-up font-size, grid gap và nhân đôi dải chạy chữ.* -> Đảm bảo giao diện cân đối, nhất quán và dải chạy chữ lấp đầy màn hình TV mượt mà.

* **Độ tin cậy nguyên nhân gốc**: High (Cao). Đã được xác minh thông qua các tệp mã nguồn hiện tại và phản hồi scope từ người dùng.

---

# IV. Proposal (Đề xuất)
Chúng tôi đề xuất giải pháp tập trung hoàn toàn vào **Scale & Bố Cục**:
1. **Cấu hình breakpoint**: Khai báo `--breakpoint-tv: 120rem;` (1920px) trong [globals.css](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/globals.css).
2. **Nhất quán Container**: Sửa đổi toàn bộ các container nội dung chính (cả Home Components và 18 màn hình Preview) thành `tv:max-w-[1600px] mx-auto` để đảm bảo căn lề thẳng hàng từ trên xuống dưới.
3. **Scale Font Size & Spacing**:
   * Tiêu đề Hero: `tv:text-7xl` hoặc `tv:text-8xl`.
   * Chữ mô tả: `tv:text-lg` hoặc `tv:text-xl`.
   * Padding dọc: `tv:py-32` hoặc `tv:py-36`.
   * Khoảng cách Grid Gap: nâng từ `gap-6` lên `tv:gap-8` hoặc `tv:gap-10`.
4. **Tối ưu Chạy Chữ (Clients Marquee)**:
   * Đảm bảo dải logo/chạy chữ được nhân đôi nội dung (duplicate) trong DOM.
   * Sử dụng animation lặp với `transform: translateX(-50%)` để dải chạy chữ phủ kín toàn bộ 1920px của TV và chạy trơn tru không có điểm dừng trống.

---

# V. Files Impacted (Tệp bị ảnh hưởng)

### Nhóm 1: CSS & Core Layout
1. **Sửa**: [app/globals.css](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/globals.css)
   * *Vai trò hiện tại*: CSS toàn cục và cấu hình theme.
   * *Thay đổi*: Khai báo breakpoint `--breakpoint-tv: 120rem;` vào `@theme inline`.
2. **Sửa**: [components/site/Header.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/Header.tsx)
   * *Vai trò hiện tại*: Thanh menu điều hướng đầu trang.
   * *Thay đổi*: Cập nhật container menu thành `tv:max-w-[1600px]` và scale cỡ chữ menu trên TV.
3. **Sửa**: [components/site/DynamicFooter.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/DynamicFooter.tsx) và [components/site/Footer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/Footer.tsx)
   * *Vai trò hiện tại*: Chân trang.
   * *Thay đổi*: Cập nhật container thành `tv:max-w-[1600px]` và scale layout trên TV.

### Nhóm 2: Home Components (Trang chủ)
4. **Sửa**: [components/site/home/sections/HeroRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/HeroRuntimeSection.tsx)
   * *Vai trò hiện tại*: Slide/Banner lớn.
   * *Thay đổi*: Cập nhật container `tv:max-w-[1600px]`, tăng kích thước font tiêu đề chính (`tv:text-7xl/text-8xl`) và padding dọc.
5. **Sửa**: [components/site/home/sections/BenefitsRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/BenefitsRuntimeSection.tsx)
   * *Vai trò hiện tại*: Section lợi ích.
   * *Thay đổi*: Cập nhật container `tv:max-w-[1600px]` và scale các thẻ nội dung.
6. **Sửa**: [components/site/home/sections/ClientsRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/ClientsRuntimeSection.tsx)
   * *Vai trò hiện tại*: Section chạy chữ đối tác.
   * *Thay đổi*: Đảm bảo nội dung chạy chữ được phủ đủ chiều rộng màn hình lớn, tăng chiều cao block `tv:h-24 tv:py-6`, scale font chữ chạy lên `tv:text-3xl` và tối ưu keyframe animation dịch chuyển mượt mà trên TV.
7. **Sửa**: [components/site/home/sections/CtaRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/CtaRuntimeSection.tsx)
   * *Vai trò hiện tại*: Khối kêu gọi hành động.
   * *Thay đổi*: Scale font size nút bấm và tiêu đề, nới rộng padding.
8. **Sửa**: [components/site/home/sections/FaqRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/FaqRuntimeSection.tsx)
   * *Vai trò hiện tại*: Khối câu hỏi thường gặp.
   * *Thay đổi*: Giới hạn chiều rộng block FAQ ở mức cân đối (`max-w-[1200px] tv:max-w-[1400px]`) để text không bị kéo quá rộng khó đọc.
9. **Sửa**: [components/site/home/sections/FeaturesRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/FeaturesRuntimeSection.tsx)
   * *Vai trò hiện tại*: Khối tính năng.
   * *Thay đổi*: Scale layout grid và text mô tả ở breakpoint `tv`.
10. **Sửa**: [components/site/home/sections/ProcessRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/ProcessRuntimeSection.tsx)
    * *Vai trò hiện tại*: Quy trình làm việc.
    * *Thay đổi*: Tăng kích thước node tròn và cỡ chữ bên trong để cân xứng với TV.
11. **Sửa**: [components/site/home/sections/StatsRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/StatsRuntimeSection.tsx)
    * *Vai trò hiện tại*: Số liệu thống kê.
    * *Thay đổi*: Scale size chữ các số lớn (`tv:text-8xl`) và khoảng cách gap.
12. **Sửa**: [components/site/home/sections/VideoRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/VideoRuntimeSection.tsx)
    * *Vai trò hiện tại*: Khung hiển thị video.
    * *Thay đổi*: Giới hạn chiều rộng khung video (`tv:max-w-[1400px]`) để video không bị quá cao và vỡ hình.
13. **Sửa**: [components/site/ComponentRenderer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/ComponentRenderer.tsx)
    * *Vai trò hiện tại*: Bộ render các block trang chủ.
    * *Thay đổi*: Cập nhật đồng bộ các container `max-w-7xl` thành `tv:max-w-[1600px]` ở breakpoint `tv`.

### Nhóm 3: Các Experiences Previews
14. **Sửa**: 18 file previews trong [components/experiences/previews/](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/experiences/previews/)
    * *Thay đổi*: Đồng bộ hóa thay thế `max-w-7xl` thành `tv:max-w-[1600px]`, tăng font chữ, scale grid layout và giới hạn cột form nhập liệu để bố cục gọn gàng, nhất quán trên màn hình TV.

---

# VI. Execution Preview (Xem trước thực thi)
1. **Bước 1**: Khai báo `--breakpoint-tv: 120rem;` vào [globals.css](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/globals.css).
2. **Bước 2**: Thay đổi container [Header.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/Header.tsx) và các Footer thành `tv:max-w-[1600px]`.
3. **Bước 3**: Cập nhật 9 home components trong `components/site/home/sections/` để đồng bộ container `tv:max-w-[1600px]`, scale chữ và tối ưu hóa chuyển động chạy chữ của `ClientsRuntimeSection`.
4. **Bước 4**: Thay đổi [ComponentRenderer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/ComponentRenderer.tsx).
5. **Bước 5**: Tinh chỉnh 18 file preview trong `components/experiences/previews/`.
6. **Bước 6**: Chạy static check `bunx tsc --noEmit`.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
* **Kiểm tra tự động (Static Check)**:
  * Chạy `bunx tsc --noEmit`.
* **Kiểm tra thủ công (Manual Verification)**:
  * Sử dụng Chrome DevTools Responsive mode mở rộng màn hình lên `1920px` (TV Mode).
  * Xác nhận trực quan:
    1. Tất cả các section đều mở rộng thẳng hàng với chiều rộng tối đa thống nhất `1600px` (nhất quán từ Header, các Home components đến Footer).
    2. Dải chạy chữ đối tác hiển thị liên tục, chạy hết chiều ngang màn hình TV mà không bị khoảng trống hay đứt quãng.
    3. Cỡ chữ và khoảng cách (padding, gap) hiển thị hài hòa, cân đối.

---

# VIII. Todo
- [ ] 1. Khai báo breakpoint `tv` (`120rem`) trong [app/globals.css](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/app/globals.css).
- [ ] 2. Điều chỉnh container và size chữ [components/site/Header.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/Header.tsx) cho TV.
- [ ] 3. Điều chỉnh container [components/site/DynamicFooter.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/DynamicFooter.tsx) và [components/site/Footer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/Footer.tsx).
- [ ] 4. Cập nhật container và scale-up [components/site/home/sections/HeroRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/HeroRuntimeSection.tsx).
- [ ] 5. Cập nhật container [components/site/home/sections/BenefitsRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/BenefitsRuntimeSection.tsx).
- [ ] 6. Cấu hình lại dải chạy chữ đối tác [components/site/home/sections/ClientsRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/ClientsRuntimeSection.tsx) chạy tràn màn hình TV không bị đứt đoạn, tăng chiều cao block.
- [ ] 7. Cập nhật [components/site/home/sections/CtaRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/CtaRuntimeSection.tsx).
- [ ] 8. Cập nhật [components/site/home/sections/FaqRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/FaqRuntimeSection.tsx) (giới hạn chiều rộng thích hợp).
- [ ] 9. Cập nhật [components/site/home/sections/FeaturesRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/FeaturesRuntimeSection.tsx).
- [ ] 10. Cấu hình lại kích thước quy trình [components/site/home/sections/ProcessRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/ProcessRuntimeSection.tsx).
- [ ] 11. Cập nhật [components/site/home/sections/StatsRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/StatsRuntimeSection.tsx).
- [ ] 12. Cập nhật [components/site/home/sections/VideoRuntimeSection.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/home/sections/VideoRuntimeSection.tsx) (giới hạn chiều rộng video).
- [ ] 13. Cập nhật đồng bộ các container `max-w-7xl` thành `tv:max-w-[1600px]` ở [components/site/ComponentRenderer.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/site/ComponentRenderer.tsx).
- [ ] 14. Cập nhật 18 file preview trong [components/experiences/previews/](file:///e:/NextJS/job/job_from_system_vietadmin/system_dohy/components/experiences/previews/) để đồng bộ container `tv:max-w-[1600px]`.

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* **Tiêu chí 1**: Chỉ sử dụng duy nhất một breakpoint mới là `tv: 1920px` (gấp 1.5 lần desktop mặc định).
* **Tiêu chí 2**: Ở độ phân giải >= 1920px, toàn bộ các vùng nội dung chính được giới hạn chiều rộng nhất quán ở `1600px` và căn giữa màn hình.
* **Tiêu chí 3**: Kích thước chữ, khoảng cách (padding, margin, gap) được scale to đồng bộ, tạo bố cục cân đối và sang trọng trên TV.
* **Tiêu chí 4**: Dải chạy chữ đối tác lấp đầy màn hình và hoạt động liên tục không bị gián đoạn hay đứt quãng trên TV.
* **Tiêu chí 5**: Hệ thống biên dịch không có lỗi Typescript.

---

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro**: Viết thiếu tiền tố `tv:` có thể làm vỡ giao diện trên màn hình desktop thông thường.
* **Biện pháp giảm thiểu**: Chỉ áp dụng modifier `tv:` cho tất cả các class thay đổi kích thước và khoảng cách.
* **Hoàn tác**: Sử dụng git để rollback nếu phát hiện bất kỳ sự sai lệch nào trên desktop/mobile.

---

# XI. Out of Scope (Ngoài phạm vi)
* Thiết kế lại cấu trúc logic của backend hoặc tạo các trường database mới.
* Thay đổi hình ảnh/video gốc của trang web.
* Chỉnh sửa tương phản màu sắc của giao diện (loại bỏ khỏi phạm vi theo yêu cầu của người dùng).
