# src/engine/structures/stackLayout.test.ts

## Scenarios covered

- **Vertical ordering**: given a 3-element stack, the first element (index
  0, bottom of stack) gets a strictly larger `y` than the second, which
  gets a strictly larger `y` than the third (top of stack) — i.e. the
  stack visually grows upward, matching how a real stack of plates/books
  behaves.
- **Field passthrough**: `id`, `value`, and an explicit `highlighted: true`
  on an element all survive into the computed position object unchanged.
- **Default highlight**: an element with no `highlighted` field gets
  `highlighted: false` in the output, not `undefined` — the renderer reads
  this field directly to choose a fill color, so `undefined` would be a
  silent rendering bug (falls back to non-highlighted color by luck of
  truthiness, but any future `=== false` check would break).
- **Stable slot positions**: calling `computeStackLayout` with an explicit
  `slotCount` larger than the current element count produces the same `y`
  for the bottom slot regardless of how many elements are _currently_
  present. This is what keeps the stack from visually "jumping" every
  frame as `AnimationStage` steps through push/pop operations — each
  frame is computed with the same `slotCount` (the max depth across the
  whole animation), so slot 0's position never moves.

## Why this test exists

`computeStackLayout` is the one function that decides where every element
renders — if this is wrong, the Stack animation looks wrong (elements
overlap, stack grows downward, or elements jump between frames) but
`npm run build`/`npm run lint` would still pass silently. This test file
is the only thing that would catch a layout regression without a human
watching the animation in a browser (see
`docs/ROADMAP.md` Phase 1 exit criterion, which otherwise relies on manual
visual verification).

The "stable slot positions" case specifically guards against a bug class
introduced while building `AnimationStage`: early drafts called
`computeStackLayout(state)` with no `slotCount` argument, which defaults
to the _current_ element count — meaning the bottom element's position
would shift every time the stack's size changed between frames, causing
every element to visibly re-jump on every push/pop instead of just the
top element animating. `AnimationStage` now always passes a shared
`maxSlotCount` across all frames to avoid this.

## Known gaps

- Does not test the `StackRenderer` React component itself (SVG output,
  Framer Motion animation behavior) — only the pure layout math. Component
  rendering isn't covered by any automated test yet because `vitest.config.ts`
  runs in a Node environment, not jsdom (see `vite.config.ts`/
  `vitest.config.ts` split rationale). Adding jsdom + React Testing Library
  is deferred until a later phase actually needs component-level tests.
- Does not test horizontal (`x`) positioning beyond the fact that it's
  always `0` — acceptable since Stack is a single-column layout; will need
  revisiting when Array/Queue layouts (Phase 5) use `x`.

## Status

Last verified: 2026-10-30 — 4/4 passing (`npm test`)
