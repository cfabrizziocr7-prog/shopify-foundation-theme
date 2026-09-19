# Sloane content engine

The safe local production path is implemented; external generation and public distribution remain approval-controlled. No daemon, watcher, automatic spend or background publisher was added.

## Dependency map and verified state

Shopify product8719390048441 → existing `creative/sloane-concepts.json` → manual generation work orders → downloaded local clips → FFmpeg normalization → existing Remotion4.0.484 runtime → technical QA → manual fidelity review → correct social identity + launch check → local publishing draft → future approved Metricool submission → real exports → existing experiment ledger → iteration hypotheses.

Fresh audit2026-09-19: product active, four variants at54.99USD; imagery retained. No price in the three initial exports. Published theme162384838841 remains MAIN, redesigned162403156153 remains UNPUBLISHED, neither processing nor failed. Draft PR#1 open/unmerged. Local and API-created Git histories differed only in line endings; a merge preserved both histories and unchanged local files before new work. No theme files changed during engine implementation.

Connected capabilities: Shopify product/analytics, GitHub, Metricool reads/scheduling tools, official Higgsfield model/generation tools. Only read operations used. Wrong Metricool destinations blocked. Official Higgsfield MCP does not currently report Unlimited entitlement. Open Higgsfield reviewed/deferred. No new provider package or heavy local model installed.

## Sources of truth

- `creative/sloane-concepts.json`: six existing concepts extended in place. `creative_id` equals existing `id`; SL001,SL003,SL004 generation-ready; other drafts retained. State is the **planning baseline**, not a mutable claim about all rendered revisions.
- `video/out/SLnnn-vN/state.json`: immutable per-edit execution state after local finishing, initially QA_PENDING. `qa-passed.json` written only after manual review passes. New edit version required for rerenders; no prior output overwritten.
- `analytics/experiments.json`: original twelve unrun experiment rows, extended with metrics fields and references. No fabricated data. Actual measurements live in ignored `analytics/private/experiments.json`, initialized from the same seed, not a competing schema. `report.cjs` prefers the private ledger when present.
- `social/destinations.json`: public fail-closed template with no account identities. `social/private/destinations.json`: ignored exact denylist, empty allowlist and publishing disabled. Missing private policy prevents all publishing readiness.
- `generation/jobs`: ignored local work orders and receipts; `generation/outputs` reserved/ignored. Prompts stay in the creative manifest; no duplicate prompt database.

## Commands (repository root)

```powershell
node --test automation/report.test.cjs automation/engine.test.cjs
node automation/engine.cjs status
node automation/engine.cjs prepare SL001
# After actual downloaded clips exist, copy/edit ingestion.example.json locally:
node automation/engine.cjs finish SL001 path/to/ingestion.json 1
# Review the full video and references; complete the generated manual-review.json honestly:
node automation/engine.cjs review SL001-v1
# Only after a correct destination has been verified/approved in policy:
node automation/engine.cjs draft SL001-v1 path/to/context.json
node automation/import-metrics.cjs path/to/actual-observations.json
node automation/report.cjs
node automation/iterate.cjs analytics/private/experiments.json
```

`prepare` creates manual jobs only. It never clicks Generate, verifies a subscription or spends credits. Use official Higgsfield website for manual production; inspect model-specific image-to-video and reference support, approve stills first, then record actual generation model/cost/rights. Unknown cost remains null. `downloadAsset` on the manual/local provider imports an already-downloaded file and records its SHA256; it deliberately performs no remote download. `LOCAL` does not mean local AI inference. API_APPROVAL_REQUIRED is a fail-closed extension point: even an approval flag cannot call an unimplemented API adapter.

`finish` validates shot completeness, source duration and provenance, pads/trims each local clip to1080x1920/30fps, strips source audio for the initial silent edit, renders editable hook/product/CTA/captions/optional verified price, runs full decode plus metadata/audio checks, extracts one-second and transition-boundary frames and writes QA_PENDING. It preserves originals. Remotion resolves the already-installed runtime through `video/node_modules`; no package install. On failure, partial output remains for diagnosis; select a new edit version after fixing the cause.

The new composition is `video/remotion/creative.tsx` (`SloaneCreative`); original `index.tsx` (`SloaneAd`) remains unchanged. Captions are editable timed text, initially editorial overlays, not a claimed transcription. Voiceover mixing is deliberately not implemented; the first workflow is silent. Optional price needs a fresh (<24h) Shopify snapshot matching product, variant, amount and currency. Do not invent a snapshot; refresh again before publication. No price claim in initial packages avoids stale pricing.

## QA and state gates

IDEA → RESEARCHED → SCRIPTED → SHOT_PLANNED → GENERATION_READY (or GENERATION_PENDING_APPROVAL) → GENERATED → EDITED → QA_PENDING → QA_PASSED → READY_TO_SCHEDULE → SCHEDULED → PUBLISHED → MEASURING → ITERATE/ARCHIVED.

`workflow.cjs` rejects skipped edges, absent/hash-mismatched sources, missing export, failed technical/content checks, missing human review, blocked/unapproved destinations, absent launch check and missing action-specific approval/receipt. Scheduling adapter is disabled. SCHEDULED/PUBLISHED describe future verified external receipts, not a queued local file. Approval records are operator evidence pointing to actual user authorization, not cryptographic authorization tokens; never create one without that authorization.

Automatic: exact dimensions/fps/codec/pixel format/container/duration, full FFmpeg decode, audio intent/peak-level flags, source presence/windows, layout text budgets, hook/CTA data and price snapshot match. Manual: final visual readability, pixel clipping, product visibility/identity, gray tone/collar/zip/hem/panels/stitching, morphing, rights and platform overlays. No image identity classifier or OCR is installed. Technical success does not imply product fidelity. Hashes bind review to the exact export and reject stale reviews after file changes.

`context.json` for a local draft contains `destination` (provider,brand_id,platform,account) and `store_launch_verified:true` only after actual review. No policy override accepted by the CLI. The draft still carries no schedule time or publish approval. A future public adapter needs a separately reviewed credential path, idempotency, exact time/caption approval, receipt checks and platform-specific settings.

## Measurement / iteration

Import explicit normalized observations keyed by creative_id,platform,edit_version,platform_post_id,source,observed_at,attribution_window. Add only actual numeric metrics; unknown remains null. Cumulative snapshots replace earlier values, never add duplicate totals. Reject stale snapshots, unknown IDs, negative values and mixed post IDs. Additional posts/edits need separate experiment rows before ingestion. Raw observations and live ledger are gitignored.

`diagnose(row,baseline)` compares only the same platform/window with provenance. Operational sample floors (500 starts,1000 impressions,100 sessions,30 carts/checkouts) and a20% relative difference are **review heuristics, not statistical significance**. It returns hypotheses and one suggested variable; never automatically launches or scales a winner. CLI without a baseline reports insufficient data/need for a comparable baseline. Profile-link ambiguity, attribution differences and small samples remain explicit.

## External gates

Supply approved source clips (or separately authorize a paid model/budget), connect correct Sloane social accounts, finish merchant launch checks, review final exports, then separately approve exact posting details. Once clips are present, the `finish` command automatically normalizes/renders/checks them and stops for manual review. Merely connecting accounts does not start any automation.
