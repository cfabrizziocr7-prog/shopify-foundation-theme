# Correct Sloane destinations — required before publishing

Read-only Metricool inspection found only the existing, user-prohibited destinations. Exact brand/account identities are recorded in ignored social/private/destinations.json and automation/private/SOCIAL-CONNECTION.md. They are marked DO_NOT_USE_FOR_SLOANE. The public policy authorizes no destination; a fresh checkout also fails closed. No connection or social content was changed.

## Preferred: separate Sloane brand in Metricool

1. Create/select a separate Sloane Brand in Metricool, preserving unrelated brand. Each Brand holds one profile per network. If your current plan has no additional brand slot, choose a permitted separate account/plan yourself; this project does not upgrade or purchase anything.
2. Connect the actual Sloane **professional Instagram** (Business or Creator). Direct Instagram login supports publishing and basic metrics. Connecting through the linked Sloane Facebook Page provides fuller functionality; use an authorized profile with full control of that Page and appropriate Instagram permissions. Complete OAuth/login yourself; do not paste passwords/tokens into project files.
3. In that same Sloane Brand, choose Connect TikTok and authorize the actual Sloane TikTok (personal or business). Check the account shown in the consent window, particularly if unrelated brand is already logged in.
4. Make the new Brand visible to the connected Metricool integration. Ask the assistant to re-read brand settings and verify the exact Brand ID and both handles. Explicitly approve those identities before adding them to the allowlist. Connection approval is separate from scheduling/publishing approval.

Sources checked: [Metricool brand structure](https://help.metricool.com/getting-started-with-metricool-im4va), [Instagram connection](https://help.metricool.com/how-to-connect-instagram-to-metricool-sermi), [TikTok connection](https://help.metricool.com/how-to-connect-tiktok-to-metricool-0ea7e). Exact availability depends on the connected plan and granted permissions.

## Alternatives and decision

Official Meta publishing APIs are a fallback, but would add app setup, OAuth/token lifecycle and permission review. The official [Instagram publishing documentation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing/) was inaccessible through this research tool; no unverified scope or API payload is implemented.

Direct TikTok is a poor fit for a private internal upload utility: current [Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines) reject utilities limited to accounts a team manages. Unaudited clients have private-only restrictions and audited apps need compliant creator controls. Prefer Metricool's established integration rather than building around those restrictions.

Composio remains deferred: there is no verified unmet publishing gap that warrants another authorization/integration layer. No Composio publishing action was claimed or executed. No browser posting bot.

## Release checklist

- Hash-bound video QA and product-fidelity review pass.
- Correct identity freshly checked against allowlist/denylist.
- Product link and store launch readiness checked; no password wall for public campaign traffic.
- Commercial/AI disclosure, music rights, platform-specific metadata and profile-link route reviewed.
- Exact asset, caption, account, time and approval expiry presented to user for approval.
- Only then implement/use an official connector submission with idempotency and save returned scheduler/post IDs. Current engine writes **local drafts only**; it contains no network publisher.

UTMs exist per creative/platform, but a shared profile link cannot automatically attribute every organic post. Use a verifiable per-creative link route where available, or label commerce attribution shared/unknown. Do not infer sales attribution from a caption string.
