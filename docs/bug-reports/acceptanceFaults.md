# api/testing/acceptanceFaults.test.ts

## Scenarios covered

Makes explicit fault injection deterministic, local, optional and visibly incompatible when the Worker factory changes.

## Latest results

2026-11-12: all cases passed; full 340/340. [Case inputs, expectations, actual results and durations](../RESILIENCE-TEST-CASES.md).

## Known gaps

These are contract/component tests. Real browser fault/retry and Escape-Tab checks are separate in [RESILIENCE-ACCEPTANCE.md](../RESILIENCE-ACCEPTANCE.md). They do not certify every screen reader, OS motion preference or school device.
