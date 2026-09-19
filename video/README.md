# Sloane finishing template
New generated-clip entry: `video/remotion/creative.tsx` / `SloaneCreative`. `node automation/engine.cjs finish SL001 ingestion.json 1` runs the local clip pipeline and writes a hash-bound technical report plus pending manual review. It uses the same installed Remotion runtime. The original composition below remains available. See docs/CONTENT-ENGINE.md for prerequisites, provenance, optional live-verified pricing, silent audio intent and approval gates.

Original 12-second 1080x1920/30fps Remotion composition with four 3-second scenes. Uses existing Shopify product photos; no generated claims, fake customer, music licensing dependency or baked AI text. All text is rendered in editing. This is a product-detail draft, not lifestyle footage.

Runtime already installed at the existing OpenMontage project's remotion-composer/node_modules. Use its @remotion/cli with this entry and video/public as public-dir. Override props.scenes with four approved stills or local video clips (video:true). Keep source clips at least 3 seconds; inspect framing and garment fidelity before export. Do not copy the whole OpenMontage application.

Text safe region: left 80, right120, bottom320 pixels; platform overlays still require final preview. A shot list is not speech captions. For spoken clips, transcribe actual approved audio then align captions before final export.

No price is baked into the initial draft; Shopify remains pricing source of truth. No API credits are used.

Run node video/fetch-product-assets.cjs from the repository root to restore original photos from the fixed Shopify CDN references. Existing files are preserved; no credentials are used.
