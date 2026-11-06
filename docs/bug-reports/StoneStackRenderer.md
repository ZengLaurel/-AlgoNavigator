# src/components/game/StoneStackRenderer.test.tsx

## Scenarios covered

- Bottom-to-top element order and matching glyph artwork/accessible descriptions.
- Stones preserve the specified 2:1 aspect ratio; peek highlights without removal.
- Empty stacks have an explicit label and no top pointer.
- A popped stone disappears after the real Framer Motion exit transition.

## Why this test exists

The themed renderer must preserve Stack semantics while replacing numeric
rectangles with stone artwork. Tests catch missing glyphs, stale popped
stones, distorted dimensions, and misleading top markers.

## Known gaps

- Spring appearance and visual composition require browser inspection.
- Unlike the old renderer tests, these tests use real Framer Motion and wait
  for exit completion rather than mocking the animation layer.
- Since real art replaced the placeholder SVGs (`src/assets/index.ts`), the
  2:1/highlight test asserts on `<image>` dimensions and a `data-highlighted`
  flag rather than `<rect>` fill colors — the highlight itself is now drawn
  as a glow outline around the image, not a recolor.

## Status

Last verified: 2026-11-06 — 4/4 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
