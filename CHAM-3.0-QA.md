# CHẠM 3.0 — triển khai và kiểm thử

## Phạm vi

- Cửa hàng Shopify: `5yvv8u-44.myshopify.com`
- Theme chính duy nhất: `191052087538`
- Local: `F:\CHAM`; GitHub: `coffee2307/CHAM`
- Các trang liên quan: `/`, `/pages/about`, `/pages/cham-club`, `/pages/cham-play`, `/collections/all`
- Không mở thanh toán thật và không tạo theme phụ.

## Quyết định thiết kế

1. Danh mục: layout ảnh + tên riêng thay cho nhãn chồng ảnh; hai ô nổi bật, ba ô dưới.
2. Hero: ảnh sản phẩm có thể chuyển đổi; không tự động chạy carousel.
3. Catalog: năm lựa chọn tương tác gắn dữ liệu Shopify.
4. About: ảnh minh họa sản phẩm, thông tin dự án trung thực, thao tác dẫn tới danh mục và CHẠM Play.
5. CHẠM Club: hồ sơ browser-local, 169 avatar SVG kế thừa từ Oxyz Edu, lịch sử demo, voucher và yêu thích.
6. CHẠM Quest: trò chơi runner ba làn và các câu hỏi ngẫu nhiên về 6 làng nghề; năm chặng mỗi lượt, 20 điểm CHẠM tối đa một lần/ngày.

## Dữ liệu và quyền sử dụng

- Avatar Oxyz: 168 avatar SVG Open Peeps / Pablo Stanley ghi license CC0 ngay trong metadata; một avatar mặc định trích từ bộ Oxyz không có khai báo license trong file. Không nhập SVG của website lạ.
- Ảnh catalog và hero dùng ảnh sản phẩm đã có trong Shopify; không nhận là hàng đang bán thật.
- Câu hỏi trong `assets/cham-craft-knowledge.js` được ghép tại runtime từ dữ kiện có nguồn. Dữ kiện là cơ sở dữ liệu có giới hạn, **không** phải AI tạo ra vô hạn kiến thức và không dùng API trực tiếp; lựa chọn/dạng câu hỏi được xáo trộn.
- Không sao chép source code trò chơi bên thứ ba. Tham khảo nguyên tắc gameplay từ [Phaser examples](https://github.com/phaserjs/examples) (MIT); code và CSS CHẠM Quest được viết riêng.
- Nguồn dữ liệu nghề: [Vietnam Tourism — Bát Tràng](https://vietnam.travel/things-to-do/full-day-trip-bat-trang-pottery-village/), [Vietnam Tourism — Vạn Phúc](https://vietnam.travel/things-to-do/wander-ancient-traditional-silk-villages-vietnam/), [Cục Du lịch Quốc gia Việt Nam — làng nghề](https://vietnamtourism.gov.vn/en/printer/20688?type=1), [Tranh Đông Hồ](https://vietnamtourism.gov.vn/en/post/5644), [Làng Chuông](https://vietnam.travel/node/1452).

## Nghiệm thu kỹ thuật

- `node tests/cham-demo.test.cjs`: ví điểm, điểm danh, game thưởng một lần/ngày, order demo, voucher.
- `node tests/cham-pages.test.cjs`: kết xuất trang demo cũ để giữ phương án dự phòng.
- `node tests/cham-knowledge.test.cjs`: tạo 400 câu hỏi, 5 kiểu câu, không trùng lựa chọn, mỗi lượt 5 làng nghề không trùng.
- `node tests/cham-v3-browser.test.cjs`: Chromium isolated fixtures (không phải Shopify live) với 320/390/768/1440px cho danh mục; 390/1440px cho club, avatar và game.
- `shopify theme check`: kiểm tra syntax/theme, không thay thế visual QA.
- `.qa/*.png`: ảnh chụp fixture Chromium; **không phải** ảnh chụp storefront thật. Chưa có baseline visual được duyệt.

## Rủi ro còn tồn tại

- Store đang dùng Shopify Trial và storefront bị chặn bởi trang mật khẩu, do đó không thể xác minh đầy đủ trên URL công khai.
- Không xác minh được Safari iOS hoặc điện thoại vật lý. Không được kết luận browser visual QA sản phẩm đã PASS chỉ từ fixture Chromium.
- Dữ liệu trình duyệt có thể mất khi xóa localStorage hoặc đổi thiết bị; điểm demo không có chống gian lận thực tế.
- Video thủ công không được bổ sung khi chưa có tệp/giấy phép phù hợp; phần ảnh/catalog tương tác thay thế có thể kiểm chứng được.
