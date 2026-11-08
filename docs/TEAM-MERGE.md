# Team integration — 2026-11-08

Source: https://github.com/1x1dontsleep/AlgoNavigator
Pinned revision: `581a1a6a021f8131de71561ff73835d1f58bfa0c` (main).
Integrated into the existing working tree; no upstream push or Git history
rewrite was performed. Pre-existing tracked edits are snapshotted in
`artifacts/pre-team-merge.patch` and the initial status in
`artifacts/pre-team-merge-status.txt`.

## Integrated features

- World adventure map, illustrated assets, four scroll/region buttons and
  locked-region dialog; hash routing to `/#/stack` and return-to-map link.
- Adventure progress/gem persistence in its original separate storage key.
- Expandable Adventure Skills Handbook and its Stack explanations.
- Upstream map/navigation tests, adapted to the current three-room game.

## Conflict decisions

- Retained the current three-room GameStage, real Python execution, local
  Codex Tutor, room-unlock persistence, asset index and mirrored sprite.
  Upstream's first-room-only shell and placeholder renderer were not restored.
- A module gem now means reaching Forked Path's exit, rather than finishing
  Trial of Stones. Rewards remain idempotent; existing stored team gems are
  preserved. First-room completion still unlocks Stairway Repair.
- Retained local dependencies, lockfile and server/launch configuration.
  Neither the map nor handbook adds dependencies.
- Fixed unused world-asset registry paths to Vite imports instead of missing
  `/picture/*` public URLs. Preserved the supplied map artwork and layout.
- Handbook uses normal document flow on narrow screens to keep room controls
  and the return-to-map link accessible; hover contrast is preserved.
- Archived source/checkouts under `artifacts/` are excluded from lint/tests,
  so upstream reference tests do not run as duplicate application tests.

## Verification

Build and lint passed; 190 tests passed after integration. Application tests
cover map entry/exit, locked regions, malformed progress, no gem after only
room 01, final-exit notification, reward deduplication/persistence and storage
failure fallback. Browser checks cover the supplied map artwork, locked dialog,
Stack entry, handbook expansion, existing room navigation and local Tutor.
No new school-hardware or real-student acceptance is claimed.
