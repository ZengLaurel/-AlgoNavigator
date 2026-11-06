# src/engine/path/pathLayout.test.ts

## Scenarios covered

- Deterministic finite coordinates within map bounds, no overlapping node centers, unique tree edges.
- Moving leaves the topology layout unchanged.

## Why this test exists

Exploration must not rearrange rooms or duplicate their connecting edges. Stable coordinates make stack backtracking spatially understandable.

## Known gaps

Does not measure rendered label bounds or visually inspect narrow screens. Layout accepts the generated tree contract, not arbitrary cyclic graphs.

## Status

Last verified: 2026-11-06 — 1/1 passing (`npm test`).
