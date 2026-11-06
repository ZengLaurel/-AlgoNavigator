# src/components/game/TrialOfStonesRoom.test.tsx

## Scenarios covered

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

## Known gaps

- No claims about student learning or visual animation quality follow from
  these component tests; learner observation and browser QA remain necessary.
- Later rooms are explicitly unavailable rather than linked to empty pages.

## Status

Last verified: 2026-11-06 — 4/4 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
