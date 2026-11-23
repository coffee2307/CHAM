# CHẠM Play 2.0 — Release notes

## Implementation
- Removed the dinosaur runner, sprite, scenery and obstacle references from the live Play section and its scripts/styles.
- Replaced with a natural-scroll mini-game hub: filters, wallet status, five separate playable games, and links to CHẠM Club.
- Five complete game modes: memory pairs, sourced craft quiz, matching materials, letter-search word puzzle, and timed quiz.
- Craft trivia reuses the existing six CHAMCraftKnowledge records; no unverified new artisan claims.
- CHAMDemo keeps browser-local demo points; only one 20-point game award per day. No real vouchers or payments.
- Existing craft photographs are reused. No new mascot, landscape, mountain, house or vegetation illustrations.
- Global design system unifies Be Vietnam Pro and hover/focus styles; one scroll handler reversibly updates sections on other pages.
- Homepage native sticky horizontal scroll is unchanged; no new pinning or page height mutation.

## Verification
- 8 viewport sizes between 320px and 1920px; five Play games passed end-to-end in Playwright.
- 5 games earn only one daily demo reward; point and session completion persist after reload.
- Shared scroll cues move forward and backward on About, Story, Club, Product and Collection at 390px and 1440px.
- Reduced motion verified; Chrome browser QA and Shopify Theme Check completed; 36 existing theme warnings.
- Physical iOS/Android gestures and field Core Web Vitals not yet measured.

## Scope and rollback
- Single existing repo coffee2307/CHAM, local F:/CHAM and live theme 191052087538.
- No product, checkout, inventory, price, payment, password or domain changes.
- Backup under F:/CHAM/.backup/before-cham-play-redesign/