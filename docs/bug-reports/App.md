# src/App.test.tsx

## Scenarios covered

- Rendering the real `<App />` (the actual top-level component shipped to
  users, not a stand-in) shows the "AlgoNavigator" and "Stack" headings,
  the initial "Starting point" caption, and a working "Step forward"
  button.

## Why this test exists

This is the automated stand-in for "open the browser at
`http://localhost:5173/` and confirm the Stack lesson loads" — the exact
manual check the user performed to confirm Phase 1 worked. Automating it
means a future regression in how `App.tsx` wires `AnimationStage`,
`StackRenderer`, and `stackAnimationSteps` together (e.g. a broken import,
a prop renamed in one place but not another) fails `npm test` immediately
instead of only showing up the next time someone happens to look at the
running app.

It complements `src/smoke.test.ts` (which only proves the Vitest pipeline
itself works) by proving the actual React render pipeline works end to
end.

## Known gaps

- Only checks that the lesson _renders_; does not click through the full
  push/pop/peek sequence from the App level (that interaction coverage
  lives in `AnimationStage.test.tsx`, which is cheaper to run since it
  skips SVG/Framer Motion rendering entirely).
- Will need a new assertion (or a second lesson-specific test file) once
  `App.tsx` grows a lesson router in Phase 5 and no longer always shows
  Stack by default.

## Status

Last verified: 2026-10-30 — 1/1 passing (`npm test`)
