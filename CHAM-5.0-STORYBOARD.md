# CHẠM 5.0 · Storyboard & design system
Reference inspected using Chromium (1440×900, 390×844) on 2026-11-22: https://vnconicalhat.site/

## Characteristics verified in reference
Large condensed editorial title with asymmetrical small illustrations, document-style photo groupings, expansive warm negative space, sticky scroll-sequenced storytelling, interactive vertical materials index, gallery with deliberately varied image scales, quiet typography, closing black scene with subtle linework. On mobile the compositions become vertical, still with very large letters. Reference assets and copy are not copied.

## Experience map, states, and fallbacks
| Scene | Start | Mid-scroll / interaction | End | Mobile / reduced-motion |
|---|---|---|---|---|
| 01 Intro | “Từ Việt Nam, bằng đôi tay.” small text on ivory | opacity shifts into hero over ~0.85s; never prevents scrolling | automatically removed, hero already rendered | hidden/instant when reduced motion |
| 02 Cover | Huge CHẠM condensed title, ink-photo fragments, catalog shortcut | sticky title shifts/scales, ink sketches drift, photographic fragments arrive according to scroll progress | dissolves to editorial narrative | no pin on mobile; legible single-column static title when reduced |
| 03 Three states | 01 Chất liệu, first product image | 02 Đôi tay, image panels and type transition with scrub | 03 Thành phẩm; three verified product images | vertical chapters mobile; no forced page scroll |
| 04 Portal | framed craft product and ivory background | centered image expands and cream-to-dark overlay progresses | becomes cinematic full-bleed image chapter | shorter sticky scene; static full-bleed reduced |
| 05 Detail film | first real product detail photograph | images pan horizontally by scroll progress; quiet copy overlay | final product detail & chapter conclusion | horizontal swipe/touch fallback, no autoplay audio |
| 06 Materials | first material panel expanded | click/tap four material indexes to swap images/content; hover focus and pressed states | direct navigation to matching collection | large tap controls, stacked layout |
| 07 Gallery | oversized asymmetrically placed photos | parallax shifts with scroll scrub | ends with direct jump to catalog | natural single-column gallery |
| 08 Categories | real collection title/images | hover micro-motion, keyboard focus, tap | collection navigation | 2-column or single |
| 09 Shop | real Shopify product data and prices | lightweight hover, clicks open products | collection navigation | 2-column legible cards |
| 10 Play | large game landscape with dinosaur preview | subtle pointer parallax only | CHẠM Play navigation | no parallax on touch |
| 11 Explore | About, Story, Club links | small interaction affordances | user directly navigates | stacked links |
| 12 Closing | dark image-and-ink field, strong closing title | dark reveal on entry and fixed decorative art | current shared footer after scene | static / no additional footer |

## Design tokens
Ivory #FAF8F5, warm cream #FAF1E6, ink #09090A, terracotta #A85239, ochre #D6A348, sage #627A66. Title Phudu with safe sans fallback, body Be Vietnam Pro. Content max 1440px but full-bleed editorial scenes. No random “01 /” labels as decorative headings; chapter numbers only when informative.

## Implementation rules
- Shopify Liquid, real Shopify product images/prices/collections; no fabricated customers, suppliers, endorsements, craftsmanship footage or claims.
- Original ink drawing assets processed from the store’s existing demonstration product photos, not from reference website.
- Scroll progress via requestAnimationFrame, CSS transforms, sticky containers; no scroll interception and no dependency on CDN scripts to render content.
- Reduced-motion and coarse-pointer fallbacks, IntersectionObserver-free native progressive enhancement, accessible focus states.
- Intro/final CTA and direct catalog anchor remain usable even if JavaScript fails.
- Only template index and cham5-specific sections/assets touched; shared header/footer, About, game, checkout untouched.
