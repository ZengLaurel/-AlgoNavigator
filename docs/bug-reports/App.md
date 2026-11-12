# src/App.test.tsx

**Team integration update (2026-11-08):** App now starts at the illustrated
world map. Tests cover four scroll regions, locked dialogs, hash routing,
direct Stack entry, return navigation, malformed saved progress, and no
module gem after finishing only room 01. Final-exit reward/storage tests
are in AppCompletion.test.tsx; the historical Phase 4 notes below predate
this map integration.

## Scenarios covered

- App opens Stack Ruins and Trial of Stones with playback controls.
- Tutor and Python execution UI are absent from the Phase 4 game entrypoint.
- The learner can complete all seven scripted steps and replay from App.

## Why this test exists

The game pivot changes the application entrypoint. This test ensures the new
room is wired into App and does not accidentally require API credentials or
Python initialization. It replaces obsolete lesson-card output assertions;
legacy engine and tutor tests remain in their respective suites.

## Known gaps

- No Python exercise is playable in Phase 4; Stairway Repair belongs to Phase 5.
- Browser layout and learning effectiveness are not proved by DOM assertions.

## Status

Last verified: 2026-11-06 — 2/2 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.

## Phase 12 verification

2026-11-11：新增数组地图入口无 Stack 前置回归；本批全量 271/271 通过。输入、步骤、预期、实际和耗时见 [数组用例记录](../ARRAY-TEST-CASES.md)，浏览器及在线模型证据见 [数组验收](../ARRAY-ACCEPTANCE.md)。

Phase 13 verification (2026-11-12): 288/288 total cases pass. Linked List map availability and real Python repair are covered; [17-case register](../LINKED-LIST-TEST-CASES.md) records inputs and actual results.

Phase 14 (2026-11-12): full 308/308 regression passed. New coverage verifies independent Queue map entry with later rooms locked and the real Python Harbor Dispatch sequence. Inputs, outcomes and timings are in [QUEUE-TEST-CASES.md](../QUEUE-TEST-CASES.md).

Phase 15 (2026-11-12): 330/330 full regression passed. Both Python bridges preserve line and blank-line boundaries; real module exceptions recover cleanly; all three module Worker timeout retries reject stale responses; Queue peek hints are specific in both languages; lazy module entry restores heading focus. See [joint cases](../FOUR-MODULE-TEST-CASES.md) and [bounded browser acceptance](../FOUR-MODULE-ACCEPTANCE.md).
