# CHẠM 4.0 — UI, Dino Quest và kiểm thử

## Phạm vi xác minh
- Theme chính Shopify: CHẠM — Main, ID 191052087538, store 5yvv8u-44.myshopify.com.
- Local: F:\CHAM, GitHub coffee2307/CHAM, nhánh main.
- Các thay đổi không tác động PHAM hoặc Oxyz Edu.

## Vấn đề được giải quyết
1. Tương phản: bảo vệ màu chữ trên nút nền tối/nền sáng bằng quy tắc cụ thể trên CHẠM Club, CTA chính và CHẠM Play; đo màu hiển thị qua Chromium fixture.
2. Hồ sơ: camera icon luôn hiện bên dưới ảnh đại diện, mở bộ chọn SVG 169 mẫu, lưu phiên trình duyệt.
3. Danh mục: đổi class tránh CSS cũ; bỏ blend/filter/tint, bỏ lớp phủ toàn trang, giữ ảnh nguồn.
4. CHẠM Play: runner khủng long, nhảy tránh gốc cây, nhặt bình gốm sẽ mở câu hỏi ngay; thành công 5 câu nhận 20 điểm một lần mỗi ngày. Màn chơi chiếm 100% vùng dưới header; ẩn footer và thanh điều hướng mobile.
5. Câu chuyện CHẠM: layout biên tập, sản phẩm ảnh thật từ catalog, các đoạn thông tin cô đọng và CTA dẫn về mua sắm/trò chơi.

## Tài sản & provenance
- Free Dino Sprites của pzUH / GameArt2D, từ OpenGameArt https://opengameart.org/content/free-dino-sprites , giấy phép CC0 1.0, dùng ảnh chạy/nhảy/đứng riêng.
- Tự vẽ vector background làng quê, bình gốm và gốc cây riêng cho CHẠM dưới dạng SVG.
- Bộ avatar 169 tệp lấy từ source Oxyz Edu; không sửa Oxyz. Metadata Open Peeps ghi CC0; tệp avatar mặc định là biểu tượng khác lấy từ Oxyz.
- Không dùng nguồn ảnh/game có bản quyền không rõ giấy phép.

## Phương pháp kiểm thử
- Browser fixture: Chromium 320, 390, 768, 1440px kiểm ảnh danh mục (không đè text, ảnh không filter, không tràn ngang); 390/1440px kiểm profile (camera, chọn avatar/lưu lại), nút (computed foreground/background ratio >= 4.5:1) và game (Space/tap nhảy, vật phẩm mở câu hỏi, 5 lượt, thưởng 20, footer hidden).
- Core tests: game điểm thưởng, reset/đơn demo/voucher; 400 câu hỏi được tạo thử; không trùng lựa chọn.
- Shopify theme check: cú pháp Liquid, JSON, CSS.
- Các fixture Chromium không thay thế QA website live, iOS Safari hoặc thiết bị thật; mật khẩu store Shopify trial có thể chặn người dùng công khai.

## Lưu ý
- CHẠM Points là demo ở localStorage, không có đồng bộ tài khoản hay hệ thống chống gian lận.
- Không bật thanh toán hoặc vận chuyển thật; không đăng ký gói Shopify.
- Đối với câu hỏi học nghề, các dữ kiện cố định từ nguồn tham khảo được xáo trộn thành câu hỏi động, không phải AI tạo kiến thức vô hạn.
