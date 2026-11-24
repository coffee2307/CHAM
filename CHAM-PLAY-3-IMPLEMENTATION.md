# CHẠM Play 3.0 — Implementation & Release

## Confirmed target
- Existing GitHub repository: coffee2307/CHAM (branch main)
- Existing local source: F:/CHAM
- Existing Shopify live theme: CHẠM — Main, ID 191052087538
- Shopify store: 5yvv8u-44.myshopify.com
- Keep current product data, inventory, checkout, policy, URL, password and commercial settings unchanged.

## Module architecture
| Path | Responsibilities |
| --- | --- |
| assets/cham-play-meta.js | Browser-local schema v3; persistent XP, ranks, stars, verified achievements, daily quests, streak, idempotent attempts and gift claim |
| assets/cham-play-packing.js | Four educational simulated pack orders and four protective packaging choices; no real order processing |
| assets/cham-play-wheel.js | Daily collectible craft-symbol reveal with deterministic symbol; no random monetary reward |
| assets/cham-play-expansion.js | Game introductions, difficulty selection, seven-game hub, mission dashboard, badge gallery, meta HUD, pack/wheel interaction and results |
| assets/cham-quest.js | Original five functional games plus memory 4/5/8 pairs, quiz short/classic/chain, speed 60/45/30s, crossword hints, score and combo |
| assets/cham-play-v3.css | Shared UI for dashboard, overlay, gameplay and responsive layout |
| assets/cham-play-thumb-pack.svg | Original handcrafted-style pack illustration |
| assets/cham-play-thumb-wheel.svg | Original craft-symbol wheel illustration |
| layout/theme.liquid | Conditional asset load for CHẠM Play only |
| sections/cham-demo-app.liquid | Asset URL map for 2 new SVG thumbnails |
| tests/cham-play-browser.test.cjs | End-to-end browser regression for seven games, daily wallet limit, persistent meta, responsive and graphics |

## Player state and reward safety
- CHAMPlayMeta uses localStorage schema v3 to track experience and cosmetic-only stars/badges; no sign-in, server-side leaderboard or real redemption.
- A claim is available after 2 of 4 daily missions are completed: play once, win twice, answer five questions correctly, play three unique games.
- Daily gift gives a deterministic craft collectible badge, **not a random prize**, with no real-world monetary value.
- CHAMDemo keeps its original once-daily +20 demo points game award, even if users win several games. New wheel does not give CHAMDemo points.
- No real shipping claims: packing descriptions are explicitly simulated educational scenarios, not CHẠM order handling policy.
- Game content comes from six existing cited craft records; no new unverified craft facts were invented.

## Verification
- Browser QA viewport widths: 320, 375, 390, 430, 768, 1024, 1440, 1920.
- All 7 mini experiences completed in end-to-end local tests; the 5 original games continue to function.
- Asset images lazy-load in production; browser QA explicitly requests them to validate all 7 SVG thumbnails, without disabling production lazy loading.
- Browser state persists on reload; seven completions and once-daily CHAMDemo award validated.
- Shopify Theme Check: exit 0; 36 pre-existing warnings.
- Functional Node suite: 4 groups pass.
- Shared reversible scrolling on About, Story, Club, Product and Collection: QA confirms forward/backward on 390 and 1440 pixels.
- Browser tests are simulations; physical iOS/Android touch behavior and real-user Core Web Vitals remain unmeasured.

## Backup and release discipline
- Before editing, a Git source archive and a copy of current live theme's relevant assets were saved at F:/CHAM/.backup/before-cham-play-3/.
- Only update the existing main GitHub branch and the existing live theme. Do not create new themes or repos.
- Confirm Shopify live assets by SHA-256 after pull; Shopify may automatically insert a header comment in JSON templates, so treat JSON semantic equality separately.
