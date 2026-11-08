# src/engine/gameProgress.test.ts

## Scenarios covered

- Round-trips each supported ordered unlock level (1, 2, 3).
- Defaults to Trial-only progress for missing, malformed, non-object, unsupported-version, incorrectly typed, out-of-range, fractional, or extra-field data.
- Handles denied storage access and quota failures without throwing.

## Why this test exists

Game navigation must survive reloads without trusting arbitrary stored JSON or
requiring localStorage to be available. Only the exact version-1 unlock envelope
is accepted; student code and other extra fields must not enter saved progress.

## Known gaps

- Monotonic replay and reload-to-Trial routing are covered separately by
  `src/components/game/GameStage.test.tsx`.
- Storage failures use injected storage doubles, not browser permission settings.
- Real browser persistence and Python recovery are checked separately by
  `scripts/game-browser-check.mjs`; there is no cross-device synchronization.

## Status

Last verified: 2026-11-06 — 19/19 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
