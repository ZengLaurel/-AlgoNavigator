# src/assets/index.test.ts

## Scenarios covered

- All fourteen logical sprite keys resolve to descriptors with nonempty alt text.
- Image sources are null placeholders or nonempty paths, never empty strings.

## Why this test exists

The game must remain renderable before final artwork arrives. Missing keys or
empty image URLs would break placeholder rendering and future artwork swaps.

## Known gaps

- Does not verify remote or file-based image availability; all current sources
  are null and render inline SVG placeholders.
- Background composition is CSS-based in this phase.

## Status

Last verified: 2026-11-06 — 15/15 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
