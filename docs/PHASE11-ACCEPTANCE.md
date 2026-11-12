# Phase 11 — Shared module acceptance

Verified locally on 2026-11-11 (Asia/Shanghai). Working tree is based on main
`300b1d0` plus the Phase 10 documents and Phase 11 changes. This is not a
production deployment, student pilot, or acceptance of the three new regions.
No PowerPoint files were changed.

## Implemented scope

- Four-module content/knowledge registry; new regions remain unimplemented on the map.
- Array, linked-list and queue pure operation models with independent event replay.
- Shared snapshot playback and four-stage room shell, handbook and optional Tutor slot.
- Three trusted Python code fixtures, per-run namespaces, bounded evidence, result validation,
  cancellation, full run identity, 30-second initialization and 5-second execution limits.
- Server-selected multi-module Tutor intents and reviewed bilingual replies, request validation,
  scoped chat cancellation and module-specific fallbacks. Chat cannot write rewards.
- Deterministic demonstration/rule/reason/transfer gates and capped three-level hints.
- Unified v2 progress with React context/subscriptions and monotonic legacy Stack migration.
  Read-only or blocked storage preserves session progress and reports failed persistence.

## Automated checks

`npm run test:report`: **254/254 cases passed across 39 files**, zero failed/skipped.
See [TEST-RESULTS.md](./TEST-RESULTS.md) for actual case names, durations and outcomes.
The [Phase 11 case register](./PHASE11-TEST-CASES.md) records the inputs,
steps, expected and asserted actual outcomes for all 32 new automated cases,
with stable IDs and links to the existing Stack and browser regressions.
Eight new test files have companion reports under [bug-reports](./bug-reports/README.md).
The 32 added cases cover real Pyodide execution, mocked Worker and model boundaries,
pure structures, progress, teaching gates, shell/playback and scoped requests.
Existing Stack tests remain in the full run; two storage assertions now check v2 instead
of expecting writes to the legacy keys, which are intentionally retained unchanged.

During development, obsolete storage assertions and a missing AbortSignal.any implementation
in jsdom were found and corrected. The scoped client now owns its timeout/cancellation.
An oversubscribed full run also timed out a UI case; Vitest now uses at most four workers.
A final regression checks that subscriber rereads do not hide write-only quota failures.
The passing count above comes from the final generated report, not these earlier failed runs.

`npm run lint`, `npm run build`, changed-file Prettier and `git diff --check` are the
delivery checks. Vite emits its existing Pyodide Node-module externalization notices;
these are not build failures. No live model calls are required by the automated suite.

## Browser checks

Environment: Codex in-app Chromium browser on the local Windows machine, local Vite
service at `http://127.0.0.1:4174/`. No separate Edge/Firefox or school-device claim.
The local fixture page uses the same source Worker and ModuleRunner as the application,
not a fake Python implementation. Evidence is private/ignored under `artifacts/phase11/`.

| Case        | Input / action                                                                                                        | Expected                                                                        | Observed / status                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| P11-RUN-1   | Array insert X at index 1 then remove index 2; list insert x after a then remove head; queue enqueue A/B then dequeue | Three actual Worker results with valid operation evidence                       | PASS at 20:08:38; all three results had no error and nonempty validated event histories |
| P11-RUN-2   | Array `while True: pass`, then queue enqueue K                                                                        | TIMEOUT after bounded execution, replacement Worker succeeds without refreshing | PASS at 20:10:07                                                                        |
| P11-RUN-3   | Start queue run and cancel after 500 ms                                                                               | Promise settles CANCELLED; Worker terminated                                    | PASS at 20:10:49                                                                        |
| P11-NAV-1   | Open map with existing player records, click array                                                                    | Preserve 1/4 gem display; unfinished region stays locked                        | PASS; Level Locked shown, no new gem                                                    |
| P11-STACK-1 | Enter Stack from map                                                                                                  | Saved rooms 02/03 and Teach Xiao Tuo entry retained; starts in Trial            | PASS; all saved entrances visible                                                       |
| P11-STACK-2 | In real CodeMirror enter MyStack, push base/moon/star and Run                                                         | Same real Python execution and target check as before                           | PASS; Python ready, exact target match, Stairway repaired and Continue shown            |

Evidence: `browser-check.html` is the local development fixture;
`browser-results.txt/png` records its three PASS results;
`stack-regression.txt/png` records the real Stack target match. The browser fixture
is not added to production routes and does not expose unfinished game rooms.

## Limitations and next gate

- New module scenes, final renderers, room assessments and twelve exercise UIs remain
  Phase 12–14 work. The shared shell callbacks must be called only after the child room's
  deterministic assessment; they do not independently infer success from chat.
- Teaching and Tutor tests validate shared rules with fixtures/mocked transport. They do
  not certify that all twelve planned activities exist or that children learned a concept.
- New-module real-model role/tone and hint-quality review is pending per module. The
  Phase 11 request boundaries and reviewed replies are tested without sending child data.
- Full four-region playthroughs, broad device/browser checks, cold-start measurement,
  final art approval and the real student pilot retain their later/historical gates.
- Browser evidence predates only the final write-quota status fix and request type annotation;
  that fix has a dedicated automated regression and is included in the final full suite.
- These changes are local; no GitHub push or deployment is implied by this acceptance record.

Phase 11's shared-capability gate is complete. The next implementation step is
**Phase 12: Array / Supply Camp**, beginning with observation, knowledge and prediction.
