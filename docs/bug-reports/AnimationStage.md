# src/components/AnimationStage.test.tsx

## Scenarios covered

- **Initial state**: the stage starts on the empty "Starting point" frame,
  with the "Step back" button disabled (nowhere to go back to).
- **Full forward playback**: clicking "Step forward" 6 times (once per
  scripted operation in `stackAnimationSteps`) reaches the exact expected
  frame content at every step — `5` → `5,8` → `5,8,3` → `5,8,3` (peek,
  unchanged) → `5,8` → `5` — and the matching caption text appears at the
  final step. "Step forward" becomes disabled once the last frame is
  reached.
- **Step back**: after stepping forward twice, stepping back once returns
  to the exact previous frame's content.
- **Play / auto-stop**: clicking "Play" (with fake timers) advances
  through every frame automatically and the control flips back to "Play"
  (not stuck showing "Pause") once the sequence ends, and is disabled
  there (nothing left to play).

This file intentionally uses a trivial `render` prop
(`state => <div>{...joined values...}</div>`) instead of `StackRenderer`,
so it tests `AnimationStage`'s own stepping/playback logic in isolation
from Stack-specific SVG rendering and Framer Motion.

## Why this test exists

Before this file existed, `AnimationStage`'s frame-sequencing and
play/pause/step button logic were only verified by a human watching the
Stack lesson in a browser. That's exactly the kind of coverage gap the
user asked to close: a future change to the frame index math, the
disabled-state conditions, or the play/pause effect could silently break
the Phase 1 exit criterion ("working playback controls") with `npm run
build`/`lint`/`test` still green.

The "Play / auto-stop" case specifically guards a real bug fixed during
Phase 1: an earlier version called `setIsPlaying(false)` synchronously in
the effect body when `atEnd` was true, which ESLint's
`react-hooks/set-state-in-effect` rule flagged. The fix moved that
decision inside the `setTimeout` callback instead. This test exercises
the actual runtime behavior (reaching the end during an active "Play"
auto-stops it) that fix needs to preserve, not just the lint rule.

## Known gaps

- Does not test clicking "Pause" mid-playback to manually stop before
  reaching the end (only covers auto-stop at completion).
- Does not test the speed `<select>` actually changing playback timing
  (only that the control exists is covered transitively in the Play test
  via the default 1x speed). Changing speed and asserting the interval
  duration shifted is deferred — low risk, same code path as the tested
  default speed.
- Does not cover `StackRenderer`'s actual SVG output — see
  `StackRenderer.md`.

## Status

Last verified: 2026-10-30 — 4/4 passing (`npm test`)
