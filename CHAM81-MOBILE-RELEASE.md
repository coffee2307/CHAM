# CHẠM 8.1 — Mobile experience

## Những vấn đề được xử lý

- Hero: không được đánh dấu 3D sẵn sàng trước khi có khung hình WebGL hợp lệ; fallback hiển thị đầy đủ khi WebGL không hỗ trợ, mất context hoặc không tạo draw calls. Chuyển mobile sang cover sáng có ảnh tư liệu thật và CTA rõ ràng.
- Storytelling: sáu chương vẫn được art-direct riêng nhưng bỏ phần lớn chiều cao cố định trên mobile; đoạn văn có chiều ngang đủ đọc; ảnh chính và ảnh phụ tạo bố cục bất đối xứng có mục đích.
- Ảnh chương 01: dùng ảnh đưa đất vào khuôn đúng nội dung, thay cho ảnh các phôi gốm đã tạo hình. Giữ ghi công trong nguồn tư liệu.
- Chữ và điều hướng: đoạn văn nội dung mobile tối thiểu khoảng 14px theo CSS, tăng vùng chạm các CTA, giảm caption đè ảnh, cải thiện tương phản hero.
- Catalog, phần chuyển tiếp và kết trang: điều chỉnh nhịp khoảng trắng và kích thước chữ; không sửa dữ liệu sản phẩm hoặc chức năng bán hàng.

## Kiểm thử

- Browser QA local: 320, 375, 390, 430, 768, 1024, 1440, 1920px; không phát hiện tràn ngang; kiểm tra các chương ảnh, danh mục và reduced motion.
- Mobile audit: kiểm tra 15 vị trí từ đầu đến cuối ở 320, 375, 390, 430 và 768px; không phát hiện JavaScript page errors trong lần audit.
- Functional tests: 4 nhóm hiện có đạt; Shopify Theme Check exit code 0, còn các cảnh báo không nghiêm trọng.
- Một số môi trường Chromium giả lập sử dụng SwiftShader: ở đó cần fallback hiển thị ảnh và tránh dùng ảnh canvas trống. Hiệu năng WebGL trên GPU thật, iOS Safari và Core Web Vitals chưa được kiểm chứng bằng đo thực tế.

## Build và hệ thống

Nguồn Three.js có thể bảo trì tại `scripts/cham8-hero.src.js`, mã bundle được tải lên Shopify ở `assets/cham8-hero.js`. Để build lại, chạy `npm install --prefix scripts --no-save three@0.181.2 esbuild@0.27.0` rồi `node scripts/build-hero.cjs` và kiểm tra bằng trình duyệt.

Giữ một repository GitHub coffee2307/CHAM, một tuyến local F:\CHAM, một theme Shopify CHẠM — Main (191052087538). Không thay đổi thanh toán, giá, sản phẩm, gói dịch vụ hoặc mật khẩu storefront. Bản sao lưu theme trước 8.1: F:\CHAM\.backup\shopify-main-before-cham81.zip.
