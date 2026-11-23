# CHẠM 11 — Mobile cleanup & native horizontal storytelling

## Scope of change

- Deleted unnecessary hero metadata, slash labels, duplicate prose, image captions, decorative arrow glyphs, and scroll prompts from the CHẠM home sections. Retained actual navigation links without arrow decorations.
- Unified all visible editorial/home typography on Be Vietnam Pro; removed unused handwriting/serif font-face declarations and the home-only Phudu font preload.
- Simplified the mobile cover to one original ceramic-artisan illustration, a single headline, a short description and a single product link. The second illustration remains for wider screens but loads lazily.
- Hid duplicated introductory photography and manifesto sections only on mobile. Desktop content and commercial sections remain unchanged.
- Fixed six mobile chapter layouts so imagery and text fit within each panel. Content no longer gets pushed outside the viewport by the old generic display:block rule.
- Mobile now uses CSS position:sticky with a dynamically measured parent height, rather than ScrollTrigger's pin/position switch. ScrollTrigger still controls horizontal translation, synchronized directly to native vertical scroll with no catch-up scrub. GSAP pin is retained for desktop, where it worked correctly.
- Disabled per-image clip/reveal and chapter text translations on mobile; only the horizontal track animates. Reduced motion and short screens keep native swipe.
- Removed an unused home-only Lenis script; the live store's checkout, collections, products, policies and password settings are untouched.

## Verification

- Eight synthetic viewport browser checks: 320, 375, 390, 430, 768, 1024, 1440, 1920px — passed.
- Mobile sticky checks: no pin-spacer or JS pin; position sticky; pin stays stationary through chapters. An 8px natural release at the final boundary in the synthetic body-margin environment is expected, not a screen jump.
- Scroll forward and reverse at 390px — passed.
- Browser resource/runtime errors and horizontal page overflow — none in the tested local renderer.
- Existing functional tests: 4 groups passed.
- Shopify Theme Check exit 0 with 36 legacy warnings, no errors.
- Live theme backup: F:\CHAM\.backup\shopify-main-before-cham11.zip.
- Physical iOS/Android inertial scrolling and real-user Core Web Vitals remain unmeasured.

## Release discipline

Keep one repository (coffee2307/CHAM), local directory F:\CHAM, and one existing live Shopify theme (CHẠM — Main, ID 191052087538). Publish only the scoped files; verify all live assets match the GitHub/local commit by SHA-256 after upload.
