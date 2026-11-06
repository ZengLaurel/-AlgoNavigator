# src/components/game/StairwayRepairRoom.test.tsx

## Scenarios covered

- Step-by-step constructor and three push explanations distinguish numeric values
  from glyph patterns. Separate pop/peek examples explain returned values and
  unchanged peek, with an empty-stack warning and no editor changes.
- The target pattern and starting scene (resting guide, closed gate) render
  on mount.
- A run whose final state matches the target pattern reveals the reward:
  celebrating guide, open door, status region.
- A run whose final state does not match the target leaves the scene
  unchanged and shows no reward.
- A run that errors shows the thinking pose and the error message, without
  touching door/stairs state.
- Continue to Forked Path appears only after success and invokes onComplete only on explicit click.
- Replay clears the reward, relocks the scene, resets hints, and returns the
  stack label to not run yet.
- Visible target tokens identify `base → moon → star` bottom to top; instructions
  explain provided MyStack, push arguments, and fresh whole-program reruns.
- Three cumulative, deterministic hints progress from missing glyphs through
  push order/arguments to exact missing lines. Revealing hints neither changes
  editor content nor runs Python; the button is disabled after the third hint.
- Missing-stone, wrong-glyph, extra-stone, empty-stack, and null-result feedback
  does not unlock the gate.
- Both loading and running label retained stones as the previous result, disable
  Run, and hide stale feedback and Python errors.

## Why this test exists

This room is the first place a student's own Python code determines a game
outcome (Phase 5). If the match/no-match/error branches were confused, a
student could see a false reward for an incorrect stack, or silence instead
of a reward for a correct one. Tests inject a fake `run` via
`PyodideContext.Provider` (the same dependency-injection seam used
elsewhere in this codebase) instead of a real Worker, keeping the suite fast
and deterministic.

## Known gaps

- jsdom logs CodeMirror's Range.getClientRects limitation; assertions pass.
  Actual editor input and real Pyodide execution were separately verified in
  installed headless Chrome over CDP (no browser dependency installed).
- The browser check navigated through Trial of Stones, ran the untouched starter
  to `Python is ready.` with Missing 2 stones feedback and Run re-enabled,
  revealed all hints without modifying code, typed the two missing push calls
  into CodeMirror, and reran to exact-match feedback, an open door, and the
  completion reward. A screenshot was captured and inspected; browser exception
  and error-log collection was empty. Persistent running did not reproduce.
- Busy-state labels/stale-message suppression are unit-tested for loading and
  running; the browser flow did not deliberately hold execution to capture these
  transient states. Animation timing and cross-browser/mobile layout were not
  exhaustively tested.
- Does not test `GameStage`'s decision to mount this room only after Trial
  of Stones completes; that is covered by `docs/bug-reports/GameStage.md`.
- Since real art replaced placeholder SVGs, sprite/door assertions query by
  `alt` text (real `<img>`) with a fallback to `aria-label` (placeholder
  `<svg role="img">`), via the `findByAccName` helper in this file.

## Status

Last verified: 2026-11-06 — 14/14 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
