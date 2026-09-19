# Acceptance results — 2026-09-18

## Content engine verification — 2026-09-19

- 19 node:test cases pass: previous metric math/UTM checks plus provider denial, identifier safety, local receipts, ledger joins, blocked destinations, illegal state edges, hash-bound QA, action/revision-specific approvals, fresh Shopify pricing preflight, caption/layout limits, metadata checks, sample-aware diagnosis and actual observation import.
- Complete local ingestion → four FFmpeg-normalized clips →15-second Remotion → final delivery export → QA run succeeded: SL003-v9002,1080x1920,30fps,H.264,yuv420p,MP4,intentionally no audio. Full decode passes; hook/CTA/timing preflight passes;21 frames sampled including transition boundaries. Contact sheet visually inspected; full human fidelity/rights/platform review remains pending.
- First smoke revision9001 was correctly held for yuvj420p. Added explicit final range/pixel-format conversion; revision9002 passes. Both outputs retained locally for audit, ignored by Git.
- Running engine.cjs review SL003-v9002 with unfilled human review correctly fails: Manual review absent or stale. No QA_PASSED/publish-ready claim.
- Twelve manual work orders created for SL001/SL003/SL004. They are AWAITING_MANUAL_GENERATION, not submitted API jobs. No generation credits spent.
- Fresh Shopify reads confirm original product pricing and unchanged theme roles. Existing PR remains draft. Wrong unrelated brand social destinations are blocked; no connector write to social or Shopify performed.
- No new AI video, social post, scheduler receipt, ad or measured sales result fabricated. Local smoke footage is made from existing Shopify stills, not generated lifestyle footage.

## Prior storefront and video acceptance

Theme: Sloane — Mobile Fashion Redesign, unpublished Shopify theme 162403156153.
- Production webpack build: pass.
- 14 changed Liquid/JSON files: Theme Check pass with cached Shopify schemas.
- Shopify upload: pass after fixing three inherited customer-order size comparisons.
- Mobile homepage and product: rendered in Shopify editor; visual review passed at editor mobile width.
- Desktop homepage: rendered and visually reviewed in standalone draft preview.
- Medium selected in mobile: variant49164054429881 reflected in URL and sticky bar.
- Sticky Add to Cart: native cart received Medium quantity1 at54.99.
- Main Add to Cart: standalone native cart received Small49164054397113 quantity1.
- Native Update bag: quantity2 correctly subtotal109.98.
- Checkout: native Shopify contact/address/payment screen loaded with Small quantity2 and109.98 subtotal. No address/payment submitted, no order placed. Shipping/tax charge calculation and completed payment remain untested.
- Standalone test cart cleaned. Editor's separate preview cart may still hold Medium test line; no real order exists.
- Gallery control renders; automated click occurred but source assertion was inconclusive due variant image update. Recheck final gallery selection before release.
- Contact destination, keyboard/screen-reader sweep and real-device performance still require final release review. Store launch/business settings and return terms need merchant completion.

Video: rendered original 12-second 1080x1920 30fps Remotion draft with actual front/detail/back images. One-second contact sheet visually reviewed: product silhouette consistent, text legible, no generated media. Silent intent; renderer includes audio track, so absence of audible sound must be checked separately. Not a lifestyle/UGC generation.
Media commands: ffprobe inspection passed;3-second trim passed; QA frame sampling passed. Metadata checks do not replace visual/audio review.
Analytics:5 node:test cases passed for missing data, zero denominators, arithmetic, invalid input and UTM encoding.

No live theme publication, social posting, ad launch or paid API generation performed.

Audio inspection: FFmpeg measured mean/max -91dB in the rendered track; the draft is effectively silent as intended. Out-of-range trim was correctly rejected before writing output.
