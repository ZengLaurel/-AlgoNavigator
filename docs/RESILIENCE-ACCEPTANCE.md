# Phase 15 follow-up — Forced AI outage and Worker crash

Date: 2026-11-12, Asia/Shanghai. Base commit: 5ec2a2c on main; this follow-up is uncommitted. Environment: Windows desktop, Node 24.18.0, ChatGPT in-app Chromium, Vite development server, actual browser Workers and Pyodide. Exact browser build and school-device/network performance were not measured. No student sessions or PPT changes.

**Local result: all four core games completed from an initially empty, isolated test origin while every AI request was forced to fail. Each module's first Worker deliberately crashed and the same code succeeded after retry.** The independent test store progressed 0 → 1 (Queue) → 2 (Array) → 3 (Linked List) → 4 (Stack) gems and retained 4/4 after reload. Normal port 4174 and its stored progress were not reset. This closes the specific outage/controlled-crash gap from the first joint pass; it does not certify all accessibility, physical-device or dialogue-quality gates.

## Reproduce the local harness

Using the tested Node 24 runtime and installed project dependencies:

```sh
npm run acceptance:local -- --worker-crash
```

Open `http://127.0.0.1:4175/`. The server binds loopback only, refuses another occupied 4175 port, and always intercepts `/api/tutor` with HTTP 503 before any model provider. It does not need or read model credentials. With the explicit flag, its serve-only transform replaces only the first Worker construction per full page load with a real Worker script that throws. Retry uses the original real Pyodide factory. Reload before testing each module's first-crash case. Without the flag, AI remains unavailable but Workers are normal.

The helper is imported only by this development script and its tests. It is not registered in the normal Vite configuration or production UI. It exposes no learner-facing switch. It fails loudly if the Worker factory signature changes rather than silently skipping the injected fault. The transform leaves grading, task state and progress untouched. Port 4175 uses separate browser storage from normal 4174. Do not clear an existing person's 4175 records just to rerun this matrix; use a fresh test browser profile if necessary.

The script explicitly pre-optimizes Pyodide to avoid a mid-run dependency-optimization reload on a clean cache. During the initial exploratory run before that addition, Vite optimized Pyodide and reloaded the page. Stored Queue room unlocks survived; the final Queue crash/retry was then repeated after reload and completed normally. The script was stopped and its temporary browser tab closed after verification. The normal project server was left running.

## Fixes discovered and verified

- A proxy/provider error with JSON but no request ID was being treated as a lesson change. Now an uncorrelated non-success response uses the module-specific unavailable fallback, while a mismatched successful response is still rejected as stale. Arbitrary proxy text is not displayed as a lesson answer. Tests cover Array, Linked List and Queue. Browser Queue before/after reproduction confirmed the change.
- All four actual CodeMirror textboxes now have descriptive accessible names and a visible description: **Tab indents code; press Escape, then Tab to leave the editor.** Browser checks in all four editors moved focus onto Run. These targeted checks do not claim a complete Tab-only or screen-reader journey.

## Browser matrix

All navigation/operation buttons and prediction choices were activated with Enter/Space. Code text and numeric/string fields were filled through their visible controls; native select values were set through their accessible controls. No progress state was injected and no model response was available to complete a task.

| ID      | Input/steps                                                                                                                                                                         | Expected                                                                 | Actual                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| RES-B01 | Open empty port-4175 map; enter Queue independently                                                                                                                                 | 0/4, all regions available, no entry reward                              | Passed                                                                                   |
| RES-B02 | Ask Queue peek question against 503 without requestId                                                                                                                               | Unavailable service, not a lesson switch                                 | Initial bug reproduced; after fix and reload, module-specific unavailable message passed |
| RES-B03 | Queue: answer six predictions; enqueue A/B, peek, dequeue, enqueue C; first Run crashes; retry identical code; peek red, serve red, enqueue green, serve blue; complete             | Worker failure preserves code, real retry succeeds, one Queue gem        | Passed; map 1/4                                                                          |
| RES-B04 | Array: answer six predictions; insert X at 1, set original C to D, remove B; crash then retry; grow to 5, insert map at 1, remove food at 2, traverse; complete                     | Same recovery, correct storage and one Array gem                         | Passed; map 2/4                                                                          |
| RES-B05 | Linked List: six predictions; link x→b then a→x, visit a/x/b; crash then retry; remove q after p, insert x after p, visit p/x/r; complete                                           | References and ordered visits survive correct retry, one Linked List gem | Passed; map 3/4                                                                          |
| RES-B06 | Stack: step seven observation moves; build base/moon/star; crash then retry same code; explore maze by keyboard, enter dead end 7, pop back through corridors to fork, enter exit 5 | Friendly crash, repaired stairs, actual backtracking and exit reward     | Passed; map 4/4                                                                          |
| RES-B07 | Reload the final map                                                                                                                                                                | Four independent gems persist without a successful AI call               | Passed; still 4/4                                                                        |
| RES-B08 | In each actual editor, Escape then Tab                                                                                                                                              | Focus can leave indentation editor and land on Run                       | Passed in Stack, Array, Linked List and Queue                                            |
| RES-B09 | Queue peek teaching: demo A/B, correct rule/reason, fresh single K, check                                                                                                           | Teaching works during forced outage, no premature mastery                | Passed; 1/4 Queue activities taught; gems remain 4/4                                     |

Ignored evidence in `artifacts/phase15b/`: `{queue,array,linked-list,stack}-worker-fault.txt`, each module's `-retry.txt` and `-complete.txt`, `queue-offline.txt`, `queue-editor-keyboard.txt`, `queue-offline-teaching.txt`, `fault-map-four-gems.txt`, `fault-map-four-gems.png`, `final-map.txt`, and test/build/lint/format logs. Short tool wait deadlines occasionally elapsed while real Pyodide was still loading; later snapshots and correct retries supplied the actual successful results. This is not a measured readiness benchmark.

## Automated checks

Actual final regression: **340/340 cases, 48 files, no failures/skips**. The [10 new cases](./RESILIENCE-TEST-CASES.md) cover harness isolation/explicit activation/signature drift, 503 response classification for three modules and accessible names/help in four editors. Existing 330 cases continue to cover teaching, storage, replay, cancellation and earlier fixes. Build, lint, changed-file formatting and whitespace checks passed. Production asset inspection found no fault-injection markers.

The first accessibility-test run correctly failed before the corresponding editor attributes were added; it was corrected and the full suite rerun. The helper's NodeNext import extension was corrected before the passing build. Report counts are generated by actual execution, not edited by hand.

## Remaining gates

- This forced-outage pass covers the three core stages of all four games and one complete Queue teaching transfer. It does not replace the earlier twelve-activity records or claim all optional activities were replayed under this exact fault configuration.
- Complete Tab-only/screen-reader journeys and actual OS reduced-motion preference testing remain open; current checks show named editors, Escape-Tab exits and targeted keyboard controls only.
- Physical school devices, multiple browser engines, touch behavior, cold/warm performance and realistic network conditions remain unmeasured.
- Expanded live-model review across roles, phases and adversarial/failure samples remains open. No model was called in this pass by design.
- Phase 7 visual sign-off and Phase 8 deployment gates remain separate. The four-module pilot is still **not conducted**.

Phase 15 is still partially complete; [ROADMAP.md](./ROADMAP.md) identifies these remaining gates instead of starting a child pilot prematurely.
