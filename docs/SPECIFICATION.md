# AIgoNavigator — Technical Specification (MVP)

This document translates [REQUIREMENTS.md](./REQUIREMENTS.md) into a concrete
technical design. It is the reference for implementation decisions; the
[ROADMAP.md](./ROADMAP.md) sequences the work described here into phases.

> **Pivot (2026-11-05):** the Stack lesson is being rebuilt as a small
> underground-ruins game rather than a report-card-style lesson page. See
> **§11** for the full game design; ROADMAP.md Phases 4–6 sequence the
> build. Sections 1–10 below describe the original lesson-page design and
> remain accurate for Phases 0–3, which are already shipped and unaffected
> by the pivot (Pyodide execution, error mapping, and the code editor are
> reused as-is — see §11.7).

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
manipulates to proceed. Scope is deliberately narrowed to **Stack only**;
Array/LinkedList/Queue game levels are out of scope until this slice proves
the pattern (see ROADMAP.md Phase 5's revised note).

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
