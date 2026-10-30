# src/components/StackRenderer.test.tsx

## Scenarios covered

- Given a `StructureState` with 3 elements, each element's value renders
  as its own text node (`5`, `8`, `3` all present).
- An element with `highlighted: true` gets a visually distinct `fill`
  attribute on its `<rect>` compared to a non-highlighted element's
  `<rect>` — i.e. the peek/highlight feature actually changes rendered
  output, not just internal state.

Framer Motion's `motion.g` and `AnimatePresence` are mocked to plain
passthrough elements for this file (see the comment block at the top of
the test file for the exact mock).

## Why this test exists

`computeStackLayout` (tested in `stackLayout.test.ts`) only proves the
_position math_ is correct — it says nothing about whether
`StackRenderer` actually turns that into the right SVG markup (right
values, right highlight styling). Before this file, that connection was
only checked by eye in the browser.

**Why Framer Motion is mocked here, deliberately:** `AnimatePresence`
keeps an exiting element mounted in the DOM until its exit animation
finishes. If a real pop operation were tested without mocking, the popped
element could still be present (mid-exit-animation) at assertion time,
making the test either flaky or dependent on advancing fake timers to
match Framer Motion's internal animation driver (which isn't a timer-based
API `vi.useFakeTimers()` can reliably control). Mocking the animation
layer out keeps this test fast and deterministic, at the cost of not
testing animation itself — see Known gaps.

## Known gaps

- **Animation timing/easing is NOT covered by this test, and is not
  planned to be.** Spring physics, enter/exit transitions, and visual
  smoothness are a manual check — already performed once in the browser
  for the Phase 1 push/pop/peek sequence. This is a deliberate, permanent
  scope boundary (see `docs/SPECIFICATION.md` §9), not a gap to be filled
  in later.
- Does not test `slotCount`-driven SVG sizing (`viewBox`/`height`)
  directly — only element content/styling.

## Status

Last verified: 2026-10-30 — 2/2 passing (`npm test`)
