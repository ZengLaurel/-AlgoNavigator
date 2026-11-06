# src/components/game/TrialOfStonesRoom.test.tsx

## Scenarios covered

- Child-friendly tower/top explanations introduce push, pop, and peek; all seven
  captions name the operation and describe its effect, including unchanged peek
  and the final empty stack.
- Initial guide pose, closed gate, and no premature completion.
- Seven forward steps complete the trial and reveal celebration and stairs.
- Reviewing a previous frame preserves completion; replay starts a fresh trial.
- Automatic playback completes and stops at the end.
- Pause prevents advancement, and 2x speed advances after 600 ms, not earlier.

## Why this test exists

The first room must teach LIFO through the actual playback sequence, not
award completion on initial render. These tests guard completion callback
wiring, persistent rewards during review, and resetting both controller and
room state on replay.

Since Phase 5, the room accepts an optional `onComplete` prop invoked only
by the completion panel's "Continue to Stairway Repair →" button — not
automatically when the scripted animation reaches its last frame — so a
student always sees the reward panel before the game advances them to the
next room. `GameStage.test.tsx` covers that hand-off; this file's existing
assertions (none of which reference the button or `onComplete`) are
unaffected by the addition.

## Known gaps

- No claims about student learning or visual animation quality follow from
  these component tests; learner observation and browser QA remain necessary.
- Room-switching behavior (the `onComplete` button) is covered by
  `docs/bug-reports/GameStage.md`, not here.
- Since real art replaced placeholder SVGs, sprite/door/stairs assertions
  query by `alt` text (real `<img>`) with a fallback to `aria-label`
  (placeholder `<svg role="img">`), so the test survives either rendering
  path — see the `findByAccName`/`queryByAccName` helpers in this file.

## Status

Last verified: 2026-11-06 — 5/5 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
