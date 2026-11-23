# CHẠM — Fix discontinuous vertical scroll at horizontal-story boundary

## Symptom
Users reported a sudden jump in vertical page position (e.g. 2660px to 2700px) at the hand-off between normal vertical scrolling and the horizontally translating craft gallery. The quoted positions were illustrative; actual boundaries depend on viewport and content.

## Root-cause risk found in source
The previous implementation combined CSS `position: sticky` with a GSAP ScrollTrigger, including `onRefresh` writes to the storytelling section height on mobile. Desktop still used `pin: true`, introducing a fixed-position/pin-spacer transition precisely at the boundary. Refresh/reflow and a pin-state change could disrupt scroll continuity. This was a source-level diagnosis, not proof of the exact jump on the user's device.

## Change
- One native sticky scene on mobile, tablet and desktop.
- No ScrollTrigger-driven `pin`, `scrub` or `onRefresh` for the horizontal storytelling track.
- Read the section's position from the browser's natural scroll; translate the track horizontally by exactly the equivalent distance, bounded from 0 to the full track length.
- Compute section height once at initialization, and again only when actual viewport width changes (or desktop window dimensions change), never on scroll.
- Preserve the six photo chapters, all typography/content, catalog, checkout and legacy reduced-motion/native-swipe fallback.
- Preserve other desktop scroll animations outside the horizontal storytelling section.

## Verification
- Synthetic mouse-wheel steps of 18px through the boundary and back: 375px, 390px, 430px, 1024px and 1440px passed without an unexpected scrollY step or changing section height.
- Eight viewport geometry/visual checks (320, 375, 390, 430, 768, 1024, 1440 and 1920px) plus reduced-motion and commercial flows.
- Four regression test suites covering shopping, page rendering and UI contracts.
- No physical iOS/Android test or field-performance measurement; these remain separately verifiable.

## Release scope
Existing GitHub main / F:\CHAM / Shopify live CHẠM — Main (theme ID 191052087538); no other themes or changes to payments, products or store policies.
