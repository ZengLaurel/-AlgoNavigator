# Phase 13 — Linked list test cases

Date: 2026-11-12 (Asia/Shanghai). Actual run: 288/288 passing, 43 files. Full names, durations and results are generated in [TEST-RESULTS.md](./TEST-RESULTS.md). These 17 new cases supplement the historical 271-case baseline.

## LL-A01 — Linked forest rooms › keeps observation completion gated by all predictions and frames

Input: six correct predictions with six forward frames. Expected: continue disabled initially and enabled only after both requirements.

Actual: ✅ passed, 580 ms. Source: [LinkedGame.test.tsx](../src/components/game/LinkedGame.test.tsx)

## LL-A02 — Linked forest rooms › allows cycle creation and repair, then awards a complete delivery once

Input: tail links to head, then restore tail→None; invalid target ID. Expected: cycle is detected, references remain recoverable, invalid edit leaves state unchanged; UI case completes delivery after repair and awards once.

Actual: ✅ passed, 308 ms. Source: [LinkedGame.test.tsx](../src/components/game/LinkedGame.test.tsx)

## LL-A03 — Linked forest rooms › requires fresh empty-forest transfer after explaining head insertion

Input: insert head x, explain rule/reason, insert k into empty fresh forest, replay. Expected: no mastery before transfer; one mastery callback after transfer; replay gives no extra award.

Actual: ✅ passed, 196 ms. Source: [LinkedGame.test.tsx](../src/components/game/LinkedGame.test.tsx)

## LL-A04 — Linked list curriculum › uses the trusted fixture and six valid narrated prediction steps

Input: trusted a/b/x fixture and six narrated operations. Expected: fixture matches Python registry, every scripted action accepted, six prediction questions.

Actual: ✅ passed, 4 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A05 — Linked list curriculum › requires real reference edits, the full path and ordered visits for Python

Input: link x→b, link a→x, visit a/x/b; compare missing or empty evidence. Expected: only replayable full-path evidence succeeds. Real Python case also checks stdout B.

Actual: ✅ passed, 2 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A06 — Linked list curriculum › rejects cycles, invalid IDs and supports reference repair without dropping nodes

Input: tail links to head, then restore tail→None; invalid target ID. Expected: cycle is detected, references remain recoverable, invalid edit leaves state unchanged; UI case completes delivery after repair and awards once.

Actual: ✅ passed, 1 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A07 — Linked list curriculum › awards delivery only with removal, insertion and ordered complete traversal

Input: remove food, insert map, visit p/x/r versus reversed visits and missing history. Expected: only complete ordered evidence awards delivery.

Actual: ✅ passed, 1 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A08 — Linked list curriculum › handles empty removal, single-node removal and equal-valued node identities

Input: empty removal, only-node removal, duplicate-valued nodes. Expected: EMPTY without corruption; only-node removal yields head None; traversal follows identity.

Actual: ✅ passed, 0 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A09 — Linked list curriculum › linked-list-follow: learns only after demonstration, explanation and fresh transfer

Input: the activity’s scripted demonstration, matching rule/reason, independent new-data transfer (see linkedSolutions in source). Expected: correct-rule → transfer-ready → learned only after fresh evidence.

Actual: ✅ passed, 1 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A10 — Linked list curriculum › linked-list-follow: rejects empty evidence, wrong reasons and reset mastery

Input: empty demonstration, wrong reason after valid demonstration, reset. Expected: teaching stays gated; reset clears attempt evidence and never awards mastery.

Actual: ✅ passed, 1 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A11 — Linked list curriculum › linked-list-head: learns only after demonstration, explanation and fresh transfer

Input: the activity’s scripted demonstration, matching rule/reason, independent new-data transfer (see linkedSolutions in source). Expected: correct-rule → transfer-ready → learned only after fresh evidence.

Actual: ✅ passed, 0 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A12 — Linked list curriculum › linked-list-head: rejects empty evidence, wrong reasons and reset mastery

Input: empty demonstration, wrong reason after valid demonstration, reset. Expected: teaching stays gated; reset clears attempt evidence and never awards mastery.

Actual: ✅ passed, 0 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A13 — Linked list curriculum › linked-list-insert: learns only after demonstration, explanation and fresh transfer

Input: the activity’s scripted demonstration, matching rule/reason, independent new-data transfer (see linkedSolutions in source). Expected: correct-rule → transfer-ready → learned only after fresh evidence.

Actual: ✅ passed, 1 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A14 — Linked list curriculum › linked-list-insert: rejects empty evidence, wrong reasons and reset mastery

Input: empty demonstration, wrong reason after valid demonstration, reset. Expected: teaching stays gated; reset clears attempt evidence and never awards mastery.

Actual: ✅ passed, 1 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A15 — Linked list curriculum › linked-list-remove: learns only after demonstration, explanation and fresh transfer

Input: the activity’s scripted demonstration, matching rule/reason, independent new-data transfer (see linkedSolutions in source). Expected: correct-rule → transfer-ready → learned only after fresh evidence.

Actual: ✅ passed, 0 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A16 — Linked list curriculum › linked-list-remove: rejects empty evidence, wrong reasons and reset mastery

Input: empty demonstration, wrong reason after valid demonstration, reset. Expected: teaching stays gated; reset clears attempt evidence and never awards mastery.

Actual: ✅ passed, 0 ms. Source: [linkedList.test.ts](../src/content/modules/linkedList.test.ts)

## LL-A17 — runs the forest repair task with two Python reference edits and ordered visits

Input: link x→b, link a→x, visit a/x/b; compare missing or empty evidence. Expected: only replayable full-path evidence succeeds. Real Python case also checks stdout B.

Actual: ✅ passed, 41 ms. Source: [moduleExecution.test.ts](../src/engine/pyodide/moduleExecution.test.ts)
