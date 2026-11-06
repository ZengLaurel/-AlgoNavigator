# src/engine/path/pathState.test.ts

## Scenarios covered

- 100 deterministic seeds: connected bidirectional trees, one entrance/exit, branching halls, non-exit dead ends, no duplicate neighbors.
- Entrance protection, illegal moves, immutable push/pop, preserved visited history and child re-entry.
- Solve 20 generated maps by pure graph traversal; exit freezes both movement and backtracking.

## Why this test exists

A visited-only move restriction can permanently strand a player after backtracking. Tree construction and immutable state transitions must not regress or leak changes into prior snapshots.

## Known gaps

Malformed external graphs are outside the generator contract. Statistical randomness quality and browser animation are not tested here.

## Status

Last verified: 2026-11-06 — 3/3 passing (`npm test`).
