# src/App.test.tsx

## Scenarios covered

- App opens Stack Ruins and Trial of Stones with playback controls.
- Tutor and Python execution UI are absent from the Phase 4 game entrypoint.
- The learner can complete all seven scripted steps and replay from App.

## Why this test exists

The game pivot changes the application entrypoint. This test ensures the new
room is wired into App and does not accidentally require API credentials or
Python initialization. It replaces obsolete lesson-card output assertions;
legacy engine and tutor tests remain in their respective suites.

## Known gaps

- No Python exercise is playable in Phase 4; Stairway Repair belongs to Phase 5.
- Browser layout and learning effectiveness are not proved by DOM assertions.

## Status

Last verified: 2026-11-06 — 2/2 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
