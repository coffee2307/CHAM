# CHẠM 8.0 — Art Direction & Release Contract

## Creative decision
The reference site Nón Lá demonstrates deliberate cinematic photo sequencing and spatial composition, not a repeatable three-image template. Our six chapters are intentionally authored as distinct visual scenes. We do not reuse the same image composition six times.

### Hero concept comparison
- Sculptural Craft (selected): a textured, hand-formed ceramic vessel, lit like a gallery sculpture and rendered in live Three.js. Selection reason: directly tied to Vietnamese pottery, strong depth, contained performance.
- Material Transformation (rejected): moving interlaced ribbons and particle ribbons risk repeating CHẠM 7's flat artificial weave; also expensive for mobile GPUs.
- Living Artifact (partially retained): documentary product image as a graceful static fallback when WebGL is unavailable, plus a subtle scroll-controlled material finish on the sculpture.

The main headline is “Từ đôi tay, thành hình.”, rather than a second oversized CHẠM wordmark. Header continues to carry the logo. 3D is limited to the first scene, pauses offscreen, and falls back to documentary imagery for reduced motion or unsupported GPUs.

## Six authored editorial scenes
1. Earth: small documentary vignette on warm paper / tall full-bleed craft photograph on the right; measured introduction.
2. Hands: strong close-up of an artisan left / craft narrative and a secondary workshop image right.
3. Precision: one large macro image and an offset, restrained note on a broad editorial canvas.
4. Surface: asymmetrical diptych with independent directional photo reveals and centered prose.
5. Fire: single full-bleed kiln photograph, dark restrained palette, large closing line.
6. Life: everyday ceramic photography and dynamic product thumbnail connected to the real collection.

All image credits are visible in the existing source-details disclosure below the story, with supplementary Wikimedia Commons CC BY-SA 4.0 attribution. No statement that the documentary photographs depict CHẠM's own production.

## Motion, mobile, technical constraints
- Desktop: existing GSAP pinned horizontal storytelling tracks six compositions. Reveal masks differ by image and follow scroll; no identical repeated layout.
- Mobile: vertical reading rhythm with chapter-specific compositions. Observe the chapter container rather than fully clipped images to avoid image-reveal deadlock; preserve no-JS images and reduced-motion fallback.
- Shopify: only existing CHẠM — Main theme, and main branch repository; do not modify products, prices, checkout, shipping, orders, policies or password protection.
- Bundled Three.js scene loads only on home, independent of remote CDNs. All other commerce features remain unchanged.

## Validation
Tests: Shopify Theme Check, repository functional suite, browser screenshot and scroll inspection at 320/390/430/768/1024/1440/1920, scene-by-scene visual comparison on 390 and 1440, reduced-motion static flow. Browser metrics are development viewport checks, **not** proof of real-user Core Web Vitals. LCP, CLS, INP production targets require independent measured evidence.

## Publication protocol
Publish only after tests; push the verified commit to GitHub main and the same code to the one live Shopify theme. Save a local backup of the previous main Shopify theme before uploading. Verify the actual remote assets with Shopify CLI pull. Keep Shopify storefront password and trial status unchanged.
