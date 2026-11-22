# CHẠM 5.0 — Báo cáo triển khai và nghiệm thu
Ngày kiểm tra: 22/11/2026.

## Phạm vi
Landing Page Shopify tại store 5yvv8u-44.myshopify.com, theme duy nhất **CHẠM — Main**, ID **191052087538**. Thay đổi template/index.json, thêm 3 section cham5-story, cham5-explore, cham5-market, CSS/JS và tài nguyên riêng. Layout chỉ được cập nhật điều kiện tải tài nguyên homepage và class trên body trang chủ. Không sửa About, Story, Club, Play, giỏ hàng hay dữ liệu sản phẩm.

## Đối chiếu tham chiếu
Nghiên cứu trực tiếp https://vnconicalhat.site/ bằng Chromium ở 1440×900 và 390×844, chụp các tiến trình cuộn từ đầu đến cuối. Đối chiếu ảnh CHẠM tại 1440×900 và 390×844; các ảnh nội bộ được lưu trong .qa/reference và .qa/cham5 để tránh xuất bản tài nguyên của website mẫu lên GitHub. Nền trắng ngà, title dày khổ lớn, phác nét thủ công bất đối xứng, chương sticky có scrub, photo-transition, materials tab dạng dọc, gallery và kết nền đen là các thành phần được tái diễn giải. Không sao chép source/assets từ website tham chiếu.

## Storyboard
Chi tiết trạng thái đầu–giữa–cuối từng cảnh: `CHAM-5.0-STORYBOARD.md`. Cảnh 01 intro; 02 cover; 03 chương chất liệu–đôi tay–thành phẩm; 04 portal; 05 chuỗi ảnh chi tiết; 06 materials; 07 gallery; 08 collections; 09 products; 10 Play; 11 Explore more; 12 final CTA.

## Motion và nguồn ảnh
Chuyển động bằng native requestAnimationFrame + vị trí scroll, sticky CSS và transform nội suy. Không cướp cuộn hoặc phụ thuộc CDN JavaScript để có nội dung. Mobile 760px trở xuống dùng bố cục editorial tự nhiên, film có vuốt ngang; reduced-motion hiển thị nội dung tĩnh đầy đủ. Font Phudu (Google Fonts) fallback sang Be Vietnam Pro.

Ảnh sản phẩm trong gallery và thương mại lấy trực tiếp từ Shopify. Phác nét mực và ảnh detail được xử lý từ chính hình ảnh DEMO đã có trong store (không tạo dữ kiện về người sản xuất hoặc hoạt động xưởng thật). Không tự phát video thủ công hoặc phát âm thanh.

## Kiểm thử trình duyệt
Dùng LiquidJS fixture riêng và Chromium tại 320, 390, 428, 768, 1024, 1440, 1920px:
- PASS không tràn ngang, không header/heading bị cắt, 5 collections, 6 sản phẩm, không lỗi JS.
- PASS progress scrub cover / storybook / portal / film / gallery tại desktop, mỗi section có thuộc tính animation khác nhau theo vị trí cuộn.
- PASS điều hướng tabs chất liệu bằng click; visible panel và aria-selected được cập nhật.
- PASS không va chạm title và subtitle cảnh cuối ở 7 độ rộng.
- PASS reduced motion hiển thị toàn bộ 3 chương và bỏ loading.
- Đã chụp storyboard screenshot qua nhiều vị trí cuộn, so sánh với screenshot reference.
- Kiểm tra syntax: node --check và Shopify Theme Check.
LƯU Ý: fixture mô phỏng dữ liệu Shopify và dùng CSS/JS thực tế; không thay thế kiểm thử tất cả luồng trực tiếp trên live domain.

## Giới hạn / còn cần kiểm chứng
- Khả năng truy cập công khai của store vẫn phụ thuộc Shopify Trial/password. Chưa xác nhận thử duyệt không cần mật khẩu.
- Không có video nghề thủ công hợp pháp được cung cấp, scene 05 dùng ảnh cận cảnh thực thay thế.
- Chưa kiểm Safari iOS và điện thoại thật, chưa kết luận chính thức về Core Web Vitals nếu không đo thực tế.
- Không cập nhật đơn hàng, hồ sơ, game logic hoặc thanh toán thật.
