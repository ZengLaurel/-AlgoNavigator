# Phase 15 follow-up — Resilience test cases

Date: 2026-11-12 (Asia/Shanghai). Real regression: **340/340 cases, 48 files**. These 10 new cases supplement the historical 330-case snapshot. Per-case statuses and timings are copied from the actual [generated report](./TEST-RESULTS.md). Browser steps and fault conditions are recorded in [RESILIENCE-ACCEPTANCE.md](./RESILIENCE-ACCEPTANCE.md).

## RES-A01 — isolated local acceptance harness › only changes the exact Worker factory when the explicit crash flag is enabled

Input: exact Worker factory with flag on/off and unrelated source path. Expected: only explicit mode transforms the correct module; the normal Worker path remains for retry.

Actual: ✅ passed, 4 ms. Source: [acceptanceFaults.test.ts](../api/testing/acceptanceFaults.test.ts).

## RES-A02 — isolated local acceptance harness › fails visibly if the targeted factory changes instead of claiming a crash test passed

Input: changed factory source with crash mode enabled. Expected: harness fails loudly instead of silently skipping fault injection.

Actual: ✅ passed, 1 ms. Source: [acceptanceFaults.test.ts](../api/testing/acceptanceFaults.test.ts).

## RES-A03 — isolated local acceptance harness › intercepts the AI endpoint before a provider can be called and serves a real crashing Worker script

Input: mock server middleware registration, invoke AI and Worker-script routes. Expected: AI returns 503/no-store, drains request without invoking any model; crash script really throws.

Actual: ✅ passed, 0 ms. Source: [acceptanceFaults.test.ts](../api/testing/acceptanceFaults.test.ts).

## RES-A04 — four Python editors accessibility › Stack Python program exposes its name and keyboard escape instructions

Input: actual CodeMirror component for the named module in a ready Python context. Expected: textbox has a descriptive accessible name and aria-describedby refers to visible Escape-then-Tab exit instructions.

Actual: ✅ passed, 152 ms. Source: [EditorAccessibility.test.tsx](../src/components/game/EditorAccessibility.test.tsx).

## RES-A05 — four Python editors accessibility › Array Python program exposes its name and keyboard escape instructions

Input: actual CodeMirror component for the named module in a ready Python context. Expected: textbox has a descriptive accessible name and aria-describedby refers to visible Escape-then-Tab exit instructions.

Actual: ✅ passed, 86 ms. Source: [EditorAccessibility.test.tsx](../src/components/game/EditorAccessibility.test.tsx).

## RES-A06 — four Python editors accessibility › Linked list Python program exposes its name and keyboard escape instructions

Input: actual CodeMirror component for the named module in a ready Python context. Expected: textbox has a descriptive accessible name and aria-describedby refers to visible Escape-then-Tab exit instructions.

Actual: ✅ passed, 42 ms. Source: [EditorAccessibility.test.tsx](../src/components/game/EditorAccessibility.test.tsx).

## RES-A07 — four Python editors accessibility › Queue Python program exposes its name and keyboard escape instructions

Input: actual CodeMirror component for the named module in a ready Python context. Expected: textbox has a descriptive accessible name and aria-describedby refers to visible Escape-then-Tab exit instructions.

Actual: ✅ passed, 33 ms. Source: [EditorAccessibility.test.tsx](../src/components/game/EditorAccessibility.test.tsx).

## RES-A08 — treats an uncorrelated 503 as a array outage rather than a lesson switch

Input: provider/proxy 503 JSON without requestId for the named module. Expected: unavailable message names current module, never falsely says lesson changed or echoes arbitrary proxy failure text.

Actual: ✅ passed, 1 ms. Source: [scopedTutor.test.ts](../src/tutor/scopedTutor.test.ts).

## RES-A09 — treats an uncorrelated 503 as a linked-list outage rather than a lesson switch

Input: provider/proxy 503 JSON without requestId for the named module. Expected: unavailable message names current module, never falsely says lesson changed or echoes arbitrary proxy failure text.

Actual: ✅ passed, 1 ms. Source: [scopedTutor.test.ts](../src/tutor/scopedTutor.test.ts).

## RES-A10 — treats an uncorrelated 503 as a queue outage rather than a lesson switch

Input: provider/proxy 503 JSON without requestId for the named module. Expected: unavailable message names current module, never falsely says lesson changed or echoes arbitrary proxy failure text.

Actual: ✅ passed, 1 ms. Source: [scopedTutor.test.ts](../src/tutor/scopedTutor.test.ts).
