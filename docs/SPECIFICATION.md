# AIgoNavigator — Technical Specification (MVP)

This document translates [REQUIREMENTS.md](./REQUIREMENTS.md) into a concrete
technical design. It is the reference for implementation decisions; the
[ROADMAP.md](./ROADMAP.md) sequences the work described here into phases.

## 当前设计基线：Phase 10（2026-11-11）

**§12 是 REQUIREMENTS.md §12 的四板块扩展设计，优先于下方历史方案中冲突的
范围、接口和提示规则。** 数组、链表、队列均纳入交付；每区包含动画与预测、
Python 任务、独立应用、教小拓题库，并贯穿知识手册与导师。§1–10 保留最初
架构背景，§11 保留已交付 Stack 的专有设计；它们不是新模块的完整实现契约。

Phase 10 完成设计；Phase 11 已实现共用能力：模块注册、三种结构操作和事件校验、
Python harness/Worker 生命周期、导师隔离、教学状态机及 v2 进度层。
实际导出类型以源码为准，本文类型展示设计契约。Phase 12 已交付数组完整
房间、动画、四道习题及在线导师，并开放地图入口。Phase 13 已交付链表核心流程（2026-11-12），Phase 14 已交付队列核心流程（2026-11-12）。队列使用 enqueue/dequeue/peek，显示 front/rear、等待船只和离港历史。Python 与应用关同时校验固定事件次序和完整状态，不以清空队列或最终单船代替证据。四道教学题覆盖 FIFO、队尾入队、peek 无副作用、交错事件和空队列恢复，全部包含独立新例。验收与设备检查缺口见 [QUEUE-ACCEPTANCE.md](./QUEUE-ACCEPTANCE.md)。
链表使用 chain.link/setHead 暴露引用编辑，并提供安全 insert/remove helpers；节点在固定存储位置显示 ID/value/next，逻辑路径由 next 计算，环可修复。Python 关要求两次改引用并按路径访问；应用关同时检查完整路径、插删证据和访问顺序。四道教学题覆盖重复值、空路径建头、尾插与单节点删除。实际结果及设备检查缺口见 [LINKED-LIST-ACCEPTANCE.md](./LINKED-LIST-ACCEPTANCE.md)。
数组验收见 [ARRAY-ACCEPTANCE.md](./ARRAY-ACCEPTANCE.md)。共用能力见
[PHASE11-ACCEPTANCE.md](./PHASE11-ACCEPTANCE.md) 的验证范围与限制。

Phase 15 hardening (2026-11-12): both Python output bridges preserve batched line breaks, including blank lines. Queue peek questions select a reviewed concept-specific hint rather than a generic FIFO hint; raw model prose remains undisplayed. The shared module shell focuses the entry heading after lazy loading and the room heading after stage changes. Correct rules/reasons are restated before independent verification, explicitly pending; mastery still requires the fresh example. These are corrections within the existing contract; device/pilot gates remain separate. Evidence: [FOUR-MODULE-ACCEPTANCE.md](./FOUR-MODULE-ACCEPTANCE.md).

> **Pivot (2026-11-05):** the Stack lesson is being rebuilt as a small
> underground-ruins game rather than a report-card-style lesson page. See
> **§11** for the full game design; ROADMAP.md Phases 4–6 sequence the
> build. Sections 1–10 below describe the original lesson-page design and
> remain accurate for Phases 0–3, which are already shipped and unaffected
> by the pivot (Pyodide execution, error mapping, and the code editor are
> reused as-is — see §11.7).

## Local delivery addendum — 2026-11-06

- Game progress is an exact two-field, version-1 envelope under
  `algonavigator.stack-ruins.progress`, validated by `src/engine/gameProgress.ts`.
  An ordered level 1/2/3 encodes prerequisite unlocks. Reads/writes catch storage
  errors, use memory fallback, and never save student code or personal data.
  App reload deliberately returns to Trial; previous-room completion is monotonic.
- Stairway success movement uses a zero-duration transition for reduced motion.
- `scripts/prepare-game-assets.mjs` uses local browser decoding/canvas export,
  signature-based PNG/JPEG detection, contain-fit centered transparent canvases,
  and fixed target sizes. The original `block-cracked.png` is selected; its
  alternate is untouched. `node-hall (1).png` is decoded as JPEG; thinking uses
  the supplied PNG. Full-frame contain-fit preserves source content, **not**
  verified subject anchors/transparency. No source/background recovery, automatic
  background removal or art-quality sign-off. Deleted board uses SVG fallback.
- Node/badge/book/sparkle images mount only in their room or success branch.
  Scroll/glow/dust are registered but scene placement remains pending. All
  instructional text and graph edges remain DOM/SVG, not baked artwork.
- Production acceptance: `scripts/game-browser-check.mjs`, fresh evidence folder,
  bounded CDP and UI waits, real CodeMirror input and real Python timeout/retry.
  This is Chrome evidence, not Firefox/Edge/school hardware certification.

## 1. Assumptions Made to Resolve Open Requirements Questions

The requirements doc left 4 questions open. To unblock implementation, the
following defaults are adopted for the MVP (revisit after pilot feedback):

| Open question                    | MVP decision                                                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LLM provider/model               | Anthropic Claude API (small/fast model, e.g. Haiku-class) via a serverless proxy — low cost per turn, strong instruction-following for the Socratic/hint-first system prompt                                             |
| Parent/teacher transcript viewer | Not built in MVP; transcripts are stored in `localStorage` and can be inspected via a simple "Export session log" button (JSON download) instead of a dedicated UI                                                       |
| Challenge authoring              | Hand-authored, fixed challenge set per structure (deterministic auto-grading); no AI-generated challenges in MVP                                                                                                         |
| hello-algo asset reuse           | Do not copy hello-algo's code or diagrams directly (keep `hello-algo/` untouched per project convention); use it only as a conceptual/pedagogical reference. All animations and content are built fresh for this project |

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Student device)                                    │
│                                                               │
│  ┌───────────────┐   ┌──────────────┐   ┌─────────────────┐ │
│  │ React App      │   │ Web Worker   │   │ localStorage    │ │
│  │ (UI, routing,  │◄─►│ (Pyodide     │   │ (progress,      │ │
│  │ D3 animations, │   │ runtime)     │   │ transcripts)    │ │
│  │ chat panel)    │   └──────────────┘   └─────────────────┘ │
│  └──────┬────────┘                                           │
└─────────┼─────────────────────────────────────────────────────┘
          │ HTTPS (lesson context + student message only)
          ▼
┌─────────────────────────┐
│ Serverless AI Proxy      │  - injects versioned system prompt
│ (e.g. Vercel Function)   │  - calls moderation check
│                          │  - calls LLM API
│                          │  - never stores PII; stateless
└──────────┬───────────────┘
           ▼
   ┌────────────────┐
   │ LLM Provider API │
   └────────────────┘
```

Key property: **all student code execution happens client-side** (Pyodide in
a Web Worker). The only network call is the AI chat turn, and it carries no
executable code side effects — just text context for the tutor.

## 3. Frontend Architecture

### 3.1 Stack

- React 18 + TypeScript, built with Vite.
- State management: React Context + `useReducer` per lesson (no need for
  Redux/Zustand at MVP scale — one active lesson at a time).
- Animation: D3.js for data-bound SVG diagrams (enter/update/exit tied to
  real structure state), Framer Motion for transition easing/micro-polish.
- Code editor: CodeMirror 6 (lighter weight than Monaco, faster cold load —
  matters since Pyodide already adds load time).
- Styling: CSS Modules or Tailwind (either is fine; pick one at
  implementation start and keep it consistent).

### 3.2 Top-level component tree

```
<App>
 ├─ <LessonRouter>                 (4 structures, linear within each)
 │   └─ <LessonLayout>
 │       ├─ <HookPanel>            (analogy intro)
 │       ├─ <AnimationStage>       (D3 canvas + playback controls)
 │       ├─ <CodeEditorPanel>      (CodeMirror + run/reset buttons)
 │       ├─ <TutorChatPanel>       (AI Q&A, always-visible side panel)
 │       └─ <ChallengePanel>       (mini-challenge + auto-grade feedback)
 ├─ <ProgressBar>                  (per-structure, persisted to localStorage)
 └─ <PyodideProvider>              (context exposing worker handle + status)
```

### 3.3 Folder structure (proposed, flat under repo root per project convention)

```
D:\AIgoNavigator\
├─ docs\                  (REQUIREMENTS.md, SPECIFICATION.md, ROADMAP.md)
├─ hello-algo\            (reference only — do not modify)
├─ src\
│  ├─ app\                (routing, App shell)
│  ├─ components\         (HookPanel, AnimationStage, CodeEditorPanel, ...)
│  ├─ engine\
│  │  ├─ structures\      (Array/LinkedList/Stack/Queue animation models)
│  │  └─ pyodide\         (worker setup, exec bridge, timeout guard)
│  ├─ tutor\              (chat UI, API client, transcript logging)
│  ├─ content\            (lesson JSON/TS content: hooks, exercises, challenges)
│  └─ state\              (lesson progress context/reducer)
├─ api\                   (serverless function: /api/tutor proxy)
├─ public\
├─ package.json
└─ README.md
```

## 4. Content Data Model

Lesson content is static, versioned data (not database-backed in MVP).
Proposed TypeScript shape:

```ts
interface Lesson {
  id: 'array' | 'linked-list' | 'stack' | 'queue'
  title: string
  hook: { analogy: string; imageOrAnimationId?: string }
  animationSteps: AnimationStep[]
  exercise: Exercise
  challenge: Challenge
}

interface AnimationStep {
  operation: string // e.g. "push", "insertAtHead"
  description: string // plain-language caption
  beforeState: StructureState
  afterState: StructureState
}

// Generic structure snapshot the animation engine renders.
// Shape varies slightly per structure (e.g. linked list has `next` refs).
type StructureState = {
  elements: Array<{ id: string; value: number | string; highlighted?: boolean }>
  pointers?: Record<string, string> // e.g. { head: "node-1", tail: "node-3" }
}

interface Exercise {
  starterCode: string
  solutionCheck: (stdout: string, finalState: unknown) => boolean
  hints: string[] // revealed progressively by the AI tutor
}

interface Challenge {
  prompt: string
  starterCode: string
  autoGrade: (
    stdout: string,
    finalState: unknown,
  ) => { pass: boolean; feedback: string }
}
```

## 5. Animation Engine Design

- Each structure (Array, LinkedList, Stack, Queue) has a dedicated renderer
  module under `src/engine/structures/` that maps a `StructureState` to SVG
  elements via D3's data-join pattern (`.data(elements, d => d.id)` with
  `enter/update/exit`).
- The **same renderer** is used for both (a) scripted lesson animation steps
  and (b) live reflection of the student's running code — the renderer only
  ever consumes a `StructureState`, it doesn't know whether that state came
  from a script or Pyodide output.
- Playback controller (`AnimationStage`) owns a step index into
  `animationSteps[]` and exposes play/pause/step/speed; transitions between
  `beforeState`/`afterState` are animated via Framer Motion `layout`
  animations driven by D3-computed positions.

## 6. Code Execution Pipeline (Pyodide)

1. On lesson load, `PyodideProvider` lazily spins up a Web Worker and loads
   Pyodide (show a loading indicator; target < 5s on school hardware per
   NFR-3).
2. Each "Run" click posts the student's code + exercise harness code to the
   worker.
3. The worker:
   - Resets interpreter globals for a clean run.
   - Wraps execution with a loop/step guard (e.g., `sys.settrace` counting
     executed bytecode steps, or a transpile-time injected counter) and a
     wall-clock timeout (`setTimeout` + worker termination/respawn if
     exceeded) to satisfy FR-7.
   - Captures stdout and the final state of the exercise's data structure
     object (via a harness function the student's code calls into, e.g. a
     provided `MyStack` class whose internal list is read back as JSON).
4. Worker posts back `{ stdout, error, finalState }` to the main thread.
5. Main thread:
   - Feeds `finalState` into the structure renderer (animation sync, FR-4).
   - Runs `Exercise.solutionCheck` / `Challenge.autoGrade` against the
     result.
   - Translates raw Python exceptions into kid-friendly messages via a
     lookup table (e.g. `IndexError` → "You tried to look at a spot in the
     list that doesn't exist — check your index number!").
6. If the worker hangs past the timeout, the main thread terminates and
   respawns it, preserving lesson/editor state (NFR-6).

## 7. AI Tutoring Pipeline

### 7.1 Request contract (`POST /api/tutor`)

```json
// Request
{
  "lessonId": "stack",
  "studentMessage": "why did my code print nothing?",
  "context": {
    "currentCode": "...student's current editor contents...",
    "lastRunResult": { "stdout": "", "error": null },
    "animationStepIndex": 3,
    "hintsUsedThisExercise": 1
  }
}
```

```json
// Response
{
  "reply": "Let's check together — what does `push` do to the stack...",
  "moderationFlag": false
}
```

- No student PII, account identifiers, or conversation history beyond the
  current lesson is transmitted (FR-9, NFR-1).
- The proxy is stateless per request; the frontend is the source of truth
  for "what the AI already said" (keeps a local transcript to assemble
  short rolling context for follow-up turns, bounded to the current lesson).

### 7.2 System prompt (versioned, server-side only)

Stored as `api/prompts/tutor-system-prompt.v1.md`, not exposed to or
editable by the client. Must encode (per FR-10):

- Reading level: grade 4–6.
- Socratic/hint-first behavior; only give a direct answer after
  `hintsUsedThisExercise >= 2`.
- Hard scope boundary: only array/linked list/stack/queue topics; redirect
  anything else back to the lesson.
- Refusal behavior for unsafe/inappropriate input.

### 7.3 Moderation

- Input (`studentMessage`) and output (`reply`) both pass through a
  moderation check before the reply reaches the UI (FR-11).
- On moderation failure: return a fixed canned response (e.g., "Let's get
  back to our stack lesson! What part would you like help with?") and flag
  `moderationFlag: true`; log the flagged turn for manual review.

### 7.4 Transcript logging

- Stored client-side only (`localStorage`, keyed by lesson + session date),
  per FR-12.
- "Export session log" button downloads the transcript as JSON for a
  parent/teacher to review (substitutes for a dedicated viewer in MVP, per
  §1).

## 8. Non-Functional Implementation Notes

- **Pyodide load time (NFR-3):** load Pyodide only when the student reaches
  the first `CodeEditorPanel`, not on initial app load; cache the WASM
  bundle via standard browser HTTP caching.
- **Browser support (NFR-5):** no polyfills for legacy browsers; rely on
  Vite's default modern target.
- **Accessibility baseline:** large click targets, color choices that don't
  rely on red/green alone (colorblind-safe), captions for all animations
  (text alongside visuals, not visual-only).

## 9. Testing Strategy

- **Unit tests** (Vitest): structure renderer state transforms, auto-grade
  functions, Python exception → kid-friendly message mapping.
- **Worker/integration tests**: Pyodide execution harness for each of the 4
  structures' starter/solution code pairs.
- **AI proxy tests**: mocked LLM responses to verify moderation branching
  and system-prompt context assembly (no live API calls in CI).
- **Manual pilot QA**: scripted walkthrough of all 4 lessons end-to-end on
  Chromebook-class hardware before pilot.

Every `ROADMAP.md` phase's exit criterion must be backed by automated
coverage wherever the criterion is actually automatable — not just build/
lint passing. Animation timing/easing, hardware-specific load time, and
real-browser/real-LLM judgment calls are the only things that stay
manual-only; everything else gets a test. Each test file gets a companion
report in `docs/bug-reports/` per that folder's README.

| Phase                    | Automated coverage                                                                                                                                                                                                                                                                                                       | Stays manual                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1 (Stack animation)      | `stackLayout.test.ts` (layout math); `AnimationStage.test.tsx` (stepping/play/pause controller logic, using a trivial render prop so it doesn't depend on Stack-specific rendering); `StackRenderer.test.tsx` (SVG structure/highlight styling, Framer Motion mocked out); `App.test.tsx` (end-to-end render smoke test) | Animation timing/easing/spring motion — visual-only, checked once in the browser                                       |
| 2 (Pyodide exec)         | The `pyodide` npm package runs in Node too — test the exec-bridge logic directly (stdout capture, exception→kid-friendly-message mapping, loop/step-guard triggering within a bounded test timeout) without going through the browser Worker                                                                             | Actual `postMessage`/Worker plumbing (jsdom's Worker support is too limited to trust); real-browser timeout/respawn UX |
| 3 (AI tutor)             | Mock the LLM client; unit-test the proxy handler directly — moderation-triggered canned response, system-prompt context assembly, no live API calls in CI                                                                                                                                                                | Actual Socratic-quality/tone of real LLM responses (needs human judgment)                                              |
| 4 (Full lesson loop)     | `Exercise.solutionCheck`/`Challenge.autoGrade` are pure functions → unit test directly; `localStorage` progress persistence → unit test (jsdom provides `localStorage`)                                                                                                                                                  | NFR-3 load-time target on real school hardware                                                                         |
| 5 (Remaining structures) | Same four-test pattern as Phase 1, repeated per structure (layout math / controller logic / renderer structure / lesson smoke test)                                                                                                                                                                                      | Same manual animation-polish check, per structure                                                                      |
| 6 (Pilot hardening)      | Worker respawn-on-hang logic (built in Phase 2) gets its own unit test with a mock Worker that hangs/throws, written at the time it's built — not deferred to Phase 6                                                                                                                                                    | Cross-browser matrix, accessibility audit, AI transcript sampling, real forced-crash UX in-browser                     |
| 7 (Pilot)                | —                                                                                                                                                                                                                                                                                                                        | Inherently manual; success metrics measured per REQUIREMENTS.md §10                                                    |

## 10. Explicit Out-of-Scope Reminders (carried from REQUIREMENTS.md)

No accounts/auth, no server-side persistence/database, no trees/hashing/
sorting/graphs content, no block-based programming, no native mobile app —
see REQUIREMENTS.md §3 for the full non-goals list.

## 11. Game Pivot — "Stack Ruins" (Underground Ruins Theme)

### 11.1 Why this pivot

The report-card-style lesson page (hook → animation → code → tutor →
challenge, all as stacked `<section>` cards) tested the mechanic but did not
make the Stack concept feel like something worth exploring. The project is
being reshaped into a small, self-contained game — an underground ruins
where a stack of carved stones is the literal mechanic the player
manipulates to proceed. The 2026-11-05 slice deliberately narrowed scope to
**Stack only**. That historical limit is superseded by REQUIREMENTS.md §12
and this document's §12 for the approved Array/LinkedList/Queue extension;
the shipped Stack room design below remains applicable.

### 11.2 Source documents

Two documents in `docs/` drove this design and should be treated as the
canonical content brief, not duplicated here:

- `docs/prompt.md` — the prompts used to generate code and assets, organized
  by phase; useful as an implementation checklist and for regenerating
  assets with consistent framing.
- `docs/picture_summary.md` — the authoritative asset manifest: every file
  name, its visual content, pixel dimensions, and the "no UI/text baked into
  images" constraint. Treat §11.6 below as a _status report_ against that
  manifest, not a replacement for it.

### 11.3 Narrative framing

A small sprite (the player's guide, not the player's avatar) leads the
student through a ruins hall. Three rooms gate progress in order:

1. **Trial of Stones** (`stone-trial`) — pure observation: watch stones being
   stacked and unstacked, build intuition for Last-In-First-Out before
   touching code.
2. **Stairway Repair** (`stairway-repair`) — the first hands-on level:
   write `push`/`pop` calls against a provided `MyStack` class to make the
   live stack match a target pattern of stone glyphs, which opens a stone
   door and reveals a magic stairway.
3. **Forked Path** (`forked-path`) — a path-backtracking maze where entering
   a dead end pushes the room onto a _second_, independent stack (the
   "path stack"), and backing out of a dead end pops it — the stack
   mechanic re-applied to spatial navigation instead of data values.

### 11.4 Reused vs. new architecture

**Approved extension (2026-11-08): Teach Xiao Tuo practice bank.** After
the maze exit, unlock a fourth, optional room. Select four child-adapted
problems from the linked LeetCode list's Stack sections: 1441, 844, 2390, 1047. Use original short stories/examples and link each source; do not copy
editorials or require a LeetCode account. The existing maze gem remains valid.

Each activity has a deterministic three-stage loop: demonstrate stack
actions; explicitly correct Xiao Tuo's initially mistaken FIFO belief by
choosing LIFO and explaining top-only access; teach using optional own words;
then solve a fresh transfer example. Correct actions alone cannot skip the
teaching stage. Incorrect actions never mutate the stack; empty backspaces
are ignored, empty pops blocked, and peek never consumes input. The displayed
sprite changes from confused to testing to learned only after these gates.
Free text is conversation, not a keyword-based proof of understanding.

Three chat shortcuts and a separate coach reuse the local/remote Tutor
transport with server-selected, versioned practice prompts. Xiao Tuo acts as
the learner; the coach asks guiding questions. Neither mode may provide
complete solutions/code even after many hints. AI replies cannot award mastery.
Progress stores only versioned known exercise IDs and the bank-unlock flag,
not explanations or chat. Existing three-room unlock schema is unchanged.
Practice chat is scoped in memory per exercise/mode; optional export is local.
Hints, retry, keyboard actions, visible stack/top labels and reduced motion
remain usable without any model connection. Report all automated cases and
outcomes in TEST-RESULTS.md and add companion scenario documentation; record
live browser/AI checks separately, including unverified limitations.

**Team world-map integration (2026-11-08):** App owns hash navigation between
the illustrated World Adventure Map and `/#/stack`. GameStage retains all
three rooms plus the optional room-02 tutor, and hosts the expandable skills
handbook. Only ForkedPathRoom's final exit reports module completion through
GameStage to App. App records one idempotent data gem in the team's separate
adventure-progress key; the existing room unlock schema is unchanged.
The other three map regions show a locked dialog. Source revision and merge
decisions are recorded in TEAM-MERGE.md.

**Tutor re-integration decision (2026-11-08):** The requested Phase 3
continuation reuses the Stack tutor inside Stairway Repair (room 02).
The student explicitly opens the optional chat. At Ask time it receives
current Python code, last run output/error, target glyph order and current
stack state, labelled as untrusted data. It does not execute code or unlock
rooms. Trial and Forked Path remain independent of AI. The existing proxy,
moderation, hint-first prompt and local transcript/export are retained.
The UI discloses that questions and lesson context are sent to the AI service.
This decision supersedes the table's original deferred-integration note below.

| Layer                                                                              | Status                                   | Notes                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/engine/pyodide/*` (Worker, exec bridge, timeout/respawn, error mapping)       | **Reused unchanged**                     | Phase 2 already satisfies everything Stairway Repair needs: run student code, read back final stack state, map Python exceptions to kid-friendly text.                                                                                        |
| `src/components/CodeEditorPanel.tsx`                                               | **Reused, restyled only**                | Same CodeMirror behavior; visual theme changes per §11.8, no logic changes.                                                                                                                                                                   |
| `src/engine/structures/types.ts` (`StructureState`)                                | **Extended, not replaced**               | Add an optional `glyph` field per element (`'base' \| 'moon' \| 'sun' \| 'star' \| 'cracked'`) so the same state shape drives both the old plain-rectangle renderer (kept for any non-game regression tests) and the new stone renderer.      |
| `src/components/StackRenderer.tsx`                                                 | **Replaced by `StoneStackRenderer`**     | New component renders stone sprites instead of rectangles; layout math (`computeStackLayout`) is reused unchanged — only the visual mapping from position → rendered element changes.                                                         |
| `src/content/stackAnimationSteps.ts`, `stackExercise.ts`                           | **Replaced with level-specific content** | Trial of Stones gets its own scripted sequence; Stairway Repair gets a target-pattern exercise definition (see §11.5.2).                                                                                                                      |
| Lesson-page shell (`App.tsx`'s card sections, `.lesson-header`/`.lesson-card` CSS) | **Removed**                              | Replaced by the room-based `GameStage` shell in §11.8.                                                                                                                                                                                        |
| Tutor (`src/tutor/*`, `src/components/TutorChatPanel.tsx`, `api/tutor/*`)          | **Untouched, not wired into the game**   | Phase 3 code stays in the repo and keeps passing its own tests; it is simply not rendered inside the game shell for this phase. Re-integration (e.g. the sprite becoming the tutor's mouthpiece) is an explicit future decision, not assumed. |
| Forked Path (path stack, maze generation, SVG node graph)                          | **New**                                  | No existing code to reuse; see §11.5.3.                                                                                                                                                                                                       |

### 11.5 Level designs

#### 11.5.1 Trial of Stones

- Non-interactive: reuses the `AnimationStage` playback controller
  (play/pause/step/speed) unchanged, pointed at a new scripted
  `StructureState` sequence that pushes 3–4 glyph stones then pops them,
  authored to visually demonstrate LIFO.
- Sprite shows `guide` pose with a caption panel explaining "last one placed
  is the first one removed" in plain language.
- Completion condition: the student has stepped or played through the full
  sequence once. No code, no grading — this is the hook-equivalent step.
- On completion: sprite switches to `happy` pose, `fx-sparkle` plays once,
  advance to Stairway Repair.

#### 11.5.2 Stairway Repair

- A **target pattern** is shown (e.g. `[base, moon, star]`, bottom to top)
  rendered as a small reference stack of the same stone sprites, outside the
  interactive area.
- The student edits Python calling a provided `MyStack` (reused from Phase
  2's harness, extended with a `glyph` parameter on `push`) to make the live
  stack match the target exactly, in order.
- The target also exposes visible code-name tokens `base → moon → star`,
  explicitly labeled bottom to top. Room-local deterministic hints reveal
  progressively: the missing stones, push order/arguments, then the two missing
  lines. Previously revealed hints remain visible; hints never edit code and
  reset on Replay. No tutor/AI integration is used.
- Instructions explain the provided `MyStack`, `push(number, 'glyph')` syntax,
  top-of-stack placement, and that every Run executes the complete program
  afresh and displays its final state rather than a step-through animation.
- `getStairwayFeedback` supplies teaching feedback separately from the success
  checker: correct-prefix missing stones, first wrong position bottom to top,
  extra stones and pop guidance, empty stack, and missing (`null`) state. Omitted
  glyphs retain the existing base default; exact-match success semantics stay
  unchanged. Python errors are shown separately. While loading/running, retained
  stones are explicitly labeled as the previous result and stale feedback/errors
  are hidden; no-result and current-result labels distinguish other states.
- `Exercise.solutionCheck` (existing type, SPEC §4) compares final
  `StructureState.elements[].glyph` array against the target array —
  deterministic, no AI grading, consistent with SPEC §1's existing decision
  to keep MVP grading hand-authored.
- On success: `stone-door-open` swaps in for `stone-door-closed`
  (cross-fade, anchors aligned per the asset manifest), `switch-active`
  replaces `switch-inactive`, `magic-stairs` fades in, sprite does a
  position-tween "climb" (no frame-by-frame sprite animation — see §11.6
  on asset constraints), then advances to Forked Path.
- On runtime error: sprite switches to `thinking` pose and the existing
  kid-friendly error panel (Phase 2) displays; the page/game state does not
  reset.

#### 11.5.3 Forked Path

New state model, kept separate from the Stack-lesson `StructureState` to
avoid overloading one type with two unrelated meanings:

```ts
type RoomNodeType = 'entrance' | 'hall' | 'corridor' | 'deadEnd' | 'exit'

interface RoomNode {
  id: string
  type: RoomNodeType
  connections: string[] // adjacent node ids
}

interface PathState {
  nodes: Record<string, RoomNode>
  visited: Set<string>
  currentNodeId: string
  pathStack: string[] // node ids pushed on entering a branch, popped on backtrack
}
```

- Map is generated at level start as a small connected bidirectional tree,
  with one entrance, one leaf exit, at least one non-exit dead end, and a
  branching hall. Node types reflect actual topology. Layout is a pure
  client-side function of topology, rendered as SVG nodes and unique edges;
  the background is a blank stone board, never a baked-in map.
- The stack initially contains the entrance; Top always identifies the
  current room. Every adjacent child move pushes, including re-entering an
  explored branch. First visits add to an immutable, monotonically growing
  visited set; popping never erases exploration history. Non-adjacent
  moves are rejected. Clicking the parent or Backtrack pops exactly once;
  the entrance cannot be popped. Movement is locked during an edge tween
  and reduced-motion users move immediately.
- Reaching a `deadEnd` requires the student to back out: popping
  `pathStack` moves the marker back along the same edge. The current
  `pathStack` is rendered as a small sidebar using the **same stone-stack
  visual language** as the main game (small node-icon "stones"), making the
  abstraction explicit: this is still a stack, just holding rooms instead
  of glyphs.
- Reaching `exit` freezes exploration and displays game completion and a
  badge placeholder. Replay generates a new maze. Switching rooms unmounts
  and resets local room state but never re-locks previously unlocked navigation.
  Stairway Repair advances only on its explicit success-panel Continue button.
- This is the one new piece of non-trivial logic in the pivot and gets its
  own test file per ROADMAP.md Phase 6's automated-test row: map generation
  validity (exactly one exit, every node reachable, at least one dead end)
  and push/pop-on-backtrack state transitions, as pure functions decoupled
  from rendering.

### 11.6 Asset status (cross-check against `docs/picture_summary.md`)

As of this pivot, `picture/` contains 7 files, all generated as
**1536×1024, non-transparent PNGs saved with a `.jfif` extension** — not yet
in the final formats/sizes the manifest specifies. This is tracked here as
an explicit gap, not assumed-solved:

| Manifest entry                                                              | Status                                          | Gap                                                                                                                    |
| --------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ruins-style-reference`                                                     | Present (reference only, never rendered in-app) | None — correct as-is                                                                                                   |
| `ruins-hall-bg`, `ruins-map-bg`                                             | Present                                         | Needs crop/resize to `1920×1080` / `1600×1000`; currently has no transparency requirement so this is cosmetic only     |
| `stone-door-closed/open`                                                    | Present                                         | Needs re-crop to `768×1024` **with background removed** (currently opaque full-frame renders, not transparent cutouts) |
| `switch-inactive/active`                                                    | Present                                         | Needs re-crop to `256×256` **with background removed**                                                                 |
| `block-base/moon/sun/star/cracked` (5 files)                                | **Missing**                                     | Blocks Stairway Repair entirely — these are the stones the student stacks                                              |
| `sprite-idle/guide/thinking/happy` (4 files)                                | **Missing**                                     | Blocks the guide character in all three levels                                                                         |
| `magic-stairs`                                                              | **Missing**                                     | Blocks the Stairway Repair completion visual                                                                           |
| `node-entrance/hall/corridor/deadEnd/exit` (5 files)                        | **Missing**                                     | Blocks Forked Path                                                                                                     |
| Reward/decoration/fx assets (badge, code book, scroll, glow, sparkle, dust) | **Missing**                                     | Non-blocking per `docs/prompt.md`'s own "Phase 3 beautification, non-blocking" framing                                 |

**Decision:** implementation does not block on art. Every sprite-consuming
component (`RuinsDoor`, `RuinsSwitch`, `Sprite`, stone renderer,
`MagicStairs`) is built against a small asset-index module
(`src/assets/index.ts` mapping logical names → file paths) so swapping a
placeholder for a final asset is a one-line change, never a component
rewrite. Placeholders are simple colored rounded-rect/circle SVGs at the
exact final dimensions and aspect ratios from the manifest, so layout code
written against placeholders does not need to change when real art lands.

### 11.7 What stays exactly as built (Phases 0–3)

To avoid re-litigating already-shipped, already-tested work: Pyodide Worker
lifecycle, the exec-bridge stdout/error contract, the kid-friendly Python
error mapping table, the CodeMirror editor component's editing behavior,
and all of their existing automated tests and bug reports are **not**
touched by this pivot. Only the visual shell around them changes.

### 11.8 Visual & UI constraints carried from the asset brief

- Palette (from `docs/prompt.md` §5): deep indigo `#1a2438`, slate-blue
  `#3b4a63`, warm stone `#b8a998`, arcane cyan `#4dd0e1`, warm gold
  `#f2c265`. These replace the current lesson-page palette (SPEC §8's prior
  CSS) wholesale for the game shell.
- All text (captions, buttons, dialogue) is rendered as real DOM text, never
  baked into an image — consistent with `docs/picture_summary.md`'s closing
  note that assets contain no text/UI/arrows/routes.
- Path highlighting, the stack-top marker, dialogue boxes, and ground
  shadows are all CSS/SVG/Framer Motion, not pre-rendered art, per the same
  manifest note — this is a hard constraint on every new component, not a
  style preference.

## 12. 四板块扩展技术设计（Phase 10）

### 12.1 内容来源、模块与边界

知识基线为 REQUIREMENTS.md §12.2 指定的本地 `hello-algo/` 版本
`455e8c1281846c2a2c6b9c7fe2fd069bc87b7a85`。仅参考数组、链表、队列章节的
概念及操作规则，原创故事、题目、代码与图示。新增能力在 Phase 11 实现，
各区分别在 Phase 12/13/14 验收后开放，不能仅因路由注册就标记已实现。

| moduleId    | 路由             | 地图区       | 三关 taskId                                                | 第四阶段          |
| ----------- | ---------------- | ------------ | ---------------------------------------------------------- | ----------------- |
| array       | `/#/array`       | Supply Camp  | array-observe / array-code / array-apply                   | array-teach       |
| linked-list | `/#/linked-list` | Misty Forest | linked-list-observe / linked-list-code / linked-list-apply | linked-list-teach |
| queue       | `/#/queue`       | Harbor Pier  | queue-observe / queue-code / queue-apply                   | queue-teach       |
| stack       | `/#/stack`       | Stack Ruins  | 保留现有房间 ID                                            | 保留已有四题 ID   |

模块注册表保存标题、可用状态、路由、房间内容、知识手册、harness ID、题库与
renderer；不保存学生状态。不设置跨板块前置条件。已开放区从第一关开始，
保存的解锁允许重访后续关卡。新模块共用 ModuleStage 外壳，Stack GameStage
保留专有迷宫与石阶，不为抽象统一而重写已交付流程。

计划职责：`src/content/modules/` 放内容及任务定义；`src/engine/structures/`
放各自纯操作与校验；`src/engine/teaching/` 放教学状态机；执行协议继续位于
`src/engine/pyodide/`；模块视图放 `src/components/game/`；提示词仍仅放在
`api/prompts/`。这些是后续文件职责约定，不代表文件已创建。

### 12.2 状态与操作契约

以下类型为新协议设计；旧 `StructureState` 和 `runStackCode` 通过适配器继续
服务 Stack。`Value` 限有限数值或最多 32 字符的字符串，教学内容不含可执行值。
ID 在同一题的一次运行内稳定且唯一，不能用数组位置或值作为节点身份。

```ts
type NewModuleId = 'array' | 'linked-list' | 'queue'
type ModuleId = NewModuleId | 'stack'
type Value = number | string
type Item = { id: string; value: Value }
type ArrayState = { kind: 'array'; items: Item[]; capacity: number }
type LinkedListState = {
  kind: 'linked-list'
  head: string | null
  nodes: Array<{ id: string; value: Value; next: string | null }>
}
type QueueState = { kind: 'queue'; waiting: Item[]; served: Item[] }
type NewState = ArrayState | LinkedListState | QueueState
type OperationEvent = {
  sequence: number
  operation: string
  args: Record<string, Value | null>
  before: NewState
  after: NewState
  returned: Value | Value[] | null // traverse returns a list of values
  accepted: boolean
  errorCode: string | null
}
```

**共同行为：** 操作为纯状态转换，返回新状态、事件及反馈。事件从 0 连续编号。
非法操作产生 rejected 事件，before/after 相同，不推进任务；合法读取也记录
事件但不改状态。UI 操作与 Python harness 使用同一操作语义。判题在任务初态
重放事件、校验每一步和最终状态，不信任客户端提交的 pass 或 AI 给出的结论。
这是教学证据校验，不是防作弊或高风险考试安全系统。

| 结构 | 合法操作与参数                                                                                                                       | 不变量及错误                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 数组 | get(index)、set(index,value)、insert(index,value)、remove(index)、traverse()、grow(capacity)                                         | length = items.length；0 ≤ length ≤ capacity ≤ 16；索引须整数且非负；访问/修改/删除 index < length，插入 index ≤ length；grow 必须严格增大容量 |
| 链表 | visit(id)、setHead(id/null)、link(id,nextId/null)、insertHead(id)、insertAfter(previousId,id)、removeHead()、removeAfter(previousId) | 节点 ID 唯一、引用存在；每个节点只有一个 next；遍历有界；本轮目标为无环单链；高层插删原子地更新全部引用                                        |
| 队列 | enqueue(value)、dequeue()、peek()                                                                                                    | 入队到 waiting 尾部；出队移走首项并追加 served；peek 返回首值且 waiting/served 均不变；front/rear 派生自首尾 ID，空时均为 null                 |

数组 insert 为后部整体右移，remove 后整体左移，不能覆盖或留洞；容量不足
返回 CAPACITY_FULL，允许学生 grow 后重试；get/remove/peek/dequeue 返回实际值。
队列 enqueue 分配新 ID，重复值不得混淆到达顺序；不限制固定队容量，但限制
序列化证据大小。链表 nodes 含题目提供的全部节点，未接入或被移除节点可保留
为可见散点；正确性以从 head 可达的身份序列、要求的引用和目标集合判断。
insertHead/insertAfter 只接入尚不可达且 next 为 null 的节点；删除时被移除
节点的 next 置 null，其余未删除链路须保留；空头或无后继时返回 EMPTY。

底层 link/setHead 用于“修复信标链”的可视或代码任务，允许临时断开或形成环，
以便学生观察错误；出现未知 ID 时拒绝修改。快照可展示已知节点形成的环，
但遍历至多访问 nodes.length + 1 次并报告 CYCLE，任务判定不通过且可再次修改。
高层插入不能引入环。null 在画面标作 None，严禁把节点右侧的画面元素当 next。

最多 16 个题目节点/物品，最多 128 个操作事件；题目数据必须在界限内，超出
返回 EVIDENCE_LIMIT，不截断后仍判通过。运行输出最多保留 4,000 字符并标注
已截断，不影响独立结构证据。序列化状态拒绝未知字段、非有限数和不匹配的 kind。

### 12.3 动画、Python 与判题连接

动画步骤采用 `{event, captionKey, focusIds}`。脚本以初态和合法操作生成事件，
运行结果经事件重放校验后交给同一 renderer。数组焦点展示移动前后索引，
链表保留节点布局并突出引用变化，队列突出 front/rear 及服务历史。
播放位置只影响展示，不能再次执行已发生的操作；后退展示既存 before 快照。
播放暂停、速度 0.5/1/2 倍、单步均不改变判定；减少动态效果直接切换快照。
动画中禁用新的变更动作，读取和回放无奖励副作用；字幕、焦点和标签均为 DOM/SVG。

**新执行协议草案：**

```ts
type RunIdentity = {
  moduleId: ModuleId
  taskId: string
  exampleId: string
  sessionId: string // 组件生命周期内的随机标识，不持久化
  requestId: number
  workerGeneration: number
}
type ModuleRunRequest = RunIdentity & {
  type: 'run-module'
  protocolVersion: 2
  code: string
}
type ModuleRunResult = RunIdentity & {
  type: 'module-result'
  protocolVersion: 2
  stdout: string
  error: { code: string; message: string } | null
  initialState: NewState | null
  finalState: NewState | null
  events: OperationEvent[]
}
```

`run-module` 仅用于新三区；Stack 保留原 run/result 协议和结果适配路径。
Phase 11 仅注册每个新模块 `*-code/main` 的可信执行夹具；其他房间与例子须随
对应模块交付注册，不能通过随意提供 taskId 来执行未注册内容。
Worker 从可信任务注册表按模块、任务和例子选择固定初态及 harness，拒绝未知
组合，不接受 UI 自定义 Python harness 或任意状态读取表达式。新结果不得通过
类型断言强转成旧 Stack 结果。所有字段须在运行时校验，而不仅是 TypeScript。

每次 Run 创建独立 Python globals，重新装入教学对象，执行后在 finally 清理
代理对象及 globals。提供 `array`（TeachingArray）、`chain`（TeachingChain）、
`queue`（TeachingQueue）三个固定变量，对应 §12.2 操作；学生仅补充方法调用
或遍历代码。Phase 11 的三个实例共用 TeachingStructure Python 类实现各自方法，
公开变量仍分别为 array/chain/queue。harness 记录操作与返回值，私有快照序列化实际对象；直接覆盖
教学变量、绕过接口改内部属性或快照不一致均反馈 INVALID_EVIDENCE，不授予成功。
这不把浏览器 Python 描述为对恶意代码的强隔离，保留原 Worker 沙箱边界。

主线程同一时刻仅一个运行；初始化上限 30 秒、执行上限 5 秒，沿用当前上限。
超时/worker error/messageerror 结束等待并 terminate，下一次 Run 重建 Worker；
不丢当前编辑内容或既有进度。切换任务、例子、模块及卸载使 session 失效，
取消活动运行，提升 workerGeneration；结果身份必须与活动运行全部相同才接收。
重复结果只结算一次。Run 失败可展示诊断快照但不写完成状态；重置恢复本题初态。
代码只在浏览器执行；只有学生主动 Ask 时才提交限定的本题代码作为 AI 文本上下文。

判题步骤：校验身份和结构 → 从可信初态重放事件 → 比对返回值和最终快照 →
检查本任务操作限制、观察目标和完成条件 → 显示具体反馈。示范/挑战允许的
合法等价轨迹均可通过，不以一串固定按钮序列或代码字符串作为唯一答案。
包含非法尝试的交互可修正后继续；rejected 事件不算有效证据，后续仍须完整
完成目标。直接改最终结构、漏掉必要观察或绕过规定操作不能凭终态过关。

### 12.4 三关、手册与导师内容

第一关每个操作族均有动画字幕和至少一次预测检查，全部观看并通过基础规则
检查才解锁第二关；重试不限次数。第二关只在成功 Run 的状态与事件证据通过时
显示 Continue，点击后解锁第三关；第三关通过后点击 Complete 才获得宝石并
开放题库。打开页面、动画播完、Tutor 回复或提示计数均不能代替判定。

| 板块 | 第二关：固定初态与目标                                                                                  | 第三关：独立应用                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 数组 | `[A,B,C]` 容量 4；插入 X 至索引 1，替换原 C 为 D，删除 B；最终 `[A,X,D]`，须保留 A/C 的身份追踪直至替换 | `[rope,food,lamp]` 容量 3，扩到 5，索引 1 插入 map，移除 food；遍历返回 `[rope,map,lamp]`，验证 grow 与移动 |
| 链表 | `a -> b -> None`、散点 x；将 x 插在 a 后，再删除 a；head=x 且 `x -> b -> None`                          | 布局打乱的 a/b/c/d，按给定信件顺序 a,c,b,d 连接；从 a 遍历并结束于 None，全部且仅访问要求节点               |
| 队列 | 入队 A/B，peek 返回 A，出队 A，再入队 C；waiting 为 B/C，served 为 A                                    | 按事件到达 K/L、服务一次、到达 M、服务两次；served=K/L/M，waiting 空；事件消费顺序固定                      |

数组 set 保留格内物品的 ID 并替换其值；insert 分配新的 ID，remove 移除原 ID，
因此“原 C”可被追踪。链表信件挑战用 link/setHead，自选连接次序，但必须最后
执行 visit 沿链检查全部要求节点；相同值不能代替指定身份。队列事件挑战每次
只开放当前事件的动作，peek 可随时观察但不消耗到达/服务事件。

手册内容 ID 按 `moduleId/topicId` 命名。数组：索引与值、访问替换、移动、
遍历、长度容量与扩容、Python list 区别；链表：节点与引用、head/None、遍历、
插入删除、断链与环、数组比较；队列：FIFO、front/rear、入出队、peek、空队列、
与栈比较、deque 命名说明。双向链表、循环队列和复杂度证明标作可选扩展。
每条含定义、类比、前后例子、误解和关联操作；错误码提供 topicId 可直接展开，
关闭手册回到原任务与焦点。所有阶段有导师入口，不能只在编程关展示。

### 12.5 十二道教小拓练习内容

题目结构固定为 moduleId、exerciseId、contentVersion=1、标题、故事、来源、
误解、allowedOperations、demo、transfer、ruleId、reasonId、hints（三元组）、
successCaption 和 failureFeedback。来源记录 `original` 及 §12.1 对应知识章节。
每题支持三个快捷问题：“你觉得该操作哪个对象？”、“让我解释这个规则”、
“我们试一个新例子好吗？”，按本题名词替换“对象”。以下目标和证据仅供内容
作者与判题使用，不整段呈现给学生；学生只看到任务条件、当前输入和局部提示。

**数组：**

| exerciseId / 标题             | 示范初态、任务与目标                               | 独立迁移                                             | 允许操作 / 判定证据                     | 误解；正确规则 / 原因 ID                        |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| array-index / 找到第几个格子  | `[A,B,C]`，读取第一个格子，返回 A 且数组不变       | `[K,L,M,N]`，读取第三个，返回 M 且不变               | get；正确位置的实际读取事件             | 第一个索引为 1；zero-based / position-not-value |
| array-insert / 中间插入补给   | `[A,B,C]` 容量 4，在索引 1 插 X，得到 `[A,X,B,C]`  | `[K,L]` 容量 3，在索引 1 插 M，得到 `[K,M,L]`        | insert；目标值和身份顺序，原后缀完整    | 插入覆盖旧物品；shift-right / preserve-existing |
| array-remove / 删除后补齐空位 | `[A,B,C,D]`，删索引 1，返回 B，得到 `[A,C,D]`      | `[K,L,M]`，删索引 0，返回 K，得到 `[L,M]`            | remove；返回值、移动与有效长度          | 删除留下洞；shift-left / contiguous-used-slots  |
| array-grow / 储物格满了怎么办 | `[A,B]` 容量 2，先扩到 4，再尾插 C，得到 `[A,B,C]` | `[K,L,M]` 容量 3，扩到 5，再尾插 N，得到 `[K,L,M,N]` | grow/insert；先扩后插、容量与旧身份保持 | 长度等于容量；length-vs-capacity / spare-space  |

数组每题恰好三个提示（按序逐次显示）：

- array-index：“先找索引标签。”“标签从 0 开始。”“第几个位置和标签上的数字有什么关系？”
- array-insert：“看看插入点后面的物品。”“插入需要留出位置。”“后面的物品向哪边挪才不会丢失？”
- array-remove：“找出要拿走的位置。”“后面的物品需要补上。”“删除后有效长度应该怎样变化？”
- array-grow：“比较长度与容量。”“满格时先增加空间。”“搬到更大区域后，旧物品顺序需要改变吗？”

**链表：** 节点 ID 与值分别显示；示范中的 a/b/c 和迁移中的 p/q/r 等身份不同。

| exerciseId / 标题                           | 示范初态、任务与目标                                                | 独立迁移                                                          | 允许操作 / 判定证据                                       | 误解；正确规则 / 原因 ID                               |
| ------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| linked-list-follow / 沿 next 找伙伴         | 布局打乱的 `a -> c -> b -> None`，从 head 沿链访问 a/c/b；a、b 同值 | `p -> r -> q -> s -> None`，访问 p/r/q/s，画面顺序不同            | visit；每次只能访问 head 或上一访问的 next，完整访问序列  | 往画面右边走；follow-next / reference-defines-order    |
| linked-list-head / 头部加入新信标           | `a -> b -> None` 与散点 x；插头得到 `x -> a -> b`                   | 单节点 p 与散点 y；得到 `y -> p -> None`                          | insertHead；head 更新，旧链保留                           | 不需要改 head；update-head / first-node-entry          |
| linked-list-insert / 中间接入信标           | `a -> b -> None` 与散点 x；a 后插 x，得到 `a -> x -> b`             | `p -> q -> r -> None` 与散点 y；q 后插 y，得到 `p -> q -> y -> r` | insertAfter；新节点指向旧后继，前驱指向新节点             | 只改前驱会丢后链；preserve-successor / two-links       |
| linked-list-remove / 移除信标仍保持道路连通 | `a -> b -> c -> None`，a 后删除 b，得到 `a -> c`                    | `p -> q -> None`，p 后删 q，再删唯一 head p；最终 head=None       | removeAfter/removeHead；返回移除值、剩余身份、尾/头空引用 | 擦掉值就是删除；bypass-node / reconnect-or-update-head |

链表每题恰好三个提示：

- linked-list-follow：“找到 head。”“箭头表示 next。”“如果把图上的节点换个位置，next 会变吗？”
- linked-list-head：“看看谁是入口。”“新节点需要接到旧入口。”“现在从 head 出发应该先见到谁？”
- linked-list-insert：“先认出前驱与后继。”“插入后不能丢掉后半条链。”“新节点的 next 应该保留通往哪里？”
- linked-list-remove：“找被移除节点和它后面的节点。”“剩余路径要连通。”“移除的是头或尾时，哪个引用要指向 None？”

**队列：** waiting 为队首至队尾，served 为实际离开顺序，事件脚本按从左到右消费。

| exerciseId / 标题               | 示范初态、任务与目标                                       | 独立迁移                                                   | 允许操作 / 判定证据                                           | 误解；正确规则 / 原因 ID                                   |
| ------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| queue-first / 谁先上船          | waiting=A/B/C，服务一次；返回 A，waiting=B/C，served=A     | waiting=K/L，服务一次；返回 K，waiting=L，served=K         | dequeue/peek；真实移除首项，未改变剩余次序                    | 最后来先走；fifo / earliest-waits-first                    |
| queue-rear / 新船停在哪里       | waiting=A/B，C 到达；得到 A/B/C                            | waiting=K，L 到达再 M 到达；得到 K/L/M                     | enqueue/peek；按脚本到达顺序追加，served 不变                 | 新船可插队首；join-rear / preserve-arrival-order           |
| queue-peek / 看看队首不让它离开 | waiting=A/B，查看返回 A，全部状态不变                      | waiting=K，查看返回 K，全部状态不变                        | peek；至少一次正确观察事件，不能只不操作                      | peek 会让船离开；peek-keeps / inspect-not-remove           |
| queue-service / 边到港边服务    | 空队列，依次到达 A/B、服务、到达 C、服务两次；served=A/B/C | 空队列，依次到达 K、服务、到达 L/M、服务两次；served=K/L/M | enqueue/dequeue/peek；消费所有事件，服务顺序与 waiting 均正确 | 空了还能出队或后来先走；fifo-nonempty / front-service-only |

队列每题恰好三个提示：

- queue-first：“找 front 标签。”“先到的先接受服务。”“front 和最后到达的船是同一艘吗？”
- queue-rear：“看看 rear 在哪里。”“新来的要排在已有船之后。”“加入新船会改变已有船的次序吗？”
- queue-peek：“题目让你查看还是送走？”“peek 只观察。”“操作前后的 waiting 和 served 应该怎样比较？”
- queue-service：“先读当前到达或服务事件。”“只有非空队列才能服务队首。”“服务完成后，下一艘是谁？它何时到达？”

统一失败反馈按验证失败项生成：操作不允许、索引越界、空间不足、引用非法、
遍历成环、空结构、返回值错误、轨迹缺失、顺序/身份错误、规则不符、迁移未完。
只指出出错对象和规则，附 topicId；不得输出下一整串操作或标准程序。
内容校验器须检查每题两个不同例子、已注册的操作/规则/原因、三个非空提示、
三个快捷问题和全部题目 ID 唯一；内容作者的解轨迹仅在测试夹具内保存。

### 12.6 教学状态机与确定性门槛

```text
intro → demonstrate → correct-rule → transfer-ready → transfer → learned
```

intro 显示任务和被明确标记为“小拓的错误猜想”的误解。demonstrate 由合法
操作与本题目标通过后才能提交进入 correct-rule。学生选择 ruleId 与 reasonId，
两者匹配本题定义才进入 transfer-ready；自由解释可选，只用于对话。
此时小拓复述规则但显示“待验证”，点击 Try new example 才加载 transfer 初态。
迁移目标通过后进入 learned，才显示 happy、最终复述并保存已教会 ID。

状态含 moduleId/exerciseId/contentVersion/exampleId、当前快照、事件、
selectedRule/Reason、hintLevel（0–3）及 phase。reducer 仅接受该题允许的事件；
不接受客户端或模型提交的 learned 布尔值。每次变更重新计算门槛，乱序提交无效。
更正规则时若还在 correct-rule 可任意重选；进入迁移后修改规则应返回该阶段
并清空迁移证据。重置当前示范撤回本轮后续门槛，但不抹掉历史已教会记录。
重置迁移只清空迁移操作，保留本轮已验证规则；Replay 从示范重新开始。
切题/换角色清空对应对话，不复用另一题证据；已教会的历史状态与本次练习阶段
分别显示。没有代码字符串、自由文字关键词、聊天次数或提示数通关条件。

UI、代码与聊天均不能直接写进度；只有判定成功后产生的应用完成/教学完成
事件可交给进度层。所有逻辑在客户端确定性运行，不承诺模型测出了理解程度。

### 12.7 Tutor 与小拓上下文

扩展 POST `/api/tutor` 的 lessonId 白名单为四种 ModuleId。保留现有 Stack
请求适配，新增 context 包含 taskId、exerciseId（可选）、exampleId、phase、
teachingMode、stateSummary、最近最多 8 个合法/非法动作、已验证 ruleId、
hintsUsedThisExercise、可选 currentCode 与 lastRunResult。请求只携带当前题；
stateSummary 不含完整目标解轨迹或其他题目，标作不可信数据。服务端根据
受信任的注册表验证 task/exercise 属于该模块，自行选择版本化提示词和知识摘要。

保持提问 500 字符、代码 2,000 字符、输出/错误各 500 字符、最近 6 轮且每轮
600 字符；结构摘要上限 2,000 字符，使用摘要生成器保留关键标签，不拼接整份
证据。超长输入按字段契约拒绝或明确标注摘要，不能默默改写任务。
总 HTTP body 上限 32 KiB。传输只在显式 Ask 时发生；知识手册、规则检查和
提示不调用模型。未知模块和任务在模型调用前拒绝。

导师角色在各关引导提问；teach-sprite 把学生视为老师，复述已纠正规则或就
尚缺部分提问；practice-coach 给局部提示。新三区沿用 Stack practice 的受限
意图模式：模型返回允许的 intent ID，服务端按模块/角色/教学阶段选择已审核
文本，原始模型代码、未知字段和未经审核的生成正文不直接显示到习题 UI。
非习题导师可用经过过滤的短回复，但仍禁止输出整题解法。任何 hintLevel 都不
解除该限制；覆盖历史 §7.2 的“两提示后直给”规则。模型角色口吻需人工审阅。

不把客户端的“已纠正规则”当完成授权；该标记仅影响对话，奖励仍取决于 §12.6。
回复带 requestId；UI 按 module/task/example/role/session 校验活动身份后显示。
切换角色先取消请求再创建新会话，过期、重复、超时回复丢弃，不显示到新题。
保留本地 CLI 55 秒、前端 60 秒上限；代理故障使用本模块的固定回退，提示可
继续练习，不暴露凭据/日志。不发送自动请求，不自动切换 provider 或读取登录文件。

习题聊天仅保存在当前题/角色内存，可手动导出；编程导师的本地日志保持明确
告知、按模块及会话隔离。发送前展示数据范围和隐私提示，不在进度存档保存
代码、姓名、自由解释、模型回复；无账号或服务器会话留存。覆盖 §7.4 的统一
localStorage 描述，旧 Stack 日志只读兼容，不混入其他板块的滚动上下文。

### 12.8 进度格式、旧存档与宝石

使用新 key `algonavigator.modules-progress.v2`，保留旧三个 key 不删除：
`algonavigator.stack-ruins.progress`、`algonavigator.stack-teaching.v1`、
`algonavigator.adventure-progress.v1`。新记录只存以下精确结构：

```ts
type ModuleProgress = {
  unlockedThrough: 1 | 2 | 3
  completed: boolean
  teachingUnlocked: boolean
  mastered: string[] // 仅本模块当前已知 exerciseId，去重、排序
}
type ProgressV2 = {
  version: 2
  modules: Record<ModuleId, ModuleProgress>
}
```

初始各区 `{unlockedThrough:1,completed:false,teachingUnlocked:false,mastered:[]}`。
第三关判定与显式 Complete 同时发生才将 completed 与 teachingUnlocked 置 true；
历史已开放 Stack 题库可迁移为 teachingUnlocked=true 而不自动授宝石。
completed=true 必须同时具备 unlockedThrough=3 与 teachingUnlocked=true；
mastered 非空必须已开放题库。冲突记录拒绝该模块项并回退到该模块初态。
额外字段/错误类型/未知版本拒绝相应记录或项；仅未知 mastered ID 被过滤，
重复 ID 去重，不能用坏值授奖。解析、读写错误均返回明确状态供 UI 提示存档
不可用，内存进度仍继续。新记录未知版本不覆盖写入，以免破坏未来格式。

读取流程：校验新记录 → 独立校验旧 Stack 记录 → 对 Stack 做单调合并。
room-unlock 的 unlockedThrough 取最大；旧 teaching unlocked 保留、mastered
仅接受 build/backspace/stars/pairs；旧 adventure 的精确布尔 stackCompleted
才迁移成 completed，同时推导解锁第三关与题库。旧宝石绝不赋予其他三区。
旧损坏项不影响新的有效记录，也不影响其他模块。先写新记录成功才视为迁移
已持久化；失败只在内存合并，下一次可重试；不能靠“已迁移”标志丢弃旧证据。

Phase 11 同时更新地图与 Stack 奖励入口，统一通过进度层读写新结构，保留
旧读取兼容但不再让旧 saveStackCompleted 覆盖其他区进度。运行时的 Stack
奖励、关卡及教学事件即时合并到统一内存源；旧 key 保留原样供回退核对。
宝石数由四区 completed=true 的数量派生，无独立可递增计数器；重玩只做集合
并集或 unlockedThrough 最大值，最多 4/4。刷新从第一关开场，保存入口可跳转；
不保存运行中代码、动画位置、链表路径或未完成教学阶段。

### 12.9 验证映射及设计完成检查

以下均为后续实施的验证计划，不是测试结果；每个具体测试还需记录输入、
预期、实际和状态。本文作者样例是可复核的判题夹具，不能充当浏览器验收。

| 需求 / 验收 ID          | 设计落点          | 计划自动测试                                                | 浏览器 / 人工补充                   |
| ----------------------- | ----------------- | ----------------------------------------------------------- | ----------------------------------- |
| §12.1/2；内容来源       | §12.1、12.4/5     | 模块和内容注册校验、来源及例子完整性                        | 教学内容与参考章节人工核对          |
| §12.3/4；ARR-01/02/03   | §12.2–5           | 数组状态变换、索引、容量、移动、布局/字幕及任务判定         | 三关真实 Python、扩容与移动动画     |
| §12.5；LL-01/02/03      | §12.2–5           | 引用/身份、插删、head/None、环及遍历边界、SVG 结构          | 打乱布局、重复值、错误链恢复        |
| §12.6；QUE-01/02/03     | §12.2–5           | FIFO、返回值、peek、不变量、交错事件及服务历史              | 三关真实执行与 front/rear 可读性    |
| §12.7；TEACH-01         | §12.5/6           | 十二题各自误解、拒绝动作不变、阶段门槛                      | 小拓错误猜想被明确标记              |
| TEACH-02/03/04          | §12.3、12.5/6     | 不同迁移样例、乱序提交、规则/原因、轨迹、提示、重置/重玩    | 逐题完整示范至迁移、无完整答案      |
| §12.8；AI-01            | §12.7             | 模块/task 白名单、意图白名单、注入/越界过滤与提示策略       | 四板块真实模型角色和话术审阅        |
| AI-02                   | §12.7             | 故障、超时、角色/题切换、重复/过期回复、脱离 AI 的判定      | 服务不可用时完成核心流程            |
| §12.10；RUN-01          | §12.3             | 各 harness、fresh globals、结果校验、身份、取消、超时重建   | 真实 Python 无限循环后修复再运行    |
| §12.9；NAV-01           | §12.1、12.4、12.8 | 路由、未开放页、独立入口、显式完成、奖励去重及旧存档        | 四区往返、刷新及 4/4                |
| STORE-01                | §12.8             | 精确 schema、未知版本/字段/ID、单调迁移、禁止存储和写入失败 | 真实浏览器旧数据与禁用存储          |
| UX-01                   | §12.3/4           | 播放状态、键盘控件、标签、焦点恢复与 reduced-motion 分支    | 窄屏、实际键盘路径、非颜色状态      |
| §12.9 隐私；§12.12 交付 | §12.7/8，本表     | 出站字段、跨区隔离、进度无私密内容、Stack 回归              | 披露/导出、Phase 7/8 与学生试点限制 |

实施时按 `docs/bug-reports/README.md` 配套测试说明，运行 `npm run test:report`
生成逐例结果；浏览器证据按 ROADMAP.md 计划的各模块 ACCEPTANCE 文档记录。
不得修改历史 222 条测试数字来表示新模块通过；Phase 10 仅做文档核对，Phase 11
实现的真实逐例结果和浏览器证据另见 PHASE11-ACCEPTANCE.md。设备首个 Python
交互约 5 秒目标、跨浏览器、最终美术
和真实学习效果仍需 Phase 7/8/9 的独立证据。

**Phase 10 设计结论：** 三种结构的状态与操作、三关目标、十二题内容、全部
提示、教学状态机、执行/导师身份、存档迁移及验收映射已明确。没有待决定的
阻塞设计项；代码命名和视觉细节可在本契约范围内细化。Phase 11 实现若发现
契约不成立，应先修订本规格及必要的需求，再继续实现，不静默改变规则。
