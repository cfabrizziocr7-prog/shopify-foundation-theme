# Measurement and release workflow
Implementation update2026-09-19: `import-metrics.cjs` validates actual observations and writes the private live ledger, preserving the existing twelve-row public seed. `report.cjs` prefers that private ledger when present. `iterate.cjs` exposes baseline-driven funnel hypotheses with explicit sample floors; no winner or causal inference. No real Sloane social posts or attributed results exist yet. See docs/CONTENT-ENGINE.md for schema and limitations.


Shopify is the source for sessions, product/checkout funnel, orders and revenue. Metricool is the source for platform reach/retention when provided. Keep platform attribution and Shopify attribution separate; use matching date ranges, currency and attribution windows before comparing.

experiments.json contains 12 unrun concept/platform rows. Unavailable numbers are null, not zero. report.cjs produces ratios and UTM URLs in ignored analytics/private/report.json. Use decimal rates (0.01 = 1%). Do not combine click-based conversion with session-based conversion.

Record date, spend, impressions, clicks, conversions, revenue, platform post/ad IDs, source/export date and attribution window. Preserve raw exports in analytics/private. Refund-adjusted contribution requires actual supplier shipping, processing fees and refund data; the historical $13.29 supplier cost alone is not a break-even CPA.

The initial September18 Shopify read shows insufficient traffic for a performance judgment. Preview testing may be excluded or delayed by analytics. No conclusion about demand, product failure or creative winners is justified.

Diagnosis: weak early retention suggests hook/framing; good retention but few qualified clicks suggests message/CTA; clicks without usable sessions suggests destination/loading/traffic; product views without carts suggests offer/fit/page; carts without checkout/purchase suggests shipping, payment or trust. Treat these as hypotheses and inspect technical issues before changing the product.

Launch one controlled comparison at a time with the same audience, placement, offer and spend conditions. Define budget cap and review window before paid launch. Do not automatically scale from an isolated conversion or a text hook score. Reconcile refunds and contribution before approving higher spend.

Metricool account found: existing unrelated accounts; explicitly DO_NOT_USE_FOR_SLOANE. social/calendar.json stays local, undated, unpublished and unapproved. Connect and verify new Sloane destinations first. Approval of a draft is separate from spending approval.
