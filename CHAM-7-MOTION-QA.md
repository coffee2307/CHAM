# CHẠM — Brand typography and scroll-motion correction · 2026-11-23

## Source of the problem
- The period after CHẠM was an assistant-added decorative span in the hero and closing chapter; it was not part of the brand.
- The preceding landing implementation concentrated scroll-scrubbing on the hero, a focus-image mask, and one horizontally pinned six-step craft gallery. Material, catalog and closing areas were mostly static.

## Changes in this revision
1. Remove decorative trailing punctuation from both CHẠM brand headings in Liquid. Keep the actual tone and copy in paragraphs.
2. Rebalance the Phudu masthead to weight 760, controlled width and less compressed letter-spacing; the final black panel uses the same brand styling.
3. Add GSAP/ScrollTrigger progress-driven choreography on the homepage only: staggered editorial chapter headlines, delayed supporting copy, opposing material-photo parallax, revealing material-photo masks, catalog photo masks with restrained card movement, navigation hover feedback, and a gradual transition into the dark final chapter.
4. Keep the verified horizontal six-step craft story and center-focus pin unchanged. Update the current-process class to add small image motion without making text harder to read.
5. No modifications to shared header/footer, About, CHẠM Play, Club, orders, checkout or product data.

## QA
- Chromium fixture with Shopify-generated product/collection data, at widths 320, 390, 428, 768, 1024, 1440 and 1920px: PASS, horizontal overflow 0, heading overflow 0, five collections and six product cards.
- Verified both CHẠM headings have no decorative dot and additional chapter motion triggers are present.
- Desktop pinned focus scene checked at 2%, 52% and 96%, horizontal six-stage story at 1%, 25%, 50%, 75% and 99%: PASS.
- Re-ran Chromium at 1440px after the final image-mask refinement: PASS.
- Reduced-motion fallback: six static craft process steps readable, no scroll pin.
- Core demo/Club/Play/checkout tests: PASS.
- Shopify Theme Check: no errors; 36 existing theme warnings remain.
- Fixture is not proof of public storefront password removal, actual device/browser performance or live Core Web Vitals.

## Release
The only deployed content files are `sections/cham5-story.liquid`, `sections/cham5-market.liquid`, `assets/cham5-home.css`, and `assets/cham5-home.js`. Single theme target: CHẠM — Main, ID 191052087538.
