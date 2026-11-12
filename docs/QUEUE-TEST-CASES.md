# Phase 14 — Queue test cases

Date: 2026-11-12 (Asia/Shanghai). Actual report: **308/308 passing, 45 files**. The 20 new cases below extend the Phase 13 baseline of 288. Per-test names, outcomes and timings come from the real [generated report](./TEST-RESULTS.md). Browser checks are separate in [QUEUE-ACCEPTANCE.md](./QUEUE-ACCEPTANCE.md).

## QUE-A01 — App › opens Queue independently from the map with later rooms locked

Input, steps and expected result: Click Harbor Pier with empty progress; expect independent Queue entry, Python and teaching rooms locked.

Actual: ✅ passed, 370 ms. Source: [App.test.tsx](../src/App.test.tsx).

## QUE-A02 — Queue harbor rooms › gates Python behind six observed frames and correct predictions

Input, steps and expected result: Answer six predictions and step six frames. Expect continue disabled before both requirements, then one advancement callback.

Actual: ✅ passed, 440 ms. Source: [QueueGame.test.tsx](../src/components/game/QueueGame.test.tsx).

## QUE-A03 — Queue harbor rooms › awards the harbor gem once only after correct arrival and service evidence

Input, steps and expected result: Submit incomplete delivery; then peek/dequeue/enqueue/dequeue and submit. Expect no early gem, one completion callback, disabled repeat completion.

Actual: ✅ passed, 166 ms. Source: [QueueGame.test.tsx](../src/components/game/QueueGame.test.tsx).

## QUE-A04 — Queue harbor rooms › requires a fresh one-boat peek without departure before awarding teaching mastery

Input, steps and expected result: Teach peek with A/B; explain; peek fresh K without serving it; replay. Expect mastery only after new example and no repeated award.

Actual: ✅ passed, 174 ms. Source: [QueueGame.test.tsx](../src/components/game/QueueGame.test.tsx).

## QUE-A05 — Queue harbor rooms › shows empty-service recovery in the fresh teaching task

Input, steps and expected result: Complete the interleaving demo and explanation; try dequeue on the empty fresh example. Expect visible EMPTY recovery feedback with no phantom departure.

Actual: ✅ passed, 196 ms. Source: [QueueGame.test.tsx](../src/components/game/QueueGame.test.tsx).

## QUE-A06 — Queue harbor rooms › rejects a successful Python run that lacks goal evidence and cancels on unmount

Input, steps and expected result: Mock a successful Python run with an empty result. Expect continue disabled for missing goal evidence and cancelModule on unmount; this test does not replace real Python coverage.

Actual: ✅ passed, 124 ms. Source: [QueueGame.test.tsx](../src/components/game/QueueGame.test.tsx).

## QUE-A07 — Queue curriculum › matches the trusted empty Python fixture and six narrated prediction steps

Input, steps and expected result: Compare the empty fixture with the Python registry and all six narrated events; expect six accepted steps and prediction questions.

Actual: ✅ passed, 3 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A08 — Queue curriculum › requires actual ordered enqueue, peek and dequeue evidence for Python

Input, steps and expected result: Enqueue A/B, peek, dequeue, enqueue C versus an alternate order with the same final boats; expect only the requested ordered history to pass.

Actual: ✅ passed, 2 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A09 — Queue curriculum › checks departure history and interleaved service order, not just the final waiting boat

Input, steps and expected result: Peek red, serve red, enqueue green, serve blue versus delayed green arrival or forged empty departures; expect only matching replay and interleaving to pass.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A10 — Queue curriculum › keeps peek observational, reports EMPTY without mutation, and supports arrival recovery

Input, steps and expected result: Try peek/dequeue on empty, then enqueue K, peek and dequeue; expect EMPTY without mutation and a recoverable single-boat journey.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A11 — Queue curriculum › distinguishes equal-valued boat identities and returns each arrival once

Input, steps and expected result: Start with two same-valued boats, dequeue/enqueue/dequeue; expect original boat IDs served once and new arrival still waiting.

Actual: ✅ passed, 0 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A12 — Queue curriculum › queue-first: requires demonstration, explanation and independent transfer

Input, steps and expected result: Use queueSolutions for this task’s demo; explain the exact rule/reason; solve the independent fresh fixture. Expect correct-rule → transfer-ready → learned; no mastery before transfer.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A13 — Queue curriculum › queue-first: rejects empty evidence and wrong explanations; reset cannot award mastery

Input, steps and expected result: Submit an empty attempt, then a valid demo with a wrong reason, and reset. Expect gated explanation, cleared attempt history and no learned state.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A14 — Queue curriculum › queue-rear: requires demonstration, explanation and independent transfer

Input, steps and expected result: Use queueSolutions for this task’s demo; explain the exact rule/reason; solve the independent fresh fixture. Expect correct-rule → transfer-ready → learned; no mastery before transfer.

Actual: ✅ passed, 0 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A15 — Queue curriculum › queue-rear: rejects empty evidence and wrong explanations; reset cannot award mastery

Input, steps and expected result: Submit an empty attempt, then a valid demo with a wrong reason, and reset. Expect gated explanation, cleared attempt history and no learned state.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A16 — Queue curriculum › queue-peek: requires demonstration, explanation and independent transfer

Input, steps and expected result: Use queueSolutions for this task’s demo; explain the exact rule/reason; solve the independent fresh fixture. Expect correct-rule → transfer-ready → learned; no mastery before transfer.

Actual: ✅ passed, 0 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A17 — Queue curriculum › queue-peek: rejects empty evidence and wrong explanations; reset cannot award mastery

Input, steps and expected result: Submit an empty attempt, then a valid demo with a wrong reason, and reset. Expect gated explanation, cleared attempt history and no learned state.

Actual: ✅ passed, 0 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A18 — Queue curriculum › queue-service: requires demonstration, explanation and independent transfer

Input, steps and expected result: Use queueSolutions for this task’s demo; explain the exact rule/reason; solve the independent fresh fixture. Expect correct-rule → transfer-ready → learned; no mastery before transfer.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A19 — Queue curriculum › queue-service: rejects empty evidence and wrong explanations; reset cannot award mastery

Input, steps and expected result: Submit an empty attempt, then a valid demo with a wrong reason, and reset. Expect gated explanation, cleared attempt history and no learned state.

Actual: ✅ passed, 1 ms. Source: [queue.test.ts](../src/content/modules/queue.test.ts).

## QUE-A20 — runs Harbor Dispatch in real Python with observational peek and FIFO departures

Input, steps and expected result: Execute actual Pyodide enqueue A/B, print peek, print dequeue, enqueue C; expect validated replay, goal passed and stdout AA (existing output collector concatenates batched lines).

Actual: ✅ passed, 34 ms. Source: [moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts).
