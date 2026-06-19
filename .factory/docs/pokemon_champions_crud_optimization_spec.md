# I. Primer

## 1. TL;DR kiểu Feynman
* Giống như việc dọn dẹp một cửa hàng tạp hóa: Thay vì bày hết tất cả các loại hàng hóa và sổ sách ra đầy trên sàn nhà khiến lối đi bị nghẽn (render toàn bộ hàng trăm Pokémon cùng một lúc), chúng ta sẽ chia chúng vào các ngăn kệ nhỏ gọn (phân trang).
* Thay vì để cái bàn làm việc cồng kềnh ngay giữa lối đi (form thêm/sửa nằm ngay đầu trang), khi cần viết hay sửa sổ sách gì, ta sẽ lôi một cuốn sổ ghi chép nhỏ xuất hiện tạm thời lên rồi cất đi (popup dialog).
* Cuối cùng, thay vì phải đi photocopy ảnh thủ công rồi dán đường dẫn chữ vào sổ (nhập URL ảnh bằng tay), ta sẽ dùng một chiếc máy quét ảnh thông minh (ImageUploader), quét một cái là ảnh tự động bay vào kho lưu trữ (thư viện Media) và dán luôn vào sổ cho ta.

## 2. Elaboration & Self-Explanation
Hiện tại giao diện quản trị Admin của Mini App **Pokémon Champions** đang có một vài hạn chế về mặt UX:
1. **Quá tải giao diện khi danh sách lớn:** Việc render trực tiếp toàn bộ danh sách Pokémon (tối đa 500 bản ghi) và Game Items (tối đa 200 bản ghi) lên màn hình gây chậm và kéo dài giao diện vô tận. Ta cần chia nhỏ danh sách này ra để hiển thị theo từng trang, tối ưu hóa tốc độ tải và trải nghiệm cuộn trang của admin.
2. **Form Thêm/Sửa chiếm diện tích:** Form chỉnh sửa Pokémon và Game Items hiện đang chiếm một phần diện tích lớn cố định ở trên đầu trang CRUD, tạo cảm giác chật chội và không chuyên nghiệp. Đưa form này vào một Dialog popup (hộp thoại nổi) khi cần thêm/sửa sẽ giúp tối ưu không gian hiển thị danh sách.
3. **Nhập ảnh thủ công phức tạp:** Admin phải tự đi tìm URL ảnh và dán vào ô text input. Việc tích hợp `ImageUploader` có sẵn của dự án sẽ cho phép kéo thả file, dán ảnh trực tiếp từ clipboard, và hỗ trợ crop xoay cắt ảnh. Khi ảnh được tải lên, nó sẽ tự động chèn vào database table `images`, giúp đồng bộ hóa với thư viện Media chung ở `/admin/media`.

## 3. Concrete Examples & Analogies
* **Ví dụ thực tế:** Khi admin muốn đổi ảnh đại diện cho Pokémon Pikachu. Thay vì đi tìm link ảnh trên mạng rồi dán vào, admin chỉ cần click nút tải ảnh, kéo thả file ảnh Pikachu vào hoặc chụp ảnh màn hình rồi bấm dán (Ctrl+V). Form edit Pikachu sẽ hiện lên trong một hộp thoại nổi giữa màn hình, sau khi lưu xong hộp thoại tự đóng lại, trả lại giao diện danh sách sạch sẽ được phân chia 12 Pokémon mỗi trang.
* **Analogy:** Giống như khi bạn đi rút tiền ở cây ATM. Cây ATM không hiển thị toàn bộ lịch sử giao dịch của bạn trên một màn hình dài dằng dặc, mà chia thành các trang (phân trang). Và khi bạn cần đổi mã PIN, một popup nhập mã PIN mới sẽ xuất hiện đè lên giao diện chính, nhập xong nó biến mất chứ không nằm chây ì ở đó.

---

# II. Audit Summary (Tóm tắt kiểm tra)
* **Tệp tin kiểm tra:** [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx)
* **Hiện trạng logic:**
  - Danh sách Pokémon và Game Items được query trực tiếp toàn bộ và render bằng `.map` mà không có phân trang.
  - Các form add/edit được hiển thị tĩnh bằng các `<Card>` chiếm phần lớn không gian ở đầu tab.
  - Trường ảnh `imageUrl` trong form là input text trơn, bắt admin tự dán URL ảnh thủ công.
  - Component `Dialog` và các UI liên quan đã có sẵn trong `app/admin/components/ui.tsx`.
  - Component `ImageUploader` đã có sẵn trong `app/admin/components/ImageUploader.tsx`.
  - Helper phân trang `generatePaginationItems` đã có sẵn trong `app/admin/components/TableUtilities.tsx`.

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
* **Nguyên nhân gốc:** Thiết kế ban đầu của mini app Pokémon Champions là một trang CRUD cơ bản (MVP - Minimum Viable Product) để kiểm chứng luồng hoạt động, do đó chưa được tối ưu hóa giao diện (đưa form vào popup) và chưa áp dụng các pattern chung của hệ thống (phân trang, upload ảnh qua thư viện media).
* **Giả thuyết đối chứng:** Nếu tích hợp `ImageUploader` có folder lưu trữ cụ thể (`pokemon-champions/pokemon` và `pokemon-champions/game-items`), các file ảnh tải lên sẽ tự động tạo bản ghi trong bảng `images` (thư viện Media) thông qua mutation `saveImage` của Convex. Việc sử dụng state phân trang cục bộ và Dialog của Radix/Tailwind trong file UI hiện tại sẽ cải thiện triệt để UX mà không làm ảnh hưởng đến các cấu trúc dữ liệu Convex hiện có.

---

# IV. Proposal (Đề xuất)
1. **Phân trang cục bộ (Client-side Pagination) cho admin tab:**
   - Áp dụng phân trang cho cả 4 danh sách trong Admin CRUD: Pokémon, Game Items, Orders, Customers.
   - Thêm ô tìm kiếm (Search Input) nhỏ gọn cho từng tab để lọc nhanh dữ liệu trước khi phân trang.
   - Sử dụng `generatePaginationItems` để hiển thị thanh điều khiển phân trang chuyên nghiệp tương thích với dark/light mode.
   - Số lượng bản ghi mỗi trang: Pokémon (12 items/trang), Game Items (12 items/trang), Orders (10 items/trang), Customers (12 items/trang).
2. **Đưa Form Add/Edit vào Dialog popup:**
   - Dùng `<Dialog>` và `<DialogContent>` từ `@/app/admin/components/ui` để bao bọc các form thêm và sửa.
   - Thêm nút "Thêm Pokémon mới" và "Thêm Game Item mới" ở phần header của mỗi tab để mở dialog.
   - Khi click nút "Edit" trên mỗi item card, mở dialog với dữ liệu của item đó được điền sẵn vào form.
   - Bọc nội dung form trong `ScrollArea` hoặc container có `max-h-[80vh] overflow-y-auto` để đảm bảo giao diện hiển thị tốt trên mọi kích thước màn hình.
3. **Tích hợp ImageUploader cho ảnh:**
   - Thay thế thẻ `<Input>` của Image URL bằng component `ImageUploader`.
   - Cấu hình folder lưu trữ tương ứng trong thư viện Media: `pokemon-champions/pokemon` cho Pokémon và `pokemon-champions/game-items` cho các vật phẩm.

---

# V. Files Impacted (Tệp bị ảnh hưởng)
* **Sửa:** [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx)
  - Vai trò hiện tại: Module chính hiển thị giao diện Public và Admin cho mini app Pokémon Champions.
  - Thay đổi: Import `ImageUploader`, `Dialog` và các UI liên quan, `generatePaginationItems`. Tách form add/edit thành Dialog, thêm state pagination, search, và update logic UI trong `PokemonCrud` và `GameItemCrud` cùng các panel khác.

---

# VI. Execution Preview (Xem trước thực thi)
1. **Đọc và chuẩn bị:** Xem lại các import và kiểu dữ liệu trong `PokemonChampionsMiniApp.tsx`.
2. **Cập nhật import:** Thêm các component `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `ImageUploader` và helper `generatePaginationItems`.
3. **Refactor PokemonCrud:**
   - Thêm các state: `isDialogOpen` (mở dialog), `searchTerm` (tìm kiếm), `currentPage` (trang hiện tại).
   - Tách form chỉnh sửa ra khỏi luồng render chính và đưa vào `Dialog`.
   - Cập nhật input ảnh thành `ImageUploader`.
   - Viết logic lọc Pokémon và phân trang, thêm UI phân trang ở chân trang.
4. **Refactor GameItemCrud:**
   - Thực hiện các bước tương tự như với `PokemonCrud`.
5. **Refactor OrdersPanel & CustomersPanel:**
   - Thêm state `searchTerm` and `currentPage`.
   - Viết logic lọc và phân trang cùng UI điều khiển.
6. **Kiểm tra biên dịch:** Xác nhận không có lỗi TypeScript hay build runtime.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)
1. **Kiểm tra biên dịch TypeScript (Typecheck):**
   - Chạy lệnh `bunx tsc --noEmit` để đảm bảo dự án compile thành công.
2. **Kiểm tra thủ công (Manual Verification):**
   - Mở màn hình quản trị Pokémon Champions trong trình duyệt.
   - Chuyển giữa các tab Dữ liệu CRUD.
   - Thử tính năng tìm kiếm và click chuyển trang phân trang ở chân danh sách Pokémon, Game items, Orders, Customers.
   - Thử click "Thêm Pokémon" và "Edit", đảm bảo Dialog popup xuất hiện chính xác, form hiển thị đầy đủ và có thanh cuộn nếu màn hình nhỏ.
   - Thử upload ảnh Pokémon bằng cách kéo thả hoặc dán từ clipboard, crop ảnh và lưu lại.
   - Vào địa chỉ `http://localhost:3000/admin/media` để xác nhận các ảnh vừa tải lên đã xuất hiện trong thư viện Media và có folder tương ứng.

---

# VIII. Todo
- [ ] Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` vào [PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx).
- [ ] Import `ImageUploader` và `generatePaginationItems`.
- [ ] Chỉnh sửa component `PokemonCrud`:
  - [ ] Thêm state tìm kiếm, phân trang và đóng/mở Dialog.
  - [ ] Di chuyển Form thêm/sửa vào `Dialog` popup.
  - [ ] Thay thế input text ảnh bằng `<ImageUploader>`.
  - [ ] Thực hiện phân trang và tìm kiếm cho danh sách Pokémon card.
- [ ] Chỉnh sửa component `GameItemCrud`:
  - [ ] Thêm state tìm kiếm, phân trang và đóng/mở Dialog.
  - [ ] Di chuyển Form thêm/sửa vào `Dialog` popup.
  - [ ] Thay thế input text ảnh bằng `<ImageUploader>`.
  - [ ] Thực hiện phân trang và tìm kiếm cho danh sách Game Item card.
- [ ] Bổ sung phân trang và tìm kiếm cho `OrdersPanel` và `CustomersPanel`.
- [ ] Thực hiện Typecheck và chạy lệnh Speak để báo hoàn thành.

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
* **Phân trang hoạt động chính xác:** Mỗi trang hiển thị đúng số lượng items quy định. Thanh pagination hiển thị đúng số trang, hỗ trợ click chuyển trang và reset về trang 1 khi thay đổi từ khóa tìm kiếm.
* **Dialog hoạt động mượt mà:** Form Add/Edit hiển thị dạng Dialog nổi trên màn hình, có nút đóng và tự động đóng sau khi lưu thành công.
* **Upload ảnh trực quan:** Admin có thể upload ảnh thông qua giao diện kéo thả, dán clipboard hoặc link URL. Ảnh lưu thành công vào bảng `images` (media library) và hiển thị chính xác trên card.
* **Đồng bộ Media Library:** Các ảnh upload riêng lẻ từ admin Pokémon Champions hiển thị đầy đủ trong trang quản lý Media chung của hệ thống `/admin/media`.
* **Không có lỗi Compile:** Dự án biên dịch thành công mà không có lỗi TypeScript hay linter.

---

# X. Risk / Rollback (Rủi ro / Hoàn tác)
* **Rủi ro:** Một số ảnh cũ trong database có định dạng URL bên ngoài (không qua Convex storage) có thể không hiển thị được nút Crop/Edit của `ImageUploader`. Đây là hành vi bình thường và `ImageUploader` đã tự động xử lý fallback bằng cách hiển thị ô nhập URL trực tiếp cho các ảnh này.
* **Rollback:** Nếu gặp lỗi nghiêm trọng, sử dụng `git checkout -- features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx` để khôi phục trạng thái code ban đầu.

---

# XI. Out of Scope (Ngoài phạm vi)
* Thay đổi cấu trúc schema trong database Convex (bảng `pokemonChampionsPokemon` và `pokemonChampionsGameItems`).
* Refactor giao diện Public của Pokémon Champions (ngoài việc hiển thị ảnh mới).

---

# XII. Open Questions (Câu hỏi mở)
* Không có câu hỏi nào thêm. Mọi yêu cầu đã rõ ràng và các component UI hỗ trợ đều có sẵn trong dự án.
