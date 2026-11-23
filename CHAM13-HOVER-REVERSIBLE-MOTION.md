# CHẠM 13 — Hover & reversible scroll motion

## Scope implemented

- Header wordmark/navigation underline response and icon-link hover on desktop pointer devices.
- Hero CTA underline and two artisan illustrations' subtle hover response; hero illustration motion follows native scroll and reverses when scrolling upward.
- Horizontal craft photo reveals are calculated from the **same native scrollY frame** that already moves the six chapter panels. Rewinding the page reverses the corresponding reveal mask and image scale, without a second scroll listener, ScrollTrigger pin, spacer or any layout-height mutation.
- Story photo hover emphasizes the photograph without moving its figure layout.
- Material-photography hover uses slight contrast response on fine pointers.
- Collection/category cards get a subtle photo zoom, a fine hairline, and an understated title color change; mouseleave reverses fully.
- Product image zoom and caption color react to hovering product links; cards retain their physical position.
- CTA/footer/secondary text links use a shared underlining rhythm, without inserting ornamental arrows.
- Keyboard focus-visible remains distinct; touch devices avoid hover-stuck behavior; reduced-motion users retain static photos and native swipe.

## Motion architecture

The horizontal controller remains in `assets/cham5-home.js`, with `window.__chamCraftFrame?.(progress)` called from its existing passive-scroll requestAnimationFrame. `assets/cham8-story.js` is now a pure progress-to-visual-state mapper, plus a non-pinning reversible hero ScrollTrigger. Changes to imagery do not write document height, scrollY or horizontal-track geometry. GSAP sections below the story already use scrubbed timelines that reverse on scrolling up and are left intact.

## Tests and verification

- Functional suite: 4/4 passed.
- Browser viewports: 320, 375, 390, 430, 768, 1024, 1440, 1920: passed, no JS errors or page horizontal overflow in the local renderer.
- Motion QA: 390px and 1440px show masked images closing on reverse and reopening on forward; deterministic masks match exactly when invoked with identical progress.
- Hover QA: category and product photos return to unscaled state on mouseleave.
- Reduced-motion QA: masks are removed and native horizontal swipe retained.
- Theme Check: 0 errors, 36 existing warnings.
- Real-device Safari/Android and field Web Vitals remain unmeasured.

## Release scope

Only home-related motion CSS, the existing home/story scripts, and the theme asset include changed. No product catalog records, prices, inventories, checkout state, domain, or Shopify theme structure changed. Deploy to the verified live CHẠM — Main theme ID 191052087538, without creating a second theme.

## Rollback

Theme copies before this change are saved under `.backup/cham13-live-before-motion/`, and a prior Git archive exists at `.backup/cham12-before-hover-reversible.zip`.
