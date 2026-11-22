# CHẠM 6.0 — Đối chiếu Nón Lá

Tham chiếu [Vietnamese Conical Hat](https://vnconicalhat.site/). Đã khảo sát trang thực trong Chrome, đọc DOM đã render, stylesheet `index.cjBcBi3E.css` và các bundle Astro được liệt kê bên dưới. Các ghi nhận kỹ thuật dùng để thiết kế lại, mã và tài nguyên của trang tham chiếu nằm ngoài theme.

| Thành phần Nón Lá | Cơ chế và mục đích | Vấn đề ở CHẠM 5.0 | Áp dụng vào CHẠM 6.0 | Kiểm thử |
| --- | --- | --- | --- | --- |
| Loading và hero | `Loading` dùng tiến trình `clip-path`, GSAP Flip đưa chữ về vị trí hero, sau đó mở lại Lenis. Hero có chữ khổ lớn và nhóm định nghĩa, ảnh, nội dung đặt trên lưới. | Màn chờ chuyển chữ tiếp đến bìa có 3 tranh và 3 ảnh, câu giới thiệu chưa nói rõ cửa hàng bán gì. | Hero hiện ngay, chữ Phudu, một ảnh tư liệu cạnh thông điệp và hai liên kết. Phần ảnh vào cảnh người làm gốm bằng thay đổi tỷ lệ trong khung ảnh. | Tải lần đầu, chữ và hai CTA nằm trong màn hình đầu, ảnh không giao vùng chữ. |
| `IntroReveal` / `LandingStack` | Lớp intro mở từ trung tâm bằng mặt nạ. `LandingStack` tinh chỉnh độ sáng, mờ và tỷ lệ của lớp bìa, đồng thời bảo đảm lớp ngừng nhận tương tác sau khi phần dưới tới. | Cover và portal đều chiếm nhiều khoảng cuộn, với nhiều lớp ảnh và chữ chuyển động đồng thời. | Hero và đoạn giới thiệu có chiều cao theo nội dung. Khi ảnh giới thiệu vào màn hình, tỷ lệ ảnh giảm nhẹ trong vùng cắt, chữ ở luồng tự nhiên. | Quan sát đầu, giữa và cuối. Kiểm tra ranh giới ảnh/chữ, cuộn ngược và giảm chuyển động. |
| `About`, `.about__slider`, `.slider__tracker` | ScrollTrigger ghim slider có khoảng đệm, ghép `scrollWidth - clientWidth` với dịch ngang liên tục và một đoạn giữ cuối. SplitText và mặt nạ ảnh đi theo tiến trình riêng. Desktop chạy cơ chế ghim. Mobile và tablet ngắt cơ chế này. | Storybook đặt tất cả `article` tại cùng `inset: 0` rồi đổi opacity. Dải film chỉ dịch một cụm hình, thiếu sáu điểm dừng có câu chuyện riêng. | CSS sticky ghim sân khấu. JavaScript chuyển cuộn dọc thành dịch X theo kích thước thực. Một khung bằng chiều rộng vùng nhìn, ảnh chiếm khoảng 2/3 màn hình. Có thời gian giữ đầu và cuối, thước tiến trình và hai nút đổi công đoạn. Màn hình nhỏ, viewport thấp và reduced motion đọc theo chiều dọc. | So tọa độ X đầu–cuối, đo vị trí ghim, cuộn ngược, đi hết sáu khung bằng bàn phím, đổi cỡ rồi kiểm lại. |
| `MomentsVideoScene` | Hai timeline liên tiếp. Bánh ảnh đi ngang và quay, rồi video mở rộng từ một điểm trong cover khi văn bản tách sang hai phía. Nhiều kích thước lấy lại theo viewport. | Portal CHẠM 5.0 ghim và đặt tiêu đề tuyệt đối trên ảnh quà tặng, trước một cảnh film cũng ghim. | Dành thao tác ghim cho quy trình làm gốm. Chuyển sang chương đời sống bằng một ảnh danh mục ở lưới văn bản và hình. | Đo vị trí chương đời sống ngay sau khi bỏ ghim, ảnh và chữ hiện đầy đủ. |
| `Materials` | Một mục hoạt động tại một thời điểm. Desktop có overlay, mobile và tablet mở sẵn mục đầu. Nội dung và ảnh được chuẩn bị trước khi chuyển. | Các tab chất liệu lặp ảnh sản phẩm và liên kết với bộ sưu tập đã có ở phần mua sắm. | Đưa vật liệu vào nội dung và ảnh từng bước. Catalog cho mở thẳng năm danh mục với liên kết HTML thật. | Kiểm đường dẫn và thứ tự tab, xem đủ ảnh và nội dung khi tắt JavaScript. |
| `Variants` | Dãy ảnh đi qua phối cảnh 3D với tọa độ theo viewport. Timeline được cắt khi các biến thể rời khung và nạp ảnh theo nhóm. | Gallery CHẠM 5.0 lặp một collage sản phẩm trước lưới thương mại, hai khu cùng đòi hỏi người xem diễn giải. | Ảnh thương mại có khung nhất quán và đường dẫn sản phẩm, dữ liệu giá và tên đến từ Shopify. | Kiểm đủ năm danh mục, sáu sản phẩm và URL. Đo không tràn ngang, đọc đủ tên ở 320px. |
| Cảnh kết | Footer tham chiếu nền gần đen `rgb(9,9,10)`, hình thương hiệu lớn, tương phản tiết chế. | V5 dùng ảnh mực tuyệt đối kèm nhiều dòng chữ đặt cạnh dấu trang trí. | Cảnh kết nền đen, chữ và liên kết cùng một cụm. Tranh mực đặt ở cột riêng, sau đó dùng footer Shopify hiện có. | So vùng chữ và ảnh ở desktop và mobile, kiểm hai liên kết cuối trang. |

## Đo trực tiếp trong Chrome

| Viewport | About được ghim | Dịch X ở 0 / 25 / 50 / 75 / 100% |
| --- | --- | --- |
| 1440 × 900 | Có, tại đỉnh viewport | 0 / −763 / −1527 / −2290 / −2880 px |
| 1920 × 1080 | Có, tại đỉnh viewport | 0 / −1018 / −2035 / −3053 / −3840 px |
| 390 × 844 | About đọc dọc | Không dịch X |
| 428 × 926 | About đọc dọc | Không dịch X |

Các mẫu lấy trong Chrome sau khi ScrollTrigger và Lenis đã ổn định. Đã cuộn tới các chương vật liệu, video, biến thể, bản đồ và nền kết. Chuyển động moments/video và variants vẫn có trên mobile của Nón Lá. CHẠM dành ghim cho desktop rộng và đủ cao để sáu công đoạn dễ đọc.

## Điều tra CSS

- Layout cũ tải `cham-theme.css`, `cham-refinement.css`, `cham-demo.css`, `cham-minimal.css`, `cham-polish.css`, `cham-v3.css`, `cham-v4.css`, sau đó là `cham5-home.css`. Bảy tệp dùng chung phục vụ header, footer và các trang khác. Hero cũ ghim khung nhưng đặt masthead, tranh mực, cụm ba ảnh và chữ tuyệt đối. Storybook có các lớp đặt cùng tọa độ. Các clip và giới hạn chiều cao làm giao nhau hoặc cắt nội dung ở khoảng giữa.
- Các selector toàn cục trong `cham-theme.css` buộc font Arial trên heading, đặt `overflow-x: clip` và phủ lớp họa tiết cố định lên body. `cham-demo.css` có quy tắc heading Lora. `cham-minimal.css` định kích thước và trạng thái header. Các selector section cũ trong refinement, polish, v3 và v4 vẫn phục vụ trang khác, các lớp mới `cham6-*` không trùng với chúng.
- Layout bỏ tải CSS/JS trang chủ V5. CSS V6 dùng lưới với vùng chữ và vùng ảnh riêng. Hai quy tắc font giới hạn trong `.cham6` thắng quy tắc Arial cũ. Phudu dành cho tên CHẠM và tiêu đề chính, Be Vietnam Pro giữ chữ hoa thường cho các tiêu đề phụ. Header ghim riêng trên trang chủ và dùng chiều cao thực tế cho điểm ghim và liên kết neo.

## Storyboard triển khai

| Chương | Đầu | Giữa | Cuối |
| --- | --- | --- | --- |
| Hero | Tên CHẠM, ngành hàng, ảnh bàn xoay và hai CTA. | Nội dung đi lên cùng trang, khung ảnh đứng trong cột riêng. | Khung ảnh người thợ của chương sau đi vào viewport. |
| Phía sau một món đồ | Ảnh người thợ trang trí bước vào, tỷ lệ tối đa 1,09 trên desktop hỗ trợ chuyển động. | Toàn ảnh thu về khung, bài viết vẫn ở cột riêng. | Liên kết đi tới quy trình nằm trong luồng đọc. |
| Từ đất đến gốm | Khung 1 giữ ngắn, tên chương và chú thích. | Dải khung trượt, mỗi khung có một ảnh, một tiêu đề và mô tả riêng. | Khung 6 giữ ngắn, sân khấu rời viewport và chương sau theo ngay. |
| Đời sống | Nội dung về gốm và các nhóm sản phẩm khác. | Ảnh mây tre từ catalog đặt cạnh văn bản. | Mục ghi công có thể mở, rồi chuyển sang lưới danh mục. |
| Catalog | Năm bộ sưu tập có đường dẫn. | Danh sách sản phẩm nổi bật đọc giá trực tiếp từ Shopify. | Ghi rõ storefront đang trình diễn. |
| Play và Club | Tiêu đề và phần mô tả. | Sprite hiện có, dùng một khung tĩnh. | Hai liên kết dẫn đến trang tương ứng. |
| Cảnh kết | Nền tối và chữ CHẠM. | Tranh mực nằm ở vùng riêng, độ tương phản thấp. | Hai liên kết và footer hiện có. |

Bản tham chiếu khởi tạo Astro, GSAP/ScrollTrigger và Lenis. CHẠM dùng sticky, đo kích thước, requestAnimationFrame và cuộn mặc định của trình duyệt. Các cơ chế này đáp ứng mục tiêu ghim và trượt với một tệp script trang chủ.
