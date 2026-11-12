# Phase 15 — Joint acceptance test cases

Date: 2026-11-12 (Asia/Shanghai). Actual regression: **330/330 cases, 46 files**. These 22 new cases extend the Phase 14 baseline of 308. Outcome/duration below are snapshots of the real [generated report](./TEST-RESULTS.md). Browser measurements and unmeasured gates are separate in [FOUR-MODULE-ACCEPTANCE.md](./FOUR-MODULE-ACCEPTANCE.md).

## JOINT-A01 — answers the queue peek concept specifically: Why does peek not remove a boat?

Input: English/Chinese question naming Queue peek, model classifies generic rule. Expected: reviewed reply specifically explains peek changes neither waiting queue nor departure history; no generic Stack contrast or raw prose.

Actual: ✅ passed, 1 ms. Source: [moduleTutor.test.ts](../api/tutor/moduleTutor.test.ts).

## JOINT-A02 — answers the queue peek concept specifically: 为什么 peek 只看队首？

Input: English/Chinese question naming Queue peek, model classifies generic rule. Expected: reviewed reply specifically explains peek changes neither waiting queue nor departure history; no generic Stack contrast or raw prose.

Actual: ✅ passed, 1 ms. Source: [moduleTutor.test.ts](../api/tutor/moduleTutor.test.ts).

## JOINT-A03 — four-module joint acceptance › array-index: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 6 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A04 — four-module joint acceptance › array-insert: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 2 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A05 — four-module joint acceptance › array-remove: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A06 — four-module joint acceptance › array-grow: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 2 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A07 — four-module joint acceptance › linked-list-follow: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 2 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A08 — four-module joint acceptance › linked-list-head: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 2 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A09 — four-module joint acceptance › linked-list-insert: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A10 — four-module joint acceptance › linked-list-remove: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A11 — four-module joint acceptance › queue-first: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A12 — four-module joint acceptance › queue-rear: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A13 — four-module joint acceptance › queue-peek: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A14 — four-module joint acceptance › queue-service: wrong rule, empty transfer, reset, replay and cross-task isolation

Input: the named activity’s correct demo; wrong rule with correct reason; correct explanation; empty then invalid fresh attempt; reset; correct independent transfer; mismatched task replay; normal replay. Expected: unknown operations ignored; wrong rule/empty/wrong transfer never learns; reset clears fresh evidence; correct fresh example learns; another exercise cannot overwrite this session; replay returns to intro.

Actual: ✅ passed, 1 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A15 — four-module joint acceptance › retains one gem per module through blocked writes and retry without cross-topic mastery

Input: storage writes throw; complete each of four modules twice; attempt cross-topic mastery; restore writes and retry. Expected: four in-memory gems, unavailable persistence disclosed, cross-topic mastery rejected, retry restores all four gems on a new store.

Actual: ✅ passed, 2 ms. Source: [fourModule.test.ts](../src/engine/modules/fourModule.test.ts).

## JOINT-A16 — preserves blank output lines for module and Stack programs

Input: real Pyodide prints first, an empty line, then third through Queue and Stack bridges. Expected: exact first\n\nthird\n in both outputs.

Actual: ✅ passed, 26 ms. Source: [moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts).

## JOINT-A17 — recovers a fresh array Python namespace after an exception

Input: actual Python defines leaked=42 then raises; next run asserts leaked is absent and prints recovered. Expected: friendly failure, clean namespace, recovered newline, empty operation history.

Actual: ✅ passed, 13 ms. Source: [moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts).

## JOINT-A18 — recovers a fresh linked-list Python namespace after an exception

Input: actual Python defines leaked=42 then raises; next run asserts leaked is absent and prints recovered. Expected: friendly failure, clean namespace, recovered newline, empty operation history.

Actual: ✅ passed, 11 ms. Source: [moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts).

## JOINT-A19 — recovers a fresh queue Python namespace after an exception

Input: actual Python defines leaked=42 then raises; next run asserts leaked is absent and prints recovered. Expected: friendly failure, clean namespace, recovered newline, empty operation history.

Actual: ✅ passed, 12 ms. Source: [moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts).

## JOINT-A20 — rebuilds a timed-out array worker and rejects old replies after retry

Input: fake module Worker becomes ready but hangs, advance 5s, retry with fresh Worker, emit stale and current replies. Expected: TIMEOUT terminates old Worker; old reply cannot settle retry; current matching reply succeeds.

Actual: ✅ passed, 1 ms. Source: [moduleRunner.test.ts](../src/engine/pyodide/moduleRunner.test.ts).

## JOINT-A21 — rebuilds a timed-out linked-list worker and rejects old replies after retry

Input: fake module Worker becomes ready but hangs, advance 5s, retry with fresh Worker, emit stale and current replies. Expected: TIMEOUT terminates old Worker; old reply cannot settle retry; current matching reply succeeds.

Actual: ✅ passed, 1 ms. Source: [moduleRunner.test.ts](../src/engine/pyodide/moduleRunner.test.ts).

## JOINT-A22 — rebuilds a timed-out queue worker and rejects old replies after retry

Input: fake module Worker becomes ready but hangs, advance 5s, retry with fresh Worker, emit stale and current replies. Expected: TIMEOUT terminates old Worker; old reply cannot settle retry; current matching reply succeeds.

Actual: ✅ passed, 1 ms. Source: [moduleRunner.test.ts](../src/engine/pyodide/moduleRunner.test.ts).
