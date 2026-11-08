# src/assets/index.test.ts

## Scenarios covered

- All twenty-two logical sprite/map/reward keys resolve to descriptors with nonempty alt text.
- Image sources are null placeholders or nonempty paths, never empty strings.
- Every registered non-null image exists as a genuine PNG with dimensions matching
  `public/assets/export-manifest.json`, including the additional decorative keys.

## Why this test exists

The game must remain renderable before final artwork arrives, and must keep
every logical key wired once art lands. Missing keys or empty image URLs
would break placeholder rendering, and (since real art landed) a missing
key would mean a component silently falls back to placeholder art with no
signal.

## Known gaps

- Does not verify successful browser decoding, network response status, subject
  cropping, paired-state anchors, or visual quality; these require browser/art QA.
- Does not assert on the choice of real art vs. placeholder per key — only
  that the descriptor shape itself is valid either way.

## Status

Last verified: 2026-11-06 — 24/24 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
