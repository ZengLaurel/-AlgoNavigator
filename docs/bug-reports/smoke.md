# src/smoke.test.ts

## Scenarios covered

- The Vitest pipeline itself runs end-to-end: test discovery, the
  `vitest.config.ts` setup, and a basic assertion (`1 + 1 === 2`) all
  resolve without error.

## Why this test exists

This isn't testing application logic — it's a canary for the test
_infrastructure_. If `npm test` ever reports zero tests found, hangs, or
fails for config reasons (bad `vitest.config.ts`, broken TypeScript
config, missing dependency), this is the file that should fail first and
make that obvious, rather than silently discovering 0 test files and
exiting with a false "0 passed" success.

## Known gaps

- Does not test any application code — intentionally. Real coverage lives
  in per-module test files (e.g. `stackLayout.md`).
- Will become redundant once there are other test files in the suite that
  reliably exercise the pipeline; kept for now since Phase 1 only added
  one other test file.

## Status

Last verified: 2026-10-30 — 1/1 passing (`npm test`)
