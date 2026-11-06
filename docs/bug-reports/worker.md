# src/engine/pyodide/worker.test.ts

## Scenarios covered

- Initialization loads Pyodide from local `/pyodide/` resources before sending a request-correlated ready response.
- Execution uses the initialized runtime and sends a request-correlated result.
- Startup failures produce init-error responses and allow another initialization attempt.
- Execution before initialization and rejected bridge execution return correlated error results.

## Why this test exists

The provider needs an explicit ready handshake to separate Python startup time from student-code execution time. Correlation prevents stale responses from settling another request, while distinct initialization errors permit clean recovery.

## Known gaps

- Pyodide loading and the execution bridge are mocked; these tests validate the worker protocol, not Python/WASM behavior or production bundling.
- Actual built module Worker and local runtime execution were checked in production Chrome; see [PyodideProvider](PyodideProvider.md) for evidence and limitations.

## Status

Last verified: 2026-11-06 — 3/3 passing (`npm test`); see [generated results](../TEST-RESULTS.md).
