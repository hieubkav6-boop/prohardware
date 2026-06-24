# I. Primer

## 1. TL;DR kiểu Feynman
Khi người dùng mở ảnh to (lightbox) trên điện thoại:
- Nút qua/lại (`<` và `>`) không bấm được vì bị một tấm kính vô hình (khung ảnh chiếm toàn bộ chiều ngang) đè lên trên.
- Đồng thời, người dùng vuốt tay trên màn hình cũng không chuyển được ảnh vì lightbox này chỉ là một ảnh tĩnh đổi nguồn link chứ không phải là một dải băng ảnh trượt.
- Giải pháp: Nâng các nút bấm lên tầng cao hơn (`z-index` lớn hơn) để không bị đè, đồng thời biến vùng hiển thị ảnh thành một dải băng trượt (Embla Carousel) để vuốt được và click chuyển ảnh mượt mà.

## 2. Elaboration & Self-Explanation
Vấn đề nằm ở component [ProductImageLightbox.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/products/detail/_components/ProductImageLightbox.tsx). 
Hiện tại:
- Cấu trúc layout đặt các nút bấm trước, container ảnh sau. Cả hai cùng có `z-[10000]`. Trên mobile, container ảnh co giãn chiếm toàn bộ chiều ngang (`w-full`), do xếp sau trong DOM nên nó đè lên và che mất các nút điều hướng.
- Lightbox chỉ render duy nhất một ảnh tại một thời điểm, khi đổi ảnh thì cập nhật `src`. Do đó không hỗ trợ hành vi vuốt (swipe/drag) quen thuộc trên thiết bị di động.

Hướng xử lý:
- Tăng `z-index` của các nút điều hướng, nút đóng và bộ đếm lên `z-[10020]`, giữ container ảnh ở `z-[10000]` để các nút luôn nằm trên cùng và nhận được sự kiện click.
- Tích hợp thư viện `embla-carousel-react` vào `ProductImageLightbox`. Biến container ảnh thành một viewport Embla Carousel và render tất cả các ảnh thành các slide để có thể vuốt qua lại.
- Đồng bộ hai chiều giữa trạng thái `currentIndex` (được truyền từ ngoài vào) và vị trí hiện tại của Embla Carousel thông qua `emblaApi.scrollTo` và sự kiện `select` của Embla.

## 3. Concrete Examples & Analogies
- **Analogy (Ví dụ tương đồng)**: Hãy tưởng tượng bạn đặt một tờ giấy có các nút bấm vẽ trên đó, sau đó đặt một tấm kính trong suốt (container ảnh lớn) đè hoàn toàn lên trên tờ giấy. Khi bạn dùng ngón tay ấn vào nút vẽ bên dưới tấm kính, ngón tay của bạn chỉ chạm vào tấm kính chứ không chạm được vào nút bấm. Chúng ta cần rút tờ giấy vẽ nút bấm đặt lên trên tấm kính (tăng z-index).
- **Carousel Analogy**: Thay vì việc mỗi lần bấm nút bạn lại phải tháo bức tranh cũ ra và lồng bức tranh mới vào khung (chỉ render 1 ảnh đổi `src`), chúng ta dán các bức tranh thành một dải băng dài và cuộn nó qua khung nhìn (Embla Carousel). Như vậy người dùng có thể dùng tay để vuốt cuộn dải băng này.

# II. Audit Summary (Tóm tắt kiểm tra)
- Tệp tin chính gây lỗi: [ProductImageLightbox.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/products/detail/_components/ProductImageLightbox.tsx).
- Layering CSS: Nút điều hướng bị container ảnh đè lên trên các màn hình có chiều ngang nhỏ (mobile).
- Carousel capabilities: Thiếu tích hợp Embla Carousel để hỗ trợ vuốt chạm.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- **Root Cause (Nguyên nhân gốc)**: 
  - Tranh chấp z-index: Cả nút bấm và container ảnh cùng có `z-[10000]`, container ảnh xếp sau trong DOM và chiếm 100% chiều rộng ở mobile, che hoàn toàn các nút.
  - Thiếu thư viện vuốt: Lightbox hiện tại chỉ là component render ảnh đơn tĩnh, không dùng Embla Carousel nên không hỗ trợ cử chỉ vuốt trên mobile.
- **Counter-Hypothesis (Giả thuyết đối chứng)**: 
  - Nếu chỉ tăng z-index của các nút bấm: Người dùng sẽ click được nút `<` và `>`, nhưng vẫn không vuốt được ảnh trên mobile. Để đáp ứng trải nghiệm di động chuẩn 2026, bắt buộc phải có cả sửa z-index và tích hợp Embla Carousel.

# IV. Proposal (Đề xuất)
1. Tích hợp `useEmblaCarousel` vào [ProductImageLightbox.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/products/detail/_components/ProductImageLightbox.tsx).
2. Tạo component con `LightboxSlide` quản lý local state `src` và fallback load ảnh lỗi độc lập cho từng slide ảnh sản phẩm.
3. Thiết lập Embla Carousel với các tùy chọn `{ loop: true, startIndex: safeIndex }`.
4. Viết các hiệu ứng `useEffect` để đồng bộ hóa chỉ số ảnh hiện tại giữa parent component và Embla Carousel:
   - Khi `safeIndex` thay đổi từ bên ngoài, gọi `emblaApi.scrollTo(safeIndex, true)`.
   - Khi người dùng vuốt hoặc Embla chuyển slide, lắng nghe sự kiện `'select'` để kích hoạt `onIndexChange(selectedIndex)`.
5. Tăng z-index của các nút điều khiển (`prev`, `next`, `close`, `counter`) lên `z-[10020]`.

# V. Files Impacted (Tệp bị ảnh hưởng)
- **Sửa**: [ProductImageLightbox.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/products/detail/_components/ProductImageLightbox.tsx)
  - Vai trò hiện tại: Hiển thị ảnh sản phẩm lớn toàn màn hình dạng dialog/lightbox.
  - Thay đổi: Chuyển đổi từ render một ảnh tĩnh sang sử dụng Embla Carousel hỗ trợ vuốt chạm, nâng z-index các nút điều khiển.

# VI. Execution Preview (Xem trước thực thi)
1. Import `useEmblaCarousel` từ `embla-carousel-react`, và `useCallback` từ `react`.
2. Tạo component con `LightboxSlide` để hiển thị và xử lý lỗi load ảnh cho từng slide ảnh riêng biệt.
3. Thay thế logic render ảnh đơn bằng cấu trúc Embla Carousel viewport (`ref={emblaRef}`) và container chứa danh sách các `LightboxSlide`.
4. Thêm logic đồng bộ hai chiều giữa `emblaApi` và `safeIndex` thông qua lắng nghe sự kiện `select` và điều hướng nút.
5. Cập nhật CSS classes của các nút điều hướng và đóng lightbox để nâng z-index lên `z-[10020]`.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Kiểm tra tại trang trải nghiệm sản phẩm: `/system/experiences/product-detail`.
- Nhấp vào ảnh chính để mở xem ảnh lớn (lightbox).
- Chuyển sang chế độ giả lập mobile (Responsive/Mobile viewport) trong DevTools.
- **Manual Verification**:
  1. Kiểm tra bấm nút `<` và `>` xem ảnh có chuyển được không.
  2. Kiểm tra vuốt (swipe) sang trái và sang phải bằng chuột/chạm xem ảnh có trượt mượt mà và chuyển ảnh không.
  3. Kiểm tra xem bộ đếm số trang ở dưới cùng (ví dụ `2 / 5`) có cập nhật đúng vị trí ảnh hiện tại hay không.
  4. Bấm nút đóng (`X`) hoặc click ra vùng nền tối bên ngoài xem lightbox có đóng đúng cách hay không.

# VIII. Todo
- [ ] Cập nhật file [ProductImageLightbox.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/products/detail/_components/ProductImageLightbox.tsx) theo thiết kế Embla Carousel và sửa z-index.
- [ ] Thực hiện static review và bàn giao kiểm thử.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Các nút điều hướng `<` và `>` bấm được trên mobile và chuyển ảnh chính xác.
- Hỗ trợ vuốt (swipe) chuyển ảnh trên mobile mượt mà.
- Trạng thái chỉ số ảnh hiện tại hiển thị đúng và đồng bộ.
- Không phát sinh lỗi biên dịch TypeScript.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Rủi ro: Thấp. Component [ProductImageLightbox.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/components/site/products/detail/_components/ProductImageLightbox.tsx) là component cô lập, chỉ dùng để mở xem ảnh fullscreen.
- Hoàn tác: Dùng `git checkout` để rollback file nếu có lỗi.

# XI. Out of Scope (Ngoài phạm vi)
- Không chỉnh sửa giao diện gallery ảnh nhỏ ở bên ngoài trang chi tiết sản phẩm.
- Không thay đổi logic tải ảnh hoặc cấu hình watermark/frame.
