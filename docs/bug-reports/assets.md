# src/assets/index.test.ts

## Scenarios covered

- All twenty-two logical sprite/map/reward keys resolve to descriptors with nonempty alt text.
- Image sources are null placeholders or nonempty paths, never empty strings.

## Why this test exists

The game must remain renderable before final artwork arrives, and must keep
every logical key wired once art lands. Missing keys or empty image URLs
would break placeholder rendering, and (since real art landed) a missing
key would mean a component silently falls back to placeholder art with no
signal.

## Known gaps

- Does not verify the referenced files actually exist on disk or load in a
  browser (e.g. a typo'd `/assets/...` path); covered by manual browser QA.
- Does not assert on the choice of real art vs. placeholder per key — only
  that the descriptor shape itself is valid either way.

## Status

Last verified: 2026-11-06 — 23/23 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
