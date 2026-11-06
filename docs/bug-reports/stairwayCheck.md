# src/engine/structures/stairwayCheck.test.ts

## Scenarios covered

- Exact match: glyphs equal the target, bottom to top.
- Wrong order: right glyphs, wrong positions.
- Extra stone: stack longer than the target.
- Missing stone: stack shorter than the target.
- Wrong glyph: one position differs from the target.
- Missing run: a `null` final state never counts as a match.
- Missing glyph defaults to base in both the unchanged checker and feedback.
- Feedback describes one/two missing stones only when the existing prefix is
  correct; the first wrong position takes priority even for short/long stacks.
- Extra-stone feedback suggests removing extra pushes or one `stack.pop()` per
  extra stone.
- Empty-stack feedback differs from null-result feedback. Empty target/empty
  stack remains a match; null never is.

`getStairwayFeedback` is a pure teaching helper alongside the checker, not a
replacement success authority. No grading semantics or AI integration changed.

## Why this test exists

Stairway Repair's win condition is a deterministic, hand-authored check
(SPEC §1's MVP decision to avoid AI grading), not a fuzzy or partial-credit
comparison. If `checkStairwayRepair` drifted to accept out-of-order or
partial matches, students could "complete" the room without reproducing the
target pattern, undermining the room's teaching goal.

## Known gaps

- Does not test the UI wiring that calls this function with Pyodide's
  `finalState`; that is covered by `docs/bug-reports/StairwayRepairRoom.md`.

## Status

Last verified: 2026-11-06 — 14/14 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
