# Integration decisions

- Instagram Agent Skill: selected hookscore.py and beats.py fully inspected. Standard library only, local file/stdin reads and stdout reports; no subprocess, network, environment credentials or install step. Vendored with MIT license. Scores are editing heuristics, never predictions of views or sales. Timing is an estimate; measured voice audio wins. Caption methodology adapted manually; platform limits must be verified when posting.
- Agency Agents: README/license reviewed (MIT). Use design, copy and QA review perspectives within the existing workflow. No agent installation or autonomous delegation needed. Deeper script audit deferred because none will execute.
- Google Skills: README/license/catalog reviewed. Current focus is Google products/cloud and ads. No unmet need justifies installation in this Shopify-native stack; revisit for a concrete Google integration.
- Composio: README/license reviewed (MIT). Adds sessions, credentials and toolkits; Shopify/GitHub/Metricool already connected. No integration or install justified. Full execution-path audit required before any future install.
- Automaton: README/license reviewed (MIT). Wallet provisioning and continuous autonomous execution conflict with this project's simple approval-controlled commerce workflow. Do not run installer or agent. Adopt only the general observe/act/measure cycle.
- Ever Gauzy: README/license reviewed (AGPLv3). ERP/HR/time tracking is later-stage infrastructure; do not deploy now. Full dependency and credential audit deferred until there is an actual need.
- OpenMontage: existing local project and Remotion composer found; reuse installed Remotion runtime without copying its AGPL application code or reinstalling its full system. New Sloane composition is original and separate. No provider API calls or agent daemon needed.
- AI Video Studio Kit: inspected supplied WORK.zip; selected methodology integrated with original local FFmpeg/Remotion tools. See VIDEO-KIT-AUDIT.md.
- Floot/Bolt: existing unrelated brand work is a separate business; no migration into this theme.
- UI library article/ECC guide: exact ECC attachment not located. Theme uses native CSS and Liquid; no additional storefront library required.

All six requested repository snapshots are in the parent workspace research/repos (read-only use; no third-party installer executed). README-level deferral is not a complete security audit of those codebases.

Local adaptation: hookscore weak-opener matching now uses word boundaries so 'Your' is not falsely penalized as 'yo'. Fashion hooks are reviewed for product specificity manually; no pressure to manufacture negative stakes for a higher score.
