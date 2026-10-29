# AIgoNavigator — Roadmap

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

**Exit criterion:** `npm run dev` serves a blank React app; CI (or local)
lint + test commands run clean.

## Phase 1 — Animation Engine Core (single structure: Stack)

**Goal:** prove the core visualization pattern before replicating it 3x.

- Implement `StructureState` type and the Stack renderer (D3 data-join +
  Framer Motion transitions) per SPEC §5.
- Build `AnimationStage` with play/pause/step/speed controls.
- Author scripted `animationSteps` for Stack push/pop/peek, driven by
  hand-written `StructureState` fixtures (no Pyodide yet).
- Unit tests for the Stack renderer's state-transform logic.

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

**Exit criterion:** a student can write `push`/`pop` code in-browser, click
Run, and see the Stack animation update to match their code's real
behavior; infinite loops are caught and recoverable without a page reload.

## Phase 3 — AI Tutor Integration (Stack lesson only)

**Goal:** working end-to-end tutoring loop for one lesson.

- Build serverless `/api/tutor` proxy (SPEC §7.1), versioned system prompt
  file, moderation check wiring.
- Build `TutorChatPanel` UI + client-side transcript logging to
  `localStorage` + "Export session log" button.
- Verify Socratic/hint-first behavior manually against a scripted set of
  test questions (including attempts to go off-topic or extract direct
  answers).

**Exit criterion:** a student can ask free-form questions during the Stack
lesson, get age-appropriate Socratic responses referencing their current
code/animation state, and moderation correctly intercepts an off-topic/
unsafe test message.

## Phase 4 — Full Lesson Loop (Stack)

**Goal:** complete the 5-step lesson template end-to-end for one structure.

- Add `HookPanel` (analogy intro) and `ChallengePanel` (hand-authored
  challenge + auto-grade) for Stack.
- Add `ProgressBar` / lesson progress persisted to `localStorage`.
- Full manual run-through: hook → animation → guided code → AI Q&A →
  challenge, on Chromebook-class hardware, checking NFR-3 load-time target.

**Exit criterion:** the entire Stack lesson is playable start to finish by
a test user with no prior coding experience, unassisted, per the MVP
success metric in REQUIREMENTS.md §10.

## Phase 5 — Replicate for Remaining Structures

**Goal:** Array, Linked List, Queue reach the same bar as Stack.

- Implement each structure's renderer (array cells, linked-list
  boxes+arrows, queue) reusing the Phase 1–4 pattern.
- Author hook analogies, animation steps, exercises, and challenges for
  each.
- Extend the tutor system prompt's scope to cover all 4 topics; re-test
  Socratic/moderation behavior per structure.

**Exit criterion:** all 4 lessons meet the Phase 4 exit criterion
independently.

## Phase 6 — Pilot Hardening

**Goal:** de-risk before putting this in front of real children.

- Cross-browser check (latest Chrome/Edge/Firefox) per NFR-5.
- Accessibility pass (color contrast, non-color-reliant state indication,
  captions) per SPEC §8.
- Manual transcript review process dry-run: sample AI conversations across
  all 4 lessons, specifically probing for prompt injection and unsafe
  completions (REQUIREMENTS.md §9).
- Reliability pass: forced Pyodide worker crashes/hangs on all 4 exercises,
  confirm recovery without progress loss (NFR-6).

**Exit criterion:** no open safety or reliability issues from the hardening
pass; sign-off to run the pilot.

## Phase 7 — Small-Scale Pilot & Feedback

**Goal:** validate with real students per REQUIREMENTS.md §10 success
metrics.

- Run with a small group (single classroom or a handful of students).
- Collect: completion rate per lesson, hint-first adherence (via sampled
  transcripts), any crashes/hangs requiring reload.
- Write up findings and decide next-phase scope (post-MVP content: trees/
  hashing/sorting, accounts/progress sync, teacher dashboard, etc. — see
  REQUIREMENTS.md §3 Non-Goals as the candidate backlog).

**Exit criterion:** success metrics from REQUIREMENTS.md §10 are measured
and documented; go/no-go decision made for post-MVP investment.

---

**Process note:** do not start a phase's work until the prior phase's exit
criterion is met. If a phase surfaces a design gap, update
SPECIFICATION.md (and REQUIREMENTS.md if scope is affected) before
continuing, rather than deviating silently.
