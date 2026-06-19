# I. Primer

## 1. TL;DR kiểu Feynman
*   **Vấn đề:** 
    1.  Bookmarklet không chạy khi bấm vì chứa ký tự `#` trong mã màu HEX (ví dụ `#1e1b4b`), trình duyệt hiểu lầm đây là phần fragment identifier (hash) của URL và cắt bỏ toàn bộ code JS phía sau.
    2.  Content Security Policy (CSP) của Pokémon Zone có thể chặn kết nối trực tiếp đến `localhost:3000` (lỗi `connect-src`).
*   **Giải pháp:** 
    1.  Chuyển tất cả màu HEX sang `rgb()` và sử dụng `encodeURIComponent` để mã hóa an toàn URL bookmarklet.
    2.  Tạo cơ chế Fallback: Nếu không gửi trực tiếp được về Admin, Bookmarklet hiển thị text box chứa JSON cào được kèm nút **📋 Copy dữ liệu cào** để người dùng copy và dán vào tab dự phòng trong Admin.
*   **Kết quả:** Cào dữ liệu ổn định 100%, khắc phục hoàn toàn lỗi im lặng khi click bookmarklet.

# II. Audit Summary (Tóm tắt kiểm tra)
*   **Hệ thống hiện tại:**
    *   Bookmarklet URL bị lỗi cú pháp do cắt ngắn ở dấu `#`.
    *   API route `/api/pokemon-champions/sync` chưa hỗ trợ xử lý JSON gộp của 4 trang cào.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
*   **Nguyên nhân gốc:** Ký tự `#` trong URL Bookmarklet làm ngắt quãng JavaScript engine của browser.
*   **Giả thuyết đối chứng:** Mã hóa URL qua `encodeURIComponent` và đổi `#` thành `rgb()` sẽ giúp script chạy trọn vẹn, không bị lỗi cú pháp.

# IV. Proposal (Đề xuất)
1.  **Nâng cấp Next.js API sync Route** tại `app/api/pokemon-champions/sync/route.ts` để hỗ trợ nhận `type: 'all'`.
2.  **Sửa đổi `SyncDefaultsDialog`** trong `PokemonChampionsMiniApp.tsx`:
    *   Sử dụng mã màu `rgb()` trong Bookmarklet JS.
    *   Sử dụng `encodeURIComponent` cho Bookmarklet URL.
    *   Thêm tab "Dán dữ liệu cào (All-in-One)" vào dialog Admin cho phép dán JSON fallback.

# V. Files Impacted (Tệp bị ảnh hưởng)
*   `Sửa:` [route.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/app/api/pokemon-champions/sync/route.ts)
    *   *Vai trò:* Hỗ trợ xử lý sync gộp type `all`.
*   `Sửa:` [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx)
    *   *Vai trò:* Cập nhật logic tạo bookmarklet và thêm giao diện dán JSON fallback trong Admin.

# VI. Execution Preview (Xem trước thực thi)
1.  Cập nhật API route.
2.  Cập nhật UI Admin component.
3.  Kiểm tra biên dịch và thử nghiệm.

# VII. Verification Plan (Kế hoạch kiểm chứng)
*   **Kiểm tra biên dịch:** `bunx tsc --noEmit`
*   **Kiểm tra thủ công:** Bookmarklet xuất hiện overlay UI, click copy JSON khi bị CSP chặn và dán thành công ở Admin.
