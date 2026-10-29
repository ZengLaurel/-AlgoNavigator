# AIgoNavigator

A web-based platform that teaches upper-elementary students (grades 4–6)
the fundamentals of data structures using real Python — combining visual
animations, guided hands-on coding, and a conversational AI tutor.

Inspired by [hello-algo](https://github.com/krahets/hello-algo) (kept as an
unmodified reference under `hello-algo/`), but built from scratch for a
much younger audience with no prior coding experience.

## How it works

Each lesson follows the same loop:

1. **Hook** — a short real-world analogy (e.g., a stack = a stack of plates).
2. **Animation** — step-by-step visualization of the structure's operations,
   with play/pause/step controls.
3. **Guided coding** — a scaffolded Python exercise, run entirely in the
   browser, whose live behavior drives the same animation shown above.
4. **AI Q&A** — a chat panel where the student can ask questions anytime;
   the AI tutor gives age-appropriate, hint-first guidance instead of
   straight answers.
5. **Mini-challenge** — an auto-graded exercise to apply the concept
   independently.

MVP curriculum covers 4 structures: **Array, Linked List, Stack, Queue**.

## Tech stack

| Layer             | Choice                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Frontend          | React + TypeScript (Vite)                                                                           |
| Animation         | D3.js + Framer Motion                                                                               |
| Code editor       | CodeMirror 6                                                                                        |
| Python execution  | Pyodide (WASM), sandboxed in a Web Worker — all student code runs client-side                       |
| AI tutoring       | Serverless API proxy → LLM API, with a versioned Socratic system prompt and input/output moderation |
| Persistence (MVP) | Browser `localStorage` (no accounts/backend database)                                               |

See [docs/SPECIFICATION.md](./docs/SPECIFICATION.md) for full architecture
details.

## Project status

Pre-implementation. See:

- [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) — product requirements and scope.
- [docs/SPECIFICATION.md](./docs/SPECIFICATION.md) — technical design.
- [docs/ROADMAP.md](./docs/ROADMAP.md) — phased build plan. **Development
  follows this roadmap phase by phase.**

## Repository layout

```
D:\AIgoNavigator\
├─ docs\            product/technical docs (requirements, spec, roadmap)
├─ hello-algo\       reference project — not modified
├─ src\              application source (added starting Phase 0)
├─ api\              serverless AI tutor proxy (added starting Phase 3)
└─ README.md
```

## Getting started

Not yet runnable — project scaffolding begins in Phase 0 of the roadmap.
This section will be filled in with setup/run instructions once the Vite
app is initialized.

## Safety note

This product is designed for children. See REQUIREMENTS.md §9 and
SPECIFICATION.md §7.3 for the content moderation and privacy approach
(no PII collection, no third-party data sharing beyond the AI API call
itself, versioned/non-editable system prompt, manual transcript review
during pilot).
