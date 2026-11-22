from pathlib import Path
base=Path(r'F:\CHAM')
replacements={
'sections/cham-custom-callout.liquid':[
('<div class="cham-custom__label" aria-hidden="true"><span>CHẠM / CUSTOM</span><span>01—01</span></div>',''),
('<p class="cham-kicker">{{ section.settings.eyebrow }}</p>',''),
('<span aria-hidden="true">↗</span>',''),
('CÁ NHÂN HÓA / ĐẶT THEO YÊU CẦU','ĐẶT THEO YÊU CẦU')
],
'sections/cham-demo-app.liquid':[
('<p class="cd-label">CHẠM 2.0 · DEMO</p>','')
],
'sections/cham-editorial-manifesto.liquid':[
('CHẠM / ĐIỀU CHÚNG TÔI TIN','Về CHẠM'),
('<span class="cham-feature-story__mark">01 — 03</span>',''),
('<span>01</span>',''),('<span>02</span>',''),('<span>03</span>','')
],
'sections/cham-values.liquid':[
('01 · VẬT LIỆU','VẬT LIỆU'),('02 · KỸ THUẬT','KỸ THUẬT'),('03 · ỨNG DỤNG','ỨNG DỤNG')
],
'sections/cham-weave-showcase.liquid':[
('CHẠM / ỨNG DỤNG','Ứng dụng'),
('01 / KHÔNG GIAN SỐNG','Không gian sống'),('02 / MỖI NGÀY','Mỗi ngày'),('03 / TRAO TẶNG','Quà tặng')
],
'sections/main-page.liquid':[
('CHẠM / THÔNG TIN','Thông tin')
],
'sections/cham-product-context.liquid':[
('CHẠM 2.0 — SẢN PHẨM DEMO','Sản phẩm minh họa')
],
'snippets/cham-about-content.liquid':[
('VỀ CHẠM / ABOUT US','Về CHẠM'),
('01 / CHỌN LỌC','Chọn lọc'),('02 / MINH BẠCH','Thông tin'),('03 / CÁ NHÂN HÓA','Tùy chỉnh'),('04 / TÁC ĐỘNG','Định hướng'),
('<b>01</b>',''),('<b>02</b>',''),('<b>03</b>','')
],
'snippets/cham-story-content.liquid':[
('CÂU CHUYỆN / OUR STORY','Câu chuyện CHẠM'),
('<article data-cham-reveal><span>01</span>','<article data-cham-reveal>'),
('<article data-cham-reveal><span>02</span>','<article data-cham-reveal>'),
('<article data-cham-reveal><span>03</span>','<article data-cham-reveal>'),
('<article data-cham-reveal><span>04</span>','<article data-cham-reveal>')
]
}
for path,changes in replacements.items():
 p=base/path
 content=p.read_text(encoding='utf-8-sig')
 for old,new in changes:
  if old in content:content=content.replace(old,new)
  else:print('NOT_FOUND',path,old[:70])
 if '↗' in content:content=content.replace('↗','')
 p.write_text(content,encoding='utf-8',newline='\n')
 print('CLEANED',path)
