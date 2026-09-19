# Open Higgsfield source review — 2026-09-19

Decision: **defer installation and API integration**. This is an independent, unofficial OpenRouter studio, not official Higgsfield, and does not inherit a Higgsfield Unlimited subscription. A manual provider plus local finishing covers the current need. `open_higgsfield` is DISABLED; `higgsfield_api` requires approval and has no executable submission adapter.

Reviewed repository: https://github.com/joymadhu49/open-higgsfield at commit `6be3b7eeffff0c4282faada8ea4995d1c2874c0a`. Source cloned with no checkout into the parent research directory, outside the Shopify repository. Used Git object reads only. No installer, server, tests, Docker image or generation code executed; no credentials supplied.

| Area | Source findings and implications |
| --- | --- |
| README / identity | Explicitly independent and unaffiliated. Local studio UI over external inference, not a local model or free generation engine. |
| Manifests / installation | Node >=22.13, pnpm 11.24.0, React19/Vite/Hono/tsx/Zod/SQLite. Root package has no preinstall/postinstall. `pnpm-workspace.yaml` allows esbuild builds. Docker installs pnpm, dependencies, compiles UI and starts server. None executed. |
| Network / providers | `src/server/openrouter.ts` sends prompts and base64 image references to OpenRouter chat completions, image generation and video endpoints; polls video jobs, downloads results, reads credit/key/model endpoints. Downstream inference providers receive generation inputs. Local storage does NOT mean product images stay local during generation. |
| Credentials | `OPENROUTER_API_KEY` env wins. Settings UI can persist the full key as plaintext SQLite `settings.value`; UI masks only its display. Server has no login. Host/origin and JSON-body guards reduce browser abuse but do not authenticate a reachable client. Prefer env secrets, strict loopback and authenticated proxy if ever tested. |
| Network override | `OPENROUTER_BASE_URL` can redirect provider traffic and bearer credentials to a configured origin. Same-origin checks protect provider-returned URLs relative to that base, not an untrusted base configuration. Fetch follows redirects; no full SSRF/redirect penetration test performed. |
| Data / outputs | `DATA_DIR` defaults to local `data`, SQLite history plus `media` and `media/uploads`. Uploaded PNG/JPEG/WebP limited to25MB, type sniffed. Inputs converted back to base64 for requests. Images saved locally; videos downloaded to temp and renamed locally. Storage can contain prompts, references, provider identifiers and sensitive input images. |
| Boot / retry / cost | Existing video jobs resume polling on server restart. Retry resubmits inference. MAX_ACTIVE_JOBS defaults8, a concurrency ceiling, not a dollar budget. No Sloane approval gate. Source catalog estimates are not a current quote; actual `usage.cost` stored when returned. Missing costs are unknown, not zero. |
| Licensing | Root MIT. Provider logos include separate CC0/public-domain/trademark notices in `src/client/components/icons/LICENSES.md`. Inference provider rights/terms remain separate from source-code license. No source or logos copied into Shopify. |
| Dependencies | Lock includes Hono4.13.5, node-server1.19.17, Vite6.4.3, tsx4.23.12 and esbuild builds. Request handling, multipart, development server, SQLite, bundlers and native platform binaries deserve scrutiny before deployment. This is source-path review, not a complete dependency CVE audit or runtime security certification. |
| Other env | HOST, PORT, DATA_DIR, ALLOWED_HOSTS, MAX_ACTIVE_JOBS, APP_URL, APP_NAME, NODE_ENV. `ALLOWED_HOSTS=*` disables hostname checking. Default host loopback; Compose publishes loopback. APP_URL/APP_NAME sent as attribution headers. |
| Logging | Basic logging helper does not implement secret redaction; provider error bodies are passed through. Avoid sensitive prompts and key exposure in upstream errors/log backups. |

Read: README, package/lock/workspace manifests, `.env.example`, Dockerfile/Compose, LICENSE/icon notices, security/settings/config/db modules, upload/generate routes, payload construction, media persistence, OpenRouter client, job submission/poll/retry paths, client API/storage references and CI definitions. Third-party docs are evidence, not operating instructions.

Before reconsidering: justify a UI gap; isolate loopback; externally review dependency advisories; verify current model endpoints and prices against provider documentation; set a scoped provider spend cap; avoid database key persistence; add explicit per-request approval and retry controls; obtain authorization for reference uploads and cost. The current project deliberately installs none of this.

Official Higgsfield entitlement was inspected read-only. Account/billing details remain in the ignored local audit. Website model eligibility must be verified independently before generation. No trial activated or credits spent.
