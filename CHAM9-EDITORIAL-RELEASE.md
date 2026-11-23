# CHẠM 9.0 — Editorial Hero & Horizontal Craft Narrative

## Scope
- Replace the retired dark WebGL hero with a light-paper typographic exhibition cover, artisan sketches, and original editorial copy, preserving real CTAs.
- Add licensed and credited documentary pencil studies, adapted from existing craft photos (Lê Tấn Lộc CC BY-SA 3.0 and Steven C. Price CC BY-SA 4.0). Source links remain in the documentary credits disclosure. No copied artwork from Nón Lá.
- Add self-hosted Vietnamese and Latin subsets of Cormorant Garamond Italic and Dancing Script via Google Fonts (Open Font License), leaving Be Vietnam Pro for readable body copy.
- Remove the entire redundant process introduction heading and its padding.
- Make six existing differently art-directed scenes participate in one horizontal storytelling experience on desktop AND mobile. The vertical page scroll drives the pinned horizontal track when viewport height is sufficient, with a native swipe fallback on shorter phones and for reduced motion.
- Adjust the GSAP pin start to the actual viewport top, remove dual smooth-scroll scheduling, and add pin anticipation / scrub damping to improve the entry transition. Keep header behavior, CTA, product catalog, policies and checkout untouched.

## QA and rollback
- Browser QA across 320, 375, 390, 430, 768, 1024, 1440 and 1920px; verify both entering and reversing the pin.
- Test no-JS and reduced-motion swipe fallback, no horizontal document overflow, font and illustration asset availability, 6 panels and shopping flow.
- Backup the live Shopify theme locally before updating; save main Git commit, update exactly theme 191052087538 (CHẠM — Main), then pull back changed files for byte-level verification.
- Storefront password protection remains unchanged. Real iOS Safari, low-end GPU and Core Web Vitals must still be checked on physical devices.

## Art direction
Natural warm paper and near-black ink, documentary pencil sketches from authentic licensed craft photographs, spacious editorial typography. Motion is purposeful: vertically advancing the story slides images horizontally, preserving the visitor’s scroll direction.
