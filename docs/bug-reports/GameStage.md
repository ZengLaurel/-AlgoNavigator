# src/components/game/GameStage.test.tsx

## Scenarios covered

- On first render, room 01 (Trial of Stones) is active and room 02
  (Stairway Repair) is shown as locked, plain-text "Coming next".
- Completing Trial of Stones and clicking "Continue to Stairway Repair →"
  unlocks room 02's nav button, marks it current, and mounts
  `StairwayRepairRoom`.
- Switching back to room 01's nav button returns to Trial of Stones without
  relocking room 02; its nav button remains clickable afterward.

## Why this test exists

Phase 5 introduces the game's first room switcher. If `stairwayUnlocked`
state were lost on navigation, a student could be forced to replay Trial of
Stones to get back to an exercise they'd already reached. If `onComplete`
fired automatically instead of only via the explicit button (a bug caught
and fixed during this phase — see `docs/bug-reports/TrialOfStonesRoom.md`),
the room would switch before the student ever saw the reward panel.

## Known gaps

- Room 03 starts locked, unlocks via room 02 continuation and remains unlocked after returning to room 01.
- StairwayRepairRoom is mocked at its completion callback boundary; its actual success gating is covered by its own component suite. No real Python worker or browser full playthrough is exercised.

## Status

Last verified: 2026-11-06 — 4/4 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
