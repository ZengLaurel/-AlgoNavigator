# AIgoNavigator — Requirements Document (MVP)

## 1. Overview

AIgoNavigator is a web-based learning platform that teaches upper-elementary
students (grades 4–6, ages ~9–12) the fundamentals of data structures using
Python, inspired by the open-source project [hello-algo](https://github.com/krahets/hello-algo).
The platform combines three pillars:

1. **Visual animation** of data structure operations.
2. **Conversational AI tutoring** powered by a real LLM.
3. **Guided, hands-on Python coding** executed safely in the browser.

## 2. Goals

- Help a student with little/no programming background understand what an
  array, linked list, stack, and queue _are_ and _how their operations work_,
  before and while writing real Python code.
- Let the AI tutor adapt explanations to the student's pace, answer free-form
  questions, and nudge them through a fixed curriculum without giving away
  answers outright.
- Ship a working MVP covering one teaching loop end-to-end (concept →
  animation → guided code → AI Q&A → mini-challenge) for all 4 basic
  structures, suitable for a small pilot (e.g., a single classroom or a
  handful of students), not a multi-tenant production system yet.

## 3. Non-Goals (out of scope for MVP)

- Trees, hashing, sorting, searching, graphs, heaps, backtracking (full
  hello-algo syllabus) — reserved for a post-MVP phase.
- User accounts, authentication, multi-classroom management, teacher
  dashboards, or persistent cross-device progress sync.
- Drag-and-drop/block-based programming (Scratch-style) — target age group
  goes straight into simplified real Python syntax.
- Native mobile apps.
- Payment/licensing systems.

## 4. Target Users

| User                       | Description                                                        | Needs                                                                                             |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Student                    | Grade 4–6, basic keyboard/typing skill, no prior coding experience | Simple UI, immediate visual feedback, non-judgmental AI tone, short sessions (~15–20 min)         |
| Parent/Teacher (secondary) | Supervises sessions                                                | Visibility into what the AI says to the child (safety), optional way to review session transcript |

## 5. Curriculum Scope (MVP)

Four data structures, each following the same lesson template:

1. Array (顺序表)
2. Linked List (链表)
3. Stack (栈)
4. Queue (队列)

### Lesson template (per structure)

1. **Hook** — a short real-world analogy (e.g., stack = stack of plates).
2. **Animation walkthrough** — operation-by-operation visualization
   (insert/delete/access/traverse) with play/pause/step controls, synced to
   plain-language captions.
3. **Guided coding** — a scaffolded Python exercise (partially filled-in
   code) where the student implements or calls the operation just animated.
4. **AI Q&A** — student can ask the tutor anything about the current topic
   at any point; AI can also proactively check understanding ("Can you tell
   me what happens to the top of the stack after `push(5)`?").
5. **Mini-challenge** — a small puzzle/task to apply the concept
   independently, auto-checked, with AI available for hints (not answers).

## 6. Functional Requirements

### 6.1 Animation Module

- FR-1: Render step-by-step visualizations for core operations of each of
  the 4 structures (e.g., array: index access, insert, delete, resize;
  linked list: insert/delete at head/tail/middle, traversal; stack:
  push/pop/peek; queue: enqueue/dequeue).
- FR-2: Support play, pause, step-forward, step-back, and speed control.
- FR-3: Animations must visually represent memory/reference concepts
  relevant to the structure (e.g., linked list nodes as boxes with arrows,
  contiguous array cells, stack growing/shrinking vertically).
- FR-4: Animation state must be able to sync with and reflect the output of
  the student's own code execution (e.g., running `my_stack.push(5)` updates
  the visualization, not just a scripted demo).

### 6.2 Code Execution Module

- FR-5: Provide an in-browser Python code editor (syntax highlighting, line
  numbers, basic error squiggles) scoped to each exercise.
- FR-6: Execute student code **client-side via Pyodide (WASM)** — no
  student code is sent to any backend server for execution.
- FR-7: Each exercise runs in a fresh interpreter state with a resource/time
  limit (e.g., execution timeout, loop iteration guard) to prevent the
  browser tab from hanging on infinite loops.
- FR-8: Auto-grade exercises/challenges against expected output or state,
  and surface clear, kid-friendly error messages (not raw Python
  tracebacks) for common mistakes.

### 6.3 AI Tutoring Module

- FR-9: Integrate a real LLM API for free-form conversational Q&A, scoped to
  the current lesson's topic and the student's code/animation state (the AI
  receives lesson context + student's current code as context, not the
  entire conversation history of other lessons).
- FR-10: System prompt must enforce: age-appropriate language (grade 4–6
  reading level), Socratic/hint-first style (no direct answers to
  challenge questions unless the student is stuck after 2+ hint attempts),
  and strict content-safety boundaries (reject or redirect any off-topic,
  unsafe, or inappropriate input back to the lesson).
- FR-11: AI responses must be moderated/filtered before display (both input
  and output) using a content-safety check appropriate for a child
  audience.
- FR-12: All AI conversation transcripts for a session must be logged and
  retrievable for parent/teacher review (local/session storage is
  sufficient for MVP; no long-term server-side retention required yet).
- FR-13: AI must be able to reference what's currently on screen (e.g.,
  "I see your stack has 3 items and you just tried `pop()` twice — want to
  see what happens visually?").

### 6.4 Progress & Navigation

- FR-14: Linear lesson flow per structure (hook → animation → code → AI →
  challenge) with a simple progress indicator.
- FR-15: Session progress persists in browser local storage (no login
  required for MVP); progress is lost if local storage is cleared.

## 7. Non-Functional Requirements

- NFR-1 (Safety): No PII collection beyond an optional first name stored
  locally. No account creation, no data sent to third parties beyond the
  LLM API call itself (which must not include PII).
- NFR-2 (Content safety): AI must never produce content unsuitable for
  children; implement input/output filtering and a fallback canned response
  for any moderation failure.
- NFR-3 (Performance): Pyodide initial load should be optimized (lazy-load,
  loading indicator) since WASM startup can take several seconds; target
  first interactive code run under ~5s on a typical school laptop/network.
- NFR-4 (Usability): UI text and AI tone calibrated for 9–12 year-olds;
  avoid jargon without an analogy; large touch/click targets; works on
  Chromebook-class hardware (common in schools).
- NFR-5 (Browser support): Latest Chrome/Edge/Firefox (Pyodide/WASM
  requirement); no IE support needed.
- NFR-6 (Reliability): Animation and code-execution state must stay in
  sync; a crashed/hung Pyodide worker must be recoverable via a "reset
  exercise" action without losing lesson progress.

## 8. Proposed Tech Stack

| Layer              | Choice                                                                                                                    | Notes                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Frontend framework | React (+ TypeScript)                                                                                                      | Pairs naturally with animation libs below                                                                      |
| Animation          | D3.js for data-bound structure diagrams, Framer Motion for transitions/polish                                             | D3 drives element enter/update/exit tied to actual data state; Framer Motion handles easing/micro-interactions |
| Code editor        | CodeMirror or Monaco (lightweight preferred for load time)                                                                | —                                                                                                              |
| Python runtime     | Pyodide (WASM), run in a Web Worker to keep UI thread responsive                                                          | Avoids backend sandbox complexity for MVP                                                                      |
| AI backend         | Thin API proxy (serverless function) → LLM API                                                                            | Proxy needed to keep API keys off the client; also where moderation/rate-limiting is enforced                  |
| Content moderation | LLM provider's moderation endpoint (if available) or a dedicated moderation API, applied to both user input and AI output | —                                                                                                              |
| Persistence (MVP)  | Browser localStorage                                                                                                      | No database required for MVP                                                                                   |
| Hosting            | Static frontend hosting (e.g., Vercel/Netlify) + serverless function for the AI proxy                                     | Minimal ops overhead for a pilot                                                                               |

**Open decision:** specific LLM provider/model for the tutoring API is not
yet chosen — needs a decision on cost per session, context window, and
availability of a moderation endpoint before implementation starts.

## 9. Content Safety & Privacy Considerations (children-specific)

- Treat this as a children's product: minimize data collection, avoid
  behavioral tracking/analytics tied to identifiable children, and keep all
  AI conversation data ephemeral/local for MVP.
- Have a documented, reviewable system prompt for the AI tutor (versioned,
  not editable by end users) with explicit refusal behavior for anything
  outside the data-structures curriculum.
- Plan a manual review pass of a sample of AI transcripts during the pilot
  to catch prompt-injection attempts or unsafe completions before any wider
  rollout.

## 10. Success Metrics (MVP pilot)

- A student with no prior coding experience can, unassisted after the
  guided lesson, correctly complete the mini-challenge for at least 3 of
  the 4 structures.
- AI tutor hint-first behavior holds (measured via transcript sampling):
  AI does not reveal challenge answers outright in normal use.
- No crashes/hangs requiring a full page reload during a typical 20-minute
  session.

## 11. Open Questions

1. Which LLM provider/model, and what's the budget per student-session?
2. Is a parent/teacher-facing transcript viewer needed in the MVP, or can
   it wait for the next phase?
3. Should the mini-challenges be auto-generated (AI) or hand-authored/fixed
   for the MVP? (Hand-authored recommended for MVP to keep grading
   deterministic and safe.)
4. Any existing hello-algo visual/content assets the team wants to reuse or
   adapt vs. building originals from scratch?
