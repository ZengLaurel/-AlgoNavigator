# src/engine/pyodide/PyodideProvider.test.tsx

## Scenarios covered

- A successful Worker result resolves the pending `run()` promise and
  returns the provider to `ready` status.
- A non-responsive Worker is terminated after the execution timeout,
  replaced with a fresh Worker, and the provider reports an `error` status
  rather than leaving the run hanging forever.

## Why this test exists

A student's infinite loop must not freeze the page or require a full reload.
The timeout/recovery path is a reliability and safety boundary, not merely a
visual detail. The mock Worker lets the test force both a normal response and
a hang deterministically, proving the provider handles each branch without
needing a real browser Worker in CI.

## Known gaps

- Uses a fake Worker, so it does not prove browser-specific Worker module
  loading or Pyodide WASM initialization. Those require manual browser QA.
- Does not measure the real school-device five-second performance target.
- Does not test multiple simultaneous `run()` calls; the MVP allows one
  active exercise run at a time.

## Status

Last verified: 2026-10-30 — pending final Phase 2 verification (`npm test`)
