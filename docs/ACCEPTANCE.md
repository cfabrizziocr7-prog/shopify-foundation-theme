# Acceptance results — 2026-09-18

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
