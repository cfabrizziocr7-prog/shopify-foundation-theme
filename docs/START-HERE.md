# Sloane operating workspace

Theme source remains in shopify/. Production build: pnpm run webpack:build. Assets are built from the existing Theme Lab source; no new storefront dependency is required. The homepage/product/cart use Liquid and native forms; Vue remains limited to legacy pages.

- docs/PROJECT-AUDIT.md: completed, partial and pending work.
- docs/ACCEPTANCE.md: actual tests and remaining release gates.
- docs/VIDEO-KIT-AUDIT.md: ZIP inspection, selected integration and exclusions.
- creative/sloane-concepts.json: six concepts, scripts, shot lists and Higgsfield prompts.
- creative/PRODUCTION.md: generation-to-editing workflow.
- social/: hooks, heuristic review, scripts, captions and unapproved local calendar.
- video/remotion/index.tsx: reusable9:16 product ad using existing runtime.
- automation/media.cjs: local ffprobe/FFmpeg inspect, trim, QA.
- analytics/experiments.json: empty-measurement experiment ledger; report.cjs computes ratios/UTMs.

Draft theme editor: https://admin.shopify.com/store/4zregc-s0/themes/162403156153/editor

No automatic scheduler, spend loop, scraping service, external checkout or additional infrastructure installed. Shopify native analytics stays enabled through content_for_header. Private exports, credentials, generated videos and local dependency junctions are ignored by Git.

Run node --test automation/report.test.cjs for metric tests. media.cjs requires already-installed ffmpeg/ffprobe; optional FFMPEG_PATH/FFPROBE_PATH override executable locations. Review assets and publish permission before using any output externally.

Remaining external gates: approved generation/budget path for lifestyle footage; verified Zendrop fulfillment/cost/size measurements; confirmed returns/business launch details; Sloane social destination and publishing approval. No sales or winner claim until real campaign data exists.
