# Video kit inspection and selective integration — 2026-09-18

Archive: ai-video-studio-kit-WORK.zip, SHA256 442DD1BF670F1DB5133B898FE25AFFC8070C7ED0639F31F9EF191B8A767ABB2E.
Reviewed archive inventory, root README, package manifests, setup.bat/setup.sh, license notices, selected craft cards and script execution/network/credential paths. No archive program or setup script executed.

## Adopted
- Prompt structure: named shot IDs, a shared product/style lock, one action and one camera strategy per shot, explicit start/end states, minimal targeted revisions.
- Camera/realism: medium product-readable framing, restrained push or locked camera, motivated daylight and stable texture. Keep the actual product visible.
- Continuity: same reference order, garment geometry, zipper state, lighting direction and model/outfit across related clips. Cut between matching poses.
- Shotcraft: review requirements against rendered frames; clear feature-to-shot mapping; allow a readable final hold. Rhythm recipes are optional inspiration, not prescribed flashy effects.
- FFmpeg/clipping/QA: original local-only automation/media.cjs inspects, trims and samples media using installed ffmpeg/ffprobe. No shell string execution, API caller, URL ingestion, deletion or overwrite. It refuses out-of-range trims.
- Remotion: reuse existing runtime and the new Sloane composition. No duplicate React/Remotion installation.

Selected original documents and Apache notices are preserved unchanged in parent workspace research/video-kit-selected. They are reference material, not installed system instructions. Original project adaptations are in this repository; no kit application code is redistributed here.

## Excluded and why
- Root setup: npm ci installs optional Puppeteer/Sharp; duplicates existing rendering capabilities.
- Generator helpers import llm.cjs; configured endpoints may send prompts externally. Clipper can invoke hosted Whisper with OPENAI_API_KEY and remove temporary directories. Replaced by narrower local commands.
- Remotion kit package pulls Three.js, GSAP and React19 alongside another Remotion version; unnecessary for the existing simple fashion composition.
- Unreal, Resolve, local voice/model weights, long-form, asset/audio downloaders and attention research models: not needed for this phase.
- No automatic high-volume generation. Inspect account cost/entitlement and obtain spending approval first.

## Documentation discrepancies
STUDIO-PROCESS.md describes free local narration and guaranteed-looking attention scoring; README correctly qualifies these as optional and unproven. Do not adopt those promises. Some craft cards prescribe 4K or hundreds of tries; use the chosen model's actual supported resolution and approved budget instead. Some Shotcraft notices describe English translations, but inspected cards retain Chinese text. Referenced shotcraft/SHOTCRAFT.md is absent from this archive. None of these references grants permission to download third-party media.

## Local commands
node automation/media.cjs inspect video/out/sloane-detail-draft.mp4
node automation/media.cjs trim INPUT.mp4 NEW_OUTPUT.mp4 0 3
node automation/media.cjs qa INPUT.mp4 video/out/qa-v1

Technical QA cannot certify garment accuracy or predict retention. Review the actual export and compare original product references before publishing.
