# I. Primer

## 1. TL;DR kiểu Feynman
*   **Vấn đề:** Chúng ta cần cập nhật dữ liệu của Pokémon Champions từ trang web `pokemon-zone.com`. Nhưng Cloudflare chặn đứng tất cả request cào dữ liệu từ server (403 Forbidden). Đồng thời, UI form add/edit Pokémon hiện tại đang dùng các ô nhập text thủ công cho Hệ (Type) và Item rất dễ sai và nhìn đơn giản.
*   **Giải pháp:** 
    1.  **Cơ chế cào dữ liệu (Client-assisted Scraper):** Thay vì tự động fetch từ backend bị chặn, ta tạo một UI cho phép Admin dán trực tiếp mã nguồn HTML (Ctrl+U) của trang Pokémon Zone vào. Code JS phía trình duyệt sẽ tự động parse (bóc tách) hàng trăm Pokémon, Game Items, Tier List, Teams và Types cực nhanh qua `DOMParser`, rồi đồng bộ lên database Convex.
    2.  **Đẩy nút Seed lên đầu:** Đưa nút reset/seed lên vị trí trung tâm trong Admin Dashboard để dễ sử dụng.
    3.  **UI Dropdown thông minh:** Thay thế text input bằng Dropdown có kèm icon/emoji tương ứng cho Hệ (ví dụ: 🔥 Fire, 💧 Water) và hiển thị ảnh icon thật cho các Game Items khi chọn.
    4.  **Quan hệ dữ liệu:** Các items chọn cho Pokémon sẽ tự động liên kết tới bảng `pokemonChampionsGameItems` thực tế.

## 2. Elaboration & Self-Explanation
Trang web `pokemon-zone.com` sử dụng Cloudflare Challenge để chống crawler/bot. Khi Convex Server hoặc công cụ Node.js gọi request, Cloudflare phát hiện IP từ datacenter và thiếu browser fingerprint chuẩn nên trả về 403. 

Để giải quyết triệt để vấn đề này mà không tốn chi phí thuê proxy bypass Cloudflare, chúng ta sử dụng cơ chế **Cào có trợ giúp từ Client (Client-assisted Scraping)**. Admin mở trang web Pokémon Zone trên trình duyệt (nơi đã vượt qua Cloudflare challenge thành công), nhấn `Ctrl+U` để xem source hoặc copy HTML container chính, dán vào Admin Dashboard của chúng ta. Code JS ở Client chạy rất nhanh, phân tích cấu trúc DOM để lấy ra dữ liệu sạch (JSON), sau đó Convex ghi nhận mảng JSON sạch này vào DB.

Ngoài ra, đối với Pokémon và Game Items, thay vì gõ text thô (chữ viết hoa viết thường dễ lệch và không có liên kết dữ liệu), ta thiết kế:
*   Mảng Hệ (Types) chuẩn của Pokémon với Emoji + Màu sắc cố định.
*   Dropdown chọn Item sẽ lấy động danh sách từ bảng `pokemonChampionsGameItems` đang có trong DB, hiển thị ảnh Thumbnail nhỏ bên cạnh tên item để trực quan hóa.

## 3. Concrete Examples & Analogies
*   **Analogy:** Giống như một tòa nhà có bảo vệ nghiêm ngặt (Cloudflare) cấm người lạ vào lấy tài liệu. Nhưng khách hàng (Admin) của chúng ta có thẻ ra vào hợp pháp. Họ vào chụp ảnh tài liệu mang ra, đưa cho chúng ta (dán HTML source), và chúng ta dùng máy scan (code parser) để tự động dịch thông tin và lưu vào kho lưu trữ (database).
*   **Concrete Example:** Admin copy mã nguồn HTML trang `https://www.pokemon-zone.com/champions/items/` dán vào ô "Import Game Items". Code sẽ tìm các thẻ `<a href="/champions/items/ability-capsule/">` và ảnh bên trong nó, trích xuất ra item:
    `{ name: "Ability Capsule", slug: "ability-capsule", imageUrl: "...", rarity: "rare" }`. Convex patch/insert item này vào DB. Khi edit Pokémon, dropdown "Best Item" sẽ hiển thị item "Ability Capsule" kèm ảnh nhỏ để admin click chọn.

---

# II. Audit Summary (Tóm tắt kiểm tra)

*   **Hiện trạng:**
    *   Bảng `pokemonChampionsGameItems` có trường `imageUrl`, `icon`, `name`, `slug`, `rarity`.
    *   Bảng `pokemonChampionsPokemon` có trường `primaryType` (string), `secondaryType` (string), `bestItemId` (id của Game Item).
    *   Nút "Reset 315 mặc định" nằm ở dưới cùng trong component `PokemonCrud` và chỉ reset Pokémon dựa trên file hardcoded `pokemonChampionsDefaults.ts`.
    *   Form add/edit Pokémon sử dụng text input cho Type và select thô không có icon cho Item.
*   **Kiểm tra tính khả thi của Scraper:** 
    *   Thử fetch trực tiếp `https://www.pokemon-zone.com` từ node/backend bị trả về status `403 Forbidden` do Cloudflare Turnstile bảo vệ.
    *   Parse client-side thông qua `DOMParser` trên HTML source dán vào là giải pháp tốt nhất, an toàn và ổn định 100%.

---

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

*   **Triệu chứng:** Fetch direct bằng HTTP code bị Cloudflare chặn (403).
*   **Nguyên nhân gốc:** Cloudflare Challenge phát hiện request không xuất phát từ trình duyệt thật (IP datacenter của server Convex hoặc tool node).
*   **Giả thuyết đối chứng:** 
    *   *Giả thuyết 1: Dùng proxy bypass Cloudflare.* Tốn phí, không ổn định vì Cloudflare nâng cấp thuật toán liên tục.
    *   *Giả thuyết 2 (Được chọn): Client-assisted.* Admin dán HTML source, client parse. Đạt độ tin cậy 100%, code đơn giản, không phát sinh chi phí hay rủi ro bảo mật.

---

# IV. Proposal (Đề xuất)

### 1. Phía Backend (Convex - `convex/pokemonChampions.ts`):
*   Tạo các mutation mới:
    *   `syncScrapedGameItems`: Nhận mảng Game Items đã parse ở client và lưu vào DB (upsert theo slug).
    *   `syncScrapedPokemon`: Nhận mảng Pokémon đã parse ở client và lưu vào DB (upsert theo slug/dexNumber).
    *   `syncScrapedTiers`: Nhận mảng `{ pokemonSlug, tier }` để update traits của Pokémon (thêm ví dụ: `"Tier S"`).
    *   `syncScrapedTeams`: Nhận mảng mapping Pokémon và Item để tự động đặt `bestItemId` hợp lý cho Pokémon.
*   Cập nhật `ensureDefaults`: Hỗ trợ seeding cả mặc định mới nếu database rỗng.

### 2. Phía Frontend (`features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx`):
*   **Tách Parser:** Viết helper parser trong code client để bóc tách HTML của 5 loại trang web thành JSON sạch.
*   **Seed & Sync Dialog:** Đẩy nút "Reset 315 mặc định" lên vị trí thanh công cụ chính của Admin Dashboard (trên cùng), đổi tên thành **"🌱 Seed / Sync Pokémon Zone"**. Khi click, hiện Dialog cho phép:
    1.  Bấm nút Seed Mặc định (như cũ).
    2.  Chọn tab "Cào từ Pokémon Zone": Cung cấp liên kết để admin click mở trang web, hướng dẫn nhấn Ctrl+U copy source và dán vào Textarea, chọn loại dữ liệu, bấm "Bắt đầu Đồng bộ".
*   **UI Dropdown Hệ (Types):**
    *   Tạo object `TYPE_DETAILS` lưu emoji và màu sắc cho 18 hệ Pokémon.
    *   Trong form Pokémon, đổi Primary Type và Secondary Type từ Input Text thành Dropdown `<select>` hiển thị emoji và tên hệ (ví dụ: `🔥 Fire`).
*   **UI Dropdown Game Items:**
    *   Viết custom component `ItemSelect` thay thế select thô của Best Item, hiển thị ảnh Thumbnail nhỏ của item bên cạnh tên.

---

# V. Files Impacted (Tệp bị ảnh hưởng)

### 1. Convex Backend
*   **Sửa:** [convex/pokemonChampions.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/convex/pokemonChampions.ts)
    *   Thêm các mutations `syncScrapedGameItems`, `syncScrapedPokemon`, `syncScrapedTiers`, `syncScrapedTeams` để tiếp nhận và cập nhật dữ liệu hàng loạt từ client.

### 2. Admin Frontend
*   **Thêm:** [features/mini-apps/pokemon-champions/scraper.ts](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/scraper.ts)
    *   Chứa code parser DOM trích xuất thông tin Pokémon, Game Items, Tiers, Teams từ HTML source dán vào.
*   **Sửa:** [features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx](file:///e:/NextJS/study/admin-ui-aistudio/system-vietadmin-nextjs/features/mini-apps/pokemon-champions/PokemonChampionsMiniApp.tsx)
    *   Đưa nút Seed/Sync lên trên cùng.
    *   Tích hợp Sync Dialog với tính năng cào HTML source.
    *   Thay thế Input Type bằng Dropdown có emoji.
    *   Thay thế Best Item select bằng Custom ItemSelect có icon ảnh.

---

# VI. Execution Preview (Xem trước thực thi)

1.  **Tạo file scraper.ts:** Viết các hàm parse HTML sử dụng `DOMParser` để bóc tách 4 loại trang dữ liệu.
2.  **Cập nhật `convex/pokemonChampions.ts`:** Thêm các mutation nhận mảng JSON và thực hiện upsert (sử dụng query check trùng theo slug, patch nếu có, insert nếu chưa).
3.  **Cải tiến UI form trong `PokemonChampionsMiniApp.tsx`:** 
    *   Khai báo `TYPE_DETAILS` và chỉnh sửa dialog form Pokémon.
    *   Viết component `ItemSelect` nội bộ và tích hợp vào form.
4.  **Tạo Dialog Seed & Scrape:** Thiết kế modal với giao diện đẹp mắt, hướng dẫn rõ ràng từng bước cho Admin.
5.  **Review tĩnh và kiểm thử typecheck:** Chạy build/compile rà soát lỗi TypeScript.

---

# VII. Verification Plan (Kế hoạch kiểm chứng)

### 1. Kiểm tra Client-side Scraper:
*   Chạy code parser thử nghiệm trên một số đoạn HTML mẫu của Pokémon Zone để đảm bảo lấy đúng tên, slug, imageUrl, và các thuộc tính khác.
*   Xác minh các mutation ghi dữ liệu Convex hoạt động chuẩn, không bị lỗi overload hay N+1.

### 2. Kiểm tra UI Form:
*   Mở dialog Add/Edit Pokémon, click dropdown Type xem có hiển thị emoji đầy đủ.
*   Click dropdown Best Item xem có hiển thị thumbnail ảnh của item.
*   Chọn thử một item, lưu Pokémon lại và kiểm tra xem database có ghi nhận đúng `bestItemId` liên kết.

---

# VIII. Todo

- [ ] Tạo file `features/mini-apps/pokemon-champions/scraper.ts` chứa logic parse DOM.
- [ ] Thêm các mutations sync scraped data trong `convex/pokemonChampions.ts`.
- [ ] Cập nhật UI Dropdown Type (Primary & Secondary) trong form Pokémon của `PokemonChampionsMiniApp.tsx`.
- [ ] Cập nhật UI Dropdown Best Item bằng component `ItemSelect` tự viết trong `PokemonChampionsMiniApp.tsx`.
- [ ] Đẩy nút Seed defaults lên đầu trang Admin dashboard của mini app.
- [ ] Tích hợp Dialog Sync & Scraper hướng dẫn dán HTML source vào.
- [ ] Kiểm tra TypeScript compile toàn dự án.

---

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

1.  **Dữ liệu items mặc định** được cào từ Pokémon Zone thành công và thay thế các items cũ.
2.  **Nút "Seed / Sync Defaults"** được đưa lên đầu trang Admin Dashboard.
3.  **Tính năng dán HTML source** hoạt động trơn tru: parse đúng danh sách items/pokemons từ code HTML dán vào và lưu thành công lên DB.
4.  **UI Form Pokémon** hiển thị dropdown Hệ kèm emoji (ví dụ: 🔥 Fire) và dropdown Best Item hiển thị ảnh nhỏ của item thật.
5.  Không có lỗi typecheck hay runtime khi thao tác CRUD.

---

# X. Risk / Rollback (Rủi ro / Hoàn tác)

*   **Rủi ro:** Cấu trúc HTML của trang Pokémon Zone thay đổi làm parser hoạt động không chính xác.
*   **Giải quyết:** Code parser viết dạng mềm dẻo (fallback sang slug-to-name và bắt lỗi try-catch). Nếu cào lỗi, hệ thống vẫn cho phép Admin thêm/chỉnh sửa thủ công từng item và Pokémon bình thường qua UI CRUD có sẵn.
*   **Rollback:** Dùng Git để discard thay đổi nếu gặp lỗi nghiêm trọng.

---

# XI. Out of Scope (Ngoài phạm vi)

*   Không thêm bảng cơ sở dữ liệu mới cho Teams hay Tier List để tuân thủ rule tối giản và tránh làm phình schema không cần thiết. Thông tin Tier/Team sẽ được lưu trực tiếp vào trường `traits`/`notes` của Pokémon và mapping `bestItemId`.

---

# XII. Open Questions (Câu hỏi mở)
*   *Không có câu hỏi nào cần user làm rõ thêm vì giải pháp dán HTML source đã giải quyết triệt để rào cản Cloudflare và CORS một cách đơn giản nhất.*
