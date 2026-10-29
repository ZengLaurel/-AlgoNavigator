# AIgoNavigator — Technical Specification (MVP)

This document translates [REQUIREMENTS.md](./REQUIREMENTS.md) into a concrete
technical design. It is the reference for implementation decisions; the
[ROADMAP.md](./ROADMAP.md) sequences the work described here into phases.

## 1. Assumptions Made to Resolve Open Requirements Questions

The requirements doc left 4 questions open. To unblock implementation, the
following defaults are adopted for the MVP (revisit after pilot feedback):

| Open question | MVP decision |
|---|---|
| LLM provider/model | Anthropic Claude API (small/fast model, e.g. Haiku-class) via a serverless proxy — low cost per turn, strong instruction-following for the Socratic/hint-first system prompt |
| Parent/teacher transcript viewer | Not built in MVP; transcripts are stored in `localStorage` and can be inspected via a simple "Export session log" button (JSON download) instead of a dedicated UI |
| Challenge authoring | Hand-authored, fixed challenge set per structure (deterministic auto-grading); no AI-generated challenges in MVP |
| hello-algo asset reuse | Do not copy hello-algo's code or diagrams directly (keep `hello-algo/` untouched per project convention); use it only as a conceptual/pedagogical reference. All animations and content are built fresh for this project |

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
  id: "array" | "linked-list" | "stack" | "queue";
  title: string;
  hook: { analogy: string; imageOrAnimationId?: string };
  animationSteps: AnimationStep[];
  exercise: Exercise;
  challenge: Challenge;
}

interface AnimationStep {
  operation: string;          // e.g. "push", "insertAtHead"
  description: string;        // plain-language caption
  beforeState: StructureState;
  afterState: StructureState;
}

// Generic structure snapshot the animation engine renders.
// Shape varies slightly per structure (e.g. linked list has `next` refs).
type StructureState = {
  elements: Array<{ id: string; value: number | string; highlighted?: boolean }>;
  pointers?: Record<string, string>; // e.g. { head: "node-1", tail: "node-3" }
};

interface Exercise {
  starterCode: string;
  solutionCheck: (stdout: string, finalState: unknown) => boolean;
  hints: string[];             // revealed progressively by the AI tutor
}

interface Challenge {
  prompt: string;
  starterCode: string;
  autoGrade: (stdout: string, finalState: unknown) => { pass: boolean; feedback: string };
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

## 10. Explicit Out-of-Scope Reminders (carried from REQUIREMENTS.md)

No accounts/auth, no server-side persistence/database, no trees/hashing/
sorting/graphs content, no block-based programming, no native mobile app —
see REQUIREMENTS.md §3 for the full non-goals list.
