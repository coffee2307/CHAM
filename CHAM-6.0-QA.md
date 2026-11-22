# CHẠM 6.0 — Kiểm thử và phục hồi

## Phạm vi và kết quả

Trang chủ có bảy chương. Tên CHẠM, thông điệp mua sắm thủ công Việt Nam, phần mô tả ngành hàng và hai liên kết hiện trong màn hình đầu ở tất cả kích thước kiểm thử. Nội dung nghề dùng ảnh tư liệu từ nhiều nơi, có ghi công ngay trên trang và phân biệt với ảnh catalog. Xem [đối chiếu tham chiếu](CHAM-REFERENCE-AUDIT.md) và [nguồn ảnh](CHAM-ASSET-MANIFEST.md).

| Viewport kiểm thử Chrome | Hành vi công đoạn | Tọa độ X ở 0 / 25 / 50 / 75 / 100% |
| --- | --- | --- |
| 320 × 720 | Đọc dọc, đủ sáu khung | — |
| 390 × 844 | Đọc dọc, đủ sáu khung | — |
| 428 × 926 | Đọc dọc, đủ sáu khung | — |
| 768 × 1024 | Đọc dọc, đủ sáu khung | — |
| 1024 × 768 | Ghim dưới header rồi nhả cảnh | 0 / −1087 / −2304 / −3520 / −4608 px |
| 1440 × 900 | Ghim dưới header rồi nhả cảnh | 0 / −1530 / −3240 / −4951 / −6480 px |
| 1920 × 1080 | Ghim dưới header rồi nhả cảnh | 0 / −2039 / −4320 / −6601 / −8640 px |

- Chrome dùng template Liquid, CSS và JavaScript của bản phát hành cùng dữ liệu danh mục, sản phẩm lấy từ Shopify Admin. Ảnh chụp được lưu cùng hồ sơ QA trên máy phát triển. Đây là bản kiểm thử dựng trước phát hành.
- Cả bảy cỡ có đủ năm liên kết danh mục và sáu thẻ sản phẩm đọc giá từ dữ liệu Shopify. Đã kiểm URL sản phẩm và bộ sưu tập, toàn bộ ảnh trong trang, font Phudu và Be Vietnam Pro, không tràn ngang, không giao nhau giữa vùng ảnh và khối chữ, CTA ở trên nếp màn hình và không có lỗi console trong phiên kiểm thử.
- Ở ba cỡ desktop, khung nhìn đứng yên dưới header trong lúc dải ảnh di chuyển. Chương đời sống theo sau khi hết phạm vi ghim. Cuộn ngược trả về đúng tọa độ đã đo. Có thể đi lần lượt tới mọi khung bằng phím Enter. Reduced motion và đổi kích thước 1440 → 428 → 1920 đều chuyển đúng trạng thái ghim hoặc đọc dọc.
- Shopify Theme Check trên 5.0 và trên mã theme 6.0 đều ghi nhận 0 lỗi và 36 cảnh báo. Các kiểm tra Node cho demo, ngân hàng câu hỏi, render Club/Play/Checkout demo và cấu trúc release đã qua. Checkout sử dụng fixture giỏ hàng.
- Ảnh hero có bản 640 và 1600 px. CSS và JavaScript riêng cho trang chủ có tổng kích thước khoảng 14 KB trước nén. Ảnh bên dưới tải theo nhu cầu. Core Web Vitals từ người dùng thật, Safari iOS và thông số thiết bị vật lý chưa được đo.
- Storefront công khai điều hướng đến `/password` khi kiểm tra trước phát hành. QA dựng trước phát hành và Theme Check kiểm mã theme, còn nghiệm thu hình ảnh và luồng mua sắm trên storefront cần truy cập storefront đã mở khóa. Shopify trả về gói Trial.

## Tệp trong phạm vi

- `templates/index.json` khai báo hai section cho bảy chương và cấu hình sáu ảnh công đoạn.
- `sections/cham6-story.liquid`, `sections/cham6-market.liquid`, `snippets/cham6-photo.liquid` và `snippets/cham6-photo-credits.liquid` triển khai nội dung, catalog và ghi công.
- `assets/cham6-home.css`, `assets/cham6-home.js`, 16 ảnh WebP và ba font WOFF2 là tài nguyên của trang chủ.
- `layout/theme.liquid` chọn tài nguyên CHẠM 6.0 ở index. `sections/cham-header.liquid` đưa nút Sản phẩm của index đến catalog trong trang.
- `tests/cham-release.test.cjs` kiểm cấu trúc index hiện tại, sáu ảnh có mô tả và đường dẫn catalog. Các tệp nội dung About, Play, Club, sản phẩm, giỏ hàng và thanh toán nằm ngoài phạm vi thay đổi.

## Phục hồi

Điểm Git trước khi thay là `31475572b931f3edfbe7319ae2fd85421f84821c`. Bản kéo từ theme Shopify `191052087538` trước cập nhật được lưu tại `F:\CHAM\.qa\cham6\live-before`. Để phục hồi storefront, dùng bản đó để gửi lại đúng ba đường dẫn `layout/theme.liquid`, `sections/cham-header.liquid` và `templates/index.json` vào theme hiện có, giữ các tài nguyên cũ ở nguyên vị trí. Hoàn nguyên commit phát hành bằng `git revert` trên `main` nếu cần đưa GitHub và máy phát triển về cùng trạng thái.
