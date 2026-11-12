# Phase 15 — Four-module joint acceptance

Date: 2026-11-12, Asia/Shanghai. Repository: main based on 300b1d0 with uncommitted Phase 11–15 work. Environment: Windows desktop, ChatGPT in-app Chromium browser, local Vite 127.0.0.1:4174, cached/local Pyodide resources and normal host permissions for the existing ChatGPT/Codex bridge. Exact browser build, school-device class and network performance were not measured. No student participants, deployment, GitHub push or PPT edits.

**Result: local desktop functional checks and corrective work passed. Phase 15 remains partially complete until the outstanding device/accessibility/model-review gates below are resolved.** This document does not certify a school pilot. All four regions remain playable; the test browser retained 4/4 gems.

## Changes validated

1. Both Python output bridges now preserve each batched line break, including empty lines. `print('first'); print(); print('third')` displays three correctly separated lines instead of concatenation. Real Pyodide regression covers both Stack and module bridges.
2. Queue peek questions in English or Chinese receive a reviewed hint about reading the front without changing waiting boats or departure history. A generic model intent cannot replace it with an unrelated Stack contrast. Raw model prose is still not displayed.
3. The shared module shell focuses its heading after lazy entry, then the room heading after stage changes. Queue map-entry focus is asserted automatically and room focus was visible in browser snapshots.
4. In all three new teaching banks, a correct explanation now produces a rule-and-reason restatement before fresh verification. It explicitly says a new example is still required. Only the independent successful transfer produces the learned feedback. Component regressions assert the pending restatement.

## Automated evidence

Actual final `npm run test:report`: **330/330 cases, 46 files, zero failures/skips**. Build and lint passed. Changed-file format and whitespace checks passed. The [joint case register](./FOUR-MODULE-TEST-CASES.md) records 22 new cases with inputs, expectations, results and timings. The [generated full report](./TEST-RESULTS.md) includes all existing Stack and three-module regressions. It is rolling; historical phase reports preserve their original counts.

New joint tests exercise all twelve shipped Array/Linked List/Queue activity definitions with correct demo and fresh trajectories, empty/invalid transfer, wrong rule, reset, replay and cross-exercise session isolation. Earlier per-activity tests retain wrong-reason and valid-path checks. Added tests cover blocked storage across four modules and retry, each module's stale-Worker rejection after timeout, each module's real Python exception recovery, blank output lines and specific bilingual peek hints. Existing App integration covers unknown/corrupt records, legacy migration and no reward on entry/observation; existing scoped Tutor tests cover late/mismatched replies and unavailable-service fallback.

This phase did not replace negative tests with a passing count. A temporary syntax/type error in a focus assertion was corrected before the successful complete run. The final passing report contains the actual executed cases. UI component mocks do not stand in for the real Worker cases below.

## Browser cases and actual outcomes

The browser already held earned progress (4/4 gems, the twelve new activities taught). It was not reset or seeded through script. Replaying early content preserved records. Fresh-store/blocked-store cases were automated, not injected into this browser.

| ID        | Input/steps                                                                                                  | Expected                                                                    | Actual                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| JOINT-B01 | Enter Array, Linked List, Queue and Stack using map buttons with Enter; return via map links                 | Separate region title/tasks, retained progress                              | Passed; all four returned to map with 4/4                             |
| JOINT-B02 | Array Python: raise ValueError; run `while True: pass`; retry valid insert/set/remove plus three print lines | Friendly error, bounded timeout, preserved editor/unlocks, correct retry    | Passed; target matched and output first / blank / third               |
| JOINT-B03 | Linked List Python: same exception and infinite loop, then link x→b and a→x, visit a/x/b                     | Error and timeout recover; verified a→x→b path                              | Passed                                                                |
| JOINT-B04 | Queue Python: same exception and infinite loop, then enqueue A/B, peek, dequeue, enqueue C                   | Error and timeout recover; waiting B/C, served A; prints on separate lines  | Passed; displayed A newline A                                         |
| JOINT-B05 | Stack Python: same exception and infinite loop, then build base/moon/star                                    | Friendly error; timeout retains code/progress; correct retry repairs stairs | Passed; “Stairway repaired!” and target tower visible                 |
| JOINT-B06 | 390×844 simulated viewport: each module's Python page, plus Array/Linked List/Queue teaching banks           | No whole-page horizontal overflow                                           | Passed; document width = client width 375 CSS px (scrollbar excluded) |
| JOINT-B07 | Same viewport after Stack teaching content finished loading                                                  | No whole-page horizontal overflow                                           | Passed; 375/375 CSS px; existing Stack taught state retained          |
| JOINT-B08 | Enter region/room via keyboard, open Queue handbook via Enter                                                | Visible focus and keyboard-operable navigation/disclosure                   | Passed smoke check; complete Tab-only journey not performed           |
| JOINT-B09 | Ask live Tutor “为什么队列的 peek 不会让第一条船离开？”                                                      | Specific local explanation and guiding question, no code/award              | Passed; explicitly said peek does not change waiting/departures       |
| JOINT-B10 | Switch live conversation to learner, teach peek                                                              | Prior role history clears, learner remains scoped                           | Passed; learner-prefixed peek guidance returned                       |
| JOINT-B11 | Switch Queue activity after conversation; open chat                                                          | Old question/reply absent, empty new history                                | Passed; empty list and disabled Export                                |
| JOINT-B12 | Replay Queue peek demo, explain, stop before transfer                                                        | Restate rule/reason with pending verification, no new mastery claim         | Passed; pending message shown, then fresh K peek verified normally    |
| JOINT-B13 | Return to map after all retries/replays; reset viewport override                                             | One gem per topic, no record loss or duplicate reward                       | Passed; final map 4/4 and normal viewport restored                    |

Ignored local evidence: `artifacts/phase15/{array,linked-list,queue,stack}-{error,timeout,retry}.txt`, `narrow-widths.json`, `stack-teaching-narrow.txt`, `stack-narrow.png`, `queue-narrow.png`, `queue-peek-tutor.txt`, `queue-peek-learner.txt`, `pending-verification.txt`, `final-map.txt`, `final-map.png`, and test/build/lint logs. The eight narrow-page checks cover actual rendered content; the last Stack teaching measurement was taken after the initial loading state disappeared. One browser wait reached its short tool deadline during the Linked List loop; the next snapshot showed the expected application timeout and retry succeeded.

## Requirements coverage and limits

| Requirement group                  | Evidence                                                                                                                                                                                           | Status                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| ARR / LL / QUE operation semantics | Structure, real Python and per-module suites; [Array](./ARRAY-ACCEPTANCE.md), [Linked List](./LINKED-LIST-ACCEPTANCE.md), [Queue](./QUEUE-ACCEPTANCE.md) browser records                           | Local functional coverage passed                                                                         |
| TEACH 01–04                        | Twelve new joint negative/reset/transfer cases plus earlier per-case demo/transfer records; pending restatement fixed and checked                                                                  | Deterministic gates passed; no claim of measured learning                                                |
| RUN / cancellation                 | Four real browser exception→loop→retry sequences; lifecycle/stale-response unit tests                                                                                                              | Desktop cases passed; no artificial Worker crash injected in this browser session                        |
| NAV / STORE                        | Four keyboard entries and final map, old Stack migration/corrupt/future-version/quota tests, four-gem retry test                                                                                   | Automated and stated desktop checks passed; blocked storage not reproduced through browser settings      |
| AI                                 | Reviewed hint catalogue and twelve three-level hint sets; existing request isolation/moderation/failure tests; fresh Queue live roles; previous module live samples archived in per-module records | Partial: full four-role dialogue quality matrix still pending                                            |
| UX                                 | Eight rendered 390px page measurements, keyboard entry/disclosure/focus smoke checks, reduced-motion component branches and CSS                                                                    | Partial: physical devices, exhaustive keyboard/screen-reader flow and real OS motion-setting run pending |

Hint source review found no complete fixture-specific code or full fixture operation sequences in the twelve progressive hint sets. The final insertion hints explain the local successor/reconnection principle; story prompts still specify the task to perform. Neither hint count nor conversation grants progress. Structured rule choices are deterministic practice checks, not semantic grading of free prose.

AI independence: prior Array/Linked List browser records include unavailable-service fallback while completing core activities. All three new banks were completed in earlier phases before working chat was used. This phase's scope/client tests verify unavailable-service handling, but it did **not** shut down the running AI bridge and replay all four entire games under forced outage. Initial Python loading can require network resources. Do not label the whole site offline-certified.

## Remaining gates

- Finish complete keyboard-only/screen-reader task journeys and test the actual OS reduced-motion preference across four modules; current Enter-based smoke checks do not certify these.
- Run the intended school devices and multiple browser engines, including cold/warm Python readiness and realistic network/cache conditions; physical touch behavior and performance are unmeasured.
- Expand live dialogue review to current four-module, both-role, multiple-phase and failure samples; the Queue specificity fix is narrow by design. Earlier live samples remain historical evidence.
- Run a forced AI-outage whole-flow matrix and controlled browser Worker-crash cases if required for the deployment target; current unavailable-provider and crash branches have automated coverage and earlier bounded browser evidence.
- Retain Phase 7 visual sign-off and Phase 8 release gates. The [four-module pilot checklist](./PILOT.md) is updated but **no child pilot has been conducted**. Only proceed to Phase 9 after its prerequisites.

Next actual work is these remaining Phase 15/8 checks on the intended environment, not an invented new feature phase. No remaining item is silently counted as passed.
