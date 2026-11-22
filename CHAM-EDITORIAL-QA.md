# CHẠM — Landing Page editorial refresh (23/11/2026)

## Phạm vi
Store: 5yvv8u-44.myshopify.com. Theme duy nhất **CHẠM — Main**, ID **191052087538**.
Chỉ cập nhật `sections/cham5-story.liquid`, `sections/cham5-explore.liquid`, `sections/cham5-market.liquid`, `assets/cham5-home.css`, `assets/cham5-home.js`, tài nguyên ảnh tư liệu và `layout/theme.liquid` để nạp JS/CSS theo trang chủ. Không sửa trang About, Câu chuyện, CHẠM Club, CHẠM Play, sản phẩm, đơn hàng hay thanh toán.

## Khác biệt so với 5.0 và bản Codex 6.0 bị bác bỏ
- Bỏ hoàn toàn banner CHẠM Play có khủng long khỏi trang chủ; trò chơi và link ở header vẫn giữ nguyên.
- Hero mới nói rõ CHẠM là nơi khám phá và mua sắm sản phẩm thủ công Việt Nam ngay màn đầu, chỉ có 1 ảnh tư liệu nghệ nhân trọng tâm, không collage chồng lớp.
- Bỏ 3 cảnh sticky kiểu ảnh/clip-path cũ và 1 phần dải film dịch cố định 420px. Thay bằng một chương pinned horizontal scroll gồm 6 công đoạn làm gốm, đi từ trái sang phải theo wheel / scroll progress, đo đường chạy qua `track.scrollWidth - viewport.clientWidth`.
- Diễn giải các bước từ ảnh tư liệu nghề thực tế, ghi công và giấy phép; tuyệt đối không nhận là xưởng/đơn hàng của CHẠM.
- Rút về 7 section có mục đích: Hero, quan điểm thương hiệu, quy trình gốm, chất liệu trong đời sống, catalog theo 5 bộ sưu tập, 6 sản phẩm và chương kết.
- Bỏ các khối màu rực / lớp phủ hình / gradient decoration; spacing được chủ đích, ảnh không bị filter.
- GSAP, ScrollTrigger và Lenis được host tại assets và **chỉ nạp trang chủ**. Thư viện không làm hỏng HTML khi JavaScript bị tắt; trên mobile, tablet hoặc reduced-motion dùng bố cục dọc tĩnh.
- Các ảnh dưới fold `loading=lazy`, `srcset`, kích thước tường minh; ảnh hero ưu tiên eager.

## Tài nguyên & quyền
Xem `CHAM-ASSET-MANIFEST.md` về nguồn ảnh tư liệu từ Wikimedia Commons và Pexels, đường link, giấy phép và tác giả; danh sách được giữ lại từ lần audit media trước, **không khôi phục layout Codex 6.0**. Bộ font Phudu dạng WOFF2 được host nội bộ theo `PHUDU-OFL.txt`. GSAP/ScrollTrigger 3.15.0 thuộc điều khoản GreenSock Standard No Charge; Lenis 1.3.27 theo giấy phép MIT. Không sao chép tài nguyên hay mã từ website Nón Lá.

## Kiểm thử thực tế
- LiquidJS render fixture bằng theme CSS/JS hiện hành, Chromium: 320, 390, 428, 768, 1024, 1440 và 1920px: **PASS** không tràn ngang, heading không cắt, đủ 5 danh mục và 6 sản phẩm, không có lỗi JavaScript.
- Desktop: pin ScrollTrigger khởi tạo tại >=1024px; đo các mốc 1%, 25%, 50%, 75%, 99%: **PASS** transform dịch ngang, nội dung theo tiến trình, nằm dưới header.
- Mobile & tablet: không ghim và không làm dải cuộn ngang khó thao tác; 6 công đoạn hiển thị theo thứ tự dọc. Reduced motion: đọc được 6 công đoạn, không pin.
- **PASS** khối quảng bá CHẠM Play trong ảnh người dùng gửi không còn ở trang chủ.
- **PASS** core tests: 17 cases ví điểm/đơn demo/yêu thích, 400 câu hỏi, Play/Club/Checkout fixture.
- Shopify Theme Check: không có lỗi chặn, còn 36 cảnh báo sẵn có của theme.
- Ảnh chụp QA local: `.qa/cham5/revised-hero-390.jpg`, `.qa/cham5/revised-hero-1440.jpg`, `.qa/cham5/revised-process-*-1440.jpg`, `.qa/cham5/cham5-categories-*.jpg`, `.qa/cham5/cham5-end-*.jpg`.

## Chưa kiểm chứng
- Shopify Trial/password có thể vẫn chặn truy cập khách chưa được cấp mật khẩu.
- Chưa đo hiệu năng Core Web Vitals trên hệ thống storefront public, chưa có iOS Safari hoặc điện thoại vật lý.
- Các screenshot fixture không thay thế nghiệm thu trên storefront live sau publish.
