# src/components/game/ArrayGame.test.tsx

## Scenarios covered

- Walk through all six predictions and operation frames. Python continuation remains locked until every answer and the last frame are reached.
- Camp Packing first rejects premature completion and full-capacity insertion, then allows grow/insert/remove/traverse and completion. No gem before the complete evidence.
- array-index teaches through demo get(0), rule/reason selection and fresh get(2). Mastered callback occurs only on the fresh-case result.
- Python wrong initial-state result never opens the next room. Closing a pending run invokes cancellation and cannot complete the room.

## Why this test exists

These component tests cover actual controls and room/teaching gates, independently of network availability. They catch premature progression, lost retry state and callbacks from stale Python tasks.

## Known gaps

Tests use reduced motion and a fake Pyodide context for the Python room. Real browser CodeMirror, Worker execution, all four activity walkthroughs, layout and model dialogue are recorded in ARRAY-ACCEPTANCE.md.

## Status

Case-by-case actual outcomes and durations are generated in [TEST-RESULTS.md](../TEST-RESULTS.md), not inferred from the Phase 11 baseline.

## Phase 12 verification

2026-11-11：新增 4 条页面测试；本批全量 271/271 通过。输入、步骤、预期、实际和耗时见 [数组用例记录](../ARRAY-TEST-CASES.md)，浏览器及在线模型证据见 [数组验收](../ARRAY-ACCEPTANCE.md)。

Phase 15 regression (2026-11-12): after the correct rule/reason, the component now asserts Xiao Tuo restates the rule while explicitly awaiting fresh verification. All 330 cases passed; no mastery is awarded at this intermediate gate.
