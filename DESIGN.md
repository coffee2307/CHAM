# CHẠM 2.0 — Design and implementation contract
Status: user-provided implementation brief, 22 November 2026.
Project/store: F:\CHAM / coffee2307/CHAM / 5yvv8u-44.myshopify.com.
Theme: CHẠM — Main, 191052087538. No additional Shopify themes.
Purpose: interactive demonstration of a curated Vietnamese craft marketplace, explicitly not a real sales storefront.
Visual thesis: tactile, contemporary Vietnamese craft presented with readable and efficient commerce UI.
Palette: ivory #F8F3E9, ink #26251F, terracotta #A85239, saffron #D6A348, sage #627A66.
Typography: Be Vietnam Pro for UI and Lora for large editorial headings, graceful fallback, Vietnamese glyphs.
Layout: product-first navigation, clear categories and search, asymmetric home editorial and usable commerce surfaces. Responsive at 320,390,428,768,1440.
Experience: Shopify cart/products/collections; browser-local demo profile, orders, rewards, memory game and vouchers. No real checkout, payments, fulfillment, account credentials or cross-device sync.
Interaction: visible and reversible actions, input validation, keyboard support, 44px touch targets, reduced-motion support. Focus contrast.
Data truth: all 20 products and images are demo/illustrative. No inventory or production assertions, no invented makers/reviews.
State: localStorage key cham_demo_v2; ledger with idempotent reference keys, reset button, same-browser persistence only.
Product media: licensed or original illustrative assets with source records; missing media is a blocker for final QA.
QA: inspect source, theme check, browser at widths 320/390/428/768/1440, test shopping/cart/profile/game/voucher/demo checkout/reload, report unverified items honestly.
Release: explicit request and accessibility/security QA required; Shopify Trial/password gate is separate from theme publication. No paid plan or actual transactions.

## CHẠM 7.0 — Editorial experience
Homepage visual direction: immersive, photographic chapters referencing Vietnamese handcraft, with one procedural WebGL weave rather than an oversized text-only masthead.
Typography: preserve existing licensed Phudu and Be Vietnam Pro; CHẠM brand mark remains legible, no decorative trailing punctuation.
Colors: ink and warm paper, bamboo brown, clay accents; do not replace store-wide setting tokens.
Composition: hero sculpture and editorial asymmetric paired-photo chapters, big documentary photo right / narrative and supporting photos left; maintain the same visual grammar on narrow screens.
Motion: lightweight real-time WebGL only when capable, progressive image masks, existing GSAP pinned horizontal story on capable desktop, vertical responsive reading and reduced-motion still imagery.
Navigation: header retracts on downward scroll and returns on upward scroll; menu and keyboard focus override hiding.
Commerce and demo systems remain functionally unchanged; keep the project a demo storefront and do not turn on real checkout.
Deployment: one existing repository and main theme only; no automatic storefront publication without visual and accessibility QA.
