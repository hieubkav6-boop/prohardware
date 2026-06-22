# I. Primer

## 1. TL;DR kiểu Feynman
- Người dùng muốn có nút để tải nhanh hình ảnh hoặc file từ thư viện Media mà không cần phải copy link hay mở tab mới.
- Chúng ta sẽ thêm một nút "Tải xuống" mới (sử dụng icon `Download` của thư viện `lucide-react`) vào phần hành động của mỗi tệp tin.
- Khi click nút này, code sẽ tự động fetch file dưới dạng Blob và kích hoạt trình duyệt lưu file đó xuống máy tính của người dùng với tên tệp tin tương ứng.
- Nút này sẽ xuất hiện trên cả hai giao diện xem: dạng Lưới (Grid) và dạng Danh sách (List).

## 2. Elaboration & Self-Explanation
- Hiện tại, trang quản trị Media có 5 hành động cơ bản cho mỗi tệp: Xem/Mở tab mới (Eye), Chỉnh sửa (Scissors/Bút), Copy link (Copy), Sửa thông tin (Edit), Xóa (Trash). Việc tải file về máy khá phiền phức vì admin phải click Copy URL rồi dán vào trình duyệt, hoặc click mở tab mới rồi chuột phải chọn "Save image as...".
- Để tối ưu hóa trải nghiệm người dùng, một nút tải xuống trực tiếp sẽ giúp họ lưu file về máy chỉ bằng 1-click.
- Giải pháp kỹ thuật:
  - Khai báo thêm hàm `handleDownload` trong Component `MediaContent`. Hàm này nhận tham số `url` và `filename`.
  - Hàm sử dụng `fetch(url)` để tải file về dạng `Blob`, sau đó tạo URL tạm bằng `URL.createObjectURL(blob)`.
  - Tạo thẻ `<a>` ẩn với thuộc tính `download={filename}`, gán `href` là URL tạm và kích hoạt sự kiện `.click()` để trình duyệt tải file xuống.
  - Sau đó giải phóng bộ nhớ bằng `URL.revokeObjectURL`.
  - Hỗ trợ fallback: nếu quá trình fetch lỗi (ví dụ do vấn đề CORS hoặc mạng), chương trình sẽ dùng giải pháp fallback là mở trực tiếp file đó trong một tab mới của trình duyệt (`window.open(url, '_blank')`).

## 3. Concrete Examples & Analogies
- Giống như việc tải ảnh trên Facebook hoặc Google Drive: thay vì phải click vào ảnh, click chuột phải rồi chọn "Lưu hình ảnh thành...", bạn chỉ cần bấm nút biểu tượng tải xuống (mũi tên chỉ xuống) để ảnh tự động lưu vào thư mục Tải xuống (Downloads) của máy tính.

# II. Audit Summary (Tóm tắt kiểm tra)
- Tập tin bị ảnh hưởng: [page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/media/page.tsx)
- State hiện tại: Chỉ có 5 nút hành động, chưa có nút tải file trực tiếp. Icon `Download` chưa được import từ `lucide-react`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- Đây là một yêu cầu tính năng mới (Feature Request) nhằm nâng cao trải nghiệm quản trị chứ không phải lỗi hệ thống.

# IV. Proposal (Đề xuất)
- **Bước 1**: Import icon `Download` từ thư viện `lucide-react` trong file `app/admin/media/page.tsx`.
- **Bước 2**: Định nghĩa hàm `handleDownload` để xử lý tải file qua Fetch Blob API với cơ chế tự động giải phóng URL object và fallback an toàn.
- **Bước 3**: Thêm nút tải xuống vào phần Hover Actions của giao diện Lưới (Grid View).
- **Bước 4**: Thêm nút tải xuống vào phần Actions của giao diện Danh sách (List View).

# V. Files Impacted (Tệp bị ảnh hưởng)
- `Sửa`: [app/admin/media/page.tsx](file:///e:/NextJS/job/job_from_system_vietadmin/prohardware/app/admin/media/page.tsx)
  - Thêm import `Download`.
  - Bổ sung hàm `handleDownload`.
  - Thêm nút download vào render Grid View và List View.

# VI. Execution Preview (Xem trước thực thi)
1. Chèn `Download` vào danh sách import từ `lucide-react` ở đầu file.
2. Viết logic hàm `handleDownload` bên trong component `MediaContent` (ở vị trí thích hợp, ví dụ dưới hàm `handleCopyUrl`).
3. Chèn JSX của nút tải xuống ở cả Grid View và List View.
4. Kiểm tra xem code có chạy trơn tru không.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Do chúng ta không chạy build/lint tự động bên ngoài git hook, chúng ta sẽ tự review tĩnh cẩn thận về kiểu dữ liệu (TypeScript).
- Đảm bảo pre-commit hook vượt qua bình thường khi tiến hành commit.

# VIII. Todo
- [ ] Import `Download` từ `lucide-react`
- [ ] Định nghĩa hàm `handleDownload` trong `MediaContent`
- [ ] Thêm nút `Download` vào giao diện Grid
- [ ] Thêm nút `Download` vào giao diện List
- [ ] Commit thay đổi

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Xuất hiện biểu tượng tải xuống (Download icon) bên cạnh các nút hành động hiện có trên cả giao diện Grid và List trong trang admin media.
- Khi nhấp vào nút tải xuống:
  - Đối với ảnh, ảnh sẽ được tự động tải về máy tính và giữ đúng tên gốc của ảnh.
  - Không gặp lỗi TypeScript khi biên dịch.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Rủi ro thấp vì đây chỉ là UI component thuần túy ở phía Client và không canทีệp vào database Convex hay backend API.
- Hoàn tác dễ dàng bằng lệnh `git checkout -- app/admin/media/page.tsx` hoặc revert commit.
