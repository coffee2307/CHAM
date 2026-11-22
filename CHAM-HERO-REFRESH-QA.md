# CHẠM — Art Direction & Hero Refresh QA (2026-11-23)

## Request
Replace the split-screen “CHẠM | artisan photo” hero with an editorial composition influenced by the user-provided Vietnamese Conical Hat screenshots. Improve typography, purposeful negative space, image reveal, scroll-led scene transitions; preserve product data and all existing non-homepage functionality.

## Scope of changes
- `sections/cham5-story.liquid`: original split hero removed; replaced by single full-width Phudu masthead, short commercial explanation, two functional links and four hanging documentary-polaroid photographs. Added “Hãy nhìn gần hơn” photographic transition with scroll-progress image masking; kept six-step craft-process horizontal gallery.
- `assets/cham5-home.css`: removed orphaned old hero rules and composed editorial hero + cinematic frame. Added responsive mobile-first behavior, light performance-safe image decode blur, wide margins and title styles. Reformatted material gallery with ample white space.
- `assets/cham5-home.js`: GSAP/ScrollTrigger hero and center image transitions; retained full-length true horizontal scroll. Decode images near viewport with IntersectionObserver, do not delay first meaningful content, no blocking loader. Lenis runs only on capable desktops, native scroll on touch/mobile and reduced-motion.
- `sections/cham5-explore.liquid` and `sections/cham5-market.liquid` untouched; catalog remains sourced from Shopify.
- No new Shopify theme, no additional site; no changes to Club, Play, About, products or checkout.

## Image authenticity and credits
Photos are the existing licensed documentary images listed in `CHAM-ASSET-MANIFEST.md` (Wikimedia Commons / Pexels). Hero Polaroids use the prior optimized 640px versions. Their presentation is illustrative of Vietnamese craft processes, not a claim that the shop manufactured those products. Existing attribution links remain in the details section below the process gallery.

## Acceptance checks
- 7 Chromium viewports: 320, 390, 428, 768, 1024, 1440, 1920 px.
- 5 collections and 6 product cards are visible in the homepage render fixture.
- No old split-hero node or CHẠM Play promotional banner.
- On desktop, process pinned horizontal gallery follows wheel scroll through 6 steps with screenshot samples at 1%, 25%, 50%, 75%, 99%.
- Center-focus scene requires distinct pinning and changing clip-path; tested at 2%, 52%, 96%.
- Touch/tablet: process becomes linear vertical chapters and hero gallery is horizontally swipeable, without blocking page scroll.
- Reduced-motion: no pinned story and all 6 steps remain readable.
- Browser test has no JS errors, overflow or clipped heading at test breakpoints.
- Shopify Theme Check and core CHẠM tests run before push.
- Local browser fixture proves layout only; Shopify live-theme verification and iOS Safari remain separate checks.

## Rollback
Previous production revision: `bc3bfb5`. Restore previous home-section and CSS/JS source from this revision if necessary. Do not create duplicate themes; commit a revert and update the same main theme.

## Performance notes
- Hero photographs are 640px compressed WebP with dimensions and low resource priority. Main headline is HTML, not a blocking image.
- Image decode transitions do not require a timed fullscreen loader. Below-fold photographs load lazily.
- Motion plugins are hosted locally, loaded on homepage only; Lenis is gated by hardware capability and pointer.
- Further performance figures (LCP/INP/CLS) require a live storefront measurement, not a fixture-derived claim.
