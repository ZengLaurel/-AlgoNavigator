# src/content/modules/queue.test.ts

## Scenarios covered

See the [Phase 14 case register](../QUEUE-TEST-CASES.md) for per-case input, expected behavior, actual result and timing. Source: [tests](../../src/content/modules/queue.test.ts). Latest actual run: 2026-11-12, all cases passed; full regression 308/308.

## Why this test exists

Guards against confusing FIFO with LIFO, enqueueing at the wrong end, treating peek as departure, accepting a final queue without service evidence, early awards and skipped explanation/transfer gates. Empty and single-element paths, interleaving, equal-valued identities and replay integrity are checked.

## Known gaps

UI tests use reduced motion and synthetic callbacks. The Python-room component test mocks execution; actual Pyodide is separately tested. Real Worker and browser/AI checks, limits and unmeasured student/device outcomes are recorded in [QUEUE-ACCEPTANCE.md](../QUEUE-ACCEPTANCE.md).
