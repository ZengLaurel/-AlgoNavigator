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

Phase 2 is in progress. The Stack lesson now includes the scripted
animation, a CodeMirror Python editor, Pyodide execution in a Web Worker,
and a live Stack result panel. See:

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

### Requirements

- Node.js 18 or newer (Node.js 20 LTS or newer is recommended).
- npm 9 or newer.
- A modern browser: Chrome, Edge, or Firefox with WebAssembly and Web
  Workers enabled.
- Internet access for the first `npm install` and for downloading the
  Pyodide runtime when the first Python exercise is run. Student Python
  code itself runs locally in the browser and is not sent to a server.

### Install dependencies

Open Command Prompt or PowerShell and run:

```bat
cd /d D:\AIgoNavigator
npm install
```

If npm reports an `ERESOLVE` conflict involving TypeScript, do not use
`--force` first. Confirm that `package.json` contains TypeScript 5.x (the
project's `typescript-eslint` version requires TypeScript below 6), then
run `npm install` again.

npm may print an `allow-scripts` warning for `esbuild`. This is npm's
install-script approval feature, not an application error. Vite can still
start if its platform binary is already available. If npm asks you to
review scripts, inspect the package names before approving them:

```bat
npm approve-scripts esbuild
```

Only approve packages you recognize and expect to run locally.

### Start the development server

```bat
cd /d D:\AIgoNavigator
npm run dev
```

Open the local address printed by Vite, normally:

```text
http://localhost:5173/
```

Keep the terminal running while using the app. Press `Ctrl+C` to stop the
server. Vite automatically reloads the page when source files change.

### Run checks

Run these commands from `D:\AIgoNavigator`:

```bat
npm run lint
npm test
npm run build
npm run format:check
```

The production build is written to `dist/`, which is generated output and
is not committed.

### Current phase

Phase 2 is in progress. The Stack lesson includes the scripted animation
and a Python editor backed by Pyodide in a Web Worker. The first Python run
may take a few seconds while the Pyodide runtime loads. If the page reports
that Python took too long, reset the exercise and run again; the worker is
replaced automatically.

### Stop and restart

To stop the development server, focus its terminal and press `Ctrl+C`. To
start it again, run `npm run dev` from the project root. Closing the browser
does not stop a server running in the terminal.

## Safety note

This product is designed for children. See REQUIREMENTS.md §9 and
SPECIFICATION.md §7.3 for the content moderation and privacy approach
(no PII collection, no third-party data sharing beyond the AI API call
itself, versioned/non-editable system prompt, manual transcript review
during pilot).
