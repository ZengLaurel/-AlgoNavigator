# AIgoNavigator — Roadmap

## User-prioritized extension — Teach Xiao Tuo Stack practice (2026-11-08)

**Goal:** extend the Stack ending into learning by teaching, using a bounded
selection from the supplied LeetCode Stack list rather than all problems.

**Implemented:** room 04 unlocks at the maze exit (including migration for
previous Stack-gem holders); four original child-friendly adaptations of
1441, 844, 2390 and 1047 with source links; visible stack/top and symbolic
actions; labelled FIFO misconception; demonstrate → correct/explain → fresh
transfer gates; three progressive hints; three chat shortcuts; separate
learner and coach modes; happy sprite and per-activity learned progress.
The existing three-room gem and local Codex Tutor continue to work.

**Assessment boundary:** stored mastery requires deterministic trace and
transfer evidence plus a correct structured rule/reason. Own-word explanation
is optional conversation, not keyword scoring. Chat cannot unlock mastery.
Server prompt v1 selects only a vetted coaching intent; raw generated prose,
code and unknown intent fields never reach the practice UI. All hint counts
retain the no-complete-solution policy. Offline practice remains playable.

**Verification:** case-level outcomes are generated in TEST-RESULTS.md; five
companion reports describe cases, inputs and expectations. Browser/live checks
and limitations are recorded in TEACHING-ACCEPTANCE.md. The test-report script
now writes failed cases too, rather than leaving an old passing report.
This extension does not assert Phase 7/8 art/hardware gates or a real-student
learning outcome; the planned pilot must assess those separately.

**Team integration (2026-11-08):** merged World Adventure Map, region scrolls,
skills handbook and data-gem progress from `1x1dontsleep/AlgoNavigator` revision
`581a1a6`. The current three-room game and local Tutor remain intact; the
module gem is awarded at the final maze exit. This adds navigation and
progress presentation, not implementations of the other three structures.
See [TEAM-MERGE.md](./TEAM-MERGE.md).

Sequencing of [SPECIFICATION.md](./SPECIFICATION.md) into executable phases.
Each phase has a goal, deliverables, and an exit criterion that must be met
before moving to the next phase. Work proceeds phase by phase, in order.

## Phase 0 — Project Scaffolding

**Goal:** a running empty shell to build into.

- Initialize Vite + React + TypeScript project at repo root (`D:\AIgoNavigator`).
- Set up linting/formatting (ESLint + Prettier), Vitest.
- Add base folder structure per SPECIFICATION.md §3.3 (`src/app`,
  `src/components`, `src/engine`, `src/tutor`, `src/content`, `src/state`,
  `api/`).
- Add `.gitignore` entries for `node_modules`, build artifacts, `.env`.
- Confirm `hello-algo/` and `Data-Structure/` remain untouched.
- Automated tests: none yet beyond the Vitest pipeline canary
  (`smoke.test.ts`) — there's no application logic to test until Phase 1.

**Exit criterion:** `npm run dev` serves a blank React app; CI (or local)
lint + test commands run clean.

## Phase 1 — Animation Engine Core (single structure: Stack)

**Goal:** prove the core visualization pattern before replicating it 3x.

- Implement `StructureState` type and the Stack renderer (D3 data-join +
  Framer Motion transitions) per SPEC §5.
- Build `AnimationStage` with play/pause/step/speed controls.
- Author scripted `animationSteps` for Stack push/pop/peek, driven by
  hand-written `StructureState` fixtures (no Pyodide yet).
- Automated tests (see SPEC §9 table): layout-math unit tests, a
  controller-logic test for `AnimationStage`'s stepping/play/pause (using
  a trivial render prop, no Stack/Framer-Motion coupling), a structural
  render test for `StackRenderer` (Framer Motion mocked — animation
  timing stays manual-only), and an end-to-end `App` render smoke test.

**Exit criterion:** a student can watch a scripted push/pop/peek animation
for Stack with working playback controls.

## Phase 2 — Code Execution Integration (Stack)

**Goal:** connect real student Python code to the Stack animation.

- Stand up `PyodideProvider` + Web Worker per SPEC §6 (lazy load, loading
  indicator, timeout/loop guard, worker respawn on hang).
- Build `CodeEditorPanel` (CodeMirror 6) with Run/Reset.
- Implement the Stack exercise harness (`MyStack` class the student
  completes; state read-back to `StructureState`).
- Wire worker output into the same Stack renderer from Phase 1 (FR-4: live
  code drives the same visualization as the scripted demo).
- Kid-friendly error message mapping for common Python exceptions.
- Automated tests (see SPEC §9 table): the `pyodide` npm package runs in
  Node, so the exec-bridge logic (stdout capture, exception mapping,
  loop/step-guard triggering) gets tested directly without a browser
  Worker. The Worker respawn-on-hang logic gets its own unit test with a
  mock Worker here, not deferred to Phase 6.

**Exit criterion:** a student can write `push`/`pop` code in-browser, click
Run, and see the Stack animation update to match their code's real
behavior; infinite loops are caught and recoverable without a page reload.

## Phase 3 — AI Tutor Integration (Stack lesson only)

**Address correction (2026-11-08):** the reported repeated offline replies
came from the old static preview at 4174, while the local Tutor ran at a
different address. Replaced that preview with the local Tutor server and
fixed `dev` / `dev:local` to 127.0.0.1:4174 with strict port binding.
The launcher no longer silently selects a new address.

**Local-provider follow-up (2026-11-08):** after the user reported an API
failure, local development now defaults to the installed Codex CLI's
ChatGPT login via `npm run dev` / `dev:local`. The original API path is
available via `dev:api` and remains the production adapter. This is an
online local bridge, not an offline model. Existing system proxy support
fixed direct CLI connectivity; the browser's Chinese “pop是什么？” received
a real code-aware hint. CLI requests are ephemeral/read-only, sensitive
tools disabled, untrusted input passed via stdin; local HTTP checks Origin
and caps bodies at 32 KiB. Timeouts supersede the earlier 30-second note:
55 seconds for CLI and 60 seconds in the browser. No auth files are read
or copied by the application.

**Game integration completed (2026-11-08):** the user requested Tutor
continuation, superseding the earlier deferred-integration note. Room 02
now offers an optional chat with current edited code, run output/error,
target glyphs and stack state. Versioned prompt v2 adds room context and
student-language replies. The existing local transcript/export and moderation
remain active. Old transcripts, failures and moderated replies do not count
as hints; requests time out after 30 seconds without blocking gameplay.
Model selection honors ALGONAV_TUTOR_MODEL, then ANTHROPIC_MODEL, then the
existing default. Verified live in-browser Chinese hinting and live API
checks for code-aware pop help, withholding full solutions at zero hints,
off-topic redirect and prompt-extraction moderation. All 179 tests pass.
This is a bounded acceptance sample, not a general safety-quality guarantee.

**Goal:** working end-to-end tutoring loop for one lesson.

- Build serverless `/api/tutor` proxy (SPEC §7.1), versioned system prompt
  file, moderation check wiring.
- Build `TutorChatPanel` UI + client-side transcript logging to
  `localStorage` + "Export session log" button.
- Verify Socratic/hint-first behavior manually against a scripted set of
  test questions (including attempts to go off-topic or extract direct
  answers).
- Automated tests (see SPEC §9 table): mock the LLM client and unit-test
  the proxy handler directly — moderation-triggered canned response,
  system-prompt context assembly. No live API calls in CI; actual
  response tone/quality stays a manual check.

**Exit criterion:** a student can ask free-form questions during the Stack
lesson, get age-appropriate Socratic responses referencing their current
code/animation state, and moderation correctly intercepts an off-topic/
unsafe test message.

> **Status note (2026-11-05):** Phase 3 shipped and its tests pass, but the
> tutor is not wired into the game shell built in Phases 4–6 below. It
> remains in the repo, untouched, pending a future decision on how (or
> whether) to re-integrate it into the game. Do not extend tutor scope
> until that decision is made — see SPECIFICATION.md §11.4.

---

**Pivot (2026-11-05):** the remaining phases below were re-planned when the
project shifted from a lesson-page format to a small underground-ruins
game, "Stack Ruins." See SPECIFICATION.md §11 for the full game design.
Phases 4–6 replace what was previously a single "Phase 4 — Full Lesson
Loop"; former Phases 5–7 are renumbered to 7–9 and their scope is narrowed
per the notes below. Work still proceeds phase by phase — do not start
Phase 5 before Phase 4's exit criterion is met, etc.

## Phase 4 — Stone Trial & Asset Foundation

**Goal:** the game shell renders, the first (non-interactive) room is
playable, and every sprite-driven component is built against a swappable
asset index so missing art never blocks logic work.

- Build `src/assets/index.ts`: a single module mapping logical asset names
  (`stone-door-closed`, `sprite-idle`, `block-moon`, ...) to file paths,
  per SPECIFICATION.md §11.6. Until final art lands, logical names resolve
  to placeholder SVGs at the exact final dimensions/aspect ratios from
  `docs/picture_summary.md` — never a rewrite when real art is swapped in.
- Extend `StructureState` (SPEC §11.4) with an optional `glyph` field;
  confirm the existing `computeStackLayout` pure function needs no changes.
- Build `StoneStackRenderer` replacing the plain-rectangle `StackRenderer`
  for in-game use (SPEC §11.4) — reuses layout math, swaps the visual
  mapping only.
- Build the reusable sprite components: `RuinsDoor`, `RuinsSwitch`,
  `Sprite` (idle/guide/thinking/happy poses), `MagicStairs` — each a pure
  state→asset mapping component per `docs/prompt.md` §2.4, no business
  logic.
- Build the `GameStage` shell: room routing, ruins-hall background,
  game-theme CSS palette (SPECIFICATION.md §11.8), replacing the old
  lesson-page card layout.
- Implement **Trial of Stones** (SPEC §11.5.1): scripted push/pop/peek
  sequence reusing the existing `AnimationStage` controller unchanged,
  sprite `guide`→`happy` pose transition on completion.
- Automated tests: `StoneStackRenderer` structural render test (same
  pattern as the retired `StackRenderer.test.tsx`, Framer Motion mocked);
  asset-index resolution test (every logical name used by a built
  component actually resolves to something, placeholder or real); Trial of
  Stones completion-state test reusing `AnimationStage.test.tsx`'s
  approach.

**Exit criterion:** the game opens to the ruins hall, a student can play
through the Trial of Stones scripted sequence with working playback
controls, and every visual slot (door, switch, sprite, stones) renders a
placeholder or real asset with no missing-asset errors.

## Phase 5 — Stairway Repair (Stack Gameplay)

**Goal:** the student writes real Python to solve a stack-matching puzzle
and sees the game world react.

- Author the Stairway Repair exercise content (target glyph pattern +
  starter code against the existing `MyStack` harness, extended with a
  `glyph` parameter per SPEC §11.5.2) — reuses Phase 2's Pyodide
  execution, error mapping, and `CodeEditorPanel` entirely unchanged.
- Implement `Exercise.solutionCheck` for this level: compare final
  `StructureState.elements[].glyph` against the target array
  (deterministic, hand-authored per SPEC §1's existing MVP decision).
- Wire success → `RuinsDoor`/`RuinsSwitch`/`MagicStairs` state changes and
  a position-tween "climb" (Framer Motion, no frame-by-frame sprite
  animation per the asset brief).
- Wire runtime errors → `Sprite` `thinking` pose + existing kid-friendly
  error panel (Phase 2), without resetting game state.
- Automated tests: `solutionCheck` pure-function tests (target match, extra
  stone, wrong order, wrong glyph); an integration test driving the real
  exec bridge (Node-testable per the existing Phase 2 pattern) through a
  correct and an incorrect solution end to end.

**Exit criterion:** a student can edit Python to match the target stone
pattern, click Run, and see the door open and stairway appear; an
incorrect or erroring solution leaves the room state unchanged with a
friendly error shown.

**Status: done.** `GameStage` now routes between Trial of Stones and
Stairway Repair via an unlock-on-completion nav button; `MyStack.push`
gained a backward-compatible optional `glyph` parameter; the solution check
is the standalone `checkStairwayRepair` function (SPEC's generic
`Exercise.solutionCheck` interface was never implemented, so this follows
the room-based architecture already in place instead). Real artwork for the
door, switch, stones, sprite, and stairway (`docs/picture_summary.md`) was
also wired into `src/assets/index.ts` during this phase, replacing those
keys' placeholder SVGs — each component's existing `descriptor.src` branch
point (built in Phase 4) made this a data-only change.

## Phase 6 — Forked Path (Stack as Backtracking)

**Implementation status (2026-11-06):** implemented with bounded seeded-testable
branching tree generation, immutable push/pop/revisit state, stable SVG layout,
a dedicated room-icon stack using `computeStackLayout`, keyboard room actions,
locked edge tweens and reduced motion, frozen exit completion/replay, and
explicit room-02 continuation with persistent navigation unlocks. Tests solve
maps by graph traversal or an injected fixture, not random UI guesses.
Manual browser acceptance remains pending: full Python-backed three-room
playthrough, tween appearance, narrow-screen usability, and OS reduced-motion
behavior have not been visually verified in this environment. Do not treat
this as Phase 7 visual sign-off.

**Goal:** a second, independent application of the stack concept — path
backtracking through a generated maze — ships as its own level.

- Implement the `RoomNode`/`PathState` model (SPEC §11.5.3) as pure,
  renderer-independent functions: map generation (connected graph, exactly
  one `exit`, at least one `deadEnd`, every node reachable from
  `entrance`), and push/pop-on-backtrack transitions.
- Render the map as SVG nodes/edges computed from `PathState` — positions
  and connections are never baked into the background image
  (`ruins-map-bg` is a plain board only), per SPECIFICATION.md §11.8.
- Render the `pathStack` sidebar using the same stone-stack visual
  language as Stairway Repair, to make the stack-as-backtracking
  abstraction explicit to the student.
- Animate node-to-node movement as a position tween along the connecting
  edge (same technique as the stairway climb in Phase 5).
- Automated tests (per the original SPEC §9 testing philosophy — this is
  genuinely new logic, not a reskin, so it gets full coverage): map
  generator validity properties (reachability, exactly one exit, at least
  one dead end) across repeated random generations; push-on-enter/
  pop-on-backtrack state machine tests; a rendered-SVG structural test
  (node/edge count matches `PathState`, Framer Motion mocked).

**Exit criterion:** a student can navigate a generated maze, back out of
dead ends via the visible path stack, and reach the exit to complete the
Stack Ruins game end to end (Trial of Stones → Stairway Repair → Forked
Path).

## Delivery checkpoint — 2026-11-06

Approved bounded continuation (not a declaration that all phase gates passed):

- Implemented: exact versioned room-unlock persistence, corruption/blocked-storage
  fallback and monotonic replay; Stairway reduced-motion success transition;
  source-preserving 25-image PNG export with format/dimension/alpha manifest;
  map-node/badge/book/sparkle registration and room-scoped mounts.
- Locally verified: production Chrome 156 full three-room playthrough, real Python
  infinite-loop timeout and successful retry without refresh, keyboard maze,
  dead-end pop/revisit, entrance protection, exit freeze, replay, reload unlocks,
  390px Forked layout, both motion preferences. CDP script records evidence under
  artifacts/game-<timestamp>; it preserves older kids-* evidence.
- Phase 7 remains **partial**: art quality/composites/paired state anchors not
  visually approved, no subject cropping/background removal, deleted backgrounds
  not restored, board remains programmatic; scroll/glow/dust not yet mounted.
- Phase 8 remains **partial**: Firefox, separate Edge, controlled browser Worker
  crash injection, school hardware and controlled cold-load measurements pending.
  Unit tests cover Worker failure recovery; browser acceptance covers a real hang.
- Phase 9 **prepared, not run**: PILOT.md supplies anonymous observation template
  and facilitator checklist. Actual students and go/no-go decision are external.

## Phase 7 — Asset Finalization & Polish

**Lossless compression (2026-11-08):** completed for all 25 published PNGs
using `npm run assets:optimize`, from 3,054,638 to 2,405,816 bytes (21.2%
smaller). The script checks chunk CRCs and exact decompressed image-data
equality before writing, retains non-IDAT chunks, and leaves `picture/`
untouched. Sizes and hashes are recorded in `artifacts/asset-optimization.json`.
Asset tests (24), production build and lint pass. Background restoration,
art/composite/anchor visual approval and controlled cold-load measurement
remain pending; Phase 7 is still partial.

**Increment (2026-11-08):** Stairway Repair now mounts the quest-scroll
beside the target, a static magic glow on success, and a one-shot dust
fade on stairway restoration. Decorative images are hidden from assistive
technology and ignore pointer events; reduced-motion mode skips the dust.
Effects mount only on success in room 02. Final art cleanup and visual
approval remain pending; this increment does not close the Phase 7 gate.

**Goal:** swap every placeholder for final art and add the non-blocking
polish layer.

- Replace placeholders in `src/assets/index.ts` with final assets per
  `docs/picture_summary.md`, re-cropped/re-generated to spec: transparent
  `stone-door-closed/open` and `switch-inactive/active` at their target
  dimensions (current files are opaque full-frame renders — see
  SPECIFICATION.md §11.6), the 5 glyph stones, 4 sprite poses,
  `magic-stairs`, and the 5 map node icons.
- Add the non-blocking third-batch assets (badge, code book, scroll,
  glow/sparkle/dust effects) per `docs/prompt.md` §6's "Phase 3
  beautification" batch.
- Compress/convert per `docs/prompt.md` §7: backgrounds to WebP, sprite
  PNGs size-optimized; lazy-load map/reward/fx assets per level rather
  than on initial load.
- Accessibility pass: alt text for every asset, non-color-reliant state
  indication (door/switch/stack-top state must not rely on color alone),
  captions alongside all sprite dialogue.
- Automated tests: none new — this phase is asset/perf work, verified by
  the existing structural render tests still passing against real (not
  placeholder) assets, plus manual visual QA.

**Exit criterion:** no placeholder assets remain in a normal playthrough;
load-time and accessibility checks pass per SPECIFICATION.md §11.8 and
NFR-3/NFR-4.

## Phase 8 — Pilot Hardening

**Goal:** de-risk before putting this in front of real children.

- Cross-browser check (latest Chrome/Edge/Firefox) per NFR-5.
- Manual transcript review process dry-run **only if** the tutor is
  re-integrated before this phase (see the Phase 3 status note above) —
  otherwise skip, since no AI conversation exists in the shipped game.
- Reliability pass: forced Pyodide worker crashes/hangs during Stairway
  Repair, confirm recovery without progress loss (NFR-6) — reuses Phase
  2's respawn-on-hang logic and its existing test, verified in-browser.
- Full playthrough QA: Trial of Stones → Stairway Repair → Forked Path,
  on Chromebook-class hardware, checking NFR-3 load-time target.

**Exit criterion:** no open safety or reliability issues from the
hardening pass; sign-off to run the pilot.

## Phase 9 — Small-Scale Pilot & Feedback

**Goal:** validate with real students per REQUIREMENTS.md §10 success
metrics, adapted to the game format.

- Run with a small group (single classroom or a handful of students).
- Collect: completion rate per room, time-to-complete Stairway Repair
  without hints, any crashes/hangs requiring reload, qualitative feedback
  on whether the game framing improved engagement versus the original
  lesson-page format.
- Write up findings and decide next-phase scope: Array/LinkedList/Queue
  game rooms (previously "Phase 5 — Replicate for Remaining Structures"),
  tutor re-integration, and/or further polish — see REQUIREMENTS.md §3
  Non-Goals as the candidate backlog, now alongside the game-specific
  options above.

**Exit criterion:** success metrics are measured and documented; go/no-go
decision made for post-MVP investment, including whether to extend the
game format to the remaining three structures.

---

**Process note:** do not start a phase's work until the prior phase's exit
criterion is met. If a phase surfaces a design gap, update
SPECIFICATION.md (and REQUIREMENTS.md if scope is affected) before
continuing, rather than deviating silently.
